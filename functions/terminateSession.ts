import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const payload = await req.json();
    const { session_id, reason = 'logout' } = payload;

    // Get session
    const sessions = await helper.asServiceRole.entities.UserSession.filter({ id: session_id });
    
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    const session = sessions[0];

    // Verify user owns this session (unless admin)
    if (session.user_id !== user.id && user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { 
        status: 403,
        headers: corsHeaders 
      });
    }

    // Terminate session
    await helper.asServiceRole.entities.UserSession.update(session_id, {
      status: 'terminated',
      terminated_at: new Date().toISOString(),
      termination_reason: reason
    });

    // Log event
    await helper.asServiceRole.functions.invoke('logAuthEvent', {
      event_type: 'logout',
      user_id: session.user_id,
      status: 'success',
      metadata: { session_id, reason }
    });

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('terminateSession error:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
