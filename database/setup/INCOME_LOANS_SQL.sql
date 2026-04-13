-- ============================================
-- INCOME & LOANS - Complete SQL Schema
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Recurring Income Templates (create first - referenced by income_entries)
create table if not exists public.income_recurring (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  amount numeric not null check (amount > 0),
  start_date date not null,
  day_of_month int not null check (day_of_month between 1 and 28),
  account_id uuid references public.accounts(id) not null,
  loan_percent numeric default 0 check (loan_percent >= 0 and loan_percent <= 100),
  invest_percent numeric default 0 check (invest_percent >= 0 and invest_percent <= 100),
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.income_recurring enable row level security;

drop policy if exists "Users manage own recurring income" on public.income_recurring;
create policy "Users manage own recurring income" on public.income_recurring
  for all using (auth.uid() = user_id);

create index if not exists idx_income_recurring_user_active on public.income_recurring(user_id, active);

-- 2. Income Entries Table (all income transactions)
create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  amount numeric not null check (amount > 0),
  account_id uuid references public.accounts(id) not null,
  type text not null,  -- Salary, Rent, Bonus, Incentive, Other
  notes text,
  allocation_loan numeric default 0,
  allocation_invest numeric default 0,
  is_recurring boolean default false,
  recurring_id uuid references public.income_recurring(id),
  created_at timestamptz default now()
);

alter table public.income_entries enable row level security;

drop policy if exists "Users manage own income entries" on public.income_entries;
create policy "Users manage own income entries" on public.income_entries
  for all using (auth.uid() = user_id);

create index if not exists idx_income_entries_user_date on public.income_entries(user_id, date desc);
create index if not exists idx_income_entries_recurring on public.income_entries(recurring_id) where recurring_id is not null;

-- 3. Loans Table (update existing or create new)
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  principal numeric not null check (principal > 0),
  interest_rate numeric not null check (interest_rate >= 0),
  start_date date not null,
  term_months int not null check (term_months > 0),
  emi numeric not null,
  total_interest numeric not null,
  next_payment_on date,
  extra_paid numeric default 0,
  schedule jsonb not null,
  created_at timestamptz default now()
);

-- Add missing columns if table already exists
alter table public.loans add column if not exists status text default 'Active';
alter table public.loans add column if not exists extra_paid numeric default 0;
alter table public.loans add column if not exists emi numeric;
alter table public.loans add column if not exists total_interest numeric;

-- Add constraint if not exists (will fail silently if exists)
do $$ 
begin
  alter table public.loans add constraint loans_status_check check (status in ('Active', 'Closed', 'Paused'));
exception when duplicate_object then null;
end $$;

alter table public.loans enable row level security;

-- Drop and recreate policy to avoid conflicts
drop policy if exists "Users manage own loans" on public.loans;
create policy "Users manage own loans" on public.loans
  for all using (auth.uid() = user_id);

-- Create indexes if not exist
create index if not exists idx_loans_user_status on public.loans(user_id, status);
create index if not exists idx_loans_next_payment on public.loans(next_payment_on) where status = 'Active';

-- 4. Profiles extension (for savings contribution)
-- Only add if profiles table exists
do $$ 
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    alter table public.profiles add column if not exists savings_contribution_percent numeric default 10;
  end if;
end $$;

-- 5. Helper function to update account balance
create or replace function public.update_account_balance(
  p_account_id uuid,
  p_amount numeric
)
returns void
language plpgsql
security definer
as $$
begin
  update public.accounts
  set balance = balance + p_amount,
      updated_at = now()
  where id = p_account_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.update_account_balance(uuid, numeric) to authenticated;

-- 6. Function to generate recurring income entries for a month
create or replace function public.generate_monthly_income()
returns void
language plpgsql
security definer
as $$
declare
  rec record;
  entry_date date;
  loan_amt numeric;
  invest_amt numeric;
begin
  -- For each active recurring income
  for rec in 
    select * from public.income_recurring 
    where active = true
  loop
    -- Calculate this month's entry date
    entry_date := date_trunc('month', current_date)::date + (rec.day_of_month - 1);
    
    -- Skip if entry already exists for this month
    if exists (
      select 1 from public.income_entries
      where recurring_id = rec.id
        and date = entry_date
    ) then
      continue;
    end if;
    
    -- Calculate allocations
    loan_amt := round(rec.amount * rec.loan_percent / 100, 2);
    invest_amt := round(rec.amount * rec.invest_percent / 100, 2);
    
    -- Insert entry
    insert into public.income_entries (
      user_id, date, amount, account_id, type, notes,
      allocation_loan, allocation_invest, is_recurring, recurring_id
    ) values (
      rec.user_id, entry_date, rec.amount, rec.account_id, rec.type,
      'Auto-generated from recurring template',
      loan_amt, invest_amt, true, rec.id
    );
    
    -- Update account balance
    perform public.update_account_balance(rec.account_id, rec.amount);
  end loop;
end;
$$;

grant execute on function public.generate_monthly_income() to authenticated;

-- 7. Sample data (optional - run only once for testing)
-- Uncomment to insert sample account
/*
insert into public.accounts (user_id, name, type, balance)
values (auth.uid(), 'Primary Bank', 'bank', 50000)
on conflict do nothing;
*/
