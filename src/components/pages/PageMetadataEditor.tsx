import React, { useState } from 'react';
import { X, Save, Settings, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { usePageStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import type { Page } from '@/store/pages';

interface PageMetadataEditorProps {
  page: Page;
  onClose: () => void;
  onSave: () => void;
}

export const PageMetadataEditor: React.FC<PageMetadataEditorProps> = ({
  page,
  onClose,
  onSave,
}) => {
  const { currentAgent } = useAgentStore();
  const { updateMetadata, loading } = usePageStore();
  
  const [description, setDescription] = useState(
    page.metadata?.description || ''
  );
  const [keywords, setKeywords] = useState<string[]>(
    page.metadata?.keywords || []
  );
  const [author, setAuthor] = useState(
    page.metadata?.author || ''
  );
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>(
    Object.entries(page.metadata || {})
      .filter(([key]) => !['description', 'keywords', 'author', 'lastModified'].includes(key))
      .map(([key, value]) => ({ key, value: String(value) }))
  );
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleUpdateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!currentAgent) {
      toast.error('No agent selected');
      return;
    }

    try {
      // Build metadata object
      const metadata: Record<string, any> = {
        description: description.trim(),
        keywords: keywords.filter(k => k.trim()),
        author: author.trim(),
        lastModified: new Date().toISOString(),
      };

      // Add custom fields
      customFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          metadata[field.key.trim()] = field.value.trim();
        }
      });

      await updateMetadata(currentAgent.id, page.id, metadata);
      onSave();
    } catch (error) {
      // Error already handled in store
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Page Metadata
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={loading}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Page Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{page.title}</h3>
            <p className="text-sm text-gray-600">
              Created: {new Date(page.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Updated: {new Date(page.updated_at).toLocaleString()}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this page..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            
            {/* Add keyword */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add keyword..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Keywords list */}
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Custom Fields
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddCustomField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-2">
              {customFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleUpdateCustomField(index, 'key', e.target.value)}
                    placeholder="Field name..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                    placeholder="Field value..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCustomField(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};