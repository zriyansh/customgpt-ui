import { create } from 'zustand';
import { getClient } from '@/lib/api/client';
import { toast } from 'sonner';

export interface Page {
  id: string;
  project_id: number;
  title: string;
  content: string;
  url?: string;
  metadata?: {
    description?: string;
    keywords?: string[];
    author?: string;
    lastModified?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  status: 'active' | 'draft' | 'archived';
  word_count?: number;
}

interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filter: {
    status?: 'active' | 'draft' | 'archived' | 'all';
    sortBy?: 'title' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
  };
  
  // Actions
  fetchPages: (projectId: number) => Promise<void>;
  fetchPage: (projectId: number, pageId: string) => Promise<void>;
  createPage: (projectId: number, page: Partial<Page>) => Promise<Page>;
  updatePage: (projectId: number, pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (projectId: number, pageId: string) => Promise<void>;
  updateMetadata: (projectId: number, pageId: string, metadata: Record<string, any>) => Promise<void>;
  reindexPages: (projectId: number) => Promise<void>;
  
  // UI State
  setSearchQuery: (query: string) => void;
  setFilter: (filter: Partial<PagesState['filter']>) => void;
  selectPage: (page: Page | null) => void;
  reset: () => void;
}

export const usePageStore = create<PagesState>((set, get) => ({
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
  searchQuery: '',
  filter: {
    status: 'all',
    sortBy: 'updated_at',
    sortOrder: 'desc',
  },

  fetchPages: async (projectId: number) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      const response = await client.getPages(projectId);
      
      const pages = Array.isArray(response.data) ? response.data : [];
      set({ pages, loading: false });
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch pages',
        loading: false,
      });
      toast.error('Failed to load pages');
    }
  },

  fetchPage: async (projectId: number, pageId: string) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      const response = await client.getPage(projectId, pageId);
      
      const page = response.data;
      set({ currentPage: page, loading: false });
      
      // Update in the list as well
      set(state => ({
        pages: state.pages.map(p => p.id === pageId ? page : p),
      }));
    } catch (error) {
      console.error('Failed to fetch page:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch page',
        loading: false,
      });
      toast.error('Failed to load page details');
    }
  },

  createPage: async (projectId: number, pageData: Partial<Page>) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      const response = await client.createPage(projectId, {
        title: pageData.title || 'Untitled Page',
        content: pageData.content || '',
        metadata: pageData.metadata || {},
        status: pageData.status || 'draft',
      });
      
      const newPage = response.data;
      set(state => ({
        pages: [newPage, ...state.pages],
        currentPage: newPage,
        loading: false,
      }));
      
      toast.success('Page created successfully');
      return newPage;
    } catch (error) {
      console.error('Failed to create page:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create page',
        loading: false,
      });
      toast.error('Failed to create page');
      throw error;
    }
  },

  updatePage: async (projectId: number, pageId: string, updates: Partial<Page>) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      await client.updatePage(projectId, pageId, updates);
      
      set(state => ({
        pages: state.pages.map(page => 
          page.id === pageId ? { ...page, ...updates, updated_at: new Date().toISOString() } : page
        ),
        currentPage: state.currentPage?.id === pageId 
          ? { ...state.currentPage, ...updates, updated_at: new Date().toISOString() }
          : state.currentPage,
        loading: false,
      }));
      
      toast.success('Page updated successfully');
    } catch (error) {
      console.error('Failed to update page:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update page',
        loading: false,
      });
      toast.error('Failed to update page');
      throw error;
    }
  },

  deletePage: async (projectId: number, pageId: string) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      await client.deletePage(projectId, pageId);
      
      set(state => ({
        pages: state.pages.filter(page => page.id !== pageId),
        currentPage: state.currentPage?.id === pageId ? null : state.currentPage,
        loading: false,
      }));
      
      toast.success('Page deleted successfully');
    } catch (error) {
      console.error('Failed to delete page:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete page',
        loading: false,
      });
      toast.error('Failed to delete page');
      throw error;
    }
  },

  updateMetadata: async (projectId: number, pageId: string, metadata: Record<string, any>) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      await client.updatePageMetadata(projectId, pageId, metadata);
      
      set(state => ({
        pages: state.pages.map(page => 
          page.id === pageId ? { ...page, metadata: { ...page.metadata, ...metadata } } : page
        ),
        currentPage: state.currentPage?.id === pageId 
          ? { ...state.currentPage, metadata: { ...state.currentPage.metadata, ...metadata } }
          : state.currentPage,
        loading: false,
      }));
      
      toast.success('Metadata updated successfully');
    } catch (error) {
      console.error('Failed to update metadata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update metadata',
        loading: false,
      });
      toast.error('Failed to update metadata');
      throw error;
    }
  },

  reindexPages: async (projectId: number) => {
    set({ loading: true, error: null });
    
    try {
      const client = getClient();
      await client.reindexProject(projectId);
      
      set({ loading: false });
      toast.success('Reindexing started. This may take a few minutes.');
    } catch (error) {
      console.error('Failed to reindex pages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reindex pages',
        loading: false,
      });
      toast.error('Failed to start reindexing');
      throw error;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setFilter: (filter: Partial<PagesState['filter']>) => {
    set(state => ({
      filter: { ...state.filter, ...filter },
    }));
  },

  selectPage: (page: Page | null) => {
    set({ currentPage: page });
  },

  reset: () => {
    set({
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
      searchQuery: '',
      filter: {
        status: 'all',
        sortBy: 'updated_at',
        sortOrder: 'desc',
      },
    });
  },
}));