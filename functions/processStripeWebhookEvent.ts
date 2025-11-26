import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { webhook_event_id } = await req.json();

    if (!webhook_event_id) {
      return Response.json({ error: 'Missing webhook_event_id' }, { status: 400 });
    }

    // Get webhook event
    const events = await base44.asServiceRole.entities.WebhookEvent.filter({
      id: webhook_event_id
    });

    if (!events || events.length === 0) {
      return Response.json({ error: 'Webhook event not found' }, { status: 404 });
    }

    const webhookEvent = events[0];

    if (webhookEvent.status === 'processed') {
      return Response.json({ success: true, already_processed: true });
    }

    // Update to processing
    await base44.asServiceRole.entities.WebhookEvent.update(webhook_event_id, {
      status: 'processing',
      attempts: (webhookEvent.attempts || 0) + 1,
      last_attempt_at: new Date().toISOString()
    });

    // Route to appropriate handler
    try {
      switch (webhookEvent.event_type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(base44, webhookEvent.payload);
          break;
        case 'invoice.paid':
          await handleInvoicePaid(base44, webhookEvent.payload);
          break;
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(base44, webhookEvent.payload);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(base44, webhookEvent.payload);
          break;
        case 'charge.refunded':
          await handleChargeRefunded(base44, webhookEvent.payload);
          break;
        case 'account.updated':
          await handleAccountUpdated(base44, webhookEvent.payload);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionEvent(base44, webhookEvent.event_type, webhookEvent.payload);
          break;
        default:
          console.log(`Unhandled webhook event type: ${webhookEvent.event_type}`);
      }

      // Mark as processed
      await base44.asServiceRole.entities.WebhookEvent.update(webhook_event_id, {
        status: 'processed',
        processed_at: new Date().toISOString()
      });

      return Response.json({ success: true });
    } catch (error) {
      // Mark as failed
      await base44.asServiceRole.entities.WebhookEvent.update(webhook_event_id, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handlePaymentIntentSucceeded(base44, paymentIntent) {
  // Find transaction by payment intent ID
  const transactions = await base44.asServiceRole.entities.Transaction.filter({
    stripe_payment_intent_id: paymentIntent.id
  });

  if (!transactions || transactions.length === 0) {
    console.log(`Payment intent ${paymentIntent.id} not found in system`);
    return;
  }

  const transaction = transactions[0];

  // Update transaction
  await base44.asServiceRole.entities.Transaction.update(transaction.id, {
    status: 'succeeded',
    stripe_charge_id: paymentIntent.latest_charge,
    processed_at: new Date().toISOString()
  });

  // Update invoice if exists
  if (transaction.invoice_id) {
    const packages = await base44.asServiceRole.entities.ServicePackage.filter({
      id: transaction.invoice_id
    });

    if (packages && packages.length > 0) {
      await base44.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        paid_amount: paymentIntent.amount,
        transaction_id: transaction.id
      });
    }
  }

  // Trigger success notification
  await base44.asServiceRole.functions.invoke('triggerNotificationEvent', {
    event_type: 'payment_succeeded',
    event_data: {
      transaction_id: transaction.id,
      payer_user_id: transaction.payer_user_id,
      operator_id: transaction.payee_operator_id,
      amount: paymentIntent.amount / 100
    }
  });
}

async function handlePaymentIntentFailed(base44, paymentIntent) {
  const transactions = await base44.asServiceRole.entities.Transaction.filter({
    stripe_payment_intent_id: paymentIntent.id
  });

  if (!transactions || transactions.length === 0) return;

  const transaction = transactions[0];
  const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

  await base44.asServiceRole.entities.Transaction.update(transaction.id, {
    status: 'failed',
    failure_reason: failureMessage
  });

  // Trigger failure notification
  await base44.asServiceRole.functions.invoke('triggerNotificationEvent', {
    event_type: 'payment_failed',
    event_data: {
      transaction_id: transaction.id,
      payer_user_id: transaction.payer_user_id,
      invoice_id: transaction.invoice_id,
      failure_reason: failureMessage
    }
  });
}

async function handleChargeRefunded(base44, charge) {
  const transactions = await base44.asServiceRole.entities.Transaction.filter({
    stripe_charge_id: charge.id
  });

  if (!transactions || transactions.length === 0) return;

  await base44.asServiceRole.entities.Transaction.update(transactions[0].id, {
    status: charge.refunded ? 'refunded' : 'partially_refunded',
    refunded_at: new Date().toISOString()
  });
}

async function handleAccountUpdated(base44, account) {
  const accounts = await base44.asServiceRole.entities.OperatorStripeAccount.filter({
    stripe_account_id: account.id
  });

  if (!accounts || accounts.length === 0) return;

  const operatorAccount = accounts[0];
  const wasNotConnected = !operatorAccount.charges_enabled;

  await base44.asServiceRole.entities.OperatorStripeAccount.update(operatorAccount.id, {
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    stripe_account_status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
    onboarding_complete: account.details_submitted && account.charges_enabled,
    requirements_due: account.requirements?.currently_due || [],
    last_stripe_sync: new Date().toISOString()
  });

  // Update operator
  if (operatorAccount.operator_id) {
    await base44.asServiceRole.entities.Operator.update(operatorAccount.operator_id, {
      stripe_connected: account.charges_enabled && account.payouts_enabled,
      stripe_account_id: account.id
    });

    // Notify if newly activated
    if (account.charges_enabled && wasNotConnected) {
      await base44.asServiceRole.functions.invoke('triggerNotificationEvent', {
        event_type: 'stripe_account_activated',
        event_data: {
          operator_id: operatorAccount.operator_id,
          user_id: operatorAccount.user_id
        }
      });
    }
  }
}

async function handleSubscriptionEvent(base44, eventType, subscription) {
  console.log(`Handling subscription event: ${eventType}`, subscription.id);
  // Subscription handling to be implemented when subscription features are added
}