-- FIX EXPENSE CATEGORIES TABLE AND DATA
-- Run this in Supabase SQL Editor to fix the expense categories issue

-- First, add the missing color column if it doesn't exist
ALTER TABLE public.expense_categories 
ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- Clear existing categories to avoid conflicts
DELETE FROM public.expense_categories;

-- Insert expense categories with proper data
INSERT INTO public.expense_categories (name, icon, color) VALUES
('Food & Dining', '🍽️', '#ef4444'),
('Transportation', '🚗', '#f97316'),
('Shopping', '🛍️', '#eab308'),
('Entertainment', '🎬', '#22c55e'),
('Bills & Utilities', '💡', '#3b82f6'),
('Healthcare', '🏥', '#a855f7'),
('Education', '📚', '#06b6d4'),
('Travel', '✈️', '#f59e0b'),
('Personal Care', '💄', '#ec4899'),
('Home & Garden', '🏠', '#10b981'),
('Insurance', '🛡️', '#6366f1'),
('Taxes', '📊', '#8b5cf6'),
('Investments', '📈', '#059669'),
('Gifts & Donations', '🎁', '#dc2626'),
('Other', '📝', '#6b7280');

-- Grant proper permissions
GRANT SELECT ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO authenticated;

-- Verify the data
SELECT name, icon, color FROM public.expense_categories ORDER BY name;
