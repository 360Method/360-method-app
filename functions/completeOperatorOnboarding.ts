import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
import Stripe from 'npm:stripe@14.11.0';

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

    const { operator_id } = await req.json();

    if (!operator_id) {
      return Response.json({ error: 'Missing operator_id' }, { status: 400, headers: corsHeaders });
    }

    // Get OperatorStripeAccount
    const accounts = await helper.asServiceRole.entities.OperatorStripeAccount.filter({
      operator_id,
      user_id: user.id
    });

    if (!accounts || accounts.length === 0) {
      return Response.json({ error: 'Stripe account not found' }, { status: 404, headers: corsHeaders });
    }

    const operatorAccount = accounts[0] as any;

    const stripe = getStripeClient();

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(operatorAccount.stripe_account_id);

    // Update OperatorStripeAccount
    await helper.asServiceRole.entities.OperatorStripeAccount.update(operatorAccount.id, {
      stripe_account_status: account.details_submitted ? 'active' : 'requires_information',
      onboarding_complete: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements_due: account.requirements?.currently_due || [],
      last_stripe_sync: new Date().toISOString()
    });

    // Update Operator entity
    const operators = await helper.asServiceRole.entities.Operator.filter({ id: operator_id });
    if (operators && operators.length > 0) {
      await helper.asServiceRole.entities.Operator.update(operator_id, {
        stripe_connected: account.details_submitted && account.charges_enabled,
        stripe_account_id: operatorAccount.stripe_account_id
      });
    }

    return Response.json({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_complete: account.details_submitted,
      requirements_due: account.requirements?.currently_due || []
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error completing operator onboarding:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
