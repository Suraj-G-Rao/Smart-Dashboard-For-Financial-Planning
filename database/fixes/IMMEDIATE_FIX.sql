-- IMMEDIATE FIX FOR EXCESS SAVINGS ISSUE
-- Copy and paste these commands ONE BY ONE in Supabase SQL Editor

-- Step 1: Check if excess_savings column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name = 'excess_savings';

-- Step 2: Add the column if it doesn't exist
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS excess_savings DECIMAL(15,2) DEFAULT 0 CHECK (excess_savings >= 0);

-- Step 3: Update all existing loans to have excess_savings = 0
UPDATE public.loans 
SET excess_savings = 0 
WHERE excess_savings IS NULL;

-- Step 4: Check your current loan data
SELECT 
    id,
    loan_name, 
    monthly_emi, 
    excess_savings,
    outstanding_amount,
    status
FROM public.loans 
WHERE status = 'active';

-- Step 5: MANUALLY SET THE EXCESS SAVINGS FOR TESTING
-- Based on your income: ₹20,000 contribution - ₹9,964 EMI = ₹10,036 excess
UPDATE public.loans 
SET excess_savings = 10036
WHERE status = 'active' 
AND loan_name = 'CAR';

-- Step 6: Verify the update worked
SELECT 
    loan_name, 
    monthly_emi, 
    excess_savings,
    (excess_savings >= monthly_emi) as can_pay_extra_emi
FROM public.loans 
WHERE status = 'active';

-- Step 7: Check recent income entries to see if function was called
SELECT 
    id,
    amount,
    loan_contribution,
    date,
    created_at
FROM public.income 
WHERE loan_contribution > 0 
ORDER BY created_at DESC 
LIMIT 3;
