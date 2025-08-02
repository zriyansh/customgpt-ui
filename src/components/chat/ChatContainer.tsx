/**
 * ChatContainer Component
 * 
 * Main chat interface component that manages the entire chat experience.
 * This is the primary component for integrating CustomGPT chat functionality.
 * 
 * Features:
 * - Message display with streaming support
 * - Agent selection and switching
 * - Citation handling with modal details
 * - Multiple deployment modes (standalone, widget, floating)
 * - Welcome screen with example prompts
 * - Error handling and authorization checks
 * 
 * For customization:
 * - Modify EXAMPLE_PROMPTS for different starter questions
 * - Customize WelcomeMessage for branding
 * - Adjust ChatHeader for different layouts
 * - Style using Tailwind classes throughout
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';
import Link from 'next/link';

import type { ChatMessage, Citation, Agent } from '@/types';
import { cn } from '@/lib/utils';
import { useMessageStore, useAgentStore, useConversationStore } from '@/store';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { AgentSelector } from './AgentSelector';
import { CitationDetailsModal } from './CitationDetailsModal';
import { ConversationManager } from './ConversationManager';
import { logger } from '@/lib/logger';

/**
 * Example prompts shown to users when starting a new conversation
 * Customize these based on your agent's capabilities and use cases
 */
const EXAMPLE_PROMPTS = [
  "What can you help me with?",
  "Explain this document",
  "Summarize key points",
  "Answer my questions",
];

interface ExamplePromptCardProps {
  /** The prompt text to display */
  prompt: string;
  /** Handler called when the prompt is clicked */
  onClick: (prompt: string) => void;
}

/**
 * ExamplePromptCard Component
 * 
 * Clickable card showing an example prompt that users can select
 * to quickly start a conversation
 */
const ExamplePromptCard: React.FC<ExamplePromptCardProps> = ({ prompt, onClick }) => {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-sm text-gray-700"
    >
      {prompt}
    </button>
  );
};

interface WelcomeMessageProps {
  /** Handler called when an example prompt is clicked */
  onPromptClick: (prompt: string) => void;
}

/**
 * WelcomeMessage Component
 * 
 * Displays a welcome screen when no messages exist in the conversation.
 * Shows the agent name, welcome text, and example prompts.
 * Uses Framer Motion for smooth animations.
 */
const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onPromptClick }) => {
  const { currentAgent } = useAgentStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-6 mx-auto">
          <Sparkles className="w-8 h-8 text-brand-600" />
        </div>
        
        {/* Welcome Text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to {currentAgent?.project_name || 'CustomGPT'}!
        </h3>
        <p className="text-gray-600 mb-8">
          I'm here to help answer your questions and assist with your tasks. How can I help you today?
        </p>
        
        {/* Example Prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {EXAMPLE_PROMPTS.map((prompt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (idx * 0.1) }}
            >
              <ExamplePromptCard
                prompt={prompt}
                onClick={onPromptClick}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

interface MessageAreaProps {
  /** Additional CSS classes for styling */
  className?: string;
}

/**
 * MessageArea Component
 * 
 * Scrollable area that displays all messages in the current conversation.
 * Handles:
 * - Message rendering with streaming support
 * - Auto-scrolling to latest messages
 * - Citation click handling
 * - Error display
 * - Welcome message when empty
 * - Loading states with typing indicator
 */
const MessageArea: React.FC<MessageAreaProps> = ({ className }) => {
  const { 
    messages, 
    streamingMessage, 
    isStreaming,
    error,
    sendMessage 
  } = useMessageStore();
  const { currentConversation } = useConversationStore();
  const { currentAgent } = useAgentStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Citation modal state - tracks which citation is being viewed
  const [selectedCitationId, setSelectedCitationId] = React.useState<number | string | null>(null);
  const [citationModalOpen, setCitationModalOpen] = React.useState(false);
  
  const conversationMessages = currentConversation 
    ? messages.get(currentConversation.id.toString()) || []
    : [];
  
  /**
   * Auto-scroll effect
   * Automatically scrolls to the bottom when new messages arrive
   * or when streaming messages are updated
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversationMessages, streamingMessage]);
  
  const handleExamplePrompt = (prompt: string) => {
    logger.info('UI', 'Example prompt clicked', { prompt });
    sendMessage(prompt);
  };
  
  const handleCitationClick = (citation: Citation) => {
    logger.info('UI', 'Citation clicked', {
      citationId: citation.id,
      citationIndex: citation.index,
      citationTitle: citation.title
    });
    
    // Open citation details modal with the citation ID
    if (citation.id) {
      setSelectedCitationId(citation.id);
      setCitationModalOpen(true);
    }
  };
  
  const handleMessageFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    logger.info('UI', 'Message feedback provided', {
      messageId,
      feedback
    });
    // This would be handled by the message store
    console.log('Message feedback:', messageId, feedback);
  };
  
  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex-1 overflow-y-auto scroll-smooth',
        'bg-gradient-to-b from-gray-50 to-white',
        className
      )}
    >
      {/* Error Message */}
      {error && (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {error.includes('unauthorized') || error.includes('403') 
                ? 'Authorization Error' 
                : 'Error'}
            </span>
          </div>
          <p className="text-red-700 mt-1 text-sm">
            {error.includes('unauthorized') || error.includes('403')
              ? 'Your API key does not have permission to access this agent\'s conversations. Please check your API key permissions or contact support.'
              : error}
          </p>
        </div>
      )}

      {/* Welcome Message */}
      {conversationMessages.length === 0 && !streamingMessage && !error && (
        <WelcomeMessage onPromptClick={handleExamplePrompt} />
      )}
      
      {/* Messages */}
      {conversationMessages.length > 0 && (
        <div className="space-y-0">
          {conversationMessages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isLast={index === conversationMessages.length - 1}
              onCitationClick={handleCitationClick}
              onFeedback={(feedback) => handleMessageFeedback(message.id, feedback)}
            />
          ))}
        </div>
      )}
      
      {/* Streaming Message */}
      {streamingMessage && (
        <Message
          message={streamingMessage}
          isStreaming={true}
          isLast={true}
          onCitationClick={handleCitationClick}
        />
      )}
      
      {/* Typing Indicator */}
      {isStreaming && !streamingMessage && (
        <TypingIndicator />
      )}
      
      {/* Citation Details Modal */}
      {selectedCitationId && (
        <CitationDetailsModal
          isOpen={citationModalOpen}
          onClose={() => {
            setCitationModalOpen(false);
            setSelectedCitationId(null);
          }}
          citationId={selectedCitationId}
          projectId={currentAgent?.id}
        />
      )}
    </div>
  );
};

