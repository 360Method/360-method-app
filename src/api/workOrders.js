/**
 * Work Orders API Module
 * Handles work order lifecycle, contractor assignment, and status tracking
 */
import { supabase, WorkOrder, ContractorJob, WorkOrderMessage } from './supabaseClient';
import { sendNotification, NOTIFICATION_TYPES, EVENT_TYPES } from './notifications';

// ============================================
// WORK ORDER QUERIES
// ============================================

/**
 * Get work orders for an operator
 * @param {string} operatorId - Operator UUID
 * @param {Object} options - Query options
 */
export async function getOperatorWorkOrders(operatorId, options = {}) {
  const { status, limit = 50, offset = 0 } = options;

  let query = supabase
    .from('work_orders')
    .select(`
      *,
      property:properties(id, street_address, city, state, zip_code),
      contractor:contractors(id, first_name, last_name, phone),
      proposal:proposals(id, total_amount)
    `)
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get work orders for a property
 * @param {string} propertyId - Property UUID
 */
export async function getPropertyWorkOrders(propertyId, options = {}) {
  const { limit = 20, includeCompleted = true } = options;

  let query = supabase
    .from('work_orders')
    .select(`
      *,
      operator:operators(id, company_name),
      contractor:contractors(id, first_name, last_name)
    `)
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!includeCompleted) {
    query = query.not('status', 'in', '("completed","cancelled","paid")');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get work order by ID with full details
 * @param {string} workOrderId - Work order UUID
 */
export async function getWorkOrder(workOrderId) {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      property:properties(*),
      operator:operators(id, company_name, business_phone, business_email),
      contractor:contractors(id, first_name, last_name, phone, email),
      proposal:proposals(*),
      service_request:service_requests(id, title, description, photos),
      contractor_job:contractor_jobs(*),
      status_history:work_order_status_history(*)
    `)
    .eq('id', workOrderId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get today's work orders for a contractor
 * @param {string} contractorId - Contractor UUID
 */
export async function getContractorTodayWorkOrders(contractorId) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      property:properties(id, street_address, city, state, zip_code, access_code, gate_code),
      operator:operators(id, company_name, business_phone),
      contractor_job:contractor_jobs!inner(*)
    `)
    .eq('contractor_id', contractorId)
    .eq('scheduled_date', today)
    .not('status', 'in', '("completed","cancelled","paid")')
    .order('scheduled_time_start', { ascending: true });

  if (error) throw error;
  return data;
}

// ============================================
// WORK ORDER MUTATIONS
// ============================================

/**
 * Create a work order from an accepted proposal
 * @param {string} proposalId - Proposal UUID
 */
export async function createFromProposal(proposalId) {
  // Get proposal details
  const { data: proposal, error: propError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (propError) throw propError;

  // Create work order
  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      proposal_id: proposal.id,
      service_request_id: proposal.service_request_id,
      operator_id: proposal.operator_id,
      property_id: proposal.property_id,
      owner_id: proposal.owner_id,
      title: proposal.title,
      description: proposal.description,
      estimated_amount: proposal.total_amount,
      scheduled_date: proposal.preferred_date,
      scheduled_time_start: proposal.preferred_time_start,
      estimated_duration_hours: proposal.estimated_duration_hours
    })
    .select()
    .single();

  if (error) throw error;

  // Notify operator
  await sendNotification({
    userId: proposal.operator_id, // Need to get operator user_id
    type: NOTIFICATION_TYPES.WORK_ORDER,
    title: 'New Work Order Created',
    message: `Work order #${data.order_number} is ready for scheduling`,
    data: { work_order_id: data.id },
    sendEmail: true
  });

  return data;
}

/**
 * Update work order status
 * @param {string} workOrderId - Work order UUID
 * @param {string} status - New status
 * @param {Object} options - Additional update data
 */
export async function updateStatus(workOrderId, status, options = {}) {
  const { notes, changedBy, changedByType } = options;

  const updateData = {
    status,
    updated_at: new Date().toISOString()
  };

  // Add status-specific timestamps
  switch (status) {
    case 'assigned':
      updateData.assigned_at = new Date().toISOString();
      break;
    case 'in_progress':
      updateData.started_at = new Date().toISOString();
      break;
    case 'completed':
      updateData.completed_at = new Date().toISOString();
      break;
    case 'cancelled':
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_reason = options.reason;
      updateData.cancelled_by = changedByType;
      break;
  }

  const { data, error } = await supabase
    .from('work_orders')
    .update(updateData)
    .eq('id', workOrderId)
    .select()
    .single();

  if (error) throw error;

  // Log status change
  await supabase
    .from('work_order_status_history')
    .insert({
      work_order_id: workOrderId,
      to_status: status,
      changed_by: changedBy,
      changed_by_type: changedByType,
      notes
    });

  return data;
}

