import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { queue = null, worker_id = 'worker-' + Date.now() } = await req.json();

    const now = new Date().toISOString();
    
    // Find oldest pending job that's due
    const priorityMap = { critical: 1, high: 2, normal: 3, low: 4 };
    
    let allJobs = await base44.asServiceRole.entities.Job.filter({
      status: 'pending'
    }, '-created_date', 100);

    // Filter by queue if specified
    if (queue) {
      allJobs = allJobs.filter(j => j.queue === queue);
    }

    // Filter by scheduled_for and locked_until
    allJobs = allJobs.filter(j => {
      const scheduledFor = new Date(j.scheduled_for || 0);
      const lockedUntil = new Date(j.locked_until || 0);
      return scheduledFor <= new Date() && lockedUntil <= new Date();
    });

    if (allJobs.length === 0) {
      return Response.json({ success: true, processed: false, message: 'No jobs available' });
    }

    // Sort by priority then scheduled_for
    allJobs.sort((a, b) => {
      const priorityDiff = priorityMap[a.priority] - priorityMap[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.scheduled_for) - new Date(b.scheduled_for);
    });

    const job = allJobs[0];

    // Lock the job
    const lockDuration = 5 * 60 * 1000; // 5 minutes
    const lockedUntil = new Date(Date.now() + lockDuration).toISOString();
    
    await base44.asServiceRole.entities.Job.update(job.id, {
      status: 'processing',
      locked_until: lockedUntil,
      locked_by: worker_id,
      started_at: now,
      attempts: (job.attempts || 0) + 1
    });

    // Process the job
    try {
      await processJob(base44, job);
      
      // Mark as completed
      await base44.asServiceRole.entities.Job.update(job.id, {
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
      });
    } catch (error) {
      await handleJobFailure(base44, job, error);
      return Response.json({ 
        success: true, 
        processed: false, 
        error: error.message,
        job_id: job.id 
      });
    }
  } catch (error) {
    console.error('Error processing job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function processJob(base44, job) {
  switch (job.job_type) {
    case 'send_email_notification':
      await base44.asServiceRole.functions.invoke('sendNotificationEmail', job.payload);
      break;
    case 'send_push_notification':
      await base44.asServiceRole.functions.invoke('sendPushNotification', job.payload);
      break;
    case 'process_stripe_webhook':
      await base44.asServiceRole.functions.invoke('processStripeWebhookEvent', job.payload);
      break;
    case 'send_reminder':
      await base44.asServiceRole.functions.invoke('sendTaskReminder', job.payload);
      break;
    case 'check_overdue_invoices':
      await base44.asServiceRole.functions.invoke('checkOverdueInvoices', job.payload);
      break;
    case 'calculate_health_score':
      await base44.asServiceRole.functions.invoke('calculateHealthScore', job.payload);
      break;
    default:
      throw new Error(`Unknown job type: ${job.job_type}`);
  }
}

async function handleJobFailure(base44, job, error) {
  const errorEntry = {
    attempt: (job.attempts || 0),
    error: error.message,
    timestamp: new Date().toISOString()
  };
  
  const errorHistory = job.error_history || [];
  errorHistory.push(errorEntry);
  
  if ((job.attempts || 0) >= (job.max_attempts || 3)) {
    // Max retries exceeded
    await base44.asServiceRole.entities.Job.update(job.id, {
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
    
    await base44.asServiceRole.entities.Job.update(job.id, {
      status: 'pending',
      scheduled_for: retryAt,
      last_error: error.message,
      error_history: errorHistory,
      locked_until: null,
      locked_by: null
    });
  }
}