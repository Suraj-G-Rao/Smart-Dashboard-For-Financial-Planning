-- ============================================
-- INCOME FEATURE - Clean Setup for Existing Schema
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Income Entries Table
create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  amount numeric not null check (amount > 0),
  account_id uuid references public.accounts(id) not null,
  type text not null,
  notes text,
  allocation_loan numeric default 0,
  allocation_invest numeric default 0,
  is_recurring boolean default false,
  template_id uuid references public.income_templates(id),
  created_at timestamptz default now()
);

alter table public.income_entries enable row level security;

drop policy if exists "Users manage own income entries" on public.income_entries;
create policy "Users manage own income entries" on public.income_entries
  for all using (auth.uid() = user_id);

create index if not exists idx_income_entries_user_date on public.income_entries(user_id, date desc);
create index if not exists idx_income_entries_template on public.income_entries(template_id) where template_id is not null;

-- 2. Update Income Templates Table (add missing columns)
alter table public.income_templates add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.income_templates add column if not exists type text default 'Salary';
alter table public.income_templates add column if not exists amount numeric default 0;
alter table public.income_templates add column if not exists start_date date default current_date;
alter table public.income_templates add column if not exists day_of_month int default 1;
alter table public.income_templates add column if not exists account_id uuid references public.accounts(id);
alter table public.income_templates add column if not exists loan_percent numeric default 0;
alter table public.income_templates add column if not exists invest_percent numeric default 0;
alter table public.income_templates add column if not exists active boolean default true;
alter table public.income_templates add column if not exists created_at timestamptz default now();

-- Add constraints
do $$ 
begin
  alter table public.income_templates add constraint income_templates_amount_check check (amount > 0);
exception when duplicate_object then null;
end $$;

do $$ 
begin
  alter table public.income_templates add constraint income_templates_day_check check (day_of_month between 1 and 28);
exception when duplicate_object then null;
end $$;

alter table public.income_templates enable row level security;

drop policy if exists "Users manage own income templates" on public.income_templates;
create policy "Users manage own income templates" on public.income_templates
  for all using (auth.uid() = user_id);

create index if not exists idx_income_templates_user_active on public.income_templates(user_id, active);

-- 3. Update Loans Table (add missing columns)
do $$ 
begin
  -- Add status column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'loans' 
    and column_name = 'status'
  ) then
    alter table public.loans add column status text default 'Active';
  end if;
  
  -- Add emi column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'loans' 
    and column_name = 'emi'
  ) then
    alter table public.loans add column emi numeric;
  end if;
  
  -- Add total_interest column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'loans' 
    and column_name = 'total_interest'
  ) then
    alter table public.loans add column total_interest numeric;
  end if;
end $$;

-- Add constraint for status (only if status column exists)
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'loans' 
    and column_name = 'status'
  ) then
    alter table public.loans add constraint loans_status_check check (status in ('Active', 'Closed', 'Paused'));
  end if;
exception when duplicate_object then null;
end $$;

-- Recreate policy
drop policy if exists "Users can manage own loans" on public.loans;
create policy "Users can manage own loans" on public.loans
  for all using (auth.uid() = user_id);

-- Create indexes (now that status column exists)
create index if not exists idx_loans_user_status on public.loans(user_id, status);
create index if not exists idx_loans_next_payment on public.loans(next_payment_on) where status = 'Active';

-- 4. Add savings contribution to profiles (only if table exists)
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
  set balance = balance + p_amount
  where id = p_account_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.update_account_balance(uuid, numeric) to authenticated;

-- 6. Function to generate recurring income entries for current month
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
  for rec in 
    select * from public.income_templates 
    where active = true
  loop
    entry_date := date_trunc('month', current_date)::date + (rec.day_of_month - 1);
    
    if exists (
      select 1 from public.income_entries
      where template_id = rec.id
        and date = entry_date
    ) then
      continue;
    end if;
    
    loan_amt := round(rec.amount * rec.loan_percent / 100, 2);
    invest_amt := round(rec.amount * rec.invest_percent / 100, 2);
    
    insert into public.income_entries (
      user_id, date, amount, account_id, type, notes,
      allocation_loan, allocation_invest, is_recurring, template_id
    ) values (
      rec.user_id, entry_date, rec.amount, rec.account_id, rec.type,
      'Auto-generated from template',
      loan_amt, invest_amt, true, rec.id
    );
    
    perform public.update_account_balance(rec.account_id, rec.amount);
  end loop;
end;
$$;

grant execute on function public.generate_monthly_income() to authenticated;

