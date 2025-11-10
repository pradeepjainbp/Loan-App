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
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

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
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔍</Text>
        <Text style={styles.errorTitle}>Loan not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
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

    const loanData = sanitizeLoanData(rawLoanData);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={styles.infoBannerText}>
            Editing loan details. Changes will be saved immediately.
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Type</Text>
          <SegmentedButtons
            value={isUserLender ? 'lender' : 'borrower'}
            onValueChange={(value) => setIsUserLender(value === 'lender')}
            buttons={[
              { 
                value: 'lender', 
                label: 'I Lent',
                icon: 'cash-plus',
              },
              { 
                value: 'borrower', 
                label: 'I Borrowed',
                icon: 'handshake',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lender Name *</Text>
            <TextInput
              value={lenderName}
              onChangeText={setLenderName}
              mode="outlined"
              style={styles.input}
              disabled={isUserLender}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Borrower Name *</Text>
            <TextInput
              value={borrowerName}
              onChangeText={setBorrowerName}
              mode="outlined"
              style={styles.input}
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
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interest Rate (% per year) *</Text>
                <TextInput
                  value={interestRate}
                  onChangeText={setInterestRate}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
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
                <Text style={styles.previewTitle}>Updated Summary</Text>
              </View>
              
              <View style={styles.previewGrid}>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Principal</Text>
                  <Text style={styles.previewValue}>{formatCurrency(preview.principal, currency)}</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Interest</Text>
                  <Text style={styles.previewValue}>{formatCurrency(preview.interest, currency)}</Text>
                </View>
              </View>
              
              <View style={styles.previewTotal}>
                <Text style={styles.previewTotalLabel}>Total Due</Text>
                <Text style={styles.previewTotalValue}>{formatCurrency(preview.total, currency)}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textArea}
              placeholder="Add any notes..."
              maxLength={500}
              outlineColor={colors.ui.border}
              activeOutlineColor={colors.primary}
              outlineStyle={{ borderRadius: borderRadius.md }}
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                mode="outlined"
                style={styles.tagInput}
                placeholder="Add a tag"
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
          icon="content-save"
        >
          Save Changes
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
  
  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.info.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.info.main,
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoBannerText: {
    ...typography.body.small,
    color: colors.semantic.info.dark,
    flex: 1,
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
    backgroundColor: colors.semantic.warning.light,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.warning.main,
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
    color: colors.semantic.warning.dark,
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