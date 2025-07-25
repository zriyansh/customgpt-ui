'use client';

import React, { useEffect, useState } from 'react';
import { 
  DollarSign,
  CreditCard,
  Users,
  Crown,
  TrendingUp,
  Settings,
  Lock,
  Unlock,
  Star,
  Gift,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Shield,
  Globe,
  Clock,
  Power
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTimestamp } from '@/lib/utils';
import type { Agent } from '@/types';

interface MonetizationConfig {
  enabled: boolean;
  pricing_model: 'free' | 'subscription' | 'usage' | 'freemium';
  subscription_plans: Array<{
    id: string;
    name: string;
    price: number;
    billing_period: 'monthly' | 'yearly';
    features: string[];
    limits: {
      messages_per_month: number;
      api_calls_per_day: number;
      storage_gb: number;
      custom_branding: boolean;
      priority_support: boolean;
    };
    is_active: boolean;
    subscriber_count: number;
  }>;
  usage_pricing: {
    price_per_message: number;
    price_per_api_call: number;
    free_tier_limits: {
      messages_per_month: number;
      api_calls_per_month: number;
    };
  };
  revenue_sharing: {
    enabled: boolean;
    platform_fee_percentage: number;
    minimum_payout: number;
    payout_schedule: 'weekly' | 'monthly';
  };
  payment_settings: {
    stripe_connected: boolean;
    supported_currencies: string[];
    tax_handling: 'automatic' | 'manual';
    invoice_customization: boolean;
  };
}

interface RevenueStats {
  total_revenue: number;
  monthly_recurring_revenue: number;
  active_subscribers: number;
  churn_rate: number;
  average_revenue_per_user: number;
  revenue_growth_rate: number;
  top_plans: Array<{
    plan_name: string;
    revenue: number;
    subscribers: number;
  }>;
  recent_transactions: Array<{
    id: string;
    customer_email: string;
    amount: number;
    currency: string;
    plan: string;
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
  }>;
}

interface MonetizationSettingsProps {
  project: Agent;
}

