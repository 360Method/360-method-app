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
    
    if (!stripeSecretKey) {
      return Response.json({ 
        success: false, 
        error: 'STRIPE_SECRET_KEY not configured' 
      });
    }

    // Check if key is test or live mode
    const isTestMode = stripeSecretKey.startsWith('sk_test_');
    const isLiveMode = stripeSecretKey.startsWith('sk_live_');

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      maxNetworkRetries: 0, // Disable retries for faster diagnosis
      timeout: 10000 // 10 second timeout
    });

    const results = {
      stripe_mode: stripeMode,
      api_key_mode: isTestMode ? 'test' : 'live',
      api_key_format_valid: true,
      api_key_valid: false,
      account_accessible: false,
      products_accessible: false,
      prices_accessible: false,
      account_info: null,
      product_count: 0,
      price_count: 0,
      errors: []
    };

    if (!results.api_key_format_valid) {
      results.errors.push({
        test: 'api_key_format',
        message: 'API key does not start with sk_test_ or sk_live_',
        suggestion: 'Verify STRIPE_SECRET_KEY is set correctly'
      });
      return Response.json({
        success: false,
        results
      });
    }

    // Test 1: Simple balance check (fastest API call)
    try {
      const balance = await stripe.balance.retrieve();
      results.api_key_valid = true;
      results.balance_check = 'success';
    } catch (error) {
      results.errors.push({
        test: 'balance_check',
        message: error.message,
        type: error.type,
        code: error.code,
        raw_type: error.raw?.type,
        suggestion: error.type === 'StripeAuthenticationError' ? 
          'API key is invalid - check STRIPE_SECRET_KEY' : 
          'Network or connection issue with Stripe API'
      });
      // If basic auth fails, no point continuing
      return Response.json({
        success: false,
        results
      });
    }

    // Test 2: Retrieve account (basic API test)
    try {
      const account = await stripe.accounts.retrieve();
      results.account_accessible = true;
      results.account_info = {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        country: account.country,
        email: account.email
      };
    } catch (error) {
      results.errors.push({
        test: 'account_retrieval',
        message: error.message,
        type: error.type,
        code: error.code
      });
    }

    // Test 3: List products (with error handling for unicode issues)
    try {
      const products = await stripe.products.list({ limit: 10 });
      results.products_accessible = true;
      results.product_count = products.data.length;
    } catch (error) {
      results.errors.push({
        test: 'product_listing',
        message: error.message,
        type: error.type,
        code: error.code
      });
    }

    // Test 4: List prices
    try {
      const prices = await stripe.prices.list({ limit: 10 });
      results.prices_accessible = true;
      results.price_count = prices.data.length;
    } catch (error) {
      results.errors.push({
        test: 'price_listing',
        message: error.message,
        type: error.type,
        code: error.code
      });
    }

    // Test 5: Create a test customer (verify write operations work)
    try {
      const testCustomer = await stripe.customers.create({
        email: 'test@example.com',
        name: 'Test Customer',
        metadata: { test: 'true' }
      });
      
      // Immediately delete it
      await stripe.customers.del(testCustomer.id);
      
      results.customer_creation_works = true;
    } catch (error) {
      results.errors.push({
        test: 'customer_creation',
        message: error.message,
        type: error.type,
        code: error.code
      });
    }

    return Response.json({
      success: results.errors.length === 0,
      results
    });
  } catch (error) {
    console.error('Error testing Stripe connection:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});