-- Complete Database Schema for Finance Management System
-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.income CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.emergency_fund CASCADE;
DROP TABLE IF EXISTS public.credit_card_payments CASCADE;

-- Income Table
CREATE TABLE public.income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(50) NOT NULL DEFAULT 'salary',
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    emergency_fund_contribution DECIMAL(15,2) DEFAULT 0 CHECK (emergency_fund_contribution >= 0),
    credit_card_contribution DECIMAL(15,2) DEFAULT 0 CHECK (credit_card_contribution >= 0),
    loan_contribution DECIMAL(15,2) DEFAULT 0 CHECK (loan_contribution >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    description TEXT NOT NULL,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- 'monthly', 'weekly', 'yearly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    loan_name VARCHAR(100) NOT NULL,
    loan_type VARCHAR(50) NOT NULL, -- 'personal', 'home', 'car', 'education', 'business'
    principal_amount DECIMAL(15,2) NOT NULL CHECK (principal_amount > 0),
    outstanding_amount DECIMAL(15,2) NOT NULL CHECK (outstanding_amount >= 0),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
    monthly_emi DECIMAL(15,2) NOT NULL CHECK (monthly_emi > 0),
    tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
    remaining_months INTEGER NOT NULL CHECK (remaining_months >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    lender_name VARCHAR(100) NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'defaulted')),
    next_payment_date DATE NOT NULL,
    excess_savings DECIMAL(15,2) DEFAULT 0 CHECK (excess_savings >= 0), -- Track excess contributions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Fund Table
CREATE TABLE public.emergency_fund (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_balance DECIMAL(15,2) DEFAULT 0 CHECK (current_balance >= 0),
    monthly_target DECIMAL(15,2) DEFAULT 0 CHECK (monthly_target >= 0),
    months_covered DECIMAL(4,1) DEFAULT 0 CHECK (months_covered >= 0),
    goal_description TEXT,
    is_linked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One emergency fund per user
);

-- Credit Card Payments Table (for tracking automatic contributions)
CREATE TABLE public.credit_card_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credit_card_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL CHECK (payment_amount > 0),
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    priority_score INTEGER DEFAULT 0, -- Higher score = higher priority
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Card Transactions Table (for contribution tracking)
CREATE TABLE public.credit_card_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credit_card_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    income_id UUID REFERENCES public.income(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(20) DEFAULT 'contribution' CHECK (transaction_type IN ('contribution', 'payment', 'adjustment')),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Payments Table (for tracking EMI payments)
CREATE TABLE public.loan_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL CHECK (payment_amount > 0),
    principal_amount DECIMAL(15,2) NOT NULL CHECK (principal_amount >= 0),
    interest_amount DECIMAL(15,2) NOT NULL CHECK (interest_amount >= 0),
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Fund Transactions Table
CREATE TABLE public.emergency_fund_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emergency_fund_id UUID REFERENCES public.emergency_fund(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    source VARCHAR(50), -- 'income_contribution', 'manual', 'interest'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_income_user_date ON public.income(user_id, date DESC);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON public.expenses(user_id, category);
CREATE INDEX idx_loans_user_status ON public.loans(user_id, status);
CREATE INDEX idx_emergency_fund_user ON public.emergency_fund(user_id);
CREATE INDEX idx_credit_card_payments_due ON public.credit_card_payments(user_id, due_date);
CREATE INDEX idx_loan_payments_loan ON public.loan_payments(loan_id, payment_date DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_fund_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Income policies
CREATE POLICY "Users can view own income" ON public.income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income" ON public.income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income" ON public.income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income" ON public.income FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Loans policies
CREATE POLICY "Users can view own loans" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON public.loans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own loans" ON public.loans FOR DELETE USING (auth.uid() = user_id);

-- Emergency fund policies
CREATE POLICY "Users can view own emergency fund" ON public.emergency_fund FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency fund" ON public.emergency_fund FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency fund" ON public.emergency_fund FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency fund" ON public.emergency_fund FOR DELETE USING (auth.uid() = user_id);

-- Credit card payments policies
CREATE POLICY "Users can view own credit card payments" ON public.credit_card_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credit card payments" ON public.credit_card_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credit card payments" ON public.credit_card_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credit card payments" ON public.credit_card_payments FOR DELETE USING (auth.uid() = user_id);

-- Loan payments policies (linked through loan)
CREATE POLICY "Users can view own loan payments" ON public.loan_payments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));
CREATE POLICY "Users can insert own loan payments" ON public.loan_payments FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));
CREATE POLICY "Users can update own loan payments" ON public.loan_payments FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));
CREATE POLICY "Users can delete own loan payments" ON public.loan_payments FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));

