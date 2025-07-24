'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AgentManagement } from '@/components/dashboard/AgentManagement';
import { AgentSettings } from '@/components/dashboard/AgentSettings';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<'overview' | 'agents' | 'settings'>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'agents':
        return <AgentManagement />;
      case 'settings':
        return selectedAgentId ? (
          <AgentSettings 
            agentId={selectedAgentId} 
            agentName="Customer Support Bot" 
          />
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Selected</h3>
              <p className="text-gray-600">Please select an agent to configure its settings.</p>
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout currentPage={currentView}>
      {renderContent()}
    </DashboardLayout>
  );
}