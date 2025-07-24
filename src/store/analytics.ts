import { create } from 'zustand';
import { getClient } from '@/lib/api/client';
import { toast } from 'sonner';

export interface AnalyticsData {
  conversations: {
    total: number;
    active: number;
    trend: number;
    data: Array<{
      date: string;
      count: number;
    }>;
  };
  queries: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
    topQueries: Array<{
      query: string;
      count: number;
    }>;
    data: Array<{
      date: string;
      count: number;
    }>;
  };
  traffic: {
    uniqueUsers: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    data: Array<{
      date: string;
      users: number;
      pageViews: number;
    }>;
  };
  statistics: {
    totalMessages: number;
    totalConversations: number;
    avgMessagesPerConversation: number;
    satisfactionRate: number;
    responseAccuracy: number;
  };
}

interface AnalyticsState {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Actions
  fetchAnalytics: (projectId: number) => Promise<void>;
  setDateRange: (startDate: string, endDate: string) => void;
  exportAnalytics: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  reset: () => void;
}

// Helper function to format dates for API
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  analytics: null,
  loading: false,
  error: null,
  dateRange: getDefaultDateRange(),

  fetchAnalytics: async (projectId: number) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      const { startDate, endDate } = get().dateRange;
      
      // Fetch all analytics data in parallel
      const [conversations, queries, traffic, statistics, reports] = await Promise.all([
        client.getConversationAnalytics(projectId, {
          start_date: startDate,
          end_date: endDate,
        }),
        client.getQueryAnalytics(projectId, {
          start_date: startDate,
          end_date: endDate,
        }),
        client.getTrafficAnalytics(projectId, {
          start_date: startDate,
          end_date: endDate,
          period: 'day',
        }),
        client.getStatistics(projectId),
        client.getAnalysisReports(projectId, {
          start_date: startDate,
          end_date: endDate,
        }),
      ]);

      // Transform the data to match our interface
      const analyticsData: AnalyticsData = {
        conversations: {
          total: conversations.data?.total || 0,
          active: conversations.data?.active || 0,
          trend: conversations.data?.trend || 0,
          data: conversations.data?.timeline || [],
        },
        queries: {
          total: queries.data?.total || 0,
          successful: queries.data?.successful || 0,
          failed: queries.data?.failed || 0,
          avgResponseTime: queries.data?.avg_response_time || 0,
          topQueries: queries.data?.top_queries || [],
          data: queries.data?.timeline || [],
        },
        traffic: {
          uniqueUsers: traffic.data?.unique_users || 0,
          pageViews: traffic.data?.page_views || 0,
          avgSessionDuration: traffic.data?.avg_session_duration || 0,
          bounceRate: traffic.data?.bounce_rate || 0,
          data: traffic.data?.timeline || [],
        },
        statistics: {
          totalMessages: statistics.data?.total_messages || 0,
          totalConversations: statistics.data?.total_conversations || 0,
          avgMessagesPerConversation: statistics.data?.avg_messages_per_conversation || 0,
          satisfactionRate: statistics.data?.satisfaction_rate || 0,
          responseAccuracy: statistics.data?.response_accuracy || 0,
        },
      };

      set({ analytics: analyticsData, loading: false });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      
      // Provide mock data as fallback for development
      const mockAnalyticsData: AnalyticsData = {
        conversations: {
          total: 1247,
          active: 89,
          trend: 12.5,
          data: [
            { date: '2024-07-01', count: 45 },
            { date: '2024-07-02', count: 52 },
            { date: '2024-07-03', count: 38 },
            { date: '2024-07-04', count: 61 },
            { date: '2024-07-05', count: 47 },
            { date: '2024-07-06', count: 55 },
            { date: '2024-07-07', count: 42 },
          ],
        },
        queries: {
          total: 3542,
          successful: 3124,
          failed: 418,
          avgResponseTime: 1.2,
          topQueries: [
            { query: 'How do I reset my password?', count: 234 },
            { query: 'What are your business hours?', count: 189 },
            { query: 'How can I contact support?', count: 156 },
            { query: 'Where can I find pricing information?', count: 143 },
            { query: 'How do I update my profile?', count: 98 },
          ],
          data: [
            { date: '2024-07-01', count: 124 },
            { date: '2024-07-02', count: 148 },
            { date: '2024-07-03', count: 135 },
            { date: '2024-07-04', count: 167 },
            { date: '2024-07-05', count: 142 },
            { date: '2024-07-06', count: 159 },
            { date: '2024-07-07', count: 128 },
          ],
        },
        traffic: {
          uniqueUsers: 2341,
          pageViews: 8795,
          avgSessionDuration: 4.2,
          bounceRate: 34.5,
          data: [
            { date: '2024-07-01', users: 187, pageViews: 523 },
            { date: '2024-07-02', users: 203, pageViews: 612 },
            { date: '2024-07-03', users: 176, pageViews: 478 },
            { date: '2024-07-04', users: 234, pageViews: 687 },
            { date: '2024-07-05', users: 198, pageViews: 549 },
            { date: '2024-07-06', users: 221, pageViews: 634 },
            { date: '2024-07-07', users: 189, pageViews: 512 },
          ],
        },
        statistics: {
          totalMessages: 15678,
          totalConversations: 4521,
          avgMessagesPerConversation: 3.47,
          satisfactionRate: 4.2,
          responseAccuracy: 94.3,
        },
      };
      
      set({ 
        analytics: mockAnalyticsData,
        error: `Using mock data: ${error instanceof Error ? error.message : 'Failed to fetch analytics'}`,
        loading: false,
      });
      toast.warning('Using mock analytics data - API unavailable');
    }
  },

  setDateRange: (startDate: string, endDate: string) => {
    set({ dateRange: { startDate, endDate } });
  },

  exportAnalytics: async (format: 'csv' | 'json' | 'pdf') => {
    const analytics = get().analytics;
    if (!analytics) {
      toast.error('No analytics data to export');
      return;
    }

    try {
      // Implementation would depend on the format
      switch (format) {
        case 'json':
          const jsonData = JSON.stringify(analytics, null, 2);
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${new Date().toISOString()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Analytics exported successfully');
          break;
          
        case 'csv':
          // Would need a CSV conversion library or custom implementation
          toast.info('CSV export not yet implemented');
          break;
          
        case 'pdf':
          // Would need a PDF generation library
          toast.info('PDF export not yet implemented');
          break;
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
      toast.error('Failed to export analytics');
    }
  },

  reset: () => {
    set({
      analytics: null,
      loading: false,
      error: null,
      dateRange: getDefaultDateRange(),
    });
  },
}));