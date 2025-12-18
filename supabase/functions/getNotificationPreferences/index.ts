/**
 * getNotificationPreferences
 * Returns the user's notification preferences by category
 * Each category has in_app_enabled, email_enabled, push_enabled
 */

import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';

// Default categories with their initial enabled states
const DEFAULT_CATEGORIES = [
  'payments',
  'inspections',
  'work_orders',
  'tasks',
  'properties',
  'connections',
  'reminders',
  'messages',
  'marketing'
];

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

    // Fetch existing preferences
    const { data: existingPrefs, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }

    // Build a map of existing preferences by category and channel
    const prefMap: Record<string, Record<string, boolean>> = {};

    if (existingPrefs) {
      for (const pref of existingPrefs) {
        const category = pref.event_type; // event_type stores the category
        if (!prefMap[category]) {
          prefMap[category] = {};
        }
        prefMap[category][pref.channel] = pref.enabled;
      }
    }

    // Build the response with all categories, creating defaults where missing
    const preferences = [];
    const prefsToInsert = [];

    for (const category of DEFAULT_CATEGORIES) {
      const categoryPrefs = prefMap[category] || {};

      // Determine if we need to create default prefs
      const inAppEnabled = categoryPrefs['in_app'] ?? true;
      const emailEnabled = categoryPrefs['email'] ?? (category !== 'marketing');
      const pushEnabled = categoryPrefs['push'] ?? (category !== 'marketing');

      preferences.push({
        notification_category: category,
        in_app_enabled: inAppEnabled,
        email_enabled: emailEnabled,
        push_enabled: pushEnabled
      });

      // Queue missing prefs for insertion
      if (!categoryPrefs['in_app']) {
        prefsToInsert.push({ user_id: userId, event_type: category, channel: 'in_app', enabled: inAppEnabled });
      }
      if (!categoryPrefs['email']) {
        prefsToInsert.push({ user_id: userId, event_type: category, channel: 'email', enabled: emailEnabled });
      }
      if (!categoryPrefs['push']) {
        prefsToInsert.push({ user_id: userId, event_type: category, channel: 'push', enabled: pushEnabled });
      }
    }

    // Insert any missing default preferences
    if (prefsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('notification_preferences')
        .upsert(prefsToInsert, { onConflict: 'user_id,channel,event_type' });

      if (insertError) {
        console.error('Error inserting default preferences:', insertError);
        // Don't throw - we can still return what we have
      }
    }

    return Response.json(
      { success: true, preferences },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Error in getNotificationPreferences:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});
