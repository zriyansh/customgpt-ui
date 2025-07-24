# CustomGPT.ai Chat UI - Component Specifications

## UI Component Library

### Design System Foundation

```typescript
// Theme Configuration
export const theme = {
  colors: {
    // Brand Colors (CustomGPT.ai)
    brand: {
      50: '#f0f7ff',
      100: '#e0efff',
      200: '#b8d9ff',
      300: '#7ab8ff',
      400: '#3394ff',
      500: '#0a75ff', // Primary
      600: '#0058e6',
      700: '#0044ba',
      800: '#003896',
      900: '#002d7a',
    },
    
    // Claude-Inspired Neutrals
    gray: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    
    // Semantic Colors
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#065f46',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#991b1b',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#92400e',
    },
  },
  
  typography: {
    fonts: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'Fira Code, Monaco, Consolas, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};
```

## Core Chat Components

### 1. ChatContainer
The main container that orchestrates all chat functionality.

```typescript
interface ChatContainerProps {
  mode: 'standalone' | 'widget' | 'floating';
  apiKey: string;
  projectId: number;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  width?: string;
  height?: string;
  onClose?: () => void;
}

export const ChatContainer: FC<ChatContainerProps> = ({
  mode,
  apiKey,
  projectId,
  theme = 'light',
  position = 'bottom-right',
  width = mode === 'standalone' ? '100%' : '400px',
  height = mode === 'standalone' ? '100vh' : '600px',
  onClose,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-gray-900',
        mode === 'standalone' && 'h-screen',
        mode === 'widget' && 'rounded-lg shadow-xl border border-gray-200',
        mode === 'floating' && 'fixed rounded-lg shadow-2xl',
        mode === 'floating' && position === 'bottom-right' && 'bottom-6 right-6',
        mode === 'floating' && position === 'bottom-left' && 'bottom-6 left-6'
      )}
      style={{ width, height }}
    >
      <ChatHeader mode={mode} onClose={onClose} />
      <MessageArea className="flex-1" />
      <InputArea />
    </div>
  );
};
```

### 2. ChatHeader
Header component with agent selector and actions.

```typescript
interface ChatHeaderProps {
  mode: 'standalone' | 'widget' | 'floating';
  onClose?: () => void;
}

export const ChatHeader: FC<ChatHeaderProps> = ({ mode, onClose }) => {
  const { currentAgent } = useAgentStore();
  
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        
        {/* Agent Info */}
        <div>
          <h2 className="font-semibold text-gray-900">
            {currentAgent?.project_name || 'CustomGPT Assistant'}
          </h2>
          <p className="text-xs text-gray-500">
            {currentAgent?.is_chat_active ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {mode === 'standalone' && <AgentSelector />}
        <SettingsButton />
        {mode !== 'standalone' && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </header>
  );
};
```

### 3. MessageArea
Scrollable area containing all messages.

```typescript
interface MessageAreaProps {
  className?: string;
}

export const MessageArea: FC<MessageAreaProps> = ({ className }) => {
  const messages = useMessages();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);
  
  return (
    <div
      ref={scrollRef}
      className={cn(
        'overflow-y-auto scroll-smooth',
        'bg-gradient-to-b from-gray-50 to-white',
        className
      )}
    >
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full px-4 py-8">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to CustomGPT!
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-sm">
            I'm here to help answer your questions. How can I assist you today?
          </p>
          <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-md">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <ExamplePromptCard key={idx} prompt={prompt} />
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="space-y-0">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isStreaming={message.id === streamingMessageId}
            isLast={index === messages.length - 1}
          />
        ))}
      </div>
      
      {/* Typing Indicator */}
      {isStreaming && <TypingIndicator />}
    </div>
  );
};
```

### 4. Message Component
Individual message with avatar, content, and actions.

```typescript
interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isLast?: boolean;
}

export const Message: FC<MessageProps> = ({ message, isStreaming, isLast }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'group relative px-4 py-6 transition-colors',
        isUser ? 'bg-white' : 'bg-gray-50 border-y border-gray-100',
        'hover:bg-opacity-80'
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-600" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isUser ? (
            <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <MessageContent
                content={message.content}
                isStreaming={isStreaming}
              />
              {message.citations && message.citations.length > 0 && (
                <CitationList citations={message.citations} />
              )}
            </>
          )}
          
          {/* Actions */}
          {!isUser && !isStreaming && (
            <MessageActions message={message} />
          )}
        </div>
      </div>
    </div>
  );
};
```

