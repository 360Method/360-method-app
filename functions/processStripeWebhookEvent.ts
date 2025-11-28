import { createHelperFromRequest, corsHeaders, SupabaseHelper } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const { webhook_event_id } = await req.json();

    if (!webhook_event_id) {
      return Response.json({ error: 'Missing webhook_event_id' }, { status: 400, headers: corsHeaders });
    }

    // Get webhook event
    const events = await helper.asServiceRole.entities.WebhookEvent.filter({
      id: webhook_event_id
    });

    if (!events || events.length === 0) {
      return Response.json({ error: 'Webhook event not found' }, { status: 404, headers: corsHeaders });
    }

    const webhookEvent = events[0] as any;

    if (webhookEvent.status === 'processed') {
      return Response.json({ success: true, already_processed: true }, { headers: corsHeaders });
    }

    // Update to processing
    await helper.asServiceRole.entities.WebhookEvent.update(webhook_event_id, {
      status: 'processing',
      attempts: (webhookEvent.attempts || 0) + 1,
      last_attempt_at: new Date().toISOString()
    });

    // Route to appropriate handler
    try {
      switch (webhookEvent.event_type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(helper, webhookEvent.payload);
          break;
        case 'invoice.paid':
          await handleInvoicePaid(helper, webhookEvent.payload);
          break;
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(helper, webhookEvent.payload);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(helper, webhookEvent.payload);
          break;
        case 'charge.refunded':
          await handleChargeRefunded(helper, webhookEvent.payload);
          break;
        case 'account.updated':
          await handleAccountUpdated(helper, webhookEvent.payload);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionEvent(helper, webhookEvent.event_type, webhookEvent.payload);
          break;
        default:
          console.log(`Unhandled webhook event type: ${webhookEvent.event_type}`);
      }

      // Mark as processed
      await helper.asServiceRole.entities.WebhookEvent.update(webhook_event_id, {
        status: 'processed',
        processed_at: new Date().toISOString()
      });

      return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error: any) {
      // Mark as failed
      await helper.asServiceRole.entities.WebhookEvent.update(webhook_event_id, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  } catch (error: any) {
    console.error('Error processing webhook event:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

async function handlePaymentIntentSucceeded(helper: SupabaseHelper, paymentIntent: any) {
  // Find transaction by payment intent ID
  const transactions = await helper.asServiceRole.entities.Transaction.filter({
    stripe_payment_intent_id: paymentIntent.id
  });

  if (!transactions || transactions.length === 0) {
    console.log(`Payment intent ${paymentIntent.id} not found in system`);
    return;
  }

  const transaction = transactions[0] as any;

  // Update transaction
  await helper.asServiceRole.entities.Transaction.update(transaction.id, {
    status: 'succeeded',
    stripe_charge_id: paymentIntent.latest_charge,
    processed_at: new Date().toISOString()
  });

  // Update invoice if exists
  if (transaction.invoice_id) {
    const packages = await helper.asServiceRole.entities.ServicePackage.filter({
      id: transaction.invoice_id
    });

    if (packages && packages.length > 0) {
      await helper.asServiceRole.entities.ServicePackage.update(transaction.invoice_id, {
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        paid_amount: paymentIntent.amount,
        transaction_id: transaction.id
      });
    }
  }

  // Trigger success notification
  await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
    event_type: 'payment_succeeded',
    event_data: {
      transaction_id: transaction.id,
      payer_user_id: transaction.payer_user_id,
      operator_id: transaction.payee_operator_id,
      amount: paymentIntent.amount / 100
    }
  });
}

async function handlePaymentIntentFailed(helper: SupabaseHelper, paymentIntent: any) {
  const transactions = await helper.asServiceRole.entities.Transaction.filter({
    stripe_payment_intent_id: paymentIntent.id
  });

  if (!transactions || transactions.length === 0) return;

  const transaction = transactions[0] as any;
  const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

  await helper.asServiceRole.entities.Transaction.update(transaction.id, {
    status: 'failed',
    failure_reason: failureMessage
  });

  // Trigger failure notification
  await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
    event_type: 'payment_failed',
    event_data: {
      transaction_id: transaction.id,
      payer_user_id: transaction.payer_user_id,
      invoice_id: transaction.invoice_id,
      failure_reason: failureMessage
    }
  });
}

async function handleChargeRefunded(helper: SupabaseHelper, charge: any) {
  const transactions = await helper.asServiceRole.entities.Transaction.filter({
    stripe_charge_id: charge.id
  });

  if (!transactions || transactions.length === 0) return;

  await helper.asServiceRole.entities.Transaction.update((transactions[0] as any).id, {
    status: charge.refunded ? 'refunded' : 'partially_refunded',
    refunded_at: new Date().toISOString()
  });
}

async function handleAccountUpdated(helper: SupabaseHelper, account: any) {
  const accounts = await helper.asServiceRole.entities.OperatorStripeAccount.filter({
    stripe_account_id: account.id
  });

  if (!accounts || accounts.length === 0) return;

  const operatorAccount = accounts[0] as any;
  const wasNotConnected = !operatorAccount.charges_enabled;

  await helper.asServiceRole.entities.OperatorStripeAccount.update(operatorAccount.id, {
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    stripe_account_status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
    onboarding_complete: account.details_submitted && account.charges_enabled,
    requirements_due: account.requirements?.currently_due || [],
    last_stripe_sync: new Date().toISOString()
  });

  // Update operator
  if (operatorAccount.operator_id) {
    await helper.asServiceRole.entities.Operator.update(operatorAccount.operator_id, {
      stripe_connected: account.charges_enabled && account.payouts_enabled,
      stripe_account_id: account.id
    });

    // Notify if newly activated
    if (account.charges_enabled && wasNotConnected) {
      await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
        event_type: 'stripe_account_activated',
        event_data: {
          operator_id: operatorAccount.operator_id,
          user_id: operatorAccount.user_id
        }
      });
    }
  }
}

async function handleCheckoutSessionCompleted(helper: SupabaseHelper, session: any) {
  console.log('Checkout session completed:', session.id);

  // Handle subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    // Note: In Supabase, we don't have a separate User table - user data is in auth.users
    // This would need to be handled differently based on your schema
    console.log('Subscription checkout completed for customer:', session.customer);
  }

  // Handle payment checkout (one-time or invoice payment)
  if (session.mode === 'payment' && session.payment_intent) {
    // Payment intent will be handled by payment_intent.succeeded webhook
    console.log('Payment checkout completed, waiting for payment_intent.succeeded');
  }

  // Handle setup mode (payment method setup)
  if (session.mode === 'setup' && session.setup_intent) {
    console.log('Setup completed, payment method attached');
  }
}

async function handleInvoicePaid(helper: SupabaseHelper, invoice: any) {
  console.log('Invoice paid:', invoice.id);

  if (invoice.subscription) {
    // Note: In Supabase, we don't have a separate User table - user data is in auth.users
    console.log('Subscription invoice paid for customer:', invoice.customer);
  }
}

async function handleSubscriptionEvent(helper: SupabaseHelper, eventType: string, subscription: any) {
  console.log(`Handling subscription event: ${eventType}`, subscription.id);
  // Note: In Supabase, we don't have a separate User table - user data is in auth.users
  // This would need to be handled differently based on your schema
  console.log('Subscription event for customer:', subscription.customer);
}
