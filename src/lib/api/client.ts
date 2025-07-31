/**
 * CustomGPT API Client
 * 
 * Central API client for all CustomGPT.ai backend communication.
 * This client handles:
 * - Authentication via API key
 * - Request/response formatting
 * - Error handling and retries
 * - Streaming responses for real-time chat
 * - File uploads for agent training
 * 
 * Architecture:
 * - Uses native fetch API
 * - Supports both REST and streaming endpoints
 * - Implements exponential backoff for retries
 * - Manages abort controllers for cancellation
 * 
 * Key Features:
 * - Type-safe API methods
 * - Automatic retry with backoff
 * - Request timeout handling
 * - Stream parsing for chat responses
 * - Comprehensive error logging
 * 
 * For contributors:
 * - All API methods should be type-safe
 * - Handle both successful and error responses
 * - Use logger for debugging
 * - Support request cancellation
 * - Document any API quirks or workarounds
 */

import type {
  Agent,
  AgentStats,
  AgentSettings,
  Conversation,
  ChatMessage,
  Citation,
  APIResponse,
  AgentsResponse,
  ConversationsResponse,
  MessagesResponse,
  MessageResponse,
  CitationResponse,
  StreamChunk,
  LimitsResponse,
  UserProfile,
} from '@/types';
import type { APIMessageResponse } from '@/types/message.types';
import type { 
  PagesListResponse, 
  DeletePageResponse, 
  ReindexPageResponse, 
  PagesQueryParams,
  PageMetadata,
  PageMetadataResponse
} from '@/types/pages.types';
import type { 
  TrafficReportResponse, 
  QueriesReportResponse, 
  ConversationsReportResponse, 
  AnalysisReportResponse,
  AnalysisInterval
} from '@/types/reports.types';
import type { 
  SourcesListResponse, 
  SourceResponse, 
  DeleteSourceResponse,
  UpdateSourceSettingsRequest,
  CreateSitemapSourceRequest
} from '@/types/sources.types';
import { parseStreamChunk, retryWithBackoff, delay } from '@/lib/utils';
import { logger } from '@/lib/logger';

/**
 * User profile API response format
 */
interface UserProfileResponse {
  status: 'success' | 'error';
  data: UserProfile;
}

/**
 * Configuration options for the API client
 */
