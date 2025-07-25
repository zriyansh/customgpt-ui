'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Palette,
  MessageSquare,
  Globe,
  Shield,
  Code,
  Save,
  RotateCcw,
  Upload,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  Key,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  FileText,
  Bot,
  Link2,
  Share2,
  Download,
  Clock,
  Hash,
  Type,
  User
} from 'lucide-react';
import { LicenseManager } from '@/components/licenses/LicenseManager';
import { getClient } from '@/lib/api/client';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AgentSettingsProps {
  agentId: number;
  agentName: string;
}

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}

const TabContent: React.FC<TabContentProps> = ({ children, className }) => (
  <div className={cn('space-y-6', className)}>
    {children}
  </div>
);

const FormGroup: React.FC<{
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, description, required, children, className }) => (
  <div className={cn("space-y-2", className)}>
    <label className="block text-sm font-medium text-gray-900">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-sm text-gray-600">{description}</p>
    )}
    {children}
  </div>
);

const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const presets = [
    '#007acc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="#007acc"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

const LanguageSelector: React.FC<{
  value: string;
  onChange: (language: string) => void;
}> = ({ value, onChange }) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export const AgentSettings: React.FC<AgentSettingsProps> = ({ agentId, agentName }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Settings state based on API schema - using exact field names from API
  const [settings, setSettings] = useState({
    // Appearance
    chatbot_avatar: '',
    chatbot_background_type: 'image' as 'image' | 'color',
    chatbot_background: '',
    chatbot_background_color: '#F5F5F5',
    chatbot_color: '#000000',
    chatbot_toolbar_color: '#000000',
    chatbot_title: '',
    chatbot_title_color: '#000000',
    user_avatar: '',
    spotlight_avatar_enabled: false,
    spotlight_avatar: '',
    spotlight_avatar_shape: 'rectangle' as 'rectangle' | 'circle',
    spotlight_avatar_type: 'default' as 'default' | 'custom',
    user_avatar_orientation: 'agent-left-user-right' as 'agent-left-user-right' | 'agent-right-user-left',
    
    // Messages & Behavior
    default_prompt: 'How can I help you?',
    example_questions: ['How do I get started?'],
    persona_instructions: 'You are a custom agent assistant called CustomGPT.ai, a friendly lawyer who answers questions based on the given context.',
    response_source: 'own_content' as 'own_content' | 'openai_content' | 'default',
    chatbot_model: 'gpt-4-o',
    chatbot_msg_lang: 'en',
    input_field_addendum: '',
    
    // Messages
    hang_in_there_msg: 'Hang in there! I\'m thinking..',
    chatbot_siesta_msg: 'Oops! The agent is taking a siesta. We are aware of this and will get it back soon! Please try again later.',
    no_answer_message: 'Sorry, I don\'t have an answer for that.',
    ending_message: 'Please email us for further support',
    try_asking_questions_msg: 'Try asking these questions...',
    view_more_msg: 'View more',
    view_less_msg: 'View less',
    
    // Citations
    enable_citations: 3,
    citations_view_type: 'user' as 'user' | 'show' | 'hide',
    citations_answer_source_label_msg: 'Where did this answer come from?',
    citations_sources_label_msg: 'Sources',
    image_citation_display: 'default' as 'default' | 'inline' | 'none',
    enable_inline_citations_api: false,
    hide_sources_from_responses: true,
    
    // Features
    enable_feedbacks: true,
    is_loading_indicator_enabled: true,
    remove_branding: false,
    private_deployment: false,
    enable_recaptcha_for_public_chatbots: false,
    is_selling_enabled: false,
    license_slug: true,
    selling_url: '',
    can_share_conversation: false,
    can_export_conversation: false,
    conversation_time_window: false,
    conversation_retention_period: 'year' as 'year' | 'month' | 'week' | 'day',
    conversation_retention_days: 180,
    enable_agent_knowledge_base_awareness: true,
    markdown_enabled: true,
  });
  
  // File states for image uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [userAvatarFile, setUserAvatarFile] = useState<File | null>(null);
  const [spotlightAvatarFile, setSpotlightAvatarFile] = useState<File | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [agentId]);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const client = getClient();
      const response = await client.getAgentSettings(agentId);
      
      logger.info('AGENT_SETTINGS', 'Settings fetched', {
        agentId,
        hasData: !!response.data
      });
      
      if (response.data) {
        // Merge API response with default values
        setSettings(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error: any) {
      logger.error('AGENT_SETTINGS', 'Failed to fetch settings', error);
      
      let errorMessage = 'Failed to load agent settings';
      if (error.status === 404) {
        errorMessage = 'Agent not found or you don\'t have access to it';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please check your API key';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: MessageSquare },
    { id: 'messages', label: 'Messages', icon: Globe },
    { id: 'citations', label: 'Citations', icon: FileText },
    { id: 'features', label: 'Features', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Settings },
    ...(settings.license_slug ? [{ id: 'licenses', label: 'Licenses', icon: Key }] : []),
    { id: 'embed', label: 'Embed Code', icon: Code },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      logger.info('AGENT_SETTINGS', 'Saving settings', {
        agentId,
        hasFiles: !!(avatarFile || backgroundFile || userAvatarFile || spotlightAvatarFile)
      });
      
      const client = getClient();
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add all non-file settings
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean' || typeof value === 'number') {
            formData.append(key, value.toString());
          } else if (Array.isArray(value)) {
            // For array fields like example_questions
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            formData.append(key, value as string);
          }
        }
      });
      
      // Add file uploads if present
      if (avatarFile) {
        formData.append('chatbot_avatar', avatarFile);
      }
      if (backgroundFile) {
        formData.append('chatbot_background', backgroundFile);
      }
      if (userAvatarFile) {
        formData.append('user_avatar', userAvatarFile);
      }
      if (spotlightAvatarFile) {
        formData.append('spotlight_avatar', spotlightAvatarFile);
      }
      
      const response = await client.updateAgentSettings(agentId, formData);
      
      logger.info('AGENT_SETTINGS', 'Settings saved successfully', {
        agentId,
        response
      });
      
      toast.success('Settings saved successfully');
      setHasUnsavedChanges(false);
      
      // Clear file states after successful save
      setAvatarFile(null);
      setBackgroundFile(null);
      setUserAvatarFile(null);
      setSpotlightAvatarFile(null);
    } catch (error: any) {
      logger.error('AGENT_SETTINGS', 'Failed to save settings', error);
      
      let errorMessage = 'Failed to save settings';
      if (error.status === 400) {
        if (error.message.includes('valid image')) {
          errorMessage = 'Please upload a valid image file';
        } else {
          errorMessage = error.message;
        }
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please check your API key';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reload settings from API
    fetchSettings();
    setHasUnsavedChanges(false);
    // Clear file states
    setAvatarFile(null);
    setBackgroundFile(null);
    setUserAvatarFile(null);
    setSpotlightAvatarFile(null);
  };

  if (loading && !hasUnsavedChanges) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading agent settings...</p>
        </div>
      </div>
    );
  }
  
  if (error && !hasUnsavedChanges) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Settings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const renderAppearanceTab = () => (
    <TabContent>
      <FormGroup 
        label="Chatbot Primary Color" 
        description="Main color used for the chatbot interface"
      >
        <ColorPicker
          value={settings.chatbot_color}
          onChange={(color) => handleSettingChange('chatbot_color', color)}
          label="Primary Color"
        />
      </FormGroup>

      <FormGroup 
        label="Toolbar Color" 
        description="Background color for the chat header"
      >
        <ColorPicker
          value={settings.chatbot_toolbar_color}
          onChange={(color) => handleSettingChange('chatbot_toolbar_color', color)}
          label="Toolbar Color"
        />
      </FormGroup>
      
      <FormGroup 
        label="Title Bar Color" 
        description="Color for the chatbot title text"
      >
        <ColorPicker
          value={settings.chatbot_title_color}
          onChange={(color) => handleSettingChange('chatbot_title_color', color)}
          label="Title Color"
        />
      </FormGroup>
      
      <FormGroup label="Chatbot Title" description="Optional title displayed in the chat header">
        <input
          type="text"
          value={settings.chatbot_title}
          onChange={(e) => handleSettingChange('chatbot_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Enter chatbot title"
        />
      </FormGroup>

      <FormGroup 
        label="Chatbot Avatar" 
        description="Avatar image for your agent"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
            {avatarFile ? (
              <img 
                src={URL.createObjectURL(avatarFile)} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : settings.chatbot_avatar ? (
              <img 
                src={settings.chatbot_avatar} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Bot className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setHasUnsavedChanges(true);
                  }
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Avatar
            </Button>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
          </div>
        </div>
      </FormGroup>

      <FormGroup label="Background Type">
        <select
          value={settings.chatbot_background_type}
          onChange={(e) => handleSettingChange('chatbot_background_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="image">Image</option>
          <option value="color">Color</option>
        </select>
      </FormGroup>
      
      {settings.chatbot_background_type === 'color' ? (
        <FormGroup 
          label="Background Color" 
          description="Solid color background for the chat window"
        >
          <ColorPicker
            value={settings.chatbot_background_color}
            onChange={(color) => handleSettingChange('chatbot_background_color', color)}
            label="Background Color"
          />
        </FormGroup>
      ) : (
        <FormGroup 
          label="Background Image" 
          description="Background image for the chat window"
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {backgroundFile ? (
              <div className="relative">
                <img 
                  src={URL.createObjectURL(backgroundFile)} 
                  alt="Background" 
                  className="max-w-full h-32 object-cover rounded mx-auto"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBackgroundFile(null);
                    setHasUnsavedChanges(true);
                  }}
                  className="mt-2"
                >
                  Remove
                </Button>
              </div>
            ) : settings.chatbot_background ? (
              <div className="relative">
                <img 
                  src={settings.chatbot_background} 
                  alt="Background" 
                  className="max-w-full h-32 object-cover rounded mx-auto"
                />
                <p className="text-sm text-gray-500 mt-2">Current background</p>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload background image</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setBackgroundFile(file);
                        setHasUnsavedChanges(true);
                      }
                    };
                    input.click();
                  }}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </FormGroup>
      )}
      
      <FormGroup label="User Avatar Orientation">
        <select
          value={settings.user_avatar_orientation}
          onChange={(e) => handleSettingChange('user_avatar_orientation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="agent-left-user-right">Agent Left, User Right</option>
          <option value="agent-right-user-left">Agent Right, User Left</option>
        </select>
      </FormGroup>
    </TabContent>
  );

  const renderBehaviorTab = () => (
    <TabContent>
      <FormGroup 
        label="Default Prompt" 
        description="First message users see when starting a conversation"
      >
        <textarea
          value={settings.default_prompt}
          onChange={(e) => handleSettingChange('default_prompt', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="How can I help you?"
        />
      </FormGroup>

      <FormGroup 
        label="Example Questions" 
        description="Suggested questions to help users get started"
      >
        <div className="space-y-2">
          {settings.example_questions.map((question, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => {
                  const newQuestions = [...settings.example_questions];
                  newQuestions[index] = e.target.value;
                  handleSettingChange('example_questions', newQuestions);
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter a question"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newQuestions = settings.example_questions.filter((_, i) => i !== index);
                  handleSettingChange('example_questions', newQuestions);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              handleSettingChange('example_questions', [...settings.example_questions, '']);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </FormGroup>

      <FormGroup 
        label="Persona Instructions" 
        description="Define how your agent should behave and respond"
      >
        <textarea
          value={settings.persona_instructions}
          onChange={(e) => handleSettingChange('persona_instructions', e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="You are a custom agent assistant..."
        />
      </FormGroup>

      <FormGroup label="Response Source">
        <select
          value={settings.response_source}
          onChange={(e) => handleSettingChange('response_source', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="own_content">Own Content Only</option>
          <option value="openai_content">OpenAI Content</option>
          <option value="default">Default</option>
        </select>
      </FormGroup>
      
      <FormGroup label="AI Model">
        <select
          value={settings.chatbot_model}
          onChange={(e) => handleSettingChange('chatbot_model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="gpt-4-o">GPT-4 Optimized</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
      </FormGroup>
      
      <FormGroup label="Response Language">
        <LanguageSelector
          value={settings.chatbot_msg_lang}
          onChange={(value) => handleSettingChange('chatbot_msg_lang', value)}
        />
      </FormGroup>
      
      <FormGroup 
        label="Input Field Addendum" 
        description="Additional text shown in the input field"
      >
        <input
          type="text"
          value={settings.input_field_addendum}
          onChange={(e) => handleSettingChange('input_field_addendum', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Optional helper text"
        />
      </FormGroup>
    </TabContent>
  );

  const renderMessagesTab = () => (
    <TabContent>
      <FormGroup 
        label="Loading Message" 
        description="Message shown while the agent is processing"
      >
        <input
          type="text"
          value={settings.hang_in_there_msg}
          onChange={(e) => handleSettingChange('hang_in_there_msg', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Hang in there! I'm thinking.."
        />
      </FormGroup>

      <FormGroup 
        label="Offline Message" 
        description="Message shown when the agent is unavailable"
      >
        <textarea
          value={settings.chatbot_siesta_msg}
          onChange={(e) => handleSettingChange('chatbot_siesta_msg', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Oops! The agent is taking a siesta..."
        />
      </FormGroup>

      <FormGroup 
        label="No Answer Message" 
        description="Message shown when the agent cannot find an answer"
      >
        <input
          type="text"
          value={settings.no_answer_message}
          onChange={(e) => handleSettingChange('no_answer_message', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Sorry, I don't have an answer for that."
        />
      </FormGroup>

      <FormGroup 
        label="Ending Message" 
        description="Message shown at the end of conversations"
      >
        <input
          type="text"
          value={settings.ending_message}
          onChange={(e) => handleSettingChange('ending_message', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Please email us for further support"
        />
      </FormGroup>
      
      <FormGroup 
        label="Try Asking Questions Message" 
        description="Label for example questions section"
      >
        <input
          type="text"
          value={settings.try_asking_questions_msg}
          onChange={(e) => handleSettingChange('try_asking_questions_msg', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Try asking these questions..."
        />
      </FormGroup>
      
      <div className="flex gap-4">
        <FormGroup 
          label="View More Message" 
          description="Expand button text"
          className="flex-1"
        >
          <input
            type="text"
            value={settings.view_more_msg}
            onChange={(e) => handleSettingChange('view_more_msg', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="View more"
          />
        </FormGroup>
        
        <FormGroup 
          label="View Less Message" 
          description="Collapse button text"
          className="flex-1"
        >
          <input
            type="text"
            value={settings.view_less_msg}
            onChange={(e) => handleSettingChange('view_less_msg', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="View less"
          />
        </FormGroup>
      </div>
    </TabContent>
  );
  
  const renderCitationsTab = () => (
    <TabContent>
      <FormGroup 
        label="Enable Citations" 
        description="Control how sources are displayed in responses"
      >
        <select
          value={settings.enable_citations.toString()}
          onChange={(e) => handleSettingChange('enable_citations', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="0">Disabled</option>
          <option value="1">Basic Citations</option>
          <option value="2">Detailed Citations</option>
          <option value="3">Full Citations</option>
        </select>
      </FormGroup>

      {settings.enable_citations > 0 && (
        <>
          <FormGroup label="Citation View Type">
            <select
              value={settings.citations_view_type}
              onChange={(e) => handleSettingChange('citations_view_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="user">User Controlled</option>
              <option value="show">Always Show</option>
              <option value="hide">Always Hide</option>
            </select>
          </FormGroup>

          <FormGroup 
            label="Answer Source Label" 
            description="Label for citation sources in answers"
          >
            <input
              type="text"
              value={settings.citations_answer_source_label_msg}
              onChange={(e) => handleSettingChange('citations_answer_source_label_msg', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Where did this answer come from?"
            />
          </FormGroup>

          <FormGroup 
            label="Sources Label" 
            description="Label for sources section"
          >
            <input
              type="text"
              value={settings.citations_sources_label_msg}
              onChange={(e) => handleSettingChange('citations_sources_label_msg', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Sources"
            />
          </FormGroup>
          
          <FormGroup label="Image Citation Display">
            <select
              value={settings.image_citation_display}
              onChange={(e) => handleSettingChange('image_citation_display', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="default">Default</option>
              <option value="inline">Inline</option>
              <option value="none">None</option>
            </select>
          </FormGroup>
          
          <FormGroup 
            label="Hide Sources from Responses" 
            description="Don't show source links in chat responses"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.hide_sources_from_responses}
                onChange={(e) => handleSettingChange('hide_sources_from_responses', e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Hide source links</span>
            </label>
          </FormGroup>
          
          <FormGroup 
            label="Inline Citations API" 
            description="Enable inline citations in API responses"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enable_inline_citations_api}
                onChange={(e) => handleSettingChange('enable_inline_citations_api', e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Enable inline citations for API</span>
            </label>
          </FormGroup>
        </>
      )}
    </TabContent>
  );

  const renderFeaturesTab = () => (
    <TabContent>
      <div className="space-y-6">
        <FormGroup 
          label="User Feedback" 
          description="Allow users to rate responses with thumbs up/down"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enable_feedbacks}
              onChange={(e) => handleSettingChange('enable_feedbacks', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable feedback buttons</span>
          </label>
        </FormGroup>

        <FormGroup 
          label="Loading Indicator" 
          description="Show typing indicator while processing responses"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.is_loading_indicator_enabled}
              onChange={(e) => handleSettingChange('is_loading_indicator_enabled', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Show loading indicator</span>
          </label>
        </FormGroup>

        <FormGroup 
          label="Remove Branding" 
          description="Hide 'Powered by CustomGPT' branding"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.remove_branding}
              onChange={(e) => handleSettingChange('remove_branding', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Remove CustomGPT branding</span>
          </label>
        </FormGroup>
        
        <FormGroup 
          label="Private Deployment" 
          description="Mark this as a private deployment"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.private_deployment}
              onChange={(e) => handleSettingChange('private_deployment', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Private deployment</span>
          </label>
        </FormGroup>

        <FormGroup 
          label="Security" 
          description="Enable reCAPTCHA for public chatbots"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enable_recaptcha_for_public_chatbots}
              onChange={(e) => handleSettingChange('enable_recaptcha_for_public_chatbots', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable reCAPTCHA verification</span>
          </label>
        </FormGroup>
        
        <FormGroup 
          label="Conversation Sharing" 
          description="Allow users to share conversations"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.can_share_conversation}
              onChange={(e) => handleSettingChange('can_share_conversation', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable conversation sharing</span>
          </label>
        </FormGroup>
        
        <FormGroup 
          label="Conversation Export" 
          description="Allow users to export conversations"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.can_export_conversation}
              onChange={(e) => handleSettingChange('can_export_conversation', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable conversation export</span>
          </label>
        </FormGroup>
        
        <FormGroup 
          label="Markdown Support" 
          description="Enable markdown formatting in responses"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.markdown_enabled}
              onChange={(e) => handleSettingChange('markdown_enabled', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable markdown</span>
          </label>
        </FormGroup>
        
        <FormGroup 
          label="Knowledge Base Awareness" 
          description="Enable agent to be aware of its knowledge base"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enable_agent_knowledge_base_awareness}
              onChange={(e) => handleSettingChange('enable_agent_knowledge_base_awareness', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable knowledge base awareness</span>
          </label>
        </FormGroup>
      </div>
    </TabContent>
  );
  
  const renderAdvancedTab = () => (
    <TabContent>
      <div className="space-y-6">
        <FormGroup 
          label="Selling Enabled" 
          description="Enable selling features for this agent"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.is_selling_enabled}
              onChange={(e) => handleSettingChange('is_selling_enabled', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable selling</span>
          </label>
        </FormGroup>
        
        {settings.is_selling_enabled && (
          <FormGroup 
            label="Selling URL" 
            description="URL for selling/payment integration"
          >
            <input
              type="url"
              value={settings.selling_url}
              onChange={(e) => handleSettingChange('selling_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="https://example.com/payment"
            />
          </FormGroup>
        )}
        
        <FormGroup 
          label="License Slug" 
          description="Enable license slug functionality"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.license_slug}
              onChange={(e) => handleSettingChange('license_slug', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable license slug</span>
          </label>
        </FormGroup>
        
        <FormGroup 
          label="Conversation Retention" 
          description="Configure how long conversations are retained"
        >
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.conversation_time_window}
              onChange={(e) => handleSettingChange('conversation_time_window', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable conversation time window</span>
          </label>
          
          {settings.conversation_time_window && (
            <div className="space-y-3 ml-6">
              <FormGroup label="Retention Period">
                <select
                  value={settings.conversation_retention_period}
                  onChange={(e) => handleSettingChange('conversation_retention_period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </FormGroup>
              
              <FormGroup label="Retention Days" description="Number of days to retain conversations">
                <input
                  type="number"
                  value={settings.conversation_retention_days}
                  onChange={(e) => handleSettingChange('conversation_retention_days', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  min="0"
                  max="365"
                />
              </FormGroup>
            </div>
          )}
        </FormGroup>
        
        <FormGroup 
          label="Spotlight Avatar" 
          description="Enable spotlight avatar feature"
        >
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.spotlight_avatar_enabled}
              onChange={(e) => handleSettingChange('spotlight_avatar_enabled', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable spotlight avatar</span>
          </label>
          
          {settings.spotlight_avatar_enabled && (
            <div className="space-y-3 ml-6">
              <FormGroup label="Avatar Shape">
                <select
                  value={settings.spotlight_avatar_shape}
                  onChange={(e) => handleSettingChange('spotlight_avatar_shape', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                </select>
              </FormGroup>
              
              <FormGroup label="Avatar Type">
                <select
                  value={settings.spotlight_avatar_type}
                  onChange={(e) => handleSettingChange('spotlight_avatar_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="custom">Custom</option>
                </select>
              </FormGroup>
              
              <FormGroup label="Spotlight Avatar Image">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                    {spotlightAvatarFile ? (
                      <img 
                        src={URL.createObjectURL(spotlightAvatarFile)} 
                        alt="Spotlight Avatar" 
                        className="w-full h-full rounded object-cover"
                      />
                    ) : settings.spotlight_avatar ? (
                      <img 
                        src={settings.spotlight_avatar} 
                        alt="Spotlight Avatar" 
                        className="w-full h-full rounded object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setSpotlightAvatarFile(file);
                            setHasUnsavedChanges(true);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </FormGroup>
            </div>
          )}
        </FormGroup>
        
        <FormGroup 
          label="User Avatar" 
          description="Upload custom user avatar"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
              {userAvatarFile ? (
                <img 
                  src={URL.createObjectURL(userAvatarFile)} 
                  alt="User Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : settings.user_avatar ? (
                <img 
                  src={settings.user_avatar} 
                  alt="User Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setUserAvatarFile(file);
                      setHasUnsavedChanges(true);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload User Avatar
              </Button>
            </div>
          </div>
        </FormGroup>
      </div>
    </TabContent>
  );

  const renderLicensesTab = () => {
    return (
      <TabContent>
        <div className="h-full">
          <LicenseManager embedded={true} />
        </div>
      </TabContent>
    );
  };

  const renderEmbedTab = () => {
    const embedCode = `<iframe 
  src="https://app.customgpt.ai/embed/${agentId}" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>`;

    const widgetCode = `<script src="https://app.customgpt.ai/widget.js"></script>
<script>
  CustomGPTWidget.init({
    agentId: ${agentId},
    mode: 'floating',
    position: 'bottom-right'
  });
</script>`;

    return (
      <TabContent>
        <div className="space-y-6">
          <FormGroup 
            label="Iframe Embed" 
            description="Embed the chat directly in your website"
          >
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                <code>{embedCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(embedCode)}
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </FormGroup>

          <FormGroup 
            label="Widget Code" 
            description="Add a floating chat widget to your site"
          >
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                <code>{widgetCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(widgetCode)}
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </FormGroup>

          <FormGroup label="Preview">
            <div className="flex gap-4">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Chat
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </FormGroup>
        </div>
      </TabContent>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'behavior':
        return renderBehaviorTab();
      case 'messages':
        return renderMessagesTab();
      case 'citations':
        return renderCitationsTab();
      case 'features':
        return renderFeaturesTab();
      case 'advanced':
        return renderAdvancedTab();
      case 'licenses':
        return renderLicensesTab();
      case 'embed':
        return renderEmbedTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Agent Settings</h1>
            <p className="text-sm text-gray-600 mt-1">{agentName}</p>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};