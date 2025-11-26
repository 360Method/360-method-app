import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { email, user_id = null, success, failure_reason = null } = payload;

    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    const attempt = await base44.asServiceRole.entities.LoginAttempt.create({
      email,
      user_id,
      success,
      ip_address,
      user_agent,
      failure_reason
    });

    return Response.json({ success: true, attempt_id: attempt.id });
  } catch (error) {
    console.error('logLoginAttempt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});