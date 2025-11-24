import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings
    const settingsRecords = await base44.entities.UserNotificationSettings.filter({
      user_id: user.id
    });

    let settings = settingsRecords[0];

    // Create default settings if none exist
    if (!settings) {
      settings = await base44.entities.UserNotificationSettings.create({
        user_id: user.id,
        email_notifications_enabled: true,
        push_notifications_enabled: true,
        in_app_notifications_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        quiet_hours_timezone: 'America/New_York',
        digest_time: '09:00',
        digest_timezone: 'America/New_York',
        unsubscribed_all: false
      });
    }

    return Response.json({ settings });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});