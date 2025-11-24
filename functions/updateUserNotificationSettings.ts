import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    // Get existing settings
    const settingsRecords = await base44.entities.UserNotificationSettings.filter({
      user_id: user.id
    });

    let settings;
    if (settingsRecords && settingsRecords.length > 0) {
      // Update existing
      settings = await base44.entities.UserNotificationSettings.update(
        settingsRecords[0].id,
        updates
      );
    } else {
      // Create new
      settings = await base44.entities.UserNotificationSettings.create({
        user_id: user.id,
        ...updates
      });
    }

    return Response.json({ settings });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});