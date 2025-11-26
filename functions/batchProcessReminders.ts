import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find maintenance tasks due within 3 days
    const allTasks = await base44.asServiceRole.entities.MaintenanceTask.list('-created_date', 1000);
    
    const dueTasks = allTasks.filter(task => {
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

    const results = [];

    for (const task of dueTasks) {
      try {
        // Queue notification job
        await base44.asServiceRole.functions.invoke('queueJob', {
          job_type: 'send_notification',
          payload: {
            event_type: 'task_due_soon',
            event_data: {
              task_id: task.id,
              task_title: task.title,
              property_id: task.property_id,
              scheduled_date: task.scheduled_date
            }
          },
          queue: 'notifications',
          priority: 'normal'
        });

        // Update last reminded date
        await base44.asServiceRole.entities.MaintenanceTask.update(task.id, {
          last_reminded_date: now.toISOString()
        });

        results.push({
          task_id: task.id,
          status: 'queued'
        });
      } catch (error) {
        results.push({
          task_id: task.id,
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
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});