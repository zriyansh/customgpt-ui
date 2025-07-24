'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  ChevronDown, 
  Settings, 
  RefreshCw,
  AlertCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

import type { Agent } from '@/types';
import { useAgentStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AgentSelectorProps {
  className?: string;
  showSettings?: boolean;
  onSettingsClick?: (agent: Agent) => void;
}

interface AgentItemProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
  onSettingsClick?: (agent: Agent) => void;
}

const AgentItem: React.FC<AgentItemProps> = ({ 
  agent, 
  isSelected, 
  onSelect, 
  onSettingsClick 
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group',
        'hover:bg-gray-50',
        isSelected && 'bg-brand-50 hover:bg-brand-100'
      )}
      onClick={() => onSelect(agent)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isSelected ? 'bg-brand-600' : 'bg-gray-200'
        )}>
          <Bot className={cn(
            'w-4 h-4',
            isSelected ? 'text-white' : 'text-gray-600'
          )} />
        </div>
        
        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {agent.project_name}
            </h3>
            {isSelected && (
              <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
            )}
          </div>
          
          {agent.settings?.agent_capability && (
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {agent.settings.agent_capability}
            </p>
          )}
          
          {/* Metadata */}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {agent.settings?.chatbot_model && (
              <span>Model: {agent.settings.chatbot_model}</span>
            )}
            <span>Status: {agent.is_chat_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
      
      {/* Settings Button */}
      {onSettingsClick && (
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick(agent);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-gray-400 hover:text-gray-600"
          title="Agent Settings"
        >
          <Settings className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  className,
  showSettings = true,
  onSettingsClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    agents, 
    currentAgent, 
    loading, 
    error, 
    fetchAgents, 
    selectAgent 
  } = useAgentStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    try {
      await fetchAgents();
      toast.success('Agents refreshed');
    } catch (error) {
      toast.error('Failed to refresh agents');
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    selectAgent(agent);
    setIsOpen(false);
    toast.success(`Switched to ${agent.project_name}`);
  };

  const handleToggleDropdown = async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    
    // Fetch agents when opening the dropdown
    if (willOpen) {
      try {
        await fetchAgents();
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        // Don't show error toast here as it might be annoying
      }
    }
  };

  if (loading && agents.length === 0) {
    return (
      <div className={cn('p-3 bg-white border rounded-lg', className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error && agents.length === 0) {
    return (
      <div className={cn('p-3 bg-white border rounded-lg', className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-600 font-medium">Failed to load agents</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="text-red-600 hover:text-red-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!currentAgent && agents.length === 0) {
    return (
      <div className={cn('p-3 bg-white border rounded-lg', className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <Bot className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">No agents available</p>
            <p className="text-xs text-gray-500">Check your API configuration</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Selected Agent Display */}
      <button
        onClick={handleToggleDropdown}
        className={cn(
          'w-full p-3 bg-white border rounded-lg text-left transition-colors',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          isOpen && 'ring-2 ring-brand-500 border-transparent'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            
            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {currentAgent?.project_name || 'Select Agent'}
              </h3>
              {currentAgent?.settings?.agent_capability && (
                <p className="text-sm text-gray-500 truncate">
                  {currentAgent.settings.agent_capability}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={loading}
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
              title="Refresh Agents"
            >
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            </Button>
            
            {/* Dropdown Arrow */}
            <ChevronDown className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              {/* Header */}
              <div className="px-2 py-1 mb-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Available Agents ({Array.isArray(agents) ? agents.length : 0})
                </h4>
              </div>
              
              {/* Agent List */}
              <div className="space-y-1">
                {Array.isArray(agents) && agents.length > 0 ? (
                  agents.map((agent) => (
                    <AgentItem
                      key={agent.id}
                      agent={agent}
                      isSelected={currentAgent?.id === agent.id}
                      onSelect={handleSelectAgent}
                      onSettingsClick={showSettings ? onSettingsClick : undefined}
                    />
                  ))
                ) : (
                  <div className="px-2 py-4 text-center">
                    <p className="text-sm text-gray-500">No agents found</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRefresh}
                      className="mt-2"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                )}
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};