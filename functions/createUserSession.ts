import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { remember_me = false } = payload;

    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Parse user agent
    const deviceInfo = parseUserAgent(user_agent);

    // Generate session token hash (use a real hash in production)
    const session_token_hash = `hash_${Date.now()}_${Math.random().toString(36)}`;

    // Calculate expiration
    const sessionDuration = remember_me ? 30 * 24 * 60 : 24 * 60; // 30 days or 24 hours
    const expiresAt = new Date(Date.now() + sessionDuration * 60 * 1000);

    // Mark all other sessions as not current
    const existingSessions = await base44.asServiceRole.entities.UserSession.filter({
      user_id: user.id,
      status: 'active'
    });

    for (const s of existingSessions) {
      if (s.is_current) {
        await base44.asServiceRole.entities.UserSession.update(s.id, {
          is_current: false
        });
      }
    }

    // Create new session
    const session = await base44.asServiceRole.entities.UserSession.create({
      user_id: user.id,
      session_token_hash,
      device_name: `${deviceInfo.browser} on ${deviceInfo.os}`,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operating_system: deviceInfo.os,
      ip_address,
      is_current: true,
      is_remembered: remember_me,
      last_active_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active'
    });

    // Check if new device
    const isNewDevice = await checkIfNewDevice(base44, user.id, deviceInfo);
    
    if (isNewDevice) {
      await base44.asServiceRole.functions.invoke('logAuthEvent', {
        event_type: 'new_device_login',
        user_id: user.id,
        email: user.email,
        status: 'success',
        metadata: { device: session.device_name }
      });
    }

    return Response.json({ 
      success: true,
      session_id: session.id,
      expires_at: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('createUserSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseUserAgent(ua) {
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const tablet = /Tablet|iPad/i.test(ua);
  
  let browser = 'Unknown';
  if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';
  
  return {
    deviceType: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop',
    browser,
    os
  };
}

async function checkIfNewDevice(base44, userId, deviceInfo) {
  const recentSessions = await base44.asServiceRole.entities.UserSession.filter({
    user_id: userId,
    status: 'active'
  });

  // Consider it new if no sessions in last 7 days with same device
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const matchingSessions = recentSessions.filter(s => {
    const sessionDate = new Date(s.created_date);
    return sessionDate >= sevenDaysAgo && 
           s.browser === deviceInfo.browser && 
           s.operating_system === deviceInfo.os;
  });

  return matchingSessions.length === 0;
}