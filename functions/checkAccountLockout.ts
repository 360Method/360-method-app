import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { email } = payload;

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ locked: false, reason: null });
    }

    const user = users[0];
    const now = new Date();

    // Check for active lockout
    const lockouts = await base44.asServiceRole.entities.AccountLockout.filter({
      user_id: user.id,
      status: 'locked'
    });

    for (const lockout of lockouts) {
      const unlockAt = new Date(lockout.unlock_at);
      
      if (unlockAt > now) {
        // Still locked
        return Response.json({
          locked: true,
          reason: lockout.reason,
          unlock_at: lockout.unlock_at,
          minutes_remaining: Math.ceil((unlockAt - now) / 60000)
        });
      } else {
        // Auto-unlock expired lockout
        await base44.asServiceRole.entities.AccountLockout.update(lockout.id, {
          status: 'unlocked',
          unlocked_at: now.toISOString(),
          unlocked_by: 'auto'
        });
      }
    }

    return Response.json({ locked: false, reason: null });
  } catch (error) {
    console.error('checkAccountLockout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});