/**
 * getUserNotificationSettings
 * Returns the user's master notification settings (toggles + quiet hours)
 */

import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    // Get user_id from request body
    let userId: string | null = null;
    try {
      const body = await req.json();
      userId = body.user_id;
    } catch {
      // No body provided
    }

    if (!userId) {
      return Response.json(
        { error: 'Missing user_id' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch user's notification settings
    const { data: settings, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK (new user)
      console.error('Error fetching settings:', error);
      throw error;
    }

    // If no settings exist, create default settings
    if (!settings) {
      const defaultSettings = {
        user_id: userId,
        email_notifications_enabled: true,
        push_notifications_enabled: true,
        in_app_notifications_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        quiet_hours_timezone: 'America/New_York'
      };

      const { data: newSettings, error: insertError } = await supabase
        .from('user_notification_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default settings:', insertError);
        throw insertError;
      }

      return Response.json(
        { success: true, settings: newSettings },
        { headers: corsHeaders }
      );
    }

    return Response.json(
      { success: true, settings },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Error in getUserNotificationSettings:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});
