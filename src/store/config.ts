import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConfigStore } from '@/types';
import { initializeClient, isClientInitialized } from '@/lib/api/client';

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      apiKey: null,
      baseURL: 'https://app.customgpt.ai/api/v1',
      theme: 'light',

      setApiKey: (key: string) => {
        set({ apiKey: key });
        
        // Initialize API client with new key
        if (key) {
          initializeClient({
            apiKey: key,
            baseURL: get().baseURL,
          });
        }
      },

      setBaseURL: (url: string) => {
        set({ baseURL: url });
        
        // Re-initialize client if API key exists
        const { apiKey } = get();
        if (apiKey) {
          initializeClient({
            apiKey,
            baseURL: url,
          });
        }
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Update document class for theme
        if (typeof window !== 'undefined') {
          document.documentElement.className = theme;
        }
      },
    }),
    {
      name: 'customgpt-config',
      partialize: (state) => ({
        apiKey: state.apiKey,
        baseURL: state.baseURL,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize API client on rehydration if API key exists
        if (state?.apiKey && !isClientInitialized()) {
          initializeClient({
            apiKey: state.apiKey,
            baseURL: state.baseURL,
          });
        }
        
        // Apply theme on rehydration
        if (state?.theme && typeof window !== 'undefined') {
          document.documentElement.className = state.theme;
        }
      },
    }
  )
);