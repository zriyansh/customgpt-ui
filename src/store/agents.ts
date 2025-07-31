/**
 * Agent Store - Chatbot Management
 * 
 * This store manages all agent (chatbot) related state and operations.
 * Agents are the core entities in CustomGPT - each agent is a trained
 * chatbot with its own knowledge base and settings.
 * 
 * Features:
 * - CRUD operations for agents
 * - Persistent state using localStorage
 * - Auto-selection of first agent
 * - Agent statistics fetching
 * - License management support
 * 
 * State Persistence:
 * - Uses Zustand persist middleware
 * - Stores: agents list and current selection
 * - Survives page refreshes
 * 
 * For contributors:
 * - Always handle multiple API response formats
 * - Update currentAgent when agents list changes
 * - Use optimistic updates for better UX
 * - Log errors for debugging
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgentStore, Agent } from '@/types';
import { getClient } from '@/lib/api/client';

/**
 * Agent Store Implementation
 * 
 * Persisted to localStorage with key 'customgpt-agent-store'
 * Automatically hydrates on app load
 */
export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [],
      currentAgent: null,
      loading: false,
      error: null,

      /**
       * Fetch all agents from the API
       * 
       * Behavior:
       * - Shows loading state during fetch
       * - Auto-selects first agent if none selected
       * - Handles multiple API response formats
       * - Clears error state on success
       */
      fetchAgents: async () => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.getAgents();
          
          // Handle different response formats from the API
          // API can return: { data: [...] }, [...], or { data: { data: [...] } }
          let agents: Agent[] = [];
          if (response && typeof response === 'object') {
            if (Array.isArray((response as any).data)) {
              agents = (response as any).data;
            } else if (Array.isArray(response)) {
              agents = response as Agent[];
            } else if ((response as any).data && Array.isArray((response as any).data.data)) {
              // Paginated response format
              agents = (response as any).data.data;
            }
          }
          
          console.log('Fetched agents:', agents);
          
          set({ 
            agents, 
            loading: false,
            // Auto-select first agent if none selected
            currentAgent: get().currentAgent || (agents.length > 0 ? agents[0] : null)
          });
        } catch (error) {
          console.error('Failed to fetch agents:', error);
          set({ 
            agents: [], // Ensure agents is always an array even on error
            error: error instanceof Error ? error.message : 'Failed to fetch agents',
            loading: false 
          });
        }
      },

      /**
       * Create a new agent
       * 
       * @param data - Agent creation data
       * @param data.project_name - Display name for the agent
       * @param data.sitemap_path - URL for sitemap-based training
       * @param data.files - Files for file-based training
       * @param data.is_shared - Whether agent is publicly accessible
       * 
       * Behavior:
       * - Adds new agent to beginning of list
       * - Auto-selects the new agent
       * - Returns the created agent
       * - Throws error on failure
       */
      createAgent: async (data: {
        project_name: string;
        sitemap_path?: string;
        files?: File[];
        is_shared?: boolean;
      }) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.createAgent(data);
          const newAgent = response.data;
          
          // Optimistic update - add to list and select immediately
          set(state => ({ 
            agents: [newAgent, ...state.agents],
            currentAgent: newAgent,
            loading: false,
          }));
          
          return newAgent;
        } catch (error) {
          console.error('Failed to create agent:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create agent',
            loading: false 
          });
          throw error; // Re-throw for component error handling
        }
      },

      /**
       * Select an agent as the current active agent
       * This agent will be used for all chat operations
       * 
       * @param agent - The agent to select
       */
      selectAgent: (agent: Agent) => {
        set({ currentAgent: agent });
      },

      /**
       * Manually set the agents list
       * Used for optimistic updates or manual state management
       * 
       * Features:
       * - Validates current agent still exists
       * - Auto-selects first agent if current is removed
       * - Maintains agent selection when possible
       * 
       * @param agents - New list of agents
       */
      setAgents: (agents: Agent[]) => {
        set({ 
          agents,
          // Update current agent if it's no longer in the list
          currentAgent: (() => {
            const current = get().currentAgent;
            if (!current) return agents.length > 0 ? agents[0] : null;
            
            // Check if current agent still exists in new list
            const stillExists = agents.find(a => a.id === current.id);
            return stillExists || (agents.length > 0 ? agents[0] : null);
          })()
        });
      },
      
      updateAgent: async (id: number, data: { are_licenses_allowed?: boolean }) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.updateAgent(id, data);
          const updatedAgent = response.data;
          
          set(state => ({
            agents: state.agents.map(a => a.id === id ? updatedAgent : a),
            currentAgent: state.currentAgent?.id === id ? updatedAgent : state.currentAgent,
            loading: false,
          }));
          
          return updatedAgent;
        } catch (error) {
          console.error('Failed to update agent:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update agent',
            loading: false 
          });
          throw error;
        }
      },
      
      deleteAgent: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          await client.deleteAgent(id);
          
          set(state => {
            const filteredAgents = state.agents.filter(a => a.id !== id);
            return {
              agents: filteredAgents,
              currentAgent: state.currentAgent?.id === id 
                ? (filteredAgents.length > 0 ? filteredAgents[0] : null)
                : state.currentAgent,
              loading: false,
            };
          });
        } catch (error) {
          console.error('Failed to delete agent:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete agent',
            loading: false 
          });
          throw error;
        }
      },
      
      replicateAgent: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.replicateAgent(id);
          const newAgent = response.data;
          
          set(state => ({ 
            agents: [newAgent, ...state.agents],
            currentAgent: newAgent,
            loading: false,
          }));
          
          return newAgent;
        } catch (error) {
          console.error('Failed to replicate agent:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to replicate agent',
            loading: false 
          });
          throw error;
        }
      },
      
      getAgentStats: async (id: number) => {
        try {
          const client = getClient();
          const response = await client.getAgentStats(id);
          return response.data;
        } catch (error) {
          console.error('Failed to get agent stats:', error);
          throw error;
        }
      },
    }),
    {
      name: 'customgpt-agents',
      partialize: (state) => ({
        currentAgent: state.currentAgent,
      }),
    }
  )
);