import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';
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
    const supabase = createServiceClient();

    // Get user_id from request body (since we use Clerk auth, not Supabase auth)
    let userId: string | null = null;

    try {
      const body = await req.json();
      userId = body.user_id;
    } catch {
      // No body provided
    }

    if (!userId) {
      return Response.json({ error: 'Missing user_id' }, { status: 401, headers: corsHeaders });
    }

    // Get user's subscription from database
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      // No subscription - user is on free tier
      return Response.json({
        success: true,
        has_subscription: false,
        tier: 'free',
        subscription: null
      }, { headers: corsHeaders });
    }

    const subscription = subscriptions[0];

    // If we have a Stripe subscription ID, fetch latest from Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripe = getStripeClient();
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

        // Sync any differences from Stripe
        const updates: any = {};
        let needsUpdate = false;

        if (stripeSubscription.status !== subscription.status) {
          updates.status = stripeSubscription.status;
          needsUpdate = true;
        }

        if (stripeSubscription.cancel_at_period_end !== subscription.cancel_at_period_end) {
          updates.cancel_at_period_end = stripeSubscription.cancel_at_period_end;
          needsUpdate = true;
        }

        const periodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
        if (periodEnd !== subscription.current_period_end) {
          updates.current_period_end = periodEnd;
          updates.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
          needsUpdate = true;
        }

        if (needsUpdate) {
          await supabase
            .from('user_subscriptions')
            .update(updates)
            .eq('id', subscription.id);
          Object.assign(subscription, updates);
        }
      } catch (stripeError: any) {
        console.error('Error fetching Stripe subscription:', stripeError.message);
        // Continue with local data if Stripe fetch fails
      }
    }

    // Get payment method info if available
    let paymentMethod = null;
    if (subscription.stripe_customer_id) {
      const { data: paymentMethods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .eq('status', 'active')
        .limit(1);

      if (paymentMethods && paymentMethods.length > 0) {
        const pm = paymentMethods[0];
        paymentMethod = {
          brand: pm.card_brand,
          last4: pm.card_last4,
          exp_month: pm.card_exp_month,
          exp_year: pm.card_exp_year
        };
      }
    }

    // Calculate days remaining
    let daysRemaining = null;
    if (subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'subscription')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentTransactions = (transactions || []).map((t: any) => ({
      id: t.id,
      amount: t.amount_total / 100,
      currency: t.currency,
      status: t.status,
      date: t.created_at,
      description: t.description
    }));

    return Response.json({
      success: true,
      has_subscription: true,
      tier: subscription.tier || 'free',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        billing_cycle: subscription.billing_cycle,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        trial_end: subscription.trial_end,
        days_remaining: daysRemaining,
        is_active: ['active', 'trialing'].includes(subscription.status),
        is_past_due: subscription.status === 'past_due'
      },
      payment_method: paymentMethod,
      recent_transactions: recentTransactions
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500, headers: corsHeaders });
  }
});
