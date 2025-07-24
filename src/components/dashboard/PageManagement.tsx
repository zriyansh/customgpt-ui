'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Globe,
  Lock,
  File,
  Image,
  FileVideo,
  FileAudio,
  Folder
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Document {
  id: number;
  title: string;
  type: 'webpage' | 'pdf' | 'docx' | 'txt' | 'image' | 'video' | 'audio';
  url?: string;
  file_path?: string;
  status: 'indexed' | 'processing' | 'failed' | 'pending';
  size: number;
  word_count?: number;
  indexed_at: string;
  updated_at: string;
  source: 'manual' | 'sitemap' | 'crawl' | 'api';
  agent_ids: number[];
  tags: string[];
  is_public: boolean;
}

interface DocumentCardProps {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onView: (doc: Document) => void;
  onReindex: (doc: Document) => void;
  onTogglePublic: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onView,
  onReindex,
  onTogglePublic
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeIcon = () => {
    switch (document.type) {
      case 'webpage':
        return <Globe className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'docx':
        return <File className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <FileVideo className="h-5 w-5" />;
      case 'audio':
        return <FileAudio className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusConfig = () => {
    switch (document.status) {
      case 'indexed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'processing':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Loader };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'pending':
        return { color: 'bg-gray-100 text-gray-800', icon: Clock };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {getTypeIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{document.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                statusConfig.color
              )}>
                <StatusIcon className="h-3 w-3" />
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </span>
              {document.is_public ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {document.type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 top-8 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div className="py-1">
                  <button
                    onClick={() => { onView(document); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    View Content
                  </button>
                  <button
                    onClick={() => { onEdit(document); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onReindex(document); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reindex
                  </button>
                  <button
                    onClick={() => { onTogglePublic(document); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {document.is_public ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    {document.is_public ? 'Make Private' : 'Make Public'}
                  </button>
                  {document.url && (
                    <button
                      onClick={() => { window.open(document.url, '_blank'); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Original
                    </button>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => { onDelete(document); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Document Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Size</span>
          <span className="font-medium text-gray-900">{formatSize(document.size)}</span>
        </div>
        {document.word_count && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Words</span>
            <span className="font-medium text-gray-900">{document.word_count.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Source</span>
          <span className="font-medium text-gray-900 capitalize">{document.source}</span>
        </div>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{document.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          Indexed {document.indexed_at}
        </div>
        <div className="text-xs text-gray-500">
          {document.agent_ids.length} agent{document.agent_ids.length !== 1 ? 's' : ''}
        </div>
      </div>
    </motion.div>
  );
};

export const PageManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'indexed' | 'processing' | 'failed' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'webpage' | 'pdf' | 'docx' | 'txt' | 'image'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'updated' | 'size' | 'status'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from API endpoints:
  // GET /api/v1/projects/{projectId}/pages
  // POST /api/v1/projects/{projectId}/pages
  // PUT /api/v1/projects/{projectId}/pages/{pageId}
  // DELETE /api/v1/projects/{projectId}/pages/{pageId}

  const [documents] = useState<Document[]>([
    {
      id: 1,
      title: 'Getting Started Guide',
      type: 'webpage',
      url: 'https://example.com/getting-started',
      status: 'indexed',
      size: 15420,
      word_count: 2340,
      indexed_at: '2 hours ago',
      updated_at: '2024-01-15',
      source: 'manual',
      agent_ids: [1, 2],
      tags: ['guide', 'onboarding', 'basics'],
      is_public: true,
    },
    {
      id: 2,
      title: 'Product Documentation.pdf',
      type: 'pdf',
      file_path: '/uploads/product-docs.pdf',
      status: 'processing',
      size: 2547890,
      word_count: 12450,
      indexed_at: '1 day ago',
      updated_at: '2024-01-14',
      source: 'manual',
      agent_ids: [1],
      tags: ['documentation', 'product', 'technical'],
      is_public: false,
    },
    {
      id: 3,
      title: 'FAQ Page',
      type: 'webpage',
      url: 'https://example.com/faq',
      status: 'indexed',
      size: 8920,
      word_count: 1890,
      indexed_at: '3 hours ago',
      updated_at: '2024-01-15',
      source: 'sitemap',
      agent_ids: [1, 2, 3],
      tags: ['faq', 'support', 'common'],
      is_public: true,
    },
    {
      id: 4,
      title: 'User Manual Draft',
      type: 'docx',
      file_path: '/uploads/user-manual.docx',
      status: 'failed',
      size: 156780,
      word_count: 5670,
      indexed_at: '1 week ago',
      updated_at: '2024-01-08',
      source: 'manual',
      agent_ids: [2],
      tags: ['manual', 'draft', 'users'],
      is_public: false,
    },
  ]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpload = () => {
    console.log('Upload documents');
  };

  const handleBulkImport = () => {
    console.log('Bulk import from sitemap/URLs');
  };

  const handleEditDocument = (doc: Document) => {
    console.log('Edit document:', doc.id);
  };

  const handleDeleteDocument = (doc: Document) => {
    console.log('Delete document:', doc.id);
  };

  const handleViewDocument = (doc: Document) => {
    console.log('View document:', doc.id);
  };

  const handleReindexDocument = (doc: Document) => {
    console.log('Reindex document:', doc.id);
  };

  const handleTogglePublic = (doc: Document) => {
    console.log('Toggle public status:', doc.id);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const stats = {
    total: documents.length,
    indexed: documents.filter(d => d.status === 'indexed').length,
    processing: documents.filter(d => d.status === 'processing').length,
    failed: documents.filter(d => d.status === 'failed').length,
    totalSize: documents.reduce((sum, d) => sum + d.size, 0),
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages & Documents</h1>
          <p className="text-gray-600 mt-1">Manage your knowledge base content</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBulkImport}>
            <Download className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.indexed}</p>
              <p className="text-sm text-gray-600">Indexed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Folder className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatSize(stats.totalSize)}</p>
              <p className="text-sm text-gray-600">Total Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-80"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="indexed">Indexed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="webpage">Web Pages</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word Documents</option>
            <option value="txt">Text Files</option>
            <option value="image">Images</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="updated">Last Updated</option>
            <option value="title">Title</option>
            <option value="size">Size</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
            <Button onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          <AnimatePresence>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onEdit={handleEditDocument}
                onDelete={handleDeleteDocument}
                onView={handleViewDocument}
                onReindex={handleReindexDocument}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};