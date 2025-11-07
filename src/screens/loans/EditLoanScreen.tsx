import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Chip, Card } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { InterestType, CompoundingFrequency } from '../../types';
import { validateLoanData, calculateSimpleInterest, calculateCompoundInterest, formatCurrency } from '../../utils/calculations';
import { sanitizeLoanData } from '../../utils/sanitize';
import { RootStackParamList } from '../../navigation/AppNavigator';
import DatePicker from '../../components/DatePicker';
import { colors, typography, spacing, borderRadius } from '../../theme';

type EditLoanRouteProp = RouteProp<RootStackParamList, 'EditLoan'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditLoanScreen() {
  const route = useRoute<EditLoanRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { loanId } = route.params;
  
  const { loans, updateLoan } = useLoanStore();
  const { appUser } = useAuthStore();
  
  const loan = loans.find((l) => l.id === loanId);

  const [isUserLender, setIsUserLender] = useState(loan?.is_user_lender ?? true);
  const [lenderName, setLenderName] = useState(loan?.lender_name || '');
  const [borrowerName, setBorrowerName] = useState(loan?.borrower_name || '');
  const [principalAmount, setPrincipalAmount] = useState(loan?.principal_amount.toString() || '');
  const [startDate, setStartDate] = useState<Date>(loan ? new Date(loan.start_date) : new Date());
  const [dueDate, setDueDate] = useState<Date | null>(loan ? new Date(loan.due_date) : null);
  const [interestType, setInterestType] = useState<InterestType>(loan?.interest_type || 'none');
  const [interestRate, setInterestRate] = useState(loan?.interest_rate?.toString() || '');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>(
    loan?.compounding_frequency || 'monthly'
  );
  const [notes, setNotes] = useState(loan?.notes || '');
  const [tags, setTags] = useState<string[]>(loan?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loan) {
    return (
      <View style={styles.container}>
        <Text>Loan not found</Text>
      </View>
    );
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const calculatePreview = () => {
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate);
    
    if (!principal || !dueDate) return null;
    if (interestType === 'none') {
      return {
        principal,
        interest: 0,
        total: principal,
      };
    }

    if (!rate) return null;

    let interest = 0;
    const startDateStr = startDate.toISOString();
    const dueDateStr = dueDate.toISOString();
    
    if (interestType === 'simple') {
      interest = calculateSimpleInterest(principal, rate, startDateStr, dueDateStr);
    } else if (interestType === 'compound') {
      interest = calculateCompoundInterest(principal, rate, startDateStr, dueDateStr, compoundingFrequency);
    }

    return {
      principal,
      interest,
      total: principal + interest,
    };
  };

  const handleSubmit = async () => {
    if (!dueDate) {
      Alert.alert('Validation Error', 'Please select a due date');
      return;
    }

    const rawLoanData = {
      lender_name: isUserLender ? (appUser?.full_name || lenderName) : lenderName,
      borrower_name: borrowerName,
      principal_amount: parseFloat(principalAmount),
      start_date: startDate.toISOString(),
      due_date: dueDate.toISOString(),
      interest_type: interestType,
      interest_rate: interestType === 'none' ? 0 : parseFloat(interestRate),
      compounding_frequency: interestType === 'compound' ? compoundingFrequency : undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
      is_user_lender: isUserLender,
    };

    // Sanitize all user inputs to prevent XSS
    const loanData = sanitizeLoanData(rawLoanData);

    // Validate sanitized data
    const errors = validateLoanData(loanData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      await updateLoan(loanId, loanData);
      Alert.alert('Success', 'Loan updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update loan');
    } finally {
      setLoading(false);
    }
  };

  const preview = calculatePreview();
  const currency = appUser?.settings?.currency || 'USD';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Role</Text>
        
        <SegmentedButtons
          value={isUserLender ? 'lender' : 'borrower'}
          onValueChange={(value) => setIsUserLender(value === 'lender')}
          buttons={[
            { value: 'lender', label: 'I am Lending' },
            { value: 'borrower', label: 'I am Borrowing' },
          ]}
          style={styles.segmentedButtons}
        />

        <Text style={styles.sectionTitle}>Loan Details</Text>
        
        <TextInput
          label="Lender Name"
          value={lenderName}
          onChangeText={setLenderName}
          mode="outlined"
          style={styles.input}
          disabled={isUserLender}
        />

        <TextInput
          label="Borrower Name *"
          value={borrowerName}
          onChangeText={setBorrowerName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Principal Amount *"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          left={<TextInput.Icon icon="currency-usd" />}
        />

        <DatePicker
          label="Start Date *"
          value={startDate}
          onChange={setStartDate}
        />

        <DatePicker
          label="Due Date *"
          value={dueDate}
          onChange={(date) => setDueDate(date)}
          minDate={startDate}
        />

        <Text style={styles.sectionTitle}>Interest</Text>
        
        <SegmentedButtons
          value={interestType}
          onValueChange={(value) => setInterestType(value as InterestType)}
          buttons={[
            { value: 'none', label: 'None' },
            { value: 'simple', label: 'Simple' },
            { value: 'compound', label: 'Compound' },
          ]}
          style={styles.segmentedButtons}
        />

        {interestType !== 'none' && (
          <TextInput
            label="Interest Rate (%) *"
            value={interestRate}
            onChangeText={setInterestRate}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        )}

        {interestType === 'compound' && (
          <>
            <Text style={styles.label}>Compounding Frequency</Text>
            <SegmentedButtons
              value={compoundingFrequency}
              onValueChange={(value) => setCompoundingFrequency(value as CompoundingFrequency)}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              style={styles.segmentedButtons}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>Additional Information</Text>

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          maxLength={500}
        />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            mode="outlined"
            style={[styles.input, styles.tagInput]}
            placeholder="Add a tag"
          />
          <Button mode="contained" onPress={handleAddTag} style={styles.addTagButton}>
            Add
          </Button>
        </View>

        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <Chip key={tag} onClose={() => handleRemoveTag(tag)} style={styles.tag}>
              {tag}
            </Chip>
          ))}
        </View>

        {preview && (
          <Card style={styles.previewCard}>
            <Card.Content>
              <Text style={styles.previewTitle}>Loan Summary</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Principal:</Text>
                <Text style={styles.previewValue}>{formatCurrency(preview.principal, currency)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Interest:</Text>
                <Text style={styles.previewValue}>{formatCurrency(preview.interest, currency)}</Text>
              </View>
              <View style={[styles.previewRow, styles.previewTotal]}>
                <Text style={styles.previewTotalLabel}>Total Due:</Text>
                <Text style={styles.previewTotalValue}>{formatCurrency(preview.total, currency)}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          buttonColor={colors.primary}
        >
          Update Loan
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    marginBottom: spacing.md,
  },
  segmentedButtons: {
    marginBottom: spacing.lg,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  previewCard: {
    marginVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
  },
  previewTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  previewLabel: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  previewValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  previewTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewTotalLabel: {
    ...typography.h4,
  },
  previewTotalValue: {
    ...typography.h4,
    color: colors.primary,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.md,
  },
});

