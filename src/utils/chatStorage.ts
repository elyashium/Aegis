import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Types for conversations and messages
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  conversation_id: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages?: Message[];
  user_id: string;
}

// Helper function to ensure dates are properly formatted for Supabase
const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

// Helper function to ensure dates from Supabase are properly parsed
const parseDateFromSupabase = (dateString: string): Date => {
  return new Date(dateString);
};

// Fetch all conversations for a user
export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data.map(conv => ({
    ...conv,
    timestamp: parseDateFromSupabase(conv.timestamp)
  }));
};

// Fetch a single conversation with its messages
export const fetchConversation = async (conversationId: string): Promise<Conversation | null> => {
  console.log(`Fetching conversation with ID: ${conversationId}`);

  // First get the conversation
  const { data: conversationData, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  
  if (conversationError) {
    console.error('Error fetching conversation:', conversationError);
    return null;
  }

  console.log('Conversation data retrieved:', conversationData);

  // Then get the messages for this conversation
  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });
  
  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    return null;
  }

  console.log(`Retrieved ${messagesData.length} messages for conversation ${conversationId}`);
  
  // Check if we got back the expected data format
  if (!messagesData || !Array.isArray(messagesData)) {
    console.error('Unexpected message data format:', messagesData);
    return {
      ...conversationData,
      timestamp: parseDateFromSupabase(conversationData.timestamp),
      messages: []
    };
  }

  return {
    ...conversationData,
    timestamp: parseDateFromSupabase(conversationData.timestamp),
    messages: messagesData.map(msg => ({
      ...msg,
      timestamp: parseDateFromSupabase(msg.timestamp)
    }))
  };
};

// Create a new conversation
export const createConversation = async (
  userId: string, 
  title: string = 'New Conversation'
): Promise<Conversation | null> => {
  const newConversation: Omit<Conversation, 'messages'> = {
    id: uuidv4(),
    title,
    lastMessage: '',
    timestamp: new Date(),
    user_id: userId
  };

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      ...newConversation,
      timestamp: formatDateForSupabase(newConversation.timestamp)
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return {
    ...data,
    timestamp: parseDateFromSupabase(data.timestamp)
  };
};

// Add a message to a conversation
export const addMessage = async (message: Omit<Message, 'id'>): Promise<Message | null> => {
  const newMessage = {
    ...message,
    id: uuidv4(),
    // Ensure timestamp is in ISO format for Supabase
    timestamp: formatDateForSupabase(message.timestamp),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(newMessage)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding message:', error);
    return null;
  }

  // Update the conversation's last message and timestamp
  await supabase
    .from('conversations')
    .update({
      lastMessage: message.content,
      timestamp: formatDateForSupabase(message.timestamp)
    })
    .eq('id', message.conversation_id);

  return {
    ...data,
    timestamp: parseDateFromSupabase(data.timestamp)
  };
};

// Update a conversation title
export const updateConversationTitle = async (
  conversationId: string, 
  title: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);
  
  if (error) {
    console.error('Error updating conversation title:', error);
    return false;
  }

  return true;
};

// Delete a conversation
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  // Delete all messages in the conversation first
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);
  
  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
    return false;
  }

  // Then delete the conversation
  const { error: conversationError } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);
  
  if (conversationError) {
    console.error('Error deleting conversation:', conversationError);
    return false;
  }

  return true;
}; 