import { differenceInDays, parseISO } from 'date-fns';
import { InterestType, CompoundingFrequency, Loan, Repayment, LoanCalculation, LoanStatus } from '../types';

/**
 * Calculate simple interest
 * Formula: Interest = Principal × Rate × Time
 * @param principal - Principal amount
 * @param rate - Annual interest rate (as percentage, e.g., 5 for 5%)
 * @param startDate - Loan start date
 * @param endDate - Calculation end date (usually current date or due date)
 * @returns Interest amount
 */
export function calculateSimpleInterest(
  principal: number,
  rate: number,
  startDate: string,
  endDate: string
): number {
  const days = differenceInDays(parseISO(endDate), parseISO(startDate));
  const years = days / 365; // Using actual/365 day count convention
  const interest = principal * (rate / 100) * years;
  return Math.round(interest * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate compound interest
 * Formula: A = P(1 + r/n)^(nt)
 * @param principal - Principal amount
 * @param rate - Annual interest rate (as percentage)
 * @param startDate - Loan start date
 * @param endDate - Calculation end date
 * @param frequency - Compounding frequency
 * @returns Interest amount
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  startDate: string,
  endDate: string,
  frequency: CompoundingFrequency
): number {
  const days = differenceInDays(parseISO(endDate), parseISO(startDate));
  const years = days / 365;
  
  // Determine compounding periods per year
  const n = getCompoundingPeriodsPerYear(frequency);
  
  // Calculate compound interest: A = P(1 + r/n)^(nt)
  const rateDecimal = rate / 100;
  const amount = principal * Math.pow(1 + rateDecimal / n, n * years);
  const interest = amount - principal;
  
  return Math.round(interest * 100) / 100;
}

/**
 * Get number of compounding periods per year
 */
function getCompoundingPeriodsPerYear(frequency: CompoundingFrequency): number {
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
 * Calculate total interest for a loan as of a specific date
 */
export function calculateLoanInterest(
  loan: Loan,
  asOfDate: string = new Date().toISOString()
): number {
  if (loan.interest_type === 'none') {
    return 0;
  }
  
  if (loan.interest_type === 'simple') {
    return calculateSimpleInterest(
      loan.principal_amount,
      loan.interest_rate,
      loan.start_date,
      asOfDate
    );
  }
  
  if (loan.interest_type === 'compound' && loan.compounding_frequency) {
    return calculateCompoundInterest(
      loan.principal_amount,
      loan.interest_rate,
      loan.start_date,
      asOfDate,
      loan.compounding_frequency
    );
  }
  
  return 0;
}

/**
 * Calculate complete loan details including repayments
 */
export function calculateLoanDetails(
  loan: Loan,
  repayments: Repayment[]
): LoanCalculation {
  const totalRepaid = repayments.reduce((sum, r) => sum + r.payment_amount, 0);
  const interestAmount = calculateLoanInterest(loan);
  const totalAmountDue = loan.principal_amount + interestAmount;
  const currentOutstanding = Math.max(0, totalAmountDue - totalRepaid);
  
  return {
    principal: loan.principal_amount,
    interest_amount: interestAmount,
    total_amount_due: totalAmountDue,
    current_outstanding: currentOutstanding,
    total_repaid: totalRepaid,
  };
}

/**
 * Determine loan status based on dates and outstanding balance
 */
export function determineLoanStatus(
  loan: Loan,
  currentOutstanding: number
): LoanStatus {
  if (currentOutstanding <= 0) {
    return 'closed';
  }
  
  // If no due date, loan is active as long as there's outstanding balance
  if (!loan.due_date) {
    return 'active';
  }
  
  const today = new Date();
  const dueDate = parseISO(loan.due_date);
  
  if (today > dueDate) {
    return 'overdue';
  }
  
  return 'active';
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate loan input data
 */
export function validateLoanData(data: Partial<Loan>): string[] {
  const errors: string[] = [];
  
  if (!data.lender_name || data.lender_name.trim() === '') {
    errors.push('Lender name is required');
  }
  
  if (!data.borrower_name || data.borrower_name.trim() === '') {
    errors.push('Borrower name is required');
  }
  
  if (!data.principal_amount || data.principal_amount <= 0) {
    errors.push('Principal amount must be greater than 0');
  }
  
  if (data.principal_amount && data.principal_amount > 1000000000) {
    errors.push('Principal amount exceeds maximum allowed value');
  }
  
  if (!data.start_date) {
    errors.push('Start date is required');
  }
  
  if (data.start_date && data.due_date) {
    const start = parseISO(data.start_date);
    const due = parseISO(data.due_date);
    if (due < start) {
      errors.push('Due date must be on or after start date');
    }
  }
  
  if (data.interest_type !== 'none' && (!data.interest_rate || data.interest_rate < 0 || data.interest_rate > 100)) {
    errors.push('Interest rate must be between 0 and 100');
  }
  
  if (data.interest_type === 'compound' && !data.compounding_frequency) {
    errors.push('Compounding frequency is required for compound interest');
  }
  
  return errors;
}

/**
 * Validate repayment data
 */
export function validateRepaymentData(
  data: Partial<Repayment>,
  loan: Loan,
  currentOutstanding: number
): string[] {
  const errors: string[] = [];
  
  if (!data.payment_amount || data.payment_amount <= 0) {
    errors.push('Payment amount must be greater than 0');
  }
  
  if (data.payment_amount && data.payment_amount > currentOutstanding * 1.1) {
    errors.push('Payment amount significantly exceeds outstanding balance');
  }
  
  if (!data.payment_date) {
    errors.push('Payment date is required');
  }
  
  if (data.payment_date) {
    const paymentDate = parseISO(data.payment_date);
    const startDate = parseISO(loan.start_date);
    if (paymentDate < startDate) {
      errors.push('Payment date cannot be before loan start date');
    }
  }
  
  if (!data.payment_method) {
    errors.push('Payment method is required');
  }
  
  return errors;
}

