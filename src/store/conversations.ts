import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConversationStore, Conversation } from '@/types';
import { getClient } from '@/lib/api/client';
import { generateConversationName } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Session-based conversation isolation
const getSessionId = (): string => {
  // Check if we're running on the server
  if (typeof window === 'undefined') {
    return 'server-session';
  }
  
  // Use the current widget session if available
  if ((window as any).__customgpt_current_session) {
    return (window as any).__customgpt_current_session;
  }
  
  // Check if we're in widget mode with session configuration
  if ((window as any).__customgpt_session) {
    return (window as any).__customgpt_session.sessionId;
  }
  
  // Check for instance-specific sessions (for isolated widgets)
  if ((window as any).__customgpt_sessions) {
    // For isolated widgets, we need to determine which session to use
    // This is tricky since stores are global - we'll use the most recent session
    const sessions = (window as any).__customgpt_sessions;
    const sessionIds = Object.keys(sessions);
    if (sessionIds.length > 0) {
      // Return the most recently created session
      return sessionIds[sessionIds.length - 1];
    }
  }
  
  // Fallback to browser-based session ID
  try {
    let sessionId = sessionStorage.getItem('customgpt_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('customgpt_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    // Fallback if sessionStorage is not available
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      loading: false,
      error: null,

      fetchConversations: async (projectId: number) => {
        logger.info('CONVERSATIONS', 'Fetching conversations', { projectId });
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.getConversations(projectId);
          logger.info('CONVERSATIONS', 'API response received', { 
            projectId,
            responseType: typeof response,
            hasData: !!(response as any)?.data,
            dataLength: Array.isArray((response as any)?.data) ? (response as any).data.length : 0
          });
          
          // Handle different response formats
          let conversations = [];
          if (response && typeof response === 'object') {
            if (Array.isArray((response as any).data)) {
              conversations = (response as any).data;
            } else if (Array.isArray(response)) {
              conversations = response;
            } else if ((response as any).data && Array.isArray((response as any).data.data)) {
              conversations = (response as any).data.data;
            }
          }
          
          logger.info('CONVERSATIONS', 'Processed conversations', {
            count: conversations.length,
            conversations: conversations.map((c: any) => ({ 
              id: c.id, 
              name: c.name,
              messagesCount: c.messages?.length || 0 
            }))
          });
          
          set({ 
            conversations, 
            loading: false,
          });
        } catch (error) {
          logger.error('CONVERSATIONS', 'Failed to fetch conversations', error, {
            projectId,
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            status: (error as any)?.status,
            message: (error as any)?.message
          });
          // Don't clear existing conversations on error - preserve local state
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch conversations',
            loading: false,
            // Keep existing conversations instead of clearing them
          });
        }
      },

      createConversation: async (projectId: number, name?: string) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.createConversation(projectId, name ? { name } : undefined);
          const newConversation = response.data;
          
          set(state => ({ 
            conversations: [newConversation, ...state.conversations],
            currentConversation: newConversation,
            loading: false,
          }));
        } catch (error) {
          console.error('Failed to create conversation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create conversation',
            loading: false 
          });
          throw error;
        }
      },

      selectConversation: (conversation: Conversation) => {
        set({ currentConversation: conversation });
      },

      deleteConversation: async (conversationId: string | number) => {
        const { conversations, currentConversation } = get();
        const conversation = conversations.find(c => c.id.toString() === conversationId.toString());
        
        if (!conversation) return;

        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          await client.deleteConversation(conversation.project_id, conversation.session_id);
          
          const updatedConversations = conversations.filter(c => c.id.toString() !== conversationId.toString());
          
          set({ 
            conversations: updatedConversations,
            currentConversation: currentConversation?.id.toString() === conversationId.toString() 
              ? (updatedConversations.length > 0 ? updatedConversations[0] : null)
              : currentConversation,
            loading: false,
          });
        } catch (error) {
          console.error('Failed to delete conversation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete conversation',
            loading: false 
          });
          throw error;
        }
      },

      updateConversation: async (conversationId: number, sessionId: string, data: { name: string }) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.updateConversation(conversationId, sessionId, data);
          const updatedConversation = response.data;
          
          set(state => ({ 
            conversations: state.conversations.map(c => 
              c.id === conversationId ? updatedConversation : c
            ),
            currentConversation: state.currentConversation?.id === conversationId 
              ? updatedConversation 
              : state.currentConversation,
            loading: false,
          }));
        } catch (error) {
          console.error('Failed to update conversation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update conversation',
            loading: false 
          });
          throw error;
        }
      },

      // Auto-create conversation if none exists
      ensureConversation: async (projectId: number, firstMessage?: string) => {
        const { currentConversation, conversations } = get();
        
        // If we have a current conversation for this project, use it
        if (currentConversation && currentConversation.project_id === projectId) {
          return currentConversation;
        }
        
        // Look for existing conversations for this project
        const projectConversations = conversations.filter(c => c.project_id === projectId);
        if (projectConversations.length > 0) {
          const conversation = projectConversations[0];
          set({ currentConversation: conversation });
          return conversation;
        }
        
        // Create new conversation
        const name = firstMessage 
          ? generateConversationName(firstMessage)
          : `Chat ${new Date().toLocaleDateString()}`;
          
        await get().createConversation(projectId, name);
        return get().currentConversation!;
      },
    }),
    {
      name: `customgpt-conversations-${getSessionId()}`,
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversation: state.currentConversation,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.conversations)) {
          state.conversations = [];
        }
      },
    }
  )
);