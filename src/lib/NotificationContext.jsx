/**
 * NotificationContext
 * Provides app-wide notification state with real-time updates
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from '@/api/notifications';
import {
  registerServiceWorker,
  isPushSupported,
  getNotificationPermission
} from './pushNotifications';
import { toast } from 'sonner';

const NotificationContext = createContext(null);

/**
 * NotificationProvider component
 * Wraps the app to provide notification state everywhere
 */
export function NotificationProvider({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  // Refs for cleanup
  const channelRef = useRef(null);
  const fetchedRef = useRef(false);

  // Check push support on mount
  useEffect(() => {
    setPushSupported(isPushSupported());
    setPushPermission(getNotificationPermission());

    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        setServiceWorkerReady(true);
      }
    });
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!user?.id || isLoadingAuth) return;

    // Prevent duplicate initial fetches
    if (fetchedRef.current && !forceRefresh) return;

    try {
      setIsLoading(true);
      const [notifs, count] = await Promise.all([
        getNotifications(user.id, { limit: 50 }),
        getUnreadCount(user.id)
      ]);
      setNotifications(notifs || []);
      setUnreadCount(count || 0);
      setError(null);
      fetchedRef.current = true;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoadingAuth]);

  // Handle new notification from realtime subscription
  const handleNewNotification = useCallback((notification) => {
    // Add to list
    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    const toastOptions = {
      description: notification.message || notification.body,
      duration: 5000,
    };

    // Add action button if URL provided
    if (notification.action_url || notification.data?.action_url) {
      toastOptions.action = {
        label: notification.action_label || 'View',
        onClick: () => {
          window.location.href = notification.action_url || notification.data?.action_url;
        }
      };
    }

    // Color based on priority
    if (notification.priority === 'urgent') {
      toast.error(notification.title, toastOptions);
    } else if (notification.priority === 'high') {
      toast.warning(notification.title, toastOptions);
    } else {
      toast(notification.title, toastOptions);
    }
  }, []);

  // Subscribe to real-time notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.id || isLoadingAuth) {
      // Reset state when logged out
      if (!isAuthenticated && !isLoadingAuth) {
        setNotifications([]);
        setUnreadCount(0);
        fetchedRef.current = false;
      }
      return;
    }

    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time updates
    channelRef.current = subscribeToNotifications(user.id, handleNewNotification);

    // Cleanup
    return () => {
      if (channelRef.current) {
        unsubscribeFromNotifications(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, isLoadingAuth, fetchNotifications, handleNewNotification]);

  // Mark single notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      throw err;
    }
  }, [user?.id]);

  // Dismiss/delete a notification
  const dismissNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
      throw err;
    }
  }, [notifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Update push permission status
  const updatePushPermission = useCallback(() => {
    setPushPermission(getNotificationPermission());
  }, []);

  const value = {
    // Notification state
    notifications,
    unreadCount,
    isLoading,
    error,

    // Notification actions
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    dismiss: dismissNotification,
    refresh,

    // Push notification state
    pushSupported,
    pushPermission,
    serviceWorkerReady,
    updatePushPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 * @returns {Object} Notification context value
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Hook for just the unread count (commonly used in headers/badges)
 * @returns {number} Unread notification count
 */
export function useUnreadNotificationCount() {
  const context = useContext(NotificationContext);
  return context?.unreadCount || 0;
}

export default NotificationContext;
