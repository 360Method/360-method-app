import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      stripe_configured: !!Deno.env.get('STRIPE_SECRET_KEY'),
      webhook_secret_configured: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      database_checks: {},
      stripe_checks: {},
      missing_infrastructure: []
    };

    // Check database entities
    try {
      const [transactions, packages, operators, webhooks, paymentMethods] = await Promise.all([
        base44.asServiceRole.entities.Transaction.list('-created_date', 5),
        base44.asServiceRole.entities.ServicePackage.list('-created_date', 5),
        base44.asServiceRole.entities.OperatorStripeAccount.list('-created_date', 5),
        base44.asServiceRole.entities.WebhookEvent.filter({ source: 'stripe' }),
        base44.asServiceRole.entities.PaymentMethod.list('-created_date', 5)
      ]);

      diagnosis.database_checks = {
        transactions_count: transactions.length,
        service_packages_count: packages.length,
        operator_accounts_count: operators.length,
        stripe_webhooks_count: webhooks.length,
        payment_methods_count: paymentMethods.length,
        sample_package: packages[0] || null
      };

      if (transactions.length === 0) {
        diagnosis.missing_infrastructure.push('No transactions recorded - payment flow not tested');
      }
      if (packages.length === 0) {
        diagnosis.missing_infrastructure.push('No service packages - no quotes/invoices created');
      }
      if (webhooks.length === 0) {
        diagnosis.missing_infrastructure.push('No Stripe webhooks received - webhook endpoint not configured');
      }
      if (paymentMethods.length === 0) {
        diagnosis.missing_infrastructure.push('No payment methods - users need to add cards');
      }
    } catch (error) {
      diagnosis.database_checks.error = error.message;
    }

    // Check Stripe configuration
    try {
      const [account, products, prices] = await Promise.all([
        stripe.accounts.retrieve(),
        stripe.products.list({ limit: 10 }),
        stripe.prices.list({ limit: 10 })
      ]);

      diagnosis.stripe_checks = {
        account_id: account.id,
        account_email: account.email,
        charges_enabled: account.charges_enabled,
        products_count: products.data.length,
        prices_count: prices.data.length,
        products: products.data.map(p => ({
          id: p.id,
          name: p.name,
          active: p.active
        })),
        prices: prices.data.map(p => ({
          id: p.id,
          product: p.product,
          amount: p.unit_amount,
          currency: p.currency,
          recurring: p.recurring
        }))
      };

      if (products.data.length === 0) {
        diagnosis.missing_infrastructure.push('No Stripe products - run setupStripeProducts');
      }
      if (prices.data.length === 0) {
        diagnosis.missing_infrastructure.push('No Stripe prices - run setupStripeProducts');
      }
    } catch (error) {
      diagnosis.stripe_checks.error = error.message;
      diagnosis.missing_infrastructure.push(`Stripe API error: ${error.message}`);
    }

    // Check platform settings
    try {
      const platformFee = await base44.asServiceRole.entities.PlatformSettings.filter({
        setting_key: 'platform_fee_percent'
      });

      diagnosis.platform_fee_configured = platformFee.length > 0;
      diagnosis.platform_fee_value = platformFee[0]?.setting_value;

      if (!diagnosis.platform_fee_configured) {
        diagnosis.missing_infrastructure.push('Platform fee not configured in PlatformSettings');
      }
    } catch (error) {
      diagnosis.platform_fee_error = error.message;
    }

    // Generate recommendations
    diagnosis.recommendations = [];
    
    if (diagnosis.missing_infrastructure.length > 0) {
      diagnosis.recommendations.push('Run setupStripeProducts to create product catalog');
      diagnosis.recommendations.push('Configure webhook endpoint in Stripe Dashboard');
      diagnosis.recommendations.push('Test payment flow with testPaymentFlow function');
    }

    if (diagnosis.database_checks.operator_accounts_count === 0) {
      diagnosis.recommendations.push('Test operator onboarding flow');
    }

    return Response.json({
      success: diagnosis.missing_infrastructure.length === 0,
      diagnosis
    });
  } catch (error) {
    console.error('Error diagnosing Stripe:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});