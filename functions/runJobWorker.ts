import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { batch_size = 10, queue = null } = await req.json();

    let processedCount = 0;
    const results = [];

    for (let i = 0; i < batch_size; i++) {
      const result = await base44.asServiceRole.functions.invoke('processNextJob', {
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
    });
  } catch (error) {
    console.error('Error running job worker:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});