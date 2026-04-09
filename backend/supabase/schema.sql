create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  email varchar(255) not null unique,
  password_hash text not null,
  currency varchar(10) not null default 'USD',
  timezone varchar(64) not null default 'UTC',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash varchar(128) not null unique,
  expires_at timestamptz not null,
  device_info text null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(60) not null,
  type varchar(20) not null check (type in ('expense', 'income')),
  icon_key varchar(50) not null default 'tag',
  color_token varchar(30) not null default 'slate',
  is_default boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name, type)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(60) not null,
  type varchar(20) not null default 'bank' check (type in ('cash', 'bank', 'card', 'wallet', 'other')),
  opening_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(120) not null,
  amount numeric(14,2) not null check (amount > 0),
  type varchar(20) not null check (type in ('expense', 'income')),
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  frequency varchar(20) not null check (frequency in ('weekly', 'monthly', 'yearly')),
  start_date timestamptz not null,
  end_date timestamptz null,
  next_run_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  type varchar(20) not null check (type in ('expense', 'income')),
  amount numeric(14,2) not null check (amount > 0),
  transaction_date timestamptz not null,
  note varchar(500) not null default '',
  tags text[] not null default '{}'::text[],
  merchant varchar(120) not null default '',
  source varchar(20) not null default 'manual' check (source in ('manual', 'import', 'recurring')),
  recurring_rule_id uuid null references public.recurring_rules(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  period varchar(20) not null default 'monthly' check (period in ('monthly')),
  month_key varchar(7) not null,
  limit_amount numeric(14,2) not null check (limit_amount >= 0),
  alert_threshold_percent numeric(5,2) not null default 80 check (alert_threshold_percent >= 1 and alert_threshold_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, category_id, month_key)
);

create index if not exists idx_refresh_tokens_user_id on public.refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_lookup on public.refresh_tokens(user_id, token_hash, expires_at, revoked_at);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_recurring_rules_user_id on public.recurring_rules(user_id);
create index if not exists idx_recurring_rules_next_run on public.recurring_rules(next_run_at);
create index if not exists idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index if not exists idx_transactions_user_type_date on public.transactions(user_id, type, transaction_date desc);
create index if not exists idx_transactions_user_category on public.transactions(user_id, category_id);
create index if not exists idx_transactions_user_account on public.transactions(user_id, account_id);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month_key);

create or replace trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create or replace trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create or replace trigger trg_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create or replace trigger trg_recurring_rules_updated_at
before update on public.recurring_rules
for each row execute function public.set_updated_at();

create or replace trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create or replace trigger trg_budgets_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();
