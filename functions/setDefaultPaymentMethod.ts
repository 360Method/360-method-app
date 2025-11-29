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

    // Get user info and payment method ID from request body
    const { payment_method_id, user_id } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'Missing user information' }, {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!payment_method_id) {
      return Response.json({ error: 'Missing payment_method_id' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get PaymentMethod record
    const methods = await helper.asServiceRole.entities.PaymentMethod.filter({
      id: payment_method_id,
      user_id: user_id,
      status: 'active'
    });

    if (!methods || methods.length === 0) {
      return Response.json({ error: 'Payment method not found' }, {
        status: 404,
        headers: corsHeaders
      });
    }

    const method = methods[0] as any;
    const stripe = getStripeClient();

    // Update Stripe Customer default
    await stripe.customers.update(method.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: method.stripe_payment_method_id
      }
    });

    // Update all user's payment methods
    const allMethods = await helper.asServiceRole.entities.PaymentMethod.filter({
      user_id: user_id,
      status: 'active'
    });

    for (const pm of allMethods as any[]) {
      await helper.asServiceRole.entities.PaymentMethod.update(pm.id, {
        is_default: pm.id === payment_method_id
      });
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: corsHeaders
    });
  }
});
