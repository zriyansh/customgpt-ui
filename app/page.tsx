/**
 * Home Page Component
 * 
 * This is the main entry point of the application.
 * It handles the initial setup flow and renders the chat interface.
 * 
 * Flow:
 * 1. Check if API key is configured
 * 2. If not, show API key setup screen
 * 3. Once configured, show the main chat interface
 * 
 * Key Features:
 * - Conditional rendering based on setup state
 * - Dynamic import of ChatLayout to avoid SSR issues
 * - Toast notifications for user feedback
 * - Responsive layout that fills the viewport
 * 
 * Customization:
 * - Modify ApiKeySetup for different authentication methods
 * - Change ChatLayout mode ('standalone', 'widget', 'floating')
 * - Adjust toast position and styling
 * - Add onboarding or tutorial overlays
 * 
 * For contributors:
 * - The API key is stored in localStorage via Zustand
 * - ChatLayout is dynamically imported to prevent hydration issues
 * - PageLayout provides consistent navigation structure
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

import { useConfigStore } from '@/store';
import { ApiKeySetup } from '@/components/setup/ApiKeySetup';
import { PageLayout } from '@/components/layout/PageLayout';

/**
 * Dynamic Import of ChatLayout
 * 
 * ChatLayout contains browser-only code (localStorage, window objects)
 * so we disable SSR to prevent hydration mismatches.
 * 
 * This ensures:
 * - No server-side rendering errors
 * - Consistent client-side behavior
 * - Proper access to browser APIs
 * 
 * The loading state is handled by the component itself.
 */
const ChatLayout = dynamic(
  () => import('@/components/chat/ChatLayout').then(mod => ({ default: mod.ChatLayout })),
  { 
    ssr: false // Disable server-side rendering
  }
);

/**
 * Home Page Component
 * 
 * Manages the application's main flow:
 * - Setup flow for new users
 * - Chat interface for configured users
 * 
 * State Management:
 * - isSetupComplete: Tracks whether API key is configured
 * - apiKey: Retrieved from global config store
 * 
 * The component re-renders when apiKey changes,
 * automatically transitioning from setup to chat.
 */
export default function Home() {
  // Track setup completion state
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  // Get API key from global store
  const { apiKey } = useConfigStore();

  // Update setup state when API key changes
  useEffect(() => {
    setIsSetupComplete(!!apiKey);
  }, [apiKey]);

  // Show setup screen if API key not configured
  if (!isSetupComplete) {
    return (
      <PageLayout showNavbar={false}>
        <ApiKeySetup onComplete={() => setIsSetupComplete(true)} />
        <Toaster position="top-center" />
      </PageLayout>
    );
  }

  // Show main chat interface
  return (
    <PageLayout showBackButton={false}>
      {/* Container with calculated height to account for navbar */}
      <div className="h-[calc(100vh-4rem)] bg-gray-50">
        {/* Main chat interface in standalone mode */}
        <ChatLayout mode="standalone" />
        {/* Toast notifications for user feedback */}
        <Toaster position="top-center" />
      </div>
    </PageLayout>
  );
}
