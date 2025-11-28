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

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { transaction_id, amount, reason } = await req.json();

    if (!transaction_id) {
      return Response.json({ error: 'Missing transaction_id' }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Get transaction
    const transactions = await helper.asServiceRole.entities.Transaction.filter({ id: transaction_id });
    if (!transactions || transactions.length === 0) {
      return Response.json({ error: 'Transaction not found' }, { status: 404, headers: corsHeaders });
    }
    const transaction = transactions[0] as any;

    if (transaction.status !== 'succeeded') {
      return Response.json({ error: 'Transaction cannot be refunded' }, { status: 400, headers: corsHeaders });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: transaction.stripe_charge_id,
      amount: amount || transaction.amount_total,
      reason: reason || 'requested_by_customer',
      reverse_transfer: true
    });

    // Update transaction
    const isFullRefund = !amount || amount === transaction.amount_total;
    await helper.asServiceRole.entities.Transaction.update(transaction_id, {
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      stripe_refund_id: refund.id,
      refunded_at: new Date().toISOString(),
      refund_reason: reason
    });

    // Update invoice
    if (transaction.invoice_id) {
      await helper.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
        payment_status: isFullRefund ? 'refunded' : 'partially_paid'
      });
    }

    return Response.json({ success: true, refund }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
