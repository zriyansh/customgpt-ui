'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Hash,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { MessageDetails } from '@/components/messages/MessageDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { APIMessage } from '@/types/message.types';

interface ConversationMessagesProps {
  projectId: number;
  conversationId: number;
  sessionId: string;
}

interface MessageItemProps {
  message: APIMessage;
  onSelect: () => void;
  isSelected: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onSelect, isSelected }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getFeedbackIcon = () => {
    if (!message.response_feedback) return null;
    
    switch (message.response_feedback.reaction) {
      case 'liked':
        return <ThumbsUp className="h-3 w-3 text-green-600" />;
      case 'disliked':
        return <ThumbsDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer',
        isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
      )}
      onClick={onSelect}
    >
      {/* Message Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">Message #{message.id}</span>
          {getFeedbackIcon()}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {new Date(message.created_at).toLocaleString()}
        </div>
      </div>

      {/* User Query */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-gray-700">User Query</span>
        </div>
        <p className="text-sm text-gray-600">
          {expanded ? message.user_query : truncateText(message.user_query)}
        </p>
      </div>

      {/* AI Response */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-3 w-3 text-brand-600" />
          <span className="text-xs font-medium text-gray-700">AI Response</span>
        </div>
        <p className="text-sm text-gray-600">
          {expanded ? message.openai_response : truncateText(message.openai_response)}
        </p>
      </div>

      {/* Metadata Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {message.citations && message.citations.length > 0 && (
            <div className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              <span>{message.citations.length} citations</span>
            </div>
          )}
          <span>Source: {message.metadata.request_source}</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="h-6 px-2 text-xs"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              More
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export const ConversationMessages: React.FC<ConversationMessagesProps> = ({
  projectId,
  conversationId,
  sessionId,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeedback, setFilterFeedback] = useState<'all' | 'liked' | 'disliked' | 'neutral'>('all');
  
  // TODO: Fetch messages from API
  const messages: APIMessage[] = [];

  const filteredMessages = messages.filter(message => {
    // Search filter
    if (searchQuery && !message.user_query.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !message.openai_response.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Feedback filter
    if (filterFeedback !== 'all') {
      if (!message.response_feedback && filterFeedback !== 'neutral') return false;
      if (message.response_feedback && message.response_feedback.reaction !== filterFeedback) return false;
    }
    
    return true;
  });

  return (
    <div className="h-full flex">
      {/* Messages List */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversation Messages</h2>
            <p className="text-gray-600">
              View and manage messages for conversation #{conversationId}
            </p>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterFeedback}
                  onChange={(e) => setFilterFeedback(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">All Feedback</option>
                  <option value="liked">Liked</option>
                  <option value="disliked">Disliked</option>
                  <option value="neutral">No Feedback</option>
                </select>
              </div>
              
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </Card>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No messages found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterFeedback !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'This conversation has no messages yet'}
                </p>
              </Card>
            ) : (
              filteredMessages.map(message => (
                <MessageItem
                  key={message.id}
                  message={message}
                  onSelect={() => setSelectedMessage(message.id)}
                  isSelected={selectedMessage === message.id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Message Details Panel */}
      {selectedMessage && (
        <div className="w-[500px] border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <MessageDetails
            projectId={projectId}
            sessionId={sessionId}
            messageId={selectedMessage}
            onClose={() => setSelectedMessage(null)}
          />
        </div>
      )}
    </div>
  );
};