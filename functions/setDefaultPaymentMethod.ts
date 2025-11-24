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

    const { payment_method_id } = await req.json();

    if (!payment_method_id) {
      return Response.json({ error: 'Missing payment_method_id' }, { status: 400 });
    }

    // Get PaymentMethod record
    const methods = await base44.entities.PaymentMethod.filter({
      id: payment_method_id,
      user_id: user.id,
      status: 'active'
    });

    if (!methods || methods.length === 0) {
      return Response.json({ error: 'Payment method not found' }, { status: 404 });
    }

    const method = methods[0];

    // Update Stripe Customer default
    await stripe.customers.update(method.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: method.stripe_payment_method_id
      }
    });

    // Update all user's payment methods
    const allMethods = await base44.entities.PaymentMethod.filter({
      user_id: user.id,
      status: 'active'
    });

    for (const pm of allMethods) {
      await base44.asServiceRole.entities.PaymentMethod.update(pm.id, {
        is_default: pm.id === payment_method_id
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});