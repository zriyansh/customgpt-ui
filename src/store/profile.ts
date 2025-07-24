import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { UserProfileStore, UserProfile } from '@/types';

// CustomGPT.ai API Response format
interface CustomGPTResponse<T> {
  status: 'success' | 'error';
  data: T;
}

export const useProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      // Initial State
      profile: null,
      loading: false,
      error: null,

      // Profile Management - GET /api/v1/user
      fetchProfile: async () => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          const response = await client.get<CustomGPTResponse<UserProfile>>('/user');
          
          if (response.status === 'success') {
            set({ 
              profile: response.data,
              loading: false 
            });
          } else {
            throw new Error('Failed to fetch profile');
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          set({ 
            error: `Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
            loading: false 
          });
          toast.error('Failed to load profile');
        }
      },

      // Profile Update - POST /api/v1/user (multipart/form-data)
      updateProfile: async (name: string, profilePhoto?: File) => {
        set({ loading: true, error: null });
        
        try {
          const client = getClient();
          
          // Create FormData for multipart request
          const formData = new FormData();
          formData.append('name', name);
          
          if (profilePhoto) {
            formData.append('profile_photo', profilePhoto);
          }
          
          const response = await client.post<CustomGPTResponse<UserProfile>>('/user', formData);
          
          if (response.status === 'success') {
            set({ 
              profile: response.data,
              loading: false 
            });
            toast.success('Profile updated successfully');
          } else {
            throw new Error('Failed to update profile');
          }
        } catch (error) {
          console.error('Failed to update profile:', error);
          set({ 
            error: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
            loading: false 
          });
          toast.error('Failed to update profile');
        }
      },

      // Utility
      reset: () => {
        set({
          profile: null,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: 'profile-store',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);