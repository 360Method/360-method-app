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

    // Get user info from request body (since we use Clerk auth, not Supabase auth)
    const { return_url, user_id, user_email, user_name } = await req.json();

    // Validate user info
    if (!user_id || !user_email) {
      return Response.json({ error: 'Missing user information' }, {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!return_url) {
      return Response.json({ error: 'Missing return_url' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    const stripe = getStripeClient();

    // Try to get existing Stripe customer ID from users table
    let customerId: string | undefined;
    try {
      const existingUser = await helper.asServiceRole.entities.User.get(user_id);
      customerId = existingUser?.stripe_customer_id;
    } catch (e) {
      // User might not exist in table yet
    }

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user_email,
        name: user_name || user_email,
        metadata: { user_id: user_id }
      });
      customerId = customer.id;

      // Save Stripe customer ID to users table
      try {
        await helper.asServiceRole.entities.User.update(user_id, {
          stripe_customer_id: customerId
        });
      } catch (e) {
        // If user doesn't exist, create them
        try {
          await helper.asServiceRole.entities.User.create({
            id: user_id,
            email: user_email,
            full_name: user_name,
            stripe_customer_id: customerId
          });
        } catch (createErr) {
          console.log('Could not create/update user:', createErr);
        }
      }
    }

    // Create Checkout Session for setup
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: return_url,
      cancel_url: return_url.replace('setup=complete', 'setup=cancelled'),
      metadata: {
        user_id: user_id
      }
    });

    return Response.json({
      setup_url: session.url,
      session_id: session.id,
      stripe_customer_id: customerId
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: corsHeaders
    });
  }
});
