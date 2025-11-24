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

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return Response.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    // Get transaction
    const transactions = await base44.entities.Transaction.filter({ id: transaction_id });
    if (!transactions || transactions.length === 0) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }
    const transaction = transactions[0];

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(transaction.stripe_payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update Transaction
      await base44.entities.Transaction.update(transaction_id, {
        status: 'succeeded',
        stripe_charge_id: paymentIntent.latest_charge,
        stripe_transfer_id: paymentIntent.transfer_data?.destination,
        processed_at: new Date().toISOString()
      });

      // Update Invoice
      await base44.entities.ServicePackage.update(transaction.invoice_id, {
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        paid_amount: transaction.amount_total
      });

      return Response.json({ status: 'succeeded', transaction });
    } else if (paymentIntent.status === 'requires_payment_method') {
      await base44.entities.Transaction.update(transaction_id, {
        status: 'failed',
        failure_reason: 'Payment method failed'
      });

      return Response.json({ status: 'failed', error: 'Payment method failed' }, { status: 400 });
    }

    return Response.json({ status: paymentIntent.status });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});