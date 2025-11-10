import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Loan, Repayment, DashboardMetrics, LoanCalculation } from '../types';
import { calculateLoanDetails, determineLoanStatus } from '../utils/calculations';
import { isDueWithinDays, isOverdue } from '../utils/dateUtils';
import { retryWithBackoff } from '../utils/errorHandler';

interface LoanState {
  loans: Loan[];
  repayments: Record<string, Repayment[]>;
  loading: boolean;
  dashboardMetrics: DashboardMetrics | null;
  
  // Actions
  fetchLoans: () => Promise<void>;
  fetchRepayments: (loanId: string) => Promise<void>;
  createLoan: (loan: Omit<Loan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Loan>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  createRepayment: (repayment: Omit<Repayment, 'id' | 'created_at'>) => Promise<void>;
  calculateDashboardMetrics: () => void;
  getLoanCalculation: (loanId: string) => LoanCalculation | null;
  subscribeToLoans: () => () => void;
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  repayments: {},
  loading: false,
  dashboardMetrics: null,

  fetchLoans: async () => {
    try {
      set({ loading: true });

      const data = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('loans')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      }, { maxRetries: 3, delayMs: 1000 });

      set({ loans: data || [] });
      get().calculateDashboardMetrics();
    } catch (error) {
      console.error('Error fetching loans:', error);
      // Keep existing loans on error
    } finally {
      set({ loading: false });
    }
  },

  fetchRepayments: async (loanId: string) => {
    try {
      const { data, error } = await supabase
        .from('repayments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      set((state) => ({
        repayments: {
          ...state.repayments,
          [loanId]: data || [],
        },
      }));
    } catch (error) {
      console.error('Error fetching repayments:', error);
    }
  },

  createLoan: async (loanData) => {
    try {
      set({ loading: true });
      console.log('📝 [LoanStore] Starting loan creation...');
      console.log('📋 [LoanStore] Loan data:', loanData);

      // Get current user
      console.log('👤 [LoanStore] Fetching current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      console.log('👤 [LoanStore] Current user:', user?.email || 'NOT FOUND');
      if (userError) {
        console.error('❌ [LoanStore] User fetch error:', userError);
      }

      if (!user) {
        const errorMsg = 'User not authenticated - session may have expired. Please log in again.';
        console.error('❌ [LoanStore]', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ [LoanStore] User authenticated:', user.id);
      console.log('📤 [LoanStore] Inserting loan with user_id:', user.id);

      const data = await retryWithBackoff(async () => {
        const insertData = { ...loanData, user_id: user.id };
        console.log('📤 [LoanStore] Insert payload:', insertData);

        const { data, error } = await supabase
          .from('loans')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          console.error('❌ [LoanStore] Insert error:', error);
          console.error('❌ [LoanStore] Error code:', error.code);
          console.error('❌ [LoanStore] Error message:', error.message);
          console.error('❌ [LoanStore] Error details:', error.details);
          throw error;
        }

        console.log('✅ [LoanStore] Insert successful:', data);
        return data;
      }, { maxRetries: 3, delayMs: 1000 });

      console.log('✅ [LoanStore] Loan created successfully:', data.id);

      set((state) => ({
        loans: [data, ...state.loans],
      }));

      get().calculateDashboardMetrics();
      return data;
    } catch (error: any) {
      console.error('❌ [LoanStore] Loan creation failed:', error);
      console.error('❌ [LoanStore] Error message:', error?.message);
      console.error('❌ [LoanStore] Error details:', error?.details);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateLoan: async (id: string, updates: Partial<Loan>) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        loans: state.loans.map((loan) =>
          loan.id === id ? { ...loan, ...updates } : loan
        ),
      }));
      
      get().calculateDashboardMetrics();
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteLoan: async (id: string) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        loans: state.loans.filter((loan) => loan.id !== id),
      }));
      
      get().calculateDashboardMetrics();
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createRepayment: async (repaymentData) => {
    try {
      set({ loading: true });

      const data = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('repayments')
          .insert([repaymentData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }, { maxRetries: 3, delayMs: 1000 });

      // Update local repayments
      set((state) => ({
        repayments: {
          ...state.repayments,
          [repaymentData.loan_id]: [
            data,
            ...(state.repayments[repaymentData.loan_id] || []),
          ],
        },
      }));

      // Recalculate loan status
      const loan = get().loans.find((l) => l.id === repaymentData.loan_id);
      if (loan) {
        const allRepayments = get().repayments[repaymentData.loan_id] || [];
        const calculation = calculateLoanDetails(loan, allRepayments);
        const newStatus = determineLoanStatus(loan, calculation.current_outstanding);

        if (newStatus !== loan.status) {
          await get().updateLoan(loan.id, { status: newStatus });
        }
      }

      get().calculateDashboardMetrics();
    } catch (error) {
      console.error('Error creating repayment:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateDashboardMetrics: () => {
    const { loans, repayments } = get();
    
    let totalLent = 0;
    let totalBorrowed = 0;
    const loansDue7Days: Loan[] = [];
    const loansDue30Days: Loan[] = [];
    const overdueLoans: Loan[] = [];

    loans.forEach((loan) => {
      const loanRepayments = repayments[loan.id] || [];
      const calculation = calculateLoanDetails(loan, loanRepayments);
      
      if (calculation.current_outstanding > 0) {
        if (loan.is_user_lender) {
          totalLent += calculation.current_outstanding;
        } else {
          totalBorrowed += calculation.current_outstanding;
        }

        if (isOverdue(loan.due_date)) {
          overdueLoans.push(loan);
        } else if (isDueWithinDays(loan.due_date, 7)) {
          loansDue7Days.push(loan);
        } else if (isDueWithinDays(loan.due_date, 30)) {
          loansDue30Days.push(loan);
        }
      }
    });

    set({
      dashboardMetrics: {
        total_lent: totalLent,
        total_borrowed: totalBorrowed,
        net_balance: totalLent - totalBorrowed,
        loans_due_7_days: loansDue7Days,
        loans_due_30_days: loansDue30Days,
        overdue_loans: overdueLoans,
      },
    });
  },

  getLoanCalculation: (loanId: string): LoanCalculation | null => {
    const { loans, repayments } = get();
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return null;

    const loanRepayments = repayments[loanId] || [];
    return calculateLoanDetails(loan, loanRepayments);
  },

  subscribeToLoans: () => {
    const channel = supabase
      .channel('loans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loans',
        },
        () => {
          get().fetchLoans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

