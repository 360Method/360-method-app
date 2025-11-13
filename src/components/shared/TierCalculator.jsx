// Tier pricing calculator for 360° Command Center

/**
 * Calculate total doors across all properties
 */
export function calculateTotalDoors(properties = []) {
  return properties.reduce((sum, property) => {
    return sum + (property.door_count || 1);
  }, 0);
}

/**
 * Get tier configuration
 */
export function getTierConfig(tier) {
  const configs = {
    free: {
      name: "Free",
      displayName: "Starter",
      color: "#6B7280",
      propertyLimit: 1,
      doorLimit: null, // No door limit for single property
      features: [
        "1 property (any size)",
        "Basic baseline documentation",
        "Seasonal inspection checklists",
        "Task tracking"
      ]
    },
    good: {
      name: "Good",
      displayName: "Pro",
      color: "#28A745",
      basePrice: 8,
      baseDoors: 3,
      perDoorPrice: 2,
      propertyLimit: 25,
      doorLimit: 25,
      features: [
        "Up to 25 properties",
        "Up to 25 doors total",
        "Everything in Free, PLUS:",
        "Cascade risk alerts",
        "Portfolio analytics dashboard",
        "Export reports (PDF)",
        "Priority email support",
        "Mobile optimization",
        "Unlimited inspections"
      ]
    },
    better: {
      name: "Better",
      displayName: "Premium",
      color: "#8B5CF6",
      basePrice: 50,
      baseDoors: 15,
      perDoorPrice: 3,
      propertyLimit: 100,
      doorLimit: 100,
      features: [
        "Up to 100 properties",
        "Up to 100 doors total",
        "Everything in Pro, PLUS:",
        "Portfolio comparison dashboard",
        "Budget forecasting tools",
        "Share access with others",
        "White-label PDF reports",
        "Priority support (24hr response)"
      ]
    },
    best: {
      name: "Best",
      displayName: "Enterprise",
      color: "#F59E0B",
      basePrice: 299,
      propertyLimit: Infinity,
      doorLimit: Infinity,
      features: [
        "Unlimited properties",
        "Unlimited doors",
        "Everything in Premium, PLUS:",
        "Multi-user accounts with roles",
        "Custom reporting builder",
        "Dedicated account manager",
        "Phone support (4hr response)",
        "API access (coming soon)"
      ]
    }
  };

  return configs[tier] || configs.free;
}

/**
 * Calculate pricing for Good tier (Pro)
 */
export function calculateGoodPricing(totalDoors) {
  const config = getTierConfig('good');
  
  if (totalDoors <= config.baseDoors) {
    return {
      monthlyPrice: config.basePrice,
      annualPrice: config.basePrice * 12,
      breakdown: {
        base: config.basePrice,
        additionalDoors: 0,
        additionalCost: 0
      },
      totalDoors,
      additionalDoors: 0
    };
  }

  const additionalDoors = totalDoors - config.baseDoors;
  const additionalCost = additionalDoors * config.perDoorPrice;
  const monthlyPrice = config.basePrice + additionalCost;

  return {
    monthlyPrice,
    annualPrice: monthlyPrice * 12,
    breakdown: {
      base: config.basePrice,
      additionalDoors,
      additionalCost
    },
    totalDoors,
    additionalDoors
  };
}

/**
 * Calculate pricing for Better tier (Premium)
 */
export function calculateBetterPricing(totalDoors) {
  const config = getTierConfig('better');
  
  if (totalDoors <= config.baseDoors) {
    return {
      monthlyPrice: config.basePrice,
      annualPrice: config.basePrice * 12,
      breakdown: {
        base: config.basePrice,
        additionalDoors: 0,
        additionalCost: 0
      },
      totalDoors,
      additionalDoors: 0
    };
  }

  const additionalDoors = totalDoors - config.baseDoors;
  const additionalCost = additionalDoors * config.perDoorPrice;
  const monthlyPrice = config.basePrice + additionalCost;

  return {
    monthlyPrice,
    annualPrice: monthlyPrice * 12,
    breakdown: {
      base: config.basePrice,
      additionalDoors,
      additionalCost
    },
    totalDoors,
    additionalDoors
  };
}

/**
 * Calculate pricing for Best tier (Enterprise)
 */
export function calculateBestPricing() {
  const config = getTierConfig('best');
  
  return {
    monthlyPrice: config.basePrice,
    annualPrice: config.basePrice * 12,
    breakdown: {
      base: config.basePrice,
      additionalDoors: 0,
      additionalCost: 0
    },
    totalDoors: Infinity,
    additionalDoors: 0
  };
}

/**
 * Get recommended tier based on door count
 */
export function getRecommendedTier(totalDoors) {
  if (totalDoors <= 1) return 'free';
  if (totalDoors <= 25) return 'good';
  if (totalDoors <= 100) return 'better';
  return 'best';
}

/**
 * Calculate pricing for all tiers
 */
export function calculateAllTierPricing(totalDoors) {
  return {
    free: {
      available: totalDoors <= 1,
      monthlyPrice: 0,
      annualPrice: 0
    },
    good: {
      available: totalDoors <= 25,
      ...calculateGoodPricing(totalDoors)
    },
    better: {
      available: totalDoors <= 100,
      ...calculateBetterPricing(totalDoors)
    },
    best: {
      available: true,
      ...calculateBestPricing()
    }
  };
}

/**
 * Check if user can add more properties/doors
 */
export function canAddProperty(currentTier, currentPropertyCount, currentDoorCount) {
  const config = getTierConfig(currentTier);
  
  const hasPropertyLimit = currentPropertyCount < config.propertyLimit;
  const hasDoorLimit = config.doorLimit === null || currentDoorCount < config.doorLimit;
  
  return {
    canAdd: hasPropertyLimit && hasDoorLimit,
    reason: !hasPropertyLimit ? 'property_limit' : !hasDoorLimit ? 'door_limit' : null,
    limits: {
      propertyLimit: config.propertyLimit,
      doorLimit: config.doorLimit,
      currentProperties: currentPropertyCount,
      currentDoors: currentDoorCount
    }
  };
}