interface ChatHeaderProps {
  /** Deployment mode affects header layout */
  mode?: 'standalone' | 'widget' | 'floating';
  /** Handler for close button (widget/floating modes) */
  onClose?: () => void;
  /** Handler for agent settings button */
  onAgentSettings?: (agent: Agent) => void;
  /** Enable conversation management UI */
  enableConversationManagement?: boolean;
  /** Maximum conversations per session */
  maxConversations?: number;
  /** Session ID for conversation isolation */
  sessionId?: string;
  /** Current conversation ID */
  currentConversationId?: string;
  /** Callback when conversation changes */
  onConversationChange?: (conversation: any) => void;
  /** Callback to create new conversation */
  onCreateConversation?: () => void;
}

/**
 * ChatHeader Component
 * 
 * Header bar for the chat interface. Layout changes based on deployment mode:
 * - Standalone: Full header with agent selector
 * - Widget/Floating: Compact header with close button
 * 
 * Shows agent status (online/offline) and provides agent switching
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  mode = 'standalone', 
  onClose,
  onAgentSettings,
  enableConversationManagement = false,
  maxConversations,
  sessionId,
  currentConversationId,
  onConversationChange,
  onCreateConversation
}) => {
  const { currentAgent } = useAgentStore();
  
  if (mode === 'widget' || mode === 'floating') {
    return (
      <header className="border-b border-gray-200 bg-white">
        {/* Conversation Manager */}
        {enableConversationManagement && sessionId && (
          <div className="px-4 py-2 border-b border-gray-100">
            <ConversationManager
              sessionId={sessionId}
              maxConversations={maxConversations}
              currentConversationId={currentConversationId}
              onConversationChange={onConversationChange}
              onCreateConversation={onCreateConversation}
              className="w-full"
            />
          </div>
        )}
        
        {/* Header Content */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 truncate">
                {currentAgent?.project_name || 'CustomGPT Assistant'}
              </h2>
              <p className="text-xs text-gray-500">
                {currentAgent?.is_chat_active ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>
      </header>
    );
  }
  
  // For standalone mode, show agent selector header
  if (mode === 'standalone') {
    return (
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            Agent Chat
          </h1>
        </div>
        
        <div className="flex-1 max-w-xs ml-4">
          <AgentSelector
            onSettingsClick={onAgentSettings}
            className="w-full"
          />
        </div>
      </header>
    );
  }
  
  return null;
};

interface ChatContainerProps {
  /** Deployment mode - affects layout and styling */
  mode?: 'standalone' | 'widget' | 'floating';
  /** Additional CSS classes */
  className?: string;
  /** Handler for close button (widget/floating modes) */
  onClose?: () => void;
  /** Handler when agent settings are requested */
  onAgentSettings?: (agent: Agent) => void;
  /** Enable conversation management UI */
  enableConversationManagement?: boolean;
  /** Maximum conversations per session */
  maxConversations?: number;
  /** Session ID for conversation isolation */
  sessionId?: string;
  /** Specific conversation thread to load */
  threadId?: string;
  /** Callback when conversation changes */
  onConversationChange?: (conversation: any) => void;
  /** Callback when message is sent/received */
  onMessage?: (message: any) => void;
}

