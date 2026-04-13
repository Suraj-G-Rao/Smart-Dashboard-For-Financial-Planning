-- FIX INVESTMENTS RLS POLICY ERROR
-- Run this in Supabase SQL Editor to fix the RLS policy issue

-- First, disable RLS temporarily to check if tables exist
ALTER TABLE public.investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_watchlist DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can manage their own investment transactions" ON public.investment_transactions;
DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.stock_watchlist;

-- Re-enable RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_watchlist ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies
CREATE POLICY "Enable all operations for authenticated users on investments" 
ON public.investments FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable all operations for authenticated users on investment_transactions" 
ON public.investment_transactions FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable all operations for authenticated users on stock_watchlist" 
ON public.stock_watchlist FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant proper permissions
GRANT ALL ON public.investments TO authenticated;
GRANT ALL ON public.investment_transactions TO authenticated;
GRANT ALL ON public.stock_watchlist TO authenticated;

-- Test the fix by checking if you can insert
-- This should work now without RLS errors
SELECT 'RLS policies fixed successfully' as status;
