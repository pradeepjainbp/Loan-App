-- Loan App Database Schema for Supabase
-- This file contains all the SQL needed to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{
    "currency": "USD",
    "date_format": "MM/DD/YYYY",
    "default_interest_type": "none",
    "default_compounding_frequency": "monthly",
    "default_reminder_days": 7,
    "notifications_enabled": true,
    "email_notifications_enabled": true,
    "theme": "system"
  }'::jsonb
);

-- Loans table
CREATE TABLE public.loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lender_name TEXT NOT NULL,
  borrower_name TEXT NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL CHECK (principal_amount > 0),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('none', 'simple', 'compound')),
  interest_rate DECIMAL(5, 2) DEFAULT 0 CHECK (interest_rate >= 0 AND interest_rate <= 100),
  compounding_frequency TEXT CHECK (compounding_frequency IN ('daily', 'monthly', 'quarterly', 'yearly')),
  notes TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'overdue')),
  is_user_lender BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT due_date_after_start_date CHECK (due_date >= start_date)
);

-- Repayments table
CREATE TABLE public.repayments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  payment_amount DECIMAL(15, 2) NOT NULL CHECK (payment_amount > 0),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'upi', 'check', 'other')),
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE public.reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  advance_notice_days INTEGER DEFAULT 7 CHECK (advance_notice_days > 0),
  recurring_for_overdue BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loan_id)
);

-- Attachments table
CREATE TABLE public.attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size <= 5242880), -- 5MB max
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_due_date ON public.loans(due_date);
CREATE INDEX idx_loans_created_at ON public.loans(created_at);
CREATE INDEX idx_repayments_loan_id ON public.repayments(loan_id);
CREATE INDEX idx_repayments_payment_date ON public.repayments(payment_date);
CREATE INDEX idx_reminders_loan_id ON public.reminders(loan_id);
CREATE INDEX idx_attachments_loan_id ON public.attachments(loan_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for loans table
CREATE POLICY "Users can view own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON public.loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans"
  ON public.loans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for repayments table
CREATE POLICY "Users can view repayments for own loans"
  ON public.repayments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = repayments.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert repayments for own loans"
  ON public.repayments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update repayments for own loans"
  ON public.repayments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = repayments.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete repayments for own loans"
  ON public.repayments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = repayments.loan_id
      AND loans.user_id = auth.uid()
    )
  );

-- RLS Policies for reminders table
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for attachments table
CREATE POLICY "Users can view attachments for own loans"
  ON public.attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = attachments.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for own loans"
  ON public.attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments for own loans"
  ON public.attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = attachments.loan_id
      AND loans.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

