'use client';

import React, { useState, useEffect } from 'react';
import type { Agent } from '@/types';
import { useConversationStore, useMessageStore } from '@/store';
import { ChatContainer } from './ChatContainer';
import { ConversationSidebar } from './ConversationSidebar';

interface ChatLayoutProps {
  mode?: 'standalone' | 'widget' | 'floating';
  className?: string;
  onClose?: () => void;
  onAgentSettings?: (agent: Agent) => void;
  showSidebar?: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  mode = 'standalone',
  className,
  onClose,
  onAgentSettings,
  showSidebar = true
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentConversation } = useConversationStore();
  const { loadMessages } = useMessageStore();

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id.toString());
    }
  }, [currentConversation, loadMessages]);

  // Hide sidebar for widget and floating modes
  const shouldShowSidebar = showSidebar && mode === 'standalone';

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
        />
      </div>
    </div>
  );
};