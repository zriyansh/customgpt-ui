/**
 * Settings Page
 * 
 * Application settings management interface for CustomGPT UI.
 * Handles API key configuration and API endpoint settings.
 * 
 * Features:
 * - API key management (add/update/remove)
 * - API key validation
 * - Secure key display with masking
 * - Copy to clipboard functionality
 * - API endpoint configuration
 * - Security best practices display
 * - Loading states
 * - Error handling
 * 
 * API Key Management:
 * - Format validation (numbers|alphanumeric)
 * - Live validation against API
 * - Secure storage in browser
 * - Masked display with toggle
 * - Copy functionality
 * - Remove with confirmation
 * 
 * Security Features:
 * - Password input for key entry
 * - Key masking (shows partial)
 * - Clipboard copy with feedback
 * - Secure local storage
 * - No server transmission
 * 
 * State Management:
 * - Uses configStore for API settings
 * - Uses agentStore for validation
 * - Local state for UI interactions
 * 
 * Error Handling:
 * - Invalid format detection
 * - Network error recovery
 * - Previous key restoration
 * - User feedback via toasts
 * 
 * Customization for contributors:
 * - Add API key rotation
 * - Implement key expiration
 * - Add multiple key support
 * - Create API usage statistics
 * - Add request logging toggle
 * - Implement proxy settings
 * - Add timeout configuration
 * - Create backup/restore settings
 */

'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Save, 
  X, 
  RefreshCw, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Settings,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

import { useConfigStore, useAgentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn, isValidApiKey } from '@/lib/utils';

/**
 * Settings Page Component
 * 
 * Main settings interface for managing API configuration
 * and application preferences.
 */
export default function SettingsPage() {
  // Local state for UI interactions
  const [isEditing, setIsEditing] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store hooks
  const { apiKey, setApiKey, baseURL, setBaseURL } = useConfigStore();
  const { fetchAgents } = useAgentStore();

  /**
   * Update API key handler
   * 
   * Validates and saves a new API key with live verification
   * against the CustomGPT API by attempting to fetch agents.
   */
  const handleUpdateApiKey = async () => {
    // Check if key is provided
    if (!newApiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    // Validate key format (numbers|alphanumeric)
    if (!isValidApiKey(newApiKey)) {
      toast.error('Invalid API key format. Expected format: numbers|alphanumeric (e.g., 1234|abcd...)');
      return;
    }

    setIsLoading(true);

    try {
      // Set the new API key in store
      setApiKey(newApiKey);
      
      // Test the API key by fetching agents
      await fetchAgents();
      
      // Success - key is valid
      toast.success('API key updated successfully!');
      setIsEditing(false);
      setNewApiKey('');
    } catch (error) {
      console.error('Failed to validate API key:', error);
      toast.error('Invalid API key or network error');
      // Restore the previous key if the new one failed
      if (apiKey) {
        setApiKey(apiKey);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove API key handler
   * 
   * Removes the stored API key after user confirmation.
   * Clears all related state.
   */
  const handleRemoveApiKey = () => {
    if (confirm('Are you sure you want to remove your API key? You will need to re-enter it to use the application.')) {
      setApiKey('');
      toast.success('API key removed successfully');
      // Clear the editing state
      setIsEditing(false);
      setNewApiKey('');
    }
  };

  /**
   * Copy API key to clipboard
   * 
   * Securely copies the API key to clipboard with
   * visual feedback and automatic reset.
   */
  const handleCopyApiKey = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        toast.success('API key copied to clipboard');
        // Reset copy state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy API key');
      }
    }
  };

  /**
   * Mask API key for secure display
   * 
   * Shows only first 2 digits and last 4 characters
   * of the API key for security while allowing verification.
   * 
   * @param key - Full API key
   * @returns Masked version of the key
   */
  const maskApiKey = (key: string) => {
    if (!key) return '';
    const parts = key.split('|');
    if (parts.length !== 2) return key;
    
    const numberPart = parts[0];
    const alphaPart = parts[1];
    
    // Show first 2 digits and last 4 characters
    const maskedNumber = numberPart.substring(0, 2) + '••••';
    const maskedAlpha = '••••' + alphaPart.substring(alphaPart.length - 4);
    
    return `${maskedNumber}|${maskedAlpha}`;
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your application settings</p>
          </div>
          
          <Settings className="w-8 h-8 text-gray-400" />
        </div>

        {/* API Key Management Section */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-brand-600" />
                API Key Management
              </h2>
              <p className="text-gray-600 mt-1">
                Your CustomGPT API key is used to authenticate all requests
              </p>
            </div>
          </div>

          {apiKey ? (
            <div className="space-y-6">
              {/* Current API Key Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current API Key
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={showApiKey ? apiKey : maskApiKey(apiKey)}
                      readOnly
                      className="w-full px-4 py-2 pr-24 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                      aria-label="API key display"
                    />
                    {/* Action buttons for key visibility and copy */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title={showApiKey ? 'Hide API key' : 'Show API key'}
                        aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy API key"
                        aria-label="Copy API key to clipboard"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit API Key Form */}
              {isEditing ? (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New API Key
                    </label>
                    <input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter new API key (e.g., 1234|abcd...)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      disabled={isLoading}
                      aria-label="New API key input"
                    />
                  </div>
                  
                  {/* Form action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setNewApiKey('');
                      }}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateApiKey}
                      disabled={isLoading || !newApiKey.trim()}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Validating...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update API Key
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // API key action buttons
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Change API Key
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemoveApiKey}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove API Key
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Empty state - no API key configured
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No API Key Found
              </h3>
              <p className="text-gray-600 mb-4">
                You need to set up an API key to use the application
              </p>
              <Button
                onClick={() => setIsEditing(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Add API Key
              </Button>
              
              {/* Add API key form */}
              {isEditing && (
                <div className="mt-6 space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter your API key (e.g., 1234|abcd...)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      disabled={isLoading}
                      aria-label="API key input"
                    />
                  </div>
                  
                  {/* Form action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setNewApiKey('');
                      }}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateApiKey}
                      disabled={isLoading || !newApiKey.trim()}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Validating...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save API Key
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* API Configuration Section */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            API Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="url"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                placeholder="https://app.customgpt.ai/api/v1"
                aria-label="API base URL"
              />
              <p className="text-xs text-gray-500 mt-1">
                The base URL for all API requests. Only change this if you're using a custom endpoint.
              </p>
            </div>
          </div>
        </Card>

        {/* Security Information */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                API Key Security
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your API key is stored locally in your browser</li>
                <li>• Never share your API key with others</li>
                <li>• Regenerate your key periodically for security</li>
                <li>• The key is required for all API operations</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}