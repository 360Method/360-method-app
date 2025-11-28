import { createHelperFromRequest, SupabaseHelper, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    
    const { event_type, event_data } = await req.json();

    if (!event_type) {
      return Response.json({ error: 'Missing event_type' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Event templates defining notification content and recipients
    const eventTemplates: Record<string, any> = {
      // Service Package events
      service_package_submitted: {
        type: 'work_order',
        priority: 'high',
        getRecipients: async (data: any) => {
          // Notify the operator
          const operators = await helper.asServiceRole.entities.Operator.filter({ id: data.operator_id });
          return operators[0] ? [operators[0].created_by] : [];
        },
        getContent: (data: any) => ({
          title: 'New Service Request',
          body: `${data.customer_name} submitted a service request with ${data.item_count} items`,
          icon: 'clipboard-list',
          action_url: `/operator/leads?package=${data.package_id}`,
          action_label: 'Review Request'
        }),
        getTemplateData: async (data: any) => {
          const pkg = await helper.asServiceRole.entities.ServicePackage.filter({ id: data.package_id });
          const property = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return {
            customer_name: data.customer_name,
            property_address: property[0]?.address || 'Unknown',
            item_count: data.item_count,
            total_cost_estimate: data.total_cost_estimate,
            customer_notes: pkg[0]?.customer_notes || '',
            review_url: `/operator/leads?package=${data.package_id}`
          };
        }
      },

      service_package_quoted: {
        type: 'work_order',
        priority: 'high',
        getRecipients: async (data: any) => {
          // Notify the homeowner
          const properties = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
          title: 'Quote Ready',
          body: `${data.operator_name} provided a quote: $${data.total_cost.toFixed(2)}`,
          icon: 'file-text',
          action_url: `/cart-review?package=${data.package_id}`,
          action_label: 'Review Quote'
        }),
        getTemplateData: async (data: any) => {
          const pkg = await helper.asServiceRole.entities.ServicePackage.filter({ id: data.package_id });
          return {
            operator_name: data.operator_name,
            package_name: pkg[0]?.package_name || 'Service Package',
            total_cost: data.total_cost,
            estimated_hours: data.estimated_hours,
            valid_until: data.valid_until,
            operator_notes: data.operator_notes,
            approval_url: `/cart-review?package=${data.package_id}`
          };
        }
      },

      service_package_approved: {
        type: 'work_order',
        priority: 'high',
        getRecipients: async (data: any) => {
          // Notify the operator
          const operators = await helper.asServiceRole.entities.Operator.filter({ id: data.operator_id });
          return operators[0] ? [operators[0].created_by] : [];
        },
        getContent: (data: any) => ({
          title: 'Quote Approved',
          body: `${data.customer_name} approved your quote for $${data.approved_amount.toFixed(2)}`,
          icon: 'check-circle',
          action_url: `/operator/work-orders?package=${data.package_id}`,
          action_label: 'View Work Order'
        }),
        getTemplateData: async (data: any) => {
          const pkg = await helper.asServiceRole.entities.ServicePackage.filter({ id: data.package_id });
          const property = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return {
            customer_name: data.customer_name,
            package_name: pkg[0]?.package_name || 'Service Package',
            property_address: property[0]?.address || 'Unknown',
            scheduled_date: data.scheduled_date,
            approved_amount: data.approved_amount,
            work_order_url: `/operator/work-orders?package=${data.package_id}`
          };
        }
      },

      inspection_due: {
        type: 'inspection',
        priority: 'normal',
        getRecipients: async (data: any) => {
          const properties = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
          title: `${data.season} Inspection Due`,
          body: `Time for your seasonal inspection at ${data.property_address}`,
          icon: 'clipboard-check',
          action_url: `/inspect?property=${data.property_id}`,
          action_label: 'Start Inspection'
        }),
        getTemplateData: async (data: any) => {
          const property = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return {
            season: data.season,
            property_address: property[0]?.address || 'Unknown',
            recommended_date: data.recommended_date,
            inspection_items: data.inspection_items,
            inspection_url: `/inspect?property=${data.property_id}`
          };
        }
      },

      // Payment events
      invoice_created: {
        type: 'payment',
        priority: 'normal',
        getRecipients: async (data: any) => {
          const packages = await helper.asServiceRole.entities.ServicePackage.filter({ id: data.invoice_id });
          if (!packages || packages.length === 0) return [];
          const pkg = packages[0];
          const properties = await helper.asServiceRole.entities.Property.filter({ id: pkg.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => {
          // Only notify the payer (homeowner)
          return data.payer_user_id ? [data.payer_user_id] : [];
        },
        getContent: (data: any) => ({
          title: 'Payment Confirmed',
          body: `Payment of $${data.amount?.toFixed(2) || '0.00'} has been processed successfully.`,
          icon: 'check-circle',
          action_url: `/transactions/${data.transaction_id}`,
          action_label: 'View Receipt'
        }),
        getTemplateData: async (data: any) => ({
          amount: data.amount || 0,
          description: data.description || 'Service payment',
          payment_method_last4: data.payment_method_last4,
          transaction_id: data.transaction_id,
          receipt_url: `/transactions/${data.transaction_id}`
        })
      },

      payment_failed: {
        type: 'payment',
        priority: 'urgent',
        getRecipients: async (data: any) => {
          return data.payer_user_id ? [data.payer_user_id] : [];
        },
        getContent: (data: any) => ({
          title: 'Payment Failed',
          body: `Unable to process payment of $${data.amount?.toFixed(2) || '0.00'}. Please update your payment method.`,
          icon: 'alert-circle',
          action_url: `/payment-methods`,
          action_label: 'Update Payment Method'
        }),
        getTemplateData: async (data: any) => ({
          amount: data.amount || 0,
          description: data.description || 'Service payment',
          failure_reason: data.failure_reason,
          payment_method_url: `/payment-methods`
        })
      },

      invoice_overdue: {
        type: 'payment',
        priority: 'urgent',
        getRecipients: async (data: any) => {
          const packages = await helper.asServiceRole.entities.ServicePackage.filter({ id: data.invoice_id });
          if (!packages || packages.length === 0) return [];
          const pkg = packages[0];
          const properties = await helper.asServiceRole.entities.Property.filter({ id: pkg.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => {
          const properties = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => {
          const properties = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => {
          const tasks = await helper.asServiceRole.entities.MaintenanceTask.filter({ id: data.task_id });
          if (!tasks || tasks.length === 0) return [];
          const task = tasks[0];
          const properties = await helper.asServiceRole.entities.Property.filter({ id: task.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => {
          const tasks = await helper.asServiceRole.entities.MaintenanceTask.filter({ id: data.task_id });
          if (!tasks || tasks.length === 0) return [];
          const task = tasks[0];
          const properties = await helper.asServiceRole.entities.Property.filter({ id: task.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => {
          const properties = await helper.asServiceRole.entities.Property.filter({ id: data.property_id });
          return properties[0] ? [properties[0].created_by] : [];
        },
        getContent: (data: any) => ({
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
        getRecipients: async (data: any) => [data.user_id],
        getContent: (data: any) => ({
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
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get recipients
    const recipients = await template.getRecipients(event_data);
    if (!recipients || recipients.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No recipients found',
        notification_ids: []
      }, { headers: corsHeaders });
    }

    // Generate content
    const content = template.getContent(event_data);

    // Generate template data for rich emails if available
    let templateData = null;
    if (template.getTemplateData) {
      try {
        templateData = await template.getTemplateData(event_data);
      } catch (error) {
        console.error('Error generating template data:', error);
      }
    }

    // Create notifications for each recipient
    const notificationIds: string[] = [];
    for (const userId of recipients) {
      try {
        const result = await helper.asServiceRole.functions.invoke('createNotification', {
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
          priority: template.priority,
          template_data: templateData
        });
        
        if (result?.notification_id) {
          notificationIds.push(result.notification_id);
        }
      } catch (error) {
        console.error(`Failed to create notification for user ${userId}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      notification_ids: notificationIds,
      recipient_count: recipients.length
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error triggering notification event:', error);
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
