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

    const { notification_id } = await req.json();

    if (!notification_id) {
      return Response.json({ error: 'Missing notification_id' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Verify notification belongs to user
    const notifications = await helper.entities.Notification.filter({
      id: notification_id,
      user_id: user.id
    });

    if (!notifications || notifications.length === 0) {
      return Response.json({ error: 'Notification not found' }, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Mark as read
    await helper.entities.Notification.update(notification_id, {
      read: true,
      read_at: new Date().toISOString()
    });

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
