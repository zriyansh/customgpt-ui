'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

import { useConfigStore } from '@/store';
import { ApiKeySetup } from '@/components/setup/ApiKeySetup';
import { PageLayout } from '@/components/layout/PageLayout';

// Dynamically import ChatLayout to avoid SSR issues
const ChatLayout = dynamic(
  () => import('@/components/chat/ChatLayout').then(mod => ({ default: mod.ChatLayout })),
  { ssr: false }
);

export default function Home() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { apiKey } = useConfigStore();

  useEffect(() => {
    setIsSetupComplete(!!apiKey);
  }, [apiKey]);

  if (!isSetupComplete) {
    return (
      <PageLayout showNavbar={false}>
        <ApiKeySetup onComplete={() => setIsSetupComplete(true)} />
        <Toaster position="top-center" />
      </PageLayout>
    );
  }

  return (
    <PageLayout showBackButton={false}>
      <div className="h-[calc(100vh-4rem)] bg-gray-50">
        <ChatLayout mode="standalone" />
        <Toaster position="top-center" />
      </div>
    </PageLayout>
  );
}
