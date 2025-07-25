'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Camera, 
  RefreshCw, 
  AlertCircle,
  Calendar,
  Mail,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

import { useProfileStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn, formatTimestamp } from '@/lib/utils';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { 
    profile, 
    loading, 
    error,
    fetchProfile,
    updateProfile
  } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile && !isEditing) {
      setEditName(profile.name);
    }
  }, [profile, isEditing]);

  const handleEdit = () => {
    if (profile) {
      setEditName(profile.name);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (profile) {
      setEditName(profile.name);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await updateProfile(editName.trim(), selectedFile || undefined);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const getDisplayAvatar = () => {
    if (previewUrl) return previewUrl;
    if (profile?.profile_photo_url) return profile.profile_photo_url;
    return null;
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          
          <Button
            variant="outline"
            onClick={fetchProfile}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-yellow-700 mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !profile ? (
          <Card className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-40" />
                </div>
              </div>
            </div>
          </Card>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-8">
              <div className="flex justify-end mb-4">
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                  GET /user
                </span>
              </div>
              <div className="flex items-start gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                    {getDisplayAvatar() ? (
                      <img
                        src={getDisplayAvatar()!}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-3xl font-semibold">
                        {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <>
                      <button
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors shadow-lg"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="space-y-6">
                    {/* Name Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{profile.name}</p>
                      )}
                    </div>

                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{profile.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">User ID</p>
                            <p className="font-medium text-gray-900 font-mono">{profile.id}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Team ID</p>
                            <p className="font-medium text-gray-900 font-mono">{profile.current_team_id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Member Since</p>
                            <p className="font-medium text-gray-900">{formatTimestamp(profile.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={loading || !editName.trim()}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded ml-2">
                            POST /user
                          </span>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleEdit}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Details */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                  GET /user
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Created
                  </label>
                  <p className="text-gray-900">{formatTimestamp(profile.created_at)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Updated
                  </label>
                  <p className="text-gray-900">{formatTimestamp(profile.updated_at)}</p>
                </div>
              </div>
            </Card>

            {/* API Information */}
            <Card className="p-6 bg-gray-50 border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Available Profile Operations
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fetch profile data:</span>
                  <code className="bg-white px-2 py-1 rounded border border-gray-200 text-xs font-mono text-gray-700">GET /user</code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Update profile (name & photo):</span>
                  <code className="bg-white px-2 py-1 rounded border border-gray-200 text-xs font-mono text-gray-700">POST /user</code>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="text-blue-800">
                  <strong>Note:</strong> This profile section only includes features supported by the CustomGPT API. 
                  You can update your name and profile photo. Email and other account settings are managed through the CustomGPT platform.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Profile Data
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to load profile information from the CustomGPT API
            </p>
            <Button onClick={fetchProfile} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
              Try Again
            </Button>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}