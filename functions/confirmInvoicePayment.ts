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

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return Response.json({ error: 'Missing transaction_id' }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Get transaction
    const transactions = await helper.entities.Transaction.filter({ id: transaction_id });
    if (!transactions || transactions.length === 0) {
      return Response.json({ error: 'Transaction not found' }, { status: 404, headers: corsHeaders });
    }
    const transaction = transactions[0] as any;

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(transaction.stripe_payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update Transaction
      await helper.entities.Transaction.update(transaction_id, {
        status: 'succeeded',
        stripe_charge_id: paymentIntent.latest_charge,
        stripe_transfer_id: paymentIntent.transfer_data?.destination,
        processed_at: new Date().toISOString()
      });

      // Update Invoice
      await helper.entities.ServicePackage.update(transaction.invoice_id, {
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        paid_amount: transaction.amount_total
      });

      return Response.json({ status: 'succeeded', transaction }, { headers: corsHeaders });
    } else if (paymentIntent.status === 'requires_payment_method') {
      await helper.entities.Transaction.update(transaction_id, {
        status: 'failed',
        failure_reason: 'Payment method failed'
      });

      return Response.json({ status: 'failed', error: 'Payment method failed' }, { status: 400, headers: corsHeaders });
    }

    return Response.json({ status: paymentIntent.status }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
