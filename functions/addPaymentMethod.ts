import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { return_url } = await req.json();

    if (!return_url) {
      return Response.json({ error: 'Missing return_url' }, { status: 400 });
    }

    // Ensure user has Stripe Customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Create Checkout Session for setup
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: return_url,
      cancel_url: return_url.replace('setup=complete', 'setup=cancelled')
    });

    return Response.json({
      setup_url: session.url,
      session_id: session.id,
      stripe_customer_id: customerId
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});