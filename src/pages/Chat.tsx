import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, PaperclipIcon, Download, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { TypeAnimation } from 'react-type-animation';

// Message type definition
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: string[];
}

// Sample suggestions for initial chat
const initialSuggestions = [
  "Help me draft an NDA",
  "What legal structure is best for my startup?",
  "Explain GDPR compliance requirements",
  "Create a founder agreement"
];

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsTyping(true);
    
    // Simulate assistant response (in a real app, this would call your AI backend)
    setTimeout(() => {
      simulateResponse(userMessage.content);
    }, 1000);
  };

  // Simulate streaming response from assistant
  const simulateResponse = (userInput: string) => {
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

  return (
    <Layout fullHeight hideFooter>
      <div className="flex flex-col h-full bg-beige-200">
        {/* Chat container */}
        <div className="flex-grow overflow-hidden">
          <div className="container-custom h-full py-6">
            <div className="bg-white rounded-lg shadow-lg h-full flex flex-col max-h-[calc(100vh-8rem)]">
              {/* Messages area */}
              <div className="flex-grow p-6 overflow-y-auto chat-messages-container">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`chat-message ${
                      message.sender === 'user' ? 'chat-message-user' : 'chat-message-assistant'
                    }`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessageContent(message.content) + (message.isStreaming ? '<span class="inline-block w-2 h-4 bg-teal-600 ml-1 animate-pulse">|</span>' : '') 
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
                {showSuggestions && messages.length === 1 && (
                  <div className="p-4 space-y-2 chat-suggestions">
                    <p className="text-text-secondary text-sm mb-3">Try asking about:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {initialSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left p-2 rounded-lg bg-beige-50 hover:bg-beige-100 text-text-primary font-mono text-sm transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="flex items-end space-x-2 p-4 chat-input-container">
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
                  disabled={!inputValue.trim()}
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