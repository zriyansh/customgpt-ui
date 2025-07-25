import React, { useState, useEffect } from 'react';
import { X, Save, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { usePageStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Page } from '@/store/pages';

interface PageEditorProps {
  page: Page | null;
  onClose: () => void;
  onSave: () => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onClose,
  onSave,
}) => {
  const { currentAgent } = useAgentStore();
  const { createPage, updatePage, loading } = usePageStore();
  
  const [title, setTitle] = useState(page?.title || '');
  const [content, setContent] = useState(page?.content || '');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>(
    page?.status || 'draft'
  );
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // Update word count
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleSave = async () => {
    if (!currentAgent) {
      toast.error('No agent selected');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      if (page) {
        // Update existing page
        await updatePage(currentAgent.id, page.id, {
          title: title.trim(),
          content: content.trim(),
          status,
        });
      } else {
        // Create new page
        await createPage(currentAgent.id, {
          title: title.trim(),
          content: content.trim(),
          status,
        });
      }
      
      onSave();
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {page ? 'Edit Page' : 'Create New Page'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={loading || !title.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            {wordCount} words
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Page title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
              maxLength={200}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {isPreview ? (
              /* Preview Mode */
              <div className="h-full overflow-y-auto p-4">
                <div className="prose max-w-none">
                  <h1>{title}</h1>
                  <div className="whitespace-pre-wrap">
                    {content}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <textarea
                placeholder="Start writing your content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-4 text-gray-900 placeholder-gray-400 border-none outline-none resize-none font-mono text-sm leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <div>
              {page && (
                <span>
                  Last updated: {new Date(page.updated_at).toLocaleString()}
                </span>
              )}
            </div>
            <div>
              Press Ctrl+S (Cmd+S) to save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};