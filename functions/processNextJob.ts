import { createHelperFromRequest, corsHeaders, SupabaseHelper } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const { queue = null, worker_id = 'worker-' + Date.now() } = await req.json();

    const now = new Date().toISOString();

    // Find oldest pending job that's due
    const priorityMap: Record<string, number> = { critical: 1, high: 2, normal: 3, low: 4 };

    let allJobs = await helper.asServiceRole.entities.Job.filter({
      status: 'pending'
    });

    // Filter by queue if specified
    if (queue) {
      allJobs = allJobs.filter((j: any) => j.queue === queue);
    }

    // Filter by scheduled_for and locked_until
    allJobs = allJobs.filter((j: any) => {
      const scheduledFor = new Date(j.scheduled_for || 0);
      const lockedUntil = new Date(j.locked_until || 0);
      return scheduledFor <= new Date() && lockedUntil <= new Date();
    });

    if (allJobs.length === 0) {
      return Response.json({ success: true, processed: false, message: 'No jobs available' }, { headers: corsHeaders });
    }

    // Sort by priority then scheduled_for
    allJobs.sort((a: any, b: any) => {
      const priorityDiff = priorityMap[a.priority] - priorityMap[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime();
    });

    const job = allJobs[0] as any;

    // Lock the job
    const lockDuration = 5 * 60 * 1000; // 5 minutes
    const lockedUntil = new Date(Date.now() + lockDuration).toISOString();

    await helper.asServiceRole.entities.Job.update(job.id, {
      status: 'processing',
      locked_until: lockedUntil,
      locked_by: worker_id,
      started_at: now,
      attempts: (job.attempts || 0) + 1
    });

    // Process the job
    try {
      await processJob(helper, job);

      // Mark as completed
      await helper.asServiceRole.entities.Job.update(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        locked_until: null,
        locked_by: null
      });

      return Response.json({
        success: true,
        processed: true,
        job_id: job.id,
        job_type: job.job_type
      }, { headers: corsHeaders });
    } catch (error: any) {
      await handleJobFailure(helper, job, error);
      return Response.json({
        success: true,
        processed: false,
        error: error.message,
        job_id: job.id
      }, { headers: corsHeaders });
    }
  } catch (error: any) {
    console.error('Error processing job:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

async function processJob(helper: SupabaseHelper, job: any) {
  switch (job.job_type) {
    case 'send_email_notification':
      await helper.asServiceRole.functions.invoke('sendNotificationEmail', job.payload);
      break;
    case 'send_push_notification':
      await helper.asServiceRole.functions.invoke('sendPushNotification', job.payload);
      break;
    case 'process_stripe_webhook':
      await helper.asServiceRole.functions.invoke('processStripeWebhookEvent', job.payload);
      break;
    case 'send_reminder':
      await helper.asServiceRole.functions.invoke('sendTaskReminder', job.payload);
      break;
    case 'check_overdue_invoices':
      await helper.asServiceRole.functions.invoke('checkOverdueInvoices', job.payload);
      break;
    case 'calculate_health_score':
      await helper.asServiceRole.functions.invoke('calculateHealthScore', job.payload);
      break;
    default:
      throw new Error(`Unknown job type: ${job.job_type}`);
  }
}

async function handleJobFailure(helper: SupabaseHelper, job: any, error: any) {
  const errorEntry = {
    attempt: (job.attempts || 0),
    error: error.message,
    timestamp: new Date().toISOString()
  };

  const errorHistory = job.error_history || [];
  errorHistory.push(errorEntry);

  if ((job.attempts || 0) >= (job.max_attempts || 3)) {
    // Max retries exceeded
    await helper.asServiceRole.entities.Job.update(job.id, {
      status: 'dead',
      failed_at: new Date().toISOString(),
      last_error: error.message,
      error_history: errorHistory,
      locked_until: null,
      locked_by: null
    });
  } else {
    // Schedule retry with exponential backoff
    const backoffMinutes = Math.pow(2, job.attempts || 0);
    const retryAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();

    await helper.asServiceRole.entities.Job.update(job.id, {
      status: 'pending',
      scheduled_for: retryAt,
      last_error: error.message,
      error_history: errorHistory,
      locked_until: null,
      locked_by: null
    });
  }
}
