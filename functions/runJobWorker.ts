import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const { batch_size = 10, queue = null } = await req.json();

    let processedCount = 0;
    const results: any[] = [];

    for (let i = 0; i < batch_size; i++) {
      const result = await helper.asServiceRole.functions.invoke('processNextJob', {
        queue,
        worker_id: `worker-${Date.now()}-${i}`
      });

      if (result.data?.processed) {
        processedCount++;
        results.push({
          job_id: result.data.job_id,
          job_type: result.data.job_type,
          status: 'completed'
        });
      } else if (result.data?.error) {
        results.push({
          job_id: result.data.job_id,
          status: 'failed',
          error: result.data.error
        });
      } else {
        // No more jobs
        break;
      }
    }

    return Response.json({
      success: true,
      processed_count: processedCount,
      results
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error running job worker:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
