-- Add missing transactions table and related components
-- Run this SQL if you already have other tables but missing transactions

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('principal_increase', 'principal_decrease', 'payment', 'interest_accrual')),
  particulars TEXT NOT NULL,
  principal_change DECIMAL(15, 2) DEFAULT 0,
  interest_portion DECIMAL(15, 2) DEFAULT 0,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  balance_after DECIMAL(15, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'upi', 'check', 'other', NULL)),
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_loan_id ON public.transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view transactions for own loans" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert transactions for own loans" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions for own loans" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions for own loans" ON public.transactions;

-- Create RLS Policies
CREATE POLICY "Users can view transactions for own loans"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = transactions.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transactions for own loans"
  ON public.transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions for own loans"
  ON public.transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = transactions.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions for own loans"
  ON public.transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = transactions.loan_id
      AND loans.user_id = auth.uid()
    )
  );
