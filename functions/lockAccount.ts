import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const ATTEMPT_WINDOW_MINUTES = 15;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const payload = await req.json();

    const { email, reason = 'too_many_attempts' } = payload;

    // Find user
    const users = await helper.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
    }

    const user = users[0] as any;

    // Check recent failed attempts
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    const recentAttempts = await helper.asServiceRole.entities.LoginAttempt.filter({
      email,
      success: false
    });

    const recentFailures = recentAttempts.filter(
      (a: any) => new Date(a.created_at) >= windowStart
    );

    const failedCount = recentFailures.length;

    // Check if should lock (only for too_many_attempts reason)
    if (reason === 'too_many_attempts' && failedCount < MAX_FAILED_ATTEMPTS) {
      return Response.json({
        locked: false,
        message: 'Threshold not met',
        attempts: failedCount,
        threshold: MAX_FAILED_ATTEMPTS
      }, { headers: corsHeaders });
    }

    // Check if already locked
    const existingLockouts = await helper.asServiceRole.entities.AccountLockout.filter({
      user_id: user.id,
      status: 'locked'
    });

    if (existingLockouts.length > 0) {
      return Response.json({
        locked: true,
        message: 'Already locked',
        unlock_at: (existingLockouts[0] as any).unlock_at
      }, { headers: corsHeaders });
    }

    // Create lockout
    const now = new Date();
    const unlockAt = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);

    const lockout = await helper.asServiceRole.entities.AccountLockout.create({
      user_id: user.id,
      email,
      reason,
      failed_attempts: failedCount,
      locked_at: now.toISOString(),
      unlock_at: unlockAt.toISOString(),
      status: 'locked'
    });

    // Log event
    await helper.asServiceRole.functions.invoke('logAuthEvent', {
      event_type: 'account_locked',
      user_id: user.id,
      email,
      status: 'success',
      metadata: { reason, failed_attempts: failedCount, unlock_at: unlockAt.toISOString() }
    });

    return Response.json({
      locked: true,
      lockout_id: (lockout as any).id,
      unlock_at: unlockAt.toISOString(),
      reason
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('lockAccount error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
