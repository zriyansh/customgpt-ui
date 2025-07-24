'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Bot,
  Users,
  MessageSquare,
  Calendar,
  Globe,
  Lock,
  Settings,
  BarChart3,
  Copy,
  Edit3,
  Trash2,
  ExternalLink,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Agent {
  id: number;
  project_name: string;
  status: 'active' | 'inactive' | 'processing';
  is_shared: boolean;
  conversations: number;
  queries: number;
  last_activity: string;
  created_at: string;
  response_time: string;
  accuracy: number;
  type: 'SITEMAP' | 'URL' | 'FILE';
  pages: number;
}

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onToggleStatus: (agent: Agent) => void;
  onViewAnalytics: (agent: Agent) => void;
  onReplicate: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewAnalytics,
  onReplicate
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: Pause },
    processing: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  };

  const StatusIcon = statusConfig[agent.status].icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="h-5 w-5 text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{agent.project_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                statusConfig[agent.status].color
              )}>
                <StatusIcon className="h-3 w-3" />
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
              {agent.is_shared && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {agent.type}
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
                    onClick={() => { onEdit(agent); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Agent
                  </button>
                  <button
                    onClick={() => { onViewAnalytics(agent); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </button>
                  <button
                    onClick={() => { onReplicate(agent); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    Replicate
                  </button>
                  <button
                    onClick={() => { onToggleStatus(agent); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => { onDelete(agent); setShowMenu(false); }}
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

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">{agent.conversations.toLocaleString()}</div>
          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Conversations
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">{agent.queries.toLocaleString()}</div>
          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Queries
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Response Time</span>
          <span className="text-sm font-medium text-gray-900">{agent.response_time}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Accuracy</span>
          <span className="text-sm font-medium text-gray-900">{agent.accuracy}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pages</span>
          <span className="text-sm font-medium text-gray-900">{agent.pages.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          Last active {agent.last_activity}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(agent)}
          className="h-7 px-2 text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          Configure
        </Button>
      </div>
    </motion.div>
  );
};

export const AgentManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'processing'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'activity' | 'conversations'>('activity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - in real app, this would come from API
  const [agents] = useState<Agent[]>([
    {
      id: 1,
      project_name: 'Customer Support Bot',
      status: 'active',
      is_shared: true,
      conversations: 1234,
      queries: 5678,
      last_activity: '2 hours ago',
      created_at: '2024-01-15',
      response_time: '1.2s',
      accuracy: 94,
      type: 'SITEMAP',
      pages: 156,
    },
    {
      id: 2,
      project_name: 'Sales Assistant',
      status: 'active',
      is_shared: false,
      conversations: 567,
      queries: 2345,
      last_activity: '5 minutes ago',
      created_at: '2024-02-01',
      response_time: '0.8s',
      accuracy: 97,
      type: 'FILE',
      pages: 89,
    },
    {
      id: 3,
      project_name: 'Product Documentation',
      status: 'processing',
      is_shared: true,
      conversations: 234,
      queries: 890,
      last_activity: '1 day ago',
      created_at: '2024-02-10',
      response_time: '1.5s',
      accuracy: 91,
      type: 'URL',
      pages: 234,
    },
    {
      id: 4,
      project_name: 'HR Helpdesk',
      status: 'inactive',
      is_shared: false,
      conversations: 89,
      queries: 123,
      last_activity: '1 week ago',
      created_at: '2024-01-20',
      response_time: '2.1s',
      accuracy: 88,
      type: 'SITEMAP',
      pages: 67,
    },
  ]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.project_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAgent = () => {
    console.log('Create new agent');
  };

  const handleEditAgent = (agent: Agent) => {
    console.log('Edit agent:', agent.id);
  };

  const handleDeleteAgent = (agent: Agent) => {
    console.log('Delete agent:', agent.id);
  };

  const handleToggleStatus = (agent: Agent) => {
    console.log('Toggle status for agent:', agent.id);
  };

  const handleViewAnalytics = (agent: Agent) => {
    console.log('View analytics for agent:', agent.id);
  };

  const handleReplicate = (agent: Agent) => {
    console.log('Replicate agent:', agent.id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your AI agents</p>
        </div>
        <Button onClick={handleCreateAgent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="processing">Processing</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="activity">Last Activity</option>
            <option value="name">Name</option>
            <option value="created">Created Date</option>
            <option value="conversations">Conversations</option>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              <p className="text-sm text-gray-600">Total Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{agents.filter(a => a.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{agents.reduce((sum, a) => sum + a.conversations, 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Conversations</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{agents.reduce((sum, a) => sum + a.queries, 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Queries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Grid/List */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first agent to get started'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={handleEditAgent}
              onDelete={handleDeleteAgent}
              onToggleStatus={handleToggleStatus}
              onViewAnalytics={handleViewAnalytics}
              onReplicate={handleReplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
};