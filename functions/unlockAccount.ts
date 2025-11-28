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
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = await req.json();
    const { user_id, email } = payload;

    // Only admins can unlock accounts (or add other authorization logic)
    if (user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Find lockouts
    const lockouts = await helper.asServiceRole.entities.AccountLockout.filter({
      user_id,
      status: 'locked'
    });

    const now = new Date().toISOString();
    const unlocked: string[] = [];

    for (const lockout of lockouts) {
      await helper.asServiceRole.entities.AccountLockout.update((lockout as any).id, {
        status: 'unlocked',
        unlocked_at: now,
        unlocked_by: user.id
      });
      unlocked.push((lockout as any).id);
    }

    // Log event
    await helper.asServiceRole.functions.invoke('logAuthEvent', {
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
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('unlockAccount error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
