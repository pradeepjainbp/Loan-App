import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Divider, useTheme, Button, FAB } from 'react-native-paper';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { Transaction, Loan } from '../../types';
import { getTransactionSummary } from '../../utils/transactionCalculations';
import { formatCurrency } from '../../utils/calculations';

interface TransactionHistoryScreenProps {
  route: any;
  navigation: any;
}

export default function TransactionHistoryScreen({
  route,
  navigation,
}: TransactionHistoryScreenProps) {
  const { loanId } = route.params;
  const theme = useTheme();
  const { loans } = useLoanStore();
  const { appUser } = useAuthStore();
  const { transactions, fetchTransactions } = useLoanStore();

  const [loading, setLoading] = useState(true);

  const loan = loans.find((l) => l.id === loanId);
  const loanTransactions = transactions[loanId] || [];

  useEffect(() => {
    loadTransactions();
  }, [loanId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      await fetchTransactions(loanId);
    } finally {
      setLoading(false);
    }
  };

  if (!loan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loan not found</Text>
      </View>
    );
  }

  const summary = getTransactionSummary(loan, loanTransactions);
  const currency = appUser?.settings?.currency || 'INR';

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💰';
      case 'principal_increase':
        return '📈';
      case 'principal_decrease':
        return '📉';
      case 'interest_accrual':
        return '📊';
      default:
        return '📋';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionIcon}>{getTransactionIcon(item.transaction_type)}</Text>
          <View style={styles.transactionInfo}>
            <Text style={styles.particulars}>{item.particulars}</Text>
            <Text style={styles.date}>
              {new Date(item.transaction_date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.amountRow}>
          <Text style={styles.label}>Interest Portion:</Text>
          <Text style={styles.amount}>{formatCurrency(item.interest_portion, currency)}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.label}>Paid/Received:</Text>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            {formatCurrency(item.paid_amount, currency)}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.label}>Balance After:</Text>
          <Text style={[styles.amount, { fontWeight: 'bold' }]}>
            {formatCurrency(item.balance_after, currency)}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.notesRow}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Transaction Summary</Text>
            <Divider style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Principal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.currentPrincipal, currency)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Interest Accrued:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalInterestAccrued, currency)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(summary.totalPaid, currency)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Outstanding Balance:</Text>
              <Text style={[styles.summaryValue, { fontWeight: 'bold', fontSize: 16 }]}>
                {formatCurrency(summary.outstandingBalance, currency)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Transactions List */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Transaction History
        </Text>

        {loanTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={loanTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Add Transaction"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction', { loanId })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  particulars: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesRow: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyCard: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  listContent: {
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

