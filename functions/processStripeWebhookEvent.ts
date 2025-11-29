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

  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;
  const billingCycle = session.metadata?.billing_cycle || 'monthly';

  // Handle subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    console.log('Subscription checkout completed for customer:', session.customer);
    
    if (userId && tier) {
      // Create or update user subscription record
      const existingSubs = await helper.asServiceRole.entities.UserSubscription.filter({
        user_id: userId
      });

      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        tier: tier,
        billing_cycle: billingCycle,
        status: 'active',
        current_period_start: new Date().toISOString(),
      };

      if (existingSubs && existingSubs.length > 0) {
        await helper.asServiceRole.entities.UserSubscription.update(
          (existingSubs[0] as any).id,
          subscriptionData
        );
      } else {
        await helper.asServiceRole.entities.UserSubscription.create(subscriptionData);
      }

      // Update user tier in Clerk and database
      try {
        await helper.asServiceRole.functions.invoke('updateUserTier', {
          user_id: userId,
          tier: tier,
          billing_cycle: billingCycle
        });
        console.log(`User ${userId} tier updated to: ${tier}`);
      } catch (tierError: any) {
        console.error(`Failed to update user tier for ${userId}:`, tierError.message);
        // Don't fail the webhook, subscription is already created
      }
      
      // Create transaction record
      await helper.asServiceRole.entities.Transaction.create({
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent,
        stripe_subscription_id: session.subscription,
        amount_total: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'succeeded',
        type: 'subscription',
        description: `${tier} subscription - ${billingCycle}`,
        metadata: {
          checkout_session_id: session.id,
          tier: tier,
          billing_cycle: billingCycle
        }
      });

      // Trigger notification
      await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
        event_type: 'subscription_created',
        event_data: {
          user_id: userId,
          tier: tier,
          billing_cycle: billingCycle
        }
      });
    }
  }

  // Handle payment checkout (one-time or invoice payment)
  if (session.mode === 'payment' && session.payment_intent) {
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
    // Find user subscription by stripe subscription ID
    const subscriptions = await helper.asServiceRole.entities.UserSubscription.filter({
      stripe_subscription_id: invoice.subscription
    });

    if (subscriptions && subscriptions.length > 0) {
      const sub = subscriptions[0] as any;
      
      // Update subscription period
      await helper.asServiceRole.entities.UserSubscription.update(sub.id, {
        status: 'active',
        current_period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : undefined,
        current_period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : undefined,
      });

      // Create transaction record for renewal
      await helper.asServiceRole.entities.Transaction.create({
        user_id: sub.user_id,
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: invoice.subscription,
        amount_total: invoice.amount_paid || 0,
        currency: invoice.currency || 'usd',
        status: 'succeeded',
        type: 'subscription',
        subscription_id: sub.id,
        description: `${sub.tier} subscription renewal`,
        metadata: {
          invoice_id: invoice.id,
          billing_reason: invoice.billing_reason
        }
      });

      console.log(`Subscription invoice paid for user: ${sub.user_id}`);
    }
  }
}

