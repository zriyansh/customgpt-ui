# CustomGPT.ai Chat UI - Product Requirements Document

## Project Overview

### Objective
Build a modern, ChatGPT-like web interface for CustomGPT.ai's RAG platform that provides an intuitive chat experience while showcasing the unique capabilities of enterprise RAG agents.

### Goals
- **Primary**: Create an open-source chat UI that demonstrates CustomGPT.ai's API capabilities
- **Secondary**: Increase API adoption by providing a ready-to-use interface
- **Tertiary**: Establish CustomGPT.ai as a leader in enterprise RAG solutions

## Technical Architecture

### Tech Stack
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state_management": "Zustand",
  "api_client": "TanStack Query (React Query)",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React",
  "deployment": "Vercel (primary), Docker (self-hosted)",
  "package_manager": "pnpm"
}
```

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.290.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "react-dropzone": "^14.2.0",
    "sonner": "^1.0.0"
  }
}
```

## Folder Structure

```
customgpt-ui/
├── .env.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── README.md
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── components.json
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── settings/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── conversations/
│   │   │   │           ├── page.tsx
│   │   │   │           └── [sessionId]/
│   │   │   │               └── page.tsx
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [agentId]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ApiKeyForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── agents/
│   │   │   ├── AgentList.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentSelector.tsx
│   │   │   ├── AgentSettings.tsx
│   │   │   └── CreateAgent.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── CitationCard.tsx
│   │   │   └── ConversationHistory.tsx
│   │   ├── documents/
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   └── FileDropzone.tsx
│   │   ├── conversations/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConversationCard.tsx
│   │   │   └── ConversationSearch.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── validations.ts
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   ├── agents.ts
│   │   │   ├── conversations.ts
│   │   │   ├── messages.ts
│   │   │   ├── documents.ts
│   │   │   ├── citations.ts
│   │   │   ├── auth.ts
│   │   │   └── users.ts
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useAgents.ts
│   │       ├── useConversations.ts
│   │       ├── useMessages.ts
│   │       ├── useDocuments.ts
│   │       ├── useLocalStorage.ts
│   │       └── useDebounce.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── agentStore.ts
│   │   ├── conversationStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   └── types/
│       ├── api.ts
│       ├── auth.ts
│       ├── agents.ts
│       ├── conversations.ts
│       ├── messages.ts
│       ├── documents.ts
│       └── ui.ts
```

## Core Features & Components

### 1. Authentication System
```typescript
// Auth flow using CustomGPT.ai API keys
interface AuthStore {
  apiKey: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}
```

### 2. Agent Management
```typescript
// Agent selection and configuration
interface Agent {
  id: number;
  project_name: string;
  sitemap_path: string;
  is_chat_active: boolean;
  created_at: string;
  updated_at: string;
  settings: AgentSettings;
}
```

### 3. Chat Interface
```typescript
// Real-time chat with streaming responses
interface ChatInterface {
  currentAgent: Agent;
  currentConversation: Conversation;
  messages: Message[];
  isStreaming: boolean;
  sendMessage: (content: string) => void;
}
```

### 4. Document Management
```typescript
// File upload and source management
interface DocumentManager {
  uploadFiles: (files: File[]) => Promise<void>;
  documents: Document[];
  deleteDocument: (id: number) => void;
}
```

## Complete API Integration Layer

