-- ============================================
-- AI Finance Manager - Database Schema
-- ============================================
-- Tables with Row-Level Security (RLS)
-- Users are from auth.users; reference with uuid
-- ============================================

-- Profiles (extend auth.users with app-specific data)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  currency text default 'INR',
  risk_profile text default 'moderate', -- conservative, moderate, aggressive
  vault_salt text, -- salt for password-based vault encryption
  vault_verifier text, -- hashed password verifier (never store actual password)
  emergency_fund_account_id uuid references accounts(id), -- linked account for emergency fund
  emergency_fund_target_months integer default 6, -- target months of expenses
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Accounts table
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null, -- bank|wallet|card
  balance numeric default 0,
  created_at timestamp with time zone default now()
);

-- Transactions table
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  account_id uuid references accounts(id),
  date date not null,
  amount numeric not null, -- +ve income, -ve expense
  category text,
  merchant text,
  description text,
  is_recurring boolean default false,
  tags text[],
  raw jsonb,
  created_at timestamp with time zone default now()
);

-- Loans table
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  principal numeric not null,
  interest_rate numeric not null, -- annual %
  start_date date not null,
  term_months int not null,
  next_payment_on date,
  status text default 'Active',
  extra_paid numeric default 0,
  schedule jsonb,
  created_at timestamp with time zone default now()
);

-- Goals table
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  target_date date not null,
  saved_amount numeric default 0,
  priority int default 2,
  status text default 'Active',
  created_at timestamp with time zone default now()
);

-- Insurance policies table
create table if not exists insurance_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  policy_type text not null, -- Term|Health|Motor|Life|Travel
  policy_number text,
  coverage_amount numeric not null,
  premium numeric not null,
  premium_cycle text not null, -- monthly|yearly
  start_date date not null,
  end_date date,
  next_premium_on date,
  status text default 'Active',
  attachments text[], -- storage paths
  created_at timestamp with time zone default now()
);

-- Subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  service text not null,
  amount numeric not null,
  cycle text not null, -- monthly|yearly
  next_renew date not null,
  category text default 'Subscription',
  created_at timestamp with time zone default now()
);

-- Bills table
create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  due_date date not null,
  category text,
  is_paid boolean default false,
  created_at timestamp with time zone default now()
);

-- Vault items table
create table if not exists vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text not null, -- document|password|note
  path text, -- storage key
  secret jsonb, -- {iv,cipher,tag}
  created_at timestamp with time zone default now()
);

-- Insights table
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null, -- coach_tip|anomaly|goal_forecast|salary_advice
  content jsonb not null,
  created_at timestamp with time zone default now()
);

-- Salary history table
create table if not exists salary_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  base_ctc numeric not null,
  bonus numeric default 0,
  title text,
  skills text[],
  city text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table loans enable row level security;
alter table goals enable row level security;
alter table insurance_policies enable row level security;
alter table subscriptions enable row level security;
alter table bills enable row level security;
alter table vault_items enable row level security;
alter table insights enable row level security;
alter table salary_history enable row level security;

-- ============================================
-- RLS Policies
-- ============================================

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Accounts policies
create policy "Users can manage own accounts" on accounts for all using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can manage own transactions" on transactions for all using (auth.uid() = user_id);

-- Loans policies
create policy "Users can manage own loans" on loans for all using (auth.uid() = user_id);

-- Goals policies
create policy "Users can manage own goals" on goals for all using (auth.uid() = user_id);

-- Insurance policies
create policy "Users can manage own insurance" on insurance_policies for all using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can manage own subscriptions" on subscriptions for all using (auth.uid() = user_id);

-- Bills policies
create policy "Users can manage own bills" on bills for all using (auth.uid() = user_id);

-- Vault items policies
create policy "Users can manage own vault items" on vault_items for all using (auth.uid() = user_id);

-- Insights policies
create policy "Users can manage own insights" on insights for all using (auth.uid() = user_id);

-- Salary history policies
create policy "Users can manage own salary history" on salary_history for all using (auth.uid() = user_id);

-- ============================================
-- Storage Bucket Configuration
-- ============================================
-- Run these commands in Supabase Dashboard > Storage:
-- 1. Create a new bucket named "vault"
-- 2. Set it to PRIVATE (not public)
-- 3. Add RLS policies for the bucket:
--
-- Policy for SELECT:
-- create policy "Users can view own files" on storage.objects for select
-- using (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- Policy for INSERT:
-- create policy "Users can upload own files" on storage.objects for insert
-- with check (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- Policy for DELETE:
-- create policy "Users can delete own files" on storage.objects for delete
-- using (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Assets table (Real Estate, Gold, Vehicles, Other Assets)
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null, -- land|flat|house|building|gold|silver|vehicle|stock|other
  name text not null,
  description text,
  location text,
  purchase_price numeric not null,
  purchase_date date not null,
  quantity numeric default 1,
  unit text, -- g|sqft|acre|nos|etc
  current_value numeric,
  value_last_updated date default now(),
  documents text[], -- Supabase storage paths
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table assets enable row level security;
create policy "user_assets_policy" on assets for all using (auth.uid() = user_id);

create index if not exists idx_transactions_user_date on transactions(user_id, date desc);
create index if not exists idx_transactions_category on transactions(user_id, category);
create index if not exists idx_accounts_user on accounts(user_id);
create index if not exists idx_goals_user_status on goals(user_id, status);
create index if not exists idx_bills_user_due on bills(user_id, due_date);
create index if not exists idx_subscriptions_user_renew on subscriptions(user_id, next_renew);
create index if not exists idx_insights_user_kind on insights(user_id, kind, created_at desc);
create index if not exists idx_assets_user_type on assets(user_id, type);

-- Insights table for AI Coach tips and Goal forecasts
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null,            -- 'coach_tip' | 'goal_forecast'
  content jsonb not null,        -- LLM or compute output
  created_at timestamptz default now()
);

alter table insights enable row level security;
create policy "own insights" on insights for all using (auth.uid() = user_id);

create index if not exists idx_insights_user_kind on insights(user_id, kind, created_at desc);
