/**
 * Notification Trigger Helper
 * Provides easy-to-use functions for triggering notifications from the frontend
 */
import { functions } from './supabaseClient';

/**
 * Trigger a notification event via the edge function
 * @param {string} eventType - The type of event (e.g., 'task_completed', 'inspection_completed')
 * @param {Object} eventData - Data associated with the event
 * @returns {Promise<Object>} Response from the server
 */
export async function triggerNotificationEvent(eventType, eventData) {
  try {
    const { data, error } = await functions.invoke('triggerNotificationEvent', {
      body: {
        event_type: eventType,
        event_data: eventData
      }
    });

    if (error) {
      console.error('Notification trigger error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to trigger notification:', error);
    // Don't throw - notification failures shouldn't break app functionality
    return { success: false, error: error.message };
  }
}

// ============================================
// HOMEOWNER/INVESTOR NOTIFICATIONS
// ============================================

/**
 * Notify when a task is completed
 */
export async function notifyTaskCompleted({ taskId, taskTitle, propertyId, userId, completedBy = 'diy' }) {
  return triggerNotificationEvent('task_completed', {
    task_id: taskId,
    task_title: taskTitle,
    property_id: propertyId,
    user_id: userId,
    completed_by: completedBy
  });
}

/**
 * Notify when a task is scheduled
 */
export async function notifyTaskScheduled({ taskId, taskTitle, propertyId, userId, scheduledDate }) {
  return triggerNotificationEvent('task_scheduled', {
    task_id: taskId,
    task_title: taskTitle,
    property_id: propertyId,
    user_id: userId,
    scheduled_date: scheduledDate
  });
}

/**
 * Notify when an inspection is completed
 */
export async function notifyInspectionCompleted({ inspectionId, propertyId, userId, issueCount, healthScore }) {
  return triggerNotificationEvent('inspection_completed', {
    inspection_id: inspectionId,
    property_id: propertyId,
    user_id: userId,
    issue_count: issueCount,
    health_score: healthScore
  });
}

/**
 * Notify when property health score changes significantly
 */
export async function notifyHealthScoreChange({ propertyId, userId, oldScore, newScore }) {
  return triggerNotificationEvent('property_score_critical', {
    property_id: propertyId,
    user_id: userId,
    old_score: oldScore,
    new_score: newScore
  });
}

/**
 * Notify about task due soon
 */
export async function notifyTaskDueSoon({ taskId, taskTitle, propertyId, userId, dueDate }) {
  return triggerNotificationEvent('task_due_soon', {
    task_id: taskId,
    task_title: taskTitle,
    property_id: propertyId,
    user_id: userId,
    due_date: dueDate
  });
}

/**
 * Notify about overdue task
 */
export async function notifyTaskOverdue({ taskId, taskTitle, propertyId, userId, dueDate }) {
  return triggerNotificationEvent('task_overdue', {
    task_id: taskId,
    task_title: taskTitle,
    property_id: propertyId,
    user_id: userId,
    due_date: dueDate
  });
}

// ============================================
// SERVICE/MARKETPLACE NOTIFICATIONS
// ============================================

/**
 * Notify operator when service package is submitted
 */
export async function notifyServicePackageSubmitted({ packageId, operatorId, clientName, propertyAddress, services }) {
  return triggerNotificationEvent('service_package_submitted', {
    package_id: packageId,
    operator_id: operatorId,
    client_name: clientName,
    property_address: propertyAddress,
    services: services
  });
}

/**
 * Notify homeowner when quote is received
 */
export async function notifyServicePackageQuoted({ packageId, userId, operatorName, totalAmount }) {
  return triggerNotificationEvent('service_package_quoted', {
    package_id: packageId,
    user_id: userId,
    operator_name: operatorName,
    total_amount: totalAmount
  });
}

/**
 * Notify operator when service package is approved
 */
export async function notifyServicePackageApproved({ packageId, operatorId, clientName, totalAmount }) {
  return triggerNotificationEvent('service_package_approved', {
    package_id: packageId,
    operator_id: operatorId,
    client_name: clientName,
    total_amount: totalAmount
  });
}

// ============================================
// PAYMENT NOTIFICATIONS
// ============================================

/**
 * Notify about successful payment
 */
export async function notifyPaymentSucceeded({ userId, amount, invoiceId, description }) {
  return triggerNotificationEvent('payment_succeeded', {
    user_id: userId,
    amount: amount,
    invoice_id: invoiceId,
    description: description
  });
}

/**
 * Notify about failed payment
 */
export async function notifyPaymentFailed({ userId, amount, invoiceId, errorMessage }) {
  return triggerNotificationEvent('payment_failed', {
    user_id: userId,
    amount: amount,
    invoice_id: invoiceId,
    error_message: errorMessage
  });
}

/**
 * Notify about new invoice
 */
export async function notifyInvoiceCreated({ userId, operatorName, amount, invoiceId, dueDate }) {
  return triggerNotificationEvent('invoice_created', {
    user_id: userId,
    operator_name: operatorName,
    amount: amount,
    invoice_id: invoiceId,
    due_date: dueDate
  });
}

/**
 * Notify about overdue invoice
 */
export async function notifyInvoiceOverdue({ userId, operatorName, amount, invoiceId, daysPastDue }) {
  return triggerNotificationEvent('invoice_overdue', {
    user_id: userId,
    operator_name: operatorName,
    amount: amount,
    invoice_id: invoiceId,
    days_past_due: daysPastDue
  });
}

// ============================================
// OPERATOR NOTIFICATIONS
// ============================================

/**
 * Notify operator about new lead
 */
export async function notifyNewLead({ operatorId, leadId, clientName, urgency, services }) {
  return triggerNotificationEvent('new_lead_received', {
    operator_id: operatorId,
    lead_id: leadId,
    client_name: clientName,
    urgency: urgency,
    services: services
  });
}

/**
 * Notify about quote sent
 */
export async function notifyQuoteSent({ operatorId, quoteId, clientName, amount }) {
  return triggerNotificationEvent('quote_sent', {
    operator_id: operatorId,
    quote_id: quoteId,
    client_name: clientName,
    amount: amount
  });
}

/**
 * Notify about quote approval
 */
export async function notifyQuoteApproved({ operatorId, quoteId, clientName, amount }) {
  return triggerNotificationEvent('quote_approved', {
    operator_id: operatorId,
    quote_id: quoteId,
    client_name: clientName,
    amount: amount
  });
}

// ============================================
// WORK ORDER NOTIFICATIONS
// ============================================

/**
 * Notify contractor about job assignment
 */
export async function notifyJobAssigned({ contractorId, workOrderId, serviceName, propertyAddress, scheduledDate }) {
  return triggerNotificationEvent('job_assigned', {
    contractor_id: contractorId,
    work_order_id: workOrderId,
    service_name: serviceName,
    property_address: propertyAddress,
    scheduled_date: scheduledDate
  });
}

/**
 * Notify about work order started
 */
export async function notifyWorkOrderStarted({ userId, operatorId, workOrderId, serviceName }) {
  return triggerNotificationEvent('work_order_started', {
    user_id: userId,
    operator_id: operatorId,
    work_order_id: workOrderId,
    service_name: serviceName
  });
}

/**
 * Notify about work order completed
 */
export async function notifyWorkOrderCompleted({ userId, operatorId, workOrderId, serviceName }) {
  return triggerNotificationEvent('work_order_completed', {
    user_id: userId,
    operator_id: operatorId,
    work_order_id: workOrderId,
    service_name: serviceName
  });
}

// ============================================
// INSPECTION NOTIFICATIONS
// ============================================

/**
 * Notify about upcoming inspection due
 */
export async function notifyInspectionDue({ userId, propertyId, inspectionType, dueDate }) {
  return triggerNotificationEvent('inspection_due', {
    user_id: userId,
    property_id: propertyId,
    inspection_type: inspectionType,
    due_date: dueDate
  });
}

/**
 * Notify about inspection scheduled
 */
export async function notifyInspectionScheduled({ userId, propertyId, inspectionType, scheduledDate }) {
  return triggerNotificationEvent('inspection_scheduled', {
    user_id: userId,
    property_id: propertyId,
    inspection_type: inspectionType,
    scheduled_date: scheduledDate
  });
}

// ============================================
// SYSTEM NOTIFICATIONS
// ============================================

/**
 * Notify about account creation (welcome message)
 */
export async function notifyAccountCreated({ userId, userName }) {
  return triggerNotificationEvent('account_created', {
    user_id: userId,
    user_name: userName
  });
}

/**
 * Send a custom notification
 */
export async function sendCustomNotification({ userId, title, message, type = 'system', actionUrl, priority = 'normal', data = {} }) {
  return triggerNotificationEvent('custom', {
    user_id: userId,
    title: title,
    message: message,
    type: type,
    action_url: actionUrl,
    priority: priority,
    ...data
  });
}

export default {
  triggerNotificationEvent,
  notifyTaskCompleted,
  notifyTaskScheduled,
  notifyInspectionCompleted,
  notifyHealthScoreChange,
  notifyTaskDueSoon,
  notifyTaskOverdue,
  notifyServicePackageSubmitted,
  notifyServicePackageQuoted,
  notifyServicePackageApproved,
  notifyPaymentSucceeded,
  notifyPaymentFailed,
  notifyInvoiceCreated,
  notifyInvoiceOverdue,
  notifyNewLead,
  notifyQuoteSent,
  notifyQuoteApproved,
  notifyJobAssigned,
  notifyWorkOrderStarted,
  notifyWorkOrderCompleted,
  notifyInspectionDue,
  notifyInspectionScheduled,
  notifyAccountCreated,
  sendCustomNotification
};
