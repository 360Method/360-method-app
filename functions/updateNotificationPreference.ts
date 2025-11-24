import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notification_category, ...updates } = await req.json();

    if (!notification_category) {
      return Response.json({ error: 'Missing notification_category' }, { status: 400 });
    }

    // Get existing preference
    const prefRecords = await base44.entities.NotificationPreference.filter({
      user_id: user.id,
      notification_category: notification_category
    });

    let preference;
    if (prefRecords && prefRecords.length > 0) {
      // Update existing
      preference = await base44.entities.NotificationPreference.update(
        prefRecords[0].id,
        updates
      );
    } else {
      // Create new
      preference = await base44.entities.NotificationPreference.create({
        user_id: user.id,
        notification_category,
        ...updates
      });
    }

    return Response.json({ preference });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});