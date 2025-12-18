import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Database,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function HQSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  // Default values
  const defaultGeneral = {
    platformName: '360° Method',
    supportEmail: 'support@360method.com',
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true,
    defaultUserRole: 'homeowner'
  };

  const defaultNotifications = {
    sendWelcomeEmail: true,
    sendInvoiceEmails: true,
    sendReminderEmails: true,
    adminAlertEmail: 'admin@360method.com',
    slackWebhook: ''
  };

  const defaultFeatures = {
    enableOperatorPortal: true,
    enableContractorPortal: true,
    enableMarketplace: true,
    enableAIFeatures: true,
    enablePayments: true,
    enableDemoMode: true
  };

  // Local state
  const [generalSettings, setGeneralSettings] = useState(defaultGeneral);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotifications);
  const [featureFlags, setFeatureFlags] = useState(defaultFeatures);
  const [saving, setSaving] = useState(null);

  // Load settings from database
  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Update local state when db settings load
  useEffect(() => {
    if (dbSettings) {
      const general = dbSettings.find(s => s.setting_key === 'general');
      const notifications = dbSettings.find(s => s.setting_key === 'notifications');
      const features = dbSettings.find(s => s.setting_key === 'features');

      if (general?.setting_value) setGeneralSettings({ ...defaultGeneral, ...general.setting_value });
      if (notifications?.setting_value) setNotificationSettings({ ...defaultNotifications, ...notifications.setting_value });
      if (features?.setting_value) setFeatureFlags({ ...defaultFeatures, ...features.setting_value });
    }
  }, [dbSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    }
  });

  const handleSaveSettings = async (section) => {
    setSaving(section);
    try {
      let key, value;
      switch (section) {
        case 'General':
          key = 'general';
          value = generalSettings;
          break;
        case 'Notification':
          key = 'notifications';
          value = notificationSettings;
          break;
        case 'Feature':
          key = 'features';
          value = featureFlags;
          break;
        default:
          return;
      }
      await saveMutation.mutateAsync({ key, value });
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save ${section.toLowerCase()} settings`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and feature flags</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden md:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden md:inline">Danger</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">General Settings</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <Input
                      value={generalSettings.platformName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default User Role</Label>
                  <Select
                    value={generalSettings.defaultUserRole}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultUserRole: value })}
                  >
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homeowner">Homeowner</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Allow New Signups</p>
                      <p className="text-sm text-gray-600">Allow new users to register</p>
                    </div>
                    <Switch
                      checked={generalSettings.allowSignups}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allowSignups: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Email Verification</p>
                      <p className="text-sm text-gray-600">Users must verify email before accessing</p>
                    </div>
                    <Switch
                      checked={generalSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, requireEmailVerification: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-yellow-700">Only admins can access when enabled</p>
                    </div>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSaveSettings('General')} className="gap-2" disabled={saving === 'General'}>
                  {saving === 'General' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save General Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Settings</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admin Alert Email</Label>
                    <Input
                      type="email"
                      value={notificationSettings.adminAlertEmail}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, adminAlertEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slack Webhook URL</Label>
                    <Input
                      placeholder="https://hooks.slack.com/..."
                      value={notificationSettings.slackWebhook}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, slackWebhook: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Welcome Emails</p>
                      <p className="text-sm text-gray-600">Send welcome email to new users</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sendWelcomeEmail}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sendWelcomeEmail: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Invoice Emails</p>
                      <p className="text-sm text-gray-600">Send invoice notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sendInvoiceEmails}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sendInvoiceEmails: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Reminder Emails</p>
                      <p className="text-sm text-gray-600">Send maintenance reminders</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sendReminderEmails}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sendReminderEmails: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSaveSettings('Notification')} className="gap-2" disabled={saving === 'Notification'}>
                  {saving === 'Notification' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Notification Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Feature Flags */}
          <TabsContent value="features">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Feature Flags</h2>
              <p className="text-sm text-gray-600 mb-6">Enable or disable platform features</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Operator Portal</p>
                    <p className="text-sm text-gray-600">Allow operators to manage clients</p>
                  </div>
                  <Switch
                    checked={featureFlags.enableOperatorPortal}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableOperatorPortal: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Contractor Portal</p>
                    <p className="text-sm text-gray-600">Allow contractors to receive jobs</p>
                  </div>
                  <Switch
                    checked={featureFlags.enableContractorPortal}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableContractorPortal: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Marketplace</p>
                    <p className="text-sm text-gray-600">Enable operator marketplace</p>
                  </div>
                  <Switch
                    checked={featureFlags.enableMarketplace}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableMarketplace: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">AI Features</p>
                    <p className="text-sm text-gray-600">Enable AI-powered recommendations</p>
                  </div>
                  <Switch
                    checked={featureFlags.enableAIFeatures}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableAIFeatures: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Payments</p>
                    <p className="text-sm text-gray-600">Enable Stripe payments</p>
                  </div>
                  <Switch
                    checked={featureFlags.enablePayments}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enablePayments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Demo Mode</p>
                    <p className="text-sm text-gray-600">Allow users to try demo</p>
                  </div>
                  <Switch
                    checked={featureFlags.enableDemoMode}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableDemoMode: checked })}
                  />
                </div>

                <Button onClick={() => handleSaveSettings('Feature')} className="gap-2" disabled={saving === 'Feature'}>
                  {saving === 'Feature' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Feature Flags
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Stripe</h3>
                      <p className="text-sm text-gray-600">Payment processing</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = createPageUrl('AdminStripe')}
                  >
                    Configure
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Connected</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Supabase</h3>
                      <p className="text-sm text-gray-600">Database & Auth</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configured
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Connected</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Email Service</h3>
                      <p className="text-sm text-gray-600">Transactional emails</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = createPageUrl('AdminEmailTest')}
                  >
                    Test
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Configured</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Clerk</h3>
                      <p className="text-sm text-gray-600">Authentication</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configured
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Connected</span>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger">
            <Card className="p-6 border-red-200">
              <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                These actions are destructive and cannot be undone. Please proceed with caution.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Clear All Demo Data</p>
                      <p className="text-sm text-red-600">Remove all demo accounts and properties</p>
                    </div>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      Clear Demo Data
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Reset Job Queue</p>
                      <p className="text-sm text-red-600">Clear all pending and failed jobs</p>
                    </div>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      Reset Queue
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Force Logout All Users</p>
                      <p className="text-sm text-red-600">Sign out all users from the platform</p>
                    </div>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      Logout All
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HQLayout>
  );
}
