/**
 * updateUserNotificationSettings
 * Updates the user's master notification settings
 * Accepts: email_notifications_enabled, push_notifications_enabled,
 *          in_app_notifications_enabled, quiet_hours_start, quiet_hours_end
 */

import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    // Parse request body
    const body = await req.json();
    const { user_id, ...updates } = body;

    if (!user_id) {
      return Response.json(
        { error: 'Missing user_id' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate update fields
    const allowedFields = [
      'email_notifications_enabled',
      'push_notifications_enabled',
      'in_app_notifications_enabled',
      'quiet_hours_start',
      'quiet_hours_end',
      'quiet_hours_timezone'
    ];

    const validUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value;
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_notification_settings')
      .select('id')
      .eq('user_id', user_id)
      .single();

    let result;

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_notification_settings')
        .update({
          ...validUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new settings with updates
      const { data, error } = await supabase
        .from('user_notification_settings')
        .insert({
          user_id,
          email_notifications_enabled: true,
          push_notifications_enabled: true,
          in_app_notifications_enabled: true,
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
          ...validUpdates
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return Response.json(
      { success: true, settings: result },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Error in updateUserNotificationSettings:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});
