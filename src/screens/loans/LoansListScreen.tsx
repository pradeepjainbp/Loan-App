import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Searchbar, Button, Chip, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { Loan, LoanStatus } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoansListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { loans, fetchLoans, loading, getLoanCalculation } = useLoanStore();
  const { appUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'all'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'lender' | 'borrower'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'dueDate'>('date');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLoans();
      } catch (err: any) {
        setError(err.message || 'Failed to load loans');
      }
    };
    loadData();
  }, []);

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';

  const filteredLoans = loans
    .filter((loan) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        loan.lender_name.toLowerCase().includes(searchLower) ||
        loan.borrower_name.toLowerCase().includes(searchLower) ||
        loan.notes?.toLowerCase().includes(searchLower) ||
        loan.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      if (filterStatus !== 'all' && loan.status !== filterStatus) {
        return false;
      }

      if (filterRole === 'lender' && !loan.is_user_lender) {
        return false;
      }
      if (filterRole === 'borrower' && loan.is_user_lender) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'amount':
          return b.principal_amount - a.principal_amount;
        case 'dueDate':
          // Handle null due dates - put them at the end
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        default:
          return 0;
      }
    });

  // Compute quick totals for header
  const quickTotals = useMemo(() => {
    const activeCount = loans.filter(l => l.status === 'active').length;
    const overdueCount = loans.filter(l => l.status === 'overdue').length;
    const settledCount = loans.filter(l => l.status === 'closed').length;
    
    const totalOutstanding = loans
      .filter(l => l.status !== 'closed')
      .reduce((sum, loan) => {
        const calculation = getLoanCalculation(loan.id);
        return sum + (calculation?.current_outstanding || 0);
      }, 0);
    
    return {
      activeCount,
      overdueCount,
      settledCount,
      totalOutstanding,
    };
  }, [loans, getLoanCalculation]);

  const getStatusConfig = (status: LoanStatus) => {
    switch (status) {
      case 'active':
        return {
          color: colors.status.active,
          bg: colors.semantic.success.light,
          label: 'Active',
        };
      case 'overdue':
        return {
          color: colors.status.overdue,
          bg: colors.semantic.error.light,
          label: 'Overdue',
        };
      case 'closed':
        return {
          color: colors.status.closed,
          bg: colors.semantic.neutral.light,
          label: 'Settled',
        };
      default:
        return {
          color: colors.text.tertiary,
          bg: colors.background.tertiary,
          label: status,
        };
    }
  };

  const renderLoanItem = ({ item }: { item: Loan }) => {
    const statusConfig = getStatusConfig(item.status);
    const isLent = item.is_user_lender;
    const personName = isLent ? item.borrower_name : item.lender_name;
    const calculation = getLoanCalculation(item.id);
    
    // Calculate progress percentage
    const progressPercentage = calculation 
      ? Math.min((calculation.total_repaid / calculation.total_amount_due) * 100, 100)
      : 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('LoanDetail', { loanId: item.id })}
        activeOpacity={0.7}
      >
        <Card style={styles.loanCard}>
          <Card.Content style={styles.loanCardContent}>
            {/* Header Row */}
            <View style={styles.loanHeader}>
              <View style={styles.loanHeaderLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {personName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.loanTitleSection}>
                  <Text style={styles.loanName}>{personName}</Text>
                  <View style={styles.loanMetaRow}>
                    <View style={[styles.roleBadge, isLent ? styles.lentBadge : styles.borrowedBadge]}>
                      <Text style={[styles.roleBadgeText, isLent ? styles.lentBadgeText : styles.borrowedBadgeText]}>
                        {isLent ? '💰 Lent' : '🤝 Borrowed'}
                      </Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                    <Text style={styles.statusText}>{statusConfig.label}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progress Section */}
            {calculation && (
              <View style={styles.progressSection}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressText}>
                    {formatCurrency(calculation.total_repaid, currency)} of {formatCurrency(calculation.total_amount_due, currency)}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(progressPercentage)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progressPercentage}%`,
                        backgroundColor: progressPercentage === 100 ? colors.semantic.success.main : colors.primary
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* Amount Row */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={[styles.amountValue, { color: isLent ? colors.money.lent : colors.money.borrowed }]}>
                  {formatCurrency(item.principal_amount, currency)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Due Date</Text>
                <Text style={styles.amountValue}>
                  {item.due_date ? formatDate(item.due_date, dateFormat) : 'No due date'}
                </Text>
              </View>
              {item.interest_type !== 'none' && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Interest</Text>
                  <Text style={styles.amountValue}>
                    {item.interest_rate}% {item.interest_type}
                  </Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {item.tags.length > 3 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{item.tags.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ 
    active, 
    onPress, 
    label 
  }: { 
    active: boolean; 
    onPress: () => void; 
    label: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search and Filters */}
      <View style={styles.header}>
        {/* Quick Totals Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconCircle, { backgroundColor: colors.semantic.success.light }]}>
              <Text style={styles.summaryIcon}>✓</Text>
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryCount}>{quickTotals.activeCount}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconCircle, { backgroundColor: colors.semantic.error.light }]}>
              <Text style={styles.summaryIcon}>⚠</Text>
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryCount}>{quickTotals.overdueCount}</Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconCircle, { backgroundColor: colors.semantic.neutral.light }]}>
              <Text style={styles.summaryIcon}>◉</Text>
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryCount}>{quickTotals.settledCount}</Text>
              <Text style={styles.summaryLabel}>Settled</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.summaryIcon}>₹</Text>
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryCount, { fontSize: 13 }]} numberOfLines={1}>
                {formatCurrency(quickTotals.totalOutstanding, currency).replace(/\.\d{2}$/, '')}
              </Text>
              <Text style={styles.summaryLabel}>Outstanding</Text>
            </View>
          </View>
        </View>

        <Searchbar
          placeholder="Search by name, tags, or notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.text.tertiary}
          placeholderTextColor={colors.text.tertiary}
        />
        
        {/* Compact Horizontal Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterScroll}
        >
          {/* Status Group */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Status:</Text>
            <FilterChip
              active={filterStatus === 'all'}
              onPress={() => setFilterStatus('all')}
              label="All"
            />
            <FilterChip
              active={filterStatus === 'active'}
              onPress={() => setFilterStatus('active')}
              label="Active"
            />
            <FilterChip
              active={filterStatus === 'overdue'}
              onPress={() => setFilterStatus('overdue')}
              label="Overdue"
            />
            <FilterChip
              active={filterStatus === 'closed'}
              onPress={() => setFilterStatus('closed')}
              label="Settled"
            />
          </View>

          <View style={styles.filterGroupDivider} />

          {/* Type Group */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Type:</Text>
            <FilterChip
              active={filterRole === 'all'}
              onPress={() => setFilterRole('all')}
              label="All"
            />
            <FilterChip
              active={filterRole === 'lender'}
              onPress={() => setFilterRole('lender')}
              label="Lent"
            />
            <FilterChip
              active={filterRole === 'borrower'}
              onPress={() => setFilterRole('borrower')}
              label="Borrowed"
            />
          </View>

          <View style={styles.filterGroupDivider} />

          {/* Sort Group */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Sort:</Text>
            <FilterChip
              active={sortBy === 'date'}
              onPress={() => setSortBy('date')}
              label="Newest"
            />
            <FilterChip
              active={sortBy === 'amount'}
              onPress={() => setSortBy('amount')}
              label="Amount"
            />
            <FilterChip
              active={sortBy === 'dueDate'}
              onPress={() => setSortBy('dueDate')}
              label="Due Soon"
            />
          </View>
        </ScrollView>

        {/* Results Count */}
        {searchQuery || filterStatus !== 'all' || filterRole !== 'all' || sortBy !== 'date' ? (
          <View style={styles.resultsBar}>
            <Text style={styles.resultsText}>
              {filteredLoans.length} {filteredLoans.length === 1 ? 'loan' : 'loans'} found
            </Text>
            {(searchQuery || filterStatus !== 'all' || filterRole !== 'all' || sortBy !== 'date') && (
              <Button
                mode="text"
                onPress={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterRole('all');
                  setSortBy('date');
                }}
                labelStyle={styles.clearButtonLabel}
                textColor={colors.primary}
                compact
              >
                Clear all
              </Button>
            )}
          </View>
        ) : null}
      </View>

      {/* Loans List */}
      <FlatList
        data={filteredLoans}
        renderItem={renderLoanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchLoans}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery || filterStatus !== 'all' || filterRole !== 'all'
                ? 'No loans match your filters'
                : 'No loans yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus !== 'all' || filterRole !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Start tracking your loans with friends and family'}
            </Text>
            {!searchQuery && filterStatus === 'all' && filterRole === 'all' && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateLoan')}
                style={styles.emptyButton}
                buttonColor={colors.primary}
                labelStyle={styles.emptyButtonLabel}
              >
                Create Your First Loan
              </Button>
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLoan')}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

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
  
  // Header
  header: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    paddingTop: spacing.md,
    ...elevation.sm,
  },
  
  // Summary Row
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryCount: {
    ...typography.body.large,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    ...typography.caption.regular,
    color: colors.text.secondary,
    fontSize: 10,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.background.tertiary,
    marginHorizontal: spacing.xs,
  },
  
  searchBar: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    elevation: 0,
    marginBottom: spacing.lg,
  },
  searchInput: {
    ...typography.body.medium,
  },
  
  // Horizontal Filter Layout
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterScrollContent: {
    paddingRight: spacing.lg,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  filterGroupLabel: {
    ...typography.label.small,
    color: colors.text.tertiary,
    marginRight: spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filterGroupDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.background.tertiary,
    marginHorizontal: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.label.small,
    color: colors.text.secondary,
    fontSize: 12,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  
  // Old filter styles (kept for compatibility)
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  
  // Results Bar
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  resultsText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  clearButtonLabel: {
    ...typography.label.medium,
  },
  
  // List
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },
  
  // Loan Card
  loanCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  loanCardContent: {
    padding: spacing.lg,
  },
  
  // Header
  loanHeader: {
    marginBottom: spacing.md,
  },
  loanHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.heading.h4,
    color: colors.primary,
  },
  loanTitleSection: {
    flex: 1,
  },
  loanName: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  loanMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  // Role Badge
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  lentBadge: {
    backgroundColor: colors.semantic.success.light,
  },
  borrowedBadge: {
    backgroundColor: colors.semantic.info.light,
  },
  roleBadgeText: {
    ...typography.label.small,
    fontWeight: '600',
  },
  lentBadgeText: {
    color: colors.semantic.success.dark,
  },
  borrowedBadgeText: {
    color: colors.semantic.info.dark,
  },
  
  // Status
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.label.small,
    color: colors.text.tertiary,
  },
  
  // Progress Section
  progressSection: {
    marginBottom: spacing.md,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption.regular,
    color: colors.text.secondary,
    fontSize: 11,
  },
  progressPercentage: {
    ...typography.caption.regular,
    color: colors.text.secondary,
    fontWeight: '700',
    fontSize: 11,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  
  // Amount Section
  amountSection: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  amountValue: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...typography.caption.medium,
    color: colors.text.secondary,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.massive,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: borderRadius.md,
  },
  emptyButtonLabel: {
    ...typography.button.medium,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.text.inverse,
    fontWeight: '300',
  },
});