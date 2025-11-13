import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { PaymentMethod } from '../../types';
import { validateRepaymentData, formatCurrency } from '../../utils/calculations';
import { sanitizeRepaymentData } from '../../utils/sanitize';
import { getCurrencySymbol } from '../../utils/currency';
import { RootStackParamList } from '../../navigation/AppNavigator';
import DatePicker from '../../components/DatePicker';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

type CreateRepaymentRouteProp = RouteProp<RootStackParamList, 'CreateRepayment'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateRepaymentScreen() {
  const route = useRoute<CreateRepaymentRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { loanId } = route.params;
  
  const { loans, createRepayment, getLoanCalculation } = useLoanStore();
  const { appUser } = useAuthStore();
  const loan = loans.find((l) => l.id === loanId);
  const calculation = loan ? getLoanCalculation(loanId) : null;
  const currency = appUser?.settings?.currency || 'USD';

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loan || !calculation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔍</Text>
        <Text style={styles.errorTitle}>Loan not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const handleSubmit = async () => {
    const rawRepaymentData = {
      loan_id: loanId,
      payment_amount: parseFloat(paymentAmount),
      payment_date: paymentDate.toISOString(),
      payment_method: paymentMethod,
      transaction_reference: transactionReference || undefined,
      notes: notes || undefined,
    };

    const repaymentData = sanitizeRepaymentData(rawRepaymentData);
    const errors = validateRepaymentData(repaymentData, loan, calculation.current_outstanding);
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    if (repaymentData.payment_amount > calculation.current_outstanding) {
      Alert.alert(
        'Warning',
        `Payment amount (${formatCurrency(repaymentData.payment_amount, currency)}) exceeds outstanding balance (${formatCurrency(calculation.current_outstanding, currency)}). Continue?`,
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

  const quickAmounts = [
    { label: '25%', value: calculation.current_outstanding * 0.25 },
    { label: '50%', value: calculation.current_outstanding * 0.5 },
    { label: '100%', value: calculation.current_outstanding },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Outstanding Balance Card */}
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceIcon}>💰</Text>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Outstanding Balance</Text>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(calculation.current_outstanding, currency)}
                </Text>
              </View>
            </View>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetailRow}>
                <Text style={styles.balanceDetailLabel}>Total Due:</Text>
                <Text style={styles.balanceDetailValue}>
                  {formatCurrency(calculation.total_amount_due, currency)}
                </Text>
              </View>
              <View style={styles.balanceDetailRow}>
                <Text style={styles.balanceDetailLabel}>Already Paid:</Text>
                <Text style={[styles.balanceDetailValue, { color: colors.semantic.success.main }]}>
                  {formatCurrency(calculation.total_repaid, currency)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Amount</Text>
          <View style={styles.quickAmountRow}>
            {quickAmounts.map((quick) => (
              <Button
                key={quick.label}
                mode="outlined"
                onPress={() => setPaymentAmount(quick.value.toFixed(2))}
                style={styles.quickAmountButton}
                labelStyle={styles.quickAmountButtonLabel}
                textColor={colors.primary}
              >
                {quick.label}
              </Button>
            ))}
          </View>
        </View>

        {/* Payment Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Amount *</Text>
            <TextInput
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0.00"
              left={<TextInput.Affix text={getCurrencySymbol(currency)} />}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
            {paymentAmount && parseFloat(paymentAmount) > 0 && (
              <View style={styles.amountPreview}>
                <Text style={styles.amountPreviewLabel}>Remaining after payment:</Text>
                <Text style={styles.amountPreviewValue}>
                  {formatCurrency(Math.max(0, calculation.current_outstanding - parseFloat(paymentAmount)), currency)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Date *</Text>
            <DatePicker
              label=""
              value={paymentDate}
              onChange={setPaymentDate}
              maxDate={new Date()}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method *</Text>
          <SegmentedButtons
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            buttons={[
              { value: 'cash', label: 'Cash', icon: 'cash' },
              { value: 'bank_transfer', label: 'Bank', icon: 'bank' },
              { value: 'upi', label: 'UPI', icon: 'cellphone' },
            ]}
            style={styles.segmentedButtons}
          />
          <SegmentedButtons
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            buttons={[
              { value: 'check', label: 'Check', icon: 'checkbook' },
              { value: 'other', label: 'Other', icon: 'dots-horizontal' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Optional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transaction Reference</Text>
            <TextInput
              value={transactionReference}
              onChangeText={setTransactionReference}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Check #1234, UPI Ref"
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textArea}
              placeholder="Add any notes about this payment..."
              maxLength={200}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
            <Text style={styles.charCount}>{notes.length}/200</Text>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0}
          style={styles.submitButton}
          buttonColor={colors.semantic.success.main}
          labelStyle={styles.submitButtonLabel}
          icon="check-circle"
        >
          Record Payment
        </Button>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Text style={styles.helpIcon}>💡</Text>
          <Text style={styles.helpText}>
            Recording a payment will update the outstanding balance and track your repayment history.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  errorButton: {
    borderRadius: borderRadius.md,
  },
  
  // Balance Card
  balanceCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.semantic.info.light,
    borderRadius: borderRadius.lg,
    ...elevation.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.info.main,
  },
  balanceContent: {
    padding: spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    ...typography.label.large,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.amount.large,
    color: colors.semantic.info.dark,
  },
  balanceDetails: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  balanceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  balanceDetailLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  balanceDetailValue: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  
  // Quick Amount
  quickAmountRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.ui.border,
  },
  quickAmountButtonLabel: {
    ...typography.button.medium,
  },
  
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  
  // Inputs
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.label.large,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.primary,
  },
  textArea: {
    backgroundColor: colors.background.primary,
    minHeight: 80,
  },
  charCount: {
    ...typography.caption.regular,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  amountPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  amountPreviewLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  amountPreviewValue: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  
  // Segmented Buttons
  segmentedButtons: {
    marginBottom: spacing.sm,
  },
  
  // Submit Button
  submitButton: {
    borderRadius: borderRadius.md,
    ...elevation.sm,
    marginBottom: spacing.lg,
  },
  submitButtonLabel: {
    ...typography.button.large,
    paddingVertical: spacing.sm,
  },
  
  // Help Card
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  helpIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  helpText: {
    ...typography.body.small,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});