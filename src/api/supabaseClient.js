import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ============================================
// INPUT VALIDATION & SANITIZATION
// ============================================

/**
 * Validate UUID format
 * @param {string} id - String to validate as UUID
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(id) {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Sanitize string input - removes potential XSS vectors
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (str === null || str === undefined) return str;
  if (typeof str !== 'string') return str;

  // Trim whitespace
  let sanitized = str.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Escape HTML entities for XSS prevention
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

/**
 * Sanitize object - recursively sanitizes all string values
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - { skipFields: ['field1', 'field2'] }
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item, options));

  const skipFields = options.skipFields || [];
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (skipFields.includes(key)) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @throws {Error} If any required field is missing
 */
export function validateRequired(obj, requiredFields) {
  if (!obj) throw new Error('Data object is required');

  const missing = requiredFields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validate and sanitize data before database operations
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema { required: [], uuid: [] }
 * @returns {Object} Validated and sanitized data
 */
export function validateAndSanitize(data, schema = {}) {
  // Validate required fields
  if (schema.required && schema.required.length > 0) {
    validateRequired(data, schema.required);
  }

  // Validate UUID fields
  if (schema.uuid && schema.uuid.length > 0) {
    for (const field of schema.uuid) {
      if (data[field] && !isValidUUID(data[field])) {
        throw new Error(`Invalid UUID format for field: ${field}`);
      }
    }
  }

  // Sanitize all string values (skip certain fields like passwords, tokens)
  const skipSanitize = ['password', 'token', 'api_key', 'secret'];
  return sanitizeObject(data, { skipFields: skipSanitize });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============================================
// HELPER: Apply filter condition to query
// Supports MongoDB-style operators: $ne, $gt, $gte, $lt, $lte, $in, $nin, $like, $ilike
// ============================================
function applyFilterCondition(query, key, value) {
  // If value is an object with operator keys, apply the appropriate Supabase method
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const operators = Object.keys(value);

    for (const op of operators) {
      const opValue = value[op];

      switch (op) {
        case '$ne':
          query = query.neq(key, opValue);
          break;
        case '$gt':
          query = query.gt(key, opValue);
          break;
        case '$gte':
          query = query.gte(key, opValue);
          break;
        case '$lt':
          query = query.lt(key, opValue);
          break;
        case '$lte':
          query = query.lte(key, opValue);
          break;
        case '$in':
          query = query.in(key, opValue);
          break;
        case '$nin':
          // Supabase doesn't have a direct 'not in' - use filter with negation
          query = query.not(key, 'in', `(${opValue.join(',')})`);
          break;
        case '$like':
          query = query.like(key, opValue);
          break;
        case '$ilike':
          query = query.ilike(key, opValue);
          break;
        case '$is':
          query = query.is(key, opValue);
          break;
        case '$contains':
          // For JSONB/array contains
          query = query.contains(key, opValue);
          break;
        case '$containedBy':
          query = query.containedBy(key, opValue);
          break;
        default:
          // Unknown operator - treat as equality with nested object
          query = query.eq(key, value);
          break;
      }
    }
  } else {
    // Simple equality check
    query = query.eq(key, value);
  }

  return query;
}

// ============================================
// ENTITY WRAPPERS
// Provides a consistent API for database operations
// ============================================

/**
 * Property entity - wrapper around Supabase 'properties' table
 * API: list(), filter(), create(), update(), delete()
 */
export const Property = {
  /**
   * List all properties for a user, optionally sorted
   * @param {string} orderBy - Column to sort by. Prefix with '-' for descending (e.g., '-created_at')
   * @param {string} userId - Optional user ID to filter by (required for security with Clerk auth)
   */
  async list(orderBy = '-created_at', userId = null) {
    const ascending = !orderBy.startsWith('-');
    // Map column name aliases
    const column = orderBy
      .replace('-', '')
      .replace('created_date', 'created_at')
      .replace('updated_date', 'updated_at');

    let query = supabase
      .from('properties')
      .select('*');

    // Filter by user_id if provided (important for security with Clerk auth)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.order(column, { ascending });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Filter properties by conditions
   * Supports MongoDB-style operators: $ne, $gt, $gte, $lt, $lte, $in, $nin, $like, $ilike, $is, $contains
   * @param {Object} conditions - Key-value pairs to filter by (e.g., { user_id: '123', status: { $ne: 'draft' } })
   * @param {Object} options - Optional { orderBy: '-created_at', limit: 10 }
   */
  async filter(conditions, options = {}) {
    let query = supabase.from('properties').select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      query = applyFilterCondition(query, key, value);
    });

    // Apply optional ordering
    if (options.orderBy) {
      const ascending = !options.orderBy.startsWith('-');
      const column = options.orderBy
        .replace('-', '')
        .replace('created_date', 'created_at')
        .replace('updated_date', 'updated_at');
      query = query.order(column, { ascending });
    }

    // Apply optional limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get a single property by ID
   * @param {string} id - Property UUID
   */
  async get(id) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new property
   * @param {Object} data - Property data
   */
  async create(data) {
    console.log('Property.create called with data:', JSON.stringify(data, null, 2));

    const { data: result, error } = await supabase
      .from('properties')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Supabase Property.create error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      throw error;
    }
    return result;
  },

  /**
   * Update an existing property
   * @param {string} id - Property UUID
   * @param {Object} data - Fields to update
   */
  async update(id, data) {
    const { data: result, error } = await supabase
      .from('properties')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  /**
   * Delete a property
   * @param {string} id - Property UUID
   */
  async delete(id) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

/**
 * SystemBaseline entity - wrapper around Supabase 'system_baselines' table
 */
export const SystemBaseline = {
  async list(orderBy = '-created_at') {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy
      .replace('-', '')
      .replace('created_date', 'created_at')
      .replace('updated_date', 'updated_at');

    const { data, error } = await supabase
      .from('system_baselines')
      .select('*')
      .order(column, { ascending });

    if (error) throw error;
    return data;
  },

  /**
   * Filter system baselines by conditions
   * Supports MongoDB-style operators: $ne, $gt, $gte, $lt, $lte, $in, $nin, $like, $ilike, $is, $contains
   */
  async filter(conditions, options = {}) {
    let query = supabase.from('system_baselines').select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      query = applyFilterCondition(query, key, value);
    });

    // Apply optional ordering
    if (options.orderBy) {
      const ascending = !options.orderBy.startsWith('-');
      const column = options.orderBy
        .replace('-', '')
        .replace('created_date', 'created_at')
        .replace('updated_date', 'updated_at');
      query = query.order(column, { ascending });
    }

    // Apply optional limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('system_baselines')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('system_baselines')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('system_baselines')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { error } = await supabase
      .from('system_baselines')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// ============================================
// HELPER: Create entity wrapper
// ============================================
function createEntityWrapper(tableName) {
  return {
    async list(orderBy = '-created_at') {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy
        .replace('-', '')
        .replace('created_date', 'created_at')
        .replace('updated_date', 'updated_at');

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(column, { ascending });

      if (error) throw error;
      return data;
    },

    /**
     * Filter entities by conditions
     * Supports MongoDB-style operators:
     * - $ne: not equal
     * - $gt: greater than
     * - $gte: greater than or equal
     * - $lt: less than
     * - $lte: less than or equal
     * - $in: value in array
     * - $nin: value not in array
     * - $like: pattern match (case-sensitive)
     * - $ilike: pattern match (case-insensitive)
     * - $is: IS comparison (for null, true, false)
     * - $contains: JSONB/array contains
     *
     * @example
     * // Simple equality
     * filter({ status: 'active' })
     *
     * // Not equal
     * filter({ status: { $ne: 'Completed' } })
     *
     * // Greater than
     * filter({ due_date: { $gte: '2024-01-01' } })
     *
     * // Multiple operators on same field
     * filter({ priority: { $gte: 1, $lte: 5 } })
     *
     * // In array
     * filter({ status: { $in: ['pending', 'in_progress'] } })
     */
    async filter(conditions, options = {}) {
      let query = supabase.from(tableName).select('*');

      Object.entries(conditions).forEach(([key, value]) => {
        query = applyFilterCondition(query, key, value);
      });

      // Apply optional ordering
      if (options.orderBy) {
        const ascending = !options.orderBy.startsWith('-');
        const column = options.orderBy
          .replace('-', '')
          .replace('created_date', 'created_at')
          .replace('updated_date', 'updated_at');
        query = query.order(column, { ascending });
      }

      // Apply optional limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async get(id) {
      // Validate UUID format
      if (id && !isValidUUID(id) && !id.startsWith('demo-')) {
        throw new Error(`Invalid UUID format for id: ${id}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(inputData) {
      // Sanitize input data
      const data = sanitizeObject(inputData, { skipFields: ['password', 'token', 'api_key'] });

      // Validate UUID fields if present
      if (data.id && !isValidUUID(data.id) && !data.id.startsWith('demo-')) {
        throw new Error('Invalid UUID format for id field');
      }
      if (data.property_id && !isValidUUID(data.property_id) && !data.property_id.startsWith('demo-')) {
        throw new Error('Invalid UUID format for property_id field');
      }
      if (data.user_id && !isValidUUID(data.user_id)) {
        throw new Error('Invalid UUID format for user_id field');
      }

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    async update(id, inputData) {
      // Validate UUID format
      if (!isValidUUID(id) && !id.startsWith('demo-')) {
        throw new Error(`Invalid UUID format for id: ${id}`);
      }

      // Sanitize input data
      const data = sanitizeObject(inputData, { skipFields: ['password', 'token', 'api_key'] });

      const { data: result, error } = await supabase
        .from(tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    async delete(id) {
      // Validate UUID format
      if (!isValidUUID(id) && !id.startsWith('demo-')) {
        throw new Error(`Invalid UUID format for id: ${id}`);
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }
  };
}

// ============================================
// ALL ENTITY WRAPPERS
// ============================================
export const MaintenanceTask = createEntityWrapper('maintenance_tasks');
export const Inspection = createEntityWrapper('inspections');
export const Upgrade = createEntityWrapper('upgrades');
export const CartItem = createEntityWrapper('cart_items');
export const PreservationRecommendation = createEntityWrapper('preservation_recommendations');
export const PortfolioEquity = createEntityWrapper('portfolio_equity');
export const Operator = createEntityWrapper('operators');
export const PropertyAccess = createEntityWrapper('property_access');
export const UpgradeTemplate = createEntityWrapper('upgrade_templates');
export const UserSecuritySettings = createEntityWrapper('user_security_settings');
export const StrategicRecommendation = createEntityWrapper('strategic_recommendations');
export const ServicePackage = createEntityWrapper('service_packages');
export const OperatorStripeAccount = createEntityWrapper('operator_stripe_accounts');
export const MaintenanceTemplate = createEntityWrapper('maintenance_templates');
export const WealthProjection = createEntityWrapper('wealth_projections');
export const Waitlist = createEntityWrapper('waitlist');
export const PreservationImpact = createEntityWrapper('preservation_impacts');
export const PortfolioBenchmark = createEntityWrapper('portfolio_benchmarks');
export const CapitalAllocation = createEntityWrapper('capital_allocations');
export const VideoTutorial = createEntityWrapper('video_tutorials');
export const ServiceRequest = createEntityWrapper('service_requests');
export const ResourceGuide = createEntityWrapper('resource_guides');

// NEW: Users table (synced from Clerk)
export const User = createEntityWrapper('users');

// NEW: Contractor tables
export const Contractor = createEntityWrapper('contractors');
export const ContractorJob = createEntityWrapper('contractor_jobs');

// NEW: Notifications tables
export const Notification = createEntityWrapper('notifications');
export const NotificationPreference = createEntityWrapper('notification_preferences');
export const PushSubscription = createEntityWrapper('push_subscriptions');

// NEW: Operator tables (enhanced)
export const OperatorProfile = createEntityWrapper('operators');
export const OperatorServiceArea = createEntityWrapper('operator_service_areas');
export const OperatorLicense = createEntityWrapper('operator_licenses');
export const OperatorInsurance = createEntityWrapper('operator_insurance');
export const OperatorTrainingProgress = createEntityWrapper('operator_training_progress');

// NEW: Contractor relationship tables
export const ContractorInvitation = createEntityWrapper('contractor_invitations');
export const OperatorContractor = createEntityWrapper('operator_contractors');
export const ContractorAvailability = createEntityWrapper('contractor_availability');
export const ContractorReview = createEntityWrapper('contractor_reviews');

// NEW: Proposal tables
export const Proposal = createEntityWrapper('proposals');
export const ProposalRevision = createEntityWrapper('proposal_revisions');
export const ProposalTemplate = createEntityWrapper('proposal_templates');
export const ProposalComment = createEntityWrapper('proposal_comments');

// NEW: Work order tables
export const WorkOrder = createEntityWrapper('work_orders');
export const WorkOrderStatusHistory = createEntityWrapper('work_order_status_history');
export const WorkOrderMessage = createEntityWrapper('work_order_messages');

// NEW: Job documentation tables
export const JobPhoto = createEntityWrapper('job_photos');
export const ServiceRecord = createEntityWrapper('service_records');
export const ServiceRecordTag = createEntityWrapper('service_record_tags');

// NEW: Service package tables (enhanced)
export const ServicePackageCategory = createEntityWrapper('service_package_categories');
export const ServicePackageSeasonalPricing = createEntityWrapper('service_package_seasonal_pricing');
export const DefaultServicePackage = createEntityWrapper('default_service_packages');

// NEW: Operator Lead Management
export const OperatorLead = createEntityWrapper('operator_leads');
export const OperatorQuote = createEntityWrapper('operator_quotes');
export const OperatorLeadActivity = createEntityWrapper('operator_lead_activities');

// NEW: Operator Client Management (existing clients and migration)
export const OperatorClient = createEntityWrapper('operator_clients');
export const ImportedServiceHistory = createEntityWrapper('imported_service_history');

// ============================================
// NEW: Reference Data Tables (from data architecture restructure)
// ============================================

/**
 * PublicPropertyData - External API data (Zillow, county records, etc.)
 * Keyed by standardized_address_id
 */
export const PublicPropertyData = {
  ...createEntityWrapper('public_property_data'),

  /**
   * Get public property data by standardized address ID
   * @param {string} standardizedAddressId - The standardized address key
   */
  async getByAddressId(standardizedAddressId) {
    const { data, error } = await supabase
      .from('public_property_data')
      .select('*')
      .eq('standardized_address_id', standardizedAddressId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  /**
   * Upsert public property data (insert or update based on standardized_address_id)
   * @param {Object} data - Property data with standardized_address_id
   */
  async upsert(data) {
    const { data: result, error } = await supabase
      .from('public_property_data')
      .upsert(data, { onConflict: 'standardized_address_id' })
      .select()
      .single();

    if (error) throw error;
    return result;
  }
};

/**
 * RegionalCosts - Regional cost data for estimates
 */
export const RegionalCosts = {
  ...createEntityWrapper('regional_costs'),

  /**
   * Get regional costs by ZIP code
   * @param {string} zipCode - ZIP code to look up
   */
  async getByZip(zipCode) {
    const { data, error } = await supabase
      .from('regional_costs')
      .select('*')
      .eq('zip_code', zipCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get regional costs by state (returns first match or state-level data)
   * @param {string} state - State abbreviation
   */
  async getByState(state) {
    const { data, error } = await supabase
      .from('regional_costs')
      .select('*')
      .eq('state', state)
      .is('zip_code', null)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get regional costs with fallback (ZIP -> City -> State)
   * @param {string} zipCode
   * @param {string} city
   * @param {string} state
   */
  async getWithFallback(zipCode, city, state) {
    // Try ZIP first
    if (zipCode) {
      const zipData = await this.getByZip(zipCode);
      if (zipData) return zipData;
    }

    // Try city + state
    if (city && state) {
      const { data: cityData } = await supabase
        .from('regional_costs')
        .select('*')
        .eq('city', city)
        .eq('state', state)
        .limit(1)
        .single();
      if (cityData) return cityData;
    }

    // Fall back to state level
    if (state) {
      return await this.getByState(state);
    }

    return null;
  }
};

/**
 * SystemLifespans - Reference data for system lifespans
 */
export const SystemLifespans = {
  ...createEntityWrapper('system_lifespans'),

  /**
   * Get lifespan data by system type
   * @param {string} systemType - System type (e.g., 'HVAC', 'Water Heater')
   */
  async getByType(systemType) {
    const { data, error } = await supabase
      .from('system_lifespans')
      .select('*')
      .eq('system_type', systemType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get all lifespans for a category
   * @param {string} category - System category (e.g., 'HVAC', 'Plumbing')
   */
  async getByCategory(category) {
    const { data, error } = await supabase
      .from('system_lifespans')
      .select('*')
      .eq('system_category', category);

    if (error) throw error;
    return data;
  },

  /**
   * Get all system lifespans as a lookup map
   * @returns {Object} Map of system_type -> lifespan data
   */
  async getAllAsMap() {
    const { data, error } = await supabase
      .from('system_lifespans')
      .select('*');

    if (error) throw error;
    return data.reduce((map, item) => {
      map[item.system_type] = item;
      return map;
    }, {});
  }
};

/**
 * ContractorPricing - Regional contractor pricing data
 */
export const ContractorPricing = {
  ...createEntityWrapper('contractor_pricing'),

  /**
   * Get pricing for a service type in a ZIP code
   * @param {string} zipCode
   * @param {string} serviceType
   */
  async getByZipAndService(zipCode, serviceType) {
    const { data, error } = await supabase
      .from('contractor_pricing')
      .select('*')
      .eq('zip_code', zipCode)
      .eq('service_type', serviceType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get all pricing for a ZIP code
   * @param {string} zipCode
   */
  async getByZip(zipCode) {
    const { data, error } = await supabase
      .from('contractor_pricing')
      .select('*')
      .eq('zip_code', zipCode);

    if (error) throw error;
    return data;
  },

  /**
   * Get pricing with fallback to state level
   * @param {string} zipCode
   * @param {string} state
   * @param {string} serviceType
   */
  async getWithFallback(zipCode, state, serviceType) {
    // Try ZIP first
    if (zipCode) {
      const zipData = await this.getByZipAndService(zipCode, serviceType);
      if (zipData) return zipData;
    }

    // Fall back to state level
    if (state) {
      const { data: stateData } = await supabase
        .from('contractor_pricing')
        .select('*')
        .eq('state', state)
        .eq('service_type', serviceType)
        .is('zip_code', null)
        .limit(1)
        .single();
      if (stateData) return stateData;
    }

    return null;
  }
};

// ============================================
// PROPERTY HELPER FUNCTIONS
// Fetch property with joined reference data
// ============================================

/**
 * Get a property with all associated reference data
 * @param {string} propertyId - Property UUID
 * @returns {Object} Property with publicData and regionalCosts attached
 */
export async function getPropertyWithReferenceData(propertyId) {
  // Get the property
  const property = await Property.get(propertyId);
  if (!property) return null;

  // Get public property data if available
  let publicData = null;
  if (property.standardized_address_id) {
    publicData = await PublicPropertyData.getByAddressId(property.standardized_address_id);
  }

  // Get regional costs
  const regionalCosts = await RegionalCosts.getWithFallback(
    property.zip_code,
    property.city,
    property.state
  );

  return {
    ...property,
    publicData,
    regionalCosts
  };
}

/**
 * Get system baseline with lifespan reference data
 * @param {string} systemId - System baseline UUID
 * @returns {Object} System with lifespanData attached
 */
export async function getSystemWithLifespanData(systemId) {
  const system = await SystemBaseline.get(systemId);
  if (!system) return null;

  const lifespanData = await SystemLifespans.getByType(system.system_type);

  return {
    ...system,
    lifespanData
  };
}

/**
 * Get contractor pricing for a property and service
 * @param {string} propertyId - Property UUID
 * @param {string} serviceType - Service type to look up
 * @returns {Object} Contractor pricing data
 */
export async function getContractorPricingForProperty(propertyId, serviceType) {
  const property = await Property.get(propertyId);
  if (!property) return null;

  return await ContractorPricing.getWithFallback(
    property.zip_code,
    property.state,
    serviceType
  );
}

// ============================================
// EDGE FUNCTION HELPERS
// Call Supabase Edge Functions for external data
// ============================================

/**
 * Fetch property data from external APIs (Zillow, etc.)
 * Calls the fetch-property-data Edge Function
 *
 * @param {string|Object} addressOrComponents - Full address string or object with components
 * @param {Object} options - Options like forceRefresh
 * @returns {Object} Property data from external API
 */
export async function fetchExternalPropertyData(addressOrComponents, options = {}) {
  let body;

  if (typeof addressOrComponents === 'string') {
    body = { address: addressOrComponents };
  } else {
    body = {
      streetAddress: addressOrComponents.streetAddress || addressOrComponents.street_address || addressOrComponents.address,
      city: addressOrComponents.city,
      state: addressOrComponents.state,
      zipCode: addressOrComponents.zipCode || addressOrComponents.zip_code
    };
  }

  if (options.forceRefresh) {
    body.forceRefresh = true;
  }

  const { data, error } = await supabase.functions.invoke('fetch-property-data', {
    body
  });

  if (error) {
    console.error('Error fetching external property data:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch and link external property data for an existing property
 * @param {string} propertyId - Property UUID
 * @param {Object} options - Options like forceRefresh
 * @returns {Object} Updated property with external data
 */
export async function enrichPropertyWithExternalData(propertyId, options = {}) {
  const property = await Property.get(propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  // Build address from property
  const address = property.formatted_address ||
    `${property.street_address || property.address}, ${property.city}, ${property.state} ${property.zip_code}`;

  // Fetch external data
  const result = await fetchExternalPropertyData(address, options);

  if (result.success && result.data) {
    // The edge function already stores the data and updates standardized_address_id
    // Return the enriched property
    return {
      ...property,
      publicData: result.data,
      cached: result.cached
    };
  }

  return { ...property, publicData: null };
}

/**
 * Batch fetch external data for multiple properties
 * @param {Array<string>} propertyIds - Array of property UUIDs
 * @param {Object} options - Options like forceRefresh
 * @returns {Array<Object>} Array of results
 */
export async function batchEnrichProperties(propertyIds, options = {}) {
  const results = await Promise.allSettled(
    propertyIds.map(id => enrichPropertyWithExternalData(id, options))
  );

  return results.map((result, index) => ({
    propertyId: propertyIds[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
}

// ============================================
// ADDRESS STANDARDIZATION
// Mirrors the PostgreSQL function for client-side use
// ============================================

/**
 * Standardizes an address to create a unique key for deduplication
 * Converts "1112 Orizaba Ave, Long Beach, CA 90804" to "1112orizabaavelbca90804"
 *
 * @param {string} streetAddress - Street address (e.g., "1112 Orizaba Ave")
 * @param {string} city - City name (e.g., "Long Beach")
 * @param {string} state - State abbreviation (e.g., "CA")
 * @param {string} zipCode - ZIP code (e.g., "90804")
 * @returns {string} Standardized address key
 */
export function standardizeAddress(streetAddress, city, state, zipCode) {
  // Combine address components
  let standardized = [
    streetAddress || '',
    city || '',
    state || '',
    zipCode || ''
  ].join('');

  // Convert to lowercase
  standardized = standardized.toLowerCase();

  // Remove all non-alphanumeric characters
  standardized = standardized.replace(/[^a-z0-9]/g, '');

  // Common city abbreviations
  const cityAbbreviations = {
    'longbeach': 'lb',
    'losangeles': 'la',
    'sanfrancisco': 'sf',
    'sandiego': 'sd',
    'newyork': 'ny',
    'lasvegas': 'lv',
    'sanjose': 'sj',
    'santaana': 'sa',
    'santamonica': 'sm'
  };

  // Common street abbreviations
  const streetAbbreviations = {
    'avenue': 'ave',
    'street': 'st',
    'boulevard': 'blvd',
    'drive': 'dr',
    'road': 'rd',
    'lane': 'ln',
    'court': 'ct',
    'place': 'pl',
    'circle': 'cir',
    'highway': 'hwy',
    'parkway': 'pkwy',
    'terrace': 'ter',
    'north': 'n',
    'south': 's',
    'east': 'e',
    'west': 'w'
  };

  // Apply city abbreviations
  Object.entries(cityAbbreviations).forEach(([full, abbrev]) => {
    standardized = standardized.replace(new RegExp(full, 'g'), abbrev);
  });

  // Apply street abbreviations
  Object.entries(streetAbbreviations).forEach(([full, abbrev]) => {
    standardized = standardized.replace(new RegExp(full, 'g'), abbrev);
  });

  return standardized;
}

/**
 * Parses a full address string into components
 * @param {string} fullAddress - Full address string (e.g., "1112 Orizaba Ave, Long Beach, CA 90804")
 * @returns {Object} Parsed address components
 */
export function parseAddress(fullAddress) {
  if (!fullAddress) return { streetAddress: '', city: '', state: '', zipCode: '' };

  // Common pattern: "Street, City, State ZIP"
  const parts = fullAddress.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    const streetAddress = parts[0];
    const city = parts[1];
    // Last part typically has state and ZIP
    const stateZipMatch = parts[parts.length - 1].match(/([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?/i);

    return {
      streetAddress,
      city,
      state: stateZipMatch ? stateZipMatch[1].toUpperCase() : '',
      zipCode: stateZipMatch ? (stateZipMatch[2] || '') : ''
    };
  }

  // Fallback: try to extract ZIP at least
  const zipMatch = fullAddress.match(/\d{5}(?:-\d{4})?/);
  const stateMatch = fullAddress.match(/\b([A-Z]{2})\b/);

  return {
    streetAddress: fullAddress,
    city: '',
    state: stateMatch ? stateMatch[1] : '',
    zipCode: zipMatch ? zipMatch[0] : ''
  };
}

/**
 * Gets or creates a standardized_address_id for a property
 * @param {Object} addressData - Object with streetAddress, city, state, zipCode
 * @returns {string} Standardized address ID
 */
export function getStandardizedAddressId(addressData) {
  const { streetAddress, address, city, state, zipCode, zip_code } = addressData;
  return standardizeAddress(
    streetAddress || address || '',
    city || '',
    state || '',
    zipCode || zip_code || ''
  );
}

// ============================================
// USER SYNC HELPER
// Syncs Clerk user to Supabase users table
// ============================================

/**
 * Sync the current Clerk user to the Supabase users table
 * Creates the user if they don't exist, or updates if they do
 * @param {Object} clerkUser - The Clerk user object
 * @returns {Object} The synced user from the database
 */
export async function syncCurrentUser(clerkUser) {
  if (!clerkUser?.id) return null;

  const userData = {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress,
    full_name: clerkUser.fullName,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    updated_at: new Date().toISOString()
  };

  // Upsert user (insert or update on conflict)
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to sync user to database:', error);
    throw error;
  }

  return data;
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

export const auth = {
  /**
   * Get the current authenticated user
   */
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Update the current user's metadata
   * @param {Object} data - User metadata to update
   */
  async updateMe(data) {
    const { data: result, error } = await supabase.auth.updateUser({
      data: data
    });
    if (error) throw error;
    return result.user;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Redirect to login (for OAuth providers)
   */
  async redirectToLogin(redirectTo) {
    // For now, just return the path - implement OAuth as needed
    console.log('Redirect to login, return to:', redirectTo);
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// FILE STORAGE HELPERS
// ============================================

export const storage = {
  /**
   * Upload a file to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} bucket - Storage bucket name (default: 'uploads')
   * @param {string} path - Optional path within bucket
   */
  async uploadFile(file, bucket = 'uploads', path = '') {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      file_url: publicUrl,
      file_name: file.name,
      path: data.path
    };
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(path, bucket = 'uploads') {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  }
};

// ============================================
// INTEGRATIONS (AI, Email, etc.)
// These call Supabase Edge Functions
// ============================================

export const integrations = {
  /**
   * Invoke an AI/LLM model via Edge Function
   * @param {Object} options - Options including prompt, file_urls, response_json_schema
   */
  async InvokeLLM(options) {
    const { data, error } = await supabase.functions.invoke('invokeClaude', {
      body: options
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send an email via Edge Function
   * @param {Object} options - Email options (to, subject, body, etc.)
   */
  async SendEmail(options) {
    const { data, error } = await supabase.functions.invoke('sendNotificationEmail', {
      body: options
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send an SMS via Edge Function
   * @param {Object} options - SMS options (to, message, etc.)
   */
  async SendSMS(options) {
    const { data, error } = await supabase.functions.invoke('sendSMS', {
      body: options
    });

    if (error) throw error;
    return data;
  },

  /**
   * Upload a file - wrapper for storage.uploadFile
   * @param {Object} options - { file: File }
   */
  async UploadFile({ file }) {
    return storage.uploadFile(file);
  },

  /**
   * Extract data from an uploaded file using AI
   * @param {Object} options - { file_url: string }
   */
  async ExtractDataFromUploadedFile(options) {
    const { data, error } = await supabase.functions.invoke('extractFileData', {
      body: options
    });

    if (error) throw error;
    return data;
  }
};

// ============================================
// FUNCTIONS HELPER
// Wrapper for calling Supabase Edge Functions
// ============================================

export const functions = {
  /**
   * Invoke a Supabase Edge Function
   * @param {string} functionName - Name of the function to call
   * @param {Object} body - Request body
   */
  async invoke(functionName, body = {}) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body
    });

    if (error) throw error;
    return { data };
  }
};

// ============================================
// RESOURCE ACCESS HELPER
// Checks if user has access to paid resource content
// ============================================

/**
 * Subscription tiers that have access to paid resources
 * These match the tiers defined in the pricing/subscription system
 */
const PAID_RESOURCE_TIERS = [
  'homeowner_plus',
  'HOMEOWNER_PLUS',
  'pioneer',
  'PIONEER',
  'commander',
  'COMMANDER',
  'elite',
  'ELITE',
  'good',
  'better',
  'best'
];

/**
 * Check if a user has access to paid resource content
 *
 * @param {Object|null} user - User object with subscription_tier property
 * @returns {boolean} True if user can access paid resources
 */
export function hasResourceAccess(user) {
  if (!user) return false;

  const tier = user.subscription_tier || user.subscriptionTier;
  if (!tier) return false;

  return PAID_RESOURCE_TIERS.includes(tier);
}

/**
 * Get the user's subscription tier name for display
 *
 * @param {Object|null} user - User object with subscription_tier property
 * @returns {string} Display name of the subscription tier
 */
export function getUserTierName(user) {
  if (!user) return 'Free';

  const tier = (user.subscription_tier || user.subscriptionTier || '').toLowerCase();

  const tierNames = {
    'scout': 'Scout (Free)',
    'homeowner_plus': 'Homeowner+',
    'pioneer': 'Pioneer',
    'commander': 'Commander',
    'elite': 'Elite',
    'good': 'Good',
    'better': 'Better',
    'best': 'Best'
  };

  return tierNames[tier] || 'Free';
}

// ============================================
// COMPATIBILITY LAYER
// This provides backwards compatibility for code
// that still imports from the old base44Client
// ============================================

export const base44 = {
  // Entity wrappers - matches old base44.entities.XXX pattern
  entities: {
    Property,
    SystemBaseline,
    MaintenanceTask,
    Inspection,
    Upgrade,
    CartItem,
    PreservationRecommendation,
    PortfolioEquity,
    Operator,
    PropertyAccess,
    UpgradeTemplate,
    UserSecuritySettings,
    StrategicRecommendation,
    ServicePackage,
    OperatorStripeAccount,
    MaintenanceTemplate,
    WealthProjection,
    Waitlist,
    PreservationImpact,
    PortfolioBenchmark,
    CapitalAllocation,
    VideoTutorial,
    ServiceRequest,
    ResourceGuide,
    Contractor,
    ContractorJob,
    PublicPropertyData,
    RegionalCosts,
    SystemLifespans,
    ContractorPricing,
    // New entities from portal ecosystem
    Notification,
    NotificationPreference,
    PushSubscription,
    OperatorProfile,
    OperatorServiceArea,
    OperatorLicense,
    OperatorInsurance,
    OperatorTrainingProgress,
    ContractorInvitation,
    OperatorContractor,
    ContractorAvailability,
    ContractorReview,
    Proposal,
    ProposalRevision,
    ProposalTemplate,
    ProposalComment,
    WorkOrder,
    WorkOrderStatusHistory,
    WorkOrderMessage,
    JobPhoto,
    ServiceRecord,
    ServiceRecordTag,
    ServicePackageCategory,
    ServicePackageSeasonalPricing,
    DefaultServicePackage,
    // Operator Lead Management
    OperatorLead,
    OperatorQuote,
    OperatorLeadActivity,
    // Operator Client Management
    OperatorClient,
    ImportedServiceHistory
  },

  // Auth wrapper
  auth,

  // Functions wrapper
  functions,

  // Integrations wrapper - matches old base44.integrations.Core.XXX pattern
  integrations: {
    Core: integrations
  },

  // Storage wrapper
  storage
};
