'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Settings, 
  Search, 
  Plus, 
  ChevronRight,
  Palette,
  MessageCircle,
  Brain,
  Plug,
  BarChart3,
  Info,
  RefreshCw,
  Database,
  FileText,
  Users,
  Shield,
  Link,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

import { useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn, formatTimestamp } from '@/lib/utils';
import type { Agent } from '@/types';

// Project settings components
import { GeneralSettings } from '@/components/projects/GeneralSettings';
import { AppearanceSettings } from '@/components/projects/AppearanceSettings';
import { BehaviorSettings } from '@/components/projects/BehaviorSettings';
import { SourcesSettings } from '@/components/projects/SourcesSettings';
import { PagesSettings } from '@/components/projects/PagesSettings';
import { ConversationsSettings } from '@/components/projects/ConversationsSettings';
import { AnalyticsSettings } from '@/components/projects/AnalyticsSettings';
import { SecuritySettings } from '@/components/projects/SecuritySettings';
import { IntegrationsSettings } from '@/components/projects/IntegrationsSettings';
import { MonetizationSettings } from '@/components/projects/MonetizationSettings';

type SettingsTab = 'general' | 'appearance' | 'behavior' | 'sources' | 'pages' | 'conversations' | 'analytics' | 'security' | 'integrations' | 'monetization';

const settingsTabs = [
  { id: 'general' as SettingsTab, label: 'General', icon: Info, description: 'Basic project settings and prompts' },
  { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette, description: 'Branding, colors, and UI customization' },
  { id: 'behavior' as SettingsTab, label: 'Behavior', icon: Brain, description: 'AI personality, model, and response settings' },
  { id: 'sources' as SettingsTab, label: 'Data Sources', icon: Database, description: 'Upload files, add websites, manage data' },
  { id: 'pages' as SettingsTab, label: 'Content Pages', icon: FileText, description: 'Manage indexed content and metadata' },
  { id: 'conversations' as SettingsTab, label: 'Conversations', icon: Users, description: 'Chat history, sharing, and management' },
  { id: 'analytics' as SettingsTab, label: 'Analytics', icon: BarChart3, description: 'Usage stats, reports, and insights' },
  { id: 'security' as SettingsTab, label: 'Security', icon: Shield, description: 'Access control, anti-hallucination, visibility' },
  { id: 'integrations' as SettingsTab, label: 'Integrations', icon: Link, description: 'API access, plugins, and connections' },
  { id: 'monetization' as SettingsTab, label: 'Monetization', icon: DollarSign, description: 'Licensing, selling, and premium features' },
];

interface ProjectCardProps {
  project: Agent;
  isSelected: boolean;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left border rounded-lg transition-all hover:shadow-sm',
        isSelected 
          ? 'border-brand-500 bg-brand-50 shadow-sm' 
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {project.project_name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            ID: {project.id} • Status: {project.is_chat_active ? 'Active' : 'Inactive'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Updated {formatTimestamp(project.updated_at)}
          </p>
        </div>
        
        {isSelected && (
          <ChevronRight className="w-4 h-4 text-brand-500 flex-shrink-0" />
        )}
      </div>
    </button>
  );
};

interface SettingsTabProps {
  tab: typeof settingsTabs[0];
  isActive: boolean;
  onClick: () => void;
}

const SettingsTabButton: React.FC<SettingsTabProps> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left border-b border-gray-200 transition-colors hover:bg-gray-50',
        isActive && 'bg-brand-50 border-r-2 border-r-brand-500'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn(
          'w-5 h-5', 
          isActive ? 'text-brand-600' : 'text-gray-400'
        )} />
        <div>
          <h4 className={cn(
            'font-medium',
            isActive ? 'text-brand-900' : 'text-gray-900'
          )}>
            {tab.label}
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {tab.description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default function ProjectsPage() {
  const { agents, loading, fetchAgents } = useAgentStore();
  const [selectedProject, setSelectedProject] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  // Set first project as selected when projects load
  useEffect(() => {
    if (agents.length > 0 && !selectedProject) {
      setSelectedProject(agents[0]);
    }
  }, [agents, selectedProject]);

  // Filter projects based on search
  const filteredProjects = agents.filter(project =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    fetchAgents();
  };

  const renderSettingsContent = () => {
    if (!selectedProject) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Project Selected
            </h3>
            <p className="text-gray-600">
              Select a project from the sidebar to view and edit its settings
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return <GeneralSettings project={selectedProject} />;
      case 'appearance':
        return <AppearanceSettings project={selectedProject} />;
      case 'behavior':
        return <BehaviorSettings project={selectedProject} />;
      case 'sources':
        return <SourcesSettings project={selectedProject} />;
      case 'pages':
        return <PagesSettings project={selectedProject} />;
      case 'conversations':
        return <ConversationsSettings project={selectedProject} />;
      case 'analytics':
        return <AnalyticsSettings project={selectedProject} />;
      case 'security':
        return <SecuritySettings project={selectedProject} />;
      case 'integrations':
        return <IntegrationsSettings project={selectedProject} />;
      case 'monetization':
        return <MonetizationSettings project={selectedProject} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Projects</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && agents.length === 0 ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {searchQuery ? 'No projects found' : 'No projects available'}
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onClick={() => setSelectedProject(project)}
                />
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Settings Tabs */}
          {selectedProject && (
            <div className="w-64 bg-white border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 truncate">
                  {selectedProject.project_name}
                </h2>
                <p className="text-sm text-gray-600">Project Settings</p>
              </div>
              
              <div className="overflow-y-auto">
                {settingsTabs.map((tab) => (
                  <SettingsTabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Settings Content */}
          <div className="flex-1 bg-white overflow-y-auto">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}