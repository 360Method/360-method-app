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

    // Check if customer already exists
    if (user.user_metadata?.stripe_customer_id) {
      return Response.json({ stripe_customer_id: user.user_metadata.stripe_customer_id }, { headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.user_metadata?.full_name,
      metadata: {
        user_id: user.id
      }
    });

    // Update User entity
    await helper.auth.updateMe({
      stripe_customer_id: customer.id
    });

    return Response.json({ stripe_customer_id: customer.id }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error creating Stripe customer:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
