'use client';

import React, { useState } from 'react';
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
  Info
} from 'lucide-react';

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
}> = ({ label, description, required, children }) => (
  <div className="space-y-2">
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
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Settings state based on API schema
  const [settings, setSettings] = useState({
    // General
    project_name: agentName,
    is_shared: false,
    
    // Appearance
    chatbot_color: '#007acc',
    chatbot_toolbar_color: '#ffffff',
    chat_bot_avatar: null as File | null,
    chat_bot_bg: null as File | null,
    
    // Messages & Behavior
    default_prompt: 'Hello! How can I help you today?',
    example_questions: ['What can you help me with?', 'Tell me about your services'],
    persona_instructions: '',
    response_source: 'default' as 'default' | 'own_content' | 'openai_content',
    chatbot_model: 'gpt-3.5-turbo',
    chatbot_msg_lang: 'en',
    
    // Messages
    hang_in_there_msg: 'Please wait while I process your request...',
    chatbot_siesta_msg: 'I\'m currently offline. Please try again later.',
    no_answer_message: 'I couldn\'t find an answer to your question.',
    ending_message: 'Thank you for using our service!',
    
    // Citations
    enable_citations: true,
    citations_view_type: 'user' as 'user' | 'show' | 'hide',
    citations_answer_source_label_msg: 'Sources:',
    citations_sources_label_msg: 'References:',
    
    // Features
    enable_feedbacks: true,
    is_loading_indicator_enabled: true,
    remove_branding: false,
    enable_recaptcha_for_public_chatbots: false,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: MessageSquare },
    { id: 'messages', label: 'Messages', icon: Globe },
    { id: 'features', label: 'Features', icon: Shield },
    { id: 'embed', label: 'Embed Code', icon: Code },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      console.log('Saving settings for agent:', agentId, settings);
      // API call would go here
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    // Reset to original values
    setHasUnsavedChanges(false);
  };

  const renderGeneralTab = () => (
    <TabContent>
      <FormGroup label="Agent Name" required>
        <input
          type="text"
          value={settings.project_name}
          onChange={(e) => handleSettingChange('project_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Enter agent name"
        />
      </FormGroup>

      <FormGroup 
        label="Public Access" 
        description="Allow public access to this agent without authentication"
      >
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.is_shared}
            onChange={(e) => handleSettingChange('is_shared', e.target.checked)}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700">Make this agent publicly accessible</span>
        </label>
      </FormGroup>

      <FormGroup label="AI Model">
        <select
          value={settings.chatbot_model}
          onChange={(e) => handleSettingChange('chatbot_model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
        </select>
      </FormGroup>

      <FormGroup label="Response Language">
        <LanguageSelector
          value={settings.chatbot_msg_lang}
          onChange={(value) => handleSettingChange('chatbot_msg_lang', value)}
        />
      </FormGroup>
    </TabContent>
  );

  const renderAppearanceTab = () => (
    <TabContent>
      <FormGroup 
        label="Primary Color" 
        description="Main color used for buttons and highlights"
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
        label="Chat Avatar" 
        description="Upload a custom avatar image for your agent"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
            {settings.chat_bot_avatar ? (
              <img 
                src={URL.createObjectURL(settings.chat_bot_avatar)} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
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
                  if (file) handleSettingChange('chat_bot_avatar', file);
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

      <FormGroup 
        label="Background Image" 
        description="Optional background image for the chat window"
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {settings.chat_bot_bg ? (
            <div className="relative">
              <img 
                src={URL.createObjectURL(settings.chat_bot_bg)} 
                alt="Background" 
                className="max-w-full h-32 object-cover rounded mx-auto"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSettingChange('chat_bot_bg', null)}
                className="mt-2"
              >
                Remove
              </Button>
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
                    if (file) handleSettingChange('chat_bot_bg', file);
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
    </TabContent>
  );

  const renderBehaviorTab = () => (
    <TabContent>
      <FormGroup 
        label="Default Greeting" 
        description="First message users see when starting a conversation"
      >
        <textarea
          value={settings.default_prompt}
          onChange={(e) => handleSettingChange('default_prompt', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Hello! How can I help you today?"
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
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              handleSettingChange('example_questions', [...settings.example_questions, '']);
            }}
          >
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
          placeholder="You are a helpful customer service representative..."
        />
      </FormGroup>

      <FormGroup label="Response Source">
        <select
          value={settings.response_source}
          onChange={(e) => handleSettingChange('response_source', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="default">Default (Recommended)</option>
          <option value="own_content">Own Content Only</option>
          <option value="openai_content">OpenAI Content</option>
        </select>
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
        />
      </FormGroup>

      <FormGroup 
        label="Offline Message" 
        description="Message shown when the agent is unavailable"
      >
        <input
          type="text"
          value={settings.chatbot_siesta_msg}
          onChange={(e) => handleSettingChange('chatbot_siesta_msg', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </FormGroup>

      <FormGroup 
        label="No Answer Message" 
        description="Message shown when the agent cannot answer"
      >
        <input
          type="text"
          value={settings.no_answer_message}
          onChange={(e) => handleSettingChange('no_answer_message', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
        />
      </FormGroup>

      <FormGroup label="Citations">
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enable_citations}
              onChange={(e) => handleSettingChange('enable_citations', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Enable citations in responses</span>
          </label>

          {settings.enable_citations && (
            <div className="ml-6 space-y-3">
              <FormGroup label="Citation Display">
                <select
                  value={settings.citations_view_type}
                  onChange={(e) => handleSettingChange('citations_view_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="user">Show to users</option>
                  <option value="show">Always show</option>
                  <option value="hide">Always hide</option>
                </select>
              </FormGroup>

              <FormGroup label="Sources Label">
                <input
                  type="text"
                  value={settings.citations_sources_label_msg}
                  onChange={(e) => handleSettingChange('citations_sources_label_msg', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </FormGroup>
            </div>
          )}
        </div>
      </FormGroup>
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
          description="Hide 'Powered by CustomGPT' branding (Pro feature)"
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
      </div>
    </TabContent>
  );

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
      case 'general':
        return renderGeneralTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'behavior':
        return renderBehaviorTab();
      case 'messages':
        return renderMessagesTab();
      case 'features':
        return renderFeaturesTab();
      case 'embed':
        return renderEmbedTab();
      default:
        return renderGeneralTab();
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