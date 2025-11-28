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

    const url = new URL(req.url);
    const notification_type = url.searchParams.get('type');

    // Build filter
    const filter: Record<string, any> = {
      user_id: user.id,
      read: false
    };

    if (notification_type) {
      filter.notification_type = notification_type;
    }

    // Get all unread notifications
    const notifications = await helper.entities.Notification.filter(filter);

    // Mark each as read
    const now = new Date().toISOString();
    for (const notification of notifications) {
      await helper.entities.Notification.update(notification.id, {
        read: true,
        read_at: now
      });
    }

    return Response.json({ 
      success: true,
      count: notifications.length 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
