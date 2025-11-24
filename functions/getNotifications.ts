import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const read = url.searchParams.get('read');
    const notification_type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build filter
    const filter = {
      user_id: user.id,
      dismissed: false
    };

    if (read !== null) {
      filter.read = read === 'true';
    }

    if (notification_type) {
      filter.notification_type = notification_type;
    }

    // Get notifications
    const allNotifications = await base44.entities.Notification.filter(filter, '-created_date');

    // Apply pagination
    const notifications = allNotifications.slice(offset, offset + limit);
    const hasMore = allNotifications.length > offset + limit;

    return Response.json({
      notifications,
      total: allNotifications.length,
      has_more: hasMore,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});