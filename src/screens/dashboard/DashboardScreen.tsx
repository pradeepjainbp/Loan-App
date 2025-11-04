import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Title, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { dashboardMetrics, fetchLoans, loading, subscribeToLoans } = useLoanStore();
  const { appUser } = useAuthStore();

  useEffect(() => {
    fetchLoans();
    const unsubscribe = subscribeToLoans();
    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    fetchLoans();
  };

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.title}>Dashboard</Title>
        <Text style={styles.greeting}>
          Welcome back, {appUser?.full_name || 'User'}!
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, styles.lentCard]}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Total Lent</Text>
            <Text style={[styles.summaryAmount, styles.lentAmount]}>
              {formatCurrency(dashboardMetrics?.total_lent || 0, currency)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.borrowedCard]}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Total Borrowed</Text>
            <Text style={[styles.summaryAmount, styles.borrowedAmount]}>
              {formatCurrency(dashboardMetrics?.total_borrowed || 0, currency)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.netCard]}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Text style={[styles.summaryAmount, styles.netAmount]}>
              {formatCurrency(dashboardMetrics?.net_balance || 0, currency)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateLoan')}
          style={styles.actionButton}
          icon="plus"
        >
          Add New Loan
        </Button>
      </View>

      {/* Overdue Loans */}
      {dashboardMetrics?.overdue_loans && dashboardMetrics.overdue_loans.length > 0 && (
        <Card style={[styles.alertCard, styles.overdueCard]}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>Overdue Loans</Text>
              <Chip style={styles.overdueChip}>
                {dashboardMetrics.overdue_loans.length}
              </Chip>
            </View>
            {dashboardMetrics.overdue_loans.slice(0, 3).map((loan) => (
              <View key={loan.id} style={styles.loanItem}>
                <View style={styles.loanInfo}>
                  <Text style={styles.loanName}>
                    {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                  </Text>
                  <Text style={styles.loanAmount}>
                    {formatCurrency(loan.principal_amount, currency)}
                  </Text>
                </View>
                <Text style={styles.loanDate}>
                  Due: {formatDate(loan.due_date, dateFormat)}
                </Text>
              </View>
            ))}
            {dashboardMetrics.overdue_loans.length > 3 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Loans' })}
                style={styles.viewAllButton}
              >
                View All ({dashboardMetrics.overdue_loans.length})
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Loans Due in 7 Days */}
      {dashboardMetrics?.loans_due_7_days && dashboardMetrics.loans_due_7_days.length > 0 && (
        <Card style={[styles.alertCard, styles.warningCard]}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>Due Within 7 Days</Text>
              <Chip style={styles.warningChip}>
                {dashboardMetrics.loans_due_7_days.length}
              </Chip>
            </View>
            {dashboardMetrics.loans_due_7_days.slice(0, 3).map((loan) => (
              <View key={loan.id} style={styles.loanItem}>
                <View style={styles.loanInfo}>
                  <Text style={styles.loanName}>
                    {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                  </Text>
                  <Text style={styles.loanAmount}>
                    {formatCurrency(loan.principal_amount, currency)}
                  </Text>
                </View>
                <Text style={styles.loanDate}>
                  Due: {formatDate(loan.due_date, dateFormat)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Loans Due in 30 Days */}
      {dashboardMetrics?.loans_due_30_days && dashboardMetrics.loans_due_30_days.length > 0 && (
        <Card style={[styles.alertCard, styles.infoCard]}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>Due Within 30 Days</Text>
              <Chip style={styles.infoChip}>
                {dashboardMetrics.loans_due_30_days.length}
              </Chip>
            </View>
            {dashboardMetrics.loans_due_30_days.slice(0, 3).map((loan) => (
              <View key={loan.id} style={styles.loanItem}>
                <View style={styles.loanInfo}>
                  <Text style={styles.loanName}>
                    {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                  </Text>
                  <Text style={styles.loanAmount}>
                    {formatCurrency(loan.principal_amount, currency)}
                  </Text>
                </View>
                <Text style={styles.loanDate}>
                  Due: {formatDate(loan.due_date, dateFormat)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {(!dashboardMetrics?.overdue_loans || dashboardMetrics.overdue_loans.length === 0) &&
       (!dashboardMetrics?.loans_due_7_days || dashboardMetrics.loans_due_7_days.length === 0) &&
       (!dashboardMetrics?.loans_due_30_days || dashboardMetrics.loans_due_30_days.length === 0) && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>No upcoming or overdue loans</Text>
            <Text style={styles.emptySubtext}>
              Create your first loan to get started
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  summaryContainer: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    marginBottom: 8,
  },
  lentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  borrowedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  netCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lentAmount: {
    color: '#4caf50',
  },
  borrowedAmount: {
    color: '#f44336',
  },
  netAmount: {
    color: '#2196f3',
  },
  actionsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: 8,
  },
  alertCard: {
    margin: 16,
    marginTop: 8,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  infoCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  overdueChip: {
    backgroundColor: '#ffebee',
  },
  warningChip: {
    backgroundColor: '#fff3e0',
  },
  infoChip: {
    backgroundColor: '#e3f2fd',
  },
  loanItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  loanName: {
    fontSize: 16,
    fontWeight: '500',
  },
  loanAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
  loanDate: {
    fontSize: 14,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 8,
  },
  emptyCard: {
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
});

