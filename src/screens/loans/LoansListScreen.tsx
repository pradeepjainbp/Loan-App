import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Button, Chip } from 'react-native-paper';
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
  const { loans, fetchLoans, loading } = useLoanStore();
  const { appUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'all'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'lender' | 'borrower'>('all');

  useEffect(() => {
    fetchLoans();
  }, []);

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';

  const filteredLoans = loans.filter((loan) => {
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
  });

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
                  {formatDate(item.due_date, dateFormat)}
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
        <Searchbar
          placeholder="Search by name, tags, or notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.text.tertiary}
          placeholderTextColor={colors.text.tertiary}
        />
        
        {/* Status Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.filterRow}>
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
        </View>

        {/* Role Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Type</Text>
          <View style={styles.filterRow}>
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
        </View>

        {/* Results Count */}
        {searchQuery || filterStatus !== 'all' || filterRole !== 'all' ? (
          <View style={styles.resultsBar}>
            <Text style={styles.resultsText}>
              {filteredLoans.length} {filteredLoans.length === 1 ? 'loan' : 'loans'} found
            </Text>
            {(searchQuery || filterStatus !== 'all' || filterRole !== 'all') && (
              <Button
                mode="text"
                onPress={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterRole('all');
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
  searchBar: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    elevation: 0,
    marginBottom: spacing.lg,
  },
  searchInput: {
    ...typography.body.medium,
  },
  
  // Filters
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
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.label.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
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
    fontSize: 64,
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