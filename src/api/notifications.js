/**
 * Notifications API Module
 * Handles notification CRUD, realtime subscriptions, and preferences
 */
import { supabase, Notification, NotificationPreference } from './supabaseClient';

// ============================================
// NOTIFICATION QUERIES
// ============================================

/**
 * Get all notifications for a user
 * @param {string} userId - Clerk user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of notifications
 */
export async function getNotifications(userId, options = {}) {
  const { limit = 50, unreadOnly = false } = options;

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get unread notification count
 * @param {string} userId - Clerk user ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification UUID
 * @returns {Promise<Object>} Updated notification
 */
export async function markAsRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - Clerk user ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
export async function markAllAsRead(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification UUID
 */
export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Create a notification
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(notification) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to new notifications for a user
 * @param {string} userId - Clerk user ID
 * @param {Function} onNotification - Callback when new notification arrives
 * @returns {Object} Supabase channel (call .unsubscribe() to cleanup)
 */
export function subscribeToNotifications(userId, onNotification) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from notifications
 * @param {Object} channel - Supabase channel from subscribeToNotifications
 */
export function unsubscribeFromNotifications(channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get notification preferences for a user
 * @param {string} userId - Clerk user ID
 * @returns {Promise<Array>} List of preferences
 */
export async function getPreferences(userId) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

/**
 * Update a notification preference
 * @param {string} userId - Clerk user ID
 * @param {string} channel - 'in_app', 'email', 'push'
 * @param {string} eventType - Event type like 'new_request', 'job_complete'
 * @param {boolean} enabled - Whether enabled
 * @returns {Promise<Object>} Updated preference
 */
export async function updatePreference(userId, channel, eventType, enabled) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      channel,
      event_type: eventType,
      enabled,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,channel,event_type'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Initialize default notification preferences for a user
 * @param {string} userId - Clerk user ID
 * @param {string} userType - 'owner', 'operator', 'contractor'
 * @returns {Promise<Array>} Created preferences
 */
export async function initializeDefaultPreferences(userId, userType) {
  const defaultPreferences = getDefaultPreferencesForUserType(userType);

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      defaultPreferences.map(pref => ({
        user_id: userId,
        channel: pref.channel,
        event_type: pref.eventType,
        enabled: pref.enabled
      })),
      { onConflict: 'user_id,channel,event_type' }
    )
    .select();

  if (error) throw error;
  return data;
}

/**
 * Get default preferences based on user type
 */
function getDefaultPreferencesForUserType(userType) {
  const base = [
    { channel: 'in_app', eventType: 'system_announcement', enabled: true },
    { channel: 'email', eventType: 'system_announcement', enabled: true }
  ];

  const ownerPrefs = [
    { channel: 'in_app', eventType: 'proposal_received', enabled: true },
    { channel: 'email', eventType: 'proposal_received', enabled: true },
    { channel: 'in_app', eventType: 'job_scheduled', enabled: true },
    { channel: 'email', eventType: 'job_scheduled', enabled: true },
    { channel: 'in_app', eventType: 'job_started', enabled: true },
    { channel: 'in_app', eventType: 'job_complete', enabled: true },
    { channel: 'email', eventType: 'job_complete', enabled: true },
    { channel: 'in_app', eventType: 'invoice_received', enabled: true },
    { channel: 'email', eventType: 'invoice_received', enabled: true },
    { channel: 'in_app', eventType: 'message_received', enabled: true },
    { channel: 'email', eventType: 'message_received', enabled: false }
  ];

  const operatorPrefs = [
    { channel: 'in_app', eventType: 'new_service_request', enabled: true },
    { channel: 'email', eventType: 'new_service_request', enabled: true },
    { channel: 'in_app', eventType: 'proposal_accepted', enabled: true },
    { channel: 'email', eventType: 'proposal_accepted', enabled: true },
    { channel: 'in_app', eventType: 'proposal_declined', enabled: true },
    { channel: 'in_app', eventType: 'job_complete', enabled: true },
    { channel: 'email', eventType: 'job_complete', enabled: true },
    { channel: 'in_app', eventType: 'payment_received', enabled: true },
    { channel: 'email', eventType: 'payment_received', enabled: true },
    { channel: 'in_app', eventType: 'contractor_accepted', enabled: true },
    { channel: 'in_app', eventType: 'message_received', enabled: true }
  ];

  const contractorPrefs = [
    { channel: 'in_app', eventType: 'job_assigned', enabled: true },
    { channel: 'email', eventType: 'job_assigned', enabled: true },
    { channel: 'push', eventType: 'job_assigned', enabled: true },
    { channel: 'in_app', eventType: 'job_cancelled', enabled: true },
    { channel: 'email', eventType: 'job_cancelled', enabled: true },
    { channel: 'in_app', eventType: 'schedule_change', enabled: true },
    { channel: 'push', eventType: 'schedule_change', enabled: true },
    { channel: 'in_app', eventType: 'payment_processed', enabled: true },
    { channel: 'email', eventType: 'payment_processed', enabled: true },
    { channel: 'in_app', eventType: 'message_received', enabled: true },
    { channel: 'push', eventType: 'message_received', enabled: true }
  ];

  switch (userType) {
    case 'owner':
      return [...base, ...ownerPrefs];
    case 'operator':
      return [...base, ...operatorPrefs];
    case 'contractor':
      return [...base, ...contractorPrefs];
    default:
      return base;
  }
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Send a notification to a user (creates in DB + triggers email if enabled)
 * @param {Object} options - Notification options
 */
export async function sendNotification({
  userId,
  type,
  title,
  message,
  data = {},
  sendEmail = false,
  emailSubject,
  emailBody
}) {
  // Create in-app notification
  const notification = await createNotification({
    userId,
    type,
    title,
    message,
    data
  });

  // Send email if enabled and requested
  if (sendEmail) {
    try {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('enabled')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .eq('event_type', type)
        .single();

      if (prefs?.enabled) {
        // Call edge function to send email
        await supabase.functions.invoke('sendNotificationEmail', {
          body: {
            userId,
            subject: emailSubject || title,
            body: emailBody || message,
            notificationType: type,
            data
          }
        });
      }
    } catch (error) {
      console.error('Failed to send notification email:', error);
      // Don't throw - email failure shouldn't fail the notification
    }
  }

  return notification;
}

/**
 * Batch send notifications to multiple users
 * @param {Array} notifications - Array of notification objects
 */
export async function sendBatchNotifications(notifications) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(
      notifications.map(n => ({
        user_id: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {}
      }))
    )
    .select();

  if (error) throw error;
  return data;
}

// Export notification types for consistency
export const NOTIFICATION_TYPES = {
  SERVICE_REQUEST: 'service_request',
  PROPOSAL: 'proposal',
  WORK_ORDER: 'work_order',
  PAYMENT: 'payment',
  JOB: 'job',
  SYSTEM: 'system',
  INVITATION: 'invitation'
};

export const EVENT_TYPES = {
  // Owner events
  PROPOSAL_RECEIVED: 'proposal_received',
  JOB_SCHEDULED: 'job_scheduled',
  JOB_STARTED: 'job_started',
  JOB_COMPLETE: 'job_complete',
  INVOICE_RECEIVED: 'invoice_received',

  // Operator events
  NEW_SERVICE_REQUEST: 'new_service_request',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  PROPOSAL_DECLINED: 'proposal_declined',
  PAYMENT_RECEIVED: 'payment_received',
  CONTRACTOR_ACCEPTED: 'contractor_accepted',

  // Contractor events
  JOB_ASSIGNED: 'job_assigned',
  JOB_CANCELLED: 'job_cancelled',
  SCHEDULE_CHANGE: 'schedule_change',
  PAYMENT_PROCESSED: 'payment_processed',

  // Common
  MESSAGE_RECEIVED: 'message_received',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};
