import { createHelperFromRequest, createServiceClient, getCorsHeaders, getCurrentUser } from './_shared/supabaseClient.ts';
import { emailTemplates } from './emailTemplates.ts';

/**
 * Send Quote Edge Function
 *
 * Sends a quote to a lead via email and/or SMS.
 *
 * Request body:
 * - quote_id: UUID of the quote to send
 * - send_email: boolean - whether to send via email
 * - send_sms: boolean - whether to send via SMS
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify user is authenticated
    const user = await getCurrentUser(req);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, {
        status: 401,
        headers: corsHeaders
      });
    }

    const helper = createHelperFromRequest(req);
    const serviceClient = createServiceClient();

    // Validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    const { quote_id, send_email, send_sms } = body;

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

    const lead = quote.operator_leads;
    const operator = quote.operators;
    const APP_URL = Deno.env.get('APP_URL') || 'https://app.360method.com';
    const quoteUrl = `${APP_URL}/q/${quote.short_code}${quote.magic_token ? `?token=${quote.magic_token}` : ''}`;

    const results = {
      email: null,
      sms: null
    };

    // Send email if requested
    if (send_email && lead.contact_email) {
      const emailApiKey = Deno.env.get('RESEND_API_KEY');

      if (emailApiKey) {
        // Use the quote_sent email template
        const template = emailTemplates.quote_sent({
          customer_name: lead.contact_name,
          operator_name: operator.business_name || `${operator.users?.first_name} ${operator.users?.last_name}`,
          quote_title: quote.title,
          quote_amount: quote.total_min,
          quote_amount_max: quote.total_max,
          property_address: lead.property_address,
          line_items: quote.line_items || [],
          valid_until: quote.valid_until,
          quote_url: quoteUrl,
          notes: quote.notes_to_customer,
          unsubscribe_url: null
        });

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${operator.business_name || '360° Method'} <quotes@360method.com>`,
            to: [lead.contact_email],
            subject: template.subject,
            html: template.html,
          }),
        });

        if (emailResponse.ok) {
          results.email = { success: true, sent_to: lead.contact_email };
        } else {
          const error = await emailResponse.text();
          results.email = { success: false, error };
        }
      } else {
        results.email = { success: false, error: 'Email not configured' };
      }
    }

    // Send SMS if requested
    if (send_sms && lead.contact_phone) {
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioSid && twilioToken && twilioPhone) {
        // Format phone for SMS
        const phone = lead.contact_phone.replace(/\D/g, '');
        const formattedPhone = phone.length === 10 ? `+1${phone}` : `+${phone}`;

        // Create SMS message
        const customerFirstName = lead.contact_name?.split(' ')[0] || 'there';
        const operatorName = operator.business_name || 'Your Service Provider';
        const amount = quote.total_max
          ? `$${quote.total_min?.toLocaleString()} - $${quote.total_max.toLocaleString()}`
          : `$${quote.total_min?.toLocaleString()}`;

        const smsMessage = `Hi ${customerFirstName}! Your quote from ${operatorName} is ready: ${amount}. View & approve: ${quoteUrl}`;

        // Send via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const auth = btoa(`${twilioSid}:${twilioToken}`);

        const smsResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: formattedPhone,
            From: twilioPhone,
            Body: smsMessage,
          }),
        });

        if (smsResponse.ok) {
          results.sms = { success: true, sent_to: formattedPhone };
        } else {
          const error = await smsResponse.text();
          results.sms = { success: false, error };
        }
      } else {
        results.sms = { success: false, error: 'SMS not configured' };
      }
    }

    // Update quote with sent timestamp and methods
    const sentVia = [];
    if (results.email?.success) sentVia.push('email');
    if (results.sms?.success) sentVia.push('sms');

    if (sentVia.length > 0) {
      await serviceClient
        .from('operator_quotes')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_via: sentVia
        })
        .eq('id', quote_id);
    }

    return Response.json({
      success: true,
      results
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('sendQuote error:', error);
    return Response.json({
      error: error.message
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
});
