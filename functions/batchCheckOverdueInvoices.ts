import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const now = new Date();

    // Find unpaid invoices past due date
    const allPackages = await helper.asServiceRole.entities.ServicePackage.filter({});

    const overdueInvoices = allPackages.filter((pkg: any) => {
      if (pkg.payment_status !== 'unpaid') return false;
      if (!pkg.payment_due_date) return false;
      return new Date(pkg.payment_due_date) < now;
    });

    const results: any[] = [];

    for (const invoice of overdueInvoices) {
      const invoiceData = invoice as any;
      try {
        // Update status to overdue
        await helper.asServiceRole.entities.ServicePackage.update(invoiceData.id, {
          payment_status: 'overdue',
          overdue_notice_sent_at: now.toISOString()
        });

        // Get property owner
        const properties = await helper.asServiceRole.entities.Property.filter({
          id: invoiceData.property_id
        });

        if (properties && properties.length > 0) {
          // Queue notification
          await helper.asServiceRole.functions.invoke('queueJob', {
            job_type: 'send_notification',
            payload: {
              event_type: 'invoice_overdue',
              event_data: {
                invoice_id: invoiceData.id,
                property_id: invoiceData.property_id,
                amount: invoiceData.final_cost_max || invoiceData.total_estimated_cost_max
              }
            },
            queue: 'notifications',
            priority: 'high'
          });
        }

        results.push({
          invoice_id: invoiceData.id,
          status: 'notified'
        });
      } catch (error: any) {
        results.push({
          invoice_id: invoiceData.id,
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
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error checking overdue invoices:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
