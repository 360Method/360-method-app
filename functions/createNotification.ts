import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const currentUser = await helper.auth.me();
    
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders 
      });
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
      priority = 'normal',
      template_data
    } = await req.json();

    if (!user_id || !notification_type || !event_type || !title || !body) {
      return Response.json({ error: 'Missing required fields' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get user's notification settings
    const settingsRecords = await helper.asServiceRole.entities.UserNotificationSettings.filter({
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
      }, { headers: corsHeaders });
    }

    // Map notification_type to category for preferences
    const categoryMap: Record<string, string> = {
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
    const prefRecords = await helper.asServiceRole.entities.NotificationPreference.filter({
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
      notification = await helper.asServiceRole.entities.Notification.create({
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
        await helper.asServiceRole.functions.invoke('sendNotificationEmail', {
          user_id,
          notification_type,
          event_type,
          title,
          body,
          action_url,
          related_data: { related_entity_type, related_entity_id, property_id },
          template_data
        });
        
        if (notification) {
          await helper.asServiceRole.entities.Notification.update(notification.id, {
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
        await helper.asServiceRole.functions.invoke('sendPushNotification', {
          user_id,
          title,
          body,
          action_url,
          icon,
          tag: event_type,
          require_interaction: priority === 'urgent' || priority === 'high'
        });
        
        if (notification) {
          await helper.asServiceRole.entities.Notification.update(notification.id, {
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
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
