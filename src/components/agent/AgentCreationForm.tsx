'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot,
  Globe,
  Upload,
  FileText,
  Link,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAgentStore } from '@/store/agents';

interface AgentCreationFormProps {
  onAgentCreated: (agent: any) => void;
  onCancel?: () => void;
}

interface FormData {
  project_name: string;
  description: string;
  sitemap_path: string;
  urls: string[];
  files: File[];
  default_prompt: string;
  example_questions: string[];
  persona_instructions: string;
  chatbot_color: string;
  chatbot_model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
  chatbot_msg_lang: string;
  is_shared: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  project_name: '',
  description: '',
  sitemap_path: '',
  urls: [''],
  files: [],
  default_prompt: 'Hello! How can I help you today?',
  example_questions: ['What can you help me with?', 'Tell me about your services'],
  persona_instructions: '',
  chatbot_color: '#007acc',
  chatbot_model: 'gpt-3.5-turbo',
  chatbot_msg_lang: 'en',
  is_shared: false,
};

const SETUP_STEPS = [
  { id: 'basic', label: 'Basic Info', icon: Bot },
  { id: 'data', label: 'Data Sources', icon: Globe },
  { id: 'personality', label: 'Personality', icon: Sparkles },
  { id: 'review', label: 'Review & Create', icon: CheckCircle },
];

