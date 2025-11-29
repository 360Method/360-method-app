import { createServiceClient, corsHeaders } from '../_shared/supabaseClient.ts';

/**
 * Updates a user's tier in Clerk's publicMetadata
 * Called after successful subscription checkout or changes
 *
 * Required env vars:
 * - CLERK_SECRET_KEY: Clerk Backend API secret key
 */

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, tier, billing_cycle } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'Missing user_id' }, { status: 400, headers: corsHeaders });
    }

    if (!tier) {
      return Response.json({ error: 'Missing tier' }, { status: 400, headers: corsHeaders });
    }

    const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');
    if (!clerkSecretKey) {
      console.error('CLERK_SECRET_KEY not configured');
      return Response.json({ error: 'Clerk secret key not configured' }, { status: 500, headers: corsHeaders });
    }

    // Get current user metadata from Clerk
    const getUserResponse = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getUserResponse.ok) {
      const errorText = await getUserResponse.text();
      console.error('Failed to get user from Clerk:', errorText);
      return Response.json({ error: 'Failed to get user from Clerk' }, { status: 500, headers: corsHeaders });
    }

    const clerkUser = await getUserResponse.json();
    const currentMetadata = clerkUser.public_metadata || {};

    // Update user metadata in Clerk with new tier
    const updateResponse = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          ...currentMetadata,
          tier: tier,
          billing_cycle: billing_cycle || currentMetadata.billing_cycle,
          tier_updated_at: new Date().toISOString(),
        },
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update user in Clerk:', errorText);
      return Response.json({ error: 'Failed to update user tier in Clerk' }, { status: 500, headers: corsHeaders });
    }

    const updatedUser = await updateResponse.json();
    console.log(`Successfully updated tier for user ${user_id} to ${tier}`);

    // Also update the users table in Supabase for redundancy
    try {
      const supabase = createServiceClient();
      await supabase
        .from('users')
        .update({
          tier: tier,
          billing_cycle: billing_cycle,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id);
    } catch (dbError) {
      console.warn('Failed to update user tier in database:', dbError);
      // Don't fail the request, Clerk is the source of truth
    }

    return Response.json({
      success: true,
      user_id: user_id,
      tier: tier,
      billing_cycle: billing_cycle,
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error updating user tier:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
