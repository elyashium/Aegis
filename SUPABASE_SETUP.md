# Supabase Chat History Setup

This document explains how to set up Supabase for storing chat history in the Aegis legal assistant application.

## Database Setup

Run the SQL commands in the following files in your Supabase project's SQL editor. These commands will:

1.  `supabase_setup.sql`: Create `conversations` and `messages` tables for chat history.
2.  `user_profiles_setup.sql`: Create `user_profiles` table for user onboarding data.
3.  `documents_setup.sql`: Create `documents` table for storing document metadata.
4.  `checklists_setup.sql`: Create `checklists` and `checklist_items` tables for managing compliance checklists.
5.  `recent_activity_setup.sql`: Create `recent_activity` table to log user actions.
6.  `compliance_alerts_setup.sql`: Create `compliance_alerts` table for dashboard alerts.

These scripts also set up Row Level Security (RLS) policies to ensure users can only access their own data and create appropriate indexes for performance.

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

### User Profiles Table (`user_profiles`)
- See `user_profiles_setup.sql` for details. Stores user onboarding information and preferences.

### Documents Table (`documents`)
- `id`: UUID primary key
- `user_id`: UUID referencing `auth.users(id)`
- `name`: Text, name of the document
- `document_type`: Text, e.g., 'Legal Document', 'Compliance Report'
- `upload_date`: Timestamp of when the document was uploaded/created
- `file_path`: Text, path to the document in Supabase storage or an external link
- `metadata`: JSONB, for other relevant info like version, description
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Checklists Table (`checklists`)
- `id`: UUID primary key
- `user_id`: UUID referencing `auth.users(id)`
- `name`: Text, name of the checklist (e.g., 'GDPR Compliance')
- `progress`: Integer, percentage complete (0-100)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Checklist Items Table (`checklist_items`)
- `id`: UUID primary key
- `checklist_id`: UUID referencing `public.checklists(id)`
- `text`: Text, description of the checklist item
- `completed`: Boolean, status of the item
- `order_index`: Integer, to maintain item order
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Recent Activity Table (`recent_activity`)
- `id`: UUID primary key
- `user_id`: UUID referencing `auth.users(id)`
- `activity_type`: Text, e.g., 'document_generated', 'checklist_updated'
- `description`: Text, details of the activity
- `reference_id`: UUID, optional ID of the related entity (document, checklist, etc.)
- `timestamp`: Timestamp of the activity
- `created_at`: Timestamp

### Compliance Alerts Table (`compliance_alerts`)
- `id`: UUID primary key
- `user_id`: UUID referencing `auth.users(id)`
- `title`: Text, title of the alert
- `description`: Text, details of the alert
- `due_date`: Timestamp, when the action is due
- `status`: Text, e.g., 'pending', 'acknowledged', 'resolved'
- `severity`: Text, e.g., 'low', 'medium', 'high'
- `link_to_action`: Text, optional link to relevant section/document
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Authentication

The app uses Supabase's built-in authentication system. The chat history is associated with authenticated users through the `user_id` field in the `conversations` table.

## Row Level Security

Security policies ensure that:
- Users can only view, edit, or delete their own conversations, messages, profiles, documents, checklists, checklist items, recent activity logs, and compliance alerts.
- Users can only access messages that belong to their conversations and checklist items that belong to their checklists.

## Development Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL in the `.sql` files mentioned under "Database Setup" in the SQL editor.
3. Get your Supabase URL and anon key from Project Settings > API
4. Add these values to your `.env` file:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Utility Functions

The application will require new utility functions (similar to those in `src/utils/chatStorage.ts`) to interact with these new Supabase tables for dashboard features. These would include functions for:

- Fetching, creating, updating, and deleting documents.
- Fetching, creating, updating, and deleting checklists and their items.
- Logging recent activities.
- Fetching, creating, updating, and deleting compliance alerts.

These functions should be created in appropriate files within the `src/utils/` directory.

The application uses utility functions in `src/utils/chatStorage.ts` to interact with the Supabase database:

- `fetchConversations`: Get all conversations for a user
- `fetchConversation`: Get a single conversation with its messages
- `createConversation`: Create a new conversation
- `addMessage`: Add a message to a conversation
- `updateConversationTitle`: Update a conversation title
- `deleteConversation`: Delete a conversation and its messages 