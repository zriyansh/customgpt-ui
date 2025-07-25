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
import { logger } from '@/lib/logger';

const EXAMPLE_PROMPTS = [
  "What can you help me with?",
  "Explain this document",
  "Summarize key points",
  "Answer my questions",
];

interface ExamplePromptCardProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

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
  onPromptClick: (prompt: string) => void;
}

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
  className?: string;
}

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
  
  // Citation modal state
  const [selectedCitationId, setSelectedCitationId] = React.useState<number | string | null>(null);
  const [citationModalOpen, setCitationModalOpen] = React.useState(false);
  
  const conversationMessages = currentConversation 
    ? messages.get(currentConversation.id.toString()) || []
    : [];
  
  // Auto-scroll to bottom when new messages arrive
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
  mode?: 'standalone' | 'widget' | 'floating';
  onClose?: () => void;
  onAgentSettings?: (agent: Agent) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  mode = 'standalone', 
  onClose,
  onAgentSettings 
}) => {
  const { currentAgent } = useAgentStore();
  
  if (mode === 'widget' || mode === 'floating') {
    return (
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
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
        
        <div className="flex items-center gap-2">
          {/* Agent Selector - Compact for widget/floating mode */}
          <div className="w-40">
            <AgentSelector
              onSettingsClick={onAgentSettings}
              className="w-full"
              showSettings={false}
            />
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
  mode?: 'standalone' | 'widget' | 'floating';
  className?: string;
  onClose?: () => void;
  onAgentSettings?: (agent: Agent) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  mode = 'standalone',
  className,
  onClose,
  onAgentSettings
}) => {
  const { sendMessage, isStreaming, cancelStreaming } = useMessageStore();
  const { fetchAgents, agents, currentAgent } = useAgentStore();

  // Initialize agents when component mounts
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
      />
      <MessageArea className="flex-1" />
      <ChatInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        placeholder={isStreaming ? "AI is thinking..." : "Send a message..."}
      />
    </div>
  );
};