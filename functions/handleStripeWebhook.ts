import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';
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

    // Initialize helper AFTER getting raw body
    const helper = createHelperFromRequest(req);

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

    // Check for duplicate event (idempotency)
    const existingEvents = await helper.asServiceRole.entities.WebhookEvent.filter({
      stripe_event_id: event.id,
      status: 'processed'
    });

    if (existingEvents && existingEvents.length > 0) {
      return Response.json({ received: true, duplicate: true }, { headers: corsHeaders });
    }

    // Log webhook event
    const webhookEventRecord = await helper.asServiceRole.entities.WebhookEvent.create({
      source: 'stripe',
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      status: 'received',
      received_at: new Date().toISOString(),
      attempts: 0
    });

    // Queue for async processing
    await helper.asServiceRole.functions.invoke('queueJob', {
      job_type: 'process_stripe_webhook',
      payload: {
        webhook_event_id: (webhookEventRecord as any).id,
        stripe_event_id: event.id,
        event_type: event.type
      },
      priority: 'high',
      queue: 'webhooks'
    });

    return Response.json({ received: true, queued: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
