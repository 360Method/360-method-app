import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notification_id } = await req.json();

    if (!notification_id) {
      return Response.json({ error: 'Missing notification_id' }, { status: 400 });
    }

    // Verify notification belongs to user
    const notifications = await base44.entities.Notification.filter({
      id: notification_id,
      user_id: user.id
    });

    if (!notifications || notifications.length === 0) {
      return Response.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Dismiss notification
    await base44.entities.Notification.update(notification_id, {
      dismissed: true,
      dismissed_at: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});