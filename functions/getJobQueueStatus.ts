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
      return Response.json({ error: 'Admin access required' }, { 
        status: 403,
        headers: corsHeaders 
      });
    }

    // Get all jobs
    const allJobs = await helper.asServiceRole.entities.Job.list('-created_at');

    // Count by status
    const statusCounts: Record<string, number> = {};
    allJobs.forEach((job: any) => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });

    // Count pending by queue
    const queueCounts: Record<string, number> = {};
    allJobs.filter((j: any) => j.status === 'pending').forEach((job: any) => {
      queueCounts[job.queue] = (queueCounts[job.queue] || 0) + 1;
    });

    // Find oldest pending
    const pendingJobs = allJobs.filter((j: any) => j.status === 'pending').sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const oldestPending = pendingJobs[0];

    // Recent failed jobs
    const recentFailed = allJobs
      .filter((j: any) => j.status === 'failed' || j.status === 'dead')
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10);

    return Response.json({
      success: true,
      status_counts: statusCounts,
      pending_by_queue: queueCounts,
      oldest_pending_age_ms: oldestPending 
        ? Date.now() - new Date(oldestPending.created_at).getTime() 
        : null,
      recent_failures: recentFailed.map((j: any) => ({
        id: j.id,
        job_type: j.job_type,
        status: j.status,
        error: j.last_error,
        attempts: j.attempts,
        failed_at: j.failed_at || j.updated_at
      }))
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting job queue status:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
