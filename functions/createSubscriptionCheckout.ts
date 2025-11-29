import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
import Stripe from 'npm:stripe@14.11.0';

/**
 * Creates a Stripe Checkout session for subscription signups.
 * Supports both fixed-price tiers (Homeowner+, Elite) and usage-based tiers (Pioneer, Commander).
 *
 * Usage-based tiers create subscriptions with two items:
 * 1. Base price (monthly/annual fixed fee)
 * 2. Metered usage price (per-door charges billed at period end)
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
      usagePriceKey: 'stripe_price_pioneer_usage',
      includedDoors: 3
    },
    'annual': {
      basePriceKey: 'stripe_price_pioneer_annual',
      usagePriceKey: 'stripe_price_pioneer_usage',
      includedDoors: 3
    }
  },
  'better': { // Commander
    'monthly': {
      basePriceKey: 'stripe_price_commander_monthly',
      usagePriceKey: 'stripe_price_commander_usage',
      includedDoors: 15
    },
    'annual': {
      basePriceKey: 'stripe_price_commander_annual',
      usagePriceKey: 'stripe_price_commander_usage',
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
async function getPriceId(helper: any, settingKey: string): Promise<string | null> {
  try {
    const settings = await helper.asServiceRole.entities.PlatformSettings.filter({
      setting_key: settingKey
    });
    if (settings && settings.length > 0) {
      return (settings[0] as any).setting_value;
    }
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
    const helper = createHelperFromRequest(req);

    // Get user info from request body (since we use Clerk auth, not Supabase auth)
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

    // Create a user object from the request data
    const user = {
      id: user_id,
      email: user_email,
      user_metadata: {
        full_name: user_name
      }
    };

    if (!tier) {
      return Response.json({ error: 'Missing tier parameter' }, { status: 400, headers: corsHeaders });
    }

    if (!success_url || !cancel_url) {
      return Response.json({ error: 'Missing success_url or cancel_url' }, { status: 400, headers: corsHeaders });
    }

    // Free tier doesn't need Stripe
    if (tier === 'free') {
      // Update user tier in users table
      try {
        await helper.asServiceRole.entities.User.update(user.id, { tier: 'free' });
      } catch (e) {
        console.log('Could not update user tier:', e);
      }

      // Cancel any existing subscription
      const existingSub = await helper.asServiceRole.entities.UserSubscription.filter({
        user_id: user.id,
        status: 'active'
      });

      if (existingSub && existingSub.length > 0) {
        const stripe = getStripeClient();
        const sub = existingSub[0] as any;
        if (sub.stripe_subscription_id) {
          await stripe.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: true
          });
        }
      }

      return Response.json({
        success: true,
        message: 'Switched to free tier',
        redirect_url: success_url
      }, { headers: corsHeaders });
    }

    // Validate tier and billing cycle
    const tierConfig = TIER_CONFIGS[tier]?.[billing_cycle];
    if (!tierConfig) {
      return Response.json({
        error: `Invalid tier (${tier}) or billing cycle (${billing_cycle})`
      }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Try to get existing Stripe customer ID from users table
    let stripeCustomerId: string | undefined;
    try {
      const existingUser = await helper.asServiceRole.entities.User.get(user.id);
      stripeCustomerId = existingUser?.stripe_customer_id;
    } catch (e) {
      // User might not exist in table yet
    }

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
          user_id: user.id
        }
      });
      stripeCustomerId = customer.id;

      // Save Stripe customer ID to users table
      try {
        await helper.asServiceRole.entities.User.update(user.id, {
          stripe_customer_id: stripeCustomerId
        });
      } catch (e) {
        // If user doesn't exist, create them
        try {
          await helper.asServiceRole.entities.User.create({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            stripe_customer_id: stripeCustomerId
          });
        } catch (createErr) {
          console.log('Could not create/update user:', createErr);
        }
      }
    }

    // Get base price ID from platform settings
    const basePriceId = await getPriceId(helper, tierConfig.basePriceKey);
    if (!basePriceId) {
      return Response.json({
        error: `Stripe products not configured for ${tier}. Please run setupStripeProducts first.`
      }, { status: 400, headers: corsHeaders });
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: basePriceId,
        quantity: 1
      }
    ];

    // For usage-based tiers, add the metered price item
    if (tierConfig.usagePriceKey) {
      const usagePriceId = await getPriceId(helper, tierConfig.usagePriceKey);
      if (usagePriceId) {
        lineItems.push({
          price: usagePriceId
          // No quantity for metered prices - usage is reported separately
        });
      }
    }

    // Check for existing active subscription
    const existingSubscriptions = await helper.asServiceRole.entities.UserSubscription.filter({
      user_id: user.id
    });

    const hasActiveSubscription = existingSubscriptions?.some((sub: any) =>
      ['active', 'trialing'].includes(sub.status)
    );

    // Create Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
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
    };

    // If upgrading, mark it as such
    if (hasActiveSubscription) {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        metadata: {
          ...sessionParams.subscription_data?.metadata,
          is_upgrade: 'true'
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      tier: tier,
      billing_cycle: billing_cycle,
      is_usage_based: !!tierConfig.usagePriceKey
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500, headers: corsHeaders });
  }
});
