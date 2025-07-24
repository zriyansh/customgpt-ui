# CustomGPT.ai Chat UI Implementation Plan

## Executive Summary

This document outlines the comprehensive implementation plan for building a versatile ChatGPT-like interface for CustomGPT.ai's RAG platform. The solution will support three deployment modes:
1. **Embeddable Widget**: For seamless website integration
2. **Standalone Chat Interface**: Full-featured web application
3. **Floating Chatbot**: Bottom-right corner widget for websites

## Project Architecture

### Core Requirements
- **No Authentication**: Direct API key usage for simplicity
- **Multi-Format Support**: Embed, standalone, and floating widget
- **Full API Coverage**: Support all CustomGPT.ai endpoints including streaming, file uploads, and citations
- **Claude-Inspired UI**: Modern, clean interface similar to Claude.ai with CustomGPT branding

### Technology Stack
```typescript
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "Zustand",
  "api": "TanStack Query",
  "streaming": "Server-Sent Events (SSE)",
  "forms": "React Hook Form + Zod",
  "markdown": "React Markdown + Syntax Highlighting",
  "files": "React Dropzone",
  "deployment": "Vercel/Docker/CDN"
}
```

## Implementation Phases

### Phase 1: Core Infrastructure & API Layer (Days 1-3)

#### 1.1 Project Setup
```bash
npx create-next-app@latest customgpt-ui --typescript --tailwind --app
cd customgpt-ui
npm install @tanstack/react-query zustand react-hook-form zod @hookform/resolvers
npm install react-markdown react-syntax-highlighter react-dropzone
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-* # All necessary Radix UI components
```

#### 1.2 API Client Architecture
```typescript
// lib/api/customgpt-client.ts
class CustomGPTClient {
  private baseURL: string;
  private apiKey: string;
  private abortControllers: Map<string, AbortController>;

  constructor(config: ClientConfig) {
    this.baseURL = config.baseURL || 'https://app.customgpt.ai/api/v1';
    this.apiKey = config.apiKey;
    this.abortControllers = new Map();
  }

  // Core request method with streaming support
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T | ReadableStream> {
    const { stream, ...fetchOptions } = options;
    
    if (stream) {
      return this.streamRequest(endpoint, fetchOptions);
    }
    
    // Standard JSON request
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  // Streaming implementation
  private async streamRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<ReadableStream> {
    const abortController = new AbortController();
    const requestId = generateRequestId();
    this.abortControllers.set(requestId, abortController);

    const response = await fetch(`${this.baseURL}${endpoint}?stream=true`, {
      ...options,
      signal: abortController.signal,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.body!;
  }

  // Cancel streaming request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }
}
```

### Phase 2: UI Component Architecture (Days 4-6)

#### 2.1 Design System & Theme
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // CustomGPT.ai brand colors
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8d9ff',
          300: '#7ab8ff',
          400: '#3394ff',
          500: '#0a75ff', // Primary brand color
          600: '#0058e6',
          700: '#0044ba',
          800: '#003896',
          900: '#002d7a',
        },
        // Claude-inspired neutrals
        chat: {
          user: '#2D3748', // User message background
          assistant: '#F7FAFC', // Assistant message background
          border: '#E2E8F0',
          hover: '#EDF2F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
    },
  },
}
```

#### 2.2 Core Chat Components

**Message Component Structure**:
```typescript
// components/chat/Message.tsx
interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onCitationClick?: (citation: Citation) => void;
  onFeedback?: (feedback: 'like' | 'dislike') => void;
}

