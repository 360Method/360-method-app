import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey) {
      return Response.json({
        success: false,
        error: 'STRIPE_SECRET_KEY not configured',
        recommendations: ['Set STRIPE_SECRET_KEY in environment variables']
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const diagnostics = {
      api_key_configured: !!stripeSecretKey,
      webhook_secret_configured: !!stripeWebhookSecret,
      api_key_type: stripeSecretKey.startsWith('sk_test_') ? 'test' : 
                    stripeSecretKey.startsWith('sk_live_') ? 'live' : 'unknown',
      account_info: null,
      products: [],
      prices: [],
      errors: [],
      recommendations: []
    };

    // Test API connection
    try {
      const account = await stripe.accounts.retrieve();
      diagnostics.account_info = {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        country: account.country,
        default_currency: account.default_currency,
        email: account.email
      };
    } catch (error) {
      diagnostics.errors.push({
        type: 'account_retrieval',
        message: error.message
      });
    }

    // List products
    try {
      const products = await stripe.products.list({ limit: 10 });
      diagnostics.products = products.data.map(p => ({
        id: p.id,
        name: p.name,
        active: p.active,
        created: new Date(p.created * 1000).toISOString()
      }));
    } catch (error) {
      diagnostics.errors.push({
        type: 'product_listing',
        message: error.message
      });
    }

    // List prices
    try {
      const prices = await stripe.prices.list({ limit: 10 });
      diagnostics.prices = prices.data.map(p => ({
        id: p.id,
        product: p.product,
        unit_amount: p.unit_amount,
        currency: p.currency,
        type: p.type,
        active: p.active
      }));
    } catch (error) {
      diagnostics.errors.push({
        type: 'price_listing',
        message: error.message
      });
    }

    // Recommendations
    if (!stripeWebhookSecret) {
      diagnostics.recommendations.push('Set STRIPE_WEBHOOK_SECRET for webhook signature verification');
    }

    if (diagnostics.products.length === 0) {
      diagnostics.recommendations.push('No products found. Create products in Stripe Dashboard or via API');
    }

    if (diagnostics.prices.length === 0) {
      diagnostics.recommendations.push('No prices found. Create prices for your products');
    }

    if (diagnostics.api_key_type === 'test') {
      diagnostics.recommendations.push('Using test mode. Switch to live keys for production');
    }

    return Response.json({
      success: true,
      diagnostics
    });
  } catch (error) {
    console.error('Error diagnosing Stripe:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});