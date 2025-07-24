import { create } from 'zustand';
import type { MessageStore, ChatMessage, Citation, FeedbackType } from '@/types';
import { getClient } from '@/lib/api/client';
import { useAgentStore } from './agents';
import { useConversationStore } from './conversations';
import { generateId } from '@/lib/utils';
import { globalStreamManager } from '@/lib/streaming/handler';
import { logger } from '@/lib/logger';

// Local storage key for messages fallback
const MESSAGES_STORAGE_KEY = 'customgpt-messages-cache';

// Helper to save messages to local storage
function saveMessagesToStorage(conversationId: string, messages: ChatMessage[]) {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const cache = stored ? JSON.parse(stored) : {};
    cache[conversationId] = messages;
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save messages to local storage:', error);
  }
}

// Helper to load messages from local storage
function loadMessagesFromStorage(conversationId: string): ChatMessage[] | null {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!stored) return null;
    const cache = JSON.parse(stored);
    return cache[conversationId] || null;
  } catch (error) {
    console.error('Failed to load messages from local storage:', error);
    return null;
  }
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: new Map(),
  streamingMessage: null,
  isStreaming: false,
  loading: false,
  error: null,

  sendMessage: async (content: string, files?: File[]) => {
    const agentStore = useAgentStore.getState();
    const conversationStore = useConversationStore.getState();
    
    const { currentAgent } = agentStore;
    if (!currentAgent) {
      logger.error('MESSAGES', 'No agent selected when trying to send message');
      throw new Error('No agent selected');
    }

    logger.info('MESSAGES', 'Sending message', {
      agentId: currentAgent.id,
      agentName: currentAgent.project_name,
      messageLength: content.length,
      hasFiles: files && files.length > 0
    });

    // Ensure we have a conversation
    const conversation = await conversationStore.ensureConversation(
      currentAgent.id,
      content
    );

    logger.info('MESSAGES', 'Conversation ensured', {
      conversationId: conversation.id,
      sessionId: conversation.session_id,
      hasSessionId: !!conversation.session_id,
      isNew: !conversation.message_count || conversation.message_count === 0
    });

    if (!conversation.session_id) {
      logger.error('MESSAGES', 'Conversation missing session_id', { conversation });
      throw new Error('Conversation missing session_id');
    }

    set({ loading: true, error: null });

    // Create user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    // Add user message to store
    get().addMessage(conversation.id, userMessage);

    // Create assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      citations: [],
    };

    set({ 
      streamingMessage: assistantMessage,
      isStreaming: true,
      loading: false,
    });

    try {
      // Handle file uploads if present
      if (files && files.length > 0) {
        const client = getClient();
        await Promise.all(
          files.map(file => client.uploadFile(currentAgent.id, file))
        );
      }

      // Update user message status
      userMessage.status = 'sent';
      get().addMessage(conversation.id, userMessage);

      // Start streaming with correct parameters
      const client = getClient();
      
      logger.info('MESSAGES', 'Starting message stream', {
        agentId: currentAgent.id,
        sessionId: conversation.session_id,
        messageContent: content.substring(0, 50)
      });
      
      await client.sendMessageStream(
        currentAgent.id,
        conversation.session_id,  // Use session_id instead of id
        { 
          prompt: content,
          stream: 1  // Include stream parameter in body as per SDK examples
        },
        {
          onChunk: (chunk) => {
            logger.debug('MESSAGES', 'Received stream chunk', { 
              type: chunk.type, 
              hasContent: !!chunk.content,
              contentLength: chunk.content?.length,
              contentPreview: chunk.content?.substring(0, 50)
            });
            
            if (chunk.type === 'content' && chunk.content) {
              get().updateStreamingMessage(chunk.content, chunk.citations);
            } else if (chunk.type === 'citation' && chunk.citations) {
              // Handle citation-only chunks
              const current = get().streamingMessage;
              if (current) {
                set({
                  streamingMessage: {
                    ...current,
                    citations: chunk.citations
                  }
                });
              }
            }
          },
          onComplete: () => {
            const finalMessage = get().streamingMessage;
            if (finalMessage) {
              finalMessage.status = 'sent';
              get().addMessage(conversation.id, finalMessage);
            }
            
            set({ 
              streamingMessage: null,
              isStreaming: false,
            });
          },
          onError: (error) => {
            console.error('Streaming error:', error);
            
            // Update assistant message with error
            const errorMessage = get().streamingMessage;
            if (errorMessage) {
              errorMessage.content = 'Sorry, I encountered an error while processing your message.';
              errorMessage.status = 'error';
              get().addMessage(conversation.id, errorMessage);
            }
            
            set({ 
              streamingMessage: null,
              isStreaming: false,
              error: error.message,
            });
          },
        }
      );
    } catch (error) {
      logger.error('MESSAGES', 'Failed to send message', error, {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        agentId: currentAgent.id,
        conversationId: conversation.id,
        sessionId: conversation.session_id
      });
      console.error('Failed to send message:', error);
      
      // Update user message status
      userMessage.status = 'error';
      get().addMessage(conversation.id, userMessage);
      
      set({ 
        streamingMessage: null,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
        loading: false,
      });
      
      throw error;
    }
  },

  addMessage: (conversationId: string, message: ChatMessage) => {
    set(state => {
      const newMessages = new Map(state.messages);
      const conversationMessages = newMessages.get(conversationId) || [];
      
      // Check if message already exists and update it
      const existingIndex = conversationMessages.findIndex(m => m.id === message.id);
      if (existingIndex >= 0) {
        conversationMessages[existingIndex] = message;
      } else {
        conversationMessages.push(message);
      }
      
      newMessages.set(conversationId, conversationMessages);
      
      // Save to local storage as fallback
      saveMessagesToStorage(conversationId, conversationMessages);
      
      return { messages: newMessages };
    });
  },

  updateStreamingMessage: (content: string, citations?: Citation[]) => {
    set(state => {
      if (!state.streamingMessage) return state;
      
      return {
        streamingMessage: {
          ...state.streamingMessage,
          content: state.streamingMessage.content + content,
          citations: citations || state.streamingMessage.citations,
        },
      };
    });
  },

  clearMessages: (conversationId?: string) => {
    set(state => {
      if (conversationId) {
        const newMessages = new Map(state.messages);
        newMessages.delete(conversationId);
        return { messages: newMessages };
      } else {
        // Clear all messages
        return { messages: new Map() };
      }
    });
  },

  updateMessageFeedback: async (messageId: string, feedback: FeedbackType) => {
    const agentStore = useAgentStore.getState();
    const conversationStore = useConversationStore.getState();
    
    const { currentAgent } = agentStore;
    const { currentConversation } = conversationStore;
    
    if (!currentAgent || !currentConversation) return;

    // Find the message
    const conversationMessages = get().messages.get(currentConversation.id) || [];
    const message = conversationMessages.find(m => m.id === messageId);
    
    if (!message) return;

    try {
      // Update local state immediately
      const updatedMessage = { ...message, feedback };
      get().addMessage(currentConversation.id, updatedMessage);

      // Send to API (assuming we have the prompt ID)
      // Note: This would need to be adjusted based on the actual API structure
      // const client = getClient();
      // await client.updateMessageFeedback(currentAgent.id, currentConversation.id, promptId, {
      //   reaction: feedback === 'like' ? 'liked' : 'disliked'
      // });
    } catch (error) {
      console.error('Failed to update message feedback:', error);
      // Revert local state on error
      get().addMessage(currentConversation.id, message);
    }
  },

  // Utility methods
  getMessagesForConversation: (conversationId: string): ChatMessage[] => {
    return get().messages.get(conversationId) || [];
  },

  cancelStreaming: () => {
    globalStreamManager.cancelAllStreams();
    set({ 
      streamingMessage: null,
      isStreaming: false,
    });
  },

  // Load messages for a conversation
  loadMessages: async (conversationId: string) => {
    const agentStore = useAgentStore.getState();
    const conversationStore = useConversationStore.getState();
    const { currentAgent } = agentStore;
    const { conversations } = conversationStore;
    
    if (!currentAgent) {
      logger.warn('MESSAGES', 'No current agent when loading messages', { conversationId });
      return;
    }

    // Find the conversation to get its session_id
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      logger.error('MESSAGES', 'Conversation not found', { conversationId });
      set({ error: 'Conversation not found', loading: false });
      return;
    }

    logger.info('MESSAGES', 'Loading messages for conversation', {
      conversationId,
      sessionId: conversation.session_id,
      agentId: currentAgent.id,
      agentName: currentAgent.project_name
    });

    set({ loading: true, error: null });

    try {
      const client = getClient();
      const response = await client.getMessages(currentAgent.id, conversation.session_id);
      logger.info('MESSAGES', 'Messages API response received', {
        conversationId,
        responseType: typeof response,
        hasData: !!(response as any)?.data,
        dataLength: Array.isArray((response as any)?.data) ? (response as any).data.length : 0
      });
      
      // Handle different response formats
      let messages = [];
      if (response && typeof response === 'object') {
        if (Array.isArray((response as any).data)) {
          messages = (response as any).data;
        } else if (Array.isArray(response)) {
          messages = response;
        } else if ((response as any).data && Array.isArray((response as any).data.data)) {
          messages = (response as any).data.data;
        }
      }
      
      logger.info('MESSAGES', 'Processing messages', {
        conversationId,
        messagesCount: messages.length,
        messageTypes: messages.map((m: any) => m.role || 'unknown')
      });
      
      // Convert API messages to our format
      const formattedMessages: ChatMessage[] = Array.isArray(messages) 
        ? messages.map(msg => ({
            id: msg.id || String(Math.random()),
            role: msg.role || 'user',
            content: msg.content || '',
            citations: msg.citations || [],
            timestamp: msg.timestamp || new Date().toISOString(),
            status: 'sent' as const,
            feedback: msg.feedback,
          }))
        : [];

      logger.info('MESSAGES', 'Messages formatted successfully', {
        conversationId,
        formattedCount: formattedMessages.length
      });

      set(state => {
        const newMessages = new Map(state.messages);
        newMessages.set(conversationId, formattedMessages);
        
        // Save to local storage as fallback
        saveMessagesToStorage(conversationId, formattedMessages);
        
        return { 
          messages: newMessages,
          loading: false,
        };
      });
    } catch (error) {
      logger.error('MESSAGES', 'Failed to load messages', error, {
        conversationId,
        agentId: currentAgent.id,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        status: (error as any)?.status,
        message: (error as any)?.message
      });
      
      // Try to load from local storage as fallback
      const cachedMessages = loadMessagesFromStorage(conversationId);
      if (cachedMessages && cachedMessages.length > 0) {
        logger.info('MESSAGES', 'Using cached messages as fallback', {
          conversationId,
          messageCount: cachedMessages.length
        });
        
        set(state => {
          const newMessages = new Map(state.messages);
          newMessages.set(conversationId, cachedMessages);
          return { 
            messages: newMessages,
            loading: false,
            error: 'Using cached messages (API unavailable)'
          };
        });
      } else {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load messages',
          loading: false,
        });
      }
    }
  },
}));