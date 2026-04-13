-- Fix for Excess Savings Issue
-- Run these commands in your Supabase SQL Editor

-- 1. Add excess_savings column if it doesn't exist
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS excess_savings DECIMAL(15,2) DEFAULT 0 CHECK (excess_savings >= 0);

-- 2. Update existing loans to have excess_savings = 0 if NULL
UPDATE public.loans 
SET excess_savings = 0 
WHERE excess_savings IS NULL;

-- 3. Check if the column exists and has data
SELECT loan_name, monthly_emi, excess_savings 
FROM public.loans 
WHERE status = 'active';

-- 4. Test the loan contribution function
-- (Replace the UUIDs with actual values from your database)
-- SELECT public.process_income_contributions('your-income-id-here');

-- 5. Manually set excess savings for testing (optional)
-- UPDATE public.loans 
-- SET excess_savings = 5054 
-- WHERE loan_name = 'Your Loan Name';
