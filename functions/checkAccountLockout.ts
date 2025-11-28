import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const payload = await req.json();

    const { email } = payload;

    // Find user
    const users = await helper.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ locked: false, reason: null }, { headers: corsHeaders });
    }

    const user = users[0] as any;
    const now = new Date();

    // Check for active lockout
    const lockouts = await helper.asServiceRole.entities.AccountLockout.filter({
      user_id: user.id,
      status: 'locked'
    });

    for (const lockout of lockouts) {
      const lockoutData = lockout as any;
      const unlockAt = new Date(lockoutData.unlock_at);

      if (unlockAt > now) {
        // Still locked
        return Response.json({
          locked: true,
          reason: lockoutData.reason,
          unlock_at: lockoutData.unlock_at,
          minutes_remaining: Math.ceil((unlockAt.getTime() - now.getTime()) / 60000)
        }, { headers: corsHeaders });
      } else {
        // Auto-unlock expired lockout
        await helper.asServiceRole.entities.AccountLockout.update(lockoutData.id, {
          status: 'unlocked',
          unlocked_at: now.toISOString(),
          unlocked_by: 'auto'
        });
      }
    }

    return Response.json({ locked: false, reason: null }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('checkAccountLockout error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
