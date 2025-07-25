// Core Types for CustomGPT.ai Chat UI

export interface Agent {
  id: number;
  project_name: string;
  sitemap_path?: string;
  is_chat_active: boolean;
  user_id: number;
  team_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  type: 'SITEMAP' | 'FILE' | string;
  is_shared: boolean;
  shareable_slug?: string;
  shareable_link?: string;
  embed_code?: string;
  live_chat_code?: string;
  are_licenses_allowed?: boolean;
  settings?: AgentSettings;
}

export interface AgentStats {
  pages_found: number;
  pages_crawled: number;
  pages_indexed: number;
  crawl_credits_used: number;
  query_credits_used: number;
  total_queries: number;
  total_words_indexed: number;
  total_storage_credits_used: number;
}

export interface AgentSettings {
  // Appearance
  chatbot_avatar?: string;
  chatbot_background_type?: 'image' | 'color';
  chatbot_background?: string;
  chatbot_background_color?: string;
  chatbot_color?: string;
  chatbot_toolbar_color?: string;
  chatbot_title?: string;
  chatbot_title_color?: string;
  user_avatar?: string;
  spotlight_avatar_enabled?: boolean;
  spotlight_avatar?: string;
  spotlight_avatar_shape?: 'rectangle' | 'circle';
  spotlight_avatar_type?: 'default' | 'custom';
  user_avatar_orientation?: 'agent-left-user-right' | 'agent-right-user-left';
  
  // Messages & Behavior
  default_prompt?: string;
  example_questions?: string[];
  persona_instructions?: string;
  response_source?: 'own_content' | 'openai_content' | 'default';
  chatbot_model?: string;
  chatbot_msg_lang?: string;
  input_field_addendum?: string;
  
  // Messages
  hang_in_there_msg?: string;
  chatbot_siesta_msg?: string;
  no_answer_message?: string;
  ending_message?: string;
  try_asking_questions_msg?: string;
  view_more_msg?: string;
  view_less_msg?: string;
  
  // Citations
  enable_citations?: number;
  citations_view_type?: 'user' | 'show' | 'hide';
  citations_answer_source_label_msg?: string;
  citations_sources_label_msg?: string;
  image_citation_display?: 'default' | 'inline' | 'none';
  enable_inline_citations_api?: boolean;
  hide_sources_from_responses?: boolean;
  
  // Features
  enable_feedbacks?: boolean;
  is_loading_indicator_enabled?: boolean;
  remove_branding?: boolean;
  private_deployment?: boolean;
  enable_recaptcha_for_public_chatbots?: boolean;
  is_selling_enabled?: boolean;
  license_slug?: boolean;
  selling_url?: string;
  can_share_conversation?: boolean;
  can_export_conversation?: boolean;
  conversation_time_window?: boolean;
  conversation_retention_period?: 'year' | 'month' | 'week' | 'day';
  conversation_retention_days?: number;
  enable_agent_knowledge_base_awareness?: boolean;
  markdown_enabled?: boolean;
}

export interface Conversation {
  id: number;
  name: string;
  project_id: number;
  session_id: string;  // This is what we need for API calls
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  message_count?: number;
  created_by?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  feedback?: 'like' | 'dislike';
}

export interface Citation {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  index: number;
  page_id?: number;
  confidence?: number;
}

export interface CitationOpenGraphData {
  id: number;
  url: string;
  title: string;
  description: string;
  image?: string;
}