-- Emergency fund transactions policies
CREATE POLICY "Users can view own emergency fund transactions" ON public.emergency_fund_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency fund transactions" ON public.emergency_fund_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency fund transactions" ON public.emergency_fund_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency fund transactions" ON public.emergency_fund_transactions FOR DELETE USING (auth.uid() = user_id);

-- Functions for calculations and automation

-- Function to update emergency fund balance
CREATE OR REPLACE FUNCTION public.update_emergency_fund_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.emergency_fund 
        SET current_balance = current_balance + 
            CASE WHEN NEW.transaction_type = 'deposit' THEN NEW.amount ELSE -NEW.amount END,
            updated_at = NOW()
        WHERE id = NEW.emergency_fund_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.emergency_fund 
        SET current_balance = current_balance - 
            CASE WHEN OLD.transaction_type = 'deposit' THEN OLD.amount ELSE -OLD.amount END,
            updated_at = NOW()
        WHERE id = OLD.emergency_fund_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for emergency fund balance updates
CREATE TRIGGER trigger_update_emergency_fund_balance
    AFTER INSERT OR DELETE ON public.emergency_fund_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_emergency_fund_balance();

-- Function to calculate loan priority for credit card payments
CREATE OR REPLACE FUNCTION public.calculate_payment_priority(
    p_due_date DATE,
    p_amount DECIMAL,
    p_card_limit DECIMAL DEFAULT 100000
)
RETURNS INTEGER AS $$
DECLARE
    days_until_due INTEGER;
    priority_score INTEGER;
BEGIN
    days_until_due := p_due_date - CURRENT_DATE;
    
    -- Base priority on urgency (days until due)
    priority_score := CASE 
        WHEN days_until_due <= 0 THEN 100  -- Overdue
        WHEN days_until_due <= 3 THEN 90   -- Very urgent
        WHEN days_until_due <= 7 THEN 70   -- Urgent
        WHEN days_until_due <= 15 THEN 50  -- Moderate
        ELSE 30                            -- Low urgency
    END;
    
    -- Add weight based on amount (higher amounts get higher priority)
    priority_score := priority_score + LEAST(FLOOR(p_amount / 1000), 20);
    
    RETURN priority_score;
END;
$$ LANGUAGE plpgsql;

-- Function to process income and distribute contributions
CREATE OR REPLACE FUNCTION public.process_income_contributions(
    p_income_id UUID
)
RETURNS VOID AS $$
DECLARE
    income_rec RECORD;
    emergency_fund_rec RECORD;
    card_rec RECORD;
    loan_rec RECORD;
    remaining_loan_contribution DECIMAL(15,2);
BEGIN
    -- Get income details
    SELECT * INTO income_rec FROM public.income WHERE id = p_income_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Income record not found';
    END IF;
    
    -- Process emergency fund contribution
    IF income_rec.emergency_fund_contribution > 0 THEN
        -- Get or create emergency fund
        SELECT * INTO emergency_fund_rec 
        FROM public.emergency_fund 
        WHERE user_id = income_rec.user_id;
        
        IF FOUND THEN
            -- Add transaction to emergency fund
            INSERT INTO public.emergency_fund_transactions (
                user_id, emergency_fund_id, amount, transaction_type, 
                date, description, source
            ) VALUES (
                income_rec.user_id, emergency_fund_rec.id, 
                income_rec.emergency_fund_contribution, 'deposit',
                income_rec.date, 'Automatic contribution from income', 'income_contribution'
            );
        END IF;
    END IF;
    
    -- Process credit card contribution (will be handled by specific card selection in frontend)
    -- This is now handled by the new credit_card_contribution_with_selection function
    
    -- Process loan contribution
    IF income_rec.loan_contribution > 0 THEN
        remaining_loan_contribution := income_rec.loan_contribution;
        
        -- Find loans ordered by priority (highest interest rate first, then by due date)
        FOR loan_rec IN 
            SELECT l.* FROM public.loans l
            WHERE l.user_id = income_rec.user_id 
            AND l.status = 'active'
            AND l.outstanding_amount > 0
            ORDER BY l.interest_rate DESC, l.next_payment_date ASC
        LOOP
            EXIT WHEN remaining_loan_contribution <= 0;
            
            -- Calculate how much to pay towards this loan
            DECLARE
                payment_amount DECIMAL(15,2);
                monthly_rate DECIMAL(10,6);
                interest_component DECIMAL(15,2);
                principal_component DECIMAL(15,2);
                excess_amount DECIMAL(15,2);
            BEGIN
                -- If contribution is more than EMI, pay EMI and save excess
                IF remaining_loan_contribution >= loan_rec.monthly_emi THEN
                    payment_amount := loan_rec.monthly_emi;
                    excess_amount := remaining_loan_contribution - loan_rec.monthly_emi;
                    
                    -- Add excess to loan savings
                    UPDATE public.loans 
                    SET excess_savings = excess_savings + excess_amount
                    WHERE id = loan_rec.id;
                    
                    -- Return excess to account
                    PERFORM public.update_account_balance(income_rec.account_id, excess_amount);
                ELSE
                    payment_amount := remaining_loan_contribution;
                    excess_amount := 0;
                END IF;
                
                -- Calculate interest and principal components
                monthly_rate := loan_rec.interest_rate / 12.0 / 100.0;
                interest_component := loan_rec.outstanding_amount * monthly_rate;
                principal_component := GREATEST(0, payment_amount - interest_component);
                
                -- Insert loan payment record
                INSERT INTO public.loan_payments (
                    loan_id, payment_amount, principal_amount, interest_amount,
                    payment_date, due_date, status
                ) VALUES (
                    loan_rec.id, payment_amount, principal_component, 
                    LEAST(interest_component, payment_amount),
                    income_rec.date, loan_rec.next_payment_date, 'paid'
                );
                
                remaining_loan_contribution := 0; -- Process only one loan at a time for EMI logic
            END;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to process credit card contribution with specific card selection
