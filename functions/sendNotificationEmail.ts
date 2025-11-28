import { createHelperFromRequest, createServiceClient, corsHeaders } from './_shared/supabaseClient.ts';
import { emailTemplates } from './emailTemplates.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    
    const {
      user_id,
      notification_type,
      event_type,
      title,
      body,
      action_url,
      related_data,
      template_data
    } = await req.json();

    // Get user details from Supabase Auth
    const serviceClient = createServiceClient();
    const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user) {
      return Response.json({ error: 'User not found' }, { 
        status: 404,
        headers: corsHeaders 
      });
    }
    
    const user = userData.user;

    // Check if we have a rich template for this event
    let emailSubject = title;
    let emailBody;

    if (emailTemplates[event_type] && template_data) {
      // Use rich template
      const template = emailTemplates[event_type]({
        ...template_data,
        unsubscribe_url: `${Deno.env.get('APP_URL') || ''}/settings/notifications?unsubscribe=true`
      });
      emailSubject = template.subject;
      emailBody = template.html;
    } else {
      // Fallback to basic template
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B365D;">${title}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">${body}</p>
          ${action_url ? `
            <div style="margin: 30px 0;">
              <a href="${action_url}" 
                 style="background-color: #FF6B35; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">
            You received this notification because you're subscribed to ${notification_type} updates.
            <br>
            <a href="${Deno.env.get('APP_URL') || ''}/settings/notifications" style="color: #FF6B35;">
              Manage notification preferences
            </a>
          </p>
        </div>
      `;
    }

    // Send email using a service like Resend, SendGrid, etc.
    // For now, we'll use Supabase's built-in email or log it
    // You'll need to implement this based on your email provider
    const emailApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('SENDGRID_API_KEY');
    
    if (emailApiKey && Deno.env.get('RESEND_API_KEY')) {
      // Use Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '360° Method <notifications@360method.com>',
          to: [user.email],
          subject: emailSubject,
          html: emailBody,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email send failed: ${error}`);
      }
    } else {
      // Log for development
      console.log('📧 Email would be sent:', {
        to: user.email,
        subject: emailSubject,
        bodyPreview: emailBody.substring(0, 200)
      });
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error sending notification email:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
