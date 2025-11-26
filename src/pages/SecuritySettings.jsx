import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Smartphone, Key, Bell, Lock, 
  AlertTriangle, LogOut, Loader2, Monitor,
  Tablet, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['userSessions'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getUserSessions', {});
      return data.sessions || [];
    },
    enabled: !!user,
  });

  const { data: securitySettings } = useQuery({
    queryKey: ['securitySettings'],
    queryFn: async () => {
      const settings = await base44.entities.UserSecuritySettings.filter({
        user_id: user.id
      });
      return settings[0] || null;
    },
    enabled: !!user,
  });

  const terminateSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.functions.invoke('terminateSession', {
      session_id: sessionId,
      reason: 'user_action'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSessions'] });
      toast.success('Session terminated');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => {
      if (securitySettings) {
        return base44.entities.UserSecuritySettings.update(securitySettings.id, data);
      } else {
        return base44.entities.UserSecuritySettings.create({
          user_id: user.id,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      toast.success('Settings updated');
    },
  });

  const handleTerminateSession = async (sessionId) => {
    if (confirm('Are you sure you want to end this session?')) {
      terminateSessionMutation.mutate(sessionId);
    }
  };

  const handleTerminateAllOthers = async () => {
    if (confirm('This will log you out of all other devices. Continue?')) {
      const currentSession = sessionsData?.find(s => s.isCurrent);
      const otherSessions = sessionsData?.filter(s => !s.isCurrent) || [];
      
      for (const session of otherSessions) {
        await base44.functions.invoke('terminateSession', {
          session_id: session.id,
          reason: 'user_action'
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['userSessions'] });
      toast.success('All other sessions terminated');
    }
  };

  const updateSecuritySetting = (key, value) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Security Settings
          </h1>
          <p className="text-gray-600">
            Manage your account security and active sessions
          </p>
        </div>

        {/* Password Section */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Password</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your password through your account settings
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                style={{ minHeight: '44px' }}
                onClick={() => toast.info('Password management coming soon')}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Active Sessions</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">
                    Devices currently logged into your account
                  </p>
                </div>
              </div>
              {sessionsData && sessionsData.length > 1 && (
                <Button 
                  onClick={handleTerminateAllOthers}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  style={{ minHeight: '44px' }}
                >
                  Log Out All Others
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionsData && sessionsData.length > 0 ? (
              sessionsData.map(session => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                return (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        session.deviceType === 'mobile' 
                          ? 'bg-blue-100' 
                          : session.deviceType === 'tablet'
                          ? 'bg-purple-100'
                          : 'bg-gray-200'
                      }`}>
                        <DeviceIcon className={`w-5 h-5 ${
                          session.deviceType === 'mobile' 
                            ? 'text-blue-600' 
                            : session.deviceType === 'tablet'
                            ? 'text-purple-600'
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {session.device}
                          {session.isCurrent && (
                            <Badge className="bg-green-100 text-green-700">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{session.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(session.lastActive)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {session.ipAddress}
                        </div>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <Button
                        onClick={() => handleTerminateSession(session.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        style={{ minHeight: '44px' }}
                      >
                        <LogOut className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No active sessions found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notifications */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Security Notifications</CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Get notified about security events
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { 
                key: 'notify_new_device', 
                label: 'New device login',
                description: 'When your account is accessed from a new device'
              },
              { 
                key: 'notify_password_change', 
                label: 'Password changes',
                description: 'When your password is changed'
              },
              { 
                key: 'notify_failed_attempts', 
                label: 'Failed login attempts',
                description: 'When multiple failed login attempts are detected'
              },
              { 
                key: 'notify_suspicious_activity', 
                label: 'Suspicious activity',
                description: 'When unusual activity is detected on your account'
              },
            ].map(({ key, label, description }) => (
              <div 
                key={key}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-500">{description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings?.[key] ?? true}
                    onChange={(e) => updateSecuritySetting(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 
                    peer-focus:ring-blue-300 rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:bg-blue-600 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all">
                  </div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}