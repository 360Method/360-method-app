import { createServiceClient, corsHeaders, invokeFunction } from '../_shared/supabaseClient.ts';
import Stripe from 'npm:stripe@14.11.0';

// Get Stripe client based on mode
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
    // CRITICAL: Get raw body BEFORE any parsing
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400, headers: corsHeaders });
    }

    const supabase = createServiceClient();
    const stripe = getStripeClient();

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500, headers: corsHeaders });
    }

    // Verify signature and construct event
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Signature verification failed' }, { status: 400, headers: corsHeaders });
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Check for duplicate event (idempotency)
    const { data: existingEvents } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .eq('status', 'processed')
      .limit(1);

    if (existingEvents && existingEvents.length > 0) {
      console.log(`Duplicate event ${event.id}, skipping`);
      return Response.json({ received: true, duplicate: true }, { headers: corsHeaders });
    }

    // Log webhook event
    const { data: webhookEventRecord } = await supabase
      .from('webhook_events')
      .insert({
        source: 'stripe',
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event.data.object,
        status: 'processing',
        received_at: new Date().toISOString(),
        attempts: 1,
        last_attempt_at: new Date().toISOString()
      })
      .select()
      .single();

    // Process event directly (synchronous processing)
    try {
      const payload = event.data.object as any;

      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(supabase, payload);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionEvent(supabase, event.type, payload);
          break;

        case 'invoice.paid':
          await handleInvoicePaid(supabase, payload);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(supabase, payload);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark as processed
      if (webhookEventRecord?.id) {
        await supabase
          .from('webhook_events')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString()
          })
          .eq('id', webhookEventRecord.id);
      }

      return Response.json({ received: true, processed: true }, { headers: corsHeaders });

    } catch (processingError: any) {
      console.error(`Error processing event ${event.type}:`, processingError.message);

      // Mark as failed
      if (webhookEventRecord?.id) {
        await supabase
          .from('webhook_events')
          .update({
            status: 'failed',
            error_message: processingError.message
          })
          .eq('id', webhookEventRecord.id);
      }

      // Return success to Stripe (so they don't retry), but log the error
      return Response.json({ received: true, error: processingError.message }, { headers: corsHeaders });
    }

  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

// Handler: checkout.session.completed
async function handleCheckoutSessionCompleted(supabase: any, session: any) {
  console.log('Checkout session completed:', session.id);

  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;
  const billingCycle = session.metadata?.billing_cycle || 'monthly';

  // Handle subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    console.log('Subscription checkout completed for customer:', session.customer);

    if (userId && tier) {
      // Create or update user subscription record
      const { data: existingSubs } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        tier: tier,
        billing_cycle: billingCycle,
        status: 'active',
        current_period_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingSubs && existingSubs.length > 0) {
        await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', existingSubs[0].id);
        console.log(`Updated subscription for user: ${userId}`);
      } else {
        await supabase
          .from('user_subscriptions')
          .insert({
            ...subscriptionData,
            created_at: new Date().toISOString()
          });
        console.log(`Created subscription for user: ${userId}`);
      }

      // Update user tier in Clerk
      try {
        await invokeFunction('updateUserTier', {
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
      try {
        await supabase
          .from('transactions')
          .insert({
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
            },
            created_at: new Date().toISOString()
          });
      } catch (txError) {
        console.warn('Failed to create transaction record:', txError);
      }
    }
  }
}

