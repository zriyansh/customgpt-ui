/**
 * Core Types for CustomGPT.ai Chat UI
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types define the data structures for agents (chatbots), conversations, messages,
 * and various API responses from the CustomGPT.ai backend.
 * 
 * For contributors:
 * - All API response types should match the CustomGPT.ai API documentation
 * - When adding new features, define types here first
 * - Use descriptive names and add JSDoc comments for clarity
 */

/**
 * Agent represents a chatbot instance in CustomGPT.ai
 * Each agent can be trained on different data sources (sitemap, files, etc.)
 * and has customizable appearance and behavior settings
 */
export interface Agent {
  /** Unique identifier for the agent */
  id: number;
  
  /** Display name of the agent/project */
  project_name: string;
  
  /** URL of the sitemap used to train the agent (for SITEMAP type) */
  sitemap_path?: string;
  
  /** Whether the chat functionality is enabled for this agent */
  is_chat_active: boolean;
  
  /** ID of the user who owns this agent */
  user_id: number;
  
  /** ID of the team this agent belongs to */
  team_id: number;
  
  /** Timestamp when the agent was created */
  created_at: string;
  
  /** Timestamp when the agent was last updated */
  updated_at: string;
  
  /** Timestamp when the agent was deleted (soft delete) */
  deleted_at?: string | null;
  
  /** Type of data source used to train the agent */
  type: 'SITEMAP' | 'FILE' | string;
  
  /** Whether this agent can be shared publicly */
  is_shared: boolean;
  
  /** Unique slug for sharing the agent */
  shareable_slug?: string;
  
  /** Full URL for accessing the shared agent */
  shareable_link?: string;
  
  /** HTML code snippet for embedding the agent in websites */
  embed_code?: string;
  
  /** JavaScript code for adding live chat widget to websites */
  live_chat_code?: string;
  
  /** Whether license-based access control is enabled */
  are_licenses_allowed?: boolean;
  
  /** Customizable settings for agent appearance and behavior */
  settings?: AgentSettings;
}

/**
 * Statistics and usage metrics for an agent
 * Used to track resource consumption and agent performance
 */
export interface AgentStats {
  /** Total number of pages discovered during crawling */
  pages_found: number;
  
  /** Number of pages actually crawled and processed */
  pages_crawled: number;
  
  /** Number of pages successfully indexed for search */
  pages_indexed: number;
  
  /** Credits consumed during the crawling process */
  crawl_credits_used: number;
  
  /** Credits consumed by user queries */
  query_credits_used: number;
  
  /** Total number of queries made to this agent */
  total_queries: number;
  
  /** Total word count across all indexed content */
  total_words_indexed: number;
  
  /** Total storage credits used by this agent */
  total_storage_credits_used: number;
}

/**
 * Comprehensive settings for customizing agent appearance and behavior
 * These settings control how the chatbot looks and interacts with users
 */
export interface AgentSettings {
  // ========== Appearance Settings ==========
  
  /** URL or path to the chatbot's avatar image */
  chatbot_avatar?: string;
  
  /** Type of background for the chatbot interface */
  chatbot_background_type?: 'image' | 'color';
  
  /** URL to background image (when type is 'image') */
  chatbot_background?: string;
  
  /** Hex color code for background (when type is 'color') */
  chatbot_background_color?: string;
  
  /** Primary color theme for the chatbot UI */
  chatbot_color?: string;
  
  /** Color of the toolbar/header area */
  chatbot_toolbar_color?: string;
  
  /** Display title for the chatbot */
  chatbot_title?: string;
  
  /** Color of the chatbot title text */
  chatbot_title_color?: string;
  
  /** URL or path to the user's avatar image */
  user_avatar?: string;
  
  /** Whether to show a spotlight/highlight avatar */
  spotlight_avatar_enabled?: boolean;
  
  /** URL to the spotlight avatar image */
  spotlight_avatar?: string;
  
  /** Shape of the spotlight avatar */
  spotlight_avatar_shape?: 'rectangle' | 'circle';
  
  /** Whether using default or custom spotlight avatar */
  spotlight_avatar_type?: 'default' | 'custom';
  
  /** Layout orientation for avatars in the chat */
  user_avatar_orientation?: 'agent-left-user-right' | 'agent-right-user-left';
  
  // ========== Messages & Behavior Settings ==========
  
  /** Default prompt shown to users when they start a conversation */
  default_prompt?: string;
  
  /** List of example questions to help users get started */
  example_questions?: string[];
  
