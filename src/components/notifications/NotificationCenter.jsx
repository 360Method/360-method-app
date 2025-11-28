import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useDemo } from '@/components/shared/DemoContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Check,
  X,
  Settings,
  CheckCheck,
  DollarSign,
  Calendar,
  Wrench,
  Home,
  Users,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { createPageUrl } from '@/utils';

const iconMap = {
  receipt: DollarSign,
  'check-circle': CheckCheck,
  'clipboard-check': Calendar,
  'check-square': CheckCheck,
  clock: Calendar,
  'alert-triangle': AlertCircle,
  'alert-circle': AlertCircle,
  home: Home,
  wrench: Wrench,
  users: Users,
  message: MessageSquare
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { demoMode } = useDemo();

  // Get unread count - skip in demo mode
  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getUnreadCount');
      return data.count || 0;
    },
    refetchInterval: demoMode ? false : 30000, // Don't poll in demo mode
    enabled: !demoMode // Skip entirely in demo mode
  });

  // Get notifications - skip in demo mode
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getNotifications', { limit: 20 });
      return data.notifications || [];
    },
    enabled: open && !demoMode // Skip in demo mode
  });

  const markReadMutation = useMutation({
    mutationFn: (notification_id) => 
      base44.functions.invoke('markNotificationRead', { notification_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    }
  });

  const dismissMutation = useMutation({
    mutationFn: (notification_id) => 
      base44.functions.invoke('dismissNotification', { notification_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => base44.functions.invoke('markAllNotificationsRead'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    setOpen(false);
  };

  const getNotificationIcon = (iconName) => {
    const Icon = iconMap[iconName] || Bell;
    return Icon;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-tour="notifications">
          <Bell className="w-5 h-5" />
          {unreadData > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadData > 9 ? '9+' : unreadData}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadData > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setOpen(false);
                window.location.href = createPageUrl('NotificationSettings');
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : !notificationsData || notificationsData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificationsData.map((notification) => {
              const Icon = getNotificationIcon(notification.icon);
              const priorityColor = getPriorityColor(notification.priority);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${priorityColor} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissMutation.mutate(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {notification.body}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.created_date)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notificationsData && notificationsData.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full" 
                size="sm"
                onClick={() => {
                  setOpen(false);
                  window.location.href = createPageUrl('NotificationSettings');
                }}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}