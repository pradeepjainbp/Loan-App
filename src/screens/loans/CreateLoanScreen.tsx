import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { InterestType, CompoundingFrequency } from '../../types';
import { validateLoanData, calculateSimpleInterest, calculateCompoundInterest } from '../../utils/calculations';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateLoanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { createLoan } = useLoanStore();
  const { appUser } = useAuthStore();

  const [isUserLender, setIsUserLender] = useState(true);
  const [lenderName, setLenderName] = useState(appUser?.full_name || '');
  const [borrowerName, setBorrowerName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
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
    if (interestType === 'simple') {
      interest = calculateSimpleInterest(principal, rate, startDate, dueDate);
    } else if (interestType === 'compound') {
      interest = calculateCompoundInterest(principal, rate, startDate, dueDate, compoundingFrequency);
    }

    return {
      principal,
      interest,
      total: principal + interest,
    };
  };

  const handleSubmit = async () => {
    const loanData = {
      lender_name: isUserLender ? (appUser?.full_name || lenderName) : lenderName,
      borrower_name: borrowerName,
      principal_amount: parseFloat(principalAmount),
      start_date: new Date(startDate).toISOString(),
      due_date: new Date(dueDate).toISOString(),
      interest_type: interestType,
      interest_rate: interestType === 'none' ? 0 : parseFloat(interestRate),
      compounding_frequency: interestType === 'compound' ? compoundingFrequency : undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
      status: 'active' as const,
      is_user_lender: isUserLender,
    };

    const errors = validateLoanData(loanData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

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

        <TextInput
          label="Start Date *"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />

        <TextInput
          label="Due Date *"
          value={dueDate}
          onChangeText={setDueDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
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

        <View style={styles.tagInputContainer}>
          <TextInput
            label="Add Tag"
            value={tagInput}
            onChangeText={setTagInput}
            mode="outlined"
            style={styles.tagInput}
          />
          <Button mode="outlined" onPress={handleAddTag} style={styles.addTagButton}>
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
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}

        {preview && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Principal:</Text>
              <Text style={styles.previewValue}>${preview.principal.toFixed(2)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Interest:</Text>
              <Text style={styles.previewValue}>${preview.interest.toFixed(2)}</Text>
            </View>
            <View style={[styles.previewRow, styles.previewTotal]}>
              <Text style={styles.previewTotalLabel}>Total Due:</Text>
              <Text style={styles.previewTotalValue}>${preview.total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
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
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e3f2fd',
  },
  previewContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewTotal: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 4,
  },
  previewTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6200ee',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

