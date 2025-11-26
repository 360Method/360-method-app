import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active sessions for user
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      user_id: user.id,
      status: 'active'
    });

    // Sort by last active (most recent first)
    sessions.sort((a, b) => {
      const dateA = new Date(a.last_active_at || a.created_date);
      const dateB = new Date(b.last_active_at || b.created_date);
      return dateB - dateA;
    });

    // Format for display
    const formatted = sessions.map(session => ({
      id: session.id,
      device: session.device_name,
      deviceType: session.device_type,
      location: session.location_city 
        ? `${session.location_city}, ${session.location_country}`
        : 'Unknown location',
      lastActive: session.last_active_at || session.created_date,
      isCurrent: session.is_current,
      ipAddress: maskIPAddress(session.ip_address),
      expiresAt: session.expires_at
    }));

    return Response.json({ sessions: formatted });
  } catch (error) {
    console.error('getUserSessions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function maskIPAddress(ip) {
  if (!ip || ip === 'unknown') return 'Unknown';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip.substring(0, Math.floor(ip.length / 2)) + '...';
}