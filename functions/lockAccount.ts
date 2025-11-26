import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const ATTEMPT_WINDOW_MINUTES = 15;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { email, reason = 'too_many_attempts' } = payload;

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    
    // Check recent failed attempts
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    const recentAttempts = await base44.asServiceRole.entities.LoginAttempt.filter({
      email,
      success: false
    });
    
    const recentFailures = recentAttempts.filter(
      a => new Date(a.created_date) >= windowStart
    );

    const failedCount = recentFailures.length;

    // Check if should lock (only for too_many_attempts reason)
    if (reason === 'too_many_attempts' && failedCount < MAX_FAILED_ATTEMPTS) {
      return Response.json({ 
        locked: false, 
        message: 'Threshold not met',
        attempts: failedCount,
        threshold: MAX_FAILED_ATTEMPTS
      });
    }

    // Check if already locked
    const existingLockouts = await base44.asServiceRole.entities.AccountLockout.filter({
      user_id: user.id,
      status: 'locked'
    });

    if (existingLockouts.length > 0) {
      return Response.json({ 
        locked: true,
        message: 'Already locked',
        unlock_at: existingLockouts[0].unlock_at
      });
    }

    // Create lockout
    const now = new Date();
    const unlockAt = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);

    const lockout = await base44.asServiceRole.entities.AccountLockout.create({
      user_id: user.id,
      email,
      reason,
      failed_attempts: failedCount,
      locked_at: now.toISOString(),
      unlock_at: unlockAt.toISOString(),
      status: 'locked'
    });

    // Log event
    await base44.asServiceRole.functions.invoke('logAuthEvent', {
      event_type: 'account_locked',
      user_id: user.id,
      email,
      status: 'success',
      metadata: { reason, failed_attempts: failedCount, unlock_at: unlockAt.toISOString() }
    });

    return Response.json({ 
      locked: true,
      lockout_id: lockout.id,
      unlock_at: unlockAt.toISOString(),
      reason
    });
  } catch (error) {
    console.error('lockAccount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});