-- Create tables for chat storage

-- Conversations table
create table if not exists conversations (
  id uuid primary key,
  title text not null,
  "lastMessage" text,
  timestamp timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Messages table
create table if not exists messages (
  id uuid primary key,
  content text not null,
  sender text not null check (sender in ('user', 'assistant')),
  timestamp timestamptz not null default now(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  attachments jsonb
);

-- Enable Row Level Security (RLS)
alter table conversations enable row level security;
alter table messages enable row level security;

-- Create policies for conversations (users can only access their own conversations)
create policy "Users can view their own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- Create policies for messages (users can only access messages in their own conversations)
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can update messages in their conversations"
  on messages for update
  using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can delete messages in their conversations"
  on messages for delete
  using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists messages_conversation_id_idx on messages(conversation_id); 