'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload,
  Database,
  File,
  Link,
  Type,
  Settings,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

import { useSourceStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn, formatTimestamp, formatFileSize } from '@/lib/utils';
import type { Source } from '@/store/sources';

// We'll create these components
import { SourceEditor } from '@/components/sources/SourceEditor';
import { SourceFilters } from '@/components/sources/SourceFilters';
import { SourceUploadModal } from '@/components/sources/SourceUploadModal';

const typeIcons = {
  file: File,
  url: Link,
  text: Type,
  api: Database,
};

const statusIcons = {
  active: CheckCircle,
  inactive: XCircle,
  processing: Clock,
  error: AlertCircle,
};

const statusColors = {
  active: 'text-green-600 bg-green-100',
  inactive: 'text-gray-600 bg-gray-100',
  processing: 'text-blue-600 bg-blue-100',
  error: 'text-red-600 bg-red-100',
};

interface SourceCardProps {
  source: Source;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: (source: Source) => void;
  onDelete: (source: Source) => void;
  onView: (source: Source) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({
  source,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}) => {
  const TypeIcon = typeIcons[source.type];
  const StatusIcon = statusIcons[source.status];
  
  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all cursor-pointer',
      isSelected && 'ring-2 ring-brand-500'
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {source.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {source.metadata?.description || 'No description'}
              </p>
            </div>
          </div>
          
          <div className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            statusColors[source.status]
          )}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {source.status}
          </div>
        </div>

        {/* Content Info */}
        <div className="space-y-2">
          {source.type === 'file' && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {source.file_type && (
                <span>{source.file_type.toUpperCase()}</span>
              )}
              {source.size && (
                <span>{formatFileSize(source.size)}</span>
              )}
            </div>
          )}
          
          {source.type === 'url' && source.url && (
            <div className="text-xs text-gray-500 truncate">
              URL: {source.url}
            </div>
          )}
          
          {source.metadata?.tags && source.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {source.metadata.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {source.metadata.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{source.metadata.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Updated {formatTimestamp(source.updated_at)}</span>
          {source.indexed_at && (
            <span>Indexed {formatTimestamp(source.indexed_at)}</span>
          )}
        </div>

        {/* Error Message */}
        {source.status === 'error' && source.error_message && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {source.error_message}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onView(source);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(source);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(source);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function SourcesPage() {
  const router = useRouter();
  const { currentAgent } = useAgentStore();
  const { 
    sources, 
    loading, 
    error, 
    searchQuery,
    filter,
    syncStatus,
    fetchSources,
    deleteSource,
    bulkDelete,
    syncSources,
    uploadSources,
    setSearchQuery,
    setFilter,
    selectSource
  } = useSourceStore();

  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Drag and drop for file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentAgent) return;
    
    try {
      await uploadSources(currentAgent.id, acceptedFiles);
    } catch (error) {
      // Error already handled in store
    }
  }, [currentAgent, uploadSources]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: !currentAgent || loading,
  });

  useEffect(() => {
    if (!currentAgent) {
      toast.error('Please select an agent first');
      router.push('/');
      return;
    }

    fetchSources(currentAgent.id);
  }, [currentAgent]);

  // Filter and search sources
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (source.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filter.status === 'all' || source.status === filter.status;
    const matchesType = filter.type === 'all' || source.type === filter.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort sources
  const sortedSources = [...filteredSources].sort((a, b) => {
    const sortKey = filter.sortBy || 'updated_at';
    const sortOrder = filter.sortOrder || 'desc';
    
    let comparison = 0;
    if (sortKey === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortKey === 'size') {
      comparison = (a.size || 0) - (b.size || 0);
    } else {
      comparison = new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSelectSource = (sourceId: string, selected: boolean) => {
    if (selected) {
      setSelectedSources([...selectedSources, sourceId]);
    } else {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedSources(sortedSources.map(s => s.id));
    } else {
      setSelectedSources([]);
    }
  };

  const handleEditSource = (source: Source) => {
    setEditingSource(source);
    selectSource(source);
    setShowEditor(true);
  };

  const handleViewSource = (source: Source) => {
    setEditingSource(source);
    selectSource(source);
    setShowEditor(true);
  };

  const handleDeleteSource = async (source: Source) => {
    if (!currentAgent) return;
    
    if (!confirm(`Are you sure you want to delete "${source.name}"?`)) {
      return;
    }

    try {
      await deleteSource(currentAgent.id, source.id);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleBulkDelete = async () => {
    if (!currentAgent || selectedSources.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedSources.length} sources?`)) {
      return;
    }

    try {
      await bulkDelete(currentAgent.id, selectedSources);
      setSelectedSources([]);
    } catch (error) {
      // Errors already handled in store
    }
  };

  const handleSync = async () => {
    if (!currentAgent) return;
    
    try {
      await syncSources(currentAgent.id);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleRefresh = () => {
    if (currentAgent) {
      fetchSources(currentAgent.id);
    }
  };

  if (!currentAgent) {
    return null;
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Data Sources
              </h1>
              <p className="mt-2 text-gray-600">
                Manage files, URLs, and data sources for {currentAgent.project_name}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={syncStatus.syncing}
                size="sm"
              >
                <RotateCcw className={cn('w-4 h-4 mr-2', syncStatus.syncing && 'animate-spin')} />
                {syncStatus.syncing ? 'Syncing...' : 'Sync'}
              </Button>
              
              <Button
                variant="default"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error loading sources</span>
            </div>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            
            <SourceFilters
              filter={filter}
              onChange={setFilter}
            />
          </div>

          {/* Bulk Actions */}
          {selectedSources.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedSources.length} sources selected
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedSources([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sources</p>
                <p className="text-2xl font-bold text-gray-900">{sources.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sources.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sources.filter(s => s.status === 'processing').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sources.filter(s => s.status === 'error').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sources Grid */}
        {loading && sources.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16" />
                    <div className="h-8 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : sortedSources.length === 0 ? (
          <div 
            {...getRootProps()}
            className={cn(
              "text-center py-12 border-2 border-dashed rounded-lg transition-colors",
              isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-300"
            )}
          >
            <input {...getInputProps()} />
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No sources found' : 'No sources yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : isDragActive
                  ? 'Drop files here to upload'
                  : 'Drag and drop files here, or click to add sources'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={selectedSources.length === sortedSources.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-sm text-gray-600">
                Select all ({sortedSources.length} sources)
              </span>
            </div>

            {/* Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  isSelected={selectedSources.includes(source.id)}
                  onSelect={(selected) => handleSelectSource(source.id, selected)}
                  onEdit={handleEditSource}
                  onDelete={handleDeleteSource}
                  onView={handleViewSource}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showUploadModal && (
        <SourceUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(files) => {
            if (currentAgent) {
              uploadSources(currentAgent.id, files);
            }
            setShowUploadModal(false);
          }}
        />
      )}
      
      {showEditor && editingSource && (
        <SourceEditor
          source={editingSource}
          onClose={() => {
            setShowEditor(false);
            setEditingSource(null);
          }}
          onSave={() => {
            setShowEditor(false);
            setEditingSource(null);
            if (currentAgent) {
              fetchSources(currentAgent.id);
            }
          }}
        />
      )}
    </PageLayout>
  );
}