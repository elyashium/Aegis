-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  is_onboarded boolean default false,
  user_type text,
  company_name text,
  entity_type text,
  industry text,
  location text,
  stage text,
  key_concerns jsonb,
  goals text,
  dashboard_created boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- Create index
create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id); 