CREATE OR REPLACE FUNCTION public.process_credit_card_contribution(
    p_income_id UUID,
    p_credit_card_id UUID,
    p_amount DECIMAL(15,2)
)
RETURNS VOID AS $$
DECLARE
    income_rec RECORD;
BEGIN
    -- Get income details
    SELECT * INTO income_rec FROM public.income WHERE id = p_income_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Income record not found';
    END IF;
    
    -- Insert credit card transaction
    INSERT INTO public.credit_card_transactions (
        user_id, credit_card_id, income_id, amount, 
        transaction_type, description, date
    ) VALUES (
        income_rec.user_id, p_credit_card_id, p_income_id, p_amount,
        'contribution', 'Income contribution to credit card', income_rec.date
    );
    
    -- Update credit card balance (reduce outstanding amount)
    PERFORM public.update_account_balance(p_credit_card_id, p_amount);
END;
$$ LANGUAGE plpgsql;

-- Function to update loan outstanding amount after payment
CREATE OR REPLACE FUNCTION public.process_loan_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' THEN
        UPDATE public.loans 
        SET outstanding_amount = outstanding_amount - NEW.principal_amount,
            remaining_months = remaining_months - 1,
            updated_at = NOW()
        WHERE id = NEW.loan_id;
        
        -- Update next payment date
        UPDATE public.loans 
        SET next_payment_date = next_payment_date + INTERVAL '1 month'
        WHERE id = NEW.loan_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for loan payment processing
CREATE TRIGGER trigger_process_loan_payment
    AFTER INSERT OR UPDATE ON public.loan_payments
    FOR EACH ROW EXECUTE FUNCTION public.process_loan_payment();

-- Grant permissions
GRANT ALL ON public.income TO authenticated;
GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.loans TO authenticated;
GRANT ALL ON public.emergency_fund TO authenticated;
GRANT ALL ON public.credit_card_payments TO authenticated;
GRANT ALL ON public.loan_payments TO authenticated;
GRANT ALL ON public.emergency_fund_transactions TO authenticated;

-- RLS Policies for Investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own investments" ON public.investments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own investment transactions" ON public.investment_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watchlist" ON public.stock_watchlist
    FOR ALL USING (auth.uid() = user_id);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.update_emergency_fund_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_payment_priority(DATE, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_income_contributions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_loan_payment() TO authenticated;

-- Insert default expense categories for reference
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments/Stocks Table
CREATE TABLE public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol VARCHAR(20) NOT NULL, -- Stock symbol (e.g., RELIANCE, TCS)
    company_name VARCHAR(200) NOT NULL,
    exchange VARCHAR(10) DEFAULT 'NSE', -- NSE, BSE
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    avg_price DECIMAL(15,2) NOT NULL CHECK (avg_price > 0),
    current_price DECIMAL(15,2) DEFAULT 0,
    investment_type VARCHAR(20) DEFAULT 'equity' CHECK (investment_type IN ('equity', 'mutual_fund', 'etf', 'bond')),
    sector VARCHAR(50),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_price_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment Transactions Table (for buy/sell history)
CREATE TABLE public.investment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(15,2) NOT NULL CHECK (price > 0),
    total_amount DECIMAL(15,2) NOT NULL,
    fees DECIMAL(15,2) DEFAULT 0,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Watchlist Table
CREATE TABLE public.stock_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    target_price DECIMAL(15,2),
    current_price DECIMAL(15,2) DEFAULT 0,
    last_price_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

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

GRANT SELECT ON public.expense_categories TO authenticated;
