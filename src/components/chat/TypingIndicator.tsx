'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <div className={cn(
      'px-4 py-6 bg-gray-50 border-y border-gray-100',
      className
    )}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-brand-600" />
        </div>
        
        {/* Typing Animation */}
        <div className="flex items-center gap-1 py-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-subtle" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-subtle delay-100" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-subtle delay-200" />
        </div>
      </div>
    </div>
  );
};