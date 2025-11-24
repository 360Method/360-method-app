import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Find transaction
        const transactions = await base44.asServiceRole.entities.Transaction.filter({
          stripe_payment_intent_id: paymentIntent.id
        });
        
        if (transactions && transactions.length > 0) {
          const transaction = transactions[0];
          
          // Update transaction
          await base44.asServiceRole.entities.Transaction.update(transaction.id, {
            status: 'succeeded',
            stripe_charge_id: paymentIntent.latest_charge,
            processed_at: new Date().toISOString()
          });
          
          // Update invoice
          if (transaction.invoice_id) {
            await base44.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
              payment_status: 'paid',
              paid_at: new Date().toISOString(),
              paid_amount: transaction.amount_total
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        const transactions = await base44.asServiceRole.entities.Transaction.filter({
          stripe_payment_intent_id: paymentIntent.id
        });
        
        if (transactions && transactions.length > 0) {
          const transaction = transactions[0];
          
          await base44.asServiceRole.entities.Transaction.update(transaction.id, {
            status: 'failed',
            failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed'
          });
          
          if (transaction.invoice_id) {
            await base44.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
              payment_status: 'unpaid'
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        
        const transactions = await base44.asServiceRole.entities.Transaction.filter({
          stripe_charge_id: charge.id
        });
        
        if (transactions && transactions.length > 0) {
          const transaction = transactions[0];
          
          await base44.asServiceRole.entities.Transaction.update(transaction.id, {
            status: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_refunded',
            stripe_refund_id: charge.refunds.data[0]?.id,
            refunded_at: new Date().toISOString()
          });
          
          if (transaction.invoice_id) {
            await base44.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
              payment_status: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_paid'
            });
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        
        const operatorAccounts = await base44.asServiceRole.entities.OperatorStripeAccount.filter({
          stripe_account_id: account.id
        });
        
        if (operatorAccounts && operatorAccounts.length > 0) {
          const operatorAccount = operatorAccounts[0];
          
          await base44.asServiceRole.entities.OperatorStripeAccount.update(operatorAccount.id, {
            stripe_account_status: account.details_submitted ? 'active' : 'requires_information',
            onboarding_complete: account.details_submitted,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            requirements_due: account.requirements?.currently_due || [],
            last_stripe_sync: new Date().toISOString()
          });
          
          if (operatorAccount.operator_id) {
            await base44.asServiceRole.entities.Operator.update(operatorAccount.operator_id, {
              stripe_connected: account.details_submitted && account.charges_enabled
            });
          }
        }
        break;
      }

      case 'account.application.deauthorized': {
        const account = event.data.object;
        
        const operatorAccounts = await base44.asServiceRole.entities.OperatorStripeAccount.filter({
          stripe_account_id: account.id
        });
        
        if (operatorAccounts && operatorAccounts.length > 0) {
          const operatorAccount = operatorAccounts[0];
          
          await base44.asServiceRole.entities.OperatorStripeAccount.update(operatorAccount.id, {
            stripe_account_status: 'disabled',
            onboarding_complete: false,
            charges_enabled: false,
            payouts_enabled: false
          });
          
          if (operatorAccount.operator_id) {
            await base44.asServiceRole.entities.Operator.update(operatorAccount.operator_id, {
              stripe_connected: false,
              stripe_account_id: null
            });
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});