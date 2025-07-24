'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCw,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

import type { MessageProps, Citation, ChatMessage } from '@/types';
import { cn, copyToClipboard, formatTimestamp } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CitationList } from './CitationList';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 px-2 text-xs bg-gray-800 text-white hover:bg-gray-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
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

const StreamingCursor: React.FC = () => (
  <span className="inline-block w-0.5 h-4 bg-gray-900 animate-blink ml-0.5 align-middle" />
);

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, isStreaming }) => {
  return (
    <div className="prose prose-sm max-w-none text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return !isInline && match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className="px-1 py-0.5 rounded bg-gray-100 text-sm font-medium" {...props}>
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
                className="text-brand-600 hover:text-brand-700 no-underline hover:underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink className="w-3 h-3" />
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

interface MessageActionsProps {
  message: ChatMessage;
  onFeedback?: (feedback: 'like' | 'dislike') => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, onFeedback }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(
    message.feedback || null
  );

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      toast.success('Message copied to clipboard');
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    onFeedback?.(type);
    toast.success('Thanks for your feedback!');
  };

  const handleRegenerate = () => {
    // This would trigger message regeneration
    toast.info('Regenerating response...');
  };

  return (
    <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="h-8 w-8 text-gray-500 hover:text-gray-700"
        title="Copy message"
      >
        <Copy className="h-4 w-4" />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleFeedback('like')}
        className={cn(
          'h-8 w-8 text-gray-500 hover:text-gray-700',
          feedback === 'like' && 'text-green-600 hover:text-green-700'
        )}
        title="Good response"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleFeedback('dislike')}
        className={cn(
          'h-8 w-8 text-gray-500 hover:text-gray-700',
          feedback === 'dislike' && 'text-red-600 hover:text-red-700'
        )}
        title="Bad response"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={handleRegenerate}
        className="h-8 w-8 text-gray-500 hover:text-gray-700"
        title="Regenerate response"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const Message: React.FC<MessageProps> = ({ 
  message, 
  isStreaming = false, 
  isLast = false,
  onCitationClick,
  onFeedback,
  className 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative px-4 py-6 transition-colors',
        isUser ? 'bg-white' : 'bg-gray-50 border-y border-gray-100',
        'hover:bg-opacity-80',
        className
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
          {/* Message Status */}
          {message.status && message.status !== 'sent' && (
            <div className="mb-2 text-xs text-gray-500">
              {message.status === 'sending' && 'Sending...'}
              {message.status === 'error' && (
                <span className="text-red-500">Failed to send</span>
              )}
            </div>
          )}
          
          {/* Message Content */}
          {isUser ? (
            <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MessageContent 
              content={message.content} 
              isStreaming={isStreaming}
            />
          )}
          
          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <CitationList 
              citations={message.citations}
              onCitationClick={onCitationClick}
            />
          )}
          
          {/* Timestamp */}
          <div className="mt-2 text-xs text-gray-400">
            {formatTimestamp(message.timestamp)}
          </div>
          
          {/* Actions */}
          {!isUser && !isStreaming && (
            <MessageActions 
              message={message}
              onFeedback={onFeedback}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};