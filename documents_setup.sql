-- Create documents table
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  document_type text, -- e.g., 'Legal Document', 'Compliance Report'
  upload_date timestamptz default now(),
  file_path text, -- Path to the document in Supabase storage or external link
  metadata jsonb, -- For any other relevant info like version, description
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.documents enable row level security;

-- Create policies
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Create index
create index if not exists documents_user_id_idx on public.documents(user_id); 