import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('property_id');
    const status = url.searchParams.get('status');

    const filter = {
      payer_user_id: user.id
    };

    if (propertyId) {
      filter.property_id = propertyId;
    }

    if (status) {
      filter.status = status;
    }

    const transactions = await base44.entities.Transaction.filter(filter);

    return Response.json({ transactions });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});