/**
 * Assign a contractor to a work order
 * @param {string} workOrderId - Work order UUID
 * @param {string} contractorId - Contractor UUID
 * @param {Object} options - Assignment options
 */
export async function assignContractor(workOrderId, contractorId, options = {}) {
  const { hourlyRate, scheduledDate, scheduledTimeStart, scheduledTimeEnd } = options;

  // Update work order
  const updateData = {
    contractor_id: contractorId,
    status: 'assigned',
    assigned_at: new Date().toISOString()
  };

  if (scheduledDate) updateData.scheduled_date = scheduledDate;
  if (scheduledTimeStart) updateData.scheduled_time_start = scheduledTimeStart;
  if (scheduledTimeEnd) updateData.scheduled_time_end = scheduledTimeEnd;

  const { data: workOrder, error: woError } = await supabase
    .from('work_orders')
    .update(updateData)
    .eq('id', workOrderId)
    .select(`
      *,
      property:properties(street_address, city, state)
    `)
    .single();

  if (woError) throw woError;

  // Get contractor's rate if not provided
  let rate = hourlyRate;
  if (!rate) {
    const { data: contractor } = await supabase
      .from('contractors')
      .select('hourly_rate')
      .eq('id', contractorId)
      .single();
    rate = contractor?.hourly_rate;
  }

  // Create contractor job
  const { data: job, error: jobError } = await supabase
    .from('contractor_jobs')
    .insert({
      work_order_id: workOrderId,
      contractor_id: contractorId,
      hourly_rate: rate
    })
    .select()
    .single();

  if (jobError) throw jobError;

  // Get contractor user_id for notification
  const { data: contractor } = await supabase
    .from('contractors')
    .select('user_id')
    .eq('id', contractorId)
    .single();

  // Notify contractor
  if (contractor?.user_id) {
    await sendNotification({
      userId: contractor.user_id,
      type: NOTIFICATION_TYPES.JOB,
      title: 'New Job Assigned',
      message: `You have a new job at ${workOrder.property?.street_address || 'a property'}`,
      data: {
        work_order_id: workOrderId,
        contractor_job_id: job.id,
        scheduled_date: scheduledDate
      },
      sendEmail: true
    });
  }

  return { workOrder, job };
}

/**
 * Unassign a contractor from a work order
 * @param {string} workOrderId - Work order UUID
 * @param {string} reason - Reason for unassignment
 */
export async function unassignContractor(workOrderId, reason) {
  // Get current assignment
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('contractor_id')
    .eq('id', workOrderId)
    .single();

  if (workOrder?.contractor_id) {
    // Update contractor job status
    await supabase
      .from('contractor_jobs')
      .update({ status: 'cancelled' })
      .eq('work_order_id', workOrderId)
      .eq('contractor_id', workOrder.contractor_id);
  }

  // Update work order
  const { data, error } = await supabase
    .from('work_orders')
    .update({
      contractor_id: null,
      status: 'pending',
      assigned_at: null
    })
    .eq('id', workOrderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Schedule a work order
 * @param {string} workOrderId - Work order UUID
 * @param {Object} schedule - Schedule details
 */
export async function scheduleWorkOrder(workOrderId, schedule) {
  const { date, timeStart, timeEnd, notes } = schedule;

  const { data, error } = await supabase
    .from('work_orders')
    .update({
      scheduled_date: date,
      scheduled_time_start: timeStart,
      scheduled_time_end: timeEnd,
      scheduling_notes: notes,
      status: 'scheduled'
    })
    .eq('id', workOrderId)
    .select(`
      *,
      contractor:contractors(user_id)
    `)
    .single();

  if (error) throw error;

  // Notify owner
  await sendNotification({
    userId: data.owner_id,
    type: NOTIFICATION_TYPES.WORK_ORDER,
    title: 'Service Scheduled',
    message: `Your service has been scheduled for ${date}`,
    data: { work_order_id: workOrderId, scheduled_date: date },
    sendEmail: true,
    emailSubject: 'Your Service Has Been Scheduled'
  });

  // Notify contractor
  if (data.contractor?.user_id) {
    await sendNotification({
      userId: data.contractor.user_id,
      type: NOTIFICATION_TYPES.JOB,
      title: 'Job Scheduled',
      message: `Job scheduled for ${date}`,
      data: { work_order_id: workOrderId, scheduled_date: date }
    });
  }

  return data;
}

/**
 * Complete a work order
 * @param {string} workOrderId - Work order UUID
 * @param {Object} completionData - Completion details
 */
export async function completeWorkOrder(workOrderId, completionData) {
  const {
    completionNotes,
    workPerformed,
    issuesFound,
    recommendations,
    actualAmount,
    partsUsed
  } = completionData;

  const { data, error } = await supabase
    .from('work_orders')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_notes: completionNotes,
      work_performed: workPerformed,
      issues_found: issuesFound,
      recommendations,
      actual_amount: actualAmount,
      parts_used: partsUsed
    })
    .eq('id', workOrderId)
    .select()
    .single();

  if (error) throw error;

  // Notify owner
  await sendNotification({
    userId: data.owner_id,
    type: NOTIFICATION_TYPES.WORK_ORDER,
    title: 'Service Completed',
    message: 'Your service has been completed',
    data: { work_order_id: workOrderId },
    sendEmail: true,
    emailSubject: 'Your Service Has Been Completed'
  });

  return data;
}