async function handleSubscriptionEvent(helper: SupabaseHelper, eventType: string, subscription: any) {
  console.log(`Handling subscription event: ${eventType}`, subscription.id);
  
  // Find user subscription by Stripe subscription ID
  const existingSubs = await helper.asServiceRole.entities.UserSubscription.filter({
    stripe_subscription_id: subscription.id
  });

  // Also try to find by customer ID if not found
  let userSubscription = existingSubs?.[0] as any;
  
  if (!userSubscription) {
    const byCustomer = await helper.asServiceRole.entities.UserSubscription.filter({
      stripe_customer_id: subscription.customer
    });
    userSubscription = byCustomer?.[0] as any;
  }

  // Map Stripe subscription status to our status
  const mapStatus = (stripeStatus: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'past_due': 'past_due',
      'canceled': 'canceled',
      'unpaid': 'unpaid',
      'incomplete': 'incomplete',
      'incomplete_expired': 'incomplete_expired',
      'trialing': 'trialing',
      'paused': 'canceled'
    };
    return statusMap[stripeStatus] || 'active';
  };

  // Get tier from subscription metadata or items
  const getTierFromSubscription = (sub: any): string | null => {
    // Check metadata first
    if (sub.metadata?.tier) return sub.metadata.tier;
    
    // Check items metadata
    const items = sub.items?.data || [];
    for (const item of items) {
      if (item.price?.metadata?.tier) return item.price.metadata.tier;
      if (item.price?.product?.metadata?.tier) return item.price.product.metadata.tier;
    }
    
    return null;
  };

  const subscriptionData: any = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    status: mapStatus(subscription.status),
    current_period_start: subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString() 
      : undefined,
    current_period_end: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : undefined,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
  };

  // Add tier if we can determine it
  const tier = getTierFromSubscription(subscription);
  if (tier) {
    subscriptionData.tier = tier;
  }

  // Add canceled_at if subscription is canceled
  if (subscription.canceled_at) {
    subscriptionData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
  }

  // Add trial dates if present
  if (subscription.trial_start) {
    subscriptionData.trial_start = new Date(subscription.trial_start * 1000).toISOString();
  }
  if (subscription.trial_end) {
    subscriptionData.trial_end = new Date(subscription.trial_end * 1000).toISOString();
  }

  // Get price ID
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (priceId) {
    subscriptionData.stripe_price_id = priceId;
  }

  switch (eventType) {
    case 'customer.subscription.created':
      if (userSubscription) {
        // Update existing record
        await helper.asServiceRole.entities.UserSubscription.update(userSubscription.id, subscriptionData);
        console.log(`Updated subscription for user: ${userSubscription.user_id}`);

        // Update tier in Clerk
        if (tier) {
          try {
            await helper.asServiceRole.functions.invoke('updateUserTier', {
              user_id: userSubscription.user_id,
              tier: tier,
              billing_cycle: subscription.metadata?.billing_cycle
            });
          } catch (e) {
            console.error('Failed to update user tier in Clerk:', e);
          }
        }
      } else {
        // Try to find user by customer ID from metadata
        const userId = subscription.metadata?.user_id;
        if (userId) {
          subscriptionData.user_id = userId;
          await helper.asServiceRole.entities.UserSubscription.create(subscriptionData);
          console.log(`Created subscription for user: ${userId}`);

          // Update tier in Clerk
          if (tier) {
            try {
              await helper.asServiceRole.functions.invoke('updateUserTier', {
                user_id: userId,
                tier: tier,
                billing_cycle: subscription.metadata?.billing_cycle
              });
            } catch (e) {
              console.error('Failed to update user tier in Clerk:', e);
            }
          }
        } else {
          console.log('No user_id found in subscription metadata, cannot create subscription record');
        }
      }
      break;

    case 'customer.subscription.updated':
      if (userSubscription) {
        await helper.asServiceRole.entities.UserSubscription.update(userSubscription.id, subscriptionData);
        console.log(`Updated subscription for user: ${userSubscription.user_id}, status: ${subscriptionData.status}`);

        // Update tier in Clerk if it changed
        const newTier = subscriptionData.tier || tier;
        if (newTier && newTier !== userSubscription.tier) {
          try {
            await helper.asServiceRole.functions.invoke('updateUserTier', {
              user_id: userSubscription.user_id,
              tier: newTier,
              billing_cycle: subscription.metadata?.billing_cycle
            });
            console.log(`Updated user ${userSubscription.user_id} tier from ${userSubscription.tier} to ${newTier}`);
          } catch (e) {
            console.error('Failed to update user tier in Clerk:', e);
          }
        }

        // If subscription became active from past_due, notify user
        if (userSubscription.status === 'past_due' && subscriptionData.status === 'active') {
          await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
            event_type: 'subscription_renewed',
            event_data: {
              user_id: userSubscription.user_id,
              tier: subscriptionData.tier || userSubscription.tier
            }
          });
        }

        // If subscription is being canceled at period end, notify
        if (subscriptionData.cancel_at_period_end && !userSubscription.cancel_at_period_end) {
          await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
            event_type: 'subscription_canceling',
            event_data: {
              user_id: userSubscription.user_id,
              cancel_date: subscriptionData.current_period_end
            }
          });
        }
      }
      break;

    case 'customer.subscription.deleted':
      if (userSubscription) {
        await helper.asServiceRole.entities.UserSubscription.update(userSubscription.id, {
          status: 'canceled',
          canceled_at: new Date().toISOString()
        });
        console.log(`Subscription canceled for user: ${userSubscription.user_id}`);

        // Downgrade user to free tier in Clerk
        try {
          await helper.asServiceRole.functions.invoke('updateUserTier', {
            user_id: userSubscription.user_id,
            tier: 'free',
            billing_cycle: null
          });
          console.log(`User ${userSubscription.user_id} downgraded to free tier`);
        } catch (e) {
          console.error('Failed to downgrade user tier in Clerk:', e);
        }

        // Notify user
        await helper.asServiceRole.functions.invoke('triggerNotificationEvent', {
          event_type: 'subscription_canceled',
          event_data: {
            user_id: userSubscription.user_id,
            tier: userSubscription.tier
          }
        });
      }
      break;
  }
}
