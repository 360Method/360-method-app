import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await base44.entities.Notification.filter({
      user_id: user.id,
      read: false,
      dismissed: false
    });

    return Response.json({ 
      count: notifications.length 
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});