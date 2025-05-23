import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, PaperclipIcon, Download, CheckCircle, AlertCircle, Plus, Clock, Search, MoreVertical, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { TypeAnimation } from 'react-type-animation';
import axios from 'axios';
import CreateDashboardButton from '../components/CreateDashboardButton';
import { 
  fetchConversations, 
  fetchConversation, 
  createConversation, 
  addMessage, 
  updateConversationTitle, 
  deleteConversation, 
  type Message as SupabaseMessage, 
  type Conversation as SupabaseConversation 
} from '../utils/chatStorage';

// API endpoint - Using proxy to avoid CORS issues
const API_BASE_URL = "/api";

// Development helpers
const isDev = process.env.NODE_ENV === 'development';

// Message type definition
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
  attachments?: string[];
}

// Conversation type for chat history
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  isActive?: boolean;
}

// Sample suggestions for initial chat
const initialSuggestions = [
  "Help me draft an NDA",
  "What legal structure is best for my startup?",
  "Explain GDPR compliance requirements",
  "Create a founder agreement"
];

// CSS for chat component
const chatStyles = {
  messageUser: `bg-beige-50 rounded-lg p-4 mb-4 self-end max-w-[80%] text-text-primary`,
  messageAssistant: `bg-white border border-beige-200 rounded-lg p-4 mb-4 self-start max-w-[80%] text-text-primary shadow-sm`,
  messageError: `bg-red-50 border border-red-200 text-red-800`,
  typingIndicator: `inline-block w-2 h-4 bg-teal-600 ml-1 animate-pulse`,
  conversationItem: `flex flex-col p-3 border-b border-beige-100 hover:bg-beige-50 cursor-pointer transition-colors`,
  conversationActive: `bg-beige-100`,
  heading: `font-medium text-text-primary tracking-tight text-base`,
  subheading: `text-sm text-text-secondary tracking-wide`,
};

// Sample conversation history for UI demonstration
const sampleConversations: Conversation[] = [
  {
    id: 'conv1',
    title: 'NDA for Software Development',
    lastMessage: 'Here\'s a draft of the NDA as requested.',
    timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    messages: [],
  },
  {
    id: 'conv2',
    title: 'Startup Incorporation',
    lastMessage: 'Delaware C-Corp is often recommended for...',
    timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
    messages: [],
  },
  {
    id: 'conv3',
    title: 'GDPR Compliance',
    lastMessage: 'I\'ve added a GDPR checklist to your dashboard.',
    timestamp: new Date(Date.now() - 3600000 * 48), // 2 days ago
    messages: [],
  }
];

// Convert to proper format for saving to Supabase
const messageToSupabase = (message: Message, conversationId: string): Omit<SupabaseMessage, 'id'> => ({
  content: message.content,
  sender: message.sender,
  timestamp: message.timestamp,
  conversation_id: conversationId,
  attachments: message.attachments
});