/**
 * ChatContainer Component - Main Export
 * 
 * The primary chat interface component. Can be deployed in three modes:
 * 
 * 1. Standalone: Full-page chat interface
 *    - Use when chat is the main feature
 *    - No fixed dimensions, fills container
 * 
 * 2. Widget: Embedded chat widget
 *    - Use for embedding in existing pages
 *    - Fixed dimensions with shadow
 * 
 * 3. Floating: Floating chat bubble
 *    - Use for overlay chat interfaces
 *    - Fixed dimensions with stronger shadow
 * 
 * @example
 * // Standalone mode
 * <ChatContainer mode="standalone" />
 * 
 * @example
 * // Widget mode with close handler
 * <ChatContainer 
 *   mode="widget" 
 *   onClose={() => setShowChat(false)}
 * />
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  mode = 'standalone',
  className,
  onClose,
  onAgentSettings,
  enableConversationManagement = false,
  maxConversations,
  sessionId,
  threadId,
  onConversationChange,
  onMessage
}) => {
  const { sendMessage, isStreaming, cancelStreaming } = useMessageStore();
  const { fetchAgents, agents, currentAgent } = useAgentStore();
  const { currentConversation } = useConversationStore();
  
  // Track current conversation for the widget
  const [currentConversationId, setCurrentConversationId] = React.useState<string | null>(null);
  
  // Handle conversation management
  const handleConversationChange = (conversation: any) => {
    setCurrentConversationId(conversation.id);
    onConversationChange?.(conversation);
    // The widget will handle the actual conversation switch
    if (typeof window !== 'undefined' && (window as any).CustomGPTWidget) {
      const widget = (window as any).__customgpt_widget_instance;
      if (widget) {
        widget.switchConversation(conversation.id);
      }
    }
  };
  
  const handleCreateConversation = () => {
    if (typeof window !== 'undefined' && (window as any).CustomGPTWidget) {
      const widget = (window as any).__customgpt_widget_instance;
      if (widget) {
        const newConv = widget.createConversation();
        setCurrentConversationId(newConv.id);
      }
    }
  };

  /**
   * Agent initialization effect
   * Fetches available agents when the component first mounts
   * Only runs if agents haven't been loaded yet
   */
  useEffect(() => {
    const initializeAgents = async () => {
      // Only fetch if we don't have agents and no current agent
      if (agents.length === 0 && !currentAgent) {
        logger.info('UI', 'Initializing agents on ChatContainer mount');
        try {
          await fetchAgents();
          logger.info('UI', 'Agents initialized successfully', {
            agentCount: agents.length
          });
        } catch (error) {
          logger.error('UI', 'Failed to initialize agents', error, {
            errorMessage: error instanceof Error ? error.message : String(error)
          });
          console.error('Failed to initialize agents:', error);
        }
      } else {
        logger.debug('UI', 'Agents already initialized', {
          agentCount: agents.length,
          hasCurrentAgent: !!currentAgent,
          currentAgentName: currentAgent?.project_name
        });
      }
    };

    initializeAgents();
  }, []); // Empty dependency array to run only once on mount
  
  const handleSendMessage = async (content: string, files?: File[]) => {
    logger.info('UI', 'Sending message from ChatContainer', {
      contentLength: content.length,
      hasFiles: files && files.length > 0,
      fileCount: files?.length || 0,
      currentAgent: currentAgent?.project_name,
      agentId: currentAgent?.id
    });
    
    try {
      await sendMessage(content, files);
      logger.info('UI', 'Message sent successfully');
    } catch (error) {
      logger.error('UI', 'Failed to send message from ChatContainer', error, {
        errorMessage: error instanceof Error ? error.message : String(error),
        isAuthError: error instanceof Error && (error.message.includes('403') || error.message.includes('unauthorized'))
      });
      console.error('Failed to send message:', error);
    }
  };
  
  const handleStopGeneration = () => {
    logger.info('UI', 'User cancelled streaming generation');
    cancelStreaming();
  };
  
  const handleAgentSettings = (agent: Agent) => {
    logger.info('UI', 'Agent settings requested', {
      agentId: agent.id,
      agentName: agent.project_name
    });
    onAgentSettings?.(agent);
    console.log('Agent settings requested for:', agent.project_name);
  };
  
  return (
    <div
      className={cn(
        'flex flex-col bg-white',
        mode === 'standalone' && 'h-full',
        mode === 'widget' && 'h-[600px] w-[400px] rounded-lg shadow-xl border border-gray-200',
        mode === 'floating' && 'h-[600px] w-[400px] rounded-lg shadow-2xl border border-gray-200',
        className
      )}
    >
      <ChatHeader 
        mode={mode} 
        onClose={onClose}
        onAgentSettings={handleAgentSettings}
        enableConversationManagement={enableConversationManagement}
        maxConversations={maxConversations}
        sessionId={sessionId}
        currentConversationId={currentConversationId || currentConversation?.id.toString()}
        onConversationChange={handleConversationChange}
        onCreateConversation={handleCreateConversation}
      />
      <MessageArea className="flex-1" />
      <ChatInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        placeholder={isStreaming ? "AI is thinking..." : "Send a message..."}
      />
      
      {/* Branding Footer */}
      {(mode === 'widget' || mode === 'floating') && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <a
            href="https://customgpt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors block text-center"
          >
            Powered by CustomGPT.ai
          </a>
        </div>
      )}
    </div>
  );
};