export interface CustomGPTClientConfig {
  /** CustomGPT.ai API key for authentication */
  apiKey: string;
  /** Base URL for API calls (defaults to production) */
  baseURL?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retryAttempts?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Extended fetch options with additional features
 */
export interface RequestOptions extends RequestInit {
  /** Request timeout override */
  timeout?: number;
  /** Retry attempts override */
  retryAttempts?: number;
  /** Query parameters to append to URL */
  params?: Record<string, string | number | boolean>;
}

/**
 * Options for handling streaming responses
 */
export interface StreamOptions {
  /** Called for each chunk of streaming data */
  onChunk?: (chunk: StreamChunk) => void;
  /** Called when streaming completes successfully */
  onComplete?: () => void;
  /** Called if streaming encounters an error */
  onError?: (error: Error) => void;
  /** Timeout for the stream */
  timeout?: number;
}

/**
 * Main API client class
 * 
 * Usage:
 * ```typescript
 * const client = new CustomGPTAPIClient({
 *   apiKey: 'your-api-key',
 *   baseURL: 'https://app.customgpt.ai/api/v1'
 * });
 * 
 * // Get agents
 * const agents = await client.getAgents();
 * 
 * // Send message with streaming
 * await client.sendMessageStream(agentId, sessionId, message, {
 *   onChunk: (chunk) => console.log(chunk),
 *   onComplete: () => console.log('Done')
 * });
 * ```
 */
export class CustomGPTAPIClient {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  /** Map of request IDs to abort controllers for cancellation */
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: CustomGPTClientConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://app.customgpt.ai/api/v1';
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    
    // Log initialization for debugging
    logger.info('API_CLIENT', 'CustomGPT API Client initialized', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      hasApiKey: !!this.apiKey,
      apiKeyPreview: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'none'
    });
  }

  /**
   * Generic request method with retry logic and error handling
   * 
   * Features:
   * - Automatic retry with exponential backoff
   * - Request timeout handling
   * - Proper error messages for debugging
   * - Request cancellation support
   * 
   * @param endpoint - API endpoint path (e.g., '/projects')
   * @param options - Request options including method, body, etc.
   * @returns Promise resolving to the API response
   * @throws Error if request fails after all retries
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = this.timeout,
      retryAttempts = this.retryAttempts,
      params,
      ...fetchOptions
    } = options;

    // Build URL with query parameters
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Only set Content-Type if body is not FormData
    if (!(fetchOptions.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers,
    };

    // Log the request
    logger.apiRequest(endpoint, fetchOptions.method || 'GET', {
      url: url.toString(),
      headers: {
        ...headers,
        'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...` // Mask API key
      },
      body: fetchOptions.body ? 
        (typeof fetchOptions.body === 'string' ? JSON.parse(fetchOptions.body) : 'FormData') 
        : undefined
    });

    return retryWithBackoff(
      async () => {
        const abortController = new AbortController();
        const requestId = this.generateRequestId();
        this.abortControllers.set(requestId, abortController);

        // Set timeout
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, timeout);

        try {
          const response = await fetch(url.toString(), {
            ...requestOptions,
            signal: abortController.signal,
          });

          clearTimeout(timeoutId);
          this.abortControllers.delete(requestId);

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage: string;
            let errorCode: string | undefined;
            
            try {
              const errorData = JSON.parse(errorText);
              // Handle both direct error format and nested data format
              if (errorData.data && errorData.data.code && errorData.data.message) {
                errorMessage = errorData.data.message;
                errorCode = errorData.data.code.toString();
              } else {
                errorMessage = errorData.message || errorData.error || 'Unknown error';
                errorCode = errorData.code?.toString();
              }
            } catch {
              errorMessage = errorText || `HTTP ${response.status}`;
            }

            // Enhance error messages based on status codes and API documentation
            const enhancedMessage = this.getEnhancedErrorMessage(response.status, errorMessage, errorCode);

            logger.apiError(endpoint, {
              status: response.status,
              message: enhancedMessage,
              originalMessage: errorMessage,
              errorCode,
              headers: Object.fromEntries(response.headers.entries())
            });

            throw new APIError(response.status, enhancedMessage, errorCode);
          }

          const data = await response.json();
          
          logger.apiResponse(endpoint, response.status, {
            headers: Object.fromEntries(response.headers.entries()),
            dataPreview: JSON.stringify(data).substring(0, 200) + '...'
          });

          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          this.abortControllers.delete(requestId);
          
          if (error instanceof APIError) {
            throw error;
          }
          
          if (error instanceof Error && error.name === 'AbortError') {
            throw new APIError(408, 'Request timeout');
          }
          
          throw new APIError(0, error instanceof Error ? error.message : 'Network error');
        }
      },
      retryAttempts,
      this.retryDelay
    );
  }

  /**
   * Streaming request method for real-time responses
   */
  private async streamRequest(
    endpoint: string,
    options: RequestOptions = {},
    streamOptions: StreamOptions = {}
  ): Promise<void> {
    const {
      timeout = 60000, // Longer timeout for streaming
      params,
      ...fetchOptions
    } = options;

    const { onChunk, onComplete, onError } = streamOptions;
    
    logger.info('API_CLIENT', 'Starting stream request', {
      endpoint,
      method: options.method || 'GET',
      hasBody: !!fetchOptions.body,
      bodyContent: fetchOptions.body ? (typeof fetchOptions.body === 'string' ? JSON.parse(fetchOptions.body) : 'FormData') : undefined
    });

    // Build URL with stream parameter - CustomGPT requires stream=1 in query params
    const url = new URL(`${this.baseURL}${endpoint}`);
    url.searchParams.append('stream', '1');
    url.searchParams.append('lang', 'en'); // Add required lang parameter
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const abortController = new AbortController();
    const requestId = this.generateRequestId();
    this.abortControllers.set(requestId, abortController);

    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    try {
      logger.apiRequest(endpoint, fetchOptions.method || 'POST', {
        url: url.toString(),
        headers: {
          'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined
      });
      
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...fetchOptions.headers,
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        let errorCode: string | undefined;
        
        try {
          const errorData = JSON.parse(errorText);
          // Handle both direct error format and nested data format
          if (errorData.data && errorData.data.code && errorData.data.message) {
            errorMessage = errorData.data.message;
            errorCode = errorData.data.code.toString();
          } else {
            errorMessage = errorData.message || errorData.error || 'Unknown error';
            errorCode = errorData.code?.toString();
          }
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }

        // Enhance error messages
        const enhancedMessage = this.getEnhancedErrorMessage(response.status, errorMessage, errorCode);

        logger.apiError(endpoint, {
          status: response.status,
          message: enhancedMessage,
          originalMessage: errorMessage,
          errorCode,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        throw new APIError(response.status, enhancedMessage, errorCode);
      }
      
      logger.apiResponse(endpoint, response.status, {
        headers: Object.fromEntries(response.headers.entries()),
        contentType: response.headers.get('content-type'),
        isEventStream: response.headers.get('content-type')?.includes('text/event-stream')
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new APIError(500, 'No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        let hasReceivedData = false;
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            logger.info('STREAM', 'Stream ended', { hasReceivedData });
            
            // If we haven't received any data, this might indicate an issue
            if (!hasReceivedData) {
              logger.warn('STREAM', 'Stream ended without receiving any data - possible API issue');
              onError?.(new Error('No data received from stream - the API may not support streaming or there was a connection issue'));
              return;
            }
            
            onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              hasReceivedData = true;
              
              logger.debug('STREAM', 'Raw SSE line received', { 
                line: line.substring(0, 200),
                fullLine: line,
                lineLength: line.length 
              });
              
              const chunk = parseStreamChunk(line);
              if (chunk) {
                logger.debug('STREAM', 'Successfully parsed chunk', { 
                  type: chunk.type, 
                  hasContent: !!chunk.content,
                  contentPreview: chunk.content?.substring(0, 100),
                  hasCitations: !!chunk.citations
                });
                
                if (chunk.type === 'done') {
                  logger.info('STREAM', 'Stream completed with done signal');
                  onComplete?.();
                  return;
                } else if (chunk.type === 'error') {
                  logger.error('STREAM', 'Stream error received', { error: chunk.error });
                  onError?.(new Error(chunk.error || 'Stream error'));
                  return;
                } else {
                  onChunk?.(chunk);
                }
              } else {
                logger.warn('STREAM', 'Failed to parse chunk or chunk was null', { 
                  originalLine: line.substring(0, 200) 
                });
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof APIError) {
        onError?.(error);
      } else if (error instanceof Error && error.name === 'AbortError') {
        onError?.(new APIError(408, 'Request timeout'));
      } else {
        onError?.(new APIError(0, error instanceof Error ? error.message : 'Network error'));
      }
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel a request by ID
   */
  public cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all active requests
   */
  public cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Enhance error messages based on API documentation and status codes
   */
  private getEnhancedErrorMessage(status: number, originalMessage: string, errorCode?: string): string {
    // Handle specific error codes from API documentation
    switch (status) {
      case 400:
        if (originalMessage.includes('Agent id must be integer')) {
          return 'Invalid agent ID provided. Please ensure you have selected a valid agent.';
        }
        if (originalMessage.includes('Agent name can\'t be empty')) {
          return 'Agent name cannot be empty. Please provide a valid agent name.';
        }
        return 'Invalid request data. Please check your input and try again.';
      
      case 401:
        if (originalMessage.includes('API Token is either missing or invalid')) {
          return 'Authentication failed. Your API key is missing or invalid. Please check your API key in settings and ensure it has proper permissions.';
        }
        return 'Authentication failed. Please check your API key and try again.';
      
      case 403:
        if (originalMessage.includes('license')) {
          return 'You do not have permission to manage licenses for this agent. Please ensure your API key has the necessary permissions or you are the owner of this agent.';
        }
        if (originalMessage.includes('Licenses are not allowed')) {
          return 'License management is not enabled for this agent. Please enable licenses in the agent settings first.';
        }
        return 'Access denied. You do not have permission to perform this action. Please check your API key permissions.';
      
      case 404:
        if (originalMessage.includes('Agent with id')) {
          return 'The selected agent was not found or you don\'t have access to it. Please select a different agent or check your permissions.';
        }
        if (originalMessage.includes('Agent license with id')) {
          return 'The specified license was not found. It may have been deleted or you may not have access to it.';
        }
        if (originalMessage.includes('Conversation message with id') || originalMessage.includes('not found')) {
          return 'The requested conversation or message was not found. It may have been deleted or you may not have access to it.';
        }
        return 'The requested resource was not found. Please check if it exists and you have access to it.';
      
      case 429:
        if (originalMessage.includes('exhausted your current query credits')) {
          return 'You have reached your query limit. Please upgrade your plan or contact customer support at https://customgpt.freshdesk.com/support/home for assistance.';
        }
        return 'Rate limit exceeded. Please wait a moment and try again, or contact support if you need higher limits.';
      
      case 500:
        if (originalMessage.includes('Internal Server Error')) {
          return 'Server error occurred. Please try again in a few moments. If the problem persists, contact customer support.';
        }
        return 'An unexpected server error occurred. Please try again later.';
      
      case 501:
        if (originalMessage.includes('audio is not yet supported')) {
          return 'Audio files are not currently supported. Please remove any audio files from your request and try again with text or other supported file types.';
        }
        return 'This feature is not yet implemented. Please try a different approach.';
      
      case 408:
        return 'Request timed out. Please check your internet connection and try again.';
      
      case 422:
        // Unprocessable Entity - often used for validation errors
        if (originalMessage.includes('Agent id must be integer')) {
          return 'Invalid agent ID format. Please ensure the agent ID is a valid number.';
        }
        return 'Invalid data provided. Please check your input and ensure all required fields are correctly formatted.';
      
      default:
        // For other status codes, return the original message with context
        if (status >= 500) {
          return `Server error (${status}): ${originalMessage}. Please try again later.`;
        } else if (status >= 400) {
          return `Request error (${status}): ${originalMessage}. Please check your input and try again.`;
        }
        return originalMessage;
    }
  }

  // AGENTS/PROJECTS API METHODS

  /**
   * Get list of agents
   */
  async getAgents(params?: {
    page?: number;
    duration?: number;
    order?: 'asc' | 'desc';
    orderBy?: 'id' | 'created_at';
    name?: string;
  }): Promise<AgentsResponse> {
    return this.request<AgentsResponse>('/projects', { params });
  }

  /**
   * Create new agent/project
   */
  async createAgent(data: {
    project_name: string;
    sitemap_path?: string;
    files?: File[];
    is_shared?: boolean;
  }): Promise<APIResponse<Agent>> {
    // API requires multipart/form-data
    const formData = new FormData();
    formData.append('project_name', data.project_name);
    
    if (data.sitemap_path) {
      formData.append('sitemap_path', data.sitemap_path);
    }
    
    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
    }
    
    if (data.is_shared !== undefined) {
      formData.append('is_shared', data.is_shared.toString());
    }
    
    return this.request<APIResponse<Agent>>('/projects', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Get single agent by ID
   */
  async getAgent(id: number): Promise<APIResponse<Agent>> {
    return this.request<APIResponse<Agent>>(`/projects/${id}`);
  }


  /**
   * Update agent - API only supports updating are_licenses_allowed
   */
  async updateAgent(id: number, data: { are_licenses_allowed?: boolean }): Promise<APIResponse<Agent>> {
    const formData = new FormData();
    if (data.are_licenses_allowed !== undefined) {
      formData.append('are_licenses_allowed', data.are_licenses_allowed.toString());
    }
    
    return this.request<APIResponse<Agent>>(`/projects/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: number): Promise<APIResponse<{ deleted: boolean }>> {
    return this.request<APIResponse<{ deleted: boolean }>>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
  
  /**
   * Replicate agent
   */
  async replicateAgent(id: number): Promise<APIResponse<Agent>> {
    return this.request<APIResponse<Agent>>(`/projects/${id}/replicate`, {
      method: 'POST',
    });
  }
  
  /**
   * Get agent stats
   */
  async getAgentStats(id: number): Promise<APIResponse<AgentStats>> {
    return this.request<APIResponse<AgentStats>>(`/projects/${id}/stats`);
  }

  /**
   * Get agent settings
   */
  async getAgentSettings(id: number): Promise<APIResponse<AgentSettings>> {
    return this.request<APIResponse<AgentSettings>>(`/projects/${id}/settings`);
  }

  /**
   * Update agent settings
   */
  async updateAgentSettings(id: number, settings: Partial<AgentSettings> | FormData): Promise<APIResponse<AgentSettings>> {
    const isFormData = settings instanceof FormData;
    
    return this.request<APIResponse<AgentSettings>>(`/projects/${id}/settings`, {
      method: 'POST',
      body: isFormData ? settings : JSON.stringify(settings),
    });
  }

  // CONVERSATIONS API METHODS

  /**
   * Get conversations for a project
   */
  async getConversations(projectId: number, params?: {
    page?: number;
    order?: 'asc' | 'desc';
    orderBy?: 'id' | 'created_at';
    name?: string;
    userFilter?: 'all' | string;
  }): Promise<ConversationsResponse> {
    const enhancedParams = {
      ...params,
      userFilter: params?.userFilter || 'all'
    };
    return this.request<ConversationsResponse>(`/projects/${projectId}/conversations`, { params: enhancedParams });
  }

  /**
   * Create new conversation
   */
  async createConversation(projectId: number, data?: { name?: string }): Promise<APIResponse<Conversation>> {
    return this.request<APIResponse<Conversation>>(`/projects/${projectId}/conversations`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : JSON.stringify({}),
    });
  }

  /**
   * Update conversation
   */
  async updateConversation(
    projectId: number,
    sessionId: string,
    data: { name: string }
  ): Promise<APIResponse<Conversation>> {
    return this.request<APIResponse<Conversation>>(`/projects/${projectId}/conversations/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete conversation
   */
  async deleteConversation(projectId: number, sessionId: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.request<APIResponse<{ deleted: boolean }>>(`/projects/${projectId}/conversations/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // MESSAGES API METHODS

  /**
   * Get messages for a conversation
   * Note: sessionId here is actually the session_id from the conversation, not the conversation id
   */
  async getMessages(
    projectId: number,
    sessionId: string,
    params?: { page?: number; order?: 'asc' | 'desc' }
  ): Promise<MessagesResponse> {
    // Add required parameters for message retrieval
    const enhancedParams = {
      ...params,
      stream: false,
      lang: 'en'
    };
    return this.request<MessagesResponse>(`/projects/${projectId}/conversations/${sessionId}/messages`, { params: enhancedParams });
  }

  /**
   * Send message (non-streaming)
   * Note: sessionId here is actually the session_id from the conversation, not the conversation id
   */
  async sendMessage(
    projectId: number,
    sessionId: string,
    data: {
      prompt: string;
      custom_persona?: string;
      chatbot_model?: string;
      response_source?: 'default' | 'own_content' | 'openai_content';
      stream?: number;
    }
  ): Promise<MessageResponse> {
    // Include required fields as per API documentation
    const payload = {
      prompt: data.prompt,
      response_source: data.response_source || 'default',
      custom_persona: data.custom_persona,
      chatbot_model: data.chatbot_model,
      stream: 0
    };
    
    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    
    return this.request<MessageResponse>(`/projects/${projectId}/conversations/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
      params: { 
        stream: false, 
        lang: 'en' 
      }
    });
  }

  /**
   * Send message with streaming
   * Note: sessionId here is actually the session_id from the conversation, not the conversation id
   */
  async sendMessageStream(
    projectId: number,
    sessionId: string,
    data: {
      prompt: string;
      custom_persona?: string;
      chatbot_model?: string;
      response_source?: 'default' | 'own_content' | 'openai_content';
      stream?: number;
    },
    streamOptions: StreamOptions
  ): Promise<void> {
    // Include required fields as per API documentation
    const payload = {
      prompt: data.prompt,
      response_source: data.response_source || 'default',
      custom_persona: data.custom_persona,
      chatbot_model: data.chatbot_model,
      stream: 1
    };
    
    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    
    logger.info('API_CLIENT', 'Sending streaming message', {
      projectId,
      sessionId,
      prompt: data.prompt.substring(0, 50),
      hasCustomPersona: !!data.custom_persona,
      responseSource: payload.response_source,
      streamParam: payload.stream
    });
    
    return this.streamRequest(
      `/projects/${projectId}/conversations/${sessionId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        params: {
          stream: 1, // Also include in query params
          lang: 'en'
        }
      },
      streamOptions
    );
  }

  /**
   * Get a message by ID
   */
  async getMessageById(
    projectId: number,
    sessionId: string,
    promptId: number
  ): Promise<APIMessageResponse> {
    return this.request<APIMessageResponse>(
      `/projects/${projectId}/conversations/${sessionId}/messages/${promptId}`
    );
  }

  /**
   * Update message feedback
   */
  async updateMessageFeedback(
    projectId: number,
    sessionId: string,
    promptId: number,
    data: { reaction: 'neutral' | 'disliked' | 'liked' }
  ): Promise<APIMessageResponse> {
    return this.request<APIMessageResponse>(
      `/projects/${projectId}/conversations/${sessionId}/messages/${promptId}/feedback`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Send message in OpenAI format
   */
  async sendMessageOpenAIFormat(
    projectId: number,
    data: {
      messages?: Array<{ role: string; content: string }>;
      stream?: boolean;
      lang?: string;
      is_inline_citation?: boolean;
    }
  ): Promise<any> {
    return this.request<any>(`/projects/${projectId}/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        stream: data.stream ?? false,
        lang: data.lang || 'en',
        is_inline_citation: data.is_inline_citation ?? false
      }),
    });
  }

  // CITATIONS API METHODS

  /**
   * Get citation details
   */
  async getCitation(projectId: number, citationId: number): Promise<CitationResponse> {
    return this.request<CitationResponse>(`/projects/${projectId}/citations/${citationId}`);
  }

  // SOURCES API METHODS


  /**
   * Upload file to project
   */
  async uploadFile(projectId: number, file: File, options?: {
    file_data_retension?: boolean;
    is_ocr_enabled?: boolean;
    is_anonymized?: boolean;
  }): Promise<APIResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
    }

    return this.request<APIResponse<any>>(`/projects/${projectId}/sources`, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Analytics APIs
   */
  async getConversationAnalytics(
    projectId: number, 
    params?: {
      start_date?: string;
      end_date?: string;
      limit?: number;
    }
  ): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<APIResponse<any>>(`/projects/${projectId}/analytics/conversations${queryParams.toString() ? `?${queryParams}` : ''}`);
  }

  async getQueryAnalytics(
    projectId: number,
    params?: {
      start_date?: string;
      end_date?: string;
      limit?: number;
    }
  ): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<APIResponse<any>>(`/projects/${projectId}/analytics/queries${queryParams.toString() ? `?${queryParams}` : ''}`);
  }

  async getTrafficAnalytics(
    projectId: number,
    params?: {
      start_date?: string;
      end_date?: string;
      period?: 'hour' | 'day' | 'week' | 'month';
    }
  ): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.period) queryParams.append('period', params.period);
    
    return this.request<APIResponse<any>>(`/projects/${projectId}/analytics/traffic${queryParams.toString() ? `?${queryParams}` : ''}`);
  }

  async getStatistics(projectId: number): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/analytics/statistics`);
  }

  // Reports and Analytics methods
  async getTrafficReport(projectId: number): Promise<TrafficReportResponse> {
    return this.request<TrafficReportResponse>(`/projects/${projectId}/reports/traffic`, {
      method: 'GET',
    });
  }

  async getQueriesReport(projectId: number): Promise<QueriesReportResponse> {
    return this.request<QueriesReportResponse>(`/projects/${projectId}/reports/queries`, {
      method: 'GET',
    });
  }

  async getConversationsReport(projectId: number): Promise<ConversationsReportResponse> {
    return this.request<ConversationsReportResponse>(`/projects/${projectId}/reports/conversations`, {
      method: 'GET',
    });
  }

  async getAnalysisReport(projectId: number, interval?: AnalysisInterval): Promise<AnalysisReportResponse> {
    const queryParams = new URLSearchParams();
    if (interval) {
      queryParams.append('interval', interval);
    }
    
    return this.request<AnalysisReportResponse>(
      `/projects/${projectId}/reports/analysis${queryParams.toString() ? `?${queryParams}` : ''}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Page Management APIs
   */
  async getPages(
    projectId: number,
    params?: PagesQueryParams
  ): Promise<PagesListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.order) queryParams.append('order', params.order);
    if (params?.crawl_status) queryParams.append('crawl_status', params.crawl_status);
    if (params?.index_status) queryParams.append('index_status', params.index_status);
    
    return this.request<PagesListResponse>(
      `/projects/${projectId}/pages${queryParams.toString() ? `?${queryParams}` : ''}`
    );
  }

  async deletePage(projectId: number, pageId: number): Promise<DeletePageResponse> {
    return this.request<DeletePageResponse>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  async reindexPage(projectId: number, pageId: number): Promise<ReindexPageResponse> {
    return this.request<ReindexPageResponse>(`/projects/${projectId}/pages/${pageId}/reindex`, {
      method: 'POST',
    });
  }

  // Page Metadata methods
  async getPageMetadata(projectId: number, pageId: number): Promise<PageMetadataResponse> {
    return this.request<PageMetadataResponse>(`/projects/${projectId}/pages/${pageId}/metadata`, {
      method: 'GET',
    });
  }

  async updatePageMetadata(
    projectId: number, 
    pageId: number,
    metadata: Partial<PageMetadata>
  ): Promise<PageMetadataResponse> {
    return this.request<PageMetadataResponse>(`/projects/${projectId}/pages/${pageId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    });
  }

  async previewFile(pageId: number): Promise<any> {
    return this.request<any>(`/preview/${pageId}`);
  }


  /**
   * Agent License Management APIs
   */
  
  /**
   * Get all licenses for an agent
   */
  async getLicenses(projectId: number): Promise<APIResponse<any[]>> {
    return this.request<APIResponse<any[]>>(`/projects/${projectId}/licenses`);
  }

  /**
   * Create a new license for an agent
   */
  async createLicense(projectId: number, data: { name: string }): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/licenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a specific license for an agent
   */
  async getLicense(projectId: number, licenseId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/licenses/${licenseId}`);
  }

  /**
   * Update a license for an agent
   */
  async updateLicense(
    projectId: number,
    licenseId: string,
    data: { name: string }
  ): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/licenses/${licenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a license for an agent
   */
  async deleteLicense(projectId: number, licenseId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/licenses/${licenseId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Sources Management APIs
   */
  async getSources(projectId: number): Promise<SourcesListResponse> {
    return this.request<SourcesListResponse>(`/projects/${projectId}/sources`);
  }

  async createSitemapSource(
    projectId: number,
    data: CreateSitemapSourceRequest
  ): Promise<SourceResponse> {
    return this.request<SourceResponse>(`/projects/${projectId}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadFileSource(projectId: number, formData: FormData): Promise<SourceResponse> {
    return this.request<SourceResponse>(`/projects/${projectId}/sources`, {
      method: 'POST',
      body: formData,
    });
  }

  async updateSourceSettings(
    projectId: number,
    sourceId: number,
    settings: UpdateSourceSettingsRequest
  ): Promise<SourceResponse> {
    return this.request<SourceResponse>(`/projects/${projectId}/sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async deleteSource(projectId: number, sourceId: number): Promise<DeleteSourceResponse> {
    return this.request<DeleteSourceResponse>(`/projects/${projectId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  }

  async instantSyncSource(projectId: number, sourceId: number): Promise<SourceResponse> {
    return this.request<SourceResponse>(`/projects/${projectId}/sources/${sourceId}/instant-sync`, {
      method: 'PUT',
    });
  }

  // LIMITS API METHODS
  
  /**
   * Get user's agents, words and queries limit
   */
  async getUserLimits(): Promise<LimitsResponse> {
    return this.request<LimitsResponse>('/limits/usage');
  }

  // User Profile API Methods
  async getUserProfile(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/user');
  }

  async updateUserProfile(formData: FormData): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/user', {
      method: 'POST',
      body: formData,
    });
  }


  // Generic request methods for use by stores
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Default client instance (will be initialized with API key)
let defaultClient: CustomGPTAPIClient | null = null;

export function getClient(): CustomGPTAPIClient {
  if (!defaultClient) {
    throw new Error('API client not initialized. Call initializeClient() first.');
  }
  return defaultClient;
}

export function initializeClient(config: CustomGPTClientConfig): CustomGPTAPIClient {
  defaultClient = new CustomGPTAPIClient(config);
  return defaultClient;
}

export function isClientInitialized(): boolean {
  return defaultClient !== null;
}