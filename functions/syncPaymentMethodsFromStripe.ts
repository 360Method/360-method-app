import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !user.stripe_customer_id) {
      return Response.json({ payment_methods: [] });
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card'
    });

    // Get customer to check default payment method
    const customer = await stripe.customers.retrieve(user.stripe_customer_id);
    const defaultPmId = customer.invoice_settings?.default_payment_method;

    // Sync with database
    for (const pm of paymentMethods.data) {
      // Check if already exists
      const existing = await base44.entities.PaymentMethod.filter({
        stripe_payment_method_id: pm.id
      });

      if (existing.length === 0) {
        // Create new record
        await base44.entities.PaymentMethod.create({
          user_id: user.id,
          stripe_payment_method_id: pm.id,
          stripe_customer_id: user.stripe_customer_id,
          card_brand: pm.card.brand,
          card_last_four: pm.card.last4,
          card_exp_month: pm.card.exp_month,
          card_exp_year: pm.card.exp_year,
          is_default: pm.id === defaultPmId,
          status: 'active'
        });
      }
    }

    // Get updated list
    const methods = await base44.entities.PaymentMethod.filter({
      user_id: user.id,
      status: 'active'
    });

    return Response.json({ payment_methods: methods });
  } catch (error) {
    console.error('Error syncing payment methods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});