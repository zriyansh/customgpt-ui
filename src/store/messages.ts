/**
 * Message Store - Core Chat Functionality
 * 
 * This store manages all message-related state and operations.
 * It's the heart of the chat system, handling:
 * - Message sending and receiving
 * - Real-time streaming responses
 * - Message history management
 * - Local storage fallback
 * - Error handling and retries
 * 
 * Architecture:
 * - Uses Map for efficient conversation-based message storage
 * - Integrates with agent and conversation stores
 * - Handles both streaming and non-streaming API responses
 * - Provides local storage backup for offline access
 * 
 * Key Features:
 * - Automatic conversation creation if needed
 * - Streaming with fallback to non-streaming
 * - Optimistic UI updates
 * - Message feedback tracking
 * - File upload support
 * 
 * For contributors:
 * - Always update both local state and storage
 * - Handle API errors gracefully with fallbacks
 * - Use logger for debugging
 * - Maintain message order and IDs
 */

import { create } from 'zustand';
import type { MessageStore, ChatMessage, Citation, FeedbackType } from '@/types';
import { getClient } from '@/lib/api/client';
import { useAgentStore } from './agents';
import { useConversationStore } from './conversations';
import { generateId } from '@/lib/utils';
import { globalStreamManager } from '@/lib/streaming/handler';
import { logger } from '@/lib/logger';

/**
 * Local storage configuration
 * Provides offline access and caching for better UX
 */
const MESSAGES_STORAGE_KEY = 'customgpt-messages-cache';

/**
 * Save messages to local storage
 * Provides a fallback when API is unavailable
 * @param conversationId - The conversation to save messages for
 * @param messages - Array of messages to save
 */
function saveMessagesToStorage(conversationId: string, messages: ChatMessage[]) {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const cache = stored ? JSON.parse(stored) : {};
    cache[conversationId] = messages;
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Silent fail - storage is optional
    console.error('Failed to save messages to local storage:', error);
  }
}

/**
 * Load messages from local storage
 * Used as fallback when API is unavailable
 * @param conversationId - The conversation to load messages for
 * @returns Array of messages or null if not found
 */
function loadMessagesFromStorage(conversationId: string): ChatMessage[] | null {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!stored) return null;
    const cache = JSON.parse(stored);
    return cache[conversationId] || null;
  } catch (error) {
    // Silent fail - storage is optional
    console.error('Failed to load messages from local storage:', error);
    return null;
  }
}

/**
 * Message Store Implementation
 * 
 * State Structure:
 * - messages: Map<conversationId, ChatMessage[]> - All messages grouped by conversation
 * - streamingMessage: Current message being streamed (null when not streaming)
 * - isStreaming: Whether a message is currently being streamed
 * - loading: General loading state for message operations
 * - error: Current error message if any
 */
