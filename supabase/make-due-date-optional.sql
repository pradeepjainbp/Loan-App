-- Make due_date optional for loans table
-- Run this to allow NULL due_date for informal loans between friends/family

-- Remove the NOT NULL constraint from due_date
ALTER TABLE public.loans ALTER COLUMN due_date DROP NOT NULL;

-- Drop the constraint that requires due_date to be after start_date
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS due_date_after_start_date;

-- Add a new constraint that only checks if due_date is provided
ALTER TABLE public.loans ADD CONSTRAINT due_date_after_start_date_if_exists 
  CHECK (due_date IS NULL OR due_date >= start_date);
