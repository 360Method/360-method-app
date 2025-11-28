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

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('property_id');
    const status = url.searchParams.get('status');

    const filter: any = {
      payer_user_id: user.id
    };

    if (propertyId) {
      filter.property_id = propertyId;
    }

    if (status) {
      filter.status = status;
    }

    const transactions = await helper.entities.Transaction.filter(filter);

    return Response.json({ transactions }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error getting transaction history:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
