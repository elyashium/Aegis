-- Create compliance_alerts table
create table if not exists public.compliance_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  status text default 'pending', -- e.g., 'pending', 'acknowledged', 'resolved'
  severity text default 'medium', -- e.g., 'low', 'medium', 'high'
  link_to_action text, -- Optional: Link to relevant section or document
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.compliance_alerts enable row level security;

-- Create policies
create policy "Users can view their own compliance alerts"
  on public.compliance_alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own compliance alerts"
  on public.compliance_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own compliance alerts"
  on public.compliance_alerts for update
  using (auth.uid() = user_id);

-- Deletion of alerts might be restricted based on application logic
create policy "Users can delete their own compliance alerts"
  on public.compliance_alerts for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists compliance_alerts_user_id_idx on public.compliance_alerts(user_id);
create index if not exists compliance_alerts_status_idx on public.compliance_alerts(status);
create index if not exists compliance_alerts_due_date_idx on public.compliance_alerts(due_date); 