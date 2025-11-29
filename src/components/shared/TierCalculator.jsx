/**
 * Pricing Calculator for 360° Command Center Tiers
 * Calculates costs based on property and door counts
 * 
 * TIER STRUCTURE:
 * - SCOUT (free) - Learn the Method - 1 property, no AI
 * - HOMEOWNER PLUS (homeowner_plus) - Single property with AI - $5/mo
 * - PIONEER (good) - AI-Powered Pro for Investors - Up to 25 doors
 * - COMMANDER (better) - Advanced AI + Collaboration - Up to 100 doors
 * - ELITE (best) - Full Enterprise Suite - Unlimited, flat rate
 */

// Calculate total doors across all properties
export const calculateTotalDoors = (properties) => {
  return properties.reduce((sum, property) => sum + (property.door_count || 1), 0);
};

/**
 * Tier Configuration
 * Each tier has specific limits and features designed for different user types
 */
export const getTierConfig = (tier) => {
  const configs = {
    free: {
      name: 'free',
      displayName: 'Scout',
      color: '#6B7280', // gray-500
      propertyLimit: 1,
      doorLimit: null, // any size for single property
      targetUser: 'homeowner', // who this tier is for
      features: [
        '1 property (any size)',
        'Full 360° Method framework',
        'Baseline documentation',
        'Inspection checklists',
        'Task tracking & scheduling',
        'Cascade risk alerts (lookup-based)',
        'Community support'
      ],
      aiFeatures: false // No AI - upgrade to unlock
    },
    homeowner_plus: {
      name: 'homeowner_plus',
      displayName: 'Homeowner+',
      color: '#3B82F6', // blue-500
      propertyLimit: 1,
      doorLimit: null, // any size for single property
      targetUser: 'homeowner',
      features: [
        'Everything in Scout, PLUS:',
        'AI-powered insights',
        'AI risk analysis & warnings',
        'AI cost forecasting',
        'AI inspection summaries',
        'Export reports (PDF)',
        'Email support (48hr)'
      ],
      aiFeatures: true
    },
    good: {
      name: 'good',
      displayName: 'Pioneer',
      color: '#28A745', // green-600
      propertyLimit: 25,
      doorLimit: 25,
      targetUser: 'investor',
      features: [
        'Everything in Homeowner+, PLUS:',
        'Up to 25 properties/doors',
        'Portfolio analytics dashboard',
        'Multi-property AI insights',
        'Priority email support (48hr)'
      ],
      aiFeatures: true
    },
    better: {
      name: 'better',
      displayName: 'Commander',
      color: '#8B5CF6', // purple-600
      propertyLimit: 100,
      doorLimit: 100,
      targetUser: 'investor',
      features: [
        'Everything in Pioneer, PLUS:',
        'AI portfolio comparison',
        'AI budget forecasting across properties',
        'Up to 100 properties/doors',
        'Share access with team members',
        'White-label PDF reports',
        'Priority support (24hr response)'
      ],
      aiFeatures: true
    },
    best: {
      name: 'best',
      displayName: 'Elite',
      color: '#F59E0B', // amber-500
      propertyLimit: Infinity,
      doorLimit: Infinity,
      targetUser: 'property_manager',
      features: [
        'Everything in Commander, PLUS:',
        'Custom AI reporting builder',
        'Unlimited properties/doors',
        'Multi-user accounts with roles',
        'Dedicated account manager',
        'Phone support (4hr response)',
        'API access (coming soon)'
      ],
      aiFeatures: true
    }
  };

  return configs[tier] || configs.free;
};

/**
 * Get all tier configs as an array (useful for mapping)
 */
export const getAllTiers = () => {
  return ['free', 'homeowner_plus', 'good', 'better', 'best'].map(tier => ({
    ...getTierConfig(tier),
    key: tier
  }));
};

/**
 * Check if a tier has AI features
 */
export const tierHasAI = (tier) => {
  const config = getTierConfig(tier);
  return config.aiFeatures === true;
};

/**
 * Check if user can use AI based on their tier
 * Simple check: paid tiers have AI, free tier does not
 * @param {string} tier - User's current tier
 * @returns {boolean} - true if tier has AI access
 */
export const canUseAI = (tier) => {
  return tierHasAI(tier);
};

/**
 * Calculate pricing for HOMEOWNER+ tier
 * Annual: $5/month flat
 * Monthly: $7/month flat
 * Single property only
 */
export const calculateHomeownerPlusPricing = (billingCycle = 'annual') => {
  const monthlyPrice = billingCycle === 'annual' ? 5 : 7;
  
  return {
    monthlyPrice,
    annualPrice: monthlyPrice * 12,
    additionalDoors: 0,
    billingCycle,
    breakdown: {
      base: monthlyPrice,
      additionalCost: 0
    }
  };
};

