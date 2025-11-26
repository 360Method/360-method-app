import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { user_id, email } = payload;

    // Only admins can unlock accounts (or add other authorization logic)
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find lockouts
    const lockouts = await base44.asServiceRole.entities.AccountLockout.filter({
      user_id,
      status: 'locked'
    });

    const now = new Date().toISOString();
    const unlocked = [];

    for (const lockout of lockouts) {
      await base44.asServiceRole.entities.AccountLockout.update(lockout.id, {
        status: 'unlocked',
        unlocked_at: now,
        unlocked_by: user.id
      });
      unlocked.push(lockout.id);
    }

    // Log event
    await base44.asServiceRole.functions.invoke('logAuthEvent', {
      event_type: 'account_unlocked',
      user_id,
      email,
      status: 'success',
      metadata: { unlocked_by: user.id, unlocked_by_email: user.email }
    });

    return Response.json({ 
      success: true,
      unlocked_count: unlocked.length,
      lockout_ids: unlocked
    });
  } catch (error) {
    console.error('unlockAccount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});