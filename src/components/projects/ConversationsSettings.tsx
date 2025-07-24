'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageCircle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  Eye,
  Users,
  Clock,
  AlertCircle,
  Calendar,
  BarChart3,
  ExternalLink,
  Archive,
  Star,
  MessageSquare,
  User,
  Globe,
  Lock,
  Settings,
  Plus,
  FileDown,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTimestamp } from '@/lib/utils';
import type { Agent } from '@/types';

interface Conversation {
  id: string;
  title?: string;
  messages_count: number;
  participant_count: number;
  created_at: string;
  last_message_at: string;
  status: 'active' | 'archived' | 'shared' | 'deleted';
  sharing: {
    is_public: boolean;
    share_url?: string;
    view_count?: number;
  };
  metadata: {
    user_id?: string;
    user_email?: string;
    session_duration?: number;
    rating?: number;
    tags?: string[];
    source?: 'web' | 'api' | 'embed' | 'mobile';
  };
}

interface ConversationStats {
  total_conversations: number;
  active_conversations: number;
  total_messages: number;
  average_session_duration: number;
  user_satisfaction: number;
  popular_topics: string[];
}

interface ConversationsSettingsProps {
  project: Agent;
}

export const ConversationsSettings: React.FC<ConversationsSettingsProps> = ({ project }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    source: 'all',
    dateRange: '7d'
  });

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: '1',
      title: 'Product Information Inquiry',
      messages_count: 15,
      participant_count: 1,
      created_at: '2024-01-16T09:30:00Z',
      last_message_at: '2024-01-16T09:45:00Z',
      status: 'active',
      sharing: {
        is_public: false
      },
      metadata: {
        user_email: 'user@example.com',
        session_duration: 900,
        rating: 5,
        tags: ['product', 'pricing', 'support'],
        source: 'web'
      }
    },
    {
      id: '2',
      title: 'Technical Support Request',
      messages_count: 32,
      participant_count: 1,
      created_at: '2024-01-15T14:20:00Z',
      last_message_at: '2024-01-15T15:10:00Z',
      status: 'shared',
      sharing: {
        is_public: true,
        share_url: 'https://chat.example.com/shared/abc123',
        view_count: 12
      },
      metadata: {
        user_email: 'tech.user@company.com',
        session_duration: 3000,
        rating: 4,
        tags: ['technical', 'api', 'integration'],
        source: 'api'
      }
    },
    {
      id: '3',
      title: 'General Questions',
      messages_count: 8,
      participant_count: 1,
      created_at: '2024-01-14T11:15:00Z',
      last_message_at: '2024-01-14T11:30:00Z',
      status: 'archived',
      sharing: {
        is_public: false
      },
      metadata: {
        session_duration: 600,
        rating: 3,
        tags: ['general', 'faq'],
        source: 'embed'
      }
    }
  ];

  const mockStats: ConversationStats = {
    total_conversations: 156,
    active_conversations: 23,
    total_messages: 2847,
    average_session_duration: 420,
    user_satisfaction: 4.2,
    popular_topics: ['product', 'pricing', 'support', 'technical', 'integration']
  };

  useEffect(() => {
    loadConversations();
    loadStats();
  }, [project.id, filter]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversations(mockConversations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleRefresh = () => {
    loadConversations();
    loadStats();
  };

  const handleShareConversation = async (conversationId: string) => {
    try {
      // Mock API call
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              status: 'shared' as const,
              sharing: { 
                ...conv.sharing, 
                is_public: true, 
                share_url: `https://chat.example.com/shared/${conversationId}`
              }
            }
          : conv
      ));
      toast.success('Conversation shared successfully');
    } catch (err) {
      toast.error('Failed to share conversation');
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, status: 'archived' as const } : conv
      ));
      toast.success('Conversation archived');
    } catch (err) {
      toast.error('Failed to archive conversation');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      toast.success('Conversation deleted');
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleExportConversations = () => {
    toast.success('Export started - you will receive an email when ready');
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      (conv.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.metadata.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.metadata.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filter.status === 'all' || conv.status === filter.status;
    const matchesSource = filter.source === 'all' || conv.metadata.source === filter.source;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    archived: 'text-gray-600 bg-gray-100',
    shared: 'text-blue-600 bg-blue-100',
    deleted: 'text-red-600 bg-red-100',
  };

  const sourceIcons = {
    web: Globe,
    api: Settings,
    embed: ExternalLink,
    mobile: MessageSquare,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
          <p className="text-gray-600 mt-1">
            Manage chat history, sharing, and analytics for {project.project_name}
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
            <Button variant="outline" onClick={handleExportConversations}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              POST /projects/{project.id}/conversations/export
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading conversations</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          {error.includes('403') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                <strong>Premium Feature:</strong> Advanced conversation management may require a premium subscription.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              GET /projects/{project.id}/conversations/stats
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_conversations}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_conversations}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_messages.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.average_session_duration / 60)}m</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.user_satisfaction.toFixed(1)}</p>
              </div>
            </div>
          </Card>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="shared">Shared</option>
          </select>
          
          <select
            value={filter.source}
            onChange={(e) => setFilter({ ...filter, source: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Sources</option>
            <option value="web">Web</option>
            <option value="api">API</option>
            <option value="embed">Embed</option>
            <option value="mobile">Mobile</option>
          </select>
          
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex justify-end mb-4">
        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
          GET /projects/{project.id}/conversations
        </span>
      </div>
      {loading && conversations.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Conversations will appear here once users start chatting with your agent'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => {
            const SourceIcon = sourceIcons[conversation.metadata.source || 'web'];
            
            return (
              <Card key={conversation.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Source Icon */}
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <SourceIcon className="w-5 h-5 text-brand-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                          {conversation.title || `Conversation ${conversation.id}`}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>{conversation.messages_count} messages</span>
                          <span>{conversation.participant_count} participant(s)</span>
                          {conversation.metadata.session_duration && (
                            <span>{Math.round(conversation.metadata.session_duration / 60)} min duration</span>
                          )}
                          {conversation.metadata.user_email && (
                            <span>{conversation.metadata.user_email}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {conversation.metadata.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{conversation.metadata.rating}</span>
                          </div>
                        )}
                        
                        <div className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          statusColors[conversation.status]
                        )}>
                          {conversation.status}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>Created {formatTimestamp(conversation.created_at)}</span>
                      <span>Last message {formatTimestamp(conversation.last_message_at)}</span>
                      <span>Source: {conversation.metadata.source}</span>
                    </div>

                    {/* Tags */}
                    {conversation.metadata.tags && conversation.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {conversation.metadata.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sharing Info */}
                    {conversation.sharing.is_public && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 mb-3">
                        <Share2 className="w-4 h-4" />
                        <span>Publicly shared</span>
                        {conversation.sharing.view_count && (
                          <span>• {conversation.sharing.view_count} views</span>
                        )}
                        {conversation.sharing.share_url && (
                          <a 
                            href={conversation.sharing.share_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 ml-auto"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleShareConversation(conversation.id)}
                        disabled={conversation.sharing.is_public}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {conversation.sharing.is_public ? 'Shared' : 'Share'}
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleArchiveConversation(conversation.id)}
                        disabled={conversation.status === 'archived'}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteConversation(conversation.id)}
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

      {/* Conversation Settings */}
      <Card className="p-6 mt-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Conversation Settings</h3>
          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
            POST /projects/{project.id}/conversations/settings
          </span>
        </div>
        
        <div className="space-y-6">
          {/* Data Retention */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
            <p className="text-sm text-gray-600 mb-3">
              Configure how long conversation data is stored
            </p>
            <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
              <option value="forever">Forever</option>
            </select>
          </div>

          {/* Auto-sharing */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sharing Settings</h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow users to share conversations</span>
                  <p className="text-xs text-gray-600">Users can create public links to their conversations</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Require approval for sharing</span>
                  <p className="text-xs text-gray-600">Review shared conversations before they become public</p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Options</h4>
            <p className="text-sm text-gray-600 mb-3">
              Choose default format for conversation exports
            </p>
            <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="txt">Plain Text</option>
            </select>
          </div>

          <div className="pt-4 border-t">
            <Button>Save Settings</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};