/**
 * updateNotificationPreference
 * Updates a specific notification category preference
 * Accepts: notification_category, in_app_enabled, email_enabled, push_enabled
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
    const { user_id, notification_category, ...updates } = body;

    if (!user_id) {
      return Response.json(
        { error: 'Missing user_id' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!notification_category) {
      return Response.json(
        { error: 'Missing notification_category' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Map the UI field names to channel updates
    const channelUpdates: Array<{ channel: string; enabled: boolean }> = [];

    if ('in_app_enabled' in updates) {
      channelUpdates.push({ channel: 'in_app', enabled: updates.in_app_enabled });
    }
    if ('email_enabled' in updates) {
      channelUpdates.push({ channel: 'email', enabled: updates.email_enabled });
    }
    if ('push_enabled' in updates) {
      channelUpdates.push({ channel: 'push', enabled: updates.push_enabled });
    }

    if (channelUpdates.length === 0) {
      return Response.json(
        { error: 'No valid fields to update (in_app_enabled, email_enabled, push_enabled)' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Upsert each channel preference
    const upsertData = channelUpdates.map(update => ({
      user_id,
      event_type: notification_category,
      channel: update.channel,
      enabled: update.enabled,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(upsertData, {
        onConflict: 'user_id,channel,event_type',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating preference:', error);
      throw error;
    }

    // Fetch the updated preferences for this category
    const { data: updatedPrefs, error: fetchError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .eq('event_type', notification_category);

    if (fetchError) {
      console.error('Error fetching updated preferences:', fetchError);
    }

    // Build the response preference object
    const prefMap: Record<string, boolean> = {};
    if (updatedPrefs) {
      for (const pref of updatedPrefs) {
        prefMap[pref.channel] = pref.enabled;
      }
    }

    const preference = {
      notification_category,
      in_app_enabled: prefMap['in_app'] ?? true,
      email_enabled: prefMap['email'] ?? true,
      push_enabled: prefMap['push'] ?? true
    };

    return Response.json(
      { success: true, preference },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Error in updateNotificationPreference:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});
