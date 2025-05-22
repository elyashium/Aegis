import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, PaperclipIcon, Download, CheckCircle, AlertCircle, Plus, Clock, Search, MoreVertical, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { TypeAnimation } from 'react-type-animation';
import axios from 'axios';

// API endpoint - Using proxy to avoid CORS issues
const API_BASE_URL = "/api";

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

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Welcome${user?.email ? ', ' + user.email.split('@')[0] : ''}! I'm your Aegis assistant. How can I assist you with your startup today? You can ask about specific legal topics, request document drafting, or get compliance guidance.`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

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
  const handleNewConversation = () => {
    const newConversationId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      id: newConversationId,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      messages: [],
      isActive: true
    };
    
    // Add new conversation and set it as active
    setConversations(prev => [newConversation, ...prev.map(c => ({ ...c, isActive: false }))]);
    setActiveConversation(newConversationId);
    
    // Reset messages for new conversation
    setMessages([]);
    setShowSuggestions(true);
  };

  // Handle selecting a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setConversations(prev => 
      prev.map(conv => ({
        ...conv,
        isActive: conv.id === id
      }))
    );
    
    // Load messages for this conversation
    // For now we'll just clear the messages, but in a real app 
    // you would load stored messages from Supabase
    setMessages([]);
    setShowSuggestions(true);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Create a conversation if none exists
    if (!activeConversation) {
      handleNewConversation();
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation title and last message
    setConversations(prev => 
      prev.map(conv => 
        conv.isActive 
          ? {
              ...conv,
              title: conv.title === 'New Conversation' ? userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? '...' : '') : conv.title,
              lastMessage: userMessage.content,
              timestamp: new Date()
            }
          : conv
      )
    );
    
    setInputValue('');
    setShowSuggestions(false);
    setIsTyping(true);
    
    // Create initial empty message for assistant
    const responseId = `response-${Date.now()}`;
    const assistantMessage: Message = {
      id: responseId,
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      // Call the RAG API
      const response = await axios.post(`${API_BASE_URL}/get-legal-advice`, {
        business_query: userMessage.content
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        responseType: 'json'
      });
      
      if (response.data && response.data.policy_advice) {
        // Update the assistant message with the response
        const assistantResponseContent = response.data.policy_advice;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, content: assistantResponseContent, isStreaming: false } 
              : msg
          )
        );
        
        // Update conversation last message
        setConversations(prev => 
          prev.map(conv => 
            conv.isActive 
              ? {
                  ...conv,
                  lastMessage: assistantResponseContent.substring(0, 60) + (assistantResponseContent.length > 60 ? '...' : ''),
                  timestamp: new Date()
                }
              : conv
          )
        );
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching advice:", error);
      let errorMessage = "I'm sorry, I couldn't process your request at the moment. ";
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage += `Error: ${error.response.status}`;
        if (error.response.data && error.response.data.detail) {
          errorMessage += ` - ${error.response.data.detail}`;
        }
      } else if (axios.isAxiosError(error) && error.request) {
        errorMessage += "No response received from the server. The API might be down or unreachable.";
      } else {
        errorMessage += "An unexpected error occurred.";
      }
      
      // Update the assistant message with the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId 
            ? { ...msg, content: errorMessage, isStreaming: false, isError: true } 
            : msg
        )
      );
      
      // Update conversation last message with error indicator
      setConversations(prev => 
        prev.map(conv => 
          conv.isActive 
            ? {
                ...conv,
                lastMessage: "Error: Could not get response",
                timestamp: new Date()
              }
            : conv
        )
      );
      
      // Fallback to simulated response for demo purposes if needed
      // simulateResponseWithId(userMessage.content, responseId);
    } finally {
      setIsTyping(false);
    }
  };

  // For streaming API support in the future
  const handleStreamingResponse = async (userInput: string) => {
    const responseId = `response-${Date.now()}`;
    
    // Create initial empty message
    const assistantMessage: Message = {
      id: responseId,
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      // Uses fetch for streaming support
      const response = await fetch(`${API_BASE_URL}/get-streaming-legal-advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ business_query: userInput })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error("ReadableStream not supported");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode and append the chunk
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        
        // Update the message with the current content
        setMessages(prev => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, content: content, isStreaming: !done } 
              : msg
          )
        );
      }
      
      // Final update to mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
      
    } catch (error) {
      console.error("Error with streaming response:", error);
      let errorMessage = "I'm sorry, I couldn't process your streaming request. ";
      
      if (error instanceof Error) {
        errorMessage += error.message;
      }
      
      // Update with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId 
            ? { ...msg, content: errorMessage, isStreaming: false, isError: true } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Fallback to simulated response when API fails (for demo purposes)
  const simulateResponseWithId = (userInput: string, responseId: string) => {
    // Generate response based on user input
    let response = '';
    
    if (userInput.toLowerCase().includes('nda')) {
      response = "I'd be happy to help you draft an NDA (Non-Disclosure Agreement). To create a customized document, I'll need some information:\n\n1. Is this a one-way or mutual NDA?\n2. Who is the disclosing party (the one sharing confidential information)?\n3. Who is the receiving party?\n4. What's the primary purpose of sharing the confidential information?\n5. How long should the confidentiality obligations last?\n\nOnce you provide these details, I can generate a draft NDA for your review.";
    } 
    else if (userInput.toLowerCase().includes('legal structure') || userInput.toLowerCase().includes('incorporation')) {
      response = "Choosing the right legal structure for your startup is a crucial decision. The most common options are:\n\n**LLC (Limited Liability Company)**\n- Pros: Limited liability protection, pass-through taxation, management flexibility\n- Cons: Self-employment taxes, potential issues with raising venture capital\n\n**C Corporation**\n- Pros: Limited liability, easier to raise VC funding, unlimited shareholders\n- Cons: Double taxation, more formalities and paperwork\n\n**S Corporation**\n- Pros: Pass-through taxation, limited liability\n- Cons: Shareholder restrictions, stricter operational requirements\n\nBased on your specific situation, I can provide a more tailored recommendation. Could you tell me more about your business, funding plans, and growth expectations?";
    }
    else if (userInput.toLowerCase().includes('gdpr') || userInput.toLowerCase().includes('compliance')) {
      response = "GDPR (General Data Protection Regulation) compliance is essential for businesses handling EU citizens' data. Key requirements include:\n\n1. **Lawful Basis for Processing**: You must have a valid legal reason to process personal data\n2. **Data Subject Rights**: Provide rights like access, erasure, and portability\n3. **Privacy by Design**: Implement data protection measures from the start\n4. **Data Breach Notification**: Report breaches within 72 hours\n5. **Data Protection Impact Assessments**: For high-risk processing\n6. **Records of Processing**: Maintain documentation of data activities\n\nWould you like me to create a GDPR compliance checklist specific to your startup? I can add it to your dashboard for tracking progress.";
    }
    else if (userInput.toLowerCase().includes('founder agreement')) {
      response = "A founder agreement is crucial for establishing clear expectations and responsibilities. I can help you draft one that includes:\n\n1. **Equity Distribution**: How ownership is divided among founders\n2. **Roles and Responsibilities**: Clear definition of each founder's duties\n3. **Vesting Schedule**: Typically 4-year vesting with a 1-year cliff\n4. **Intellectual Property Assignment**: Ensuring all IP belongs to the company\n5. **Decision-making Process**: How major decisions will be made\n6. **Exit and Termination Provisions**: What happens if a founder leaves\n\nTo create a customized founder agreement, I'll need details about your co-founders, planned equity split, and specific roles. Would you like to proceed with drafting this document?";
    }
    else {
      response = "Thank you for your message. To provide the most helpful guidance, could you share a bit more about your startup? Specifically:\n\n1. What industry are you in?\n2. What stage is your business (idea, pre-launch, operating)?\n3. Do you have co-founders?\n4. Are you seeking investment?\n\nThis context will help me tailor my legal guidance to your specific situation.";
    }
    
    // Simulate streaming by updating the message character by character
    let currentText = '';
    const words = response.split(' ');
    
    const streamInterval = setInterval(() => {
      if (words.length > 0) {
        currentText += words.shift() + ' ';
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, content: currentText, isStreaming: words.length > 0 } 
              : msg
          )
        );
      } else {
        clearInterval(streamInterval);
        setIsTyping(false);
      }
    }, 50); // Adjust speed as needed
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
              {conversations.length === 0 ? (
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
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`${chatStyles.conversationItem} ${conversation.isActive ? chatStyles.conversationActive : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-text-primary truncate pr-2">{conversation.title}</h3>
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-1">{conversation.lastMessage}</p>
                    
                    {/* Conversation actions */}
                    <div className="mt-2 flex justify-end opacity-0 hover:opacity-100 transition-opacity">
                      <button className="p-1 text-text-tertiary hover:text-text-secondary">
                        <Trash2 size={14} />
                      </button>
                      <button className="p-1 text-text-tertiary hover:text-text-secondary">
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
            <div className="bg-white border-b border-beige-100 p-4">
              <h1 className="text-lg font-light tracking-tight text-text-primary">
                {activeConversation 
                  ? conversations.find(c => c.id === activeConversation)?.title || 'Conversation'
                  : 'New Conversation'}
              </h1>
            </div>
            
            {/* Messages area */}
            <div className="flex-grow p-6 overflow-y-auto bg-beige-50">
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