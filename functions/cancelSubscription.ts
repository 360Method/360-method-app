import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
import Stripe from 'npm:stripe@14.11.0';

// Get Stripe client based on mode
function getStripeClient() {
  const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';
  const isTestMode = stripeMode === 'test';

  const stripeSecretKey = isTestMode
    ? Deno.env.get('STRIPE_SECRET_KEY_TEST')
    : Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error(`STRIPE_SECRET_KEY${isTestMode ? '_TEST' : ''} not configured`);
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { cancel_immediately = false } = await req.json();

    // Get user's subscription
    const subscriptions = await helper.asServiceRole.entities.UserSubscription.filter({
      user_id: user.id
    });

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404, headers: corsHeaders });
    }

    const subscription = subscriptions[0] as any;

    if (!subscription.stripe_subscription_id) {
      return Response.json({ error: 'No Stripe subscription linked' }, { status: 400, headers: corsHeaders });
    }

    if (subscription.status === 'canceled') {
      return Response.json({ error: 'Subscription already canceled' }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    if (cancel_immediately) {
      // Cancel immediately
      const canceledSub = await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      
      // Update local record
      await helper.asServiceRole.entities.UserSubscription.update(subscription.id, {
        status: 'canceled',
        canceled_at: new Date().toISOString()
      });

      // Update user tier to free
      await helper.auth.updateMe({ tier: 'free' });

      return Response.json({
        success: true,
        message: 'Subscription canceled immediately',
        subscription: {
          id: subscription.id,
          status: 'canceled',
          canceled_at: new Date().toISOString()
        }
      }, { headers: corsHeaders });

    } else {
      // Cancel at period end (user keeps access until end of billing period)
      const updatedSub = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      });

      // Update local record
      await helper.asServiceRole.entities.UserSubscription.update(subscription.id, {
        cancel_at_period_end: true
      });

      return Response.json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: true,
          current_period_end: subscription.current_period_end
        }
      }, { headers: corsHeaders });
    }

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500, headers: corsHeaders });
  }
});

