-- ============================================================
-- Revorva — Complete Database Schema
-- Run this ONCE in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  stripe_customer_id text unique,
  plan text not null default 'trial' check (plan in ('trial', 'starter', 'growth', 'scale', 'cancelled')),
  trial_ends_at timestamp with time zone default (timezone('utc', now()) + interval '14 days'),
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- ============================================================
-- 2. SUBSCRIPTIONS (Revorva's own billing — tracks user plans)
-- ============================================================
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- ============================================================
-- 3. STRIPE CONNECTED ACCOUNTS (user's Stripe via OAuth)
-- ============================================================
create table if not exists public.stripe_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  stripe_account_id text not null unique,
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone,
  config_json jsonb default '{
    "dunningTone": "professional",
    "maxRetries": 3,
    "retryIntervalDays": 3,
    "replyToEmail": ""
  }'::jsonb,
  connected_at timestamp with time zone default timezone('utc', now()),
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- ============================================================
-- 4. RECOVERIES (failed payment tracking + recovery status)
-- ============================================================
create table if not exists public.recoveries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  payment_intent_id text not null,
  amount integer not null default 0,
  currency text default 'usd',
  status text not null default 'pending' check (status in ('pending', 'email_sent', 'recovered', 'failed')),
  recovered_at timestamp with time zone,
  email_step integer not null default 1,
  customer_email text,
  customer_name text,
  failure_reason text,
  next_retry_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null,
  -- Prevent duplicate entries per payment intent
  constraint unique_payment_intent unique (payment_intent_id)
);

-- ============================================================
-- 5. EMAIL LOG (tracks every dunning email sent)
-- ============================================================
create table if not exists public.email_log (
  id uuid default uuid_generate_v4() primary key,
  recovery_id uuid references public.recoveries(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  to_email text not null,
  subject text not null,
  step integer not null,
  resend_id text,
  status text default 'sent' check (status in ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at timestamp with time zone default timezone('utc', now()) not null
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_users_stripe_customer on public.users(stripe_customer_id);
create index if not exists idx_users_plan on public.users(plan);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_sub on public.subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

create index if not exists idx_stripe_accounts_user_id on public.stripe_accounts(user_id);
create index if not exists idx_stripe_accounts_stripe_id on public.stripe_accounts(stripe_account_id);

create index if not exists idx_recoveries_user_id on public.recoveries(user_id);
create index if not exists idx_recoveries_payment_intent on public.recoveries(payment_intent_id);
create index if not exists idx_recoveries_status on public.recoveries(status);
create index if not exists idx_recoveries_created on public.recoveries(created_at desc);

create index if not exists idx_email_log_recovery on public.email_log(recovery_id);
create index if not exists idx_email_log_user on public.email_log(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_accounts enable row level security;
alter table public.recoveries enable row level security;
alter table public.email_log enable row level security;

-- Users policies
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Subscriptions policies
create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Stripe accounts policies
create policy "Users can read own stripe accounts" on public.stripe_accounts
  for select using (auth.uid() = user_id);

create policy "Users can insert own stripe accounts" on public.stripe_accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own stripe accounts" on public.stripe_accounts
  for update using (auth.uid() = user_id);

create policy "Users can delete own stripe accounts" on public.stripe_accounts
  for delete using (auth.uid() = user_id);

-- Recoveries policies
create policy "Users can read own recoveries" on public.recoveries
  for select using (auth.uid() = user_id);

create policy "Users can insert own recoveries" on public.recoveries
  for insert with check (auth.uid() = user_id);

-- Email log policies
create policy "Users can read own email log" on public.email_log
  for select using (auth.uid() = user_id);

-- Service role full access (for webhooks + background jobs)
create policy "Service role full access users" on public.users
  for all using (auth.role() = 'service_role');

create policy "Service role full access subscriptions" on public.subscriptions
  for all using (auth.role() = 'service_role');

create policy "Service role full access stripe_accounts" on public.stripe_accounts
  for all using (auth.role() = 'service_role');

create policy "Service role full access recoveries" on public.recoveries
  for all using (auth.role() = 'service_role');

create policy "Service role full access email_log" on public.email_log
  for all using (auth.role() = 'service_role');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
  before update on public.users
  for each row execute procedure public.update_updated_at();

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();

create trigger update_stripe_accounts_updated_at
  before update on public.stripe_accounts
  for each row execute procedure public.update_updated_at();

create trigger update_recoveries_updated_at
  before update on public.recoveries
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- VIEWS (for dashboard queries)
-- ============================================================

-- Aggregated stats per user
create or replace view public.user_recovery_stats as
select
  user_id,
  count(*) as total_recoveries,
  count(*) filter (where status = 'recovered') as recovered_count,
  count(*) filter (where status = 'pending' or status = 'email_sent') as pending_count,
  count(*) filter (where status = 'failed') as failed_count,
  coalesce(sum(amount) filter (where status = 'recovered'), 0) as total_recovered_amount,
  coalesce(sum(amount), 0) as total_attempted_amount,
  case
    when count(*) > 0
    then round((count(*) filter (where status = 'recovered'))::numeric / count(*)::numeric * 100, 1)
    else 0
  end as recovery_rate
from public.recoveries
group by user_id;
