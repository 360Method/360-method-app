import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Get user settings
    const settingsRecords = await helper.entities.UserNotificationSettings.filter({
      user_id: user.id
    });

    let settings = settingsRecords[0];

    // Create default settings if none exist
    if (!settings) {
      settings = await helper.entities.UserNotificationSettings.create({
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

    return Response.json({ settings }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
