import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';
import Stripe from 'npm:stripe@14.11.0';

/**
 * Creates a Stripe Checkout session for NEW subscriptions,
 * OR upgrades/downgrades an EXISTING subscription with proration.
 */

// Tier configuration with billing cycle support
interface TierConfig {
  basePriceKey: string;
  usagePriceKey?: string;
  includedDoors?: number;
}

const TIER_CONFIGS: Record<string, Record<string, TierConfig>> = {
  'homeowner_plus': {
    'monthly': { basePriceKey: 'stripe_price_homeowner_plus_monthly' },
    'annual': { basePriceKey: 'stripe_price_homeowner_plus_annual' }
  },
  'good': { // Pioneer
    'monthly': {
      basePriceKey: 'stripe_price_pioneer_monthly',
      usagePriceKey: 'stripe_price_pioneer_usage_monthly',
      includedDoors: 3
    },
    'annual': {
      basePriceKey: 'stripe_price_pioneer_annual',
      usagePriceKey: 'stripe_price_pioneer_usage_annual',
      includedDoors: 3
    }
  },
  'better': { // Commander
    'monthly': {
      basePriceKey: 'stripe_price_commander_monthly',
      usagePriceKey: 'stripe_price_commander_usage_monthly',
      includedDoors: 15
    },
    'annual': {
      basePriceKey: 'stripe_price_commander_annual',
      usagePriceKey: 'stripe_price_commander_usage_annual',
      includedDoors: 15
    }
  },
  'best': { // Elite
    'monthly': { basePriceKey: 'stripe_price_elite_monthly' },
    'annual': { basePriceKey: 'stripe_price_elite_annual' }
  }
};

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

