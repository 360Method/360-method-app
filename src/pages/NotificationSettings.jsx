import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  Check,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  // Get global settings
  const { data: settingsData } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getUserNotificationSettings');
      return data.settings;
    }
  });

  // Get category preferences
  const { data: preferencesData } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getNotificationPreferences');
      return data.preferences || [];
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updates) => base44.functions.invoke('updateUserNotificationSettings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      toast.success('Settings updated');
    }
  });

  // Update preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: ({ notification_category, ...updates }) => 
      base44.functions.invoke('updateNotificationPreference', { notification_category, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preference updated');
    }
  });

  const categoryLabels = {
    payments: { label: 'Payments & Invoices', description: 'Invoice updates, payment confirmations' },
    inspections: { label: 'Inspections', description: 'Inspection schedules and completed reports' },
    work_orders: { label: 'Work Orders', description: 'Contractor assignments and completions' },
    tasks: { label: 'Maintenance Tasks', description: 'Task reminders and due dates' },
    properties: { label: 'Property Alerts', description: 'Health scores and system warnings' },
    connections: { label: 'Connections', description: 'Operator and contractor invitations' },
    reminders: { label: 'Reminders', description: 'Scheduled maintenance reminders' },
    messages: { label: 'Messages', description: 'Direct messages and mentions' },
    marketing: { label: 'Marketing', description: 'Feature announcements and tips' }
  };

  const handleToggleMaster = (key, value) => {
    updateSettingsMutation.mutate({ [key]: !value });
  };

  const handleToggleCategory = (category, channel, currentValue) => {
    updatePreferenceMutation.mutate({
      notification_category: category,
      [`${channel}_enabled`]: !currentValue
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()} 
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notification Settings
          </h1>
          <p className="text-gray-600">
            Control how and when you receive notifications
          </p>
        </div>

        {/* Master Controls */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Master Controls
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">In-App Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in the app</p>
                </div>
              </div>
              <Button
                variant={settingsData?.in_app_notifications_enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggleMaster('in_app_notifications_enabled', settingsData?.in_app_notifications_enabled)}
              >
                {settingsData?.in_app_notifications_enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <Button
                variant={settingsData?.email_notifications_enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggleMaster('email_notifications_enabled', settingsData?.email_notifications_enabled)}
              >
                {settingsData?.email_notifications_enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                </div>
              </div>
              <Button
                variant={settingsData?.push_notifications_enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggleMaster('push_notifications_enabled', settingsData?.push_notifications_enabled)}
              >
                {settingsData?.push_notifications_enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Category Preferences */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Notification Categories
          </h2>
          <div className="space-y-4">
            {preferencesData?.map((pref) => {
              const catInfo = categoryLabels[pref.notification_category];
              if (!catInfo) return null;

              return (
                <div key={pref.notification_category} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="mb-3">
                    <p className="font-medium text-gray-900">{catInfo.label}</p>
                    <p className="text-sm text-gray-600">{catInfo.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={pref.in_app_enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleCategory(pref.notification_category, 'in_app', pref.in_app_enabled)}
                      className="gap-2"
                    >
                      <Bell className="w-3 h-3" />
                      In-App
                    </Button>
                    <Button
                      variant={pref.email_enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleCategory(pref.notification_category, 'email', pref.email_enabled)}
                      className="gap-2"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </Button>
                    <Button
                      variant={pref.push_enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleCategory(pref.notification_category, 'push', pref.push_enabled)}
                      className="gap-2"
                    >
                      <Smartphone className="w-3 h-3" />
                      Push
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Quiet Hours
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Pause non-urgent notifications during these hours
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <Input
                type="time"
                value={settingsData?.quiet_hours_start || '22:00'}
                onChange={(e) => updateSettingsMutation.mutate({ quiet_hours_start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <Input
                type="time"
                value={settingsData?.quiet_hours_end || '08:00'}
                onChange={(e) => updateSettingsMutation.mutate({ quiet_hours_end: e.target.value })}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}