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

    const { setup_intent_id } = await req.json();

    if (!setup_intent_id) {
      return Response.json({ error: 'Missing setup_intent_id' }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Retrieve SetupIntent
    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);

    if (setupIntent.status !== 'succeeded') {
      return Response.json({ error: 'Setup not complete' }, { status: 400, headers: corsHeaders });
    }

    // Retrieve PaymentMethod
    const paymentMethod = await stripe.paymentMethods.retrieve(setupIntent.payment_method as string);

    // Check if this is the first payment method
    const existingMethods = await helper.entities.PaymentMethod.filter({
      user_id: user.id,
      status: 'active'
    });
    const isFirst = existingMethods.length === 0;

    // Create PaymentMethod entity record
    const pmRecord = await helper.entities.PaymentMethod.create({
      user_id: user.id,
      stripe_payment_method_id: paymentMethod.id,
      stripe_customer_id: setupIntent.customer,
      card_brand: paymentMethod.card?.brand,
      card_last_four: paymentMethod.card?.last4,
      card_exp_month: paymentMethod.card?.exp_month,
      card_exp_year: paymentMethod.card?.exp_year,
      is_default: isFirst,
      status: 'active'
    });

    // If first payment method, set as default on Stripe Customer
    if (isFirst && setupIntent.customer) {
      await stripe.customers.update(setupIntent.customer as string, {
        invoice_settings: {
          default_payment_method: paymentMethod.id
        }
      });
    }

    return Response.json({
      success: true,
      payment_method_id: paymentMethod.id,
      payment_method: pmRecord
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error confirming payment method setup:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
