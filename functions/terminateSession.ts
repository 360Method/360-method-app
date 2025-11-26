import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { session_id, reason = 'logout' } = payload;

    // Get session
    const sessions = await base44.asServiceRole.entities.UserSession.filter({ id: session_id });
    
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];

    // Verify user owns this session (unless admin)
    if (session.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Terminate session
    await base44.asServiceRole.entities.UserSession.update(session_id, {
      status: 'terminated',
      terminated_at: new Date().toISOString(),
      termination_reason: reason
    });

    // Log event
    await base44.asServiceRole.functions.invoke('logAuthEvent', {
      event_type: 'logout',
      user_id: session.user_id,
      status: 'success',
      metadata: { session_id, reason }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('terminateSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});