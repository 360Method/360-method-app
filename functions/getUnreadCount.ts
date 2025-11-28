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

    const notifications = await helper.entities.Notification.filter({
      user_id: user.id,
      read: false,
      dismissed: false
    });

    return Response.json({ 
      count: notifications.length 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
