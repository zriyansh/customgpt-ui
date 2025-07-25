import React, { useState } from 'react';
import { X, Save, File, Link, Type, Database, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSourceStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn, formatTimestamp, formatFileSize } from '@/lib/utils';
import type { Source } from '@/store/sources';

interface SourceEditorProps {
  source: Source;
  onClose: () => void;
  onSave: () => void;
}

const typeIcons = {
  file: File,
  url: Link,
  text: Type,
  api: Database,
};

export const SourceEditor: React.FC<SourceEditorProps> = ({
  source,
  onClose,
  onSave,
}) => {
  const { currentAgent } = useAgentStore();
  const { updateSource, loading } = useSourceStore();
  
  const [name, setName] = useState(source.name);
  const [status, setStatus] = useState<'active' | 'inactive' | 'processing'>(
    source.status === 'error' ? 'inactive' : source.status
  );
  const [description, setDescription] = useState(
    source.metadata?.description || ''
  );
  const [tags, setTags] = useState<string[]>(
    source.metadata?.tags || []
  );
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>(
    Object.entries(source.metadata || {})
      .filter(([key]) => !['description', 'tags', 'author', 'lastIndexed'].includes(key))
      .map(([key, value]) => ({ key, value: String(value) }))
  );
  const [newTag, setNewTag] = useState('');

  const TypeIcon = typeIcons[source.type];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      // Build metadata object
      const metadata: Record<string, any> = {
        description: description.trim(),
        tags: tags.filter(t => t.trim()),
        lastIndexed: source.metadata?.lastIndexed || new Date().toISOString(),
      };

      // Add custom fields
      customFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          metadata[field.key.trim()] = field.value.trim();
        }
      });

      await updateSource(currentAgent.id, source.id, {
        name: name.trim(),
        status,
        metadata,
      });
      
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
            <TypeIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Source
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={loading || !name.trim()}
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
          {/* Source Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{source.type.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">{formatTimestamp(source.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2">{formatTimestamp(source.updated_at)}</span>
              </div>
              {source.size && (
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="ml-2">{formatFileSize(source.size)}</span>
                </div>
              )}
            </div>
            
            {source.url && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">URL:</span>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-brand-600 hover:underline break-all"
                >
                  {source.url}
                </a>
              </div>
            )}
            
            {source.error_message && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <span className="font-medium">Error:</span> {source.error_message}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Source name..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                maxLength={200}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this source..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tags</h3>
            
            {/* Add tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Tags list */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
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

          {/* Content Preview (for text sources) */}
          {source.type === 'text' && source.content && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
              <div className="p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {source.content.substring(0, 1000)}
                  {source.content.length > 1000 && '...'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};