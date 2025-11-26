import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { job_ids = null } = await req.json();

    let deadJobs;
    if (job_ids && job_ids.length > 0) {
      // Retry specific jobs
      deadJobs = await Promise.all(
        job_ids.map(id => base44.asServiceRole.entities.Job.filter({ id }))
      );
      deadJobs = deadJobs.flat().filter(j => j.status === 'dead');
    } else {
      // Retry all dead jobs
      deadJobs = await base44.asServiceRole.entities.Job.filter({
        status: 'dead'
      });
    }

    for (const job of deadJobs) {
      await base44.asServiceRole.entities.Job.update(job.id, {
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
    });
  } catch (error) {
    console.error('Error retrying dead jobs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});