  /** Custom instructions that define the chatbot's personality and behavior */
  persona_instructions?: string;
  
  /** Source of responses - from trained content, OpenAI, or default */
  response_source?: 'own_content' | 'openai_content' | 'default';
  
  /** AI model used for generating responses (e.g., 'gpt-3.5-turbo', 'gpt-4') */
  chatbot_model?: string;
  
  /** Language code for chatbot responses (e.g., 'en', 'es', 'fr') */
  chatbot_msg_lang?: string;
  
  /** Additional text shown below the input field */
  input_field_addendum?: string;
  
  // ========== Custom Messages ==========
  
  /** Message shown while the bot is processing a response */
  hang_in_there_msg?: string;
  
  /** Message shown when the bot is temporarily unavailable */
  chatbot_siesta_msg?: string;
  
  /** Message shown when the bot cannot find an answer */
  no_answer_message?: string;
  
  /** Message shown at the end of a conversation */
  ending_message?: string;
  
  /** Prompt encouraging users to ask questions */
  try_asking_questions_msg?: string;
  
  /** Label for expanding content */
  view_more_msg?: string;
  
  /** Label for collapsing content */
  view_less_msg?: string;
  
  // ========== Citation Settings ==========
  
  /** Whether to show source citations (0 = disabled, 1 = enabled) */
  enable_citations?: number;
  
  /** How citations are displayed in the chat */
  citations_view_type?: 'user' | 'show' | 'hide';
  
  /** Label for the answer source section */
  citations_answer_source_label_msg?: string;
  
  /** Label for the sources section */
  citations_sources_label_msg?: string;
  
  /** How images in citations are displayed */
  image_citation_display?: 'default' | 'inline' | 'none';
  
  /** Whether to enable inline citations in API responses */
  enable_inline_citations_api?: boolean;
  
  /** Whether to hide source links from chat responses */
  hide_sources_from_responses?: boolean;
  
  // ========== Feature Toggles ==========
  
  /** Allow users to provide feedback (thumbs up/down) on responses */
  enable_feedbacks?: boolean;
  
  /** Show typing/loading indicator while bot is responding */
  is_loading_indicator_enabled?: boolean;
  
  /** Remove CustomGPT branding from the chat interface */
  remove_branding?: boolean;
  
  /** Whether this is a private/internal deployment */
  private_deployment?: boolean;
  
  /** Enable reCAPTCHA protection for public chatbots */
  enable_recaptcha_for_public_chatbots?: boolean;
  
  /** Enable selling/licensing features for this agent */
  is_selling_enabled?: boolean;
  
  /** Whether license-based access is required */
  license_slug?: boolean;
  
  /** URL where users can purchase access to this agent */
  selling_url?: string;
  
  /** Allow users to share conversation links */
  can_share_conversation?: boolean;
  
  /** Allow users to export conversation history */
  can_export_conversation?: boolean;
  
  /** Whether to enforce conversation time windows */
  conversation_time_window?: boolean;
  
  /** How long to retain conversation history */
  conversation_retention_period?: 'year' | 'month' | 'week' | 'day';
  
  /** Number of days to retain conversations */
  conversation_retention_days?: number;
  
  /** Enable agent to be aware of its own knowledge base limitations */
  enable_agent_knowledge_base_awareness?: boolean;
  
  /** Enable markdown formatting in messages */
  markdown_enabled?: boolean;
}

/**
 * Represents a chat conversation/session with an agent
 * Each conversation maintains its own message history
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: number;
  
  /** Display name for the conversation (can be auto-generated or user-defined) */
  name: string;
  
  /** ID of the agent this conversation belongs to */
  project_id: number;
  
  /** Session ID used for API calls - this is the primary identifier for chat operations */
  session_id: string;
  
  /** Timestamp when the conversation was created */
  created_at: string;
  
  /** Timestamp when the conversation was last updated */
  updated_at: string;
  
  /** Timestamp when the conversation was deleted (soft delete) */
  deleted_at: string | null;
  
  /** Total number of messages in this conversation */
  message_count?: number;
  
  /** ID of the user who created this conversation */
  created_by?: number;
}

/**
 * Represents a single message in a chat conversation
 * Can be from either the user or the AI assistant
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  
  /** Who sent the message - 'user' for human, 'assistant' for AI */
  role: 'user' | 'assistant';
  
  /** The actual message text content (supports markdown if enabled) */
  content: string;
  
  /** Source citations for information in the assistant's response */
  citations?: Citation[];
  
  /** When the message was sent */
  timestamp: string;
  
  /** Current status of the message (useful for optimistic updates) */
  status?: 'sending' | 'sent' | 'error';
  
  /** User's feedback on the assistant's response */
  feedback?: 'like' | 'dislike';
}

