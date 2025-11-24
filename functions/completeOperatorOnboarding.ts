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

    const { operator_id } = await req.json();

    if (!operator_id) {
      return Response.json({ error: 'Missing operator_id' }, { status: 400 });
    }

    // Get OperatorStripeAccount
    const accounts = await base44.asServiceRole.entities.OperatorStripeAccount.filter({
      operator_id,
      user_id: user.id
    });

    if (!accounts || accounts.length === 0) {
      return Response.json({ error: 'Stripe account not found' }, { status: 404 });
    }

    const operatorAccount = accounts[0];

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(operatorAccount.stripe_account_id);

    // Update OperatorStripeAccount
    await base44.asServiceRole.entities.OperatorStripeAccount.update(operatorAccount.id, {
      stripe_account_status: account.details_submitted ? 'active' : 'requires_information',
      onboarding_complete: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements_due: account.requirements?.currently_due || [],
      last_stripe_sync: new Date().toISOString()
    });

    // Update Operator entity
    const operators = await base44.asServiceRole.entities.Operator.filter({ id: operator_id });
    if (operators && operators.length > 0) {
      await base44.asServiceRole.entities.Operator.update(operator_id, {
        stripe_connected: account.details_submitted && account.charges_enabled,
        stripe_account_id: operatorAccount.stripe_account_id
      });
    }

    return Response.json({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_complete: account.details_submitted,
      requirements_due: account.requirements?.currently_due || []
    });
  } catch (error) {
    console.error('Error completing operator onboarding:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});