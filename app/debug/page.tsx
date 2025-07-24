'use client';

import { LogViewer } from '@/components/debug/LogViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Debug Logs</h1>
        <p className="text-gray-600 mt-2">
          View application logs to debug authorization and API issues. Logs are automatically refreshed every 5 seconds.
        </p>
      </div>
      
      <LogViewer />
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Debugging Tips:</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Look for 403 or "unauthorized" errors in the logs</li>
          <li>Check the API request details to see what headers and parameters are being sent</li>
          <li>Compare working requests (like initial chat) with failing requests (like loading history)</li>
          <li>Pay attention to the agentId and conversationId in the context</li>
          <li>Filter by "error" level to see only error logs</li>
        </ul>
      </div>
    </div>
  );
}