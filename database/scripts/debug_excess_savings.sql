-- Debug Excess Savings Issue
-- Run these queries in Supabase SQL Editor to debug

-- 1. Check if excess_savings column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name = 'excess_savings';

-- 2. Check current loan data
SELECT 
    id,
    loan_name,
    monthly_emi,
    excess_savings,
    created_at,
    updated_at
FROM public.loans 
WHERE status = 'active'
ORDER BY created_at DESC;

-- 3. Check recent income entries with loan contributions
SELECT 
    i.id,
    i.amount,
    i.loan_contribution,
    i.date,
    i.created_at
FROM public.income i
WHERE i.loan_contribution > 0
ORDER BY i.created_at DESC
LIMIT 5;

-- 4. Check if loan payments were created
SELECT 
    lp.loan_id,
    l.loan_name,
    lp.payment_amount,
    lp.payment_date,
    lp.created_at
FROM public.loan_payments lp
JOIN public.loans l ON lp.loan_id = l.id
ORDER BY lp.created_at DESC
LIMIT 5;

-- 5. Manually test the function (replace with actual income ID)
-- SELECT public.process_income_contributions('replace-with-actual-income-id');

-- 6. If you want to manually set excess savings for testing:
-- UPDATE public.loans 
-- SET excess_savings = 5054 
-- WHERE loan_name = 'Your Loan Name' AND status = 'active';
