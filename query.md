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

## API Integration Layer

### Base API Client
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
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Agent methods
  async getAgents() {
    return this.request<AgentsResponse>('/projects');
  }

  async getAgent(id: number) {
    return this.request<AgentResponse>(`/projects/${id}`);
  }

  // Conversation methods
  async createConversation(projectId: number, name: string) {
    return this.request<ConversationResponse>(`/projects/${projectId}/conversations`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async sendMessage(projectId: number, sessionId: string, prompt: string) {
    return this.streamRequest(`/projects/${projectId}/conversations/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  private async streamRequest(endpoint: string, options: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}?stream=true`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response; // Return for streaming handling
  }
}
```

### React Query Hooks
```typescript
// lib/hooks/useAgents.ts
export const useAgents = () => {
  const { apiKey } = useAuthStore();
  
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => new CustomGPTClient(apiKey!).getAgents(),
    enabled: !!apiKey,
  });
};

// lib/hooks/useMessages.ts
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, sessionId, prompt }: SendMessageParams) => 
      new CustomGPTClient(apiKey!).sendMessage(projectId, sessionId, prompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
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