import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { PaymentMethod } from '../../types';
import { validateRepaymentData } from '../../utils/calculations';
import { RootStackParamList } from '../../navigation/AppNavigator';

type CreateRepaymentRouteProp = RouteProp<RootStackParamList, 'CreateRepayment'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateRepaymentScreen() {
  const route = useRoute<CreateRepaymentRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { loanId } = route.params;
  
  const { loans, createRepayment, getLoanCalculation } = useLoanStore();
  const loan = loans.find((l) => l.id === loanId);
  const calculation = loan ? getLoanCalculation(loanId) : null;

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loan || !calculation) {
    return (
      <View style={styles.container}>
        <Text>Loan not found</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    const repaymentData = {
      loan_id: loanId,
      payment_amount: parseFloat(paymentAmount),
      payment_date: new Date(paymentDate).toISOString(),
      payment_method: paymentMethod,
      transaction_reference: transactionReference || undefined,
      notes: notes || undefined,
    };

    const errors = validateRepaymentData(repaymentData, loan, calculation.current_outstanding);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    // Warn if payment exceeds outstanding
    if (repaymentData.payment_amount > calculation.current_outstanding) {
      Alert.alert(
        'Warning',
        `Payment amount (${repaymentData.payment_amount}) exceeds outstanding balance (${calculation.current_outstanding}). Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => submitRepayment(repaymentData) },
        ]
      );
      return;
    }

    await submitRepayment(repaymentData);
  };

  const submitRepayment = async (repaymentData: any) => {
    try {
      setLoading(true);
      await createRepayment(repaymentData);
      Alert.alert('Success', 'Repayment recorded successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record repayment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Outstanding Balance:</Text>
          <Text style={styles.infoValue}>
            ${calculation.current_outstanding.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Details</Text>

        <TextInput
          label="Payment Amount *"
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          left={<TextInput.Icon icon="currency-usd" />}
        />

        <TextInput
          label="Payment Date *"
          value={paymentDate}
          onChangeText={setPaymentDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Payment Method *</Text>
        <SegmentedButtons
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          buttons={[
            { value: 'cash', label: 'Cash' },
            { value: 'bank_transfer', label: 'Bank' },
            { value: 'upi', label: 'UPI' },
            { value: 'check', label: 'Check' },
            { value: 'other', label: 'Other' },
          ]}
          style={styles.segmentedButtons}
        />

        <TextInput
          label="Transaction Reference"
          value={transactionReference}
          onChangeText={setTransactionReference}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          maxLength={200}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Record Repayment
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976d2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

