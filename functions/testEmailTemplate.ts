import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { event_type, test_data } = await req.json();

    if (!event_type) {
      return Response.json({ error: 'Missing event_type' }, { status: 400 });
    }

    // Default test data for each event type
    const defaultTestData = {
      service_package_submitted: {
        package_id: 'test_pkg_123',
        operator_id: 'test_op_123',
        property_id: 'test_prop_123',
        customer_name: 'John Smith',
        item_count: 3,
        total_cost_estimate: 850.00
      },
      service_package_quoted: {
        package_id: 'test_pkg_123',
        property_id: 'test_prop_123',
        operator_name: 'ABC Property Services',
        total_cost: 1250.00,
        estimated_hours: 8,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        operator_notes: 'I can schedule this for next Tuesday. Materials are in stock.'
      },
      service_package_approved: {
        package_id: 'test_pkg_123',
        operator_id: 'test_op_123',
        property_id: 'test_prop_123',
        customer_name: 'John Smith',
        approved_amount: 1250.00,
        scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      payment_succeeded: {
        payer_user_id: user.id,
        amount: 1250.00,
        description: 'Plumbing repair service package',
        payment_method_last4: '4242',
        transaction_id: 'txn_test_123456789'
      },
      payment_failed: {
        payer_user_id: user.id,
        amount: 1250.00,
        description: 'HVAC maintenance service',
        failure_reason: 'Your card was declined. Please contact your bank or try a different payment method.'
      },
      inspection_due: {
        property_id: 'test_prop_123',
        season: 'Spring',
        recommended_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        inspection_items: [
          'HVAC system check',
          'Gutter cleaning',
          'Roof inspection',
          'Exterior drainage'
        ]
      }
    };

    const eventData = test_data || defaultTestData[event_type];

    if (!eventData) {
      return Response.json({ 
        error: `No test data for event type: ${event_type}. Supported: ${Object.keys(defaultTestData).join(', ')}` 
      }, { status: 400 });
    }

    // Trigger the notification event (will send to your email)
    const result = await base44.asServiceRole.functions.invoke('triggerNotificationEvent', {
      event_type,
      event_data: {
        ...eventData,
        payer_user_id: eventData.payer_user_id || user.id,
        operator_id: eventData.operator_id || 'test_operator',
        property_id: eventData.property_id || 'test_property'
      }
    });

    return Response.json({
      success: true,
      message: `Test email sent for ${event_type}`,
      sent_to: user.email,
      result: result.data
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});