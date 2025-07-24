import type {
  Agent,
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
} from '@/types';
import { parseStreamChunk, retryWithBackoff, delay } from '@/lib/utils';
import { logger } from '@/lib/logger';

export interface CustomGPTClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retryAttempts?: number;
  params?: Record<string, string | number | boolean>;
}

export interface StreamOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export class CustomGPTAPIClient {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: CustomGPTClientConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://app.customgpt.ai/api/v1';
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    
    logger.info('API_CLIENT', 'CustomGPT API Client initialized', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      hasApiKey: !!this.apiKey,
      apiKeyPreview: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'none'
    });
  }

  /**
   * Generic request method with retry logic and error handling
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
            
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || 'Unknown error';
            } catch {
              errorMessage = errorText || `HTTP ${response.status}`;
            }

            logger.apiError(endpoint, {
              status: response.status,
              message: errorMessage,
              headers: Object.fromEntries(response.headers.entries())
            });

            throw new APIError(response.status, errorMessage);
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
      hasBody: !!fetchOptions.body
    });

    // Build URL with stream parameter
    const url = new URL(`${this.baseURL}${endpoint}`);
    url.searchParams.append('stream', 'true');
    url.searchParams.append('lang', 'en'); // Add missing lang parameter
    
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
        logger.apiError(endpoint, {
          status: response.status,
          message: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new APIError(response.status, errorText);
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
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              logger.debug('STREAM', 'Received SSE line', { line: line.substring(0, 100) });
              const chunk = parseStreamChunk(line);
              if (chunk) {
                logger.debug('STREAM', 'Parsed chunk', { type: chunk.type, hasContent: !!chunk.content });
                if (chunk.type === 'done') {
                  onComplete?.();
                  return;
                } else if (chunk.type === 'error') {
                  onError?.(new Error(chunk.error || 'Stream error'));
                  return;
                } else {
                  onChunk?.(chunk);
                }
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
    default_prompt?: string;
    example_questions?: string[];
    persona_instructions?: string;
    chatbot_color?: string;
    chatbot_model?: string;
    chatbot_msg_lang?: string;
    is_shared?: boolean;
  }): Promise<APIResponse<Agent>> {
    return this.request<APIResponse<Agent>>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get single agent by ID
   */
  async getAgent(id: number): Promise<APIResponse<Agent>> {
    return this.request<APIResponse<Agent>>(`/projects/${id}`);
  }


  /**
   * Update agent
   */
  async updateAgent(id: number, data: Partial<Agent>): Promise<APIResponse<Agent>> {
    return this.request<APIResponse<Agent>>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: number): Promise<APIResponse<{ success: boolean }>> {
    return this.request<APIResponse<{ success: boolean }>>(`/projects/${id}`, {
      method: 'DELETE',
    });
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
  async updateAgentSettings(id: number, settings: Partial<AgentSettings>): Promise<APIResponse<AgentSettings>> {
    return this.request<APIResponse<AgentSettings>>(`/projects/${id}/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
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
  }): Promise<ConversationsResponse> {
    return this.request<ConversationsResponse>(`/projects/${projectId}/conversations`, { params });
  }

  /**
   * Create new conversation
   */
  async createConversation(projectId: number, data: { name: string }): Promise<APIResponse<Conversation>> {
    return this.request<APIResponse<Conversation>>(`/projects/${projectId}/conversations`, {
      method: 'POST',
      body: JSON.stringify(data),
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
  async deleteConversation(projectId: number, sessionId: string): Promise<APIResponse<{ success: boolean }>> {
    return this.request<APIResponse<{ success: boolean }>>(`/projects/${projectId}/conversations/${sessionId}`, {
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
    // Include stream: 0 in the body as per SDK examples
    const payload = {
      ...data,
      stream: 0
    };
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
    // Include stream: 1 in the body as per SDK examples
    const payload = {
      ...data,
      stream: 1
    };
    return this.streamRequest(
      `/projects/${projectId}/conversations/${sessionId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      streamOptions
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
  ): Promise<MessageResponse> {
    return this.request<MessageResponse>(
      `/projects/${projectId}/conversations/${sessionId}/messages/${promptId}/feedback`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
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
   * Get sources for a project
   */
  async getSources(projectId: number): Promise<APIResponse<any[]>> {
    return this.request<APIResponse<any[]>>(`/projects/${projectId}/sources`);
  }

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

  async getAnalysisReports(
    projectId: number,
    params?: {
      report_type?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.report_type) queryParams.append('report_type', params.report_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    return this.request<APIResponse<any>>(`/projects/${projectId}/reports/analysis${queryParams.toString() ? `?${queryParams}` : ''}`);
  }

  /**
   * Page Management APIs
   */
  async getPages(projectId: number): Promise<APIResponse<any[]>> {
    return this.request<APIResponse<any[]>>(`/projects/${projectId}/pages`);
  }

  async getPage(projectId: number, pageId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/pages/${pageId}`);
  }

  async createPage(
    projectId: number,
    page: {
      title: string;
      content: string;
      metadata?: Record<string, any>;
      status?: 'active' | 'draft' | 'archived';
    }
  ): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  async updatePage(
    projectId: number,
    pageId: string,
    updates: Partial<{
      title: string;
      content: string;
      metadata?: Record<string, any>;
      status?: 'active' | 'draft' | 'archived';
    }>
  ): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePage(projectId: number, pageId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  async updatePageMetadata(
    projectId: number,
    pageId: string,
    metadata: Record<string, any>
  ): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/pages/${pageId}/metadata`, {
      method: 'POST',
      body: JSON.stringify({ metadata }),
    });
  }

  async reindexProject(projectId: number): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/reindex`, {
      method: 'POST',
    });
  }

  /**
   * Enhanced Source Management APIs
   */
  async getSource(projectId: number, sourceId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/sources/${sourceId}`);
  }

  async updateSource(
    projectId: number,
    sourceId: string,
    updates: {
      name?: string;
      metadata?: Record<string, any>;
      status?: 'active' | 'inactive' | 'processing' | 'error';
    }
  ): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSource(projectId: number, sourceId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  }

  async syncSources(projectId: number): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/projects/${projectId}/sources/sync`, {
      method: 'POST',
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