### Comprehensive API Client
```typescript
// lib/api/client.ts
class CustomGPTClient {
  private baseURL = 'https://app.customgpt.ai/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // AGENTS/PROJECTS MANAGEMENT
  async getAgents(params?: {
    page?: number;
    duration?: number;
    order?: 'asc' | 'desc';
    orderBy?: 'id' | 'created_at';
    width?: string;
    height?: string;
    name?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request<AgentsResponse>(`/projects?${searchParams}`);
  }

  async createAgent(data: {
    project_name: string;
    sitemap_path?: string;
    file_data_retension?: boolean;
    is_ocr_enabled?: boolean;
    is_anonymized?: boolean;
    file?: File;
  }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });
    return this.request<ProjectResponse>('/projects', {
      method: 'POST',
      body: formData,
    });
  }

  async getAgent(id: number, params?: { width?: string; height?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value);
      });
    }
    return this.request<ProjectResponse>(`/projects/${id}?${searchParams}`);
  }

  async updateAgent(id: number, data: {
    project_name?: string;
    is_shared?: boolean;
    sitemap_path?: string;
    file_data_retension?: boolean;
    is_ocr_enabled?: boolean;
    is_anonymized?: boolean;
    file?: File;
    are_licenses_allowed?: boolean;
  }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });
    return this.request<ProjectResponse>(`/projects/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  async deleteAgent(id: number) {
    return this.request<DeleteResponse>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async replicateAgent(id: number) {
    return this.request<ProjectResponse>(`/projects/${id}/replicate`, {
      method: 'POST',
    });
  }

  async getAgentStats(id: number) {
    return this.request<StatsResponse>(`/projects/${id}/stats`);
  }

  // AGENT SETTINGS
  async getAgentSettings(id: number) {
    return this.request<SettingsResponse>(`/projects/${id}/settings`);
  }

  async updateAgentSettings(id: number, data: {
    chat_bot_avatar?: File;
    chat_bot_bg?: File;
    default_prompt?: string;
    example_questions?: string[];
    response_source?: 'default' | 'own_content' | 'openai_content';
    chatbot_msg_lang?: string;
    chatbot_color?: string;
    chatbot_toolbar_color?: string;
    persona_instructions?: string;
    citations_answer_source_label_msg?: string;
    citations_sources_label_msg?: string;
    hang_in_there_msg?: string;
    chatbot_siesta_msg?: string;
    is_loading_indicator_enabled?: boolean;
    enable_citations?: 0 | 1 | 2 | 3;
    enable_feedbacks?: boolean;
    citations_view_type?: 'user' | 'show' | 'hide';
    no_answer_message?: string;
    ending_message?: string;
    remove_branding?: boolean;
    enable_recaptcha_for_public_chatbots?: boolean;
    chatbot_model?: string;
    is_selling_enabled?: boolean;
    can_share_conversation?: boolean;
    can_export_conversation?: boolean;
    hide_sources_from_responses?: boolean;
    agent_capability?: string;
    input_field_addendum?: string;
    user_avatar?: File;
    user_avatar_orientation?: string;
    chatbot_title?: string;
    chatbot_title_color?: string;
  }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return this.request<UpdateResponse>(`/projects/${id}/settings`, {
      method: 'POST',
      body: formData,
    });
  }

  // AGENT PLUGINS
  async getAgentPlugin(id: number) {
    return this.request<PluginResponse>(`/projects/${id}/plugins`);
  }

  async createAgentPlugin(id: number, data: {
    model_name: string;
    human_name: string;
    keywords: string;
    description: string;
    is_active?: boolean;
  }) {
    return this.request<PluginResponse>(`/projects/${id}/plugins`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgentPlugin(id: number, data: {
    model_name?: string;
    human_name?: string;
    keywords?: string;
    description?: string;
    is_active?: boolean;
  }) {
    return this.request<PluginResponse>(`/projects/${id}/plugins`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PAGES/DOCUMENTS MANAGEMENT
  async getPages(projectId: number, params?: {
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
    crawl_status?: 'all' | 'ok' | 'failed' | 'n/a' | 'queued' | 'limited';
    index_status?: 'all' | 'ok' | 'failed' | 'n/a' | 'queued' | 'limited';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request<PagesResponse>(`/projects/${projectId}/pages?${searchParams}`);
  }

  async deletePage(projectId: number, pageId: number) {
    return this.request<DeleteResponse>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  async reindexPage(projectId: number, pageId: number) {
    return this.request<ReindexResponse>(`/projects/${projectId}/pages/${pageId}/reindex`, {
      method: 'POST',
    });
  }

  async getPageMetadata(projectId: number, pageId: string) {
    return this.request<MetadataResponse>(`/projects/${projectId}/pages/${pageId}/metadata`);
  }

  async updatePageMetadata(projectId: number, pageId: number, data: {
    title?: string;
    url?: string;
    description?: string;
    image?: string;
  }) {
    return this.request<MetadataResponse>(`/projects/${projectId}/pages/${pageId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // CONVERSATIONS MANAGEMENT
  async getConversations(projectId: number, params?: {
    page?: number;
    order?: 'asc' | 'desc';
    orderBy?: 'id' | 'created_at';
    userFilter?: 'all' | 'anonymous' | 'team_member';
    name?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request<ConversationsResponse>(`/projects/${projectId}/conversations?${searchParams}`);
  }

  async createConversation(projectId: number, data: { name: string }) {
    return this.request<ConversationResponse>(`/projects/${projectId}/conversations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConversation(projectId: number, sessionId: string, data: { name: string }) {
    return this.request<ConversationResponse>(`/projects/${projectId}/conversations/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConversation(projectId: number, sessionId: string) {
    return this.request<DeleteResponse>(`/projects/${projectId}/conversations/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // MESSAGES MANAGEMENT
  async getMessages(projectId: number, sessionId: string, params?: {
    page?: number;
    order?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request<MessagesResponse>(`/projects/${projectId}/conversations/${sessionId}/messages?${searchParams}`);
  }

  async sendMessage(projectId: number, sessionId: string, data: {
    prompt: string;
    custom_persona?: string;
    chatbot_model?: string;
    response_source?: 'default' | 'own_content' | 'openai_content';
  }, params?: {
    stream?: boolean;
    lang?: string;
    external_id?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    if (params?.stream) {
      return this.streamRequest(`/projects/${projectId}/conversations/${sessionId}/messages?${searchParams}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    
    return this.request<MessageResponse>(`/projects/${projectId}/conversations/${sessionId}/messages?${searchParams}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessage(projectId: number, sessionId: string, promptId: number) {
    return this.request<MessageResponse>(`/projects/${projectId}/conversations/${sessionId}/messages/${promptId}`);
  }

  async updateMessageFeedback(projectId: number, sessionId: string, promptId: number, data: {
    reaction: 'neutral' | 'disliked' | 'liked';
  }) {
    return this.request<MessageResponse>(`/projects/${projectId}/conversations/${sessionId}/messages/${promptId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // CHAT COMPLETIONS (OpenAI Compatible)
  async chatCompletions(projectId: number, data: {
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
    model?: string;
    stream?: boolean;
    lang?: string;
    external_id?: string;
    is_inline_citation?: boolean;
  }) {
    return this.request<ChatCompletionResponse>(`/projects/${projectId}/chat/completions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // CITATIONS
  async getCitation(projectId: number, citationId: number) {
    return this.request<CitationResponse>(`/projects/${projectId}/citations/${citationId}`);
  }

  // SOURCES MANAGEMENT
  async getSources(projectId: number) {
    return this.request<SourcesResponse>(`/projects/${projectId}/sources`);
  }

  async createSource(projectId: number, data: {
    sitemap_path?: string;
    file_data_retension?: boolean;
    is_ocr_enabled?: boolean;
    is_anonymized?: boolean;
    file?: File;
  }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });
    return this.request<SourceResponse>(`/projects/${projectId}/sources`, {
      method: 'POST',
      body: formData,
    });
  }

  async updateSource(projectId: number, sourceId: number, data: {
    executive_js?: boolean;
    data_refresh_frequency?: 'never' | 'daily' | 'weekly' | 'monthly' | 'advanced';
    create_new_pages?: boolean;
    remove_unexist_pages?: boolean;
    refresh_existing_pages?: 'never' | 'always' | 'if_updated';
    refresh_schedule?: Array<{
      days: number[];
      hours: string[];
    }>;
  }) {
    return this.request<SourceResponse>(`/projects/${projectId}/sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSource(projectId: number, sourceId: number) {
    return this.request<DeleteResponse>(`/projects/${projectId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  }

  async syncSource(projectId: number, sourceId: number) {
    return this.request<SyncResponse>(`/projects/${projectId}/sources/${sourceId}/instant-sync`, {
      method: 'PUT',
    });
  }

  // REPORTS & ANALYTICS
  async getTrafficReport(projectId: number, filters: string[]) {
    const searchParams = new URLSearchParams();
    filters.forEach(filter => searchParams.append('filters', filter));
    return this.request<TrafficReportResponse>(`/projects/${projectId}/reports/traffic?${searchParams}`);
  }

  async getQueriesReport(projectId: number, filters: string[]) {
    const searchParams = new URLSearchParams();
    filters.forEach(filter => searchParams.append('filters', filter));
    return this.request<QueriesReportResponse>(`/projects/${projectId}/reports/queries?${searchParams}`);
  }

  async getConversationsReport(projectId: number, filters: string[]) {
    const searchParams = new URLSearchParams();
    filters.forEach(filter => searchParams.append('filters', filter));
    return this.request<ConversationsReportResponse>(`/projects/${projectId}/reports/conversations?${searchParams}`);
  }

  async getAnalysisReport(projectId: number, filters: string[], interval?: 'daily' | 'weekly') {
    const searchParams = new URLSearchParams();
    filters.forEach(filter => searchParams.append('filters', filter));
    if (interval) searchParams.append('interval', interval);
    return this.request<AnalysisReportResponse>(`/projects/${projectId}/reports/analysis?${searchParams}`);
  }

  // AGENT LICENSES
  async getLicenses(projectId: number) {
    return this.request<LicensesResponse>(`/projects/${projectId}/licenses`);
  }

  async createLicense(projectId: number, data: { name: string }) {
    return this.request<LicenseResponse>(`/projects/${projectId}/licenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLicense(projectId: number, licenseId: number) {
    return this.request<LicenseResponse>(`/projects/${projectId}/licenses/${licenseId}`);
  }

  async updateLicense(projectId: number, licenseId: number, data: { name: string }) {
    return this.request<LicenseResponse>(`/projects/${projectId}/licenses/${licenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLicense(projectId: number, licenseId: number) {
    return this.request<DeleteResponse>(`/projects/${projectId}/licenses/${licenseId}`, {
      method: 'DELETE',
    });
  }

  // USER MANAGEMENT
  async getUserProfile() {
    return this.request<UserResponse>('/user');
  }

  async updateUserProfile(data: {
    profile_photo?: File;
    name?: string;
  }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });
    return this.request<UserResponse>('/user', {
      method: 'POST',
      body: formData,
    });
  }

  // LIMITS & USAGE
  async getUsageLimits() {
    return this.request<LimitsResponse>('/limits/usage');
  }

  // PREVIEW
  async getPreview(id: string) {
    return this.request<any>(`/preview/${id}`);
  }

  // PRIVATE HELPER METHODS
  private async streamRequest(endpoint: string, options: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response; // Return for streaming handling
  }
}
```

### Complete React Query Hooks
```typescript
// lib/hooks/useAgents.ts
export const useAgents = (params?: GetAgentsParams) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['agents', params],
    queryFn: () => new CustomGPTClient(apiKey!).getAgents(params),
    enabled: !!apiKey,
  });
};

export const useAgent = (id: number) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => new CustomGPTClient(apiKey!).getAgent(id),
    enabled: !!apiKey && !!id,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAgentData) => 
      new CustomGPTClient(apiKey!).createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAgentData }) =>
      new CustomGPTClient(apiKey!).updateAgent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => new CustomGPTClient(apiKey!).deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useAgentStats = (id: number) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['agent-stats', id],
    queryFn: () => new CustomGPTClient(apiKey!).getAgentStats(id),
    enabled: !!apiKey && !!id,
  });
};

// lib/hooks/useAgentSettings.ts
export const useAgentSettings = (id: number) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['agent-settings', id],
    queryFn: () => new CustomGPTClient(apiKey!).getAgentSettings(id),
    enabled: !!apiKey && !!id,
  });
};

export const useUpdateAgentSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSettingsData }) =>
      new CustomGPTClient(apiKey!).updateAgentSettings(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['agent-settings', id] });
    },
  });
};

