/**
 * Chat Layout Component
 * 
 * Top-level layout component that orchestrates the chat interface.
 * Handles different deployment modes and manages the conversation sidebar.
 * 
 * Deployment Modes:
 * - standalone: Full chat with sidebar (default for main app)
 * - widget: Embeddable chat without sidebar
 * - floating: Popup-style chat without sidebar
 * 
 * Features:
 * - Responsive sidebar with collapse/expand
 * - Automatic message loading on conversation change
 * - Mode-specific rendering logic
 * - Clean separation of concerns
 * 
 * Architecture:
 * - ChatLayout (this) - Layout orchestration
 *   - ConversationSidebar - Conversation list and management
 *   - ChatContainer - Main chat interface
 *     - Message - Individual messages
 *     - ChatInput - Message input area
 * 
 * State Management:
 * - currentConversation from conversationStore
 * - loadMessages from messageStore
 * - Local state for sidebar collapse
 * 
 * Customization for contributors:
 * - Add new deployment modes in the mode prop
 * - Customize sidebar behavior and persistence
 * - Add keyboard shortcuts for sidebar toggle
 * - Implement mobile-responsive sidebar
 * - Add sidebar position options (left/right)
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { Agent } from '@/types';
import { useConversationStore, useMessageStore } from '@/store';
import { ChatContainer } from './ChatContainer';
import { ConversationSidebar } from './ConversationSidebar';

/**
 * Props for ChatLayout component
 * 
 * @property mode - Deployment mode: standalone (with sidebar), widget, or floating
 * @property className - Additional CSS classes for styling
 * @property onClose - Callback for closing chat (widget/floating modes)
 * @property onAgentSettings - Callback for opening agent settings
 * @property showSidebar - Whether to show sidebar (only applies to standalone mode)
 * @property enableConversationManagement - Enable conversation switching UI
 * @property maxConversations - Maximum conversations per session
 * @property sessionId - Session ID for conversation isolation
 * @property threadId - Specific conversation thread to load
 * @property onConversationChange - Callback when conversation changes
 * @property onMessage - Callback when message is sent/received
 */
interface ChatLayoutProps {
  mode?: 'standalone' | 'widget' | 'floating';
  className?: string;
  onClose?: () => void;
  onAgentSettings?: (agent: Agent) => void;
  showSidebar?: boolean;
  enableConversationManagement?: boolean;
  maxConversations?: number;
  sessionId?: string;
  threadId?: string;
  onConversationChange?: (conversation: any) => void;
  onMessage?: (message: any) => void;
}

/**
 * Chat Layout Component
 * 
 * Orchestrates the overall chat interface layout based on deployment mode.
 * In standalone mode, includes a collapsible conversation sidebar.
 * In widget/floating modes, renders only the chat container.
 */
export const ChatLayout: React.FC<ChatLayoutProps> = ({
  mode = 'standalone',
  className,
  onClose,
  onAgentSettings,
  showSidebar = true,
  enableConversationManagement = false,
  maxConversations,
  sessionId,
  threadId,
  onConversationChange,
  onMessage
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentConversation } = useConversationStore();
  const { loadMessages } = useMessageStore();

  /**
   * Load messages when conversation changes
   * 
   * Automatically fetches messages from the store when user
   * switches between conversations. This ensures the chat
   * always shows the correct message history.
   */
  useEffect(() => {
    // Skip API calls in demo mode to prevent errors
    const isDemoMode = typeof window !== 'undefined' && (window as any).__customgpt_demo_mode;
    
    if (currentConversation && !isDemoMode) {
      loadMessages(currentConversation.id.toString());
    }
  }, [currentConversation, loadMessages]);

  // Hide sidebar for widget and floating modes
  // Only standalone mode shows the conversation sidebar
  const shouldShowSidebar = showSidebar && mode === 'standalone';

  /**
   * Toggle sidebar collapsed state
   * 
   * For contributors: Consider persisting this state to localStorage
   * to remember user preference across sessions
   */
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!shouldShowSidebar) {
    // For widget/floating modes, just show the chat container
    return (
      <ChatContainer
        mode={mode}
        className={className}
        onClose={onClose}
        onAgentSettings={onAgentSettings}
        enableConversationManagement={enableConversationManagement}
        maxConversations={maxConversations}
        sessionId={sessionId}
        threadId={threadId}
        onConversationChange={onConversationChange}
        onMessage={onMessage}
      />
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <ConversationSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatContainer
          mode={mode}
          className="h-full"
          onClose={onClose}
          onAgentSettings={onAgentSettings}
          enableConversationManagement={enableConversationManagement}
          maxConversations={maxConversations}
          sessionId={sessionId}
          threadId={threadId}
          onConversationChange={onConversationChange}
          onMessage={onMessage}
        />
      </div>
    </div>
  );
};