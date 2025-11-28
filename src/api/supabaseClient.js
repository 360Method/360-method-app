import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============================================
// ENTITY WRAPPERS
// These match the Base44 API pattern for easier migration
// ============================================

/**
 * Property entity - wrapper around Supabase 'properties' table
 * Mirrors Base44's entity API: list(), filter(), create(), update(), delete()
 */
export const Property = {
  /**
   * List all properties, optionally sorted
   * @param {string} orderBy - Column to sort by. Prefix with '-' for descending (e.g., '-created_at')
   */
  async list(orderBy = '-created_at') {
    const ascending = !orderBy.startsWith('-');
    // Map Base44 column names to Supabase column names
    const column = orderBy
      .replace('-', '')
      .replace('created_date', 'created_at')
      .replace('updated_date', 'updated_at');

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order(column, { ascending });

    if (error) throw error;
    return data;
  },

  /**
   * Filter properties by conditions
   * @param {Object} conditions - Key-value pairs to filter by (e.g., { user_id: '123', is_draft: false })
   */
  async filter(conditions) {
    let query = supabase.from('properties').select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

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
    const { data: result, error } = await supabase
      .from('properties')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
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

  async filter(conditions) {
    let query = supabase.from('system_baselines').select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

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

    async filter(conditions) {
      let query = supabase.from(tableName).select('*');

      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    async update(id, data) {
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

// NEW: Contractor tables
export const Contractor = createEntityWrapper('contractors');
export const ContractorJob = createEntityWrapper('contractor_jobs');

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