// Helper to get price ID from platform settings
async function getPriceId(supabase: any, settingKey: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error) {
      console.log(`Error finding setting ${settingKey}:`, error.message);
      return null;
    }
    return data?.setting_value || null;
  } catch (e) {
    console.log(`Could not find setting: ${settingKey}`);
  }
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    const {
      tier,
      billing_cycle = 'annual',
      success_url,
      cancel_url,
      user_id,
      user_email,
      user_name,
      total_doors = 1
    } = await req.json();

    // Validate user info
    if (!user_id || !user_email) {
      return Response.json({ error: 'Missing user information' }, { status: 401, headers: corsHeaders });
    }

    const user = {
      id: user_id,
      email: user_email,
      user_metadata: { full_name: user_name }
    };

    if (!tier) {
      return Response.json({ error: 'Missing tier parameter' }, { status: 400, headers: corsHeaders });
    }

    if (!success_url || !cancel_url) {
      return Response.json({ error: 'Missing success_url or cancel_url' }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Check for existing active subscription
    const { data: existingSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing']);

    const existingSubscription = existingSubscriptions?.[0];

    // ============================================
    // HANDLE FREE TIER (Downgrade/Cancel)
    // ============================================
    if (tier === 'free') {
      try {
        await supabase.from('users').update({ tier: 'free' }).eq('id', user.id);
      } catch (e) {
        // Table may not exist
      }

      if (existingSubscription?.stripe_subscription_id) {
        // Cancel at period end (user keeps access until billing period ends)
        await stripe.subscriptions.update(existingSubscription.stripe_subscription_id, {
          cancel_at_period_end: true
        });

        // Update our database
        await supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id);
      }

      return Response.json({
        success: true,
        message: 'Subscription will be canceled at period end',
        redirect_url: success_url
      }, { headers: corsHeaders });
    }

    // ============================================
    // VALIDATE TIER CONFIG
    // ============================================
    const tierConfig = TIER_CONFIGS[tier]?.[billing_cycle];
    if (!tierConfig) {
      return Response.json({
        error: `Invalid tier (${tier}) or billing cycle (${billing_cycle})`
      }, { status: 400, headers: corsHeaders });
    }

    // Get price ID
    const newPriceId = await getPriceId(supabase, tierConfig.basePriceKey);
    if (!newPriceId) {
      return Response.json({
        error: `Stripe products not configured for ${tier}. Please run setupStripeProducts first.`
      }, { status: 400, headers: corsHeaders });
    }

    // ============================================
    // UPGRADE/DOWNGRADE EXISTING SUBSCRIPTION
    // ============================================
    if (existingSubscription?.stripe_subscription_id) {
      console.log(`Upgrading/downgrading subscription ${existingSubscription.stripe_subscription_id} to ${tier}`);

      try {
        // Get the current Stripe subscription to find the subscription item ID
        const stripeSubscription = await stripe.subscriptions.retrieve(existingSubscription.stripe_subscription_id);

        if (stripeSubscription.status === 'canceled') {
          // Subscription is fully canceled, need to create new one
          console.log('Existing subscription is canceled, creating new one');
        } else {
          // Update the existing subscription with proration
          const subscriptionItemId = stripeSubscription.items.data[0]?.id;

          if (!subscriptionItemId) {
            throw new Error('No subscription item found');
          }

          // Update subscription with new price - Stripe handles proration automatically
          const updatedSubscription = await stripe.subscriptions.update(
            existingSubscription.stripe_subscription_id,
            {
              items: [{
                id: subscriptionItemId,
                price: newPriceId,
              }],
              proration_behavior: 'create_prorations', // Automatically prorate
              metadata: {
                user_id: user.id,
                tier: tier,
                billing_cycle: billing_cycle,
              }
            }
          );

          // Update our database
          await supabase
            .from('user_subscriptions')
            .update({
              tier: tier,
              billing_cycle: billing_cycle,
              stripe_price_id: newPriceId,
              cancel_at_period_end: false, // Reset if they were going to cancel
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSubscription.id);

          // Update user tier
          try {
            await supabase
              .from('users')
              .update({ tier: tier, billing_cycle: billing_cycle })
              .eq('id', user.id);
          } catch (e) {
            // Table may not exist
          }

          // Invoke updateUserTier to update Clerk
          try {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
            await fetch(`${supabaseUrl}/functions/v1/updateUserTier`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({
                user_id: user.id,
                tier: tier,
                billing_cycle: billing_cycle
              }),
            });
          } catch (e) {
            console.error('Failed to update user tier in Clerk:', e);
          }

          return Response.json({
            success: true,
            message: `Subscription updated to ${tier} with proration`,
            tier: tier,
            billing_cycle: billing_cycle,
            prorated: true,
            redirect_url: success_url
          }, { headers: corsHeaders });
        }
      } catch (upgradeError: any) {
        console.error('Error upgrading subscription:', upgradeError.message);
        // Fall through to create new subscription if upgrade fails
      }
    }

    // ============================================
    // CREATE NEW SUBSCRIPTION (No existing subscription)
    // ============================================

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;

    // Check user_subscriptions for existing customer ID
    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
    }

    // Check users table
    if (!stripeCustomerId) {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', user.id)
          .single();
        stripeCustomerId = existingUser?.stripe_customer_id;
      } catch (e) {
        // User not found
      }
    }

    // Create new customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: { user_id: user.id }
      });
      stripeCustomerId = customer.id;

      // Save customer ID
      try {
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            stripe_customer_id: stripeCustomerId
          }, { onConflict: 'id' });
      } catch (e) {
        console.log('Could not save customer ID:', e);
      }
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: newPriceId, quantity: 1 }
    ];

    // Add usage-based pricing if applicable
    if (tierConfig.usagePriceKey && tierConfig.includedDoors) {
      const extraDoors = Math.max(0, total_doors - tierConfig.includedDoors);
      if (extraDoors > 0) {
        const usagePriceId = await getPriceId(supabase, tierConfig.usagePriceKey);
        if (usagePriceId) {
          lineItems.push({ price: usagePriceId, quantity: extraDoors });
        }
      }
    }

    // Create Checkout Session for new subscription
    const separator = success_url.includes('?') ? '&' : '?';
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${success_url}${separator}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        tier: tier,
        billing_cycle: billing_cycle,
        total_doors: String(total_doors)
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier: tier,
          billing_cycle: billing_cycle,
          included_doors: tierConfig.includedDoors ? String(tierConfig.includedDoors) : '0'
        }
      },
      allow_promotion_codes: true,
    });

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      tier: tier,
      billing_cycle: billing_cycle,
      is_new_subscription: true
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500, headers: corsHeaders });
  }
});
