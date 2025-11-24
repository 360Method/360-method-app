import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event_type, event_data } = await req.json();

    if (!event_type) {
      return Response.json({ error: 'Missing event_type' }, { status: 400 });
    }

    // Event templates defining notification content and recipients
    const eventTemplates = {
      // Payment events
      invoice_created: {
        type: 'payment',
        priority: 'normal',
        getRecipients: async (data) => {
          const packages = await base44.asServiceRole.entities.ServicePackage.filter({ id: data.invoice_id });
          if (!packages || packages.length === 0) return [];
          const pkg = packages[0];
          const properties = await base44.asServiceRole.entities.Property.filter({ id: pkg.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'New Invoice Received',
          body: `You have a new invoice for ${data.package_name || 'services'}. Amount: $${data.amount?.toFixed(2) || '0.00'}`,
          icon: 'receipt',
          action_url: `/invoices/${data.invoice_id}`,
          action_label: 'View Invoice'
        })
      },
      
      payment_succeeded: {
        type: 'payment',
        priority: 'high',
        getRecipients: async (data) => {
          const recipients = [];
          // Notify owner
          if (data.payer_user_id) recipients.push(data.payer_user_id);
          // Notify operator
          if (data.operator_id) {
            const operators = await base44.asServiceRole.entities.Operator.filter({ id: data.operator_id });
            if (operators[0]) recipients.push(operators[0].created_by);
          }
          return recipients;
        },
        getContent: (data) => ({
          title: 'Payment Successful',
          body: `Payment of $${data.amount?.toFixed(2) || '0.00'} has been processed successfully.`,
          icon: 'check-circle',
          action_url: `/transactions/${data.transaction_id}`,
          action_label: 'View Receipt'
        })
      },

      invoice_overdue: {
        type: 'payment',
        priority: 'urgent',
        getRecipients: async (data) => {
          const packages = await base44.asServiceRole.entities.ServicePackage.filter({ id: data.invoice_id });
          if (!packages || packages.length === 0) return [];
          const pkg = packages[0];
          const properties = await base44.asServiceRole.entities.Property.filter({ id: pkg.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'Invoice Overdue',
          body: `Invoice #${data.invoice_id?.substring(0, 8)} is now overdue. Please pay as soon as possible.`,
          icon: 'alert-circle',
          action_url: `/invoices/${data.invoice_id}`,
          action_label: 'Pay Now'
        })
      },

      // Inspection events
      inspection_scheduled: {
        type: 'inspection',
        priority: 'normal',
        getRecipients: async (data) => {
          const properties = await base44.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'Inspection Scheduled',
          body: `${data.season} inspection scheduled for ${new Date(data.inspection_date).toLocaleDateString()}`,
          icon: 'clipboard-check',
          action_url: `/inspect?property=${data.property_id}`,
          action_label: 'View Details'
        })
      },

      inspection_completed: {
        type: 'inspection',
        priority: 'high',
        getRecipients: async (data) => {
          const properties = await base44.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'Inspection Complete',
          body: `${data.season} inspection completed. ${data.issues_found || 0} items need attention.`,
          icon: 'check-square',
          action_url: `/inspect?property=${data.property_id}`,
          action_label: 'View Report'
        })
      },

      // Task events
      task_due_soon: {
        type: 'task',
        priority: 'high',
        getRecipients: async (data) => {
          const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({ id: data.task_id });
          if (!tasks || tasks.length === 0) return [];
          const task = tasks[0];
          const properties = await base44.asServiceRole.entities.Property.filter({ id: task.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'Task Due Soon',
          body: `"${data.task_title}" is due on ${new Date(data.scheduled_date).toLocaleDateString()}`,
          icon: 'clock',
          action_url: `/prioritize?task=${data.task_id}`,
          action_label: 'View Task'
        })
      },

      task_overdue: {
        type: 'task',
        priority: 'urgent',
        getRecipients: async (data) => {
          const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({ id: data.task_id });
          if (!tasks || tasks.length === 0) return [];
          const task = tasks[0];
          const properties = await base44.asServiceRole.entities.Property.filter({ id: task.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'Task Overdue',
          body: `"${data.task_title}" is now overdue. Take action to prevent cascading issues.`,
          icon: 'alert-triangle',
          action_url: `/prioritize?task=${data.task_id}`,
          action_label: 'Handle Now'
        })
      },

      // Property events
      property_score_critical: {
        type: 'property',
        priority: 'urgent',
        getRecipients: async (data) => {
          const properties = await base44.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data) => ({
          title: 'Property Health Alert',
          body: `Property health score dropped to ${data.health_score}. Immediate attention required.`,
          icon: 'alert-circle',
          action_url: `/properties?id=${data.property_id}`,
          action_label: 'View Property'
        })
      },

      // System events
      account_created: {
        type: 'system',
        priority: 'normal',
        getRecipients: async (data) => [data.user_id],
        getContent: (data) => ({
          title: 'Welcome to 360° Method!',
          body: 'Get started by adding your first property and documenting your baseline.',
          icon: 'home',
          action_url: '/properties',
          action_label: 'Add Property'
        })
      }
    };

    const template = eventTemplates[event_type];
    if (!template) {
      return Response.json({ 
        error: `Unknown event type: ${event_type}` 
      }, { status: 400 });
    }

    // Get recipients
    const recipients = await template.getRecipients(event_data);
    if (!recipients || recipients.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No recipients found',
        notification_ids: []
      });
    }

    // Generate content
    const content = template.getContent(event_data);

    // Create notifications for each recipient
    const notificationIds = [];
    for (const userId of recipients) {
      try {
        const result = await base44.asServiceRole.functions.invoke('createNotification', {
          user_id: userId,
          notification_type: template.type,
          event_type,
          title: content.title,
          body: content.body,
          icon: content.icon,
          action_url: content.action_url,
          action_label: content.action_label,
          related_entity_type: event_data.related_entity_type,
          related_entity_id: event_data.related_entity_id,
          property_id: event_data.property_id,
          sender_user_id: event_data.sender_user_id,
          priority: template.priority
        });
        
        if (result.data?.notification_id) {
          notificationIds.push(result.data.notification_id);
        }
      } catch (error) {
        console.error(`Failed to create notification for user ${userId}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      notification_ids: notificationIds,
      recipient_count: recipients.length
    });
  } catch (error) {
    console.error('Error triggering notification event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});