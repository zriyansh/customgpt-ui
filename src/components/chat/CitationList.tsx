'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ChevronDown, 
  ExternalLink 
} from 'lucide-react';

import type { CitationProps, Citation } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CitationCardProps {
  citation: Citation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onClick?: (citation: Citation) => void;
}

const CitationCard: React.FC<CitationCardProps> = ({
  citation,
  index,
  isExpanded,
  onToggle,
  onClick,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-gray-300">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Citation Index */}
        <div className="flex-shrink-0 w-6 h-6 rounded bg-brand-100 flex items-center justify-center">
          <span className="text-xs font-medium text-brand-700">{index}</span>
        </div>
        
        {/* Citation Info */}
        <div className="flex-1 min-w-0">
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
            'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-700 mb-2">
                {citation.content}
              </p>
              
              {/* Confidence Score */}
              {citation.confidence && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Relevance</span>
                    <span>{Math.round(citation.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-brand-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${citation.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    View source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                {onClick && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onClick(citation)}
                    className="h-6 px-2 text-xs"
                  >
                    View details
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CitationList: React.FC<CitationProps> = ({ 
  citations, 
  onCitationClick,
  maxVisible = 5,
  className 
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  
  const visibleCitations = showAll ? citations : citations.slice(0, maxVisible);
  const hasMore = citations.length > maxVisible;

  const toggleExpanded = (citationId: string) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(citationId)) {
      newExpanded.delete(citationId);
    } else {
      newExpanded.add(citationId);
    }
    setExpanded(newExpanded);
  };

  if (citations.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-4 space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BookOpen className="w-4 h-4" />
        <span className="font-medium">Sources</span>
        <span className="text-gray-400">({citations.length})</span>
        
        {hasMore && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            className="ml-auto h-6 px-2 text-xs"
          >
            {showAll ? 'Show less' : `Show all ${citations.length}`}
          </Button>
        )}
      </div>
      
      {/* Citations */}
      <div className="space-y-2">
        <AnimatePresence>
          {visibleCitations.map((citation, idx) => (
            <motion.div
              key={citation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <CitationCard
                citation={citation}
                index={idx + 1}
                isExpanded={expanded.has(citation.id)}
                onToggle={() => toggleExpanded(citation.id)}
                onClick={onCitationClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Load More Button */}
      {hasMore && !showAll && (
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            Show {citations.length - maxVisible} more sources
          </Button>
        </div>
      )}
    </div>
  );
};