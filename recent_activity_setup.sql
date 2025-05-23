-- Create recent_activity table
create table if not exists public.recent_activity (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null, -- e.g., 'document_generated', 'checklist_updated', 'chat_message'
  description text not null,
  reference_id uuid, -- Optional: ID of the related document, checklist, or conversation
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.recent_activity enable row level security;

-- Create policies
create policy "Users can view their own recent activity"
  on public.recent_activity for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recent activity"
  on public.recent_activity for insert
  with check (auth.uid() = user_id);

-- Note: Update and Delete policies might not be necessary for activity logs
-- or could be restricted to admin roles depending on application logic.

-- Create index
create index if not exists recent_activity_user_id_idx on public.recent_activity(user_id); 