import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

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
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoice_id, payment_method_id } = await req.json();

    if (!invoice_id) {
      return Response.json({ error: 'Missing invoice_id' }, { status: 400 });
    }

    const stripe = getStripeClient();

    // Get invoice
    const invoices = await base44.entities.ServicePackage.filter({ id: invoice_id });
    if (!invoices || invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }
    const invoice = invoices[0];

    // Verify invoice is unpaid
    if (invoice.payment_status !== 'unpaid') {
      return Response.json({ error: 'Invoice already paid or not payable' }, { status: 400 });
    }

    // Get operator Stripe account
    const operatorAccounts = await base44.asServiceRole.entities.OperatorStripeAccount.filter({
      operator_id: invoice.operator_id
    });
    
    if (!operatorAccounts || operatorAccounts.length === 0 || !operatorAccounts[0].charges_enabled) {
      return Response.json({ error: 'Operator cannot accept payments' }, { status: 400 });
    }

    const operatorStripeAccount = operatorAccounts[0];

    // Get platform fee from settings
    const settings = await base44.asServiceRole.entities.PlatformSettings.filter({
      setting_key: 'platform_fee_percent'
    });
    const platformFeePercent = settings && settings.length > 0 ? parseFloat(settings[0].setting_value) : 10;

    // Calculate amounts (in cents)
    const amountTotal = Math.round((invoice.actual_cost || invoice.final_cost_max || invoice.total_estimated_cost_max) * 100);
    const amountPlatformFee = Math.round(amountTotal * (platformFeePercent / 100));
    const amountOperator = amountTotal - amountPlatformFee;

    // Get payment method
    let paymentMethodId = payment_method_id;
    if (!paymentMethodId) {
      const methods = await base44.entities.PaymentMethod.filter({
        user_id: user.id,
        is_default: true,
        status: 'active'
      });
      if (!methods || methods.length === 0) {
        return Response.json({ error: 'No payment method available' }, { status: 400 });
      }
      paymentMethodId = methods[0].stripe_payment_method_id;
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: 'usd',
      customer: user.stripe_customer_id,
      payment_method: paymentMethodId,
      off_session: false,
      confirm: false,
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

    // Create Transaction record
    const transaction = await base44.entities.Transaction.create({
      transaction_type: 'payment',
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      invoice_id: invoice.id,
      property_id: invoice.property_id,
      payer_user_id: user.id,
      payee_operator_id: invoice.operator_id,
      amount_total: amountTotal,
      amount_operator: amountOperator,
      amount_platform_fee: amountPlatformFee,
      platform_fee_percent: platformFeePercent,
      currency: 'usd',
      description: `Payment for ${invoice.package_name}`
    });

    // Update invoice
    await base44.entities.ServicePackage.update(invoice_id, {
      payment_status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      transaction_id: transaction.id
    });

    return Response.json({
      client_secret: paymentIntent.client_secret,
      transaction_id: transaction.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});