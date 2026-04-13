-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mirrors auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bank', 'card', 'brokerage', 'wallet', 'loan')),
  name TEXT NOT NULL,
  institution TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  balance NUMERIC(15, 2) DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  date DATE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
  merchant TEXT,
  raw_desc TEXT,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_rule TEXT,
  source TEXT NOT NULL CHECK (source IN ('ocr', 'csv', 'manual', 'api', 'system')),
  receipt_id UUID,
  notes TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  target_date DATE NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  risk_profile TEXT,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lender TEXT NOT NULL,
  principal NUMERIC(15, 2) NOT NULL,
  rate_apr NUMERIC(5, 2) NOT NULL,
  start_date DATE NOT NULL,
  term_months INTEGER NOT NULL,
  payment_amount NUMERIC(15, 2) NOT NULL,
  next_due_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('home', 'auto', 'personal', 'edu')),
  extra_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Securities
CREATE TABLE securities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'mf', 'etf', 'bond')),
  exchange TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holdings
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  security_id UUID NOT NULL REFERENCES securities(id),
  quantity NUMERIC(15, 4) NOT NULL,
  avg_price NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, security_id)
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  security_id UUID NOT NULL REFERENCES securities(id),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC(15, 4) NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NAV History
CREATE TABLE nav_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  security_id UUID NOT NULL REFERENCES securities(id),
  date DATE NOT NULL,
  nav_or_price NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(security_id, date)
);

-- Credit Cards
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  issuer TEXT NOT NULL,
  card_name TEXT NOT NULL,
  network TEXT NOT NULL,
  bill_cycle_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  credit_limit NUMERIC(15, 2) NOT NULL,
  reward_program JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Rules
CREATE TABLE reward_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  merchant_regex TEXT,
  category_id UUID REFERENCES categories(id),
  multiplier NUMERIC(5, 2) NOT NULL,
  cap_per_cycle NUMERIC(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card Bills
CREATE TABLE card_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  due_date DATE NOT NULL,
  statement_balance NUMERIC(15, 2) NOT NULL,
  min_due NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  ocr_text TEXT,
  parsed_amount NUMERIC(15, 2),
  parsed_date DATE,
  merchant TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'parsed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'tax', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Log
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_holdings_user ON holdings(user_id);
CREATE INDEX idx_trades_user_date ON trades(user_id, date DESC);
CREATE INDEX idx_nav_history_security_date ON nav_history(security_id, date DESC);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_credit_cards_user ON credit_cards(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_loans_user ON loans(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Accounts policies
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Loans policies
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own loans" ON loans FOR ALL USING (auth.uid() = user_id);

-- Holdings policies
CREATE POLICY "Users can view own holdings" ON holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own holdings" ON holdings FOR ALL USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own trades" ON trades FOR ALL USING (auth.uid() = user_id);

-- Credit Cards policies
CREATE POLICY "Users can view own cards" ON credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cards" ON credit_cards FOR ALL USING (auth.uid() = user_id);

-- Reward Rules policies (via credit card)
CREATE POLICY "Users can view own reward rules" ON reward_rules FOR SELECT
  USING (EXISTS (SELECT 1 FROM credit_cards WHERE credit_cards.id = reward_rules.credit_card_id AND credit_cards.user_id = auth.uid()));

-- Card Bills policies (via credit card)
CREATE POLICY "Users can view own card bills" ON card_bills FOR SELECT
  USING (EXISTS (SELECT 1 FROM credit_cards WHERE credit_cards.id = card_bills.credit_card_id AND credit_cards.user_id = auth.uid()));

-- Receipts policies
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own receipts" ON receipts FOR ALL USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reports" ON reports FOR ALL USING (auth.uid() = user_id);

-- Event Log policies
CREATE POLICY "Users can view own events" ON event_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON event_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Securities are public (read-only for users)
ALTER TABLE securities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view securities" ON securities FOR SELECT TO authenticated USING (true);

-- NAV History is public (read-only for users)
ALTER TABLE nav_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view nav history" ON nav_history FOR SELECT TO authenticated USING (true);

-- Categories are public (read-only for users)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO authenticated USING (true);

-- Seed default categories
INSERT INTO categories (name, type, parent_id) VALUES
  ('Food & Dining', 'expense', NULL),
  ('Transportation', 'expense', NULL),
  ('Shopping', 'expense', NULL),
  ('Entertainment', 'expense', NULL),
  ('Bills & Utilities', 'expense', NULL),
  ('Healthcare', 'expense', NULL),
  ('Education', 'expense', NULL),
  ('Investment', 'expense', NULL),
  ('Salary', 'income', NULL),
  ('Business', 'income', NULL),
  ('Interest', 'income', NULL),
  ('Dividends', 'income', NULL),
  ('Other Income', 'income', NULL);
