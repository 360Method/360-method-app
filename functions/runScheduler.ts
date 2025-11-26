import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    
    // Find enabled tasks that are due
    const allTasks = await base44.asServiceRole.entities.ScheduledTask.filter({
      enabled: true
    });

    const dueTasks = allTasks.filter(task => {
      if (!task.next_run_at) return true; // Never run, run now
      return new Date(task.next_run_at) <= now;
    });

    const results = [];

    for (const task of dueTasks) {
      try {
        // Create job for this task
        await base44.asServiceRole.functions.invoke('queueJob', {
          job_type: task.task_type,
          payload: task.payload_template || {},
          priority: 'normal',
          queue: 'scheduled'
        });

        // Calculate next run time
        const nextRun = calculateNextRun(task.schedule_type, task.schedule_config);

        // Update task
        await base44.asServiceRole.entities.ScheduledTask.update(task.id, {
          last_run_at: now.toISOString(),
          next_run_at: nextRun,
          last_run_status: 'success'
        });

        results.push({
          task_name: task.task_name,
          status: 'queued',
          next_run: nextRun
        });
      } catch (error) {
        await base44.asServiceRole.entities.ScheduledTask.update(task.id, {
          last_run_at: now.toISOString(),
          last_run_status: 'failed',
          last_error: error.message
        });

        results.push({
          task_name: task.task_name,
          status: 'failed',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed_tasks: results.length,
      results
    });
  } catch (error) {
    console.error('Error running scheduler:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateNextRun(scheduleType, config) {
  const now = new Date();

  switch (scheduleType) {
    case 'interval':
      return new Date(now.getTime() + (config.minutes || 60) * 60 * 1000).toISOString();

    case 'daily':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return tomorrow.toISOString();

    case 'weekly':
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return nextWeek.toISOString();

    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(config.dayOfMonth || 1);
      nextMonth.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return nextMonth.toISOString();

    default:
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // Default 1 hour
  }
}