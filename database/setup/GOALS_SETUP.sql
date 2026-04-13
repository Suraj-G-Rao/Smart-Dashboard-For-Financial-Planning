-- ============================================
-- Goals Feature - Additional SQL Setup
-- ============================================
-- This file contains additional SQL queries for the Goals feature
-- The main goals table already exists in schema.sql
-- ============================================

-- Ensure the goals table has all required columns
-- (This is safe to run even if columns already exist)
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS monthly_sip_required numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS on_track boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for goals table
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate goal progress
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id uuid)
RETURNS numeric AS $$
DECLARE
    target_amt numeric;
    saved_amt numeric;
    progress numeric;
BEGIN
    SELECT target_amount, COALESCE(saved_amount, 0)
    INTO target_amt, saved_amt
    FROM goals
    WHERE id = goal_id;
    
    IF target_amt = 0 THEN
        RETURN 0;
    END IF;
    
    progress := (saved_amt / target_amt) * 100;
    RETURN LEAST(progress, 100);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate months remaining for a goal
CREATE OR REPLACE FUNCTION calculate_months_remaining(target_date date)
RETURNS integer AS $$
DECLARE
    months_left integer;
BEGIN
    months_left := EXTRACT(YEAR FROM AGE(target_date, CURRENT_DATE)) * 12 + 
                   EXTRACT(MONTH FROM AGE(target_date, CURRENT_DATE));
    RETURN GREATEST(months_left, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate required monthly SIP
CREATE OR REPLACE FUNCTION calculate_monthly_sip(
    target_amount numeric,
    saved_amount numeric,
    target_date date
)
RETURNS numeric AS $$
DECLARE
    remaining_amount numeric;
    months_left integer;
    monthly_sip numeric;
BEGIN
    remaining_amount := target_amount - COALESCE(saved_amount, 0);
    months_left := calculate_months_remaining(target_date);
    
    IF months_left <= 0 THEN
        RETURN remaining_amount; -- Need to save all remaining amount immediately
    END IF;
    
    monthly_sip := remaining_amount / months_left;
    RETURN GREATEST(monthly_sip, 0);
END;
$$ LANGUAGE plpgsql;

-- Create view for goal analytics
CREATE OR REPLACE VIEW goal_analytics AS
SELECT 
    g.*,
    calculate_goal_progress(g.id) as progress_percentage,
    calculate_months_remaining(g.target_date) as months_remaining,
    calculate_monthly_sip(g.target_amount, g.saved_amount, g.target_date) as calculated_monthly_sip,
    CASE 
        WHEN g.saved_amount >= g.target_amount THEN 'Completed'
        WHEN g.target_date < CURRENT_DATE AND g.saved_amount < g.target_amount THEN 'Overdue'
        WHEN calculate_monthly_sip(g.target_amount, g.saved_amount, g.target_date) <= COALESCE(g.monthly_sip_required, 0) THEN 'On Track'
        ELSE 'Behind Schedule'
    END as goal_status
FROM goals g;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_priority ON goals(user_id, priority, target_date);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(user_id, target_date);

-- Sample data for testing (optional - remove in production)
-- INSERT INTO goals (user_id, name, target_amount, target_date, saved_amount, priority, monthly_sip_required, description, category)
-- VALUES 
--     (auth.uid(), 'Emergency Fund', 600000, '2024-12-31', 420000, 1, 15000, '6 months of expenses', 'Emergency'),
--     (auth.uid(), 'House Down Payment', 2000000, '2026-06-30', 500000, 1, 45000, 'Down payment for new home', 'Real Estate'),
--     (auth.uid(), 'Retirement Fund', 10000000, '2044-12-31', 1800000, 2, 15000, 'Long-term retirement savings', 'Retirement'),
--     (auth.uid(), 'Europe Vacation', 300000, '2025-07-01', 80000, 3, 12000, 'Family vacation to Europe', 'Travel');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON goals TO authenticated;
GRANT SELECT ON goal_analytics TO authenticated;
