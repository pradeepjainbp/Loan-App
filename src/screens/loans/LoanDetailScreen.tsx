import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, calculateLoanInterest, calculateSimpleInterest, calculateCompoundInterest } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

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
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔍</Text>
        <Text style={styles.errorTitle}>Loan not found</Text>
        <Text style={styles.errorText}>This loan may have been deleted</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';
  
  const isLent = loan.is_user_lender;
  const personName = isLent ? loan.borrower_name : loan.lender_name;
  const statusConfig = {
    active: { color: colors.status.active, bg: colors.semantic.success.light, label: 'Active' },
    overdue: { color: colors.status.overdue, bg: colors.semantic.error.light, label: 'Overdue' },
    closed: { color: colors.status.closed, bg: colors.semantic.neutral.light, label: 'Settled' },
  }[loan.status];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{personName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.personName}>{personName}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {isLent ? '💰 You Lent' : '🤝 You Borrowed'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Outstanding Amount - Hero */}
      <Card style={[styles.outstandingCard, calculation.current_outstanding > 0 ? styles.outstandingActive : styles.outstandingSettled]}>
        <Card.Content style={styles.outstandingContent}>
          <Text style={styles.outstandingLabel}>
            {calculation.current_outstanding > 0 ? 'Outstanding Amount' : 'Loan Settled'}
          </Text>
          <Text style={[styles.outstandingAmount, { color: calculation.current_outstanding > 0 ? (isLent ? colors.money.lent : colors.money.borrowed) : colors.status.closed }]}>
            {formatCurrency(calculation.current_outstanding, currency)}
          </Text>
          {calculation.current_outstanding > 0 && (
            <View style={styles.outstandingProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(calculation.total_repaid / calculation.total_amount_due) * 100}%`,
                      backgroundColor: isLent ? colors.money.lent : colors.money.borrowed 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((calculation.total_repaid / calculation.total_amount_due) * 100)}% Repaid
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Financial Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Principal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(loan.principal_amount, currency)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Interest</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(calculation.interest_amount, currency)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Due</Text>
              <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>
                {formatCurrency(calculation.total_amount_due, currency)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Repaid</Text>
              <Text style={[styles.summaryValue, { color: colors.semantic.success.main }]}>
                {formatCurrency(calculation.total_repaid, currency)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Loan Details */}
      <Card style={styles.detailsCard}>
        <Card.Content style={styles.detailsContent}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{formatDate(loan.start_date, dateFormat)}</Text>
          </View>
          
          {loan.interest_type !== 'none' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Type</Text>
                <Text style={styles.detailValue}>
                  {loan.interest_type === 'simple' 
                    ? 'Simple' 
                    : `Compound - ${loan.compounding_frequency ? 
                        loan.compounding_frequency.charAt(0).toUpperCase() + loan.compounding_frequency.slice(1) 
                        : 'Monthly'}`
                  }
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Rate</Text>
                <Text style={styles.detailValue}>{loan.interest_rate}% per annum</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Till Date</Text>
                <Text style={[styles.detailValue, { color: colors.semantic.warning.main, fontWeight: '600' }]}>
                  {formatCurrency(calculation.interest_amount, currency)}
                </Text>
              </View>

              {calculation.current_outstanding > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Daily Interest (Current Balance)</Text>
                  <Text style={[styles.detailValue, { color: colors.semantic.error.main, fontWeight: '700' }]}>
                    {formatCurrency(
                      (() => {
                        const dailyRate = loan.interest_rate / 100 / 365;
                        return calculation.current_outstanding * dailyRate;
                      })(),
                      currency
                    )} per day
                  </Text>
                </View>
              )}
            </>
          )}
          
          {loan.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.notesText}>{loan.notes}</Text>
            </View>
          )}
          
          {loan.tags && loan.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.detailLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {loan.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Repayment History - Table Format */}
      <Card style={styles.repaymentCard}>
        <Card.Content style={styles.repaymentContent}>
          <View style={styles.repaymentHeader}>
            <Text style={styles.sectionTitle}>Repayment History</Text>
            {loanRepayments.length > 0 && (
              <View style={styles.repaymentCount}>
                <Text style={styles.repaymentCountText}>{loanRepayments.length}</Text>
              </View>
            )}
          </View>
          
          {loanRepayments.length === 0 ? (
            <View style={styles.emptyRepayments}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No repayments yet</Text>
              <Text style={styles.emptyText}>Record the first repayment to track progress</Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.dateColumn]}>Date</Text>
                <Text style={[styles.tableHeaderCell, styles.particularsColumn]}>Particulars</Text>
                <Text style={[styles.tableHeaderCell, styles.amountColumn]}>Interest</Text>
                <Text style={[styles.tableHeaderCell, styles.amountColumn]}>Paid</Text>
                <Text style={[styles.tableHeaderCell, styles.amountColumn]}>Balance</Text>
                <Text style={[styles.tableHeaderCell, styles.amountColumn]}>Int Per Day</Text>
              </View>
              
              {/* Account Opening Row */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.dateColumn]}>
                  {formatDate(loan.start_date, dateFormat)}
                </Text>
                <Text style={[styles.tableCell, styles.particularsColumn]}>Account Opening</Text>
                <Text style={[styles.tableCell, styles.amountColumn]}>-</Text>
                <Text style={[styles.tableCell, styles.amountColumn]}>
                  {formatCurrency(loan.principal_amount, currency)}
                </Text>
                <Text style={[styles.tableCell, styles.amountColumn]}>
                  {formatCurrency(loan.principal_amount, currency)}
                </Text>
                <Text style={[styles.tableCell, styles.amountColumn]}>
                  {loan.interest_type !== 'none' 
                    ? formatCurrency((loan.principal_amount * loan.interest_rate / 100 / 365), currency)
                    : '-'
                  }
                </Text>
              </View>
              
              {/* Repayment Rows with running balance */}
              {(() => {
                let runningBalance = loan.principal_amount;
                let previousPaymentDate = loan.start_date;
                
                // Sort repayments by date (ascending - oldest first)
                const sortedRepayments = [...loanRepayments].sort((a, b) => 
                  new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
                );
                
                return sortedRepayments.map((repayment, index) => {
                  // Calculate interest on the RUNNING BALANCE for this period
                  const interestForThisPeriod = loan.interest_type !== 'none' 
                    ? (() => {
                        if (loan.interest_type === 'simple') {
                          return calculateSimpleInterest(
                            runningBalance,
                            loan.interest_rate,
                            previousPaymentDate,
                            repayment.payment_date
                          );
                        } else if (loan.interest_type === 'compound' && loan.compounding_frequency) {
                          return calculateCompoundInterest(
                            runningBalance,
                            loan.interest_rate,
                            previousPaymentDate,
                            repayment.payment_date,
                            loan.compounding_frequency
                          );
                        }
                        return 0;
                      })()
                    : 0;
                  
                  // Add interest to balance, then subtract payment
                  runningBalance = runningBalance + interestForThisPeriod - repayment.payment_amount;
                  
                  // Calculate daily interest on the new balance
                  const dailyInterest = loan.interest_type !== 'none' && runningBalance > 0
                    ? (runningBalance * loan.interest_rate / 100 / 365)
                    : 0;
                  
                  previousPaymentDate = repayment.payment_date;
                  
                  return (
                    <TouchableOpacity 
                      key={repayment.id}
                      onPress={() => navigation.navigate('EditRepayment', { loanId, repaymentId: repayment.id })}
                      activeOpacity={0.7}
                    >
                      <View 
                        style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                      >
                        <Text style={[styles.tableCell, styles.dateColumn]}>
                          {formatDate(repayment.payment_date, dateFormat)}
                        </Text>
                        <Text style={[styles.tableCell, styles.particularsColumn]}>
                          {repayment.notes || `via ${repayment.payment_method.replace('_', ' ')}`}
                        </Text>
                        <Text style={[styles.tableCell, styles.amountColumn]}>
                          {formatCurrency(Math.abs(interestForThisPeriod), currency)}
                        </Text>
                        <Text style={[styles.tableCell, styles.amountColumn, { color: colors.semantic.success.main }]}>
                          {formatCurrency(repayment.payment_amount, currency)}
                        </Text>
                        <Text style={[styles.tableCell, styles.amountColumn, { fontWeight: '600' }]}>
                          {formatCurrency(Math.max(0, runningBalance), currency)}
                        </Text>
                        <Text style={[styles.tableCell, styles.amountColumn, { fontSize: 11 }]}>
                          {runningBalance > 0 
                            ? formatCurrency(dailyInterest, currency)
                            : '-'
                          }
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateRepayment', { loanId })}
          style={styles.primaryButton}
          buttonColor={colors.primary}
          labelStyle={styles.primaryButtonLabel}
          icon="plus-circle"
          disabled={loan.status === 'closed'}
        >
          Record Repayment
        </Button>

        <View style={styles.secondaryActions}>
          <Button
            mode="outlined"
            onPress={handleEdit}
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
            textColor={colors.primary}
            icon="pencil"
          >
            Edit
          </Button>

          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
            textColor={colors.semantic.error.main}
            loading={deleting}
            disabled={deleting}
            icon="delete"
          >
            Delete
          </Button>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    borderRadius: borderRadius.md,
  },
  
  // Header Card
  headerCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  headerContent: {
    padding: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.heading.h2,
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  personName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  roleBadgeText: {
    ...typography.label.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.label.medium,
    fontWeight: '600',
  },
  
  // Outstanding Card
  outstandingCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    ...elevation.md,
  },
  outstandingActive: {
    backgroundColor: colors.background.primary,
  },
  outstandingSettled: {
    backgroundColor: colors.semantic.success.light,
  },
  outstandingContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  outstandingLabel: {
    ...typography.label.large,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  outstandingAmount: {
    ...typography.amount.hero,
    marginBottom: spacing.md,
  },
  outstandingProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption.medium,
    color: colors.text.secondary,
  },
  
  // Summary Card
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  summaryContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.amount.small,
    color: colors.text.primary,
  },
  summaryValueHighlight: {
    color: colors.primary,
  },
  
  // Details Card
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  detailsContent: {
    padding: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  detailLabel: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  notesText: {
    ...typography.body.medium,
    color: colors.text.primary,
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  tagsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...typography.caption.medium,
    color: colors.text.secondary,
  },
  
  // Repayment Card
  repaymentCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  repaymentContent: {
    padding: spacing.lg,
  },
  repaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  repaymentCount: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repaymentCountText: {
    ...typography.label.small,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  emptyRepayments: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  repaymentList: {
    gap: 0,
  },
  repaymentItem: {
    paddingVertical: spacing.md,
  },
  repaymentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  repaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repaymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.semantic.success.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  repaymentIcon: {
    fontSize: 20,
  },
  repaymentInfo: {
    flex: 1,
  },
  repaymentAmount: {
    ...typography.body.medium,
    color: colors.semantic.success.main,
    fontWeight: '700',
    marginBottom: 2,
  },
  repaymentDate: {
    ...typography.caption.regular,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  repaymentMethod: {
    ...typography.caption.regular,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  repaymentNotes: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginLeft: 56,
    fontStyle: 'italic',
  },
  
  // Table Styles
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 2,
    borderBottomColor: colors.ui.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tableHeaderCell: {
    ...typography.label.small,
    color: colors.text.secondary,
    fontWeight: '700',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background.primary,
  },
  tableRowAlt: {
    backgroundColor: colors.background.secondary,
  },
  tableCell: {
    ...typography.body.small,
    color: colors.text.primary,
    textAlign: 'left',
  },
  dateColumn: {
    flex: 1.2,
  },
  particularsColumn: {
    flex: 2,
  },
  amountColumn: {
    flex: 1,
    textAlign: 'right',
  },
  
  // Actions
  actions: {
    padding: spacing.lg,
  },
  primaryButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...elevation.sm,
  },
  primaryButtonLabel: {
    ...typography.button.large,
    paddingVertical: spacing.xs,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.ui.border,
  },
  secondaryButtonLabel: {
    ...typography.button.medium,
  },
  
  bottomSpacer: {
    height: spacing.xl,
  },
});