// lib/hooks/useConversations.ts
export const useConversations = (projectId: number, params?: GetConversationsParams) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['conversations', projectId, params],
    queryFn: () => new CustomGPTClient(apiKey!).getConversations(projectId, params),
    enabled: !!apiKey && !!projectId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: { name: string } }) =>
      new CustomGPTClient(apiKey!).createConversation(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sessionId, data }: { 
      projectId: number; 
      sessionId: string; 
      data: { name: string } 
    }) => new CustomGPTClient(apiKey!).updateConversation(projectId, sessionId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sessionId }: { projectId: number; sessionId: string }) =>
      new CustomGPTClient(apiKey!).deleteConversation(projectId, sessionId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
    },
  });
};

// lib/hooks/useMessages.ts
export const useMessages = (projectId: number, sessionId: string, params?: GetMessagesParams) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['messages', projectId, sessionId, params],
    queryFn: () => new CustomGPTClient(apiKey!).getMessages(projectId, sessionId, params),
    enabled: !!apiKey && !!projectId && !!sessionId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sessionId, data, params }: SendMessageParams) => 
      new CustomGPTClient(apiKey!).sendMessage(projectId, sessionId, data, params),
    onSuccess: (_, { projectId, sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId, sessionId] });
    },
  });
};

export const useUpdateMessageFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sessionId, promptId, data }: UpdateFeedbackParams) =>
      new CustomGPTClient(apiKey!).updateMessageFeedback(projectId, sessionId, promptId, data),
    onSuccess: (_, { projectId, sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId, sessionId] });
    },
  });
};

