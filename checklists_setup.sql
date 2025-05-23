-- Create checklists table
create table if not exists public.checklists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  progress integer default 0, -- Percentage complete (0-100)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create checklist_items table
create table if not exists public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  text text not null,
  completed boolean default false,
  order_index integer, -- To maintain the order of items
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security for checklists
alter table public.checklists enable row level security;

-- Create policies for checklists
create policy "Users can view their own checklists"
  on public.checklists for select
  using (auth.uid() = user_id);

create policy "Users can insert their own checklists"
  on public.checklists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checklists"
  on public.checklists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own checklists"
  on public.checklists for delete
  using (auth.uid() = user_id);

-- Enable Row Level Security for checklist_items
alter table public.checklist_items enable row level security;

-- Create policies for checklist_items
create policy "Users can view items in their own checklists"
  on public.checklist_items for select
  using (
    checklist_id in (
      select id from public.checklists where user_id = auth.uid()
    )
  );

create policy "Users can insert items into their own checklists"
  on public.checklist_items for insert
  with check (
    checklist_id in (
      select id from public.checklists where user_id = auth.uid()
    )
  );

create policy "Users can update items in their own checklists"
  on public.checklist_items for update
  using (
    checklist_id in (
      select id from public.checklists where user_id = auth.uid()
    )
  );

create policy "Users can delete items from their own checklists"
  on public.checklist_items for delete
  using (
    checklist_id in (
      select id from public.checklists where user_id = auth.uid()
    )
  );

-- Create indexes
create index if not exists checklists_user_id_idx on public.checklists(user_id);
create index if not exists checklist_items_checklist_id_idx on public.checklist_items(checklist_id); 