// Core type definitions for the Loan App

export type InterestType = 'none' | 'simple' | 'compound';
export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'yearly';
export type LoanStatus = 'active' | 'closed' | 'overdue';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'check' | 'other';
export type UserRole = 'lender' | 'borrower';
export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name: string;
  created_at: string;
  last_login?: string;
  settings: UserSettings;
}

export interface UserSettings {
  currency: Currency;
  date_format: DateFormat;
  default_interest_type: InterestType;
  default_compounding_frequency: CompoundingFrequency;
  default_reminder_days: number;
  notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface Loan {
  id: string;
  user_id: string;
  lender_name: string;
  borrower_name: string;
  principal_amount: number;
  start_date: string;
  due_date: string;
  interest_type: InterestType;
  interest_rate: number;
  compounding_frequency?: CompoundingFrequency;
  notes?: string;
  tags?: string[];
  status: LoanStatus;
  created_at: string;
  updated_at: string;
  is_user_lender: boolean; // true if logged-in user is the lender
}

export interface Repayment {
  id: string;
  loan_id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  notes?: string;
  created_at: string;
}

export type TransactionType = 'principal_increase' | 'principal_decrease' | 'payment' | 'interest_accrual';

export interface Transaction {
  id: string;
  loan_id: string;
  transaction_date: string;
  transaction_type: TransactionType;
  particulars: string; // Description of transaction
  principal_change: number; // Amount added/subtracted from principal
  interest_portion: number; // Interest portion of payment
  paid_amount: number; // Amount paid/received
  balance_after: number; // Outstanding balance after this transaction
  payment_method?: PaymentMethod;
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface Reminder {
  id: string;
  loan_id: string;
  user_id: string;
  enabled: boolean;
  advance_notice_days: number;
  recurring_for_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  loan_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface DashboardMetrics {
  total_lent: number;
  total_borrowed: number;
  net_balance: number;
  loans_due_7_days: Loan[];
  loans_due_30_days: Loan[];
  overdue_loans: Loan[];
}

export interface LoanCalculation {
  principal: number;
  interest_amount: number;
  total_amount_due: number;
  current_outstanding: number;
  total_repaid: number;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  loan_ids?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

