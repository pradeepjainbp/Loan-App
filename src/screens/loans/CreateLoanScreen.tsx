import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Chip, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { InterestType, CompoundingFrequency } from '../../types';
import { validateLoanData, calculateSimpleInterest, calculateCompoundInterest } from '../../utils/calculations';
import { sanitizeLoanData } from '../../utils/sanitize';
import { RootStackParamList } from '../../navigation/AppNavigator';
import DatePicker from '../../components/DatePicker';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateLoanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { createLoan } = useLoanStore();
  const { appUser } = useAuthStore();

  const [isUserLender, setIsUserLender] = useState(true);
  const [lenderName, setLenderName] = useState(appUser?.full_name || '');
  const [borrowerName, setBorrowerName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [interestType, setInterestType] = useState<InterestType>('none');
  const [interestRate, setInterestRate] = useState('');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('monthly');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

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
      status: 'active' as const,
      is_user_lender: isUserLender,
    };

    const loanData = sanitizeLoanData(rawLoanData);
    const errors = validateLoanData(loanData);
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    if (loanData.principal_amount > 100000) {
      Alert.alert(
        'Large Amount Warning',
        `You're creating a loan for ${loanData.principal_amount.toLocaleString()}. Is this correct?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => submitLoan(loanData) },
        ]
      );
      return;
    }

    await submitLoan(loanData);
  };

  const submitLoan = async (loanData: any) => {
    try {
      setLoading(true);
      await createLoan(loanData);
      Alert.alert('Success', 'Loan created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  const preview = calculatePreview();
  const currency = appUser?.settings?.currency || 'USD';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I am...</Text>
          <SegmentedButtons
            value={isUserLender ? 'lender' : 'borrower'}
            onValueChange={(value) => setIsUserLender(value === 'lender')}
            buttons={[
              { 
                value: 'lender', 
                label: 'Lending Money',
                icon: 'cash-plus',
              },
              { 
                value: 'borrower', 
                label: 'Borrowing Money',
                icon: 'handshake',
              },
            ]}
            style={styles.segmentedButtons}
          />
          <Text style={styles.helperText}>
            {isUserLender 
              ? 'You are giving money to someone' 
              : 'You are receiving money from someone'}
          </Text>
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isUserLender ? 'Borrower Name *' : 'Lender Name *'}
            </Text>
            <TextInput
              value={isUserLender ? borrowerName : lenderName}
              onChangeText={isUserLender ? setBorrowerName : setLenderName}
              mode="outlined"
              style={styles.input}
              placeholder={isUserLender ? 'Who are you lending to?' : 'Who is lending to you?'}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Principal Amount *</Text>
            <TextInput
              value={principalAmount}
              onChangeText={setPrincipalAmount}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0.00"
              left={<TextInput.Icon icon="currency-usd" />}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.inputLabel}>Start Date *</Text>
              <DatePicker
                label=""
                value={startDate}
                onChange={setStartDate}
              />
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.inputLabel}>Due Date *</Text>
              <DatePicker
                label=""
                value={dueDate}
                onChange={(date) => setDueDate(date)}
                minDate={startDate}
              />
            </View>
          </View>
        </View>

        {/* Interest Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interest (Optional)</Text>
          
          <SegmentedButtons
            value={interestType}
            onValueChange={(value) => setInterestType(value as InterestType)}
            buttons={[
              { value: 'none', label: 'No Interest' },
              { value: 'simple', label: 'Simple' },
              { value: 'compound', label: 'Compound' },
            ]}
            style={styles.segmentedButtons}
          />

          {interestType !== 'none' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interest Rate (% per year) *</Text>
                <TextInput
                  value={interestRate}
                  onChangeText={setInterestRate}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholder="e.g., 5.5"
                  right={<TextInput.Affix text="%" />}
                  outlineColor={colors.ui.border}
                  activeOutlineColor={colors.primary}
                  outlineStyle={{ borderRadius: borderRadius.md }}
                />
              </View>

              {interestType === 'compound' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Compounding Frequency</Text>
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
                </View>
              )}
            </>
          )}
        </View>

        {/* Preview Card */}
        {preview && (
          <Card style={styles.previewCard}>
            <Card.Content style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewIcon}>📊</Text>
                <Text style={styles.previewTitle}>Loan Summary</Text>
              </View>
              
              <View style={styles.previewGrid}>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Principal</Text>
                  <Text style={styles.previewValue}>${preview.principal.toFixed(2)}</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Interest</Text>
                  <Text style={styles.previewValue}>${preview.interest.toFixed(2)}</Text>
                </View>
              </View>
              
              <View style={styles.previewTotal}>
                <Text style={styles.previewTotalLabel}>Total Amount Due</Text>
                <Text style={styles.previewTotalValue}>${preview.total.toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textArea}
              placeholder="Add any notes about this loan..."
              maxLength={500}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags (Optional)</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                mode="outlined"
                style={styles.tagInput}
                placeholder="e.g., Personal, Business"
                outlineColor={colors.ui.border}
                activeOutlineColor={colors.primary}
                outlineStyle={{ borderRadius: borderRadius.md }}
              />
              <Button 
                mode="contained" 
                onPress={handleAddTag} 
                style={styles.addTagButton}
                buttonColor={colors.primary}
                labelStyle={styles.addTagButtonLabel}
              >
                Add
              </Button>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tag}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          buttonColor={colors.primary}
          labelStyle={styles.submitButtonLabel}
          icon="check-circle"
        >
          Create Loan
        </Button>
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
  
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  helperText: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
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
    minHeight: 100,
  },
  charCount: {
    ...typography.caption.regular,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  
  // Date Pickers
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateColumn: {
    flex: 1,
  },
  
  // Segmented Buttons
  segmentedButtons: {
    marginBottom: spacing.sm,
  },
  
  // Tags
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  addTagButton: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  addTagButtonLabel: {
    ...typography.button.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.background.tertiary,
  },
  tagText: {
    ...typography.caption.medium,
    color: colors.text.secondary,
  },
  
  // Preview Card
  previewCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.semantic.info.light,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  previewContent: {
    padding: spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  previewTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  previewItem: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  previewLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  previewValue: {
    ...typography.amount.tiny,
    color: colors.text.primary,
  },
  previewTotal: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTotalLabel: {
    ...typography.heading.h5,
    color: colors.text.primary,
  },
  previewTotalValue: {
    ...typography.amount.medium,
    color: colors.primary,
  },
  
  // Submit Button
  submitButton: {
    borderRadius: borderRadius.md,
    ...elevation.sm,
  },
  submitButtonLabel: {
    ...typography.button.large,
    paddingVertical: spacing.sm,
  },
});