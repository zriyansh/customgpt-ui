/**
 * Analytics Dashboard Page
 * 
 * Comprehensive analytics view for CustomGPT agents showing usage metrics,
 * performance data, and conversation insights.
 * 
 * Features:
 * - Key performance metrics cards
 * - Time-series charts for trends
 * - Top queries analysis
 * - User satisfaction metrics
 * - Date range filtering
 * - Data export functionality
 * - Real-time refresh
 * - Responsive grid layout
 * 
 * Data Visualization:
 * - Total conversations with trend
 * - Query success rate
 * - Unique users count
 * - Average response time
 * - Conversations over time (line chart)
 * - Queries over time (line chart)
 * - Top queries (bar chart)
 * - Satisfaction rate
 * - Response accuracy
 * - Average messages per conversation
 * 
 * Export Options:
 * - JSON format for data processing
 * - CSV format for spreadsheets
 * - PDF format for reports
 * 
 * State Management:
 * - Uses analyticsStore for data
 * - Uses agentStore for current agent
 * - Local state for export format
 * 
 * Error Handling:
 * - No agent selected state
 * - Loading skeletons
 * - Error message display
 * - Retry functionality
 * 
 * Customization for contributors:
 * - Add more chart types (pie, donut, heatmap)
 * - Implement real-time updates
 * - Add custom metric cards
 * - Enhance export formats
 * - Add filtering by query type
 * - Implement comparison mode
 * - Add predictive analytics
 * - Integrate with external analytics tools
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { useAnalyticsStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';

// Analytics visualization components
import { LineChart } from '@/components/analytics/LineChart';
import { BarChart } from '@/components/analytics/BarChart';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';

/**
 * Analytics Page Component
 * 
 * Main analytics dashboard showing comprehensive metrics and charts
 * for the selected CustomGPT agent.
 */
export default function AnalyticsPage() {
  const router = useRouter();
  const { currentAgent } = useAgentStore();
  const { 
    analytics, 
    loading, 
    error, 
    fetchAnalytics, 
    exportAnalytics,
    setDateRange,
    dateRange 
  } = useAnalyticsStore();

  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('json');

  /**
   * Fetch analytics when agent or date range changes
   * 
   * Automatically loads analytics data when component mounts
   * or when the selected agent/date range changes.
   */
  useEffect(() => {
    if (currentAgent) {
      fetchAnalytics(currentAgent.id);
    }
  }, [currentAgent, dateRange]);

  /**
   * Handle manual refresh
   * 
   * Allows users to manually refresh analytics data
   * to get the latest metrics.
   */
  const handleRefresh = () => {
    if (currentAgent) {
      fetchAnalytics(currentAgent.id);
    }
  };

  /**
   * Handle data export
   * 
   * Exports analytics data in the selected format
   * (JSON, CSV, or PDF).
   */
  const handleExport = () => {
    exportAnalytics(exportFormat);
  };

  if (!currentAgent) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Agent Selected</h2>
            <p className="text-gray-600 mb-6">Please select an agent first to view analytics</p>
            <Button onClick={() => router.push('/')}>
              Go to Chat
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Performance insights for {currentAgent.project_name}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={setDateRange}
              />
              
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
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
                
                <Button
                  variant="default"
                  onClick={handleExport}
                  disabled={!analytics}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error loading analytics</span>
            </div>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {analytics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Conversations"
                value={analytics.conversations.total}
                trend={analytics.conversations.trend}
                icon={MessageSquare}
                color="blue"
              />
              
              <MetricCard
                title="Total Queries"
                value={analytics.queries.total}
                trend={
                  analytics.queries.successful > 0 
                    ? (analytics.queries.successful / analytics.queries.total) * 100
                    : 0
                }
                icon={BarChart3}
                color="green"
                suffix={`${Math.round((analytics.queries.successful / (analytics.queries.total || 1)) * 100)}% success`}
              />
              
              <MetricCard
                title="Unique Users"
                value={analytics.traffic.uniqueUsers}
                icon={Users}
                color="purple"
              />
              
              <MetricCard
                title="Avg Response Time"
                value={`${analytics.queries.avgResponseTime}s`}
                icon={Clock}
                color="orange"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversations Over Time */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Conversations Over Time
                </h3>
                <LineChart
                  data={analytics.conversations.data}
                  xKey="date"
                  yKey="count"
                  color="#3B82F6"
                />
              </Card>

              {/* Queries Over Time */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Queries Over Time
                </h3>
                <LineChart
                  data={analytics.queries.data}
                  xKey="date"
                  yKey="count"
                  color="#10B981"
                />
              </Card>
            </div>

            {/* Top Queries */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Queries
              </h3>
              <BarChart
                data={analytics.queries.topQueries.slice(0, 10)}
                xKey="query"
                yKey="count"
                color="#8B5CF6"
              />
            </Card>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Satisfaction Rate
                </h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {Math.round(analytics.statistics.satisfactionRate * 100)}%
                  </span>
                  <TrendingUp className="w-5 h-5 text-green-500 ml-2" />
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Response Accuracy
                </h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {Math.round(analytics.statistics.responseAccuracy * 100)}%
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Avg Messages per Conversation
                </h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {analytics.statistics.avgMessagesPerConversation.toFixed(1)}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}