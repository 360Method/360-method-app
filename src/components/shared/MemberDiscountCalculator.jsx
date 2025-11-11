// Member Discount Structure
const MEMBER_DISCOUNTS = {
  under_5k: {
    essential: { percent: 5, maxSavings: 250 },
    premium: { percent: 10, maxSavings: 500 },
    elite: { percent: 15, maxSavings: 750 }
  },
  range_5k_to_15k: {
    essential: { percent: 5, maxSavings: 500 },
    premium: { percent: 10, maxSavings: 1200 },
    elite: { percent: 15, maxSavings: 1800 }
  },
  range_15k_to_40k: {
    essential: { percent: 5, maxSavings: 1000 },
    premium: { percent: 10, maxSavings: 2500 },
    elite: { percent: 15, maxSavings: 4000 }
  },
  range_40k_to_100k: {
    essential: { percent: 3, maxSavings: 2000 },
    premium: { percent: 6, maxSavings: 4000 },
    elite: { percent: 10, maxSavings: 6500 }
  },
  over_100k: {
    essential: { percent: 2, maxSavings: 3000 },
    premium: { percent: 5, maxSavings: 6000 },
    elite: { percent: 8, maxSavings: 10000 }
  }
};

/**
 * Calculate member discount based on project cost and membership tier
 * @param {number} projectCost - Total project cost
 * @param {string} tier - Membership tier (essential, premium, elite, or full tier name)
 * @returns {object} - { percent, maxSavings, actualSavings, tierInfo }
 */
export function calculateMemberDiscount(projectCost, tier) {
  // Normalize tier name
  const normalizedTier = tier.includes('essential') ? 'essential' 
    : tier.includes('premium') ? 'premium' 
    : tier.includes('elite') ? 'elite' 
    : null;

  if (!normalizedTier) {
    return { percent: 0, maxSavings: 0, actualSavings: 0, tierInfo: null };
  }

  // Determine project cost range
  let rangeKey;
  if (projectCost < 5000) {
    rangeKey = 'under_5k';
  } else if (projectCost < 15000) {
    rangeKey = 'range_5k_to_15k';
  } else if (projectCost < 40000) {
    rangeKey = 'range_15k_to_40k';
  } else if (projectCost < 100000) {
    rangeKey = 'range_40k_to_100k';
  } else {
    rangeKey = 'over_100k';
  }

  const tierInfo = MEMBER_DISCOUNTS[rangeKey][normalizedTier];
  const calculatedSavings = projectCost * (tierInfo.percent / 100);
  const actualSavings = Math.min(calculatedSavings, tierInfo.maxSavings);

  return {
    percent: tierInfo.percent,
    maxSavings: tierInfo.maxSavings,
    actualSavings: Math.round(actualSavings),
    tierInfo,
    rangeKey,
    isCapped: calculatedSavings > tierInfo.maxSavings
  };
}

/**
 * Get all tier discounts for a specific project cost (for comparison displays)
 * @param {number} projectCost - Total project cost
 * @returns {object} - { essential: {...}, premium: {...}, elite: {...} }
 */
export function getAllTierDiscounts(projectCost) {
  return {
    essential: calculateMemberDiscount(projectCost, 'essential'),
    premium: calculateMemberDiscount(projectCost, 'premium'),
    elite: calculateMemberDiscount(projectCost, 'elite')
  };
}

/**
 * Get range label for display
 */
export function getDiscountRangeLabel(projectCost) {
  if (projectCost < 5000) return 'Under $5K Projects';
  if (projectCost < 15000) return '$5K-$15K Projects';
  if (projectCost < 40000) return '$15K-$40K Projects';
  if (projectCost < 100000) return '$40K-$100K Projects';
  return 'Projects Over $100K';
}

/**
 * Format discount explanation for user
 */
export function formatDiscountExplanation(discountInfo, projectCost, tierName) {
  const { percent, maxSavings, actualSavings, isCapped } = discountInfo;
  
  let explanation = `${percent}% discount on ${getDiscountRangeLabel(projectCost)}`;
  
  if (isCapped) {
    explanation += ` (capped at $${maxSavings.toLocaleString()})`;
  }
  
  return explanation;
}