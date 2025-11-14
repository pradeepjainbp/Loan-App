import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Button, Snackbar } from 'react-native-paper';
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
  const { dashboardMetrics, fetchLoans, loading, subscribeToLoans, getLoanCalculation, getRecentActivity } = useLoanStore();
  const { appUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLoans();
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      }
    };
    loadData();
    const unsubscribe = subscribeToLoans();
    return unsubscribe;
  }, []);

  const handleRefresh = async () => {
    try {
      setError(null);
      await fetchLoans();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh data');
    }
  };

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';

  // Calculate net balance
  const netBalance = (dashboardMetrics?.total_lent || 0) - (dashboardMetrics?.total_borrowed || 0);
  const isNetPositive = netBalance >= 0;

  // Priority loan - first overdue, else first due soon
  const priorityLoan = React.useMemo(() => {
    if (dashboardMetrics?.overdue_loans && dashboardMetrics.overdue_loans.length > 0) {
      return dashboardMetrics.overdue_loans[0];
    }
    if (dashboardMetrics?.loans_due_30_days && dashboardMetrics.loans_due_30_days.length > 0) {
      return dashboardMetrics.loans_due_30_days[0];
    }
    return null;
  }, [dashboardMetrics]);

  // Recent activity for the activity strip
  const recentActivity = getRecentActivity();

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {appUser?.full_name?.split(' ')[0] || 'there'}! 👋
          </Text>
          <Text style={styles.headerSubtitle}>
            Here's your loan summary
          </Text>
        </View>
      </View>

      {/* Priority Loan - What Needs Attention */}
      {priorityLoan && (() => {
        const calculation = getLoanCalculation(priorityLoan.id);
        const outstandingAmount = calculation?.current_outstanding || priorityLoan.principal_amount;
        const isOverdue = dashboardMetrics?.overdue_loans?.some(l => l.id === priorityLoan.id);
        const personName = priorityLoan.is_user_lender ? priorityLoan.borrower_name : priorityLoan.lender_name;
        
        return (
          <Card style={[styles.priorityCard, isOverdue ? styles.priorityCardOverdue : styles.priorityCardDueSoon]}>
            <Card.Content style={styles.priorityContent}>
              <View style={styles.priorityHeader}>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityBadgeIcon}>{isOverdue ? '⚠️' : '⏰'}</Text>
                  <Text style={styles.priorityBadgeText}>
                    {isOverdue ? 'OVERDUE' : 'DUE SOON'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.priorityTitle}>What needs attention</Text>
              
              <View style={styles.priorityDetails}>
                <View style={styles.priorityPersonRow}>
                  <View style={styles.priorityAvatar}>
                    <Text style={styles.priorityAvatarText}>{personName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.priorityInfo}>
                    <Text style={styles.priorityPersonName}>{personName}</Text>
                    <Text style={styles.priorityRole}>
                      {priorityLoan.is_user_lender ? 'You lent' : 'You borrowed'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.priorityAmountRow}>
                  <Text style={styles.priorityAmountLabel}>Outstanding</Text>
                  <Text style={[styles.priorityAmount, { color: isOverdue ? colors.semantic.error.main : colors.semantic.warning.main }]}>
                    {formatCurrency(outstandingAmount, currency)}
                  </Text>
                </View>
                
                {priorityLoan.due_date && (
                  <View style={styles.priorityDueDateRow}>
                    <Text style={styles.priorityDueDateLabel}>
                      {isOverdue ? 'Was due on' : 'Due on'}
                    </Text>
                    <Text style={styles.priorityDueDateValue}>
                      {formatDate(priorityLoan.due_date, dateFormat)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.priorityActions}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('LoanDetail', { loanId: priorityLoan.id })}
                  style={styles.priorityButton}
                  buttonColor={colors.primary}
                  labelStyle={styles.priorityButtonLabel}
                  contentStyle={styles.priorityButtonContent}
                >
                  See Details
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('CreateRepayment', { loanId: priorityLoan.id })}
                  style={styles.priorityButtonSecondary}
                  textColor={colors.primary}
                  labelStyle={styles.priorityButtonLabel}
                  contentStyle={styles.priorityButtonContent}
                >
                  Record Repayment
                </Button>
              </View>
            </Card.Content>
          </Card>
        );
      })()}

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        {/* Net Balance - Hero Card */}
        <Card style={[styles.netBalanceCard, isNetPositive ? styles.netPositiveCard : styles.netNegativeCard]}>
          <Card.Content style={styles.netBalanceContent}>
            <View style={styles.netBalanceHeader}>
              <Text style={styles.netBalanceLabel}>Net Balance</Text>
              <View style={[styles.netBadge, isNetPositive ? styles.netPositiveBadge : styles.netNegativeBadge]}>
                <Text style={styles.netBadgeText}>
                  {isNetPositive ? '↑ Positive' : '↓ Negative'}
                </Text>
              </View>
            </View>
            <Text style={[styles.netBalanceAmount, { color: isNetPositive ? colors.money.netPositive : colors.money.netNegative }]}>
              {isNetPositive ? '+' : ''}{formatCurrency(netBalance, currency)}
            </Text>
            <Text style={styles.netBalanceDescription}>
              {isNetPositive
                ? "You're owed more than you owe"
                : "You owe more than you're owed"}
            </Text>
          </Card.Content>
        </Card>

        {/* Lent & Borrowed - Side by Side */}
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, styles.lentCard]}>
            <Card.Content style={styles.summaryCardContent}>
              <View style={styles.summaryIconContainer}>
                <Text style={styles.summaryIcon}>💰</Text>
              </View>
              <Text style={styles.summaryLabel}>You Lent</Text>
              <Text style={[styles.summaryAmount, { color: colors.money.lent }]}>
                {formatCurrency(dashboardMetrics?.total_lent || 0, currency)}
              </Text>
              <Text style={styles.summaryHint}>Money given out</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, styles.borrowedCard]}>
            <Card.Content style={styles.summaryCardContent}>
              <View style={styles.summaryIconContainer}>
                <Text style={styles.summaryIcon}>🤝</Text>
              </View>
              <Text style={styles.summaryLabel}>You Borrowed</Text>
              <Text style={[styles.summaryAmount, { color: colors.money.borrowed }]}>
                {formatCurrency(dashboardMetrics?.total_borrowed || 0, currency)}
              </Text>
              <Text style={styles.summaryHint}>Money received</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Recent Activity Strip */}
      {recentActivity.length > 0 && (
        <View style={styles.activitySection}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activityScrollContent}
          >
            {recentActivity.map(({ loan, lastRepayment }) => {
              const personName = loan.is_user_lender ? loan.borrower_name : loan.lender_name;
              const activityDate = lastRepayment ? lastRepayment.payment_date : loan.created_at;
              const formattedDate = new Date(activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              if (lastRepayment) {
                return (
                  <TouchableOpacity
                    key={loan.id}
                    style={styles.activityChip}
                    onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activityChipText}>
                      💰 {personName} {loan.is_user_lender ? 'repaid' : 'received'} {formatCurrency(lastRepayment.payment_amount, currency)} on {formattedDate}
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={loan.id}
                    style={styles.activityChip}
                    onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activityChipText}>
                      ✨ New loan with {personName} • {formatCurrency(loan.principal_amount, currency)}
                    </Text>
                  </TouchableOpacity>
                );
              }
            })}
          </ScrollView>
        </View>
      )}

      {/* Quick Action */}
      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateLoan')}
          style={styles.actionButton}
          buttonColor={colors.primary}
          labelStyle={styles.actionButtonLabel}
          icon="plus-circle"
          contentStyle={styles.actionButtonContent}
        >
          Record New Loan
        </Button>
      </View>

      {/* Alerts Section */}
      {dashboardMetrics?.overdue_loans && dashboardMetrics.overdue_loans.length > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.alertDot, { backgroundColor: colors.semantic.error.main }]} />
              <Text style={styles.sectionTitle}>Overdue</Text>
            </View>
            <Text style={styles.sectionCount}>{dashboardMetrics.overdue_loans.length}</Text>
          </View>

          <Card style={[styles.alertCard, styles.overdueCard]}>
            <Card.Content style={styles.alertCardContent}>
              {dashboardMetrics.overdue_loans.slice(0, 3).map((loan, index) => {
                const calculation = getLoanCalculation(loan.id);
                const outstandingAmount = calculation?.current_outstanding || loan.principal_amount;
                const progressPercentage = calculation 
                  ? Math.min((calculation.total_repaid / calculation.total_amount_due) * 100, 100)
                  : 0;
                
                return (
                <TouchableOpacity
                  key={loan.id}
                  style={[
                    styles.loanItem,
                    index !== Math.min(2, dashboardMetrics.overdue_loans.length - 1) && styles.loanItemBorder
                  ]}
                  onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.loanItemContent}>
                    <View style={styles.loanItemLeft}>
                      <View style={styles.loanAvatar}>
                        <Text style={styles.loanAvatarText}>
                          {(loan.is_user_lender ? loan.borrower_name : loan.lender_name).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.loanInfo}>
                        <Text style={styles.loanName}>
                          {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                        </Text>
                        <Text style={styles.loanDate}>
                          {loan.due_date ? `Due ${formatDate(loan.due_date, dateFormat)}` : 'No due date'}
                        </Text>
                        {calculation && (
                          <View style={styles.miniProgressBar}>
                            <View 
                              style={[
                                styles.miniProgressFill, 
                                { 
                                  width: `${progressPercentage}%`,
                                  backgroundColor: colors.semantic.error.main
                                }
                              ]} 
                            />
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.loanAmount, { color: colors.semantic.error.main }]}>
                      {formatCurrency(outstandingAmount, currency)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );})}
            </Card.Content>
          </Card>
        </View>
      )}

      {dashboardMetrics?.loans_due_7_days && dashboardMetrics.loans_due_7_days.length > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.alertDot, { backgroundColor: colors.semantic.warning.main }]} />
              <Text style={styles.sectionTitle}>Due Soon</Text>
            </View>
            <Text style={styles.sectionCount}>{dashboardMetrics.loans_due_7_days.length}</Text>
          </View>

          <Card style={[styles.alertCard, styles.dueSoonCard]}>
            <Card.Content style={styles.alertCardContent}>
              {dashboardMetrics.loans_due_7_days.slice(0, 3).map((loan, index) => {
                const calculation = getLoanCalculation(loan.id);
                const outstandingAmount = calculation?.current_outstanding || loan.principal_amount;
                const progressPercentage = calculation ? Math.min((calculation.total_repaid / calculation.total_amount_due) * 100, 100) : 0;
                
                return (
                <TouchableOpacity
                  key={loan.id}
                  style={[
                    styles.loanItem,
                    index !== Math.min(2, dashboardMetrics.loans_due_7_days.length - 1) && styles.loanItemBorder
                  ]}
                  onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.loanItemContent}>
                    <View style={styles.loanItemLeft}>
                      <View style={styles.loanAvatar}>
                        <Text style={styles.loanAvatarText}>
                          {(loan.is_user_lender ? loan.borrower_name : loan.lender_name).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.loanInfo}>
                        <Text style={styles.loanName}>
                          {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                        </Text>
                        <Text style={styles.loanDate}>
                          {loan.due_date ? `Due ${formatDate(loan.due_date, dateFormat)}` : 'No due date'}
                        </Text>
                        <View style={styles.miniProgressBar}>
                          <View style={[styles.miniProgressFill, { width: `${progressPercentage}%`, backgroundColor: progressPercentage === 100 ? colors.semantic.success.main : colors.semantic.warning.main }]} />
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.loanAmount, { color: colors.semantic.info.main }]}>
                      {formatCurrency(calculation?.current_outstanding || loan.principal_amount, currency)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );})}
            </Card.Content>
          </Card>
        </View>
      )}

      {dashboardMetrics?.loans_due_30_days && dashboardMetrics.loans_due_30_days.length > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.alertDot, { backgroundColor: colors.semantic.info.main }]} />
              <Text style={styles.sectionTitle}>Upcoming</Text>
            </View>
            <Text style={styles.sectionCount}>{dashboardMetrics.loans_due_30_days.length}</Text>
          </View>

          <Card style={[styles.alertCard, styles.upcomingCard]}>
            <Card.Content style={styles.alertCardContent}>
              {dashboardMetrics.loans_due_30_days.slice(0, 3).map((loan, index) => {
                const calculation = getLoanCalculation(loan.id);
                const progressPercentage = calculation ? Math.min((calculation.total_repaid / calculation.total_amount_due) * 100, 100) : 0;
                
                return (
                <TouchableOpacity
                  key={loan.id}
                  style={[
                    styles.loanItem,
                    index !== Math.min(2, dashboardMetrics.loans_due_30_days.length - 1) && styles.loanItemBorder
                  ]}
                  onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.loanItemContent}>
                    <View style={styles.loanItemLeft}>
                      <View style={styles.loanAvatar}>
                        <Text style={styles.loanAvatarText}>
                          {(loan.is_user_lender ? loan.borrower_name : loan.lender_name).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.loanInfo}>
                        <Text style={styles.loanName}>
                          {loan.is_user_lender ? loan.borrower_name : loan.lender_name}
                        </Text>
                        <Text style={styles.loanDate}>
                          {loan.due_date ? `Due ${formatDate(loan.due_date, dateFormat)}` : 'No due date'}
                        </Text>
                        <View style={styles.miniProgressBar}>
                          <View style={[styles.miniProgressFill, { width: `${progressPercentage}%`, backgroundColor: progressPercentage === 100 ? colors.semantic.success.main : colors.semantic.info.main }]} />
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.loanAmount, { color: colors.semantic.info.main }]}>
                      {formatCurrency(calculation?.current_outstanding || loan.principal_amount, currency)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );})}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Empty State */}
      {(!dashboardMetrics?.overdue_loans || dashboardMetrics.overdue_loans.length === 0) &&
       (!dashboardMetrics?.loans_due_7_days || dashboardMetrics.loans_due_7_days.length === 0) &&
       (!dashboardMetrics?.loans_due_30_days || dashboardMetrics.loans_due_30_days.length === 0) && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptyText}>
              No upcoming or overdue loans
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>

    {/* Error Snackbar */}
    <Snackbar
      visible={!!error}
      onDismiss={() => setError(null)}
      duration={4000}
      action={{
        label: 'Dismiss',
        onPress: () => setError(null),
      }}
      style={{ backgroundColor: colors.semantic.error.main }}
    >
      {error}
    </Snackbar>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  
  // Header
  header: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  greeting: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  
  // Priority Card - What Needs Attention
  priorityCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    ...elevation.md,
    borderWidth: 2,
  },
  priorityCardOverdue: {
    borderColor: colors.semantic.error.main,
  },
  priorityCardDueSoon: {
    borderColor: colors.semantic.warning.main,
  },
  priorityContent: {
    padding: spacing.lg,
  },
  priorityHeader: {
    marginBottom: spacing.md,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.semantic.warning.light,
  },
  priorityBadgeIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  priorityBadgeText: {
    ...typography.caption.regular,
    color: colors.semantic.warning.main,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priorityTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  priorityDetails: {
    marginBottom: spacing.lg,
  },
  priorityPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priorityAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  priorityAvatarText: {
    ...typography.heading.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  priorityInfo: {
    flex: 1,
  },
  priorityPersonName: {
    ...typography.body.large,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  priorityRole: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  priorityAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  priorityAmountLabel: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  priorityAmount: {
    ...typography.amount.medium,
    fontWeight: '700',
  },
  priorityDueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  priorityDueDateLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  priorityDueDateValue: {
    ...typography.body.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
  priorityActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  priorityButtonSecondary: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.primary,
  },
  priorityButtonLabel: {
    ...typography.button.medium,
  },
  priorityButtonContent: {
    paddingVertical: spacing.xs,
  },
  
  // Summary Grid
  summaryGrid: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  
  // Net Balance Card
  netBalanceCard: {
    borderRadius: borderRadius.lg,
    ...elevation.md,
  },
  netPositiveCard: {
    backgroundColor: colors.semantic.success.light,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.success.main,
  },
  netNegativeCard: {
    backgroundColor: colors.semantic.error.light,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.error.main,
  },
  netBalanceContent: {
    padding: spacing.xl,
  },
  netBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  netBalanceLabel: {
    ...typography.label.large,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  netPositiveBadge: {
    backgroundColor: colors.semantic.success.main,
  },
  netNegativeBadge: {
    backgroundColor: colors.semantic.error.main,
  },
  netBadgeText: {
    ...typography.label.small,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  netBalanceAmount: {
    ...typography.amount.large,
    marginBottom: spacing.xs,
  },
  netBalanceDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  
  // Summary Row (Lent & Borrowed)
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  lentCard: {
    backgroundColor: colors.background.primary,
    borderLeftWidth: 3,
    borderLeftColor: colors.money.lent,
  },
  borrowedCard: {
    backgroundColor: colors.background.primary,
    borderLeftWidth: 3,
    borderLeftColor: colors.money.borrowed,
  },
  summaryCardContent: {
    padding: spacing.lg,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    ...typography.amount.small,
    marginBottom: spacing.xs,
  },
  summaryHint: {
    ...typography.caption.regular,
    color: colors.text.tertiary,
  },
  
  // Recent Activity Strip
  activitySection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  activityTitle: {
    ...typography.label.large,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  activityScrollContent: {
    paddingRight: spacing.lg,
  },
  activityChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    ...elevation.xs,
  },
  activityChipText: {
    ...typography.body.small,
    color: colors.text.primary,
    fontWeight: '500',
  },
  
  // Action Section
  actionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    borderRadius: borderRadius.md,
    ...elevation.sm,
  },
  actionButtonContent: {
    height: 52,
  },
  actionButtonLabel: {
    ...typography.button.large,
  },
  
  // Alert Sections
  alertSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
  },
  sectionCount: {
    ...typography.label.large,
    color: colors.text.tertiary,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  // Alert Cards
  alertCard: {
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  overdueCard: {
    backgroundColor: colors.semantic.error.light,
  },
  dueSoonCard: {
    backgroundColor: colors.semantic.warning.light,
  },
  upcomingCard: {
    backgroundColor: colors.semantic.info.light,
  },
  alertCardContent: {
    padding: 0,
  },
  
  // Loan Items
  loanItem: {
    padding: spacing.lg,
  },
  loanItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  loanItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loanAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...elevation.xs,
  },
  loanAvatarText: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.primary,
  },
  loanInfo: {
    flex: 1,
  },
  loanName: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniProgressBar: {
    height: 3,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  loanDate: {
    ...typography.caption.regular,
    color: colors.text.secondary,
  },
  loanAmount: {
    ...typography.amount.tiny,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: spacing.sm,
  },
  viewAllButtonLabel: {
    ...typography.button.small,
  },
  
  // Empty State
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    ...elevation.sm,
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  bottomSpacer: {
    height: spacing.xl,
  },
});