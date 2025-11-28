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
    
    if (!user || !user.user_metadata?.stripe_customer_id) {
      return Response.json({ payment_methods: [] }, { headers: corsHeaders });
    }

    const stripe = getStripeClient();
    const stripeCustomerId = user.user_metadata.stripe_customer_id;

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card'
    });

    // Get customer to check default payment method
    const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
    const defaultPmId = customer.invoice_settings?.default_payment_method;

    // Sync with database
    for (const pm of paymentMethods.data) {
      // Check if already exists
      const existing = await helper.entities.PaymentMethod.filter({
        stripe_payment_method_id: pm.id
      });

      if (existing.length === 0) {
        // Create new record
        await helper.entities.PaymentMethod.create({
          user_id: user.id,
          stripe_payment_method_id: pm.id,
          stripe_customer_id: stripeCustomerId,
          card_brand: pm.card?.brand,
          card_last_four: pm.card?.last4,
          card_exp_month: pm.card?.exp_month,
          card_exp_year: pm.card?.exp_year,
          is_default: pm.id === defaultPmId,
          status: 'active'
        });
      }
    }

    // Get updated list
    const methods = await helper.entities.PaymentMethod.filter({
      user_id: user.id,
      status: 'active'
    });

    return Response.json({ payment_methods: methods }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error syncing payment methods:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
