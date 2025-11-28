/**
 * Proposals API Module
 * Handles proposal creation, acceptance, and management
 */
import { supabase, Proposal, ProposalComment } from './supabaseClient';
import { sendNotification, NOTIFICATION_TYPES } from './notifications';
import { createFromProposal as createWorkOrderFromProposal } from './workOrders';

// ============================================
// PROPOSAL QUERIES
// ============================================

/**
 * Get proposals for a service request
 * @param {string} serviceRequestId - Service request UUID
 */
export async function getProposalsForRequest(serviceRequestId) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      operator:operators(id, company_name, rating, total_reviews, profile_photo_url)
    `)
    .eq('service_request_id', serviceRequestId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get proposals by operator
 * @param {string} operatorId - Operator UUID
 * @param {Object} options - Query options
 */
export async function getOperatorProposals(operatorId, options = {}) {
  const { status, limit = 50, offset = 0 } = options;

  let query = supabase
    .from('proposals')
    .select(`
      *,
      property:properties(id, street_address, city, state),
      service_request:service_requests(id, title, description, urgency)
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
 * Get proposals for a property owner
 * @param {string} ownerId - Owner user ID
 * @param {Object} options - Query options
 */
export async function getOwnerProposals(ownerId, options = {}) {
  const { status, limit = 50 } = options;

  let query = supabase
    .from('proposals')
    .select(`
      *,
      operator:operators(id, company_name, rating, total_reviews),
      property:properties(id, street_address, city),
      service_request:service_requests(id, title)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get a single proposal by ID
 * @param {string} proposalId - Proposal UUID
 */
export async function getProposal(proposalId) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      operator:operators(id, company_name, rating, total_reviews, profile_photo_url, business_phone, business_email),
      property:properties(*),
      service_request:service_requests(*),
      revisions:proposal_revisions(*),
      comments:proposal_comments(*)
    `)
    .eq('id', proposalId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// PROPOSAL MUTATIONS
// ============================================

/**
 * Create a new proposal
 * @param {Object} proposalData - Proposal data
 */
export async function createProposal(proposalData) {
  const {
    serviceRequestId,
    operatorId,
    propertyId,
    ownerId,
    title,
    description,
    packageType,
    lineItems,
    laborHours,
    laborRate,
    materialsCost,
    travelFee,
    estimatedDuration,
    estimatedDurationHours,
    availableDates,
    preferredDate,
    warrantyLaborDays,
    warrantyPartsDays,
    warrantyDetails,
    inclusions,
    exclusions,
    termsAndConditions,
    notes,
    validUntil
  } = proposalData;

  // Calculate totals (will also be done by DB trigger)
  const laborTotal = (laborHours || 0) * (laborRate || 0);
  const lineItemsTotal = (lineItems || []).reduce(
    (sum, item) => sum + (item.total || item.quantity * item.unit_price || 0),
    0
  );
  const subtotal = lineItemsTotal + laborTotal + (materialsCost || 0) + (travelFee || 0);

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      service_request_id: serviceRequestId,
      operator_id: operatorId,
      property_id: propertyId,
      owner_id: ownerId,
      title,
      description,
      package_type: packageType,
      line_items: lineItems || [],
      labor_hours: laborHours,
      labor_rate: laborRate,
      labor_total: laborTotal,
      materials_cost: materialsCost,
      travel_fee: travelFee,
      subtotal,
      total_amount: subtotal,
      estimated_duration: estimatedDuration,
      estimated_duration_hours: estimatedDurationHours,
      available_dates: availableDates,
      preferred_date: preferredDate,
      warranty_labor_days: warrantyLaborDays || 30,
      warranty_parts_days: warrantyPartsDays || 90,
      warranty_details: warrantyDetails,
      inclusions,
      exclusions,
      terms_and_conditions: termsAndConditions,
      internal_notes: notes,
      valid_until: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      sent_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Notify owner
  await sendNotification({
    userId: ownerId,
    type: NOTIFICATION_TYPES.PROPOSAL,
    title: 'New Proposal Received',
    message: `You have received a proposal for ${title}`,
    data: { proposal_id: data.id, service_request_id: serviceRequestId },
    sendEmail: true,
    emailSubject: 'New Proposal for Your Service Request'
  });

  return data;
}

/**
 * Create a proposal from a service package template
 * @param {string} serviceRequestId - Service request UUID
 * @param {string} packageId - Service package UUID
 * @param {Object} overrides - Override values
 */
export async function createFromPackage(serviceRequestId, packageId, overrides = {}) {
  // Get service request details
  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .select('*, property:properties(id, user_id)')
    .eq('id', serviceRequestId)
    .single();

  if (reqError) throw reqError;

  // Get package details
  const { data: pkg, error: pkgError } = await supabase
    .from('service_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (pkgError) throw pkgError;

  // Create proposal from package
  return createProposal({
    serviceRequestId,
    operatorId: pkg.operator_id,
    propertyId: request.property_id,
    ownerId: request.property?.user_id,
    title: overrides.title || pkg.name,
    description: overrides.description || pkg.description,
    packageType: pkg.package_tier,
    laborHours: overrides.laborHours || pkg.minimum_hours,
    laborRate: overrides.laborRate || pkg.hourly_rate,
    materialsCost: overrides.materialsCost || 0,
    estimatedDuration: pkg.estimated_duration,
    warrantyLaborDays: pkg.warranty_labor_days,
    warrantyPartsDays: pkg.warranty_parts_days,
    inclusions: pkg.includes,
    exclusions: pkg.excludes,
    ...overrides
  });
}

/**
 * Update a proposal
 * @param {string} proposalId - Proposal UUID
 * @param {Object} updates - Fields to update
 */
export async function updateProposal(proposalId, updates) {
  const { data, error } = await supabase
    .from('proposals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark proposal as viewed
 * @param {string} proposalId - Proposal UUID
 */
export async function markAsViewed(proposalId) {
  const { data: current } = await supabase
    .from('proposals')
    .select('viewed_count')
    .eq('id', proposalId)
    .single();

  const { data, error } = await supabase
    .from('proposals')
    .update({
      viewed_at: new Date().toISOString(),
      viewed_count: (current?.viewed_count || 0) + 1,
      status: 'viewed'
    })
    .eq('id', proposalId)
    .eq('status', 'pending') // Only update if still pending
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Accept a proposal
 * @param {string} proposalId - Proposal UUID
 */
export async function acceptProposal(proposalId) {
  // Get proposal
  const { data: proposal, error: propError } = await supabase
    .from('proposals')
    .select('*, operator:operators(user_id)')
    .eq('id', proposalId)
    .single();

  if (propError) throw propError;

  // Update proposal status
  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;

  // Decline other proposals for the same request
  await supabase
    .from('proposals')
    .update({
      status: 'declined',
      decline_reason: 'Another proposal was accepted',
      declined_at: new Date().toISOString()
    })
    .eq('service_request_id', proposal.service_request_id)
    .neq('id', proposalId)
    .in('status', ['pending', 'viewed']);

  // Update service request
  await supabase
    .from('service_requests')
    .update({ status: 'accepted' })
    .eq('id', proposal.service_request_id);

  // Create work order
  const workOrder = await createWorkOrderFromProposal(proposalId);

  // Notify operator
  if (proposal.operator?.user_id) {
    await sendNotification({
      userId: proposal.operator.user_id,
      type: NOTIFICATION_TYPES.PROPOSAL,
      title: 'Proposal Accepted!',
      message: `Your proposal for "${proposal.title}" has been accepted`,
      data: { proposal_id: proposalId, work_order_id: workOrder?.id },
      sendEmail: true,
      emailSubject: 'Good News - Your Proposal Was Accepted!'
    });
  }

  return { proposal: data, workOrder };
}

/**
 * Decline a proposal
 * @param {string} proposalId - Proposal UUID
 * @param {string} reason - Decline reason
 */
export async function declineProposal(proposalId, reason) {
  const { data: proposal, error: propError } = await supabase
    .from('proposals')
    .select('*, operator:operators(user_id)')
    .eq('id', proposalId)
    .single();

  if (propError) throw propError;

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'declined',
      declined_at: new Date().toISOString(),
      decline_reason: reason
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;

  // Notify operator
  if (proposal.operator?.user_id) {
    await sendNotification({
      userId: proposal.operator.user_id,
      type: NOTIFICATION_TYPES.PROPOSAL,
      title: 'Proposal Declined',
      message: `Your proposal for "${proposal.title}" was not accepted`,
      data: { proposal_id: proposalId, reason }
    });
  }

  return data;
}

/**
 * Withdraw a proposal (operator)
 * @param {string} proposalId - Proposal UUID
 * @param {string} reason - Withdrawal reason
 */
export async function withdrawProposal(proposalId, reason) {
  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
      withdrawn_reason: reason
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;

  // Notify owner
  await sendNotification({
    userId: data.owner_id,
    type: NOTIFICATION_TYPES.PROPOSAL,
    title: 'Proposal Withdrawn',
    message: `A proposal for your service request has been withdrawn`,
    data: { proposal_id: proposalId }
  });

  return data;
}

// ============================================
// PROPOSAL COMMENTS
// ============================================

/**
 * Get comments for a proposal
 * @param {string} proposalId - Proposal UUID
 */
export async function getComments(proposalId) {
  const { data, error } = await supabase
    .from('proposal_comments')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Add a comment to a proposal
 * @param {string} proposalId - Proposal UUID
 * @param {string} userId - User ID
 * @param {string} userType - 'owner' or 'operator'
 * @param {string} comment - Comment text
 */
export async function addComment(proposalId, userId, userType, comment, attachments = []) {
  const { data, error } = await supabase
    .from('proposal_comments')
    .insert({
      proposal_id: proposalId,
      user_id: userId,
      user_type: userType,
      comment,
      attachments
    })
    .select()
    .single();

  if (error) throw error;

  // Get proposal to notify other party
  const { data: proposal } = await supabase
    .from('proposals')
    .select('owner_id, operator:operators(user_id)')
    .eq('id', proposalId)
    .single();

  // Notify the other party
  const recipientId = userType === 'owner'
    ? proposal?.operator?.user_id
    : proposal?.owner_id;

  if (recipientId) {
    await sendNotification({
      userId: recipientId,
      type: NOTIFICATION_TYPES.PROPOSAL,
      title: 'New Comment on Proposal',
      message: comment.substring(0, 100) + (comment.length > 100 ? '...' : ''),
      data: { proposal_id: proposalId }
    });
  }

  return data;
}

/**
 * Subscribe to proposal comments
 * @param {string} proposalId - Proposal UUID
 * @param {Function} onComment - Callback
 */
export function subscribeToComments(proposalId, onComment) {
  const channel = supabase
    .channel(`proposal_comments:${proposalId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'proposal_comments',
        filter: `proposal_id=eq.${proposalId}`
      },
      (payload) => {
        onComment(payload.new);
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// PROPOSAL TEMPLATES
// ============================================

/**
 * Get proposal templates for an operator
 * @param {string} operatorId - Operator UUID
 */
export async function getTemplates(operatorId) {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('operator_id', operatorId)
    .eq('active', true)
    .order('usage_count', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a proposal template
 * @param {Object} templateData - Template data
 */
export async function createTemplate(templateData) {
  const { data, error } = await supabase
    .from('proposal_templates')
    .insert(templateData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Export status constants
export const PROPOSAL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  WITHDRAWN: 'withdrawn'
};

export const PACKAGE_TYPES = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  CUSTOM: 'custom'
};
