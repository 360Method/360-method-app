import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all jobs
    const allJobs = await base44.asServiceRole.entities.Job.list('-created_date', 1000);

    // Count by status
    const statusCounts = {};
    allJobs.forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });

    // Count pending by queue
    const queueCounts = {};
    allJobs.filter(j => j.status === 'pending').forEach(job => {
      queueCounts[job.queue] = (queueCounts[job.queue] || 0) + 1;
    });

    // Find oldest pending
    const pendingJobs = allJobs.filter(j => j.status === 'pending').sort((a, b) => 
      new Date(a.created_date) - new Date(b.created_date)
    );
    const oldestPending = pendingJobs[0];

    // Recent failed jobs
    const recentFailed = allJobs
      .filter(j => j.status === 'failed' || j.status === 'dead')
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
      .slice(0, 10);

    return Response.json({
      success: true,
      status_counts: statusCounts,
      pending_by_queue: queueCounts,
      oldest_pending_age_ms: oldestPending 
        ? Date.now() - new Date(oldestPending.created_date).getTime() 
        : null,
      recent_failures: recentFailed.map(j => ({
        id: j.id,
        job_type: j.job_type,
        status: j.status,
        error: j.last_error,
        attempts: j.attempts,
        failed_at: j.failed_at || j.updated_date
      }))
    });
  } catch (error) {
    console.error('Error getting job queue status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});