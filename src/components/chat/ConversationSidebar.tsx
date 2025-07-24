'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  Calendar,
  Search,
  X,
  Bot,
  RefreshCw,
  Database,
  BarChart3,
  FileText,
  Bug
} from 'lucide-react';
import { toast } from 'sonner';

import type { Conversation } from '@/types';
import { useConversationStore, useAgentStore, useMessageStore } from '@/store';
import { cn, formatTimestamp, generateConversationName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, newName: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onRename
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(conversation.name);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== conversation.name) {
      onRename(conversation.id, editName.trim());
    }
    setIsEditing(false);
    setEditName(conversation.name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(conversation.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    onDelete(conversation.id);
    setShowMenu(false);
  };

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-gray-50',
        isSelected && 'bg-brand-50 hover:bg-brand-100'
      )}
      onClick={() => !isEditing && onSelect(conversation)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              maxLength={100}
            />
          ) : (
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {conversation.name}
            </h3>
          )}
          
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatTimestamp(conversation.updated_at)}</span>
            {conversation.message_count && (
              <>
                <span>•</span>
                <span>{conversation.message_count} messages</span>
              </>
            )}
          </div>
        </div>

        {/* Menu Button */}
        {!isEditing && (
          <div className="relative" ref={menuRef}>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-3 h-3" />
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConversationSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  className,
  isCollapsed = false,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    conversations, 
    currentConversation, 
    loading, 
    error,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation
  } = useConversationStore();
  
  const { currentAgent } = useAgentStore();
  const { clearMessages, loadMessages } = useMessageStore();

  // Fetch conversations when agent changes
  useEffect(() => {
    if (currentAgent) {
      logger.info('UI', 'Agent changed in sidebar, fetching conversations', {
        agentId: currentAgent.id,
        agentName: currentAgent.project_name,
        isActive: currentAgent.is_chat_active
      });
      console.log('ConversationSidebar: Agent changed, fetching conversations for:', currentAgent.project_name, currentAgent.id);
      fetchConversations(currentAgent.id);
    } else {
      logger.warn('UI', 'No current agent selected in sidebar');
      console.log('ConversationSidebar: No current agent selected');
    }
  }, [currentAgent, fetchConversations]);

  // Filter conversations based on search query
  // Debug log to understand the conversations type
  if (!Array.isArray(conversations)) {
    console.warn('Conversations is not an array:', typeof conversations, conversations);
  }
  
  const filteredConversations = Array.isArray(conversations) 
    ? conversations.filter(conversation =>
        conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleNewConversation = async () => {
    if (!currentAgent || isCreating) return;
    
    logger.info('UI', 'Creating new conversation', {
      agentId: currentAgent.id,
      agentName: currentAgent.project_name
    });
    
    setIsCreating(true);
    try {
      const name = `New Chat ${new Date().toLocaleDateString()}`;
      await createConversation(currentAgent.id, name);
      clearMessages(); // Clear current messages when starting new conversation
      logger.info('UI', 'New conversation created successfully', { name });
      toast.success('New conversation created');
    } catch (error) {
      logger.error('UI', 'Failed to create conversation', error, {
        agentId: currentAgent.id,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create new conversation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    logger.info('UI', 'Selecting conversation', {
      conversationId: conversation.id,
      conversationName: conversation.name,
      projectId: conversation.project_id,
      messageCount: conversation.message_count
    });
    
    selectConversation(conversation);
    
    // Load messages for the selected conversation
    try {
      logger.info('UI', 'Loading messages for selected conversation', {
        conversationId: conversation.id,
        agentId: currentAgent?.id,
        agentName: currentAgent?.project_name
      });
      
      await loadMessages(conversation.id);
      
      logger.info('UI', 'Messages loaded successfully for conversation', {
        conversationId: conversation.id
      });
    } catch (error) {
      logger.error('UI', 'Failed to load messages for conversation', error, {
        conversationId: conversation.id,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      console.error('Failed to load messages for conversation:', error);
      toast.error('Failed to load conversation messages');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleRenameConversation = (conversationId: string, newName: string) => {
    // Update conversation name locally (in a real app, this would be an API call)
    console.log('Rename conversation:', conversationId, newName);
    toast.success('Conversation renamed');
  };

  if (isCollapsed) {
    return (
      <div className={cn('w-12 bg-gray-50 border-r border-gray-200 flex flex-col', className)}>
        <div className="p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggle}
            className="w-8 h-8"
            title="Expand sidebar"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-80 bg-gray-50 border-r border-gray-200 flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggle}
            className="h-8 w-8"
            title="Collapse sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <Link href="/create">
          <Button
            className="w-full justify-start gap-2"
            variant="default"
          >
            <Bot className="w-4 h-4" />
            Create New Agent
          </Button>
        </Link>
        
        <Button
          onClick={handleNewConversation}
          disabled={!currentAgent || isCreating}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Creating...' : 'New Chat'}
        </Button>
        
        <div className="border-t border-gray-200 pt-2 mt-3 space-y-1">
          <Link href="/analytics">
            <Button
              className="w-full justify-start gap-2"
              variant="ghost"
              size="sm"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </Link>
          
          <Link href="/pages">
            <Button
              className="w-full justify-start gap-2"
              variant="ghost"
              size="sm"
            >
              <FileText className="w-4 h-4" />
              Pages
            </Button>
          </Link>
          
          <Link href="/sources">
            <Button
              className="w-full justify-start gap-2"
              variant="ghost"
              size="sm"
            >
              <Database className="w-4 h-4" />
              Sources
            </Button>
          </Link>
          
          <Link href="/debug">
            <Button
              className="w-full justify-start gap-2"
              variant="ghost"
              size="sm"
            >
              <Bug className="w-4 h-4" />
              Debug Logs
            </Button>
          </Link>
        </div>
        
        <Button
          onClick={() => {
            if (currentAgent) {
              logger.info('UI', 'Manual refresh conversations clicked', {
                agentId: currentAgent.id,
                agentName: currentAgent.project_name
              });
              fetchConversations(currentAgent.id);
            }
          }}
          disabled={!currentAgent || loading}
          className="w-full justify-start gap-2"
          variant="ghost"
          size="sm"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh Conversations
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (!Array.isArray(conversations) || conversations.length === 0) ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error && (!Array.isArray(conversations) || conversations.length === 0) ? (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600 mb-2">Failed to load conversations</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => currentAgent && fetchConversations(currentAgent.id)}
            >
              Try Again
            </Button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-400 mt-1">
                Start a new conversation to get going
              </p>
            )}
            {currentAgent && (
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <p>Agent: {currentAgent.project_name} (ID: {currentAgent.id})</p>
                {error && (
                  <p className="text-red-500">Error: {error}</p>
                )}
                <p>Conversations loaded: {conversations.length}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={currentConversation?.id === conversation.id}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onRename={handleRenameConversation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          {currentAgent && (
            <span className="block mt-1">
              Agent: {currentAgent.project_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};