/**
 * createServicePaymentCheckout
 * Creates a Stripe Checkout session for one-time service package payments
 */

import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';
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
    const supabase = createServiceClient();
    const stripe = getStripeClient();

    const {
      user_id,
      user_email,
      user_name,
      property_id,
      package_name,
      line_items,
      total_amount,
      total_hours,
      customer_notes,
      preferred_start_date,
      success_url,
      cancel_url
    } = await req.json();

    // Validate required fields
    if (!user_id || !user_email) {
      return Response.json({ error: 'Missing user information' }, { status: 401, headers: corsHeaders });
    }

    if (!property_id || !package_name || !total_amount) {
      return Response.json({ error: 'Missing required package information' }, { status: 400, headers: corsHeaders });
    }

    if (!success_url || !cancel_url) {
      return Response.json({ error: 'Missing success_url or cancel_url' }, { status: 400, headers: corsHeaders });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;

    // Check users table for existing customer ID
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user_id)
        .single();
      stripeCustomerId = existingUser?.stripe_customer_id;
    } catch (e) {
      // User not found
    }

    // Create new customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user_email,
        name: user_name || user_email,
        metadata: { user_id: user_id }
      });
      stripeCustomerId = customer.id;

      // Save customer ID
      try {
        await supabase
          .from('users')
          .upsert({
            id: user_id,
            email: user_email,
            full_name: user_name,
            stripe_customer_id: stripeCustomerId
          }, { onConflict: 'id' });
      } catch (e) {
        console.log('Could not save customer ID:', e);
      }
    }

    // Create a pending service package record
    const { data: servicePackage, error: packageError } = await supabase
      .from('service_packages')
      .insert({
        user_id: user_id,
        property_id: property_id,
        package_name: package_name,
        line_items: line_items,
        total_estimated_hours: total_hours,
        total_estimated_cost_min: total_amount,
        total_estimated_cost_max: total_amount,
        final_cost_min: total_amount,
        final_cost_max: total_amount,
        customer_notes: customer_notes,
        preferred_start_date: preferred_start_date,
        status: 'pending_payment' // New status for awaiting payment
      })
      .select()
      .single();

    if (packageError) {
      console.error('Error creating service package:', packageError);
      throw new Error('Failed to create service package');
    }

    // Build Stripe line items
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: package_name,
            description: `Service package including ${line_items?.length || 0} items`,
          },
          unit_amount: Math.round(total_amount * 100), // Convert to cents
        },
        quantity: 1,
      }
    ];

    // Create Checkout Session
    const separator = success_url.includes('?') ? '&' : '?';
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: `${success_url}${separator}session_id={CHECKOUT_SESSION_ID}&package_id=${servicePackage.id}`,
      cancel_url: `${cancel_url}${cancel_url.includes('?') ? '&' : '?'}package_id=${servicePackage.id}`,
      metadata: {
        user_id: user_id,
        property_id: property_id,
        package_id: servicePackage.id,
        type: 'service_package'
      },
      payment_intent_data: {
        metadata: {
          user_id: user_id,
          property_id: property_id,
          package_id: servicePackage.id,
          type: 'service_package'
        }
      }
    });

    // Update service package with checkout session ID
    await supabase
      .from('service_packages')
      .update({
        stripe_checkout_session_id: session.id
      })
      .eq('id', servicePackage.id);

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      package_id: servicePackage.id
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error creating service payment checkout:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500, headers: corsHeaders });
  }
});
