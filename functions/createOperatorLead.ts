import { createHelperFromRequest, createServiceClient, getCorsHeaders } from './_shared/supabaseClient.ts';
import { emailTemplates } from './emailTemplates.ts';

/**
 * Create Operator Lead Edge Function
 *
 * Creates a new lead for an operator and optionally notifies them.
 * NOTE: This is a public endpoint for lead intake forms, so no auth is required.
 * However, we validate the operator_id exists and is active.
 *
 * Request body:
 * - operator_id: UUID of the operator
 * - contact_name: string
 * - contact_phone: string (optional)
 * - contact_email: string (optional)
 * - property_address: string (optional)
 * - property_city: string (optional)
 * - property_state: string (optional)
 * - property_zip: string (optional)
 * - lead_type: 'job' | 'list' | 'service' | 'nurture'
 * - urgency: 'emergency' | 'soon' | 'flexible'
 * - description: string
 * - source: 'website' | 'phone' | 'referral' | 'marketplace' | 'manual'
 * - notify_operator: boolean (default true)
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

    // Validate JSON input
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request' }, {
        status: 400,
        headers: corsHeaders
      });
    }
    const {
      operator_id,
      contact_name,
      contact_phone,
      contact_email,
      property_address,
      property_city,
      property_state,
      property_zip,
      lead_type = 'job',
      urgency = 'flexible',
      description,
      source = 'website',
      notify_operator = true,
      metadata = {}
    } = body;

    // Validate required fields
    if (!operator_id) {
      return Response.json({ error: 'operator_id is required' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!contact_name) {
      return Response.json({ error: 'contact_name is required' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!contact_phone && !contact_email) {
      return Response.json({ error: 'At least one contact method (phone or email) is required' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    // SECURITY: Validate input lengths to prevent abuse
    if (contact_name.length > 200 ||
        (description && description.length > 5000) ||
        (property_address && property_address.length > 500)) {
      return Response.json({ error: 'Input too long' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get operator info for notification
    const { data: operator, error: operatorError } = await serviceClient
      .from('operators')
      .select('*, users(first_name, last_name, email)')
      .eq('id', operator_id)
      .eq('status', 'active')
      .single();

    if (operatorError || !operator) {
      return Response.json({ error: 'Operator not found or inactive' }, {
        status: 404,
        headers: corsHeaders
      });
    }

    // Determine priority based on urgency
    const priorityMap = {
      emergency: 'hot',
      soon: 'high',
      flexible: 'medium'
    };

    // Create the lead
    const { data: lead, error: leadError } = await serviceClient
      .from('operator_leads')
      .insert({
        operator_id,
        contact_name,
        contact_phone,
        contact_email,
        property_address,
        property_city,
        property_state,
        property_zip,
        lead_type,
        urgency,
        description,
        source,
        stage: 'new',
        priority: priorityMap[urgency] || 'medium',
        metadata: {
          ...metadata,
          submitted_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (leadError) {
      throw new Error(`Failed to create lead: ${leadError.message}`);
    }

    // Log activity
    await serviceClient
      .from('operator_lead_activities')
      .insert({
        lead_id: lead.id,
        operator_id,
        activity_type: 'created',
        description: `Lead created via ${source}`
      });

    // Notify operator if requested
    let notificationResult = null;
    if (notify_operator && operator.users?.email) {
      const emailApiKey = Deno.env.get('RESEND_API_KEY');
      const APP_URL = Deno.env.get('APP_URL') || 'https://app.360method.com';

      if (emailApiKey && emailTemplates.new_lead_received) {
        const template = emailTemplates.new_lead_received({
          operator_name: operator.users?.first_name || 'there',
          customer_name: contact_name,
          customer_phone: contact_phone,
          customer_email: contact_email,
          property_address: property_address
            ? `${property_address}${property_city ? `, ${property_city}` : ''}`
            : null,
          lead_type,
          urgency,
          description,
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
            from: '360° Method <leads@360method.com>',
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
    }

    return Response.json({
      success: true,
      lead,
      notification: notificationResult
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('createOperatorLead error:', error);
    return Response.json({
      error: error.message
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
});