/**
 * Calculate pricing for PIONEER (good) tier
 * Annual: $8/month base (covers first 3 doors) + $2/door after
 * Monthly: $12/month base (covers first 3 doors) + $2/door after
 * Up to 25 doors max
 */
export const calculateGoodPricing = (totalDoors, billingCycle = 'annual') => {
  const baseDoors = 3;
  const basePrice = billingCycle === 'annual' ? 8 : 12;
  const pricePerDoor = 2; // Same for both cycles
  
  if (totalDoors <= baseDoors) {
    return {
      monthlyPrice: basePrice,
      annualPrice: basePrice * 12,
      additionalDoors: 0,
      billingCycle,
      breakdown: {
        base: basePrice,
        additionalCost: 0
      }
    };
  }
  
  const additionalDoors = totalDoors - baseDoors;
  const additionalCost = additionalDoors * pricePerDoor;
  const monthlyPrice = basePrice + additionalCost;
  
  return {
    monthlyPrice,
    annualPrice: monthlyPrice * 12,
    additionalDoors,
    billingCycle,
    breakdown: {
      base: basePrice,
      additionalCost
    }
  };
};

/**
 * Calculate pricing for COMMANDER (better) tier
 * Annual: $50/month base (covers first 15 doors) + $3/door after
 * Monthly: $60/month base (covers first 15 doors) + $3/door after
 * Up to 100 doors max
 */
export const calculateBetterPricing = (totalDoors, billingCycle = 'annual') => {
  const baseDoors = 15;
  const basePrice = billingCycle === 'annual' ? 50 : 60;
  const pricePerDoor = 3; // Same for both cycles
  
  if (totalDoors <= baseDoors) {
    return {
      monthlyPrice: basePrice,
      annualPrice: basePrice * 12,
      additionalDoors: 0,
      billingCycle,
      breakdown: {
        base: basePrice,
        additionalCost: 0
      }
    };
  }
  
  const additionalDoors = totalDoors - baseDoors;
  const additionalCost = additionalDoors * pricePerDoor;
  const monthlyPrice = basePrice + additionalCost;
  
  return {
    monthlyPrice,
    annualPrice: monthlyPrice * 12,
    additionalDoors,
    billingCycle,
    breakdown: {
      base: basePrice,
      additionalCost
    }
  };
};

/**
 * Calculate pricing for ELITE (best) tier
 * Annual: $299/month flat rate
 * Monthly: $350/month flat rate
 * Unlimited properties and doors
 */
export const calculateBestPricing = (billingCycle = 'annual') => {
  const monthlyPrice = billingCycle === 'annual' ? 299 : 350;
  
  return {
    monthlyPrice,
    annualPrice: monthlyPrice * 12,
    additionalDoors: 0,
    billingCycle,
    breakdown: {
      base: monthlyPrice,
      additionalCost: 0
    }
  };
};

/**
 * Recommend a tier based on total door count and user type
 * @param {number} totalDoors - Total number of doors across all properties
 * @param {number} propertyCount - Number of properties
 * @param {string} userType - 'homeowner' or 'investor'
 */
export const getRecommendedTier = (totalDoors, propertyCount = 1, userType = 'investor') => {
  // Homeowners with 1 property should get Homeowner+ recommendation
  if (propertyCount === 1 && userType === 'homeowner') {
    return 'homeowner_plus';
  }
  
  // Investors or multiple properties
  if (totalDoors <= 25) return 'good'; // PIONEER
  if (totalDoors <= 100) return 'better'; // COMMANDER
  return 'best'; // ELITE
};

/**
 * Calculate pricing for all tiers
 */
export const calculateAllTierPricing = (totalDoors, billingCycle = 'annual') => {
  return {
    free: { monthlyPrice: 0, annualPrice: 0, billingCycle },
    homeowner_plus: calculateHomeownerPlusPricing(billingCycle),
    good: calculateGoodPricing(totalDoors, billingCycle),
    better: calculateBetterPricing(totalDoors, billingCycle),
    best: calculateBestPricing(billingCycle)
  };
};

/**
 * Check if user can add more properties/doors based on current tier
 */
export const canAddProperty = (currentTier, currentPropertyCount, currentDoorCount) => {
  const config = getTierConfig(currentTier);
  
  // Check property limit
  if (config.propertyLimit !== Infinity && currentPropertyCount >= config.propertyLimit) {
    return {
      canAdd: false,
      reason: `${config.displayName} tier is limited to ${config.propertyLimit} ${config.propertyLimit === 1 ? 'property' : 'properties'}`
    };
  }
  
  // Check door limit (if applicable)
  if (config.doorLimit !== null && config.doorLimit !== Infinity && currentDoorCount >= config.doorLimit) {
    return {
      canAdd: false,
      reason: `${config.displayName} tier is limited to ${config.doorLimit} total doors`
    };
  }
  
  return { canAdd: true };
};