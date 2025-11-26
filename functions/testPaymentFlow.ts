import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stripe = getStripeClient();
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';
    const isLiveMode = stripeMode === 'live';

    const testResults = {
      stripe_mode: stripeMode,
      mode: isLiveMode ? 'live' : 'test',
      step1_customer_creation: { status: 'pending' },
      step2_payment_method_setup: { status: 'pending' },
      step3_test_charge: { status: 'pending' },
      step4_cleanup: { status: 'pending' }
    };

    // Step 1: Create test customer
    let testCustomer;
    try {
      testCustomer = await stripe.customers.create({
        email: 'test-payment-flow@360method.com',
        name: 'Test Payment Flow',
        metadata: { test: 'true' }
      });
      testResults.step1_customer_creation = {
        status: 'success',
        customer_id: testCustomer.id
      };
    } catch (error) {
      testResults.step1_customer_creation = {
        status: 'failed',
        error: error.message
      };
      return Response.json({ success: false, testResults });
    }

    // Step 2: Create test payment method (card)
    let testPaymentMethod;
    try {
      if (isLiveMode) {
        // In live mode, we can't use test tokens - skip this step
        testResults.step2_payment_method_setup = {
          status: 'skipped',
          note: 'Cannot create test payment methods in live mode'
        };
      } else {
        // Test mode - use test token
        testPaymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            token: 'tok_visa'
          }
        });

        await stripe.paymentMethods.attach(testPaymentMethod.id, {
          customer: testCustomer.id
        });

        testResults.step2_payment_method_setup = {
          status: 'success',
          payment_method_id: testPaymentMethod.id
        };
      }
    } catch (error) {
      testResults.step2_payment_method_setup = {
        status: 'failed',
        error: error.message
      };
    }

    // Step 3: Create test charge (without confirming)
    try {
      if (isLiveMode) {
        // In live mode, skip actual payment intent
        testResults.step3_test_charge = {
          status: 'skipped',
          note: 'Cannot create test charges in live mode'
        };
      } else if (testPaymentMethod) {
        const testIntent = await stripe.paymentIntents.create({
          amount: 1000, // $10.00 test charge
          currency: 'usd',
          customer: testCustomer.id,
          payment_method: testPaymentMethod.id,
          off_session: false,
          confirm: false,
          metadata: { test: 'true' }
        });

        testResults.step3_test_charge = {
          status: 'success',
          payment_intent_id: testIntent.id,
          client_secret: testIntent.client_secret,
          note: 'Payment intent created but not confirmed (test only)'
        };

        // Cancel the test payment intent
        await stripe.paymentIntents.cancel(testIntent.id);
      } else {
        testResults.step3_test_charge = {
          status: 'skipped',
          note: 'No payment method available'
        };
      }
    } catch (error) {
      testResults.step3_test_charge = {
        status: 'failed',
        error: error.message
      };
    }

    // Step 4: Clean up test data
    try {
      await stripe.customers.del(testCustomer.id);
      testResults.step4_cleanup = {
        status: 'success',
        message: 'Test customer deleted'
      };
    } catch (error) {
      testResults.step4_cleanup = {
        status: 'failed',
        error: error.message
      };
    }

    const allSuccess = Object.values(testResults).every(r => r.status === 'success');

    return Response.json({
      success: allSuccess,
      message: allSuccess ? 'Payment flow test passed!' : 'Some tests failed',
      testResults
    });
  } catch (error) {
    console.error('Error testing payment flow:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});