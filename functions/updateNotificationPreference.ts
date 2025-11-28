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

    const { notification_category, ...updates } = await req.json();

    if (!notification_category) {
      return Response.json({ error: 'Missing notification_category' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get existing preference
    const prefRecords = await helper.entities.NotificationPreference.filter({
      user_id: user.id,
      notification_category: notification_category
    });

    let preference;
    if (prefRecords && prefRecords.length > 0) {
      // Update existing
      preference = await helper.entities.NotificationPreference.update(
        prefRecords[0].id,
        updates
      );
    } else {
      // Create new
      preference = await helper.entities.NotificationPreference.create({
        user_id: user.id,
        notification_category,
        ...updates
      });
    }

    return Response.json({ preference }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
