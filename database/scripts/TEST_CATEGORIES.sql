-- TEST IF EXPENSE CATEGORIES EXIST
-- Run this in Supabase SQL Editor to check current state

-- Check if table exists and has data
SELECT COUNT(*) as category_count FROM public.expense_categories;

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expense_categories' 
AND table_schema = 'public';

-- Check existing data
SELECT name, icon, color FROM public.expense_categories ORDER BY name;