// Convert from Supabase to UI format
const messageFromSupabase = (message: SupabaseMessage): Message => ({
  id: message.id,
  content: message.content,
  sender: message.sender,
  timestamp: message.timestamp,
  attachments: message.attachments
});

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { onboardingState } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [hasReceivedResponse, setHasReceivedResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeConversationRef = useRef<string | null>(null);
  
  // Load user's conversations from Supabase
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) {
        setConversations([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Loading conversations for user:', user.id);
      setIsLoading(true);
      
      try {
        const supabaseConversations = await fetchConversations(user.id);
        console.log(`Loaded ${supabaseConversations.length} conversations`);
        
        const formattedConversations: Conversation[] = supabaseConversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          lastMessage: conv.lastMessage || '',
          timestamp: conv.timestamp,
          messages: [],
          isActive: activeConversationRef.current === conv.id
        }));
        
        setConversations(formattedConversations);
        
        // If we have conversations but no active one, select the most recent
        if (formattedConversations.length > 0 && !activeConversationRef.current) {
          // Sort by timestamp (newest first) and select the first one
          const sortedConvs = [...formattedConversations].sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          );
          
          console.log('Auto-selecting most recent conversation:', sortedConvs[0].id);
          handleSelectConversation(sortedConvs[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, [user]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0 && !activeConversation) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Welcome${user?.email ? ', ' + user.email.split('@')[0] : ''}! I'm your Aegis assistant. How can I assist you with your startup today? You can ask about specific legal topics, request document drafting, or get compliance guidance.`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length, activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Handle creating a new conversation
  const handleNewConversation = async () => {
    if (!user) return;
    
    try {
      const newConversation = await createConversation(user.id);
      
      if (newConversation) {
        // Add to UI state
        const uiConversation: Conversation = {
          id: newConversation.id,
          title: newConversation.title,
          lastMessage: '',
          timestamp: newConversation.timestamp,
          messages: [],
          isActive: true
        };
        
        // Update conversations list and set active
        setConversations(prev => [uiConversation, ...prev.map(c => ({ ...c, isActive: false }))]);
        setActiveConversation(newConversation.id);
        
        // Reset messages for new conversation
        setMessages([]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = async (id: string) => {
    // Don't reload if already active
    if (activeConversation === id) {
      return;
    }
    
    console.log(`Selecting conversation: ${id}`);
    
    // Update UI first for responsive feel
    setActiveConversation(id);
    setConversations(prev => 
      prev.map(conv => ({
        ...conv,
        isActive: conv.id === id
      }))
    );
    
    // Load messages for this conversation from Supabase
    setIsLoading(true);
    try {
      const conversation = await fetchConversation(id);
      console.log(`Fetched conversation:`, conversation);
      
      if (conversation && conversation.messages) {
        // Convert Supabase messages to UI format
        const formattedMessages = conversation.messages.map(messageFromSupabase);
        console.log(`Found ${formattedMessages.length} messages`);
        
        // Update messages regardless of active conversation - 
        // we want the selected conversation to load always
        setMessages(formattedMessages);
        setShowSuggestions(formattedMessages.length === 0);
      } else {
        console.log('No messages found for conversation');
        setMessages([]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Show dashboard button for new idea users who have received a response
  const shouldShowDashboardButton = () => {
    return (
      onboardingState.userType === 'new_idea' && 
      !onboardingState.dashboardCreated &&
      hasUserSentMessage && 
      hasReceivedResponse
    );
  };

  // Update handleSendMessage to track that user has sent a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userInput = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);
    
    // Create a new message ID
    const messageId = `msg_${Date.now()}`;
    
    // Create user message
    const userMessage: Message = {
      id: messageId,
      content: userInput,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Set flag that user has sent a message
    setHasUserSentMessage(true);
    
    // Handle active conversation
    let currentConversationId = activeConversation;
    
    // If no active conversation, create a new one
    if (!currentConversationId) {
      try {
        const newConversation = await createConversation(user!.id);
        if (newConversation) {
          currentConversationId = newConversation.id;
          setActiveConversation(currentConversationId);
          activeConversationRef.current = currentConversationId;
          
          // Update UI state with new conversation
          const uiConversation: Conversation = {
            id: newConversation.id,
            title: userInput.slice(0, 30) + (userInput.length > 30 ? '...' : ''),
            lastMessage: userInput,
            timestamp: new Date(),
            messages: [userMessage],
            isActive: true
          };
          
          setConversations(prev => 
            [uiConversation, ...prev.map(c => ({ ...c, isActive: false }))]
          );
        }
      } catch (error) {
        console.error('Error creating new conversation:', error);
        return;
      }
    }
    
    // Save message to Supabase if we have an active conversation
    if (currentConversationId) {
      try {
        await addMessage(messageToSupabase(userMessage, currentConversationId));
        
        // Update conversation title if this is the first message
        const currentConversation = conversations.find(c => c.id === currentConversationId);
        if (currentConversation && currentConversation.messages.length <= 0) {
          await updateConversationTitle(
            currentConversationId, 
            userInput.slice(0, 30) + (userInput.length > 30 ? '...' : '')
          );
        }
        
        // Update conversations list
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === currentConversationId) {
              return {
                ...conv,
                lastMessage: userMessage.content,
                timestamp: new Date(),
                messages: [...conv.messages, userMessage]
              };
            }
            return conv;
          })
        );
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
    
    // Get AI response (use streaming)
    await handleStreamingResponse(userInput);
  };

  // Update handleStreamingResponse to set response received flag
  const handleStreamingResponse = async (userInput: string) => {
    // Create a placeholder for the assistant's response
    const responseId = `resp_${Date.now()}`;
    const assistantMessagePlaceholder: Message = {
      id: responseId,
      content: '', // Will be filled by API or error
      sender: 'assistant',
      timestamp: new Date(),
      isStreaming: false, // Default to false, as API is non-streaming
    };

    // Add the placeholder to the UI
    setMessages(prev => [...prev, assistantMessagePlaceholder]);
    setIsTyping(true);

    // Auto scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      // Make the API call (non-streaming)
      const response = await axios.post(
        `${API_BASE_URL}/get-legal-advice`, 
        { business_query: userInput },      
        {
          headers: {
            'Content-Type': 'application/json'
            // 'ngrok-skip-browser-warning': 'true' // Add if ngrok shows warning page
          }
        }
      );

      let assistantContent = '';
      if (response.data && response.data.policy_advice) {
        assistantContent = response.data.policy_advice;
        setHasReceivedResponse(true);
      } else {
        console.error('Unexpected response format:', response.data);
        assistantContent = 'Sorry, I received an unexpected response from the server.';
        setHasReceivedResponse(false);
      }

      // Update the assistant message with the full content
      setMessages(prev =>
        prev.map(msg =>
          msg.id === responseId
            ? { ...msg, content: assistantContent, isStreaming: false, isError: !response.data?.policy_advice }
            : msg
        )
      );

      // Save the final message to Supabase
      if (activeConversation && response.data && response.data.policy_advice) {
        const finalMessage: Message = {
          id: responseId, // Use the same ID as the placeholder
          content: assistantContent,
          sender: 'assistant',
          timestamp: new Date()
        };

        try {
          await addMessage(messageToSupabase(finalMessage, activeConversation));

          // Update conversations list
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id === activeConversation) {
                return {
                  ...conv,
                  lastMessage: finalMessage.content.substring(0, 50) + (finalMessage.content.length > 50 ? '...' : ''),
                  timestamp: new Date(),
                  // Ensure messages array in conversation is also updated if you rely on it directly
                  // For simplicity, assuming messages state is the source of truth for display
                  // and conversation.messages might be for persistence or quick preview.
                };
              }
              return conv;
            })
          );
        } catch (error) {
          console.error('Error saving assistant response:', error);
        }
      }

    } catch (error: any) {
      console.error('Error getting response:', error);
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error.response) {
        errorMessage += ` Server responded with status ${error.response.status}.`;
        if (error.response.data && error.response.data.detail) {
          errorMessage += ` Details: ${error.response.data.detail}`;
        }
      } else if (error.request) {
        errorMessage += " No response received from the server. The API might be down or unreachable.";
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      
      // Show error message in the chat
      setMessages(prev =>
        prev.map(msg =>
          msg.id === responseId
            ? {
                ...msg,
                content: errorMessage,
                isStreaming: false,
                isError: true
              }
            : msg
        )
      );
      setHasReceivedResponse(false); // Indicate that a valid response wasn't received.
    } finally {
      setIsTyping(false);
      // Auto scroll after processing is done
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message content with markdown-like styling
  const formatMessageContent = (content: string) => {
    // Replace code blocks with monospace font
    let formattedContent = content.replace(/`(.*?)`/g, '<code class="font-mono bg-beige-100 px-1 rounded">$1</code>');
    
    // Replace ** with bold
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace newlines with <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // Replace numbered lists
    formattedContent = formattedContent.replace(/(\d+\.\s)(.*?)(?=<br>|$)/g, '<div class="ml-4 mb-1">$1$2</div>');
    
    return formattedContent;
  };

  // Format the date for conversation list
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], {weekday: 'short'});
    } else {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
  };

  // Handle deleting a conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      const success = await deleteConversation(id);
      if (success) {
        // Remove from UI
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        // If deleting the active conversation, reset active and messages
        if (activeConversation === id) {
          setActiveConversation(null);
          setMessages([]);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Function to reload the current conversation when needed
  const reloadActiveConversation = async () => {
    if (!activeConversation) return;
    
    try {
      setIsLoading(true);
      const conversation = await fetchConversation(activeConversation);
      
      if (conversation && conversation.messages) {
        const formattedMessages = conversation.messages.map(messageFromSupabase);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error reloading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this to the useEffect to reload the conversation if needed
  useEffect(() => {
    if (activeConversation && messages.length === 0 && !isLoading) {
      reloadActiveConversation();
    }
  }, [activeConversation, messages.length]);

  // Add this function to debug Supabase storage
  const debugSupabaseStorage = async () => {
    if (!user) return;
    
    try {
      console.log('--- SUPABASE STORAGE DEBUG ---');
      
      // Check user
      console.log('Current user:', user);
      
      // Get all conversations
      const allConversations = await fetchConversations(user.id);
      console.log(`Found ${allConversations.length} conversations:`);
      console.log(allConversations);
      
      // Check active conversation
      console.log('Active conversation ID:', activeConversation);
      
      if (activeConversation) {
        // Get details for active conversation
        const activeConvDetails = await fetchConversation(activeConversation);
        console.log('Active conversation details:', activeConvDetails);
      }
      
      console.log('--- DEBUG END ---');
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  // Update the ref when activeConversation changes
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  return (
    <Layout fullHeight hideFooter>
      <div className="flex flex-col h-full bg-beige-200">
        <div className="flex flex-grow overflow-hidden">
          {/* Chat history sidebar */}
          <div className="w-1/4 bg-white border-r border-beige-200 flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-4 border-b border-beige-100 flex justify-between items-center">
              <h2 className="text-sm uppercase tracking-wide font-semibold text-text-secondary">Conversations</h2>
              <button 
                onClick={handleNewConversation}
                className="p-2 rounded-full hover:bg-beige-100 transition-colors"
                title="New conversation"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Search bar */}
            <div className="px-4 py-3 border-b border-beige-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-beige-200 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-text-tertiary" />
              </div>
            </div>
            
            {/* Conversation list */}
            <div className="flex-grow overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-text-tertiary">
                  <p>Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-text-tertiary">
                  <p>No conversations yet</p>
                  <button 
                    onClick={handleNewConversation}
                    className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                conversations
                  .filter(conv => searchValue === '' || conv.title.toLowerCase().includes(searchValue.toLowerCase()))
                  .map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`${chatStyles.conversationItem} ${conversation.isActive ? chatStyles.conversationActive : ''} cursor-pointer`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-text-primary truncate pr-2">{conversation.title}</h3>
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    
                    {/* Conversation actions */}
                    <div className="mt-2 flex justify-end opacity-0 hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1 text-text-tertiary hover:text-text-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        className="p-1 text-text-tertiary hover:text-text-secondary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Chat main area */}
          <div className="w-3/4 flex flex-col h-[calc(100vh-4rem)]">
            {/* Chat header */}
            <div className="bg-white border-b border-beige-100 p-4 flex justify-between items-center">
              <h1 className="text-lg font-light tracking-tight text-text-primary">
                {activeConversation 
                  ? conversations.find(c => c.id === activeConversation)?.title || 'Conversation'
                  : 'New Conversation'}
              </h1>
              {isDev && (
                <button 
                  onClick={debugSupabaseStorage}
                  className="text-text-tertiary hover:text-text-secondary text-[10px] opacity-30 hover:opacity-70"
                >
                  debug
                </button>
              )}
            </div>
            
            {/* Messages area */}
            <div className="flex-grow p-6 overflow-y-auto bg-beige-50">
              {isLoading && activeConversation ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-text-secondary">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`
                        ${message.sender === 'user' ? chatStyles.messageUser : chatStyles.messageAssistant}
                        ${message.isError ? chatStyles.messageError : ''}
                      `}
                    >
                      {message.isError && (
                        <div className="flex items-center mb-2 text-red-600">
                          <AlertCircle size={16} className="mr-2" />
                          <span className="font-medium">Error</span>
                        </div>
                      )}
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessageContent(message.content) + (message.isStreaming ? `<span class="${chatStyles.typingIndicator}">|</span>` : '') 
                        }} 
                      />
                      
                      {/* Example of document generation result */}
                      {message.sender === 'assistant' && message.content.includes('generate a draft') && (
                        <div className="mt-4 p-3 bg-beige-50 rounded-md border border-beige-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">NDA_Draft.docx</span>
                            <button className="text-teal-600 hover:text-teal-700 flex items-center">
                              <Download size={16} className="mr-1" />
                              <span className="text-sm">Download</span>
                            </button>
                          </div>
                          <p className="text-text-secondary text-sm">Non-Disclosure Agreement draft generated on {new Date().toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {/* Example of checklist generation result */}
                      {message.sender === 'assistant' && message.content.includes('compliance checklist') && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Added to your dashboard:</span>
                            <button className="text-teal-600 hover:text-teal-700 text-sm">View Dashboard</button>
                          </div>
                          <div className="p-3 bg-beige-50 rounded-md border border-beige-200">
                            <h4 className="font-medium mb-2">GDPR Compliance Checklist</h4>
                            <div className="space-y-2">
                              {['Privacy Policy Implementation', 'Data Processing Register', 'Consent Mechanisms'].map((item, i) => (
                                <div key={i} className="flex items-center">
                                  <CheckCircle size={16} className="text-teal-600 mr-2" />
                                  <span className="text-sm">{item}</span>
                                </div>
                              ))}
                              <div className="text-right mt-2">
                                <span className="text-xs text-text-tertiary">3 of 12 items</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                  
                  {/* Create Dashboard button for new idea users */}
                  {shouldShowDashboardButton() && (
                    <CreateDashboardButton className="mt-4 max-w-sm mx-auto" />
                  )}
                  
                  {/* Suggestions */}
                  {showSuggestions && messages.length <= 1 && (
                    <div className="p-4 space-y-2 chat-suggestions">
                      <p className="text-text-secondary text-sm mb-3">Try asking about:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {initialSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-left p-2 rounded-lg bg-white hover:bg-beige-100 text-text-primary font-mono text-sm transition-colors border border-beige-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Input area */}
            <div className="bg-white p-4 border-t border-beige-100">
              <div className="flex items-end space-x-2">
                <div className="flex-grow">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full resize-none rounded-lg border border-beige-300 bg-white px-4 py-2 font-mono focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal-500)/0.2]"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;