// lib/hooks/usePages.ts
export const usePages = (projectId: number, params?: GetPagesParams) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['pages', projectId, params],
    queryFn: () => new CustomGPTClient(apiKey!).getPages(projectId, params),
    enabled: !!apiKey && !!projectId,
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, pageId }: { projectId: number; pageId: number }) =>
      new CustomGPTClient(apiKey!).deletePage(projectId, pageId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
    },
  });
};

export const useReindexPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, pageId }: { projectId: number; pageId: number }) =>
      new CustomGPTClient(apiKey!).reindexPage(projectId, pageId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
    },
  });
};

export const usePageMetadata = (projectId: number, pageId: string) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['page-metadata', projectId, pageId],
    queryFn: () => new CustomGPTClient(apiKey!).getPageMetadata(projectId, pageId),
    enabled: !!apiKey && !!projectId && !!pageId,
  });
};

// lib/hooks/useSources.ts
export const useSources = (projectId: number) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['sources', projectId],
    queryFn: () => new CustomGPTClient(apiKey!).getSources(projectId),
    enabled: !!apiKey && !!projectId,
  });
};

export const useCreateSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: CreateSourceData }) =>
      new CustomGPTClient(apiKey!).createSource(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sources', projectId] });
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
    },
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sourceId, data }: UpdateSourceParams) =>
      new CustomGPTClient(apiKey!).updateSource(projectId, sourceId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sources', projectId] });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sourceId }: { projectId: number; sourceId: number }) =>
      new CustomGPTClient(apiKey!).deleteSource(projectId, sourceId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sources', projectId] });
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
    },
  });
};

