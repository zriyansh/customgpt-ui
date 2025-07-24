import { create } from 'zustand';
import { toast } from 'sonner';
import { getClient } from '@/lib/api/client';
import type { APIResponse } from '@/types';

export interface ProjectSettings {
  chatbot_avatar?: string;
  chatbot_background_type?: 'image' | 'color';
  chatbot_background?: string;
  chatbot_background_color?: string;
  default_prompt?: string;
  example_questions?: string[];
  response_source?: 'default' | 'own_content' | 'openai_content';
  chatbot_msg_lang?: string;
  chatbot_color?: string;
  chatbot_toolbar_color?: string;
  persona_instructions?: string;
  citations_answer_source_label_msg?: string;
  citations_sources_label_msg?: string;
  hang_in_there_msg?: string;
  chatbot_siesta_msg?: string;
}

export interface ProjectPlugin {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  category?: string;
  settings?: Record<string, any>;
}

export interface ProjectStats {
  total_conversations: number;
  total_messages: number;
  total_sources: number;
  total_pages: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectSettingsStore {
  // Settings
  settings: ProjectSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // Plugins
  plugins: ProjectPlugin[];
  pluginsLoading: boolean;
  pluginsError: string | null;

  // Stats
  stats: ProjectStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Actions
  fetchSettings: (projectId: number) => Promise<void>;
  updateSettings: (projectId: number, settings: Partial<ProjectSettings>) => Promise<void>;
  fetchPlugins: (projectId: number) => Promise<void>;
  updatePlugin: (projectId: number, pluginId: string, enabled: boolean) => Promise<void>;
  fetchStats: (projectId: number) => Promise<void>;
  reset: () => void;
}

export const useProjectSettingsStore = create<ProjectSettingsStore>((set, get) => ({
  // Initial state
  settings: null,
  settingsLoading: false,
  settingsError: null,
  plugins: [],
  pluginsLoading: false,
  pluginsError: null,
  stats: null,
  statsLoading: false,
  statsError: null,

  // Fetch project settings
  fetchSettings: async (projectId: number) => {
    set({ settingsLoading: true, settingsError: null });

    try {
      const response = await getClient().get<APIResponse<ProjectSettings>>(
        `/projects/${projectId}/settings`
      );

      if (response.status === 200) {
        set({ 
          settings: response.data, 
          settingsLoading: false 
        });
      } else {
        throw new Error('Failed to fetch project settings');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project settings';
      set({ 
        settingsError: errorMessage, 
        settingsLoading: false 
      });
      toast.error(errorMessage);
    }
  },

  // Update project settings
  updateSettings: async (projectId: number, settingsUpdate: Partial<ProjectSettings>) => {
    set({ settingsLoading: true, settingsError: null });

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      Object.entries(settingsUpdate).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'example_questions' && Array.isArray(value)) {
            // Handle array fields
            value.forEach((question, index) => {
              formData.append(`example_questions[${index}]`, question);
            });
          } else if (value instanceof File) {
            // Handle file uploads
            formData.append(key, value);
          } else {
            // Handle regular fields
            formData.append(key, String(value));
          }
        }
      });

      const response = await getClient().post<APIResponse<{ updated: boolean }>>(
        `/projects/${projectId}/settings`,
        formData
      );

      if (response.status === 200 && response.data.updated) {
        // Merge updated settings with current settings
        const currentSettings = get().settings || {};
        const newSettings = { ...currentSettings, ...settingsUpdate };
        
        set({ 
          settings: newSettings, 
          settingsLoading: false 
        });
        
        toast.success('Project settings updated successfully');
      } else {
        throw new Error('Failed to update project settings');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project settings';
      set({ 
        settingsError: errorMessage, 
        settingsLoading: false 
      });
      toast.error(errorMessage);
    }
  },

  // Fetch project plugins
  fetchPlugins: async (projectId: number) => {
    set({ pluginsLoading: true, pluginsError: null });

    try {
      const response = await getClient().get<APIResponse<ProjectPlugin[]>>(
        `/projects/${projectId}/plugins`
      );

      if (response.status === 200) {
        set({ 
          plugins: Array.isArray(response.data) ? response.data : [], 
          pluginsLoading: false 
        });
      } else {
        throw new Error('Failed to fetch project plugins');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project plugins';
      set({ 
        pluginsError: errorMessage, 
        pluginsLoading: false,
        plugins: [] // Fallback to empty array
      });
      console.warn('Plugins not available:', errorMessage);
    }
  },

  // Update project plugin
  updatePlugin: async (projectId: number, pluginId: string, enabled: boolean) => {
    try {
      // This endpoint might not exist yet, so we'll implement it as a placeholder
      const response = await getClient().put<APIResponse<{ updated: boolean }>>(
        `/projects/${projectId}/plugins/${pluginId}`,
        { enabled }
      );

      if (response.status === 200) {
        // Update plugin in store
        const plugins = get().plugins.map(plugin =>
          plugin.id === pluginId ? { ...plugin, enabled } : plugin
        );
        
        set({ plugins });
        toast.success(`Plugin ${enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to update plugin');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update plugin';
      toast.error(errorMessage);
    }
  },

  // Fetch project stats
  fetchStats: async (projectId: number) => {
    set({ statsLoading: true, statsError: null });

    try {
      const response = await getClient().get<APIResponse<ProjectStats>>(
        `/projects/${projectId}/stats`
      );

      if (response.status === 200) {
        set({ 
          stats: response.data, 
          statsLoading: false 
        });
      } else {
        throw new Error('Failed to fetch project stats');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project stats';
      set({ 
        statsError: errorMessage, 
        statsLoading: false 
      });
      toast.error(errorMessage);
    }
  },

  // Reset store
  reset: () => {
    set({
      settings: null,
      settingsLoading: false,
      settingsError: null,
      plugins: [],
      pluginsLoading: false,
      pluginsError: null,
      stats: null,
      statsLoading: false,
      statsError: null,
    });
  },
}));