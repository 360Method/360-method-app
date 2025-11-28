import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find maintenance tasks due within 3 days
    const allTasks = await helper.asServiceRole.entities.MaintenanceTask.filter({});

    const dueTasks = allTasks.filter((task: any) => {
      // Only tasks that are not completed
      if (task.status === 'Completed') return false;

      // Has a scheduled date within 3 days
      if (!task.scheduled_date) return false;
      const scheduledDate = new Date(task.scheduled_date);
      if (scheduledDate > threeDaysFromNow) return false;

      // Not reminded in the last day
      if (task.last_reminded_date) {
        const lastReminded = new Date(task.last_reminded_date);
        if (lastReminded > oneDayAgo) return false;
      }

      // Not snoozed
      if (task.reminder_snoozed_until) {
        const snoozedUntil = new Date(task.reminder_snoozed_until);
        if (snoozedUntil > now) return false;
      }

      return true;
    });

    const results: any[] = [];

    for (const task of dueTasks) {
      const taskData = task as any;
      try {
        // Queue notification job
        await helper.asServiceRole.functions.invoke('queueJob', {
          job_type: 'send_notification',
          payload: {
            event_type: 'task_due_soon',
            event_data: {
              task_id: taskData.id,
              task_title: taskData.title,
              property_id: taskData.property_id,
              scheduled_date: taskData.scheduled_date
            }
          },
          queue: 'notifications',
          priority: 'normal'
        });

        // Update last reminded date
        await helper.asServiceRole.entities.MaintenanceTask.update(taskData.id, {
          last_reminded_date: now.toISOString()
        });

        results.push({
          task_id: taskData.id,
          status: 'queued'
        });
      } catch (error: any) {
        results.push({
          task_id: taskData.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      checked: allTasks.length,
      reminders_queued: dueTasks.length,
      results
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error processing reminders:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
