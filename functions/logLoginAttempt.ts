import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const payload = await req.json();

    const { email, user_id = null, success, failure_reason = null } = payload;

    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                       req.headers.get('x-real-ip') ||
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    const attempt = await helper.asServiceRole.entities.LoginAttempt.create({
      email,
      user_id,
      success,
      ip_address,
      user_agent,
      failure_reason
    });

    return Response.json({ success: true, attempt_id: (attempt as any).id }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('logLoginAttempt error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
