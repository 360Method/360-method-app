/**
 * useNotifications Hook
 * Real-time notification subscription and management
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from '@/api/notifications';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook to manage notifications with real-time updates
 * @param {Object} options - Configuration options
 * @returns {Object} Notification state and methods
 */
export function useNotifications(options = {}) {
  const { showToasts = true, limit = 50 } = options;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const channelRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const [notifs, count] = await Promise.all([
        getNotifications(user.id, { limit }),
        getUnreadCount(user.id)
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit]);

  // Handle new notification
  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    if (showToasts && toast) {
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000
      });
    }
  }, [showToasts, toast]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Subscribe to new notifications
    channelRef.current = subscribeToNotifications(user.id, handleNewNotification);

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        unsubscribeFromNotifications(channelRef.current);
      }
    };
  }, [isAuthenticated, user?.id, fetchNotifications, handleNewNotification]);

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
    }
  }, [user?.id]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    refresh
  };
}

/**
 * Hook for just the unread count (lighter weight)
 */
export function useUnreadCount() {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Initial fetch
    getUnreadCount(user.id).then(setCount);

    // Subscribe to updates
    channelRef.current = subscribeToNotifications(user.id, () => {
      setCount(prev => prev + 1);
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromNotifications(channelRef.current);
      }
    };
  }, [isAuthenticated, user?.id]);

  return count;
}

/**
 * Hook to get notifications by type
 * @param {string} type - Notification type filter
 */
export function useNotificationsByType(type) {
  const { notifications, ...rest } = useNotifications();

  const filteredNotifications = notifications.filter(n => n.type === type);

  return {
    notifications: filteredNotifications,
    ...rest
  };
}

export default useNotifications;