// Handler: customer.subscription.* events
async function handleSubscriptionEvent(supabase: any, eventType: string, subscription: any) {
  console.log(`Handling subscription event: ${eventType}`, subscription.id);

  // Find user subscription by Stripe subscription ID
  const { data: existingSubs } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1);

  let userSubscription = existingSubs?.[0];

  // Also try by customer ID if not found
  if (!userSubscription) {
    const { data: byCustomer } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('stripe_customer_id', subscription.customer)
      .limit(1);
    userSubscription = byCustomer?.[0];
  }

  // Get tier from subscription metadata
  const tier = subscription.metadata?.tier || null;
  const billingCycle = subscription.metadata?.billing_cycle || null;

  // Map Stripe status
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

  const subscriptionData: any = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    status: mapStatus(subscription.status),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    updated_at: new Date().toISOString()
  };

  // Add period dates
  if (subscription.current_period_start) {
    subscriptionData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
  }
  if (subscription.current_period_end) {
    subscriptionData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
  }

  // Add tier if available
  if (tier) {
    subscriptionData.tier = tier;
  }
  if (billingCycle) {
    subscriptionData.billing_cycle = billingCycle;
  }

  // Add canceled_at if subscription is canceled
  if (subscription.canceled_at) {
    subscriptionData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
  }

  // Get price ID
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (priceId) {
    subscriptionData.stripe_price_id = priceId;
  }

  switch (eventType) {
    case 'customer.subscription.created':
      if (userSubscription) {
        await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', userSubscription.id);
        console.log(`Updated subscription for user: ${userSubscription.user_id}`);

        // Update tier in Clerk
        if (tier) {
          try {
            await invokeFunction('updateUserTier', {
              user_id: userSubscription.user_id,
              tier: tier,
              billing_cycle: billingCycle
            });
          } catch (e) {
            console.error('Failed to update user tier in Clerk:', e);
          }
        }
      } else {
        // Try to create with user_id from metadata
        const userId = subscription.metadata?.user_id;
        if (userId) {
          subscriptionData.user_id = userId;
          subscriptionData.created_at = new Date().toISOString();
          await supabase
            .from('user_subscriptions')
            .insert(subscriptionData);
          console.log(`Created subscription for user: ${userId}`);

          // Update tier in Clerk
          if (tier) {
            try {
              await invokeFunction('updateUserTier', {
                user_id: userId,
                tier: tier,
                billing_cycle: billingCycle
              });
            } catch (e) {
              console.error('Failed to update user tier in Clerk:', e);
            }
          }
        }
      }
      break;

    case 'customer.subscription.updated':
      if (userSubscription) {
        await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', userSubscription.id);
        console.log(`Updated subscription for user: ${userSubscription.user_id}, status: ${subscriptionData.status}`);

        // Update tier in Clerk if it changed
        const newTier = subscriptionData.tier || tier;
        if (newTier && newTier !== userSubscription.tier) {
          try {
            await invokeFunction('updateUserTier', {
              user_id: userSubscription.user_id,
              tier: newTier,
              billing_cycle: billingCycle
            });
            console.log(`Updated user ${userSubscription.user_id} tier from ${userSubscription.tier} to ${newTier}`);
          } catch (e) {
            console.error('Failed to update user tier in Clerk:', e);
          }
        }
      }
      break;

    case 'customer.subscription.deleted':
      if (userSubscription) {
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userSubscription.id);
        console.log(`Subscription canceled for user: ${userSubscription.user_id}`);

        // Downgrade user to free tier in Clerk
        try {
          await invokeFunction('updateUserTier', {
            user_id: userSubscription.user_id,
            tier: 'free',
            billing_cycle: null
          });
          console.log(`User ${userSubscription.user_id} downgraded to free tier`);
        } catch (e) {
          console.error('Failed to downgrade user tier in Clerk:', e);
        }
      }
      break;
  }
}

// Handler: invoice.paid
async function handleInvoicePaid(supabase: any, invoice: any) {
  console.log('Invoice paid:', invoice.id);

  if (invoice.subscription) {
    // Find user subscription by stripe subscription ID
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription)
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      const sub = subscriptions[0];

      // Update subscription period
      await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : undefined,
          current_period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      // Create transaction record for renewal
      try {
        await supabase
          .from('transactions')
          .insert({
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
            },
            created_at: new Date().toISOString()
          });
      } catch (txError) {
        console.warn('Failed to create transaction record:', txError);
      }

      console.log(`Subscription invoice paid for user: ${sub.user_id}`);
    }
  }
}

// Handler: invoice.payment_failed
async function handleInvoicePaymentFailed(supabase: any, invoice: any) {
  console.log('Invoice payment failed:', invoice.id);

  if (invoice.subscription) {
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription)
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      const sub = subscriptions[0];

      await supabase
        .from('user_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      console.log(`Subscription marked past_due for user: ${sub.user_id}`);
    }
  }
}