export const useSyncSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sourceId }: { projectId: number; sourceId: number }) =>
      new CustomGPTClient(apiKey!).syncSource(projectId, sourceId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sources', projectId] });
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
    },
  });
};

// lib/hooks/useReports.ts
export const useTrafficReport = (projectId: number, filters: string[]) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['traffic-report', projectId, filters],
    queryFn: () => new CustomGPTClient(apiKey!).getTrafficReport(projectId, filters),
    enabled: !!apiKey && !!projectId && filters.length > 0,
  });
};

export const useQueriesReport = (projectId: number, filters: string[]) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['queries-report', projectId, filters],
    queryFn: () => new CustomGPTClient(apiKey!).getQueriesReport(projectId, filters),
    enabled: !!apiKey && !!projectId && filters.length > 0,
  });
};

export const useConversationsReport = (projectId: number, filters: string[]) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['conversations-report', projectId, filters],
    queryFn: () => new CustomGPTClient(apiKey!).getConversationsReport(projectId, filters),
    enabled: !!apiKey && !!projectId && filters.length > 0,
  });
};

export const useAnalysisReport = (projectId: number, filters: string[], interval?: string) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['analysis-report', projectId, filters, interval],
    queryFn: () => new CustomGPTClient(apiKey!).getAnalysisReport(projectId, filters, interval),
    enabled: !!apiKey && !!projectId && filters.length > 0,
  });
};

// lib/hooks/useLicenses.ts
export const useLicenses = (projectId: number) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['licenses', projectId],
    queryFn: () => new CustomGPTClient(apiKey!).getLicenses(projectId),
    enabled: !!apiKey && !!projectId,
  });
};

export const useCreateLicense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: { name: string } }) =>
      new CustomGPTClient(apiKey!).createLicense(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['licenses', projectId] });
    },
  });
};

// lib/hooks/useUser.ts
export const useUser = () => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['user'],
    queryFn: () => new CustomGPTClient(apiKey!).getUserProfile(),
    enabled: !!apiKey,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserData) => 
      new CustomGPTClient(apiKey!).updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// lib/hooks/useLimits.ts
