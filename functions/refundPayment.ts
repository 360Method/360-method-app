import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transaction_id, amount, reason } = await req.json();

    if (!transaction_id) {
      return Response.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    // Get transaction
    const transactions = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
    if (!transactions || transactions.length === 0) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }
    const transaction = transactions[0];

    if (transaction.status !== 'succeeded') {
      return Response.json({ error: 'Transaction cannot be refunded' }, { status: 400 });
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
    await base44.asServiceRole.entities.Transaction.update(transaction_id, {
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      stripe_refund_id: refund.id,
      refunded_at: new Date().toISOString(),
      refund_reason: reason
    });

    // Update invoice
    if (transaction.invoice_id) {
      await base44.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
        payment_status: isFullRefund ? 'refunded' : 'partially_paid'
      });
    }

    return Response.json({ success: true, refund });
  } catch (error) {
    console.error('Error refunding payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});