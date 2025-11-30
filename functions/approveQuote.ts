import { createHelperFromRequest, createServiceClient, getCorsHeaders } from './_shared/supabaseClient.ts';
import { emailTemplates } from './emailTemplates.ts';

/**
 * Approve Quote Edge Function
 *
 * Approves a quote and notifies the operator.
 * NOTE: This function is called by unauthenticated customers via magic token,
 * so auth check is done via magic token validation instead of user session.
 *
 * Request body:
 * - quote_id: UUID of the quote to approve
 * - token: magic token for authorization (required for customer access)
 * - customer_notes: string (optional notes from customer)
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const serviceClient = createServiceClient();

    // Validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    const { quote_id, token, customer_notes } = body;

    // Validate customer_notes length to prevent abuse
    if (customer_notes && customer_notes.length > 5000) {
      return Response.json({ error: 'Notes too long' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!quote_id) {
      return Response.json({ error: 'quote_id is required' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get the quote with lead and operator info
    const { data: quote, error: quoteError } = await serviceClient
      .from('operator_quotes')
      .select(`
        *,
        operator_leads!inner(
          contact_name,
          contact_email,
          contact_phone,
          property_address,
          property_city
        ),
        operators!inner(
          business_name,
          phone,
          users(first_name, last_name, email)
        )
      `)
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      return Response.json({ error: 'Quote not found' }, {
        status: 404,
        headers: corsHeaders
      });
    }

    // Validate magic token if quote has one
    if (quote.magic_token && quote.magic_token !== token) {
      return Response.json({ error: 'Invalid authorization token' }, {
        status: 401,
        headers: corsHeaders
      });
    }

    // Check if token is expired
    if (quote.magic_token_expires_at && new Date(quote.magic_token_expires_at) < new Date()) {
      return Response.json({ error: 'Quote link has expired' }, {
        status: 401,
        headers: corsHeaders
      });
    }

    // Check if quote can be approved
    if (!['sent', 'viewed', 'draft'].includes(quote.status)) {
      // SECURITY: Don't reveal internal state in error message
      return Response.json({ error: 'Quote cannot be approved' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if quote is expired
    if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
      return Response.json({ error: 'Quote has expired' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    const lead = quote.operator_leads;
    const operator = quote.operators;

    // Update quote to approved status
    const { error: updateError } = await serviceClient
      .from('operator_quotes')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        customer_notes: customer_notes || null
      })
      .eq('id', quote_id);

    if (updateError) {
      throw new Error(`Failed to approve quote: ${updateError.message}`);
    }

    // Update lead stage
    await serviceClient
      .from('operator_leads')
      .update({ stage: 'approved' })
      .eq('id', quote.lead_id);

    // Log activity
    await serviceClient
      .from('operator_lead_activities')
      .insert({
        lead_id: quote.lead_id,
        operator_id: quote.operator_id,
        activity_type: 'approved',
        description: 'Quote approved by customer',
        metadata: customer_notes ? { customer_notes } : null
      });

    // Notify operator
    let notificationResult = null;
    const emailApiKey = Deno.env.get('RESEND_API_KEY');
    const APP_URL = Deno.env.get('APP_URL') || 'https://app.360method.com';

    if (emailApiKey && operator.users?.email && emailTemplates.quote_approved) {
      const template = emailTemplates.quote_approved({
        operator_name: operator.users?.first_name || 'there',
        customer_name: lead.contact_name,
        customer_phone: lead.contact_phone,
        customer_email: lead.contact_email,
        quote_title: quote.title,
        quote_amount: quote.total_min,
        quote_amount_max: quote.total_max,
        property_address: lead.property_address
          ? `${lead.property_address}${lead.property_city ? `, ${lead.property_city}` : ''}`
          : null,
        customer_notes,
        lead_url: `${APP_URL}/OperatorLeads`,
        unsubscribe_url: null
      });

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '360° Method <quotes@360method.com>',
          to: [operator.users.email],
          subject: template.subject,
          html: template.html,
        }),
      });

      notificationResult = {
        sent: emailResponse.ok,
        email: operator.users.email
      };
    }

    return Response.json({
      success: true,
      quote_id,
      status: 'approved',
      notification: notificationResult
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('approveQuote error:', error);
    return Response.json({
      error: error.message
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
});