/**
 * Citation/source reference for information in an assistant's response
 * Helps users verify the source of information
 */
export interface Citation {
  /** Unique identifier for the citation */
  id: string;
  
  /** Title of the source document/page */
  title: string;
  
  /** Relevant excerpt from the source */
  content: string;
  
  /** Name or description of the source */
  source: string;
  
  /** URL to the original source (if available) */
  url?: string;
  
  /** Position of this citation in the list (for display ordering) */
  index: number;
  
  /** Internal page ID in the knowledge base */
  page_id?: number;
  
  /** Confidence score for this citation's relevance (0-1) */
  confidence?: number;
}

/**
 * OpenGraph metadata for citations
 * Used to display rich previews of citation sources
 */
export interface CitationOpenGraphData {
  /** Citation ID */
  id: number;
  
  /** URL of the cited source */
  url: string;
  
  /** OpenGraph title */
  title: string;
  
  /** OpenGraph description */
  description: string;
  
  /** OpenGraph image URL for preview */
  image?: string;
}

/**
 * License key for accessing a protected agent
 * Used for monetization and access control
 */
export interface AgentLicense {
  /** Unique identifier for the license */
  id?: string;
  
  /** Descriptive name for the license (e.g., "Premium Access", "Enterprise License") */
  name: string;
  
  /** The actual license key that users enter to gain access */
  key: string;
  
  /** ID of the agent this license is for */
  project_id: number;
  
  /** When the license was created */
  created_at: string;
  
  /** When the license was last updated */
  updated_at: string;
}

/**
 * Represents a chunk of data from the streaming response
 * Used for real-time message streaming from the AI
 */
export interface StreamChunk {
  /** Type of chunk being streamed */
  type: 'content' | 'citation' | 'done' | 'error';
  
  /** Text content (for 'content' type chunks) */
  content?: string;
  
  /** Citations (for 'citation' type chunks) */
  citations?: Citation[];
  
  /** Error message (for 'error' type chunks) */
  error?: string;
}

/**
 * Represents a file being uploaded to train or enhance an agent
 * Tracks upload progress and status
 */
export interface FileUpload {
  /** Unique identifier for the upload */
  id: string;
  
  /** Original filename */
  name: string;
  
  /** File size in bytes */
  size: number;
  
  /** MIME type of the file */
  type: string;
  
  /** Current upload status */
  status: 'uploading' | 'uploaded' | 'error';
  
  /** Upload progress percentage (0-100) */
  progress: number;
  
  /** URL where the file can be accessed after upload */
  url?: string;
  
  /** Error message if upload failed */
  error?: string;
}

// ========== API Response Types ==========

/**
 * Generic wrapper for API responses
 * Provides consistent structure for all API calls
 */
export interface APIResponse<T> {
  /** The actual response data */
  data: T;
  
  /** HTTP status code */
  status: number;
  
  /** Optional message from the server */
  message?: string;
}

/**
 * Paginated response for listing agents
 */
export interface AgentsResponse {
  /** Array of agent objects */
  data: Agent[];
  
  /** Total number of agents available */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Number of items per page */
  per_page: number;
}

/**
 * Paginated response for listing conversations
 * Uses Laravel-style pagination structure
 */
export interface ConversationsResponse {
  /** Response status */
  status: string;
  
  /** Pagination data wrapper */
  data: {
    /** Current page number */
    current_page: number;
    
    /** Array of conversation objects */
    data: Conversation[];
    
    /** URL to the first page */
    first_page_url: string;
    
    /** Starting index of items on this page */
    from: number;
    
    /** Total number of pages */
    last_page: number;
    
    /** URL to the last page */
    last_page_url: string;
    
    /** URL to the next page (null if on last page) */
    next_page_url: string | null;
    
    /** Base API path */
    path: string;
    
    /** Number of items per page */
    per_page: number;
    
    /** URL to the previous page (null if on first page) */
    prev_page_url: string | null;
    
    /** Ending index of items on this page */
    to: number;
    
    /** Total number of conversations */
    total: number;
  };
}

/**
 * Paginated response for listing messages in a conversation
 */
export interface MessagesResponse {
  /** Array of messages */
  data: ChatMessage[];
  
  /** Total number of messages */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Number of messages per page */
  per_page: number;
}

