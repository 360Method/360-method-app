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

    const scheduledTasks = [
      {
        task_name: 'Process Job Queue',
        task_type: 'run_job_worker',
        schedule_type: 'interval',
        schedule_config: { minutes: 1 },
        payload_template: { batch_size: 20 },
        enabled: true,
        next_run_at: new Date().toISOString()
      },
      {
        task_name: 'Process Due Reminders',
        task_type: 'batch_process_reminders',
        schedule_type: 'interval',
        schedule_config: { minutes: 15 },
        payload_template: {},
        enabled: true,
        next_run_at: new Date().toISOString()
      },
      {
        task_name: 'Send Daily Digests',
        task_type: 'batch_send_daily_digests',
        schedule_type: 'daily',
        schedule_config: { hour: 8, minute: 0, timezone: 'America/Los_Angeles' },
        payload_template: {},
        enabled: true,
        next_run_at: getNextDailyRun(8, 0)
      },
      {
        task_name: 'Check Overdue Invoices',
        task_type: 'batch_check_overdue_invoices',
        schedule_type: 'daily',
        schedule_config: { hour: 9, minute: 0, timezone: 'America/Los_Angeles' },
        payload_template: {},
        enabled: true,
        next_run_at: getNextDailyRun(9, 0)
      },
      {
        task_name: 'Sync Stripe Accounts',
        task_type: 'batch_sync_stripe_accounts',
        schedule_type: 'daily',
        schedule_config: { hour: 2, minute: 0, timezone: 'America/Los_Angeles' },
        payload_template: {},
        enabled: true,
        next_run_at: getNextDailyRun(2, 0)
      },
      {
        task_name: 'Recalculate Health Scores',
        task_type: 'batch_calculate_health_scores',
        schedule_type: 'daily',
        schedule_config: { hour: 3, minute: 0, timezone: 'America/Los_Angeles' },
        payload_template: {},
        enabled: true,
        next_run_at: getNextDailyRun(3, 0)
      },
      {
        task_name: 'Check Overdue Inspections',
        task_type: 'batch_check_overdue_inspections',
        schedule_type: 'weekly',
        schedule_config: { dayOfWeek: 1, hour: 8, minute: 0, timezone: 'America/Los_Angeles' },
        payload_template: {},
        enabled: true,
        next_run_at: getNextWeeklyRun(1, 8, 0)
      }
    ];

    const created: string[] = [];
    for (const taskData of scheduledTasks) {
      // Check if task already exists
      const existing = await helper.asServiceRole.entities.ScheduledTask.filter({
        task_name: taskData.task_name
      });

      if (existing && existing.length > 0) {
        console.log(`Task "${taskData.task_name}" already exists, skipping`);
        continue;
      }

      const task = await helper.asServiceRole.entities.ScheduledTask.create(taskData);
      created.push((task as any).id);
    }

    return Response.json({
      success: true,
      message: `Initialized ${created.length} scheduled tasks`,
      created_ids: created
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error initializing scheduled tasks:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

function getNextDailyRun(hour: number, minute: number) {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (next <= new Date()) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}

function getNextWeeklyRun(dayOfWeek: number, hour: number, minute: number) {
  const next = new Date();
  const currentDay = next.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;

  next.setDate(next.getDate() + daysUntilTarget);
  next.setHours(hour, minute, 0, 0);

  return next.toISOString();
}
