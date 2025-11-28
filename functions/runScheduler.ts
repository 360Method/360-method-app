import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const now = new Date();

    // Find enabled tasks that are due
    const allTasks = await helper.asServiceRole.entities.ScheduledTask.filter({
      enabled: true
    });

    const dueTasks = allTasks.filter((task: any) => {
      if (!task.next_run_at) return true; // Never run, run now
      return new Date(task.next_run_at) <= now;
    });

    const results: any[] = [];

    for (const task of dueTasks) {
      const taskData = task as any;
      try {
        // Create job for this task
        await helper.asServiceRole.functions.invoke('queueJob', {
          job_type: taskData.task_type,
          payload: taskData.payload_template || {},
          priority: 'normal',
          queue: 'scheduled'
        });

        // Calculate next run time
        const nextRun = calculateNextRun(taskData.schedule_type, taskData.schedule_config);

        // Update task
        await helper.asServiceRole.entities.ScheduledTask.update(taskData.id, {
          last_run_at: now.toISOString(),
          next_run_at: nextRun,
          last_run_status: 'success'
        });

        results.push({
          task_name: taskData.task_name,
          status: 'queued',
          next_run: nextRun
        });
      } catch (error: any) {
        await helper.asServiceRole.entities.ScheduledTask.update(taskData.id, {
          last_run_at: now.toISOString(),
          last_run_status: 'failed',
          last_error: error.message
        });

        results.push({
          task_name: taskData.task_name,
          status: 'failed',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed_tasks: results.length,
      results
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error running scheduler:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

function calculateNextRun(scheduleType: string, config: any) {
  const now = new Date();

  switch (scheduleType) {
    case 'interval':
      return new Date(now.getTime() + (config.minutes || 60) * 60 * 1000).toISOString();

    case 'daily': {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return tomorrow.toISOString();
    }

    case 'weekly': {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return nextWeek.toISOString();
    }

    case 'monthly': {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(config.dayOfMonth || 1);
      nextMonth.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return nextMonth.toISOString();
    }

    default:
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // Default 1 hour
  }
}