export const MonetizationSettings: React.FC<MonetizationSettingsProps> = ({ project }) => {
  const [config, setConfig] = useState<MonetizationConfig | null>(null);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'settings' | 'plans' | 'analytics' | 'payments'>('settings');


  useEffect(() => {
    loadMonetizationData();
  }, [project.id]);

  const loadMonetizationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call when monetization API is available
      setError('Monetization features are not yet available');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load monetization data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMonetizationData();
  };

  const handleToggleMonetization = () => {
    if (!config) return;
    
    setConfig({
      ...config,
      enabled: !config.enabled
    });
    
    toast.success(`Monetization ${!config.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleTogglePlan = (planId: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      subscription_plans: config.subscription_plans.map(plan =>
        plan.id === planId ? { ...plan, is_active: !plan.is_active } : plan
      )
    });
    
    toast.success('Plan updated');
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const color = value >= 0 ? 'text-green-600' : 'text-red-600';
    const icon = value >= 0 ? '↗' : '↘';
    return (
      <span className={color}>
        {icon} {Math.abs(value)}%
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monetization & Revenue</h2>
          <p className="text-gray-600 mt-1">
            Set up pricing, manage subscriptions, and track revenue for {project.project_name}
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
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              POST /projects/{project.id}/monetization/export
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading monetization data</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          {error.includes('403') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                <strong>Premium Feature:</strong> Monetization features may require a premium subscription.
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'plans', label: 'Pricing Plans', icon: Crown },
            { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
            { id: 'payments', label: 'Payments', icon: CreditCard }
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

      {loading && !config ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : config && stats ? (
        <div className="space-y-6">
          {/* Revenue Overview Cards */}
          {(activeView === 'settings' || activeView === 'analytics') && (
            <>
              <div className="flex justify-end mb-4">
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                  GET /projects/{project.id}/monetization/stats
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    {formatPercentage(stats.revenue_growth_rate)}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Recurring</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_recurring_revenue)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_subscribers}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">ARPU</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.average_revenue_per_user)}</p>
                  </div>
                </div>
              </Card>
            </div>
            </>
          )}

          {activeView === 'settings' && (
            <>
              {/* Monetization Toggle */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Monetization Status</h3>
                    <p className="text-sm text-gray-600">Enable or disable monetization for your agent</p>
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded mt-2 inline-block">
                      POST /projects/{project.id}/monetization/toggle
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleToggleMonetization}
                    variant={config.enabled ? "outline" : "default"}
                    className={config.enabled ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                  >
                    {config.enabled ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                    {config.enabled ? 'Disable Monetization' : 'Enable Monetization'}
                  </Button>
                </div>

                {config.enabled && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Monetization Active</span>
                    </div>
                    <p className="text-green-700 mt-1 text-sm">
                      Your agent is configured to generate revenue through {config.pricing_model} pricing model.
                    </p>
                  </div>
                )}
              </Card>

              {config.enabled && (
                <>
                  {/* Pricing Model */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pricing Model</h3>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                        POST /projects/{project.id}/pricing-model
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { id: 'free', label: 'Free', description: 'Completely free access to your agent' },
                        { id: 'freemium', label: 'Freemium', description: 'Free tier with paid premium features' },
                        { id: 'subscription', label: 'Subscription', description: 'Monthly or yearly subscription plans' },
                        { id: 'usage', label: 'Pay-per-use', description: 'Charge based on actual usage' }
                      ].map((model) => (
                        <label key={model.id} className="flex items-start gap-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="pricing_model"
                            value={model.id}
                            checked={config.pricing_model === model.id}
                            onChange={(e) => setConfig({
                              ...config,
                              pricing_model: e.target.value as any
                            })}
                            className="mt-1"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{model.label}</span>
                            <p className="text-xs text-gray-600">{model.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {/* Revenue Sharing */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Revenue Sharing</h3>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                        POST /projects/{project.id}/revenue-sharing
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={config.revenue_sharing.enabled}
                          onChange={(e) => setConfig({
                            ...config,
                            revenue_sharing: {
                              ...config.revenue_sharing,
                              enabled: e.target.checked
                            }
                          })}
                        />
                        <span className="text-sm font-medium text-gray-900">Enable revenue sharing with platform</span>
                      </label>

                      {config.revenue_sharing.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                              Platform Fee (%)
                            </label>
                            <input 
                              type="number"
                              value={config.revenue_sharing.platform_fee_percentage}
                              min="0"
                              max="50"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                              Minimum Payout
                            </label>
                            <input 
                              type="number"
                              value={config.revenue_sharing.minimum_payout}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                              Payout Schedule
                            </label>
                            <select 
                              value={config.revenue_sharing.payout_schedule}
                              onChange={(e) => setConfig({
                                ...config,
                                revenue_sharing: {
                                  ...config.revenue_sharing,
                                  payout_schedule: e.target.value as any
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </>
          )}

          {activeView === 'plans' && config.enabled && (
            <>
              {/* Subscription Plans */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    GET /projects/{project.id}/subscription-plans
                  </span>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.subscription_plans.map((plan) => (
                  <Card key={plan.id} className={cn(
                    "p-6 relative",
                    !plan.is_active && "opacity-60"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                      <div className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                        <span className="text-gray-600">/{plan.billing_period === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subscribers</span>
                        <span className="font-medium text-gray-900">{plan.subscriber_count}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleTogglePlan(plan.id)}
                        className="flex-1"
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {plan.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeView === 'analytics' && (
            <>
              {/* Top Plans Performance */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Plan Performance</h3>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    GET /projects/{project.id}/plan-performance
                  </span>
                </div>
                <div className="space-y-4">
                  {stats.top_plans.map((plan, index) => (
                    <div key={plan.plan_name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-medium text-brand-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{plan.plan_name}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(plan.revenue)} • {plan.subscribers} subscribers
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-brand-600 h-2 rounded-full" 
                            style={{ width: `${(plan.revenue / Math.max(...stats.top_plans.map(p => p.revenue))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    GET /projects/{project.id}/transactions
                  </span>
                </div>
                <div className="space-y-4">
                  {stats.recent_transactions.map((transaction) => {
                    const statusColors = {
                      completed: 'bg-green-100 text-green-800',
                      pending: 'bg-yellow-100 text-yellow-800',
                      failed: 'bg-red-100 text-red-800'
                    };

                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-brand-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customer_email}</p>
                            <p className="text-sm text-gray-600">{transaction.plan} • {formatTimestamp(transaction.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                          <div className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            statusColors[transaction.status]
                          )}>
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {activeView === 'payments' && (
            <>
              {/* Payment Settings */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Configuration</h3>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    POST /projects/{project.id}/payment-settings
                  </span>
                </div>
                
                <div className="space-y-6">
                  {/* Stripe Connection */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Stripe Integration</h4>
                        <p className="text-sm text-gray-600">Process payments and manage subscriptions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {config.payment_settings.stripe_connected ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                      ) : (
                        <Button size="sm">Connect Stripe</Button>
                      )}
                    </div>
                  </div>

                  {/* Supported Currencies */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supported Currencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {config.payment_settings.supported_currencies.map(currency => (
                        <span 
                          key={currency}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {currency}
                        </span>
                      ))}
                      <Button size="sm" variant="outline">Add Currency</Button>
                    </div>
                  </div>

                  {/* Tax Handling */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tax Handling</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="tax_handling"
                          value="automatic"
                          checked={config.payment_settings.tax_handling === 'automatic'}
                        />
                        <span className="text-sm text-gray-900">Automatic tax calculation</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="tax_handling"
                          value="manual"
                          checked={config.payment_settings.tax_handling === 'manual'}
                        />
                        <span className="text-sm text-gray-900">Manual tax handling</span>
                      </label>
                    </div>
                  </div>

                  {/* Invoice Customization */}
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={config.payment_settings.invoice_customization}
                    />
                    <span className="text-sm font-medium text-gray-900">Enable custom invoice branding</span>
                  </label>
                </div>
              </Card>

              {/* Payout Information */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Next Payout
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                      Your next payout is scheduled for January 31, 2024. 
                      Current balance: {formatCurrency(stats.monthly_recurring_revenue * 0.85)}
                    </p>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        <Download className="w-4 h-4 mr-2" />
                        Download Statement
                      </Button>
                      
                      <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Payout History
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              POST /projects/{project.id}/monetization/save
            </span>
            <Button>Save Monetization Settings</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};