export const useMessageStore = create<MessageStore>((set, get) => ({
  // Initialize with empty state
  messages: new Map(),
  streamingMessage: null,
  isStreaming: false,
  loading: false,
  error: null,

  /**
   * Send a message to the current agent
   * 
   * Flow:
   * 1. Validate agent selection
   * 2. Ensure conversation exists (create if needed)
   * 3. Create and add user message (optimistic update)
   * 4. Upload files if present
   * 5. Start streaming response
   * 6. Fall back to non-streaming if streaming fails
   * 7. Handle errors gracefully
   * 
   * @param content - Message text
   * @param files - Optional file attachments
   */
  sendMessage: async (content: string, files?: File[]) => {
    // Check if in demo mode
    const isDemoMode = typeof window !== 'undefined' && (window as any).__customgpt_demo_mode;
    
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
    get().addMessage(conversation.id.toString(), userMessage);

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
      get().addMessage(conversation.id.toString(), userMessage);

      // Start streaming with correct parameters
      const client = getClient();
      
      logger.info('MESSAGES', 'Starting message stream', {
        agentId: currentAgent.id,
        sessionId: conversation.session_id,
        messageContent: content.substring(0, 50)
      });
      
      try {
        await client.sendMessageStream(
          currentAgent.id,
          conversation.session_id,  // Use session_id instead of id
          { 
            prompt: content,
            response_source: 'default',  // Required field as per API documentation
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
                get().addMessage(conversation.id.toString(), finalMessage);
              }
              
              set({ 
                streamingMessage: null,
                isStreaming: false,
              });
            },
            onError: async (streamError) => {
              logger.error('MESSAGES', 'Streaming failed, attempting fallback to non-streaming', streamError, {
                errorMessage: streamError.message,
                agentId: currentAgent.id,
                sessionId: conversation.session_id
              });
              
              // Try fallback to non-streaming API
              try {
                logger.info('MESSAGES', 'Using non-streaming fallback');
                
                const response = await client.sendMessage(
                  currentAgent.id,
                  conversation.session_id,
                  { 
                    prompt: content,
                    response_source: 'default',  // Required field as per API documentation
                    stream: 0  // Explicitly disable streaming
                  }
                );
                
                // Update streaming message with the complete response
                const finalMessage = get().streamingMessage;
                if (finalMessage && response) {
                  // Handle different response formats from API
                  let messageData: any;
                  if (response.data) {
                    messageData = response.data;
                  } else {
                    // Direct response format - cast to any to handle the actual API structure
                    messageData = response as any;
                  }
                  
                  finalMessage.content = messageData?.openai_response || messageData?.content || 'No response received';
                  finalMessage.citations = messageData?.citations || [];
                  finalMessage.status = 'sent';
                  get().addMessage(conversation.id.toString(), finalMessage);
                }
                
                set({ 
                  streamingMessage: null,
                  isStreaming: false,
                });
                
                logger.info('MESSAGES', 'Fallback to non-streaming successful');
                
              } catch (fallbackError) {
                logger.error('MESSAGES', 'Both streaming and non-streaming failed', fallbackError);
                console.error('Both streaming and fallback failed:', fallbackError);
                
                // Update assistant message with error
                const errorMessage = get().streamingMessage;
                if (errorMessage) {
                  errorMessage.content = 'Sorry, I encountered an error while processing your message. Please try again.';
                  errorMessage.status = 'error';
                  get().addMessage(conversation.id.toString(), errorMessage);
                }
                
                set({ 
                  streamingMessage: null,
                  isStreaming: false,
                  error: `Communication error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
                });
              }
            },
          }
        );
      } catch (setupError) {
        logger.error('MESSAGES', 'Failed to setup streaming', setupError);
        throw setupError;
      }
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
      get().addMessage(conversation.id.toString(), userMessage);
      
      set({ 
        streamingMessage: null,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
        loading: false,
      });
      
      throw error;
    }
  },

  /**
   * Add or update a message in the store
   * 
   * Features:
   * - Handles both new messages and updates
   * - Maintains message order
   * - Automatically saves to local storage
   * - Efficient update using message ID lookup
   * 
   * @param conversationId - The conversation to add the message to
   * @param message - The message to add or update
   */
  addMessage: (conversationId: string, message: ChatMessage) => {
    set(state => {
      const newMessages = new Map(state.messages);
      const conversationMessages = newMessages.get(conversationId) || [];
      
      // Check if message already exists and update it
      const existingIndex = conversationMessages.findIndex(m => m.id === message.id);
      if (existingIndex >= 0) {
        // Update existing message
        conversationMessages[existingIndex] = message;
      } else {
        // Add new message
        conversationMessages.push(message);
      }
      
      newMessages.set(conversationId, conversationMessages);
      
      // Save to local storage as fallback
      saveMessagesToStorage(conversationId, conversationMessages);
      
      return { messages: newMessages };
    });
  },

  /**
   * Update the currently streaming message
   * 
   * Used during streaming to append content chunks
   * and update citations as they arrive
   * 
   * @param content - Content chunk to append
   * @param citations - Updated citations (optional)
   */
  updateStreamingMessage: (content: string, citations?: Citation[]) => {
    set(state => {
      if (!state.streamingMessage) return state;
      
      return {
        streamingMessage: {
          ...state.streamingMessage,
          content: state.streamingMessage.content + content, // Append content
          citations: citations || state.streamingMessage.citations, // Update citations if provided
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
    const conversationMessages = get().messages.get(currentConversation.id.toString()) || [];
    const message = conversationMessages.find(m => m.id === messageId);
    
    if (!message) return;

    try {
      // Update local state immediately
      const updatedMessage = { ...message, feedback };
      get().addMessage(currentConversation.id.toString(), updatedMessage);

      // Send to API (assuming we have the prompt ID)
      // Note: This would need to be adjusted based on the actual API structure
      // const client = getClient();
      // await client.updateMessageFeedback(currentAgent.id, currentConversation.id, promptId, {
      //   reaction: feedback === 'like' ? 'liked' : 'disliked'
      // });
    } catch (error) {
      console.error('Failed to update message feedback:', error);
      // Revert local state on error
      get().addMessage(currentConversation.id.toString(), message);
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

  /**
   * Load message history for a conversation
   * 
   * API Response Handling:
   * - Supports multiple response formats from the API
   * - Converts API format to internal ChatMessage format
   * - Falls back to local storage if API fails
   * - Handles both user_query and openai_response fields
   * 
   * @param conversationId - The conversation to load messages for
   */
  loadMessages: async (conversationId: string) => {
    // Skip API calls in demo mode
    const isDemoMode = typeof window !== 'undefined' && (window as any).__customgpt_demo_mode;
    if (isDemoMode) {
      logger.info('MESSAGES', 'Skipping message load in demo mode', { conversationId });
      // Just ensure the conversation has an entry in the messages map
      set(state => {
        const newMessages = new Map(state.messages);
        if (!newMessages.has(conversationId)) {
          newMessages.set(conversationId, []);
        }
        return { messages: newMessages, loading: false };
      });
      return;
    }
    
    // Skip API calls for locally created conversations (they don't exist on server)
    if (conversationId.startsWith('conv_')) {
      logger.info('MESSAGES', 'Skipping API load for local conversation', { conversationId });
      set(state => {
        const newMessages = new Map(state.messages);
        if (!newMessages.has(conversationId)) {
          newMessages.set(conversationId, []);
        }
        return { messages: newMessages, loading: false };
      });
      return;
    }
    
    const agentStore = useAgentStore.getState();
    const conversationStore = useConversationStore.getState();
    const { currentAgent } = agentStore;
    const { conversations } = conversationStore;
    
    if (!currentAgent) {
      logger.warn('MESSAGES', 'No current agent when loading messages', { conversationId });
      return;
    }

    // Find the conversation to get its session_id
    const conversation = conversations.find(c => c.id.toString() === conversationId);
    if (!conversation) {
      logger.error('MESSAGES', 'Conversation not found in store', { 
        conversationId,
        availableConversations: conversations.map(c => c.id)
      });
      // Don't set error, just ensure empty message array exists
      set(state => {
        const newMessages = new Map(state.messages);
        if (!newMessages.has(conversationId)) {
          newMessages.set(conversationId, []);
        }
        return { messages: newMessages, loading: false };
      });
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
      
      // Handle different response formats from the API
      let messages = [];
      if (response && typeof response === 'object') {
        // API documentation shows response format: { status: "success", data: { conversation: {...}, messages: { data: [...] } } }
        if ((response as any).data && (response as any).data.messages && Array.isArray((response as any).data.messages.data)) {
          messages = (response as any).data.messages.data;
        } else if (Array.isArray((response as any).data)) {
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
      // Each API message contains both user_query and openai_response, so we need to create two ChatMessage objects
      const formattedMessages: ChatMessage[] = [];
      
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          const baseTimestamp = msg.created_at || msg.timestamp || new Date().toISOString();
          
          // Add user message
          if (msg.user_query) {
            formattedMessages.push({
              id: `${msg.id}-user` || `user-${Math.random()}`,
              role: 'user',
              content: msg.user_query,
              timestamp: baseTimestamp,
              status: 'sent' as const,
            });
          }
          
          // Add assistant message
          if (msg.openai_response) {
            formattedMessages.push({
              id: `${msg.id}-assistant` || `assistant-${Math.random()}`,
              role: 'assistant',
              content: msg.openai_response,
              citations: msg.citations || [],
              timestamp: baseTimestamp,
              status: 'sent' as const,
              feedback: msg.response_feedback?.reaction || msg.feedback,
            });
          }
        });
      }

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