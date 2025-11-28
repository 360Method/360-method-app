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

    // Get active sessions for user
    const sessions = await helper.asServiceRole.entities.UserSession.filter({
      user_id: user.id,
      status: 'active'
    });

    // Sort by last active (most recent first)
    sessions.sort((a: any, b: any) => {
      const dateA = new Date(a.last_active_at || a.created_at);
      const dateB = new Date(b.last_active_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    // Format for display
    const formatted = sessions.map((session: any) => ({
      id: session.id,
      device: session.device_name,
      deviceType: session.device_type,
      location: session.location_city 
        ? `${session.location_city}, ${session.location_country}`
        : 'Unknown location',
      lastActive: session.last_active_at || session.created_at,
      isCurrent: session.is_current,
      ipAddress: maskIPAddress(session.ip_address),
      expiresAt: session.expires_at
    }));

    return Response.json({ sessions: formatted }, { headers: corsHeaders });
  } catch (error) {
    console.error('getUserSessions error:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

function maskIPAddress(ip: string | null | undefined): string {
  if (!ip || ip === 'unknown') return 'Unknown';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip.substring(0, Math.floor(ip.length / 2)) + '...';
}
