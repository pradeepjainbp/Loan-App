import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, spacing, borderRadius } from '../../theme';

type LoanDetailRouteProp = RouteProp<RootStackParamList, 'LoanDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoanDetailScreen() {
  const route = useRoute<LoanDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { loanId } = route.params;

  const { loans, repayments, fetchRepayments, getLoanCalculation, deleteLoan } = useLoanStore();
  const { appUser } = useAuthStore();

  const loan = loans.find((l) => l.id === loanId);
  const loanRepayments = repayments[loanId] || [];
  const calculation = loan ? getLoanCalculation(loanId) : null;

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (loanId) {
      fetchRepayments(loanId);
    }
  }, [loanId]);

  const handleEdit = () => {
    navigation.navigate('EditLoan', { loanId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Loan',
      'Are you sure you want to delete this loan? This action cannot be undone and will also delete all associated repayments.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteLoan(loanId);
      Alert.alert('Success', 'Loan deleted successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete loan');
    } finally {
      setDeleting(false);
    }
  };

  if (!loan || !calculation) {
    return (
      <View style={styles.container}>
        <Text>Loan not found</Text>
      </View>
    );
  }

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Loan Summary</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>
              {loan.is_user_lender ? 'Borrower:' : 'Lender:'}
            </Text>
            <Text style={styles.value}>
              {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Principal Amount:</Text>
            <Text style={styles.value}>
              {formatCurrency(loan.principal_amount, currency)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Interest:</Text>
            <Text style={styles.value}>
              {formatCurrency(calculation.interest_amount, currency)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount Due:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculation.total_amount_due, currency)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Repaid:</Text>
            <Text style={styles.value}>
              {formatCurrency(calculation.total_repaid, currency)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.outstandingLabel}>Outstanding:</Text>
            <Text style={styles.outstandingValue}>
              {formatCurrency(calculation.current_outstanding, currency)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(loan.start_date, dateFormat)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>{formatDate(loan.due_date, dateFormat)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.statusValue]}>
              {loan.status.toUpperCase()}
            </Text>
          </View>

          {loan.notes && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.notes}>{loan.notes}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Repayment History</Text>
          
          {loanRepayments.length === 0 ? (
            <Text style={styles.emptyText}>No repayments recorded yet</Text>
          ) : (
            loanRepayments.map((repayment) => (
              <View key={repayment.id} style={styles.repaymentItem}>
                <View style={styles.repaymentHeader}>
                  <Text style={styles.repaymentAmount}>
                    {formatCurrency(repayment.payment_amount, currency)}
                  </Text>
                  <Text style={styles.repaymentDate}>
                    {formatDate(repayment.payment_date, dateFormat)}
                  </Text>
                </View>
                <Text style={styles.repaymentMethod}>
                  Method: {repayment.payment_method}
                </Text>
                {repayment.notes && (
                  <Text style={styles.repaymentNotes}>{repayment.notes}</Text>
                )}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateRepayment', { loanId })}
          style={styles.actionButton}
          disabled={loan.status === 'closed'}
          buttonColor={colors.primary}
        >
          Record Repayment
        </Button>

        <View style={styles.secondaryActions}>
          <Button
            mode="outlined"
            onPress={handleEdit}
            style={[styles.actionButton, styles.secondaryButton]}
            textColor={colors.primary}
          >
            Edit Loan
          </Button>

          <Button
            mode="outlined"
            onPress={handleDelete}
            style={[styles.actionButton, styles.secondaryButton]}
            textColor={colors.error}
            loading={deleting}
            disabled={deleting}
          >
            Delete Loan
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6200ee',
  },
  outstandingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  outstandingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f44336',
  },
  statusValue: {
    fontWeight: '600',
    color: '#4caf50',
  },
  notes: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  },
  repaymentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  repaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  repaymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
  repaymentDate: {
    fontSize: 14,
    color: '#666',
  },
  repaymentMethod: {
    fontSize: 13,
    color: '#666',
  },
  repaymentNotes: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    marginBottom: 8,
    borderRadius: borderRadius.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
  },
});