export interface AgentLicense {
  id?: string;
  name: string;
  key: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface StreamChunk {
  type: 'content' | 'citation' | 'done' | 'error';
  content?: string;
  citations?: Citation[];
  error?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface AgentsResponse {
  data: Agent[];
  total: number;
  page: number;
  per_page: number;
}

export interface ConversationsResponse {
  status: string;
  data: {
    current_page: number;
    data: Conversation[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface MessagesResponse {
  data: ChatMessage[];
  total: number;
  page: number;
  per_page: number;
}

export interface MessageResponse {
  data: ChatMessage;
}

export interface CitationResponse {
  status: string;
  data: CitationOpenGraphData;
}

// Configuration Types
export interface ChatConfig {
  apiKey: string;
  baseURL?: string;
  projectId?: number;
  mode: 'standalone' | 'widget' | 'floating';
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  width?: string;
  height?: string;
  enableCitations?: boolean;
  enableFeedback?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface WidgetConfig extends ChatConfig {
  mode: 'widget' | 'floating';
  containerId?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: ChatMessage) => void;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'md' | 'lg';
}

// Error Types
export interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

// Hook Types
export interface UseMessagesOptions {
  projectId: number;
  sessionId: string;
  enabled?: boolean;
}

export interface UseSendMessageOptions {
  onSuccess?: (message: ChatMessage) => void;
  onError?: (error: APIError) => void;
  onStream?: (chunk: StreamChunk) => void;
}

// Stream Handler Types
export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onCitation?: (citation: Citation) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface StreamHandlerConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Utility Types
export type DeploymentMode = 'standalone' | 'widget' | 'floating';
export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'sent' | 'error';
export type FeedbackType = 'like' | 'dislike';
export type FileStatus = 'uploading' | 'uploaded' | 'error';

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface MessageProps extends BaseComponentProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isLast?: boolean;
  onCitationClick?: (citation: Citation) => void;
  onFeedback?: (feedback: FeedbackType) => void;
}

export interface InputProps extends BaseComponentProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface CitationProps extends BaseComponentProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
  maxVisible?: number;
}

// Store Types (Zustand)
export interface ConfigStore {
  apiKey: string | null;
  baseURL: string;
  theme: 'light' | 'dark';
  setApiKey: (key: string) => void;
  setBaseURL: (url: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface AgentStore {
  agents: Agent[];
  currentAgent: Agent | null;
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (data: {
    project_name: string;
    sitemap_path?: string;
    files?: File[];
    is_shared?: boolean;
  }) => Promise<Agent>;
  selectAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: number, data: { are_licenses_allowed?: boolean }) => Promise<Agent>;
  deleteAgent: (id: number) => Promise<void>;
  replicateAgent: (id: number) => Promise<Agent>;
  getAgentStats: (id: number) => Promise<AgentStats>;
}

export interface ConversationStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  fetchConversations: (projectId: number) => Promise<void>;
  createConversation: (projectId: number, name?: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: string | number) => Promise<void>;
  updateConversation: (conversationId: number, sessionId: string, data: { name: string }) => Promise<void>;
  ensureConversation: (projectId: number, firstMessage?: string) => Promise<Conversation>;
}

export interface MessageStore {
  messages: Map<string, ChatMessage[]>;
  streamingMessage: ChatMessage | null;
  isStreaming: boolean;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateStreamingMessage: (content: string, citations?: Citation[]) => void;
  clearMessages: (conversationId?: string) => void;
  updateMessageFeedback: (messageId: string, feedback: FeedbackType) => void;
  cancelStreaming: () => void;
  getMessagesForConversation: (conversationId: string) => ChatMessage[];
  loadMessages: (conversationId: string) => Promise<void>;
}

export interface UIStore extends UIState {
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
}

// User Profile Types (CustomGPT.ai API)
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  current_team_id: number;
  profile_photo_url: string;
  created_at: string; // date-time format
  updated_at: string; // date-time format
}

// Limits Types (CustomGPT.ai API)
export interface UserLimits {
  max_projects_num: number;
  current_projects_num: number;
  max_total_storage_credits: number;
  current_total_storage_credits: number;
  max_queries: number;
  current_queries: number;
}

export interface LimitsResponse {
  status: string;
  data: UserLimits;
}

// CustomGPT.ai User Profile Store
export interface UserProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Profile Management (only what CustomGPT.ai API supports)
  fetchProfile: () => Promise<void>;
  updateProfile: (name: string, profilePhoto?: File) => Promise<void>;
  
  // Utility
  reset: () => void;
}