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

    const { price_id, mode, success_url, cancel_url } = await req.json();

    if (!price_id || !mode || !success_url || !cancel_url) {
      return Response.json({ 
        error: 'Missing required fields: price_id, mode, success_url, cancel_url' 
      }, { status: 400 });
    }

    if (!['subscription', 'payment'].includes(mode)) {
      return Response.json({ 
        error: 'Mode must be either "subscription" or "payment"' 
      }, { status: 400 });
    }

    const stripe = getStripeClient();

    // Get or create Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id
        }
      });
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await base44.auth.updateMe({ stripe_customer_id: stripeCustomerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: mode,
      line_items: [
        {
          price: price_id,
          quantity: 1
        }
      ],
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        user_email: user.email
      }
    });

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});