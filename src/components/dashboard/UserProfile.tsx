'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Settings,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  Key,
  Smartphone,
  Mail,
  AlertCircle,
  CheckCircle,
  Info,
  Crown,
  Zap,
  Calendar,
  Download,
  Copy,
  Lock,
  Users,
  Building
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  className?: string;
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

const PlanCard: React.FC<{
  name: string;
  price: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
}> = ({ name, price, features, isCurrent, isPopular, onSelect }) => (
  <div className={cn(
    'relative bg-white rounded-lg border p-6 hover:shadow-md transition-shadow',
    isCurrent && 'border-brand-500 ring-2 ring-brand-100',
    isPopular && 'border-purple-500 ring-2 ring-purple-100'
  )}>
    {isPopular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Most Popular
        </span>
      </div>
    )}
    
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{price}</div>
      <p className="text-sm text-gray-600">per month</p>
    </div>
    
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
    
    <Button 
      onClick={onSelect}
      variant={isCurrent ? 'outline' : 'default'}
      className="w-full"
      disabled={isCurrent}
    >
      {isCurrent ? 'Current Plan' : 'Select Plan'}
    </Button>
  </div>
);

export const UserProfile: React.FC<UserProfileProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Example Corp',
    role: 'Product Manager',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    language: 'en',
    avatar: null as File | null,
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    dataExportFormat: 'json' as 'json' | 'csv',
    sessionTimeout: 24,
  });

  // Subscription info
  const [subscription] = useState({
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-02-15',
    usage: {
      queries: 7420,
      limit: 10000,
      agents: 12,
      agentLimit: 25,
    },
    paymentMethod: '**** **** **** 1234',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const handleProfileChange = (key: string, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAccountSettingChange = (key: string, value: any) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile:', profile);
      console.log('Saving account settings:', accountSettings);
      // API call would go here
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleReset = () => {
    // Reset to original values
    setHasUnsavedChanges(false);
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleProfileChange('avatar', file);
    };
    input.click();
  };

  const generateApiKey = () => {
    // Generate new API key
    console.log('Generate new API key');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('cgpt_1234567890abcdef');
  };

  const exportData = () => {
    console.log('Export user data');
  };

  const deleteAccount = () => {
    console.log('Delete account');
  };

  const renderProfileTab = () => (
    <TabContent>
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center">
            {profile.avatar ? (
              <img 
                src={URL.createObjectURL(profile.avatar)} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-brand-600" />
            )}
          </div>
          <button
            onClick={handleAvatarUpload}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h3>
          <p className="text-gray-600">{profile.email}</p>
          <p className="text-sm text-gray-500">{profile.company} • {profile.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormGroup label="First Name" required>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => handleProfileChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </FormGroup>

        <FormGroup label="Last Name" required>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => handleProfileChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </FormGroup>

        <FormGroup label="Email Address" required>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </FormGroup>

        <FormGroup label="Phone Number">
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </FormGroup>

        <FormGroup label="Company">
          <input
            type="text"
            value={profile.company}
            onChange={(e) => handleProfileChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </FormGroup>

        <FormGroup label="Role">
          <input
            type="text"
            value={profile.role}
            onChange={(e) => handleProfileChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </FormGroup>

        <FormGroup label="Timezone">
          <select
            value={profile.timezone}
            onChange={(e) => handleProfileChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="America/New_York">Eastern Time (UTC-5)</option>
            <option value="America/Chicago">Central Time (UTC-6)</option>
            <option value="America/Denver">Mountain Time (UTC-7)</option>
            <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Europe/Paris">Paris (UTC+1)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          </select>
        </FormGroup>

        <FormGroup label="Language">
          <select
            value={profile.language}
            onChange={(e) => handleProfileChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>
        </FormGroup>
      </div>
    </TabContent>
  );

  const renderSecurityTab = () => (
    <TabContent>
      {/* API Key Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Key</h3>
        </div>
        <p className="text-gray-600 mb-4">Use this key to authenticate API requests</p>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value="cgpt_1234567890abcdef"
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 font-mono text-sm"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="outline" onClick={copyApiKey}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" onClick={generateApiKey}>
          Generate New Key
        </Button>
      </div>

      {/* Two-Factor Authentication */}
      <FormGroup 
        label="Two-Factor Authentication" 
        description="Add an extra layer of security to your account"
      >
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Authenticator App</p>
              <p className="text-sm text-gray-600">
                {accountSettings.twoFactorEnabled ? 'Enabled' : 'Not configured'}
              </p>
            </div>
          </div>
          <Button 
            variant={accountSettings.twoFactorEnabled ? 'outline' : 'default'}
            size="sm"
          >
            {accountSettings.twoFactorEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </FormGroup>

      {/* Session Management */}
      <FormGroup 
        label="Session Timeout" 
        description="Automatically log out after period of inactivity"
      >
        <select
          value={accountSettings.sessionTimeout}
          onChange={(e) => handleAccountSettingChange('sessionTimeout', Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value={1}>1 hour</option>
          <option value={8}>8 hours</option>
          <option value={24}>24 hours</option>
          <option value={168}>1 week</option>
          <option value={-1}>Never</option>
        </select>
      </FormGroup>

      {/* Data Export */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
        </div>
        <p className="text-gray-600 mb-4">Download your data including conversations, agents, and settings</p>
        
        <div className="flex items-center gap-3">
          <select
            value={accountSettings.dataExportFormat}
            onChange={(e) => handleAccountSettingChange('dataExportFormat', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="json">JSON Format</option>
            <option value="csv">CSV Format</option>
          </select>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
        </div>
        <p className="text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive" onClick={deleteAccount}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </TabContent>
  );

  const renderBillingTab = () => (
    <TabContent>
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{subscription.plan} Plan</h3>
            </div>
            <p className="text-brand-100">Status: {subscription.status}</p>
            <p className="text-brand-100">Next billing: {subscription.nextBilling}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">$49</p>
            <p className="text-brand-100">per month</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Query Usage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">{subscription.usage.queries.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Limit</span>
              <span className="font-medium">{subscription.usage.limit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${(subscription.usage.queries / subscription.usage.limit) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Agents</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">{subscription.usage.agents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Limit</span>
              <span className="font-medium">{subscription.usage.agentLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(subscription.usage.agents / subscription.usage.agentLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          <Button variant="outline" size="sm">Update</Button>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">{subscription.paymentMethod}</p>
            <p className="text-sm text-gray-600">Expires 12/2025</p>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard
            name="Starter"
            price="$19"
            features={[
              '3 AI agents',
              '1,000 queries/month', 
              'Basic analytics',
              'Email support'
            ]}
            onSelect={() => console.log('Select Starter')}
          />
          <PlanCard
            name="Professional"
            price="$49"
            features={[
              '25 AI agents',
              '10,000 queries/month',
              'Advanced analytics', 
              'Priority support',
              'Custom branding'
            ]}
            isCurrent={true}
            isPopular={true}
            onSelect={() => console.log('Select Professional')}
          />
          <PlanCard
            name="Enterprise"
            price="$199"
            features={[
              'Unlimited agents',
              '100,000 queries/month',
              'Advanced analytics',
              'Dedicated support',
              'Custom integrations',
              'SSO & compliance'
            ]}
            onSelect={() => console.log('Select Enterprise')}
          />
        </div>
      </div>
    </TabContent>
  );

  const renderNotificationsTab = () => (
    <TabContent>
      <FormGroup 
        label="Email Notifications" 
        description="Receive notifications about your account activity"
      >
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Agent alerts</p>
              <p className="text-sm text-gray-600">Get notified when agents go offline or encounter errors</p>
            </div>
            <input
              type="checkbox"
              checked={accountSettings.emailNotifications}
              onChange={(e) => handleAccountSettingChange('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Security alerts</p>
              <p className="text-sm text-gray-600">Important security notifications and login alerts</p>
            </div>
            <input
              type="checkbox"
              checked={accountSettings.securityAlerts}
              onChange={(e) => handleAccountSettingChange('securityAlerts', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Marketing emails</p>
              <p className="text-sm text-gray-600">Product updates, tips, and promotional content</p>
            </div>
            <input
              type="checkbox"
              checked={accountSettings.marketingEmails}
              onChange={(e) => handleAccountSettingChange('marketingEmails', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
          </label>
        </div>
      </FormGroup>
    </TabContent>
  );

  const renderTeamTab = () => (
    <TabContent>
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
        <p className="text-gray-600 mb-6">
          Team features are available on Enterprise plans. Invite team members and manage permissions.
        </p>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Upgrade to Enterprise
        </Button>
      </div>
    </TabContent>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'billing':
        return renderBillingTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'team':
        return renderTeamTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className={cn('h-full flex flex-col bg-gray-50', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your profile and preferences</p>
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