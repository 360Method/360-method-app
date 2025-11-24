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

    const { setup_intent_id } = await req.json();

    if (!setup_intent_id) {
      return Response.json({ error: 'Missing setup_intent_id' }, { status: 400 });
    }

    // Retrieve SetupIntent
    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);

    if (setupIntent.status !== 'succeeded') {
      return Response.json({ error: 'Setup not complete' }, { status: 400 });
    }

    // Retrieve PaymentMethod
    const paymentMethod = await stripe.paymentMethods.retrieve(setupIntent.payment_method);

    // Check if this is the first payment method
    const existingMethods = await base44.entities.PaymentMethod.filter({
      user_id: user.id,
      status: 'active'
    });
    const isFirst = existingMethods.length === 0;

    // Create PaymentMethod entity record
    const pmRecord = await base44.entities.PaymentMethod.create({
      user_id: user.id,
      stripe_payment_method_id: paymentMethod.id,
      stripe_customer_id: setupIntent.customer,
      card_brand: paymentMethod.card.brand,
      card_last_four: paymentMethod.card.last4,
      card_exp_month: paymentMethod.card.exp_month,
      card_exp_year: paymentMethod.card.exp_year,
      is_default: isFirst,
      status: 'active'
    });

    // If first payment method, set as default on Stripe Customer
    if (isFirst) {
      await stripe.customers.update(setupIntent.customer, {
        invoice_settings: {
          default_payment_method: paymentMethod.id
        }
      });
    }

    return Response.json(pmRecord);
  } catch (error) {
    console.error('Error confirming payment method setup:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});