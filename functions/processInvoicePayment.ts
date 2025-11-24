import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

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

    // Get invoice
    const invoices = await base44.entities.ServicePackage.filter({ id: invoice_id });
    if (!invoices || invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }
    const invoice = invoices[0];

    if (invoice.payment_status !== 'unpaid') {
      return Response.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Get operator Stripe account
    const operatorAccounts = await base44.asServiceRole.entities.OperatorStripeAccount.filter({
      operator_id: invoice.operator_id
    });
    
    if (!operatorAccounts || operatorAccounts.length === 0 || !operatorAccounts[0].charges_enabled) {
      return Response.json({ error: 'Operator cannot accept payments' }, { status: 400 });
    }

    const operatorStripeAccount = operatorAccounts[0];

    // Get platform fee
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

    // Create and confirm PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: 'usd',
      customer: user.stripe_customer_id,
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
      const transaction = await base44.entities.Transaction.create({
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
      await base44.entities.ServicePackage.update(invoice_id, {
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        transaction_id: transaction.id,
        paid_at: new Date().toISOString(),
        paid_amount: amountTotal
      });

      return Response.json({ success: true, transaction });
    } else {
      return Response.json({ 
        success: false, 
        error: 'Payment requires additional action' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});