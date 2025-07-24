'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  Clock,
  AlertCircle,
  Database,
  Settings,
  MoreHorizontal,
  Download,
  Upload,
  BookOpen,
  Tag,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTimestamp, formatFileSize } from '@/lib/utils';
import type { Agent } from '@/types';

interface Page {
  id: string;
  title: string;
  url?: string;
  content_type: 'webpage' | 'document' | 'text' | 'api';
  status: 'active' | 'inactive' | 'processing' | 'error';
  indexed_at?: string;
  last_updated: string;
  word_count?: number;
  tags?: string[];
  metadata?: {
    description?: string;
    author?: string;
    domain?: string;
    language?: string;
  };
  error_message?: string;
}

interface PagesSettingsProps {
  project: Agent;
}

export const PagesSettings: React.FC<PagesSettingsProps> = ({ project }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    tags: [] as string[]
  });

  // Mock data for demonstration
  const mockPages: Page[] = [
    {
      id: '1',
      title: 'Company About Page',
      url: 'https://example.com/about',
      content_type: 'webpage',
      status: 'active',
      indexed_at: '2024-01-15T10:30:00Z',
      last_updated: '2024-01-15T10:30:00Z',
      word_count: 1250,
      tags: ['company', 'about', 'mission'],
      metadata: {
        description: 'Information about our company mission and values',
        domain: 'example.com',
        language: 'en'
      }
    },
    {
      id: '2',
      title: 'Product Documentation',
      content_type: 'document',
      status: 'active',
      indexed_at: '2024-01-14T15:45:00Z',
      last_updated: '2024-01-14T15:45:00Z',
      word_count: 3500,
      tags: ['documentation', 'product', 'guide'],
      metadata: {
        description: 'Comprehensive product documentation and user guide',
        author: 'Documentation Team',
        language: 'en'
      }
    },
    {
      id: '3',
      title: 'API Reference',
      url: 'https://api.example.com/docs',
      content_type: 'api',
      status: 'processing',
      last_updated: '2024-01-16T09:15:00Z',
      tags: ['api', 'reference', 'technical'],
      metadata: {
        description: 'API endpoints and integration guide',
        domain: 'api.example.com',
        language: 'en'
      }
    },
    {
      id: '4',
      title: 'FAQ Section',
      url: 'https://example.com/faq',
      content_type: 'webpage',
      status: 'error',
      last_updated: '2024-01-13T14:20:00Z',
      word_count: 800,
      tags: ['faq', 'support', 'help'],
      error_message: 'Failed to access URL: 404 Not Found',
      metadata: {
        description: 'Frequently asked questions and answers',
        domain: 'example.com',
        language: 'en'
      }
    }
  ];

  useEffect(() => {
    loadPages();
  }, [project.id]);

  const loadPages = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPages(mockPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPages();
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      // Mock API call
      setPages(prev => prev.filter(p => p.id !== pageId));
      toast.success('Page deleted successfully');
    } catch (err) {
      toast.error('Failed to delete page');
    }
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.url || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filter.status === 'all' || page.status === filter.status;
    const matchesType = filter.type === 'all' || page.content_type === filter.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    processing: 'text-blue-600 bg-blue-100',
    error: 'text-red-600 bg-red-100',
  };

  const typeIcons = {
    webpage: Globe,
    document: FileText,
    text: BookOpen,
    api: Database,
  };

  // Get all unique tags for filter
  const allTags = Array.from(new Set(pages.flatMap(page => page.tags || [])));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Pages</h2>
          <p className="text-gray-600 mt-1">
            Manage indexed content and metadata for {project.project_name}
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
          
          <div className="flex items-center gap-2">
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </Button>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              POST /projects/{project.id}/pages
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading pages</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          {error.includes('403') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                <strong>Premium Feature:</strong> Advanced page management may require a premium subscription.
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
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Types</option>
            <option value="webpage">Web Pages</option>
            <option value="document">Documents</option>
            <option value="text">Text Content</option>
            <option value="api">API Sources</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 relative">
          <span className="absolute top-2 right-2 text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
            GET /projects/{project.id}/pages/stats
          </span>
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter(p => p.status === 'active').length}
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
                {pages.filter(p => p.status === 'processing').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter(p => p.status === 'error').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pages List */}
      <div className="flex justify-end mb-4">
        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
          GET /projects/{project.id}/pages
        </span>
      </div>
      {loading && pages.length === 0 ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No pages found' : 'No pages yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Add web pages, documents, or other content to get started'
            }
          </p>
          {!searchQuery && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Page
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((page) => {
            const TypeIcon = typeIcons[page.content_type] || FileText;
            
            return (
              <Card key={page.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-brand-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                          {page.title}
                        </h3>
                        
                        {page.url && (
                          <a 
                            href={page.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 truncate block mb-1"
                          >
                            {page.url}
                          </a>
                        )}
                        
                        {page.metadata?.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {page.metadata.description}
                          </p>
                        )}
                      </div>
                      
                      <div className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-4',
                        statusColors[page.status]
                      )}>
                        {page.status}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>Updated {formatTimestamp(page.last_updated)}</span>
                      {page.indexed_at && (
                        <span>Indexed {formatTimestamp(page.indexed_at)}</span>
                      )}
                      {page.word_count && (
                        <span>{page.word_count.toLocaleString()} words</span>
                      )}
                      {page.metadata?.language && (
                        <span>Language: {page.metadata.language.toUpperCase()}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {page.tags && page.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {page.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {page.status === 'error' && page.error_message && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Error:</span>
                        </div>
                        <p className="mt-1">{page.error_message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-index
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};