/**
 * Response for a single message operation
 */
export interface MessageResponse {
  /** The message object */
  data: ChatMessage;
}

/**
 * Response for fetching citation metadata
 */
export interface CitationResponse {
  /** Response status */
  status: string;
  
  /** Citation metadata with OpenGraph information */
  data: CitationOpenGraphData;
}

// ========== Configuration Types ==========

/**
 * Main configuration object for the chat interface
 * Used to initialize and customize the chat experience
 */
export interface ChatConfig {
  /** API key for authenticating with CustomGPT.ai */
  apiKey: string;
  
  /** Base URL for API calls (defaults to CustomGPT.ai API) */
  baseURL?: string;
  
  /** Default project/agent ID to use */
  projectId?: number;
  
  /** Deployment mode - affects layout and behavior */
  mode: 'standalone' | 'widget' | 'floating';
  
  /** Color theme for the interface */
  theme?: 'light' | 'dark';
  
  /** Position of floating widget (only for 'floating' mode) */
  position?: 'bottom-right' | 'bottom-left';
  
  /** Width of the chat interface (CSS value) */
  width?: string;
  
  /** Height of the chat interface (CSS value) */
  height?: string;
  
  /** Whether to show citation sources */
  enableCitations?: boolean;
  
  /** Whether to allow message feedback */
  enableFeedback?: boolean;
  
  /** Maximum file size for uploads (in bytes) */
  maxFileSize?: number;
  
  /** Allowed MIME types for file uploads */
  allowedFileTypes?: string[];
}

/**
 * Extended configuration for widget/floating deployments
 * Includes additional callbacks and embed options
 */
export interface WidgetConfig extends ChatConfig {
  /** Widget mode only (not standalone) */
  mode: 'widget' | 'floating';
  
  /** DOM element ID to mount the widget into */
  containerId?: string;
  
  /** Callback when widget is opened */
  onOpen?: () => void;
  
  /** Callback when widget is closed */
  onClose?: () => void;
  
  /** Callback when a new message is received */
  onMessage?: (message: ChatMessage) => void;
}

// ========== UI State Types ==========

/**
 * Global UI state management
 * Controls visual preferences and layout state
 */
export interface UIState {
  /** Whether the sidebar is currently open */
  sidebarOpen: boolean;
  
  /** Whether the settings panel is open */
  settingsOpen: boolean;
  
  /** Current color theme */
  theme: 'light' | 'dark';
  
  /** Text size preference */
  fontSize: 'sm' | 'md' | 'lg';
}

// ========== Error Types ==========

/**
 * Standard error format for API responses
 * Provides consistent error handling across the app
 */
export interface APIError {
  /** HTTP status code */
  status: number;
  
  /** Human-readable error message */
  message: string;
  
  /** Error code for programmatic handling */
  code?: string;
  
  /** Additional error details or validation errors */
  details?: any;
}

// ========== Hook Types ==========

/**
 * Options for the useMessages hook
 * Controls message fetching behavior
 */
export interface UseMessagesOptions {
  /** ID of the agent/project */
  projectId: number;
  
  /** Session ID for the conversation */
  sessionId: string;
  
  /** Whether to enable automatic fetching */
  enabled?: boolean;
}

/**
 * Options for the useSendMessage hook
 * Provides callbacks for handling message sending lifecycle
 */
export interface UseSendMessageOptions {
  /** Called when message is successfully sent */
  onSuccess?: (message: ChatMessage) => void;
  
  /** Called when an error occurs */
  onError?: (error: APIError) => void;
  
  /** Called for each chunk during streaming responses */
  onStream?: (chunk: StreamChunk) => void;
}

// ========== Stream Handler Types ==========

/**
 * Callbacks for handling streaming API responses
 * Used for real-time message streaming
 */
export interface StreamCallbacks {
  /** Called for each text chunk received */
  onChunk?: (chunk: string) => void;
  
  /** Called when citations are received */
  onCitation?: (citation: Citation) => void;
  
  /** Called when streaming is complete */
  onComplete?: () => void;
  
  /** Called if an error occurs during streaming */
  onError?: (error: Error) => void;
}

/**
 * Configuration for streaming response handlers
 * Controls timeout and retry behavior
 */
export interface StreamHandlerConfig {
  /** Maximum time to wait for a response (in milliseconds) */
  timeout?: number;
  
  /** Number of times to retry on failure */
  retryAttempts?: number;
  
  /** Delay between retry attempts (in milliseconds) */
  retryDelay?: number;
}

// ========== Utility Types ==========