// ============================================
// WORK ORDER MESSAGES
// ============================================

/**
 * Get messages for a work order
 * @param {string} workOrderId - Work order UUID
 */
export async function getMessages(workOrderId) {
  const { data, error } = await supabase
    .from('work_order_messages')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Send a message on a work order
 * @param {string} workOrderId - Work order UUID
 * @param {string} userId - Sender user ID
 * @param {string} userType - 'owner', 'operator', 'contractor'
 * @param {string} message - Message text
 * @param {Array} attachments - Optional attachments
 */
export async function sendMessage(workOrderId, userId, userType, message, attachments = []) {
  const { data, error } = await supabase
    .from('work_order_messages')
    .insert({
      work_order_id: workOrderId,
      user_id: userId,
      user_type: userType,
      message,
      attachments
    })
    .select()
    .single();

  if (error) throw error;

  // Get work order to notify other parties
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select(`
      owner_id,
      operator:operators(user_id),
      contractor:contractors(user_id)
    `)
    .eq('id', workOrderId)
    .single();

  // Notify recipients (excluding sender)
  const recipients = [];
  if (workOrder?.owner_id && workOrder.owner_id !== userId) {
    recipients.push(workOrder.owner_id);
  }
  if (workOrder?.operator?.user_id && workOrder.operator.user_id !== userId) {
    recipients.push(workOrder.operator.user_id);
  }
  if (workOrder?.contractor?.user_id && workOrder.contractor.user_id !== userId) {
    recipients.push(workOrder.contractor.user_id);
  }

  // Send notifications
  for (const recipientId of recipients) {
    await sendNotification({
      userId: recipientId,
      type: NOTIFICATION_TYPES.WORK_ORDER,
      title: 'New Message',
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      data: { work_order_id: workOrderId }
    });
  }

  return data;
}

/**
 * Subscribe to work order messages
 * @param {string} workOrderId - Work order UUID
 * @param {Function} onMessage - Callback when new message arrives
 */
export function subscribeToMessages(workOrderId, onMessage) {
  const channel = supabase
    .channel(`work_order_messages:${workOrderId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'work_order_messages',
        filter: `work_order_id=eq.${workOrderId}`
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// WORK ORDER STATS
// ============================================

/**
 * Get work order statistics for an operator
 * @param {string} operatorId - Operator UUID
 */
export async function getOperatorStats(operatorId) {
  const { data, error } = await supabase
    .from('work_orders')
    .select('status, actual_amount, estimated_amount, created_at')
    .eq('operator_id', operatorId);

  if (error) throw error;

  const stats = {
    total: data.length,
    pending: data.filter(wo => ['pending', 'assigned', 'scheduled'].includes(wo.status)).length,
    inProgress: data.filter(wo => wo.status === 'in_progress').length,
    completed: data.filter(wo => wo.status === 'completed').length,
    paid: data.filter(wo => wo.status === 'paid').length,
    cancelled: data.filter(wo => wo.status === 'cancelled').length,
    totalRevenue: data
      .filter(wo => ['completed', 'paid'].includes(wo.status))
      .reduce((sum, wo) => sum + (wo.actual_amount || wo.estimated_amount || 0), 0)
  };

  return stats;
}

// Export status constants
export const WORK_ORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  SCHEDULED: 'scheduled',
  EN_ROUTE: 'en_route',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  INVOICED: 'invoiced',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

export const WORK_ORDER_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  EMERGENCY: 'emergency'
};
