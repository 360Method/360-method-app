import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription, device_info } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return Response.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Check if subscription already exists
    const existingSubs = await base44.entities.PushSubscription.filter({
      user_id: user.id,
      endpoint: subscription.endpoint
    });

    let pushSubscription;
    if (existingSubs && existingSubs.length > 0) {
      // Update existing
      pushSubscription = await base44.entities.PushSubscription.update(
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
      pushSubscription = await base44.entities.PushSubscription.create({
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
    });
  } catch (error) {
    console.error('Error registering push subscription:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});