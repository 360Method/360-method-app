import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403, headers: corsHeaders });
    }

    const { job_ids = null } = await req.json();

    let deadJobs: any[];
    if (job_ids && job_ids.length > 0) {
      // Retry specific jobs
      const jobPromises = job_ids.map((id: string) =>
        helper.asServiceRole.entities.Job.filter({ id })
      );
      const results = await Promise.all(jobPromises);
      deadJobs = results.flat().filter((j: any) => j.status === 'dead');
    } else {
      // Retry all dead jobs
      deadJobs = await helper.asServiceRole.entities.Job.filter({
        status: 'dead'
      });
    }

    for (const job of deadJobs) {
      await helper.asServiceRole.entities.Job.update((job as any).id, {
        status: 'pending',
        attempts: 0,
        scheduled_for: new Date().toISOString(),
        failed_at: null,
        last_error: null
      });
    }

    return Response.json({
      success: true,
      retried_count: deadJobs.length
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error retrying dead jobs:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
