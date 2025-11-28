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

    const { subscription, device_info } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return Response.json({ error: 'Invalid subscription data' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Check if subscription already exists
    const existingSubs = await helper.entities.PushSubscription.filter({
      user_id: user.id,
      endpoint: subscription.endpoint
    });

    let pushSubscription;
    if (existingSubs && existingSubs.length > 0) {
      // Update existing
      pushSubscription = await helper.entities.PushSubscription.update(
        existingSubs[0].id,
        {
          keys_p256dh: subscription.keys.p256dh,
          keys_auth: subscription.keys.auth,
          last_used_at: new Date().toISOString(),
          active: true,
          ...device_info
        }
      );
    } else {
      // Create new
      pushSubscription = await helper.entities.PushSubscription.create({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        device_type: device_info?.device_type || 'web',
        device_name: device_info?.device_name || 'Web Browser',
        browser: device_info?.browser || 'Unknown',
        last_used_at: new Date().toISOString(),
        active: true
      });
    }

    return Response.json({ 
      success: true,
      subscription_id: pushSubscription.id 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error registering push subscription:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
