import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    
    const {
      user_id,
      title,
      body,
      action_url,
      icon,
      tag,
      require_interaction = false
    } = await req.json();

    // Get user's push subscriptions
    const subscriptions = await helper.asServiceRole.entities.PushSubscription.filter({
      user_id: user_id,
      active: true
    });

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No active push subscriptions',
        delivered_count: 0 
      }, { headers: corsHeaders });
    }

    // Configure web-push (requires VAPID keys in environment)
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@360method.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192.png',
      badge: '/badge-72.png',
      tag: tag || 'notification',
      data: {
        url: action_url,
        timestamp: Date.now()
      },
      requireInteraction: require_interaction
    });

    let successCount = 0;
    const failedSubscriptions: string[] = [];

    // Send to all subscriptions
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys_p256dh,
            auth: subscription.keys_auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        
        // Update last_used_at
        await helper.asServiceRole.entities.PushSubscription.update(subscription.id, {
          last_used_at: new Date().toISOString()
        });
        
        successCount++;
      } catch (error: any) {
        console.error('Push failed for subscription:', subscription.id, error);
        
        // If subscription is no longer valid, mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await helper.asServiceRole.entities.PushSubscription.update(subscription.id, {
            active: false
          });
        }
        
        failedSubscriptions.push(subscription.id);
      }
    }

    return Response.json({ 
      success: true,
      delivered_count: successCount,
      failed_count: failedSubscriptions.length,
      failed_subscriptions: failedSubscriptions
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
