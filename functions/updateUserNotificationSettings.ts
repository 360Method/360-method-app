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

    const updates = await req.json();

    // Get existing settings
    const settingsRecords = await helper.entities.UserNotificationSettings.filter({
      user_id: user.id
    });

    let settings;
    if (settingsRecords && settingsRecords.length > 0) {
      // Update existing
      settings = await helper.entities.UserNotificationSettings.update(
        settingsRecords[0].id,
        updates
      );
    } else {
      // Create new
      settings = await helper.entities.UserNotificationSettings.create({
        user_id: user.id,
        ...updates
      });
    }

    return Response.json({ settings }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
