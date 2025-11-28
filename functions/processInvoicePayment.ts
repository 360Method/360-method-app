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

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { invoice_id, payment_method_id } = await req.json();

    if (!invoice_id) {
      return Response.json({ error: 'Missing invoice_id' }, { status: 400, headers: corsHeaders });
    }

    const stripe = getStripeClient();

    // Get invoice
    const invoices = await helper.entities.ServicePackage.filter({ id: invoice_id });
    if (!invoices || invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404, headers: corsHeaders });
    }
    const invoice = invoices[0] as any;

    if (invoice.payment_status !== 'unpaid') {
      return Response.json({ error: 'Invoice already paid' }, { status: 400, headers: corsHeaders });
    }

    // Get operator Stripe account
    const operatorAccounts = await helper.asServiceRole.entities.OperatorStripeAccount.filter({
      operator_id: invoice.operator_id
    });

    if (!operatorAccounts || operatorAccounts.length === 0 || !(operatorAccounts[0] as any).charges_enabled) {
      return Response.json({ error: 'Operator cannot accept payments' }, { status: 400, headers: corsHeaders });
    }

    const operatorStripeAccount = operatorAccounts[0] as any;

    // Get platform fee
    const settings = await helper.asServiceRole.entities.PlatformSettings.filter({
      setting_key: 'platform_fee_percent'
    });
    const platformFeePercent = settings && settings.length > 0 ? parseFloat((settings[0] as any).setting_value) : 10;

    // Calculate amounts (in cents)
    const amountTotal = Math.round((invoice.actual_cost || invoice.final_cost_max || invoice.total_estimated_cost_max) * 100);
    const amountPlatformFee = Math.round(amountTotal * (platformFeePercent / 100));
    const amountOperator = amountTotal - amountPlatformFee;

    // Get payment method
    let paymentMethodId = payment_method_id;
    if (!paymentMethodId) {
      const methods = await helper.entities.PaymentMethod.filter({
        user_id: user.id,
        is_default: true,
        status: 'active'
      });
      if (!methods || methods.length === 0) {
        return Response.json({ error: 'No payment method available' }, { status: 400, headers: corsHeaders });
      }
      paymentMethodId = (methods[0] as any).stripe_payment_method_id;
    }

    // Create and confirm PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: 'usd',
      customer: user.user_metadata?.stripe_customer_id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      transfer_data: {
        destination: operatorStripeAccount.stripe_account_id,
        amount: amountOperator
      },
      metadata: {
        invoice_id: invoice.id,
        property_id: invoice.property_id,
        operator_id: invoice.operator_id
      },
      description: `Payment for ${invoice.package_name}`
    });

    if (paymentIntent.status === 'succeeded') {
      // Create Transaction record
      const transaction = await helper.entities.Transaction.create({
        transaction_type: 'payment',
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge,
        invoice_id: invoice.id,
        property_id: invoice.property_id,
        payer_user_id: user.id,
        payee_operator_id: invoice.operator_id,
        amount_total: amountTotal,
        amount_operator: amountOperator,
        amount_platform_fee: amountPlatformFee,
        platform_fee_percent: platformFeePercent,
        currency: 'usd',
        description: `Payment for ${invoice.package_name}`,
        processed_at: new Date().toISOString()
      });

      // Update invoice
      await helper.entities.ServicePackage.update(invoice_id, {
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        transaction_id: (transaction as any).id,
        paid_at: new Date().toISOString(),
        paid_amount: amountTotal
      });

      return Response.json({ success: true, transaction }, { headers: corsHeaders });
    } else {
      return Response.json({
        success: false,
        error: 'Payment requires additional action'
      }, { status: 400, headers: corsHeaders });
    }
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500, headers: corsHeaders });
  }
});
