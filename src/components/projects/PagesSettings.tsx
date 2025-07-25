'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Globe,
  Clock,
  AlertCircle,
  Database,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  HardDrive,
  File,
  Hash,
  RotateCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTimestamp, formatFileSize } from '@/lib/utils';
import { getClient, isClientInitialized } from '@/lib/api/client';
import type { Agent } from '@/types';
import type { Page, PagesQueryParams } from '@/types/pages.types';
import { PageMetadataModal } from '@/components/pages/PageMetadataModal';

interface PagesSettingsProps {
  project: Agent;
}

export const PagesSettings: React.FC<PagesSettingsProps> = ({ project }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);
  const [reindexingPageId, setReindexingPageId] = useState<number | null>(null);
  const [metadataPageId, setMetadataPageId] = useState<number | null>(null);
  
  const [queryParams, setQueryParams] = useState<PagesQueryParams>({
    page: 1,
    limit: 20,
    order: 'desc',
    crawl_status: 'all',
    index_status: 'all'
  });

  const [paginationInfo, setPaginationInfo] = useState({
    current_page: 1,
    total: 0,
    per_page: 20,
    last_page: 1
  });

  useEffect(() => {
    loadPages();
  }, [project.id, queryParams]);

  const loadPages = async () => {
    if (!isClientInitialized()) {
      setError('API client not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const response = await client.getPages(project.id, queryParams);
      
      setPages(response.data.pages.data);
      setPaginationInfo({
        current_page: response.data.pages.current_page,
        total: response.data.pages.total,
        per_page: response.data.pages.per_page,
        last_page: response.data.pages.last_page
      });
    } catch (err: any) {
      console.error('Failed to load pages:', err);
      
      if (err.status === 400) {
        setError('Invalid request. Please check the project ID.');
      } else if (err.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.status === 404) {
        setError('Project not found.');
      } else if (err.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load pages.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPages();
  };

  const handleDeletePage = async (pageId: number) => {
    if (!isClientInitialized() || deletingPageId) return;

    try {
      setDeletingPageId(pageId);
      const client = getClient();
      await client.deletePage(project.id, pageId);
      
      // Remove from local state
      setPages(prev => prev.filter(p => p.id !== pageId));
      toast.success('Page deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete page:', err);
      
      if (err.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (err.status === 404) {
        toast.error('Page not found.');
      } else {
        toast.error('Failed to delete page.');
      }
    } finally {
      setDeletingPageId(null);
    }
  };

  const handleReindexPage = async (pageId: number) => {
    if (!isClientInitialized() || reindexingPageId) return;

    try {
      setReindexingPageId(pageId);
      const client = getClient();
      await client.reindexPage(project.id, pageId);
      
      // Update local state to show queued status
      setPages(prev => prev.map(p => 
        p.id === pageId 
          ? { ...p, crawl_status: 'queued', index_status: 'queued' }
          : p
      ));
      
      toast.success('Page reindexing started');
    } catch (err: any) {
      console.error('Failed to reindex page:', err);
      
      if (err.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (err.status === 403) {
        toast.error('The page could not be reindexed.');
      } else {
        toast.error('Failed to reindex page.');
      }
    } finally {
      setReindexingPageId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof PagesQueryParams, value: any) => {
    setQueryParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Filter pages locally based on search query
  const filteredPages = pages.filter(page => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      page.page_url.toLowerCase().includes(query) ||
      (page.filename && page.filename.toLowerCase().includes(query))
    );
  });

  const crawlStatusColors = {
    queued: 'text-yellow-600 bg-yellow-100',
    crawling: 'text-blue-600 bg-blue-100',
    crawled: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
  };

  const indexStatusColors = {
    queued: 'text-yellow-600 bg-yellow-100',
    indexing: 'text-blue-600 bg-blue-100',
    indexed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Pages</h2>
          <p className="text-gray-600 mt-1">
            Manage indexed content for {project.project_name}
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
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by URL or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={queryParams.crawl_status}
            onChange={(e) => handleFilterChange('crawl_status', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Crawl Status</option>
            <option value="queued">Queued</option>
            <option value="crawling">Crawling</option>
            <option value="crawled">Crawled</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={queryParams.index_status}
            onChange={(e) => handleFilterChange('index_status', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Index Status</option>
            <option value="queued">Queued</option>
            <option value="indexing">Indexing</option>
            <option value="indexed">Indexed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={queryParams.order}
            onChange={(e) => handleFilterChange('order', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{paginationInfo.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Indexed</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter(p => p.index_status === 'indexed').length}
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
                {pages.filter(p => 
                  p.crawl_status === 'crawling' || p.index_status === 'indexing'
                ).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter(p => 
                  p.crawl_status === 'failed' || p.index_status === 'failed'
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pages List */}
      {loading && pages.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No pages found' : 'No pages indexed yet'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try adjusting your search criteria'
              : 'Add content sources to start indexing pages'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((page) => (
            <Card key={page.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* Page Icon */}
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {page.is_file ? (
                    <File className="w-5 h-5 text-brand-600" />
                  ) : (
                    <Globe className="w-5 h-5 text-brand-600" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Page #{page.id}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {page.filename || page.page_url}
                      </h3>
                      
                      {page.page_url && (
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {page.page_url}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Crawl:</span>
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        crawlStatusColors[page.crawl_status]
                      )}>
                        {page.crawl_status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Index:</span>
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        indexStatusColors[page.index_status]
                      )}>
                        {page.index_status}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Created: {formatTimestamp(page.created_at)}</span>
                    <span>Updated: {formatTimestamp(page.updated_at)}</span>
                    {page.filesize && (
                      <span>Size: {formatFileSize(page.filesize)}</span>
                    )}
                  </div>

                  {/* Additional Info */}
                  {page.s3_path && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <HardDrive className="w-3 h-3" />
                      <span>Storage: {page.s3_path}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setMetadataPageId(page.id)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Metadata
                    </Button>
                    
                    {page.is_refreshable && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleReindexPage(page.id)}
                        disabled={reindexingPageId === page.id}
                      >
                        {reindexingPageId === page.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCw className="w-4 h-4 mr-2" />
                        )}
                        Re-index
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeletePage(page.id)}
                      disabled={deletingPageId === page.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingPageId === page.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationInfo.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((paginationInfo.current_page - 1) * paginationInfo.per_page) + 1} to{' '}
            {Math.min(paginationInfo.current_page * paginationInfo.per_page, paginationInfo.total)} of{' '}
            {paginationInfo.total} pages
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationInfo.current_page - 1)}
              disabled={paginationInfo.current_page === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, paginationInfo.last_page) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === paginationInfo.current_page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {paginationInfo.last_page > 5 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationInfo.current_page + 1)}
              disabled={paginationInfo.current_page === paginationInfo.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Metadata Modal */}
      {metadataPageId !== null && (
        <PageMetadataModal
          projectId={project.id}
          pageId={metadataPageId}
          onClose={() => setMetadataPageId(null)}
          onUpdate={() => {
            // Optionally refresh pages after metadata update
            loadPages();
          }}
        />
      )}
    </div>
  );
};