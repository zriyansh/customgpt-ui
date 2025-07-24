'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  MoreHorizontal,
  Globe,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

import { useSourceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTimestamp, formatFileSize } from '@/lib/utils';
import type { Agent } from '@/types';

interface SourcesSettingsProps {
  project: Agent;
}

export const SourcesSettings: React.FC<SourcesSettingsProps> = ({ project }) => {
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

  // Drag and drop for file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      await uploadSources(project.id, acceptedFiles);
      toast.success(`Uploaded ${acceptedFiles.length} files successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    }
  }, [project.id, uploadSources]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: loading,
  });

  useEffect(() => {
    fetchSources(project.id);
  }, [project.id]);

  const handleRefresh = () => {
    fetchSources(project.id);
  };

  const handleSync = async () => {
    try {
      await syncSources(project.id);
      toast.success('Sources synced successfully');
    } catch (error) {
      toast.error('Failed to sync sources');
    }
  };

  // Filter and search sources
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (source.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filter.status === 'all' || source.status === filter.status;
    const matchesType = filter.type === 'all' || source.type === filter.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeIcons = {
    file: FileText,
    url: Globe,
    text: Type,
    api: Database,
  };

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    processing: 'text-blue-600 bg-blue-100',
    error: 'text-red-600 bg-red-100',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Sources</h2>
          <p className="text-gray-600 mt-1">
            Manage files, URLs, and data sources for {project.project_name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              POST /projects/{project.id}/sources
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading sources</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          {error.includes('403') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                <strong>Premium Feature:</strong> This feature may require a premium subscription. 
                Please upgrade your plan to access advanced source management features.
              </p>
            </div>
          )}
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
          
          <select
            value={filter.type || 'all'}
            onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Types</option>
            <option value="file">Files</option>
            <option value="url">URLs</option>
            <option value="text">Text</option>
            <option value="api">API</option>
          </select>
          
          <select
            value={filter.status || 'all'}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 relative">
          <span className="absolute top-2 right-2 text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
            GET /projects/{project.id}/sources/stats
          </span>
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

      {/* Upload Area */}
      {filteredSources.length === 0 && !loading && (
        <div 
          {...getRootProps()}
          className={cn(
            "text-center py-12 border-2 border-dashed rounded-lg transition-colors mb-6",
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
      )}

      {/* Sources Grid */}
      {filteredSources.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              GET /projects/{project.id}/sources
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((source) => {
            const TypeIcon = typeIcons[source.type] || File;
            
            return (
              <Card key={source.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <TypeIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {source.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {source.metadata?.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    
                    <div className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                      statusColors[source.status]
                    )}>
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
                      onClick={() => console.log('View source', source.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => console.log('Edit source', source.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSource(project.id, source.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && sources.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
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
      )}
    </div>
  );
};