export function Message({ message, isStreaming, onCitationClick, onFeedback }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "group relative flex gap-3 px-4 py-6 transition-colors",
      isUser ? "bg-white" : "bg-gray-50 border-y border-gray-100"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-600" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-gray-900">{message.content}</p>
          ) : (
            <StreamingMarkdown 
              content={message.content} 
              isStreaming={isStreaming}
            />
          )}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <CitationsPanel 
            citations={message.citations}
            onCitationClick={onCitationClick}
          />
        )}

        {/* Action Buttons */}
        {!isUser && !isStreaming && (
          <MessageActions 
            onCopy={() => copyToClipboard(message.content)}
            onFeedback={onFeedback}
          />
        )}
      </div>
    </div>
  );
}
```

**Input Component with File Upload**:
```typescript
// components/chat/ChatInput.tsx
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    
    onSend({
      content: input,
      files: files,
    });
    
    setInput('');
    setFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative border-t border-gray-200 bg-white">
      {/* File Upload Area */}
      {files.length > 0 && (
        <div className="px-4 pt-3 pb-2 flex gap-2 flex-wrap">
          {files.map((file, idx) => (
            <FileChip 
              key={idx}
              file={file}
              onRemove={() => setFiles(files.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        {/* File Upload Button */}
        <FileUploadButton
          onUpload={(newFiles) => setFiles([...files, ...newFiles])}
          accept=".pdf,.doc,.docx,.txt,.csv,.json,.xml"
          multiple
        />

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-lg border border-gray-300 px-3 py-2",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[44px] max-h-[200px]"
            )}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!input.trim() && files.length === 0)}
          className={cn(
            "rounded-lg bg-brand-500 p-2 text-white transition-colors",
            "hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
```

### Phase 3: Three Deployment Formats (Days 7-9)

#### 3.1 Standalone Chat Interface
```typescript
// app/page.tsx - Full page chat interface
export default function ChatPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ConversationSidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader />
        
        {/* Messages */}
        <MessageList />
        
        {/* Input */}
        <ChatInput />
      </div>
      
      {/* Settings Panel */}
      <SettingsPanel />
    </div>
  );
}
```

#### 3.2 Embeddable Widget
```typescript
// embed/widget.tsx
export function EmbedWidget({ config }: WidgetConfig) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      id="customgpt-widget"
      className={cn(
        "fixed z-50 shadow-xl",
        config.position === 'bottom-right' && "bottom-4 right-4",
        config.position === 'bottom-left' && "bottom-4 left-4"
      )}
    >
      {isOpen ? (
        <div className="w-96 h-[600px] bg-white rounded-lg overflow-hidden flex flex-col">
          <WidgetHeader onClose={() => setIsOpen(false)} />
          <MessageList className="flex-1" />
          <ChatInput />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6 mx-auto" />
        </button>
      )}
    </div>
  );
}

// Embed script
const embedScript = `
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.customgpt.ai/embed.js';
    script.async = true;
    script.onload = function() {
      CustomGPT.init({
        apiKey: 'YOUR_API_KEY',
        projectId: 'YOUR_PROJECT_ID',
        position: 'bottom-right',
        theme: 'light'
      });
    };
    document.head.appendChild(script);
  })();
</script>
`;
```

#### 3.3 Floating Chatbot
```typescript
// components/floating/FloatingChat.tsx
export function FloatingChat({ config }: FloatingConfig) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 w-16 h-16 bg-brand-500 rounded-full shadow-lg hover:bg-brand-600 transition-colors z-50"
            onClick={() => setIsMinimized(false)}
          >
            <MessageCircle className="w-8 h-8 text-white mx-auto" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden z-50"
          >
            <FloatingChatContent 
              onMinimize={() => setIsMinimized(true)}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Phase 4: Advanced Features (Days 10-12)

#### 4.1 Streaming Response Handler
```typescript
// lib/streaming/stream-handler.ts
export class StreamHandler {
  private reader: ReadableStreamDefaultReader | null = null;
  private decoder = new TextDecoder();
  
  async *processStream(
    stream: ReadableStream,
    onChunk?: (chunk: string) => void
  ): AsyncGenerator<StreamChunk> {
    this.reader = stream.getReader();
    
    try {
      while (true) {
        const { done, value } = await this.reader.read();
        
        if (done) break;
        
        const chunk = this.decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                onChunk?.(parsed.content);
                yield {
                  type: 'content',
                  content: parsed.content,
                  citations: parsed.citations,
                };
              }
            } catch (e) {
              console.error('Failed to parse SSE chunk:', e);
            }
          }
        }
      }
    } finally {
      this.reader?.releaseLock();
    }
  }
  
  cancel() {
    this.reader?.cancel();
  }
}
```

#### 4.2 Citation Management
```typescript
// components/citations/CitationPanel.tsx
export function CitationPanel({ citations }: { citations: Citation[] }) {
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BookOpen className="w-4 h-4" />
        <span>Sources ({citations.length})</span>
      </div>
      
      <div className="grid gap-2">
        {citations.map((citation) => (
          <CitationCard
            key={citation.id}
            citation={citation}
            isExpanded={expandedCitation === citation.id}
            onToggle={() => setExpandedCitation(
              expandedCitation === citation.id ? null : citation.id
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Citation Card Component
function CitationCard({ citation, isExpanded, onToggle }: CitationCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded flex items-center justify-center text-sm font-medium text-brand-700">
            {citation.index}
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900 line-clamp-1">
              {citation.title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {citation.source}
            </div>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isExpanded && "rotate-180"
        )} />
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700">{citation.content}</p>
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              View source
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 4.3 Agent Management
```typescript
// components/agents/AgentSelector.tsx
export function AgentSelector() {
  const { agents, currentAgent, setCurrentAgent } = useAgentStore();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <Bot className="w-4 h-4 text-gray-600" />
          <span className="font-medium">
            {currentAgent?.project_name || 'Select Agent'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Available Agents</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => setCurrentAgent(agent)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                agent.is_chat_active ? "bg-green-500" : "bg-gray-300"
              )} />
              <span>{agent.project_name}</span>
            </div>
            {currentAgent?.id === agent.id && (
              <Check className="w-4 h-4 text-brand-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="w-4 h-4 mr-2" />
          Create New Agent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Phase 5: State Management & API Integration (Days 13-14)

#### 5.1 Zustand Store Architecture
```typescript
// store/chat-store.ts
interface ChatStore {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  
  // Actions
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  createConversation: (name: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  cancelStream: () => void;
  updateMessageFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  
  sendMessage: async (content: string, files?: File[]) => {
    const { currentConversation, currentAgent } = useAgentStore.getState();
    
    if (!currentConversation || !currentAgent) {
      throw new Error('No conversation or agent selected');
    }
    
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    set(state => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
    }));
    
    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    
    set(state => ({
      messages: [...state.messages, assistantMessage],
      streamingMessageId: assistantMessage.id,
    }));
    
    try {
      // Handle file uploads if present
      if (files && files.length > 0) {
        await uploadFiles(currentAgent.id, files);
      }
      
      // Send message with streaming
      const stream = await client.sendMessage(
        currentAgent.id,
        currentConversation.id,
        { prompt: content },
        { stream: true }
      );
      
      const handler = new StreamHandler();
      
      for await (const chunk of handler.processStream(stream)) {
        set(state => ({
          messages: state.messages.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: msg.content + chunk.content, citations: chunk.citations }
              : msg
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error
    } finally {
      set({ isStreaming: false, streamingMessageId: null });
    }
  },
  
  // ... other actions
}));
```

#### 5.2 React Query Integration
```typescript
// hooks/use-agents.ts
export function useAgents() {
  const apiKey = useConfigStore(state => state.apiKey);
  
  return useQuery({
    queryKey: ['agents', apiKey],
    queryFn: async () => {
      const client = new CustomGPTClient({ apiKey });
      return client.getAgents();
    },
    enabled: !!apiKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// hooks/use-conversations.ts
export function useConversations(projectId: number) {
  const apiKey = useConfigStore(state => state.apiKey);
  
  return useQuery({
    queryKey: ['conversations', projectId],
    queryFn: async () => {
      const client = new CustomGPTClient({ apiKey });
      return client.getConversations(projectId);
    },
    enabled: !!apiKey && !!projectId,
  });
}
```

### Phase 6: Deployment Configuration (Days 15-16)

#### 6.1 Build Configurations

**Standalone Build**:
```typescript
// next.config.js
module.exports = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_DEPLOYMENT_MODE: 'standalone',
  },
};
```

**Widget Build**:
```typescript
// widget.config.js
const webpack = require('webpack');

module.exports = {
  entry: './src/widget/index.tsx',
  output: {
    filename: 'customgpt-widget.js',
    library: 'CustomGPT',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.DEPLOYMENT_MODE': JSON.stringify('widget'),
    }),
  ],
};
```

**Embed Build**:
```typescript
// embed.config.js
module.exports = {
  entry: './src/embed/index.tsx',
  output: {
    filename: 'customgpt-embed.js',
    library: 'CustomGPTEmbed',
    libraryTarget: 'umd',
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
```

#### 6.2 Docker Configuration
```dockerfile
# Multi-stage build for all deployment modes
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY . .
RUN npm run build:all

# Standalone deployment
FROM node:18-alpine AS standalone
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]

# Static files for CDN
FROM nginx:alpine AS cdn
COPY --from=build /app/dist/widget ./widget
COPY --from=build /app/dist/embed ./embed
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Phase 7: Testing & Optimization (Days 17-18)

#### 7.1 Performance Optimizations
- **Code Splitting**: Dynamic imports for heavy components
- **Virtual Scrolling**: For large message lists
- **Lazy Loading**: Images and file previews
- **Response Caching**: Via React Query
- **Bundle Optimization**: Tree shaking and minification

#### 7.2 Testing Strategy
- **Unit Tests**: Components and utilities
- **Integration Tests**: API client and state management
- **E2E Tests**: User workflows
- **Performance Tests**: Bundle size and runtime metrics

## Key Features Implementation

### 1. Multi-Format Support
- **Standalone**: Full-featured web app with routing
- **Widget**: Minimal bundle with core features
- **Embed**: Iframe-friendly with postMessage API

### 2. Streaming Support
- Server-Sent Events handling
- Progressive message rendering
- Stream cancellation
- Error recovery

### 3. File Upload
- Drag-and-drop interface
- Multi-file support
- Progress tracking
- File type validation

### 4. Citation Management
- Inline citation markers
- Expandable source cards
- Source verification
- Citation export

### 5. Agent Configuration
- Dynamic agent switching
- Settings persistence
- Custom instructions
- Model selection

## Deployment Options

### 1. Vercel Deployment
```bash
npm run build
vercel --prod
```

### 2. Docker Deployment
```bash
docker build -t customgpt-ui .
docker run -p 3000:3000 customgpt-ui
```

### 3. CDN Distribution
```bash
npm run build:widget
# Upload to CDN
aws s3 sync dist/widget s3://cdn.customgpt.ai/widget
```

## Usage Examples

### Standalone Usage
```html
<!-- Visit https://chat.customgpt.ai -->
```

### Widget Integration
```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.customgpt.ai/widget/customgpt-widget.js';
    script.onload = function() {
      CustomGPT.init({
        apiKey: 'YOUR_API_KEY',
        projectId: YOUR_PROJECT_ID,
        position: 'bottom-right',
        theme: 'light'
      });
    };
    document.head.appendChild(script);
  })();
</script>
```

### Embed Integration
```html
<div id="customgpt-chat" style="width: 100%; height: 600px;"></div>
<script src="https://cdn.customgpt.ai/embed/customgpt-embed.js"></script>
<script>
  CustomGPTEmbed.render('#customgpt-chat', {
    apiKey: 'YOUR_API_KEY',
    projectId: YOUR_PROJECT_ID,
    theme: 'light'
  });
</script>
```

## Summary

This implementation plan provides a comprehensive approach to building a versatile ChatGPT-like interface for CustomGPT.ai that:

1. **Supports Multiple Deployment Modes**: Standalone, widget, and embed
2. **Implements Full API Coverage**: Including streaming, file uploads, and citations
3. **Provides Claude-Inspired UI**: Modern, clean interface with CustomGPT branding
4. **Ensures Performance**: Optimized bundles and efficient rendering
5. **Maintains Flexibility**: Easy configuration and customization

The modular architecture allows for easy maintenance and feature additions while keeping deployment options flexible for different use cases.