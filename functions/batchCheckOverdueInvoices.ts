import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    
    // Find unpaid invoices past due date
    const allPackages = await base44.asServiceRole.entities.ServicePackage.list('-created_date', 500);
    
    const overdueInvoices = allPackages.filter(pkg => {
      if (pkg.payment_status !== 'unpaid') return false;
      if (!pkg.payment_due_date) return false;
      return new Date(pkg.payment_due_date) < now;
    });

    const results = [];

    for (const invoice of overdueInvoices) {
      try {
        // Update status to overdue
        await base44.asServiceRole.entities.ServicePackage.update(invoice.id, {
          payment_status: 'overdue',
          overdue_notice_sent_at: now.toISOString()
        });

        // Get property owner
        const properties = await base44.asServiceRole.entities.Property.filter({
          id: invoice.property_id
        });

        if (properties && properties.length > 0) {
          const ownerEmail = properties[0].created_by;

          // Queue notification
          await base44.asServiceRole.functions.invoke('queueJob', {
            job_type: 'send_notification',
            payload: {
              event_type: 'invoice_overdue',
              event_data: {
                invoice_id: invoice.id,
                property_id: invoice.property_id,
                amount: invoice.final_cost_max || invoice.total_estimated_cost_max
              }
            },
            queue: 'notifications',
            priority: 'high'
          });
        }

        results.push({
          invoice_id: invoice.id,
          status: 'notified'
        });
      } catch (error) {
        results.push({
          invoice_id: invoice.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      checked: allPackages.length,
      overdue_found: overdueInvoices.length,
      results
    });
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});