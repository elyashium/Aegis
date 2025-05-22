# Supabase Chat History Setup

This document explains how to set up Supabase for storing chat history in the Aegis legal assistant application.

## Database Setup

Run the SQL commands in `supabase_setup.sql` in your Supabase project's SQL editor. These commands will:

1. Create `conversations` and `messages` tables
2. Set up Row Level Security (RLS) policies to ensure users can only access their own data
3. Create appropriate indexes for performance

## Tables Structure

### Conversations Table
- `id`: UUID primary key
- `title`: Text for conversation title
- `lastMessage`: Text of the most recent message 
- `timestamp`: Timestamp of last activity
- `user_id`: UUID referencing auth.users(id)

### Messages Table
- `id`: UUID primary key
- `content`: Text content of the message
- `sender`: Either 'user' or 'assistant'
- `timestamp`: When the message was sent
- `conversation_id`: UUID referencing the conversation
- `attachments`: JSONB field for future attachment support

## Authentication

The app uses Supabase's built-in authentication system. The chat history is associated with authenticated users through the `user_id` field in the `conversations` table.

## Row Level Security

Security policies ensure that:
- Users can only view, edit, or delete their own conversations
- Users can only access messages that belong to their conversations

## Development Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL in `supabase_setup.sql` in the SQL editor
3. Get your Supabase URL and anon key from Project Settings > API
4. Add these values to your `.env` file:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Utility Functions

The application uses utility functions in `src/utils/chatStorage.ts` to interact with the Supabase database:

- `fetchConversations`: Get all conversations for a user
- `fetchConversation`: Get a single conversation with its messages
- `createConversation`: Create a new conversation
- `addMessage`: Add a message to a conversation
- `updateConversationTitle`: Update a conversation title
- `deleteConversation`: Delete a conversation and its messages 