export const AgentCreationForm: React.FC<AgentCreationFormProps> = ({
  onAgentCreated,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { createAgent } = useAgentStore();

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.urls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, urls: newUrls }));
  };

  const addUrl = () => {
    setFormData(prev => ({ ...prev, urls: [...prev.urls, ''] }));
  };

  const removeUrl = (index: number) => {
    if (formData.urls.length > 1) {
      setFormData(prev => ({ 
        ...prev, 
        urls: prev.urls.filter((_, i) => i !== index) 
      }));
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...formData.example_questions];
    newQuestions[index] = value;
    setFormData(prev => ({ ...prev, example_questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({ 
      ...prev, 
      example_questions: [...prev.example_questions, ''] 
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.example_questions.length > 1) {
      setFormData(prev => ({ 
        ...prev, 
        example_questions: prev.example_questions.filter((_, i) => i !== index) 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      files: prev.files.filter((_, i) => i !== index) 
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        return formData.project_name.trim().length > 0;
      case 1: // Data Sources
        return formData.sitemap_path.trim().length > 0 || 
               formData.urls.some(url => url.trim().length > 0) ||
               formData.files.length > 0;
      case 2: // Personality
        return formData.default_prompt.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, SETUP_STEPS.length - 1));
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const agentData = {
        project_name: formData.project_name,
        sitemap_path: formData.sitemap_path || undefined,
        default_prompt: formData.default_prompt,
        example_questions: formData.example_questions.filter(q => q.trim()),
        persona_instructions: formData.persona_instructions || undefined,
        chatbot_color: formData.chatbot_color,
        chatbot_model: formData.chatbot_model,
        chatbot_msg_lang: formData.chatbot_msg_lang,
        is_shared: formData.is_shared,
      };

      console.log('Creating agent with data:', agentData);
      const newAgent = await createAgent(agentData);
      console.log('Agent creation response:', newAgent);
      onAgentCreated(newAgent);
    } catch (err) {
      console.error('Agent creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Agent Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.project_name}
          onChange={(e) => handleInputChange('project_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="e.g., Customer Support Bot, Sales Assistant"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Describe what this agent will help with..."
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_shared"
          checked={formData.is_shared}
          onChange={(e) => handleInputChange('is_shared', e.target.checked)}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="is_shared" className="text-sm text-gray-700">
          Make this agent publicly accessible
        </label>
      </div>
    </div>
  );

  const renderDataSourcesStep = () => (
    <div className="space-y-6">
      {/* Sitemap */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Website Sitemap URL
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="url"
            value={formData.sitemap_path}
            onChange={(e) => handleInputChange('sitemap_path', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="https://example.com/sitemap.xml"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          The agent will crawl and learn from your website
        </p>
      </div>

      {/* Manual URLs */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Or Add Specific URLs
        </label>
        <div className="space-y-2">
          {formData.urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="https://example.com/page"
                />
              </div>
              {formData.urls.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeUrl(index)}
                  className="h-10 w-10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addUrl} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another URL
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Upload Documents
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Upload PDF, DOC, TXT files for your agent to learn from
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 h-10 py-2 px-4">
              Choose Files
            </span>
          </label>
        </div>
        
        {formData.files.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalityStep = () => (
    <div className="space-y-6">
      {/* Default Greeting */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Default Greeting <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.default_prompt}
          onChange={(e) => handleInputChange('default_prompt', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Hello! How can I help you today?"
        />
      </div>

      {/* Example Questions */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Example Questions
        </label>
        <div className="space-y-2">
          {formData.example_questions.map((question, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter a question users might ask"
              />
              {formData.example_questions.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeQuestion(index)}
                  className="h-10 w-10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Question
          </Button>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Persona Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Persona Instructions
              </label>
              <textarea
                value={formData.persona_instructions}
                onChange={(e) => handleInputChange('persona_instructions', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="You are a helpful customer service representative. Always be polite and professional..."
              />
            </div>

            {/* AI Model */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                AI Model
              </label>
              <select
                value={formData.chatbot_model}
                onChange={(e) => handleInputChange('chatbot_model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Cost-effective)</option>
                <option value="gpt-4">GPT-4 (Most Capable)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo (Fast & Capable)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Response Language
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
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.chatbot_color}
                  onChange={(e) => handleInputChange('chatbot_color', e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.chatbot_color}
                  onChange={(e) => handleInputChange('chatbot_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Review Your Agent</h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Name:</span>
            <p className="text-gray-900">{formData.project_name}</p>
          </div>
          
          {formData.description && (
            <div>
              <span className="text-sm font-medium text-gray-600">Description:</span>
              <p className="text-gray-900">{formData.description}</p>
            </div>
          )}
          
          <div>
            <span className="text-sm font-medium text-gray-600">Data Sources:</span>
            <div className="text-gray-900">
              {formData.sitemap_path && <p>• Sitemap: {formData.sitemap_path}</p>}
              {formData.urls.filter(url => url.trim()).map((url, index) => (
                <p key={index}>• URL: {url}</p>
              ))}
              {formData.files.length > 0 && (
                <p>• {formData.files.length} uploaded file{formData.files.length > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Greeting:</span>
            <p className="text-gray-900">"{formData.default_prompt}"</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">AI Model:</span>
            <p className="text-gray-900">{formData.chatbot_model}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Access:</span>
            <p className="text-gray-900">{formData.is_shared ? 'Public' : 'Private'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Ready to Create</p>
            <p className="text-sm text-blue-700">
              Your agent will be created and you can start chatting with it immediately. 
              You can always modify these settings later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const currentStepData = SETUP_STEPS[currentStep];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {SETUP_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                  isActive && 'border-brand-500 bg-brand-50 text-brand-600',
                  isCompleted && 'border-green-500 bg-green-50 text-green-600',
                  !isActive && !isCompleted && 'border-gray-300 text-gray-400'
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    isActive && 'text-brand-600',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-gray-500'
                  )}>
                    {step.label}
                  </p>
                </div>
                {index < SETUP_STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px mx-4',
                    isCompleted ? 'bg-green-200' : 'bg-gray-200'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentStepData.label}
          </h2>
          <p className="text-gray-600">
            {currentStep === 0 && "Let's start with basic information about your agent"}
            {currentStep === 1 && "Add data sources for your agent to learn from"}
            {currentStep === 2 && "Configure how your agent communicates"}
            {currentStep === 3 && "Review and create your agent"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          {currentStep === 0 && renderBasicInfoStep()}
          {currentStep === 1 && renderDataSourcesStep()}
          {currentStep === 2 && renderPersonalityStep()}
          {currentStep === 3 && renderReviewStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            
            {currentStep < SETUP_STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};