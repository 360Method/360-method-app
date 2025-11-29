import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
import Stripe from 'npm:stripe@14.11.0';

/**
 * Reports door/property usage to Stripe for metered billing.
 * Called when user adds/removes properties to update their usage count.
 *
 * Stripe calculates: (total_doors - included_doors) × per_door_rate
 *
 * Pioneer: 3 included doors, $2/door after (max 25)
 * Commander: 15 included doors, $3/door after (max 100)
 */

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

// Tier configurations for usage calculation
const TIER_CONFIG: Record<string, { includedDoors: number; maxDoors: number }> = {
  'good': { includedDoors: 3, maxDoors: 25 },       // Pioneer
  'better': { includedDoors: 15, maxDoors: 100 },   // Commander
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    // Get user info from request body (Clerk auth)
    const { user_id, total_doors } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'Missing user_id' }, { status: 401, headers: corsHeaders });
    }

    if (typeof total_doors !== 'number' || total_doors < 0) {
      return Response.json({ error: 'Invalid total_doors value' }, { status: 400, headers: corsHeaders });
    }

    // Get user's active subscription
    const subscriptions = await helper.asServiceRole.entities.UserSubscription.filter({
      user_id: user_id,
      status: 'active'
    });

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({
        success: false,
        message: 'No active subscription found'
      }, { headers: corsHeaders });
    }

    const subscription = subscriptions[0] as any;
    const tier = subscription.tier;

    // Check if this tier uses metered billing
    if (!TIER_CONFIG[tier]) {
      return Response.json({
        success: true,
        message: `Tier ${tier} does not use metered billing`,
        usage_reported: false
      }, { headers: corsHeaders });
    }

    const config = TIER_CONFIG[tier];
    const stripeSubscriptionId = subscription.stripe_subscription_id;

    if (!stripeSubscriptionId) {
      return Response.json({
        error: 'Subscription has no Stripe subscription ID'
      }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Get the subscription to find the metered subscription item
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Find the metered price item
    const meteredItem = stripeSubscription.items.data.find(item =>
      item.price.recurring?.usage_type === 'metered'
    );

    if (!meteredItem) {
      return Response.json({
        success: true,
        message: 'Subscription has no metered price item',
        usage_reported: false
      }, { headers: corsHeaders });
    }

    // Calculate billable doors (doors over the included amount)
    const billableDoors = Math.max(0, Math.min(total_doors, config.maxDoors) - config.includedDoors);

    // Report usage to Stripe
    // Using 'set' action to set the absolute usage value (not increment)
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      meteredItem.id,
      {
        quantity: billableDoors,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'set'
      }
    );

    // Update subscription record with current door count
    await helper.asServiceRole.entities.UserSubscription.update(subscription.id, {
      current_door_count: total_doors,
      billable_door_count: billableDoors,
      usage_last_reported: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: `Reported ${billableDoors} billable doors to Stripe`,
      usage_reported: true,
      details: {
        total_doors: total_doors,
        included_doors: config.includedDoors,
        billable_doors: billableDoors,
        per_door_rate: tier === 'good' ? 2 : 3,
        estimated_usage_charge: billableDoors * (tier === 'good' ? 2 : 3),
        usage_record_id: usageRecord.id
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error reporting door usage:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
