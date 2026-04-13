-- FINANCIAL REPORTS SETUP
-- Run this in Supabase SQL Editor to set up the reports feature

-- Create financial_reports table
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'monthly', 'tax', 'custom'
    period VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_financial_reports_user_id ON public.financial_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_created_at ON public.financial_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own reports
CREATE POLICY "Users can view own reports"
    ON public.financial_reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports"
    ON public.financial_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports"
    ON public.financial_reports
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.financial_reports TO authenticated;

-- Verify the table
SELECT * FROM public.financial_reports LIMIT 5;
