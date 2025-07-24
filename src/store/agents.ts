import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgentStore, Agent } from '@/types';
import { getClient } from '@/lib/api/client';

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],
      currentAgent: null,
      loading: false,
      error: null,

      fetchAgents: async () => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.getAgents();
          
          // Handle different response formats
          let agents: Agent[] = [];
          if (response && typeof response === 'object') {
            if (Array.isArray((response as any).data)) {
              agents = (response as any).data;
            } else if (Array.isArray(response)) {
              agents = response as Agent[];
            } else if ((response as any).data && Array.isArray((response as any).data.data)) {
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
            agents: [], // Ensure agents is always an array
            error: error instanceof Error ? error.message : 'Failed to fetch agents',
            loading: false 
          });
        }
      },

      createAgent: async (data: {
        project_name: string;
        sitemap_path?: string;
        default_prompt?: string;
        example_questions?: string[];
        persona_instructions?: string;
        chatbot_color?: string;
        chatbot_model?: string;
        chatbot_msg_lang?: string;
        is_shared?: boolean;
      }) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.createAgent(data);
          const newAgent = response.data;
          
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
          throw error;
        }
      },

      selectAgent: (agent: Agent) => {
        set({ currentAgent: agent });
      },

      setAgents: (agents: Agent[]) => {
        set({ 
          agents,
          // Update current agent if it's no longer in the list
          currentAgent: (() => {
            const current = get().currentAgent;
            if (!current) return agents.length > 0 ? agents[0] : null;
            
            const stillExists = agents.find(a => a.id === current.id);
            return stillExists || (agents.length > 0 ? agents[0] : null);
          })()
        });
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