export const useLimits = () => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['limits'],
    queryFn: () => new CustomGPTClient(apiKey!).getUsageLimits(),
    enabled: !!apiKey,
  });
};

// lib/hooks/useCitations.ts
export const useCitation = (projectId: number, citationId: number) => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['citation', projectId, citationId],
    queryFn: () => new CustomGPTClient(apiKey!).getCitation(projectId, citationId),
    enabled: !!apiKey && !!projectId && !!citationId,
  });
};
```

## UI/UX Specifications

### Design System
```typescript
// Tailwind configuration with custom theme
const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      900: '#111827',
    }
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  }
};
```

### Key UI Components

#### Chat Message Bubble
```typescript
interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  showCitations: boolean;
  onCitationClick: (citationId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  showCitations,
  onCitationClick
}) => {
  return (
    <div className={cn(
      "flex w-full gap-3 p-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && <Avatar>AI</Avatar>}
      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        isUser 
          ? "bg-primary-500 text-white" 
          : "bg-gray-100 text-gray-900"
      )}>
        <ReactMarkdown>{message.content}</ReactMarkdown>
        {showCitations && message.citations && (
          <CitationList citations={message.citations} />
        )}
      </div>
      {isUser && <Avatar>U</Avatar>}
    </div>
  );
};
```

#### Agent Selector
```typescript
const AgentSelector: React.FC = () => {
  const { data: agents, isLoading } = useAgents();
  const { currentAgent, setCurrentAgent } = useAgentStore();

  return (
    <Select
      value={currentAgent?.id.toString()}
      onValueChange={(id) => setCurrentAgent(Number(id))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an agent..." />
      </SelectTrigger>
      <SelectContent>
        {agents?.data.map((agent) => (
          <SelectItem key={agent.id} value={agent.id.toString()}>
            {agent.project_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

## Development Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Project setup with Next.js 14 + TypeScript
- [ ] Tailwind CSS + shadcn/ui configuration
- [ ] Basic routing structure
- [ ] API client implementation
- [ ] Authentication system
- [ ] State management with Zustand

### Phase 2: Agent Management (Week 3)
- [ ] Agent list and selection
- [ ] Agent details and configuration
- [ ] Agent settings management
- [ ] Document upload for agents

### Phase 3: Chat Interface (Week 4-5)
- [ ] Basic chat UI layout
- [ ] Message sending and receiving
- [ ] Streaming response handling
- [ ] Message history and persistence
- [ ] Citation display and interaction

### Phase 4: Advanced Features (Week 6-7)
- [ ] Conversation management
- [ ] File upload and document management
- [ ] Search functionality
- [ ] Export capabilities
- [ ] Mobile responsiveness

### Phase 5: Polish & Deployment (Week 8)
- [ ] Error handling and loading states
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Docker configuration
- [ ] Deployment setup

## Environment Configuration

### Environment Variables
```bash
# .env.example
NEXT_PUBLIC_APP_NAME="CustomGPT.ai Chat"
NEXT_PUBLIC_API_BASE_URL="https://app.customgpt.ai/api/v1"
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Optional: For self-hosted instances
CUSTOMGPT_API_BASE_URL="https://your-instance.com/api/v1"
```

### Docker Configuration
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## API Integration Mapping

### CustomGPT.ai → UI Component Mapping
```typescript
// API Endpoint → React Component
/projects → AgentList
/projects/{id} → AgentDetails
/projects/{id}/conversations → ConversationList
/projects/{id}/conversations/{sessionId}/messages → ChatInterface
/projects/{id}/sources → DocumentManager
/projects/{id}/settings → AgentSettings
/projects/{id}/citations/{citationId} → CitationCard
```

## Performance Considerations

### Optimization Strategies
- **Code Splitting**: Route-based splitting with Next.js
- **Lazy Loading**: Components and images
- **Caching**: React Query for API responses
- **Streaming**: Server-sent events for real-time chat
- **Debouncing**: Search and auto-save features
- **Virtualization**: For large conversation lists

### Bundle Size Targets
- Initial bundle: < 250KB gzipped
- Route chunks: < 100KB gzipped
- Total bundle: < 1MB gzipped

This PRD provides comprehensive technical specifications for building a production-ready CustomGPT.ai chat interface that showcases the platform's unique RAG capabilities while maintaining excellent user experience and performance.