/** Deployment mode for the chat interface */
export type DeploymentMode = 'standalone' | 'widget' | 'floating';

/** Role of the message sender */
export type MessageRole = 'user' | 'assistant';

/** Status of a message in the chat */
export type MessageStatus = 'sending' | 'sent' | 'error';

/** Type of feedback a user can give */
export type FeedbackType = 'like' | 'dislike';

/** Status of a file upload */
export type FileStatus = 'uploading' | 'uploaded' | 'error';

// ========== Component Props Types ==========

/**
 * Base props that all components can accept
 * Provides common styling and content options
 */
export interface BaseComponentProps {
  /** Optional CSS class names for styling */
  className?: string;
  
  /** Child elements to render inside the component */
  children?: React.ReactNode;
}

/**
 * Props for the Message component
 * Displays a single chat message with interactive features
 */
export interface MessageProps extends BaseComponentProps {
  /** The message data to display */
  message: ChatMessage;
  
  /** Whether this message is currently being streamed */
  isStreaming?: boolean;
  
  /** Whether this is the last message in the conversation */
  isLast?: boolean;
  
  /** Handler for when a citation is clicked */
  onCitationClick?: (citation: Citation) => void;
  
  /** Handler for when feedback is given */
  onFeedback?: (feedback: FeedbackType) => void;
}

/**
 * Props for the Input component
 * Handles user message input and file uploads
 */
export interface InputProps extends BaseComponentProps {
  /** Handler called when user sends a message */
  onSend: (content: string, files?: File[]) => void;
  
  /** Whether the input is disabled */
  disabled?: boolean;
  
  /** Placeholder text for the input field */
  placeholder?: string;
  
  /** Maximum character length for messages */
  maxLength?: number;
}

/**
 * Props for the Citation component
 * Displays source citations for AI responses
 */
export interface CitationProps extends BaseComponentProps {
  /** Array of citations to display */
  citations: Citation[];
  
  /** Handler for when a citation is clicked */
  onCitationClick?: (citation: Citation) => void;
  
  /** Maximum number of citations to show initially */
  maxVisible?: number;
}

// ========== Store Types (Zustand) ==========

/**
 * Global configuration store
 * Manages API settings and app preferences
 */
export interface ConfigStore {
  /** CustomGPT.ai API key */
  apiKey: string | null;
  
  /** Base URL for API calls */
  baseURL: string;
  
  /** Current UI theme */
  theme: 'light' | 'dark';
  
  /** Update the API key */
  setApiKey: (key: string) => void;
  
  /** Update the base URL */
  setBaseURL: (url: string) => void;
  
  /** Update the theme */
  setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Agent management store
 * Handles CRUD operations and state for agents/chatbots
 */
export interface AgentStore {
  /** List of all agents */
  agents: Agent[];
  
  /** Currently selected agent */
  currentAgent: Agent | null;
  
  /** Loading state for agent operations */
  loading: boolean;
  
  /** Error message if any operation fails */
  error: string | null;
  
  /** Fetch all agents from the API */
  fetchAgents: () => Promise<void>;
  
  /** Create a new agent with specified data */
  createAgent: (data: {
    /** Name of the new agent */
    project_name: string;
    /** URL for sitemap-based agents */
    sitemap_path?: string;
    /** Files for file-based agents */
    files?: File[];
    /** Whether the agent should be publicly accessible */
    is_shared?: boolean;
  }) => Promise<Agent>;
  
  /** Select an agent as the current active agent */
  selectAgent: (agent: Agent) => void;
  
  /** Manually set the agents list (useful for optimistic updates) */
  setAgents: (agents: Agent[]) => void;
  
  /** Update agent settings (currently only license settings) */
  updateAgent: (id: number, data: { are_licenses_allowed?: boolean }) => Promise<Agent>;
  
  /** Delete an agent */
  deleteAgent: (id: number) => Promise<void>;
  
  /** Create a copy of an existing agent */
  replicateAgent: (id: number) => Promise<Agent>;
  
  /** Get usage statistics for an agent */
  getAgentStats: (id: number) => Promise<AgentStats>;
}

/**
 * Conversation management store
 * Handles chat sessions and conversation history
 */
export interface ConversationStore {
  /** List of all conversations for the current agent */
  conversations: Conversation[];
  
  /** Currently active conversation */
  currentConversation: Conversation | null;
  
  /** Loading state for conversation operations */
  loading: boolean;
  
  /** Error message if any operation fails */
  error: string | null;
  
