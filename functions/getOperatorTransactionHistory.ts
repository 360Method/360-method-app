import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const operatorId = url.searchParams.get('operator_id');
    const status = url.searchParams.get('status');

    if (!operatorId) {
      return Response.json({ error: 'Missing operator_id' }, { status: 400 });
    }

    const filter = {
      payee_operator_id: operatorId
    };

    if (status) {
      filter.status = status;
    }

    const transactions = await base44.entities.Transaction.filter(filter);

    return Response.json({ transactions });
  } catch (error) {
    console.error('Error getting operator transaction history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});