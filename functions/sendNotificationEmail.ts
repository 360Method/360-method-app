import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const {
      user_id,
      notification_type,
      event_type,
      title,
      body,
      action_url,
      related_data
    } = await req.json();

    // Get user details
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = users[0];

    // Build email body with HTML formatting
    const emailBody = `
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

    // Send via Core.SendEmail integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: title,
      body: emailBody,
      from_name: '360° Method'
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending notification email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});