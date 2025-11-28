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
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403, headers: corsHeaders });
    }

    const stripe = getStripeClient();
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';

    const results: any = {
      stripe_mode: stripeMode,
      products_created: [],
      prices_created: [],
      errors: []
    };

    // 1. HomeCare Essential
    try {
      const essentialProduct = await stripe.products.create({
        name: 'HomeCare Essential',
        description: 'Basic seasonal maintenance for 1 property',
        metadata: {
          tier: 'essential',
          service_type: 'homecare'
        }
      });

      const essentialPrice = await stripe.prices.create({
        product: essentialProduct.id,
        unit_amount: 9900, // $99/month
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tier: 'essential' }
      });

      results.products_created.push({ name: 'HomeCare Essential', id: essentialProduct.id });
      results.prices_created.push({ name: 'HomeCare Essential Monthly', id: essentialPrice.id, amount: 99 });
    } catch (error: any) {
      results.errors.push({ product: 'HomeCare Essential', error: error.message });
    }

    // 2. HomeCare Premium
    try {
      const premiumProduct = await stripe.products.create({
        name: 'HomeCare Premium',
        description: 'Advanced maintenance with priority support',
        metadata: {
          tier: 'premium',
          service_type: 'homecare'
        }
      });

      const premiumPrice = await stripe.prices.create({
        product: premiumProduct.id,
        unit_amount: 19900, // $199/month
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tier: 'premium' }
      });

      results.products_created.push({ name: 'HomeCare Premium', id: premiumProduct.id });
      results.prices_created.push({ name: 'HomeCare Premium Monthly', id: premiumPrice.id, amount: 199 });
    } catch (error: any) {
      results.errors.push({ product: 'HomeCare Premium', error: error.message });
    }

    // 3. HomeCare Elite
    try {
      const eliteProduct = await stripe.products.create({
        name: 'HomeCare Elite',
        description: 'Full-service concierge maintenance',
        metadata: {
          tier: 'elite',
          service_type: 'homecare'
        }
      });

      const elitePrice = await stripe.prices.create({
        product: eliteProduct.id,
        unit_amount: 39900, // $399/month
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tier: 'elite' }
      });

      results.products_created.push({ name: 'HomeCare Elite', id: eliteProduct.id });
      results.prices_created.push({ name: 'HomeCare Elite Monthly', id: elitePrice.id, amount: 399 });
    } catch (error: any) {
      results.errors.push({ product: 'HomeCare Elite', error: error.message });
    }

    // 4. PropertyCare Service Package (one-time payment)
    try {
      const propertyProduct = await stripe.products.create({
        name: 'PropertyCare Service Package',
        description: 'Professional maintenance service package',
        metadata: {
          service_type: 'propertycare',
          payment_type: 'one_time'
        }
      });

      results.products_created.push({ name: 'PropertyCare Service Package', id: propertyProduct.id });
      // Note: PropertyCare uses dynamic pricing based on actual service quote
      // No fixed price created - we'll create PaymentIntents with custom amounts
    } catch (error: any) {
      results.errors.push({ product: 'PropertyCare Service', error: error.message });
    }

    // Save product/price IDs to PlatformSettings for easy reference
    const settingsToCreate = [
      { key: 'stripe_homecare_essential_product_id', value: results.products_created.find((p: any) => p.name === 'HomeCare Essential')?.id },
      { key: 'stripe_homecare_premium_product_id', value: results.products_created.find((p: any) => p.name === 'HomeCare Premium')?.id },
      { key: 'stripe_homecare_elite_product_id', value: results.products_created.find((p: any) => p.name === 'HomeCare Elite')?.id },
      { key: 'stripe_propertycare_product_id', value: results.products_created.find((p: any) => p.name === 'PropertyCare Service Package')?.id },
      { key: 'stripe_price_essential_monthly', value: results.prices_created.find((p: any) => p.name === 'HomeCare Essential Monthly')?.id },
      { key: 'stripe_price_premium_monthly', value: results.prices_created.find((p: any) => p.name === 'HomeCare Premium Monthly')?.id },
      { key: 'stripe_price_elite_monthly', value: results.prices_created.find((p: any) => p.name === 'HomeCare Elite Monthly')?.id }
    ];

    for (const setting of settingsToCreate.filter(s => s.value)) {
      try {
        await helper.asServiceRole.entities.PlatformSettings.create({
          setting_key: setting.key,
          setting_value: setting.value,
          setting_type: 'string',
          description: `Stripe ${setting.key.replace('stripe_', '').replace(/_/g, ' ')}`
        });
      } catch (error: any) {
        // Ignore duplicate key errors
        if (!error.message.includes('duplicate')) {
          results.errors.push({ setting: setting.key, error: error.message });
        }
      }
    }

    return Response.json({
      success: results.errors.length === 0,
      message: `Created ${results.products_created.length} products and ${results.prices_created.length} prices`,
      results
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error setting up Stripe products:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
