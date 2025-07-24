'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

import { usePageStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn, formatTimestamp } from '@/lib/utils';
import type { Page } from '@/store/pages';

// We'll create these components
import { PageEditor } from '@/components/pages/PageEditor';
import { PageMetadataEditor } from '@/components/pages/PageMetadataEditor';
import { PageFilters } from '@/components/pages/PageFilters';

const statusIcons = {
  active: CheckCircle,
  draft: Clock,
  archived: Archive,
};

const statusColors = {
  active: 'text-green-600 bg-green-100',
  draft: 'text-yellow-600 bg-yellow-100',
  archived: 'text-gray-600 bg-gray-100',
};

interface PageCardProps {
  page: Page;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
  onView: (page: Page) => void;
  onMetadata: (page: Page) => void;
}

const PageCard: React.FC<PageCardProps> = ({
  page,
  onEdit,
  onDelete,
  onView,
  onMetadata,
}) => {
  const StatusIcon = statusIcons[page.status];
  
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {page.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {page.metadata?.description || 'No description'}
            </p>
          </div>
          
          <div className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            statusColors[page.status]
          )}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {page.status}
          </div>
        </div>

        {/* Content Preview */}
        <div className="text-sm text-gray-700">
          {page.content.substring(0, 200)}...
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Updated {formatTimestamp(page.updated_at)}</span>
          {page.word_count && (
            <span>{page.word_count} words</span>
          )}
          {page.metadata?.keywords && (
            <span>{page.metadata.keywords.length} keywords</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(page)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(page)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMetadata(page)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Metadata
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(page)}
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

export default function PagesPage() {
  const router = useRouter();
  const { currentAgent } = useAgentStore();
  const { 
    pages, 
    loading, 
    error, 
    searchQuery,
    filter,
    fetchPages,
    deletePage,
    reindexPages,
    setSearchQuery,
    setFilter,
    selectPage
  } = usePageStore();

  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isReindexing, setIsReindexing] = useState(false);

  useEffect(() => {
    if (!currentAgent) {
      toast.error('Please select an agent first');
      router.push('/');
      return;
    }

    fetchPages(currentAgent.id);
  }, [currentAgent]);

  // Filter and search pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filter.status === 'all' || page.status === filter.status;
    
    return matchesSearch && matchesStatus;
  });

  // Sort pages
  const sortedPages = [...filteredPages].sort((a, b) => {
    const sortKey = filter.sortBy || 'updated_at';
    const sortOrder = filter.sortOrder || 'desc';
    
    let comparison = 0;
    if (sortKey === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison = new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowEditor(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    selectPage(page);
    setShowEditor(true);
  };

  const handleViewPage = (page: Page) => {
    selectPage(page);
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleMetadataPage = (page: Page) => {
    setEditingPage(page);
    selectPage(page);
    setShowMetadataEditor(true);
  };

  const handleDeletePage = async (page: Page) => {
    if (!currentAgent) return;
    
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) {
      return;
    }

    try {
      await deletePage(currentAgent.id, page.id);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleBulkDelete = async () => {
    if (!currentAgent || selectedPages.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedPages.length} pages?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedPages.map(pageId => deletePage(currentAgent.id, pageId))
      );
      setSelectedPages([]);
    } catch (error) {
      // Errors already handled in store
    }
  };

  const handleReindex = async () => {
    if (!currentAgent) return;
    
    setIsReindexing(true);
    try {
      await reindexPages(currentAgent.id);
    } catch (error) {
      // Error already handled in store
    } finally {
      setIsReindexing(false);
    }
  };

  const handleRefresh = () => {
    if (currentAgent) {
      fetchPages(currentAgent.id);
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
                Pages & Documents
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your knowledge base content for {currentAgent.project_name}
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
                onClick={handleReindex}
                disabled={isReindexing}
                size="sm"
              >
                <Upload className={cn('w-4 h-4 mr-2', isReindexing && 'animate-spin')} />
                {isReindexing ? 'Reindexing...' : 'Reindex'}
              </Button>
              
              <Button
                variant="default"
                onClick={handleCreatePage}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            
            <PageFilters
              filter={filter}
              onChange={setFilter}
            />
          </div>

          {/* Bulk Actions */}
          {selectedPages.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedPages.length} pages selected
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
                onClick={() => setSelectedPages([])}
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
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pages.filter(p => p.status === 'draft').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Archive className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pages.filter(p => p.status === 'archived').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pages Grid */}
        {loading && pages.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
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
        ) : sortedPages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No pages found' : 'No pages yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Create your first page to get started'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreatePage}>
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onEdit={handleEditPage}
                onDelete={handleDeletePage}
                onView={handleViewPage}
                onMetadata={handleMetadataPage}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showEditor && (
        <PageEditor
          page={editingPage}
          onClose={() => {
            setShowEditor(false);
            setEditingPage(null);
          }}
          onSave={() => {
            setShowEditor(false);
            setEditingPage(null);
            if (currentAgent) {
              fetchPages(currentAgent.id);
            }
          }}
        />
      )}
      
      {showMetadataEditor && editingPage && (
        <PageMetadataEditor
          page={editingPage}
          onClose={() => {
            setShowMetadataEditor(false);
            setEditingPage(null);
          }}
          onSave={() => {
            setShowMetadataEditor(false);
            setEditingPage(null);
            if (currentAgent) {
              fetchPages(currentAgent.id);
            }
          }}
        />
      )}
    </PageLayout>
  );
}