  /** Fetch all conversations for a specific agent */
  fetchConversations: (projectId: number) => Promise<void>;
  
  /** Create a new conversation */
  createConversation: (projectId: number, name?: string) => Promise<void>;
  
  /** Select a conversation as the current active one */
  selectConversation: (conversation: Conversation) => void;
  
  /** Delete a conversation */
  deleteConversation: (conversationId: string | number) => Promise<void>;
  
  /** Update conversation details (e.g., rename) */
  updateConversation: (conversationId: number, sessionId: string, data: { name: string }) => Promise<void>;
  
  /** Ensure a conversation exists (create if needed) before sending a message */
  ensureConversation: (projectId: number, firstMessage?: string) => Promise<Conversation>;
}

/**
 * Message management store
 * Handles sending, receiving, and streaming messages
 */
export interface MessageStore {
  /** Map of conversation IDs to their message arrays */
  messages: Map<string, ChatMessage[]>;
  
  /** Currently streaming message (null when not streaming) */
  streamingMessage: ChatMessage | null;
  
  /** Whether a message is currently being streamed */
  isStreaming: boolean;
  
  /** Loading state for message operations */
  loading: boolean;
  
  /** Error message if any operation fails */
  error: string | null;
  
  /** Send a new message (handles both regular and streaming responses) */
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  
  /** Add a message to a conversation (used for optimistic updates) */
  addMessage: (conversationId: string, message: ChatMessage) => void;
  
  /** Update the content of the currently streaming message */
  updateStreamingMessage: (content: string, citations?: Citation[]) => void;
  
  /** Clear messages for a specific conversation or all conversations */
  clearMessages: (conversationId?: string) => void;
  
  /** Update user feedback for a message */
  updateMessageFeedback: (messageId: string, feedback: FeedbackType) => void;
  
  /** Cancel the current streaming operation */
  cancelStreaming: () => void;
  
  /** Get all messages for a specific conversation */
  getMessagesForConversation: (conversationId: string) => ChatMessage[];
  
  /** Load message history for a conversation from the API */
  loadMessages: (conversationId: string) => Promise<void>;
}

/**
 * UI state management store
 * Controls layout and visual preferences
 */
export interface UIStore extends UIState {
  /** Toggle sidebar visibility */
  setSidebarOpen: (open: boolean) => void;
  
  /** Toggle settings panel visibility */
  setSettingsOpen: (open: boolean) => void;
  
  /** Change the color theme */
  setTheme: (theme: 'light' | 'dark') => void;
  
  /** Change the font size preference */
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
}

// ========== User Profile Types (CustomGPT.ai API) ==========

/**
 * User profile information from CustomGPT.ai
 */
export interface UserProfile {
  /** User's unique ID */
  id: number;
  
  /** User's display name */
  name: string;
  
  /** User's email address */
  email: string;
  
  /** ID of the user's current team */
  current_team_id: number;
  
  /** URL to the user's profile photo */
  profile_photo_url: string;
  
  /** Account creation timestamp (ISO date-time format) */
  created_at: string;
  
  /** Last update timestamp (ISO date-time format) */
  updated_at: string;
}

// ========== Limits Types (CustomGPT.ai API) ==========

/**
 * User's usage limits and current consumption
 */
export interface UserLimits {
  /** Maximum number of projects/agents allowed */
  max_projects_num: number;
  
  /** Current number of projects/agents created */
  current_projects_num: number;
  
  /** Maximum storage credits available */
  max_total_storage_credits: number;
  
  /** Storage credits currently used */
  current_total_storage_credits: number;
  
  /** Maximum queries allowed */
  max_queries: number;
  
  /** Queries used so far */
  current_queries: number;
}

/**
 * API response for fetching user limits
 */
export interface LimitsResponse {
  /** Response status */
  status: string;
  
  /** User limits data */
  data: UserLimits;
}

/**
 * User profile management store
 * Handles user account information and settings
 */
export interface UserProfileStore {
  /** Current user's profile data */
  profile: UserProfile | null;
  
  /** Loading state for profile operations */
  loading: boolean;
  
  /** Error message if any operation fails */
  error: string | null;
  
  // ========== Profile Management ==========
  
  /** Fetch user profile from the API */
  fetchProfile: () => Promise<void>;
  
  /** Update user profile (name and/or photo) */
  updateProfile: (name: string, profilePhoto?: File) => Promise<void>;
  
  // ========== Utility Functions ==========
  
  /** Reset the store to initial state (useful for logout) */
  reset: () => void;
}