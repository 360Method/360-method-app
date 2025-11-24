import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      user_id,
      notification_type,
      event_type,
      title,
      body,
      icon,
      action_url,
      action_label,
      related_entity_type,
      related_entity_id,
      property_id,
      sender_user_id,
      priority = 'normal'
    } = await req.json();

    if (!user_id || !notification_type || !event_type || !title || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's notification settings
    const settingsRecords = await base44.asServiceRole.entities.UserNotificationSettings.filter({
      user_id: user_id
    });
    
    const settings = settingsRecords[0] || {
      in_app_notifications_enabled: true,
      email_notifications_enabled: true,
      push_notifications_enabled: true
    };

    // Check if user has unsubscribed from all
    if (settings.unsubscribed_all && notification_type !== 'system') {
      return Response.json({ 
        success: false, 
        message: 'User has unsubscribed from notifications' 
      });
    }

    // Map notification_type to category for preferences
    const categoryMap = {
      payment: 'payments',
      inspection: 'inspections',
      work_order: 'work_orders',
      task: 'tasks',
      property: 'properties',
      connection: 'connections',
      message: 'messages',
      system: 'system'
    };
    
    const category = categoryMap[notification_type] || notification_type;

    // Get user's preferences for this category
    const prefRecords = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_id: user_id,
      notification_category: category
    });
    
    const preferences = prefRecords[0] || {
      in_app_enabled: true,
      email_enabled: true,
      push_enabled: true
    };

    // Check quiet hours
    const now = new Date();
    const isQuietHours = settings.quiet_hours_start && settings.quiet_hours_end;

    // Create notification record if in-app enabled
    let notification = null;
    if (settings.in_app_notifications_enabled && preferences.in_app_enabled) {
      notification = await base44.asServiceRole.entities.Notification.create({
        user_id,
        notification_type,
        event_type,
        title,
        body,
        icon,
        action_url,
        action_label,
        related_entity_type,
        related_entity_id,
        property_id,
        sender_user_id,
        priority,
        read: false,
        dismissed: false,
        email_sent: false,
        push_sent: false
      });
    }

    // Send email if enabled and not in quiet hours
    if (settings.email_notifications_enabled && preferences.email_enabled && !isQuietHours) {
      try {
        await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
          user_id,
          notification_type,
          event_type,
          title,
          body,
          action_url,
          related_data: { related_entity_type, related_entity_id, property_id }
        });
        
        if (notification) {
          await base44.asServiceRole.entities.Notification.update(notification.id, {
            email_sent: true
          });
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    // Send push if enabled and not in quiet hours
    if (settings.push_notifications_enabled && preferences.push_enabled && !isQuietHours) {
      try {
        await base44.asServiceRole.functions.invoke('sendPushNotification', {
          user_id,
          title,
          body,
          action_url,
          icon,
          tag: event_type,
          require_interaction: priority === 'urgent' || priority === 'high'
        });
        
        if (notification) {
          await base44.asServiceRole.entities.Notification.update(notification.id, {
            push_sent: true
          });
        }
      } catch (error) {
        console.error('Error sending push:', error);
      }
    }

    return Response.json({ 
      success: true, 
      notification_id: notification?.id,
      delivered: {
        in_app: !!notification,
        email: settings.email_notifications_enabled && preferences.email_enabled && !isQuietHours,
        push: settings.push_notifications_enabled && preferences.push_enabled && !isQuietHours
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});