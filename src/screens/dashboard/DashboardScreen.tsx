import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

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

  // Calculate net balance
  const netBalance = (dashboardMetrics?.total_lent || 0) - (dashboardMetrics?.total_borrowed || 0);
  const netBalanceColor = netBalance >= 0 ? colors.netPositive : colors.netNegative;

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

      {/* Summary Cards - Redesigned */}
      <View style={styles.summaryContainer}>
        {/* Total Lent Card */}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.lentCardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>💰</Text>
              <Text style={styles.summaryLabel}>Total Lent</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.lent }]}>
              {formatCurrency(dashboardMetrics?.total_lent || 0, currency)}
            </Text>
            <Text style={styles.summaryContext}>
              Money you've lent out
            </Text>
          </Card.Content>
        </Card>

        {/* Total Borrowed Card */}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.borrowedCardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🤝</Text>
              <Text style={styles.summaryLabel}>Total Borrowed</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.borrowed }]}>
              {formatCurrency(dashboardMetrics?.total_borrowed || 0, currency)}
            </Text>
            <Text style={styles.summaryContext}>
              Money you've borrowed
            </Text>
          </Card.Content>
        </Card>

        {/* Net Balance Card */}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.netCardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.summaryLabel}>Net Balance</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: netBalanceColor }]}>
              {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, currency)}
            </Text>
            <Text style={styles.summaryContext}>
              {netBalance >= 0
                ? "You're owed more than you owe"
                : "You owe more than you're owed"}
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
          buttonColor={colors.primary}
          icon="plus"
        >
          Add New Loan
        </Button>
      </View>

      {/* Overdue Loans - Redesigned */}
      {dashboardMetrics?.overdue_loans && dashboardMetrics.overdue_loans.length > 0 && (
        <Card style={styles.alertCard}>
          <Card.Content style={styles.overdueCardContent}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleContainer}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertTitle}>Overdue ({dashboardMetrics.overdue_loans.length})</Text>
              </View>
            </View>
            {dashboardMetrics.overdue_loans.slice(0, 3).map((loan, index) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.loanItem}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
              >
                <View style={styles.loanInfo}>
                  <View style={styles.loanNameContainer}>
                    <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
                    <Text style={styles.loanName}>
                      {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                    </Text>
                  </View>
                  <Text style={[styles.loanAmount, { color: colors.error }]}>
                    {formatCurrency(loan.principal_amount, currency)}
                  </Text>
                </View>
                <Text style={styles.loanDate}>
                  Due: {formatDate(loan.due_date, dateFormat)}
                </Text>
              </TouchableOpacity>
            ))}
            {dashboardMetrics.overdue_loans.length > 3 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Loans' })}
                style={styles.viewAllButton}
                textColor={colors.error}
              >
                View all {dashboardMetrics.overdue_loans.length} →
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Loans Due in 7 Days - Redesigned */}
      {dashboardMetrics?.loans_due_7_days && dashboardMetrics.loans_due_7_days.length > 0 && (
        <Card style={styles.alertCard}>
          <Card.Content style={styles.warningCardContent}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleContainer}>
                <Text style={styles.alertIcon}>⏰</Text>
                <Text style={styles.alertTitle}>Due Soon ({dashboardMetrics.loans_due_7_days.length})</Text>
              </View>
            </View>
            {dashboardMetrics.loans_due_7_days.slice(0, 3).map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.loanItem}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
              >
                <View style={styles.loanInfo}>
                  <View style={styles.loanNameContainer}>
                    <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                    <Text style={styles.loanName}>
                      {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                    </Text>
                  </View>
                  <Text style={[styles.loanAmount, { color: colors.warning }]}>
                    {formatCurrency(loan.principal_amount, currency)}
                  </Text>
                </View>
                <Text style={styles.loanDate}>
                  Due: {formatDate(loan.due_date, dateFormat)}
                </Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Loans Due in 30 Days - Redesigned */}
      {dashboardMetrics?.loans_due_30_days && dashboardMetrics.loans_due_30_days.length > 0 && (
        <Card style={styles.alertCard}>
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleContainer}>
                <Text style={styles.alertIcon}>📅</Text>
                <Text style={styles.alertTitle}>Upcoming ({dashboardMetrics.loans_due_30_days.length})</Text>
              </View>
            </View>
            {dashboardMetrics.loans_due_30_days.slice(0, 3).map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.loanItem}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
              >
                <View style={styles.loanInfo}>
                  <View style={styles.loanNameContainer}>
                    <View style={[styles.statusDot, { backgroundColor: colors.info }]} />
                    <Text style={styles.loanName}>
                      {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                    </Text>
                  </View>
                  <Text style={[styles.loanAmount, { color: colors.info }]}>
                    {formatCurrency(loan.principal_amount, currency)}
                  </Text>
                </View>
                <Text style={styles.loanDate}>
                  Due: {formatDate(loan.due_date, dateFormat)}
                </Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Empty State - Redesigned */}
      {(!dashboardMetrics?.overdue_loans || dashboardMetrics.overdue_loans.length === 0) &&
       (!dashboardMetrics?.loans_due_7_days || dashboardMetrics.loans_due_7_days.length === 0) &&
       (!dashboardMetrics?.loans_due_30_days || dashboardMetrics.loans_due_30_days.length === 0) && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>All clear!</Text>
            <Text style={styles.emptySubtext}>
              No upcoming or overdue loans
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
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.surface,
  },
  greeting: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  summaryContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  lentCardContent: {
    backgroundColor: colors.successLight,
  },
  borrowedCardContent: {
    backgroundColor: colors.infoLight,
  },
  netCardContent: {
    backgroundColor: colors.surfaceVariant,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  summaryAmount: {
    ...typography.amount,
    marginVertical: spacing.xs,
  },
  summaryContext: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  actionsContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  alertCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  overdueCardContent: {
    backgroundColor: colors.errorLight,
  },
  warningCardContent: {
    backgroundColor: colors.warningLight,
  },
  infoCardContent: {
    backgroundColor: colors.infoLight,
  },
  alertHeader: {
    marginBottom: spacing.md,
  },
  alertTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  alertTitle: {
    ...typography.h4,
  },
  loanItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  loanNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  loanName: {
    ...typography.body1,
    fontWeight: '500',
  },
  loanAmount: {
    ...typography.body1,
    fontWeight: '600',
  },
  loanDate: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  viewAllButton: {
    marginTop: spacing.sm,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});

