import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const preferences = await base44.entities.NotificationPreference.filter({
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
      preferences.map(p => [p.notification_category, p])
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

    return Response.json({ preferences: allPreferences });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});