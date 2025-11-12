import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { Transaction, TransactionType } from '../../types';
import { getTransactionSummary } from '../../utils/transactionCalculations';

interface AddTransactionScreenProps {
  route: any;
  navigation: any;
}

export default function AddTransactionScreen({
  route,
  navigation,
}: AddTransactionScreenProps) {
  const { loanId } = route.params;
  const theme = useTheme();
  const { loans, transactions, createTransaction } = useLoanStore();
  const { appUser } = useAuthStore();

  const loan = loans.find((l) => l.id === loanId);
  const loanTransactions = transactions[loanId] || [];
  const summary = loan ? getTransactionSummary(loan, loanTransactions) : null;

  const [transactionType, setTransactionType] = useState<TransactionType>('payment');
  const [amount, setAmount] = useState('');
  const [interestPortion, setInterestPortion] = useState('');
  const [particulars, setParticulars] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!loan || !summary) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loan not found</Text>
      </View>
    );
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTransactionDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!particulars.trim()) {
      Alert.alert('Error', 'Please enter particulars');
      return;
    }

    try {
      setLoading(true);

      const paidAmount = parseFloat(amount);
      const interestPart = parseFloat(interestPortion) || 0;
      const principalChange = transactionType === 'principal_increase' ? paidAmount : 0;

      // Calculate new balance
      let newBalance = summary.outstandingBalance;
      if (transactionType === 'payment') {
        newBalance = Math.max(0, newBalance - paidAmount);
      } else if (transactionType === 'principal_increase') {
        newBalance += paidAmount;
      } else if (transactionType === 'principal_decrease') {
        newBalance = Math.max(0, newBalance - paidAmount);
      }

      const transactionData: Omit<Transaction, 'id' | 'created_at'> = {
        loan_id: loanId,
        transaction_date: transactionDate.toISOString(),
        transaction_type: transactionType,
        particulars,
        principal_change: principalChange,
        interest_portion: interestPart,
        paid_amount: paidAmount,
        balance_after: newBalance,
        notes: notes || undefined,
      };

      await createTransaction(transactionData);
      Alert.alert('Success', 'Transaction recorded successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const currency = appUser?.settings?.currency || 'INR';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Current Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.balanceLabel}>Current Outstanding Balance</Text>
          <Text style={styles.balanceAmount}>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency,
            }).format(summary.outstandingBalance)}
          </Text>
        </Card.Content>
      </Card>

      {/* Transaction Type */}
      <Text style={styles.label}>Transaction Type</Text>
      <SegmentedButtons
        value={transactionType}
        onValueChange={(value) => setTransactionType(value as TransactionType)}
        buttons={[
          { value: 'payment', label: 'Payment' },
          { value: 'principal_increase', label: 'Add Principal' },
          { value: 'principal_decrease', label: 'Reduce Principal' },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Amount */}
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholder="0.00"
      />

      {/* Interest Portion (for payments) */}
      {transactionType === 'payment' && (
        <TextInput
          label="Interest Portion (optional)"
          value={interestPortion}
          onChangeText={setInterestPortion}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="0.00"
        />
      )}

      {/* Particulars */}
      <TextInput
        label="Particulars"
        value={particulars}
        onChangeText={setParticulars}
        style={styles.input}
        placeholder="e.g., Borrower paid via bank transfer"
        multiline
      />

      {/* Transaction Date */}
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        Date: {transactionDate.toLocaleDateString()}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={transactionDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Notes */}
      <TextInput
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
        placeholder="Additional notes"
        multiline
      />

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !amount}
        style={styles.submitButton}
        buttonColor={theme.colors.primary}
      >
        Record Transaction
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  dateButton: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});

