'use client';

import React, { useEffect, useState } from 'react';
import { 
  Link,
  Settings,
  Plus,
  RefreshCw,
  ExternalLink,
  Key,
  Database,
  Globe,
  Mail,
  Calendar,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  FileText,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Power,
  Code,
  Webhook,
  Shield,
  Clock,
  Activity,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTimestamp } from '@/lib/utils';
import type { Agent } from '@/types';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'webhook' | 'database' | 'communication' | 'analytics' | 'commerce' | 'productivity';
  status: 'active' | 'inactive' | 'error' | 'pending';
  type: 'oauth' | 'api_key' | 'webhook' | 'custom';
  icon: string;
  provider: string;
  connected_at?: string;
  last_sync?: string;
  config: Record<string, any>;
  permissions: string[];
  usage_stats?: {
    requests_today: number;
    requests_month: number;
    last_used?: string;
  };
  error_message?: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  last_triggered?: string;
  request_count: number;
  secret_key: string;
}

interface ApiAccess {
  enabled: boolean;
  rate_limit: number;
  allowed_origins: string[];
  require_auth: boolean;
  api_keys: Array<{
    id: string;
    name: string;
    key: string;
    permissions: string[];
    created_at: string;
    last_used?: string;
  }>;
}

interface IntegrationsSettingsProps {
  project: Agent;
}

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ project }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [apiAccess, setApiAccess] = useState<ApiAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'integrations' | 'webhooks' | 'api'>('integrations');


  useEffect(() => {
    loadIntegrations();
  }, [project.id]);

  const loadIntegrations = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call when integrations API is available
      setError('Integration features are not yet available');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load integrations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadIntegrations();
  };

  const handleToggleIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    const newStatus = integration.status === 'active' ? 'inactive' : 'active';
    
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: newStatus } : i
    ));

    toast.success(`Integration ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.filter(i => i.id !== integrationId));
    toast.success('Integration removed');
  };

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === webhookId ? { ...w, is_active: !w.is_active } : w
    ));
    toast.success('Webhook updated');
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    toast.success('Webhook deleted');
  };

  const categoryIcons = {
    api: Database,
    webhook: Webhook,
    database: Database,
    communication: MessageSquare,
    analytics: BarChart3,
    commerce: ShoppingCart,
    productivity: FileText
  };

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    error: 'text-red-600 bg-red-100',
    pending: 'text-yellow-600 bg-yellow-100'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations & API</h2>
          <p className="text-gray-600 mt-1">
            Connect external services and manage API access for {project.project_name}
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
              Add Integration
            </Button>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              POST /projects/{project.id}/integrations
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading integrations</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          {error.includes('403') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                <strong>Premium Feature:</strong> Advanced integrations may require a premium subscription.
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'integrations', label: 'Integrations', icon: Link },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'api', label: 'API Access', icon: Key }
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeView === view.id
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && integrations.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activeView === 'integrations' && (
            <>
              {/* Integration Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries({
                  communication: { count: integrations.filter(i => i.category === 'communication').length, color: 'blue' },
                  analytics: { count: integrations.filter(i => i.category === 'analytics').length, color: 'green' },
                  commerce: { count: integrations.filter(i => i.category === 'commerce').length, color: 'purple' },
                  productivity: { count: integrations.filter(i => i.category === 'productivity').length, color: 'orange' }
                }).map(([category, data]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons];
                  return (
                    <Card key={category} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          data.color === 'blue' && 'bg-blue-100',
                          data.color === 'green' && 'bg-green-100',
                          data.color === 'purple' && 'bg-purple-100',
                          data.color === 'orange' && 'bg-orange-100'
                        )}>
                          <Icon className={cn(
                            'w-5 h-5',
                            data.color === 'blue' && 'text-blue-600',
                            data.color === 'green' && 'text-green-600',
                            data.color === 'purple' && 'text-purple-600',
                            data.color === 'orange' && 'text-orange-600'
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 capitalize">{category}</p>
                          <p className="text-2xl font-bold text-gray-900">{data.count}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Integrations List */}
              <div className="flex justify-end mb-4">
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                  GET /projects/{project.id}/integrations
                </span>
              </div>
              <div className="space-y-4">
                {integrations.map((integration) => {
                  const CategoryIcon = categoryIcons[integration.category];
                  
                  return (
                    <Card key={integration.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{integration.icon}</span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                <div className={cn(
                                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                                  statusColors[integration.status]
                                )}>
                                  {integration.status}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CategoryIcon className="w-3 h-3" />
                                  {integration.category}
                                </span>
                                <span>Provider: {integration.provider}</span>
                                {integration.connected_at && (
                                  <span>Connected {formatTimestamp(integration.connected_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Usage Stats */}
                          {integration.usage_stats && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                              <span>{integration.usage_stats.requests_today} requests today</span>
                              <span>{integration.usage_stats.requests_month} this month</span>
                              {integration.usage_stats.last_used && (
                                <span>Last used {formatTimestamp(integration.usage_stats.last_used)}</span>
                              )}
                            </div>
                          )}

                          {/* Error Message */}
                          {integration.status === 'error' && integration.error_message && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>{integration.error_message}</span>
                              </div>
                            </div>
                          )}

                          {/* Permissions */}
                          {integration.permissions.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                              <div className="flex flex-wrap gap-1">
                                {integration.permissions.map(permission => (
                                  <span 
                                    key={permission}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleToggleIntegration(integration.id)}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {integration.status === 'active' ? 'Disable' : 'Enable'}
                            </Button>
                            
                            <Button size="sm" variant="ghost">
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                            
                            <Button size="sm" variant="ghost">
                              <Activity className="w-4 h-4 mr-2" />
                              Logs
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteIntegration(integration.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {activeView === 'webhooks' && (
            <>
              {/* Webhooks Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Webhook Endpoints</h3>
                  <p className="text-sm text-gray-600">Receive real-time notifications about events</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    POST /projects/{project.id}/webhooks
                  </span>
                </div>
              </div>

              {/* Webhooks List */}
              <div className="flex justify-end mb-4">
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                  GET /projects/{project.id}/webhooks
                </span>
              </div>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{webhook.name}</h4>
                          <div className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          )}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 font-mono mb-2">{webhook.url}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created {formatTimestamp(webhook.created_at)}</span>
                          <span>{webhook.request_count} requests</span>
                          {webhook.last_triggered && (
                            <span>Last triggered {formatTimestamp(webhook.last_triggered)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Events */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Events:</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map(event => (
                          <span 
                            key={event}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Secret Key */}
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-xs text-gray-500 mb-1">Secret Key:</p>
                      <p className="text-sm font-mono text-gray-900">{webhook.secret_key}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleWebhook(webhook.id)}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {webhook.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <Zap className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeView === 'api' && apiAccess && (
            <>
              {/* API Settings */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Access Configuration</h3>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    POST /projects/{project.id}/api/settings
                  </span>
                </div>
                
                <div className="space-y-6">
                  {/* Enable API */}
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={apiAccess.enabled}
                      onChange={(e) => setApiAccess({
                        ...apiAccess,
                        enabled: e.target.checked
                      })}
                    />
                    <span className="text-sm font-medium text-gray-900">Enable API access</span>
                  </label>

                  {apiAccess.enabled && (
                    <>
                      {/* Rate Limiting */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Rate Limit (requests per hour)
                        </label>
                        <input 
                          type="number"
                          value={apiAccess.rate_limit}
                          onChange={(e) => setApiAccess({
                            ...apiAccess,
                            rate_limit: parseInt(e.target.value)
                          })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      {/* CORS Origins */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Allowed Origins
                        </label>
                        <div className="space-y-2">
                          {apiAccess.allowed_origins.map((origin, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input 
                                type="text"
                                value={origin}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                readOnly
                              />
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button size="sm" variant="outline">Add Origin</Button>
                        </div>
                      </div>

                      {/* Authentication */}
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={apiAccess.require_auth}
                          onChange={(e) => setApiAccess({
                            ...apiAccess,
                            require_auth: e.target.checked
                          })}
                        />
                        <span className="text-sm font-medium text-gray-900">Require authentication</span>
                      </label>
                    </>
                  )}
                </div>
              </Card>

              {/* API Keys */}
              {apiAccess.enabled && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                        GET /projects/{project.id}/api/keys
                      </span>
                    </div>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Generate New Key
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {apiAccess.api_keys.map((apiKey) => (
                      <div key={apiKey.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                          <p className="text-sm text-gray-600 font-mono">{apiKey.key}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Permissions: {apiKey.permissions.join(', ')}</span>
                            <span>Created {formatTimestamp(apiKey.created_at)}</span>
                            {apiKey.last_used && (
                              <span>Last used {formatTimestamp(apiKey.last_used)}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* API Documentation */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Code className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      API Documentation
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                      Learn how to integrate with your CustomGPT agent using our RESTful API.
                    </p>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Documentation
                      </Button>
                      
                      <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        <Download className="w-4 h-4 mr-2" />
                        Download SDK
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};