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
      user_id: user.id
    });

    if (!methods || methods.length === 0) {
      return Response.json({ error: 'Payment method not found' }, { status: 404 });
    }

    const method = methods[0];

    // Detach from Stripe Customer
    await stripe.paymentMethods.detach(method.stripe_payment_method_id);

    // Update status
    await base44.entities.PaymentMethod.update(payment_method_id, {
      status: 'removed'
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});