/**
 * Pricing Calculator for 360° Command Center Tiers
 * Calculates costs based on property and door counts
 */

// Calculate total doors across all properties
export const calculateTotalDoors = (properties) => {
  return properties.reduce((sum, property) => sum + (property.door_count || 1), 0);
};

/**
 * Tier Configuration
 * SCOUT (free) - Learn the Method - 1 property, any size
 * PIONEER (good) - AI-Powered Pro - Up to 25 properties/doors, $8 base + $2/door after 3
 * COMMANDER (better) - Advanced AI + Collaboration - Up to 100 doors, $50 base + $3/door after 15
 * ELITE (best) - Full Enterprise Suite - Unlimited, $299 flat rate
 */
export const getTierConfig = (tier) => {
  const configs = {
    free: {
      name: 'free',
      displayName: 'Scout',
      color: '#6B7280', // gray-500
      propertyLimit: 1,
      doorLimit: null, // any size for single property
      features: [
        '1 property (any size)',
        'Basic baseline documentation',
        'Seasonal inspection checklists',
        'Task tracking',
        'Community support'
      ]
    },
    good: {
      name: 'good',
      displayName: 'Pioneer',
      color: '#28A745', // green-600
      propertyLimit: 25,
      doorLimit: 25,
      features: [
        'Everything in Scout, PLUS:',
        'AI cascade risk alerts',
        'AI cost forecasting',
        'AI spending insights',
        'Up to 25 properties/doors',
        'Portfolio analytics dashboard',
        'Export reports (PDF)',
        'Priority email support (48hr)'
      ]
    },
    better: {
      name: 'better',
      displayName: 'Commander',
      color: '#8B5CF6', // purple-600
      propertyLimit: 100,
      doorLimit: 100,
      features: [
        'Everything in Pioneer, PLUS:',
        'AI portfolio comparison',
        'AI budget forecasting across properties',
        'Up to 100 properties/doors',
        'Share access with team members',
        'White-label PDF reports',
        'Priority support (24hr response)'
      ]
    },
    best: {
      name: 'best',
      displayName: 'Elite',
      color: '#F59E0B', // amber-500
      propertyLimit: Infinity,
      doorLimit: Infinity,
      features: [
        'Everything in Commander, PLUS:',
        'Custom AI reporting builder',
        'Unlimited properties/doors',
        'Multi-user accounts with roles',
        'Dedicated account manager',
        'Phone support (4hr response)',
        'API access (coming soon)'
      ]
    }
  };

  return configs[tier] || configs.free;
};

/**
 * Calculate pricing for PIONEER (good) tier
 * $8/month base (covers first 3 doors)
 * +$2/month per door after that
 * Up to 25 doors max
 */
export const calculateGoodPricing = (totalDoors) => {
  const baseDoors = 3;
  const basePrice = 8;
  const pricePerDoor = 2;
  
  if (totalDoors <= baseDoors) {
    return {
      monthlyPrice: basePrice,
      annualPrice: basePrice * 12,
      additionalDoors: 0,
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
    breakdown: {
      base: basePrice,
      additionalCost
    }
  };
};

/**
 * Calculate pricing for COMMANDER (better) tier
 * $50/month base (covers first 15 doors)
 * +$3/month per door after that
 * Up to 100 doors max
 */
export const calculateBetterPricing = (totalDoors) => {
  const baseDoors = 15;
  const basePrice = 50;
  const pricePerDoor = 3;
  
  if (totalDoors <= baseDoors) {
    return {
      monthlyPrice: basePrice,
      annualPrice: basePrice * 12,
      additionalDoors: 0,
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
    breakdown: {
      base: basePrice,
      additionalCost
    }
  };
};

/**
 * Calculate pricing for ELITE (best) tier
 * $299/month flat rate
 * Unlimited properties and doors
 */
export const calculateBestPricing = () => {
  return {
    monthlyPrice: 299,
    annualPrice: 299 * 12,
    additionalDoors: 0,
    breakdown: {
      base: 299,
      additionalCost: 0
    }
  };
};

/**
 * Recommend a tier based on total door count
 */
export const getRecommendedTier = (totalDoors) => {
  if (totalDoors <= 3) return 'good'; // PIONEER
  if (totalDoors <= 25) return 'good'; // PIONEER
  if (totalDoors <= 100) return 'better'; // COMMANDER
  return 'best'; // ELITE
};

/**
 * Calculate pricing for all tiers
 */
export const calculateAllTierPricing = (totalDoors) => {
  return {
    free: { monthlyPrice: 0, annualPrice: 0 },
    good: calculateGoodPricing(totalDoors),
    better: calculateBetterPricing(totalDoors),
    best: calculateBestPricing()
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