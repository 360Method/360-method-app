import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
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
  try {
    // CRITICAL: Get raw body BEFORE any parsing
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // Initialize Base44 client AFTER getting raw body
    const base44 = createClientFromRequest(req);
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify signature and construct event
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    // Check for duplicate event (idempotency)
    const existingEvents = await base44.asServiceRole.entities.WebhookEvent.filter({
      stripe_event_id: event.id,
      status: 'processed'
    });

    if (existingEvents && existingEvents.length > 0) {
      return Response.json({ received: true, duplicate: true });
    }

    // Log webhook event
    const webhookEventRecord = await base44.asServiceRole.entities.WebhookEvent.create({
      source: 'stripe',
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      status: 'received',
      received_at: new Date().toISOString(),
      attempts: 0
    });

    // Queue for async processing
    await base44.asServiceRole.functions.invoke('queueJob', {
      job_type: 'process_stripe_webhook',
      payload: {
        webhook_event_id: webhookEventRecord.id,
        stripe_event_id: event.id,
        event_type: event.type
      },
      priority: 'high',
      queue: 'webhooks'
    });

    return Response.json({ received: true, queued: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});