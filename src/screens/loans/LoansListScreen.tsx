import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Searchbar, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLoanStore } from '../../store/loanStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { Loan, LoanStatus } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoansListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { loans, fetchLoans, loading } = useLoanStore();
  const { appUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'all'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'lender' | 'borrower'>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const currency = appUser?.settings?.currency || 'USD';
  const dateFormat = appUser?.settings?.date_format || 'MM/DD/YYYY';

  const filteredLoans = loans.filter((loan) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      loan.lender_name.toLowerCase().includes(searchLower) ||
      loan.borrower_name.toLowerCase().includes(searchLower) ||
      loan.notes?.toLowerCase().includes(searchLower) ||
      loan.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus !== 'all' && loan.status !== filterStatus) {
      return false;
    }

    // Role filter
    if (filterRole === 'lender' && !loan.is_user_lender) {
      return false;
    }
    if (filterRole === 'borrower' && loan.is_user_lender) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'overdue':
        return '#f44336';
      case 'closed':
        return '#9e9e9e';
      default:
        return '#666';
    }
  };

  const renderLoanItem = ({ item }: { item: Loan }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('LoanDetail', { loanId: item.id })}
    >
      <Card style={styles.loanCard}>
        <Card.Content>
          <View style={styles.loanHeader}>
            <View style={styles.loanTitleContainer}>
              <Text style={styles.loanName}>
                {item.is_user_lender ? item.borrower_name : item.lender_name}
              </Text>
              <Chip
                style={[
                  styles.roleChip,
                  { backgroundColor: item.is_user_lender ? '#e8f5e9' : '#ffebee' },
                ]}
                textStyle={{ fontSize: 12 }}
              >
                {item.is_user_lender ? 'Lent' : 'Borrowed'}
              </Chip>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={{ color: '#fff', fontSize: 12 }}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.loanDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(item.principal_amount, currency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(item.due_date, dateFormat)}
              </Text>
            </View>
            {item.interest_type !== 'none' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest:</Text>
                <Text style={styles.detailValue}>
                  {item.interest_rate}% ({item.interest_type})
                </Text>
              </View>
            )}
          </View>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <Chip key={index} style={styles.tag} textStyle={{ fontSize: 11 }}>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search loans..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.filterContainer}>
          <Button
            mode={filterStatus === 'all' ? 'contained' : 'outlined'}
            onPress={() => setFilterStatus('all')}
            style={styles.filterButton}
            compact
          >
            All
          </Button>
          <Button
            mode={filterStatus === 'active' ? 'contained' : 'outlined'}
            onPress={() => setFilterStatus('active')}
            style={styles.filterButton}
            compact
          >
            Active
          </Button>
          <Button
            mode={filterStatus === 'overdue' ? 'contained' : 'outlined'}
            onPress={() => setFilterStatus('overdue')}
            style={styles.filterButton}
            compact
          >
            Overdue
          </Button>
          <Button
            mode={filterStatus === 'closed' ? 'contained' : 'outlined'}
            onPress={() => setFilterStatus('closed')}
            style={styles.filterButton}
            compact
          >
            Closed
          </Button>
        </View>

        <View style={styles.filterContainer}>
          <Button
            mode={filterRole === 'all' ? 'contained' : 'outlined'}
            onPress={() => setFilterRole('all')}
            style={styles.filterButton}
            compact
          >
            All
          </Button>
          <Button
            mode={filterRole === 'lender' ? 'contained' : 'outlined'}
            onPress={() => setFilterRole('lender')}
            style={styles.filterButton}
            compact
          >
            Lent
          </Button>
          <Button
            mode={filterRole === 'borrower' ? 'contained' : 'outlined'}
            onPress={() => setFilterRole('borrower')}
            style={styles.filterButton}
            compact
          >
            Borrowed
          </Button>
        </View>
      </View>

      <FlatList
        data={filteredLoans}
        renderItem={renderLoanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchLoans}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No loans found</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateLoan')}
              style={styles.createButton}
            >
              Create Your First Loan
            </Button>
          </View>
        }
      />

      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateLoan')}
        style={styles.fab}
        icon="plus"
      >
        Add Loan
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 8,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  loanCard: {
    marginBottom: 12,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loanName: {
    fontSize: 18,
    fontWeight: '600',
  },
  roleChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  loanDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    height: 24,
    backgroundColor: '#e3f2fd',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

