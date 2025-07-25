// Export all stores from a single entry point
export { useConfigStore } from './config';
export { useAgentStore } from './agents';
export { useConversationStore } from './conversations';
export { useMessageStore } from './messages';
export { useUIStore } from './ui';
export { useAnalyticsStore } from './analytics';
export { usePageStore } from './pages';
export { useSourceStore } from './sources';
export { useProfileStore } from './profile';
export { useProjectSettingsStore } from './project-settings';
export { useLicenseStore } from './licenses';

// Store initialization helper
export function initializeStores() {
  // Stores will auto-initialize when first accessed
  // This function can be used for any additional setup if needed
}

// Store cleanup helper
export function cleanupStores() {
  // Add any cleanup logic if needed
  // Currently, Zustand handles cleanup automatically
}