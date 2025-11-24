import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const notification_type = url.searchParams.get('type');

    // Build filter
    const filter = {
      user_id: user.id,
      read: false
    };

    if (notification_type) {
      filter.notification_type = notification_type;
    }

    // Get all unread notifications
    const notifications = await base44.entities.Notification.filter(filter);

    // Mark each as read
    const now = new Date().toISOString();
    for (const notification of notifications) {
      await base44.entities.Notification.update(notification.id, {
        read: true,
        read_at: now
      });
    }

    return Response.json({ 
      success: true,
      count: notifications.length 
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});