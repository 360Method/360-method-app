/**
 * Current service areas for 360° Operators
 * Update this list as operators expand to new markets
 */
export const SERVICE_AREAS = {
  clark_county_wa: {
    name: "Clark County, Washington",
    zip_codes: [
      "98601", "98604", "98606", "98607", "98629", 
      "98642", "98660", "98661", "98662", "98663", 
      "98664", "98665", "98671", "98674", "98675", 
      "98682", "98683", "98684", "98686"
    ],
    operator_name: "Handy Pioneers",
    operator_phone: "(360) 123-4567",
    operator_email: "service@handypioneers.com"
  }
  // Add new service areas as operators expand
};

/**
 * Extract zip code from address string
 * @param {string} address - Full address string
 * @returns {string|null} - Extracted 5-digit zip code
 */
export function extractZipFromAddress(address) {
  if (!address) return null;
  
  // Match 5-digit zip code (with optional 4-digit extension)
  const zipMatch = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  const zip = zipMatch ? zipMatch[1] : null;
  
  console.log('🔍 Extracting zip from address:', address, '→', zip);
  return zip;
}

/**
 * Get zip code from property (prioritize zip_code field, fallback to address extraction)
 * @param {object} property - Property object
 * @returns {string|null} - Zip code
 */
export function getPropertyZipCode(property) {
  if (!property) {
    console.log('❌ No property provided to getPropertyZipCode');
    return null;
  }
  
  // Try direct field first
  if (property.zip_code) {
    console.log('✅ Found zip_code field:', property.zip_code);
    return property.zip_code;
  }
  
  // Try extracting from address
  if (property.address) {
    const extracted = extractZipFromAddress(property.address);
    if (extracted) {
      console.log('✅ Extracted zip from address:', extracted);
      return extracted;
    }
  }
  
  console.log('❌ No zip code found for property:', property.address);
  return null;
}

/**
 * Check if a zip code has 360° Operator service available
 * @param {string} zipCode - Zip code to check
 * @returns {object} - { available: boolean, area: string|null, operator: string|null, phone: string|null, email: string|null }
 */
export function isServiceAvailable(zipCode) {
  if (!zipCode) {
    console.log('❌ No zip code provided to isServiceAvailable');
    return {
      available: false,
      area: null,
      operator: null,
      phone: null,
      email: null
    };
  }
  
  // Normalize zip code (remove spaces, dashes, take first 5 digits)
  const normalizedZip = String(zipCode).trim().replace(/[\s-]/g, '').slice(0, 5);
  console.log('🔍 Checking service availability for zip:', normalizedZip);
  
  for (const area of Object.values(SERVICE_AREAS)) {
    const isMatch = area.zip_codes.includes(normalizedZip);
    console.log(`  ${area.name}:`, isMatch ? '✅ MATCH' : '❌ no match');
    
    if (isMatch) {
      console.log('✅✅✅ SERVICE AVAILABLE:', area.operator_name, 'in', area.name);
      return {
        available: true,
        area: area.name,
        operator: area.operator_name,
        phone: area.operator_phone,
        email: area.operator_email
      };
    }
  }
  
  console.log('❌ No service area found for zip:', normalizedZip);
  return {
    available: false,
    area: null,
    operator: null,
    phone: null,
    email: null
  };
}

/**
 * Check if a property has service available (checks property's zip code)
 * @param {object} property - Property object
 * @returns {object} - Service availability result
 */
export function isServiceAvailableForProperty(property) {
  const zip = getPropertyZipCode(property);
  console.log('🏠 Checking service for property:', property?.address, '| Zip:', zip);
  return isServiceAvailable(zip);
}

/**
 * Get appropriate messaging for users based on service availability
 * @param {string} zipCode - Zip code to check
 * @returns {object} - Message configuration
 */
export function getServiceMessage(zipCode) {
  const check = isServiceAvailable(zipCode);
  
  if (check.available) {
    return {
      type: "available",
      title: "Professional Service Available",
      message: `${check.operator} serves your area in ${check.area}.`,
      cta: "Request Quote",
      ctaLink: "Services",
      showMemberPricing: true,
      operator: check.operator,
      phone: check.phone,
      email: check.email
    };
  }
  
  return {
    type: "unavailable",
    title: "Service Coming Soon",
    message: "Professional 360° Operator service isn't available in your area yet. Sign up to be notified when we expand to your market.",
    cta: "Notify Me When Available",
    ctaLink: "FindOperator",
    showMemberPricing: false,
    operator: null,
    phone: null,
    email: null
  };
}

/**
 * Get all service areas (for admin/info displays)
 * @returns {array} - Array of service area objects
 */
export function getAllServiceAreas() {
  return Object.values(SERVICE_AREAS);
}

/**
 * Check if user should see member benefits (has membership + service available for their property)
 * @param {object} user - User object with subscription_tier
 * @param {object} property - Property object to check service for
 * @returns {boolean}
 */
export function shouldShowMemberBenefits(user, property) {
  if (!user) {
    console.log('❌ shouldShowMemberBenefits: No user');
    return false;
  }
  
  const hasMembership = user.subscription_tier && 
    user.subscription_tier !== 'free' && 
    (user.subscription_tier.includes('homecare') || user.subscription_tier.includes('propertycare'));
  
  console.log('👤 User tier:', user.subscription_tier, '| Has membership:', hasMembership);
  
  if (!hasMembership) {
    console.log('❌ shouldShowMemberBenefits: No membership');
    return false;
  }
  
  // Check property service availability
  const propertyZip = getPropertyZipCode(property);
  const hasService = isServiceAvailable(propertyZip).available;
  
  console.log('🏠 Property zip:', propertyZip, '| Has service:', hasService);
  console.log('✅ shouldShowMemberBenefits:', hasMembership && hasService);
  
  return hasMembership && hasService;
}