### 5. MessageContent
Renders markdown content with syntax highlighting.

```typescript
interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

export const MessageContent: FC<MessageContentProps> = ({ content, isStreaming }) => {
  return (
    <div className="prose prose-sm max-w-none text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className="px-1 py-0.5 rounded bg-gray-100 text-sm" {...props}>
                {children}
              </code>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 underline"
              >
                {children}
                <ExternalLink className="inline w-3 h-3 ml-1" />
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && <StreamingCursor />}
    </div>
  );
};
```

### 6. InputArea
Message input with file upload support.

```typescript
interface InputAreaProps {
  className?: string;
}

export const InputArea: FC<InputAreaProps> = ({ className }) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { sendMessage, isStreaming } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    if (isStreaming) return;
    
    await sendMessage(input, files);
    setInput('');
    setFiles([]);
    textareaRef.current?.focus();
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'border-t border-gray-200 bg-white px-4 py-3',
        className
      )}
    >
      {/* File Preview */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <FileChip
              key={idx}
              file={file}
              onRemove={() => setFiles(files.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {/* File Upload */}
        <FileUploadButton
          onUpload={(newFiles) => setFiles([...files, ...newFiles])}
          disabled={isStreaming}
        />
        
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={isStreaming}
            rows={1}
            className={cn(
              'w-full resize-none rounded-lg border border-gray-300',
              'px-3 py-2 pr-12',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[44px] max-h-[200px]'
            )}
            style={{
              height: 'auto',
              overflowY: input.split('\n').length > 5 ? 'auto' : 'hidden',
            }}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {input.length > 0 && `${input.length}/4000`}
          </div>
        </div>
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isStreaming || (!input.trim() && files.length === 0)}
          className={cn(
            'p-2 rounded-lg transition-all',
            'bg-brand-500 text-white',
            'hover:bg-brand-600',
            'focus:outline-none focus:ring-2 focus:ring-brand-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isStreaming && 'animate-pulse'
          )}
        >
          {isStreaming ? (
            <Square className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Input Hints */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>Supports PDF, DOC, TXT, and more</span>
      </div>
    </form>
  );
};
```

### 7. Citation Components

```typescript
interface CitationListProps {
  citations: Citation[];
}

export const CitationList: FC<CitationListProps> = ({ citations }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BookOpen className="w-4 h-4" />
        <span className="font-medium">Sources</span>
        <span className="text-gray-400">({citations.length})</span>
      </div>
      
      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <CitationCard
            key={citation.id}
            citation={citation}
            index={idx + 1}
            isExpanded={expanded.has(citation.id)}
            onToggle={() => {
              const newExpanded = new Set(expanded);
              if (expanded.has(citation.id)) {
                newExpanded.delete(citation.id);
              } else {
                newExpanded.add(citation.id);
              }
              setExpanded(newExpanded);
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface CitationCardProps {
  citation: Citation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const CitationCard: FC<CitationCardProps> = ({
  citation,
  index,
  isExpanded,
  onToggle,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Citation Index */}
        <div className="flex-shrink-0 w-6 h-6 rounded bg-brand-100 flex items-center justify-center">
          <span className="text-xs font-medium text-brand-700">{index}</span>
        </div>
        
        {/* Citation Info */}
        <div className="flex-1 text-left">
          <div className="font-medium text-sm text-gray-900 line-clamp-1">
            {citation.title}
          </div>
          <div className="text-xs text-gray-500 line-clamp-1">
            {citation.source || citation.url}
          </div>
        </div>
        
        {/* Expand Icon */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700 mb-2">{citation.content}</p>
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              View source
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
```

### 8. Agent Selector

