import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
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
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operator_id, return_url, refresh_url } = await req.json();

    if (!operator_id || !return_url || !refresh_url) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stripe = getStripeClient();

    // Create Stripe Connect Account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual'
    });

    // Create OperatorStripeAccount record
    await base44.asServiceRole.entities.OperatorStripeAccount.create({
      operator_id,
      user_id: user.id,
      stripe_account_id: account.id,
      stripe_account_status: 'pending',
      onboarding_complete: false,
      charges_enabled: false,
      payouts_enabled: false,
      country: 'US',
      default_currency: 'usd'
    });

    // Generate Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refresh_url,
      return_url: return_url,
      type: 'account_onboarding'
    });

    return Response.json({
      onboarding_url: accountLink.url,
      stripe_account_id: account.id
    });
  } catch (error) {
    console.error('Error creating operator connect account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});