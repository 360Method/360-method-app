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
    const read = url.searchParams.get('read');
    const notification_type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build filter
    const filter: Record<string, any> = {
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
    const allNotifications = await helper.entities.Notification.filter(filter, '-created_at');

    // Apply pagination
    const notifications = allNotifications.slice(offset, offset + limit);
    const hasMore = allNotifications.length > offset + limit;

    return Response.json({
      notifications,
      total: allNotifications.length,
      has_more: hasMore,
      limit,
      offset
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
