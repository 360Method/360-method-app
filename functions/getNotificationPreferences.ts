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

    // Get user preferences
    const preferences = await helper.entities.NotificationPreference.filter({
      user_id: user.id
    });

    // Define all categories with defaults
    const defaultCategories = [
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

    // Merge with defaults
    const preferencesMap = new Map(
      preferences.map((p: any) => [p.notification_category, p])
    );

    const allPreferences = defaultCategories.map(category => {
      if (preferencesMap.has(category)) {
        return preferencesMap.get(category);
      } else {
        return {
          user_id: user.id,
          notification_category: category,
          in_app_enabled: true,
          email_enabled: true,
          push_enabled: true,
          frequency: 'immediate',
          quiet_hours_enabled: false
        };
      }
    });

    return Response.json({ preferences: allPreferences }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