```typescript
export const AgentSelector: FC = () => {
  const { agents, currentAgent, selectAgent } = useAgentStore();
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <Bot className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {currentAgent?.project_name || 'Select Agent'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Available Agents</h3>
          <p className="text-xs text-gray-500 mt-1">
            Select an agent to start chatting
          </p>
        </div>
        
        <div className="max-h-80 overflow-y-auto p-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                selectAgent(agent);
                setOpen(false);
              }}
              className={cn(
                'w-full p-3 rounded-lg text-left transition-colors',
                'hover:bg-gray-50',
                currentAgent?.id === agent.id && 'bg-brand-50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-1.5',
                  agent.is_chat_active ? 'bg-green-500' : 'bg-gray-300'
                )} />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {agent.project_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Created {new Date(agent.created_at).toLocaleDateString()}
                  </div>
                </div>
                {currentAgent?.id === agent.id && (
                  <Check className="w-4 h-4 text-brand-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-2 border-t border-gray-100">
          <button className="w-full p-2 rounded-lg text-sm text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Agent
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
```

### 9. File Upload Components

```typescript
interface FileUploadButtonProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUploadButton: FC<FileUploadButtonProps> = ({ onUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
      e.target.value = '';
    }
  };
  
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'hover:bg-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Paperclip className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
};

interface FileChipProps {
  file: File;
  onRemove: () => void;
}

export const FileChip: FC<FileChipProps> = ({ file, onRemove }) => {
  const fileIcon = getFileIcon(file.type);
  const fileSize = formatFileSize(file.size);
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
      <div className="text-gray-600">{fileIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </div>
        <div className="text-xs text-gray-500">{fileSize}</div>
      </div>
      <button
        onClick={onRemove}
        className="p-0.5 rounded hover:bg-gray-200 transition-colors"
      >
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </div>
  );
};
```

### 10. Utility Components

```typescript
// Typing Indicator
export const TypingIndicator: FC = () => {
  return (
    <div className="px-4 py-6 bg-gray-50 border-t border-gray-100">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
          <Bot className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
};

// Streaming Cursor
export const StreamingCursor: FC = () => {
  return (
    <span className="inline-block w-0.5 h-4 bg-gray-900 animate-blink ml-0.5" />
  );
};

// Code Block with Copy Button
interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

// Message Actions
interface MessageActionsProps {
  message: ChatMessage;
}

export const MessageActions: FC<MessageActionsProps> = ({ message }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copied to clipboard');
  };
  
  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    updateMessageFeedback(message.id, type);
    toast.success('Thanks for your feedback!');
  };
  
  return (
    <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Copy message"
      >
        <Copy className="w-4 h-4 text-gray-500" />
      </button>
      
      <button
        onClick={() => handleFeedback('like')}
        className={cn(
          'p-1.5 rounded hover:bg-gray-100 transition-colors',
          feedback === 'like' && 'text-green-600'
        )}
        title="Good response"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleFeedback('dislike')}
        className={cn(
          'p-1.5 rounded hover:bg-gray-100 transition-colors',
          feedback === 'dislike' && 'text-red-600'
        )}
        title="Bad response"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => regenerateMessage(message.id)}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Regenerate response"
      >
        <RotateCw className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};
```

## Animations and Transitions

```css
/* Custom animations */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.animate-blink {
  animation: blink 1s infinite;
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

/* Smooth scrolling */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Message transitions */
.message-enter {
  opacity: 0;
  transform: translateY(10px);
}

.message-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
```

## Responsive Design

```typescript
// Responsive breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// Responsive utilities
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };
    
    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);
  
  return { isMobile, isTablet, isDesktop };
};

// Responsive Chat Container
export const ResponsiveChatContainer: FC = () => {
  const { isMobile } = useResponsive();
  
  return (
    <ChatContainer
      mode={isMobile ? 'floating' : 'standalone'}
      width={isMobile ? '100vw' : undefined}
      height={isMobile ? '100vh' : undefined}
    />
  );
};
```

## Summary

This component specification provides:

1. **Comprehensive Design System** with CustomGPT branding
2. **Modular Component Architecture** for easy maintenance
3. **Claude-Inspired UI Elements** with clean, minimal design
4. **Full Feature Support** including streaming, citations, and file uploads
5. **Responsive Design** that works across all devices
6. **Smooth Animations** for excellent user experience
7. **Accessibility Features** built into every component

The components are designed to be:
- **Reusable** across different deployment modes
- **Performant** with optimized rendering
- **Customizable** through props and theme configuration
- **Accessible** following WCAG guidelines
- **Type-Safe** with full TypeScript support