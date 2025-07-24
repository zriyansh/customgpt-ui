'use client';

import React, { useEffect, useState } from 'react';
import { Save, Plus, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useProjectSettingsStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types';

interface GeneralSettingsProps {
  project: Agent;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ project }) => {
  const { 
    settings, 
    settingsLoading, 
    settingsError, 
    fetchSettings, 
    updateSettings 
  } = useProjectSettingsStore();

  const [formData, setFormData] = useState({
    default_prompt: '',
    example_questions: [''],
    response_source: 'own_content' as 'default' | 'own_content' | 'openai_content',
    chatbot_msg_lang: 'en',
  });

  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    fetchSettings(project.id);
  }, [project.id]);

  useEffect(() => {
    if (settings) {
      setFormData({
        default_prompt: settings.default_prompt || '',
        example_questions: settings.example_questions?.length ? settings.example_questions : [''],
        response_source: settings.response_source || 'own_content',
        chatbot_msg_lang: settings.chatbot_msg_lang || 'en',
      });
      setIsModified(false);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  const handleExampleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...formData.example_questions];
    newQuestions[index] = value;
    handleInputChange('example_questions', newQuestions);
  };

  const addExampleQuestion = () => {
    handleInputChange('example_questions', [...formData.example_questions, '']);
  };

  const removeExampleQuestion = (index: number) => {
    if (formData.example_questions.length > 1) {
      const newQuestions = formData.example_questions.filter((_, i) => i !== index);
      handleInputChange('example_questions', newQuestions);
    }
  };

  const handleSave = async () => {
    try {
      // Filter out empty example questions
      const filteredQuestions = formData.example_questions.filter(q => q.trim() !== '');
      
      await updateSettings(project.id, {
        ...formData,
        example_questions: filteredQuestions,
      });
      
      setIsModified(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleRefresh = () => {
    fetchSettings(project.id);
    setIsModified(false);
  };

  const responseSourceOptions = [
    { value: 'own_content', label: 'My Content Only', description: 'Agent uses only your uploaded content' },
    { value: 'openai_content', label: 'My Content + ChatGPT', description: 'Agent can use your content and ChatGPT knowledge' },
    { value: 'default', label: 'Default', description: 'Use default response source setting' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
          <p className="text-gray-600 mt-1">
            Configure basic project information and behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={settingsLoading}
            size="sm"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', settingsLoading && 'animate-spin')} />
            Refresh
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!isModified || settingsLoading}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {settingsLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {settingsError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading settings</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{settingsError}</p>
        </div>
      )}

      {/* Loading State */}
      {settingsLoading && !settings ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-10 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                GET /projects/{project.id}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={project.project_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Project name cannot be changed from settings
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project ID
                </label>
                <input
                  type="text"
                  value={project.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </Card>

          {/* Default Prompt */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Default Prompt</h3>
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                POST /projects/{project.id}/settings
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <textarea
                value={formData.default_prompt}
                onChange={(e) => handleInputChange('default_prompt', e.target.value)}
                placeholder="How can I help you?"
                rows={3}
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message is shown to users when they start a conversation ({formData.default_prompt.length}/255)
              </p>
            </div>
          </Card>

          {/* Example Questions */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Example Questions</h3>
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                POST /projects/{project.id}/settings
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              These questions help guide users on what they can ask your agent
            </p>
            
            <div className="space-y-3">
              {formData.example_questions.map((question, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => handleExampleQuestionChange(index, e.target.value)}
                    placeholder="Enter an example question..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  
                  {formData.example_questions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeExampleQuestion(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addExampleQuestion}
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Example Question
              </Button>
            </div>
          </Card>

          {/* Response Source */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Response Source</h3>
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                POST /projects/{project.id}/settings
              </span>
            </div>
            
            <div className="space-y-3">
              {responseSourceOptions.map((option) => (
                <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="response_source"
                    value={option.value}
                    checked={formData.response_source === option.value}
                    onChange={(e) => handleInputChange('response_source', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Language */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Language Settings</h3>
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                POST /projects/{project.id}/settings
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interface Language
              </label>
              <select
                value={formData.chatbot_msg_lang}
                onChange={(e) => handleInputChange('chatbot_msg_lang', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This controls the language of system messages, not the AI responses
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};