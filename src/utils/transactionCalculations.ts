import { Loan, Transaction } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Calculate current outstanding balance based on all transactions
 * This is the flexible calculation that accounts for principal changes
 */
export function calculateOutstandingBalance(
  loan: Loan,
  transactions: Transaction[]
): number {
  if (transactions.length === 0) {
    // No transactions yet, return original principal
    return loan.principal_amount;
  }

  // Get the most recent transaction's balance
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  return Math.max(0, sortedTransactions[0].balance_after);
}

/**
 * Calculate current principal based on all transactions
 * Principal can increase (lender adds more) or decrease (borrower pays principal)
 */
export function calculateCurrentPrincipal(
  loan: Loan,
  transactions: Transaction[]
): number {
  let currentPrincipal = loan.principal_amount;

  // Apply all principal changes in chronological order
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  sortedTransactions.forEach((tx) => {
    if (tx.transaction_type === 'principal_increase') {
      currentPrincipal += tx.principal_change;
    } else if (tx.transaction_type === 'principal_decrease') {
      currentPrincipal -= tx.principal_change;
    }
  });

  return Math.max(0, currentPrincipal);
}

/**
 * Calculate total interest accrued based on transactions
 */
export function calculateTotalInterestAccrued(transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.transaction_type === 'interest_accrual')
    .reduce((sum, tx) => sum + tx.interest_portion, 0);
}

/**
 * Calculate total paid by borrower
 */
export function calculateTotalPaid(transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.transaction_type === 'payment')
    .reduce((sum, tx) => sum + tx.paid_amount, 0);
}

/**
 * Calculate interest accrued up to a specific date
 */
export function calculateInterestUpToDate(
  loan: Loan,
  currentPrincipal: number,
  upToDate: string = new Date().toISOString()
): number {
  if (loan.interest_type === 'none') {
    return 0;
  }

  const days = differenceInDays(parseISO(upToDate), parseISO(loan.start_date));
  const years = days / 365;

  if (loan.interest_type === 'simple') {
    return currentPrincipal * (loan.interest_rate / 100) * years;
  }

  if (loan.interest_type === 'compound' && loan.compounding_frequency) {
    const n = getCompoundingPeriodsPerYear(loan.compounding_frequency);
    const rateDecimal = loan.interest_rate / 100;
    const amount = currentPrincipal * Math.pow(1 + rateDecimal / n, n * years);
    return amount - currentPrincipal;
  }

  return 0;
}

function getCompoundingPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'daily':
      return 365;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'yearly':
      return 1;
    default:
      return 12;
  }
}

/**
 * Get transaction summary for display
 */
export interface TransactionSummary {
  currentPrincipal: number;
  totalInterestAccrued: number;
  totalPaid: number;
  outstandingBalance: number;
  principalOutstanding: number;
  interestOutstanding: number;
}

export function getTransactionSummary(
  loan: Loan,
  transactions: Transaction[]
): TransactionSummary {
  const currentPrincipal = calculateCurrentPrincipal(loan, transactions);
  const totalInterestAccrued = calculateTotalInterestAccrued(transactions);
  const totalPaid = calculateTotalPaid(transactions);
  const outstandingBalance = calculateOutstandingBalance(loan, transactions);

  // Calculate how much of the outstanding is principal vs interest
  const totalDue = currentPrincipal + totalInterestAccrued;
  const principalOutstanding = Math.max(0, currentPrincipal - (totalPaid - totalInterestAccrued));
  const interestOutstanding = Math.max(0, totalDue - totalPaid);

  return {
    currentPrincipal,
    totalInterestAccrued,
    totalPaid,
    outstandingBalance,
    principalOutstanding,
    interestOutstanding,
  };
}

