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

    // Check if customer already exists
    if (user.stripe_customer_id) {
      return Response.json({ stripe_customer_id: user.stripe_customer_id });
    }

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name,
      metadata: {
        user_id: user.id
      }
    });

    // Update User entity
    await base44.auth.updateMe({
      stripe_customer_id: customer.id
    });

    return Response.json({ stripe_customer_id: customer.id });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});