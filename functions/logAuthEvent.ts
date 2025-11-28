import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const payload = await req.json();
    
    const {
      event_type,
      user_id = null,
      email = null,
      status = 'success',
      failure_reason = null,
      metadata = {}
    } = payload;

    // Get request context
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(user_agent);
    
    // Calculate risk score
    const risk_score = calculateRiskScore(event_type, status);

    // Create auth event record
    const authEvent = await helper.asServiceRole.entities.AuthEvent.create({
      event_type,
      user_id,
      email,
      status,
      ip_address,
      user_agent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operating_system: deviceInfo.os,
      failure_reason,
      risk_score,
      metadata
    });

    return Response.json({ success: true, event_id: authEvent.id }, { headers: corsHeaders });
  } catch (error) {
    console.error('logAuthEvent error:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

function parseUserAgent(ua: string) {
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

function calculateRiskScore(event_type: string, status: string): number {
  let score = 0;
  
  if (status === 'failed') score += 20;
  if (status === 'blocked') score += 50;
  
  const highRiskEvents = ['password_change', 'email_change', 'mfa_disabled'];
  if (highRiskEvents.includes(event_type)) score += 15;
  
  if (event_type === 'suspicious_activity') score += 30;
  if (event_type === 'account_locked') score += 40;
  
  return Math.min(score, 100);
}
