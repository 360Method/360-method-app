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

// 360° Command Center Product Definitions
const PRODUCTS = [
  {
    name: '360° Homeowner+',
    tier: 'homeowner_plus',
    description: 'AI-powered protection for single property owners. Includes cascade risk alerts, cost forecasting, and spending insights.',
    prices: [
      { nickname: 'Homeowner+ Monthly', unit_amount: 700, interval: 'month' as const },
      { nickname: 'Homeowner+ Annual', unit_amount: 6000, interval: 'year' as const }
    ],
    metered: null // Fixed price, no usage metering
  },
  {
    name: '360° Pioneer',
    tier: 'good',
    description: 'Multi-property intelligence for growing portfolios. Base includes 3 doors, +$2/door after.',
    prices: [
      { nickname: 'Pioneer Monthly Base', unit_amount: 1200, interval: 'month' as const },
      { nickname: 'Pioneer Annual Base', unit_amount: 9600, interval: 'year' as const }
    ],
    metered: {
      nickname: 'Pioneer Per-Door Usage',
      unit_amount: 200, // $2 per door
      included_doors: 3,
      max_doors: 25
    }
  },
  {
    name: '360° Commander',
    tier: 'better',
    description: 'Professional portfolio management with team features. Base includes 15 doors, +$3/door after.',
    prices: [
      { nickname: 'Commander Monthly Base', unit_amount: 6000, interval: 'month' as const },
      { nickname: 'Commander Annual Base', unit_amount: 60000, interval: 'year' as const }
    ],
    metered: {
      nickname: 'Commander Per-Door Usage',
      unit_amount: 300, // $3 per door
      included_doors: 15,
      max_doors: 100
    }
  },
  {
    name: '360° Elite',
    tier: 'best',
    description: 'Enterprise-grade property intelligence. Unlimited properties, multi-user accounts, dedicated support.',
    prices: [
      { nickname: 'Elite Monthly', unit_amount: 35000, interval: 'month' as const },
      { nickname: 'Elite Annual', unit_amount: 358800, interval: 'year' as const }
    ],
    metered: null // Flat rate, unlimited properties
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    // For security, could require admin auth - but for initial setup, allow service role
    // const user = await helper.auth.me();
    // if (!user || user.user_metadata?.role !== 'admin') {
    //   return Response.json({ error: 'Admin access required' }, { status: 403, headers: corsHeaders });
    // }

    const stripe = getStripeClient();
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';

    const results: any = {
      stripe_mode: stripeMode,
      products_created: [],
      prices_created: [],
      settings_saved: [],
      errors: []
    };

    // Create each product with its prices
    for (const productDef of PRODUCTS) {
      try {
        // Check if product already exists
        const existingProducts = await stripe.products.search({
          query: `metadata['tier']:'${productDef.tier}'`
        });

        let product: Stripe.Product;

        if (existingProducts.data.length > 0) {
          // Update existing product
          product = await stripe.products.update(existingProducts.data[0].id, {
            name: productDef.name,
            description: productDef.description,
            metadata: {
              tier: productDef.tier,
              service_type: '360_command_center'
            }
          });
          results.products_created.push({ name: productDef.name, id: product.id, status: 'updated' });
        } else {
          // Create new product
          product = await stripe.products.create({
            name: productDef.name,
            description: productDef.description,
            metadata: {
              tier: productDef.tier,
              service_type: '360_command_center'
            }
          });
          results.products_created.push({ name: productDef.name, id: product.id, status: 'created' });
        }

        // Create fixed prices (monthly and annual)
        for (const priceDef of productDef.prices) {
          try {
            // Check if price already exists
            const existingPrices = await stripe.prices.list({
              product: product.id,
              active: true,
              limit: 100
            });

            const existingPrice = existingPrices.data.find(p =>
              p.nickname === priceDef.nickname &&
              p.recurring?.interval === priceDef.interval
            );

            if (existingPrice) {
              results.prices_created.push({
                name: priceDef.nickname,
                id: existingPrice.id,
                amount: priceDef.unit_amount / 100,
                status: 'exists'
              });
            } else {
              const price = await stripe.prices.create({
                product: product.id,
                nickname: priceDef.nickname,
                unit_amount: priceDef.unit_amount,
                currency: 'usd',
                recurring: { interval: priceDef.interval },
                metadata: {
                  tier: productDef.tier,
                  billing_type: 'base'
                }
              });

              results.prices_created.push({
                name: priceDef.nickname,
                id: price.id,
                amount: priceDef.unit_amount / 100,
                status: 'created'
              });
            }
          } catch (priceError: any) {
            results.errors.push({ price: priceDef.nickname, error: priceError.message });
          }
        }

        // Create metered price for usage-based tiers (Pioneer, Commander)
        if (productDef.metered) {
          try {
            const existingPrices = await stripe.prices.list({
              product: product.id,
              active: true,
              limit: 100
            });

            const existingMeteredPrice = existingPrices.data.find(p =>
              p.nickname === productDef.metered!.nickname &&
              p.recurring?.usage_type === 'metered'
            );

            if (existingMeteredPrice) {
              results.prices_created.push({
                name: productDef.metered.nickname,
                id: existingMeteredPrice.id,
                amount: productDef.metered.unit_amount / 100,
                type: 'metered',
                status: 'exists'
              });
            } else {
              const meteredPrice = await stripe.prices.create({
                product: product.id,
                nickname: productDef.metered.nickname,
                currency: 'usd',
                recurring: {
                  interval: 'month',
                  usage_type: 'metered',
                  aggregate_usage: 'last_during_period' // Use latest reported value
                },
                unit_amount: productDef.metered.unit_amount,
                metadata: {
                  tier: productDef.tier,
                  billing_type: 'usage',
                  included_doors: String(productDef.metered.included_doors),
                  max_doors: String(productDef.metered.max_doors)
                }
              });

              results.prices_created.push({
                name: productDef.metered.nickname,
                id: meteredPrice.id,
                amount: productDef.metered.unit_amount / 100,
                type: 'metered',
                status: 'created'
              });
            }
          } catch (meteredError: any) {
            results.errors.push({ metered: productDef.metered.nickname, error: meteredError.message });
          }
        }

      } catch (productError: any) {
        results.errors.push({ product: productDef.name, error: productError.message });
      }
    }

    // Save price IDs to platform_settings for easy reference
    const settingsToSave = [
      // Homeowner+ prices
      { key: 'stripe_price_homeowner_plus_monthly', value: results.prices_created.find((p: any) => p.name === 'Homeowner+ Monthly')?.id },
      { key: 'stripe_price_homeowner_plus_annual', value: results.prices_created.find((p: any) => p.name === 'Homeowner+ Annual')?.id },

      // Pioneer prices
      { key: 'stripe_price_pioneer_monthly', value: results.prices_created.find((p: any) => p.name === 'Pioneer Monthly Base')?.id },
      { key: 'stripe_price_pioneer_annual', value: results.prices_created.find((p: any) => p.name === 'Pioneer Annual Base')?.id },
      { key: 'stripe_price_pioneer_usage', value: results.prices_created.find((p: any) => p.name === 'Pioneer Per-Door Usage')?.id },

      // Commander prices
      { key: 'stripe_price_commander_monthly', value: results.prices_created.find((p: any) => p.name === 'Commander Monthly Base')?.id },
      { key: 'stripe_price_commander_annual', value: results.prices_created.find((p: any) => p.name === 'Commander Annual Base')?.id },
      { key: 'stripe_price_commander_usage', value: results.prices_created.find((p: any) => p.name === 'Commander Per-Door Usage')?.id },

      // Elite prices
      { key: 'stripe_price_elite_monthly', value: results.prices_created.find((p: any) => p.name === 'Elite Monthly')?.id },
      { key: 'stripe_price_elite_annual', value: results.prices_created.find((p: any) => p.name === 'Elite Annual')?.id },

      // Stripe mode
      { key: 'stripe_mode', value: stripeMode }
    ];

    for (const setting of settingsToSave.filter(s => s.value)) {
      try {
        // Try to update existing setting first
        const existing = await helper.asServiceRole.entities.PlatformSettings.filter({
          setting_key: setting.key
        });

        if (existing && existing.length > 0) {
          await helper.asServiceRole.entities.PlatformSettings.update((existing[0] as any).id, {
            setting_value: setting.value,
            updated_at: new Date().toISOString()
          });
          results.settings_saved.push({ key: setting.key, value: setting.value, status: 'updated' });
        } else {
          await helper.asServiceRole.entities.PlatformSettings.create({
            setting_key: setting.key,
            setting_value: setting.value,
            setting_type: 'string',
            description: `Stripe ${setting.key.replace('stripe_', '').replace(/_/g, ' ')}`
          });
          results.settings_saved.push({ key: setting.key, value: setting.value, status: 'created' });
        }
      } catch (settingError: any) {
        results.errors.push({ setting: setting.key, error: settingError.message });
      }
    }

    return Response.json({
      success: results.errors.length === 0,
      message: `Created/updated ${results.products_created.length} products, ${results.prices_created.length} prices, ${results.settings_saved.length} settings`,
      results
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error setting up Stripe products:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
