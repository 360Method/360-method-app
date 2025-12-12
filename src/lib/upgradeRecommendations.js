/**
 * Upgrade Recommendations Engine
 *
 * Generates personalized upgrade recommendations based on:
 * - Property systems (age, condition)
 * - Financial profile (equity, budget)
 * - Regional costs
 * - System lifespan data
 */

// Default lifespan data (fallback if database is empty)
const DEFAULT_LIFESPANS = {
  'HVAC': { avg_lifespan_years: 15, replacement_cost_avg: 7500 },
  'Roof': { avg_lifespan_years: 25, replacement_cost_avg: 15000 },
  'Water Heater': { avg_lifespan_years: 12, replacement_cost_avg: 1500 },
  'Furnace': { avg_lifespan_years: 18, replacement_cost_avg: 4500 },
  'Air Conditioner': { avg_lifespan_years: 15, replacement_cost_avg: 5500 },
  'Heat Pump': { avg_lifespan_years: 15, replacement_cost_avg: 6500 },
  'Electrical Panel': { avg_lifespan_years: 40, replacement_cost_avg: 2500 },
  'Plumbing': { avg_lifespan_years: 50, replacement_cost_avg: 8000 },
  'Windows': { avg_lifespan_years: 25, replacement_cost_avg: 12000 },
  'Siding': { avg_lifespan_years: 30, replacement_cost_avg: 15000 },
  'Garage Door': { avg_lifespan_years: 20, replacement_cost_avg: 1500 },
  'Deck': { avg_lifespan_years: 15, replacement_cost_avg: 8000 },
  'Fence': { avg_lifespan_years: 15, replacement_cost_avg: 4000 },
  'Appliances': { avg_lifespan_years: 12, replacement_cost_avg: 2000 },
  'Flooring': { avg_lifespan_years: 20, replacement_cost_avg: 6000 },
  'Kitchen': { avg_lifespan_years: 20, replacement_cost_avg: 25000 },
  'Bathroom': { avg_lifespan_years: 20, replacement_cost_avg: 15000 },
  'Insulation': { avg_lifespan_years: 40, replacement_cost_avg: 2500 },
  'Gutters': { avg_lifespan_years: 20, replacement_cost_avg: 1500 },
};

// Value impact multipliers (percentage of replacement cost that adds to property value)
const VALUE_IMPACT_MULTIPLIERS = {
  'HVAC': 0.85,
  'Roof': 0.70,
  'Water Heater': 0.50,
  'Furnace': 0.80,
  'Air Conditioner': 0.80,
  'Heat Pump': 0.85,
  'Electrical Panel': 0.60,
  'Plumbing': 0.50,
  'Windows': 0.75,
  'Siding': 0.80,
  'Garage Door': 0.95,
  'Deck': 0.70,
  'Fence': 0.50,
  'Appliances': 0.60,
  'Flooring': 0.80,
  'Kitchen': 1.50,
  'Bathroom': 1.40,
  'Insulation': 0.60,
  'Gutters': 0.40,
};

// Upgrade categories for better organization
const SYSTEM_CATEGORIES = {
  'HVAC': 'Energy Efficiency',
  'Furnace': 'Energy Efficiency',
  'Air Conditioner': 'Energy Efficiency',
  'Heat Pump': 'Energy Efficiency',
  'Insulation': 'Energy Efficiency',
  'Windows': 'Energy Efficiency',
  'Water Heater': 'Energy Efficiency',
  'Roof': 'High ROI Renovations',
  'Siding': 'High ROI Renovations',
  'Kitchen': 'High ROI Renovations',
  'Bathroom': 'High ROI Renovations',
  'Flooring': 'High ROI Renovations',
  'Deck': 'Quality of Life',
  'Fence': 'Quality of Life',
  'Garage Door': 'Curb Appeal',
  'Gutters': 'Preventive Maintenance',
  'Electrical Panel': 'Safety & Compliance',
  'Plumbing': 'Safety & Compliance',
  'Appliances': 'Quality of Life',
};

/**
 * Calculate system urgency score (0-100)
 * Higher score = more urgent
 */
export function calculateUrgency(remainingLife, condition) {
  let score = 0;

  // Remaining life scoring (0-60 points)
  if (remainingLife <= 0) {
    score += 60; // Past lifespan
  } else if (remainingLife <= 2) {
    score += 50; // Critical - 2 years or less
  } else if (remainingLife <= 5) {
    score += 35; // Soon - 5 years or less
  } else if (remainingLife <= 10) {
    score += 20; // Plan ahead
  } else {
    score += 5; // Good shape
  }

  // Condition scoring (0-40 points)
  const conditionLower = condition?.toLowerCase() || 'unknown';
  if (conditionLower === 'poor' || conditionLower === 'critical') {
    score += 40;
  } else if (conditionLower === 'fair') {
    score += 25;
  } else if (conditionLower === 'good') {
    score += 10;
  } else if (conditionLower === 'excellent') {
    score += 0;
  } else {
    score += 15; // Unknown condition
  }

  return Math.min(100, score);
}

/**
 * Get estimated cost from regional data or defaults
 */
export function getRegionalCost(regionalCosts, systemType, property) {
  // Try regional data first
  if (regionalCosts) {
    const costMultiplier = regionalCosts.cost_multiplier || 1.0;
    const baseCost = DEFAULT_LIFESPANS[systemType]?.replacement_cost_avg || 5000;
    return Math.round(baseCost * costMultiplier);
  }

  // Fallback to defaults
  return DEFAULT_LIFESPANS[systemType]?.replacement_cost_avg || 5000;
}

/**
 * Estimate value impact from upgrade
 */
export function estimateValueImpact(systemType, propertyValue, estimatedCost) {
  const multiplier = VALUE_IMPACT_MULTIPLIERS[systemType] || 0.6;
  const valueAdded = Math.round(estimatedCost * multiplier);

  // Cap at 10% of property value for any single upgrade
  const maxImpact = propertyValue ? propertyValue * 0.10 : valueAdded;
  return Math.min(valueAdded, maxImpact);
}

/**
 * Generate personalized "why" text for a recommendation
 */
export function generateWhyText(system, age, remainingLife, lifespan) {
  const systemName = system.system_type || 'This system';
  const installYear = system.installation_year;
  const condition = system.condition?.toLowerCase() || 'unknown';
  const avgLifespan = lifespan?.avg_lifespan_years || DEFAULT_LIFESPANS[systemName]?.avg_lifespan_years || 15;

  // Build the message
  let message = '';

  if (installYear) {
    message += `Your ${systemName} was installed in ${installYear} (${age} years old). `;
  } else {
    message += `Your ${systemName} is approximately ${age} years old. `;
  }

  // Add lifespan context
  if (remainingLife <= 0) {
    message += `At ${age} years, it's past the typical ${avgLifespan}-year lifespan. `;
  } else if (remainingLife <= 2) {
    message += `With only ${remainingLife} year${remainingLife === 1 ? '' : 's'} of typical lifespan remaining, `;
    message += `proactive replacement avoids emergency costs (often 2-3x more). `;
  } else if (remainingLife <= 5) {
    message += `It's approaching the end of its ${avgLifespan}-year lifespan. `;
    message += `Planning now gives you time to budget and choose the best option. `;
  }

  // Add condition context
  if (condition === 'poor' || condition === 'critical') {
    message += `Current condition is ${condition} - replacement is recommended soon to avoid failure.`;
  } else if (condition === 'fair') {
    message += `Current condition is fair - a good time to plan for upgrade.`;
  }

  return message.trim();
}

/**
 * Generate upgrade title from system type
 */
function generateUpgradeTitle(systemType) {
  const titles = {
    'HVAC': 'High-Efficiency HVAC Upgrade',
    'Roof': 'Roof Replacement',
    'Water Heater': 'Tankless Water Heater Upgrade',
    'Furnace': 'High-Efficiency Furnace',
    'Air Conditioner': 'Energy-Efficient AC',
    'Heat Pump': 'Heat Pump Installation',
    'Electrical Panel': 'Electrical Panel Upgrade',
    'Plumbing': 'Plumbing System Update',
    'Windows': 'Energy-Efficient Windows',
    'Siding': 'New Siding Installation',
    'Garage Door': 'Insulated Garage Door',
    'Deck': 'Deck Refresh or Replacement',
    'Fence': 'Fence Replacement',
    'Appliances': 'Appliance Upgrade Package',
    'Flooring': 'Flooring Upgrade',
    'Kitchen': 'Kitchen Modernization',
    'Bathroom': 'Bathroom Renovation',
    'Insulation': 'Insulation Upgrade',
    'Gutters': 'Gutter System Upgrade',
  };

  return titles[systemType] || `${systemType} Upgrade`;
}

/**
 * Generate upgrade description
 */
function generateDescription(systemType, age, condition) {
  const conditionLower = condition?.toLowerCase() || 'unknown';

  const descriptions = {
    'HVAC': `Replace aging ${age}-year-old HVAC with a high-efficiency system. Modern units are 20-40% more efficient, reducing energy bills and improving comfort.`,
    'Roof': `Professional roof replacement to protect your home. A new roof prevents water damage and can last 25-50 years depending on material choice.`,
    'Water Heater': `Upgrade to a tankless or high-efficiency water heater. Tankless units last longer and provide endless hot water while using less energy.`,
    'Windows': `Replace old windows with energy-efficient double or triple-pane windows. Reduces drafts, lowers energy bills, and improves home value.`,
    'Kitchen': `Modernize your kitchen with updated cabinets, countertops, and appliances. Kitchen upgrades typically return 75-100% at resale.`,
    'Bathroom': `Renovate your bathroom with modern fixtures, tile, and vanity. Bathroom updates are among the highest ROI home improvements.`,
  };

  return descriptions[systemType] || `Upgrade your ${age}-year-old ${systemType} (currently in ${conditionLower} condition) to improve functionality, efficiency, and home value.`;
}

/**
 * Main function: Generate personalized recommendations
 */
export function generateRecommendations(systems, property, regionalCosts, lifespanData) {
  if (!systems || systems.length === 0) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const recommendations = [];
  const propertyValue = property?.current_value || property?.estimated_value || 0;
  const equity = propertyValue - (property?.mortgage_balance || 0);

  for (const system of systems) {
    // Skip if no installation year
    if (!system.installation_year) continue;

    const systemType = system.system_type || system.name;
    const lifespan = lifespanData?.[systemType] || DEFAULT_LIFESPANS[systemType];

    if (!lifespan) continue;

    const age = currentYear - system.installation_year;
    const avgLifespan = lifespan.avg_lifespan_years || 15;
    const remainingLife = avgLifespan - age;

    // Only recommend if system is aging (within 5 years of lifespan) or in poor/fair condition
    const condition = system.condition?.toLowerCase() || 'unknown';
    const isAging = remainingLife <= 5;
    const isConditionConcern = condition === 'poor' || condition === 'critical' || condition === 'fair';

    if (!isAging && !isConditionConcern) continue;

    // Calculate costs and value
    const estimatedCost = getRegionalCost(regionalCosts, systemType, property);
    const valueImpact = estimateValueImpact(systemType, propertyValue, estimatedCost);
    const netGain = valueImpact - estimatedCost;

    // Calculate scores
    const urgencyScore = calculateUrgency(remainingLife, condition);

    // Affordability score based on equity (can they afford this?)
    let affordabilityScore = 100;
    if (equity > 0) {
      if (estimatedCost > equity * 0.2) {
        affordabilityScore = 40;
      } else if (estimatedCost > equity * 0.1) {
        affordabilityScore = 70;
      }
    }

    // ROI score
    const roiScore = netGain > 0 ? Math.min(100, (netGain / estimatedCost) * 100) : 0;

    // Composite score (weighted)
    const compositeScore = (urgencyScore * 0.4) + (roiScore * 0.3) + (affordabilityScore * 0.2) + 10;

    // Determine priority level
    let priority = 'consider';
    if (remainingLife <= 0 || condition === 'poor' || condition === 'critical') {
      priority = 'urgent';
    } else if (remainingLife <= 2 || (remainingLife <= 5 && condition === 'fair')) {
      priority = 'soon';
    }

    recommendations.push({
      id: `rec-${system.id}`,
      systemId: system.id,
      systemType,
      title: generateUpgradeTitle(systemType),
      description: generateDescription(systemType, age, condition),
      whyText: generateWhyText(system, age, remainingLife, lifespan),
      category: SYSTEM_CATEGORIES[systemType] || 'Home Improvement',

      // Financial
      estimatedCost,
      valueImpact,
      netGain,
      roiPercent: estimatedCost > 0 ? Math.round((valueImpact / estimatedCost) * 100) : 0,

      // Timing
      age,
      remainingLife,
      condition: system.condition,

      // Scoring
      urgencyScore,
      affordabilityScore,
      roiScore,
      compositeScore,
      priority,

      // For project creation
      investment_required: estimatedCost,
      property_value_impact: valueImpact,
      annual_savings: systemType === 'HVAC' || systemType === 'Windows' || systemType === 'Insulation'
        ? Math.round(estimatedCost * 0.05) // ~5% annual energy savings
        : 0,
    });
  }

  // Sort by composite score (highest first)
  return recommendations.sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * Generate demo recommendations for demo mode
 */
export function generateDemoRecommendations(isInvestor = false) {
  if (isInvestor) {
    return [
      {
        id: 'demo-rec-1',
        systemType: 'HVAC',
        title: 'High-Efficiency HVAC Upgrade',
        description: 'Replace aging HVAC system with a modern high-efficiency unit.',
        whyText: 'The HVAC at Oak Ridge was installed in 2012 (12 years old). It\'s approaching the end of its 15-year lifespan. Proactive replacement saves 30% on emergency costs.',
        category: 'Energy Efficiency',
        estimatedCost: 8500,
        valueImpact: 7200,
        netGain: -1300,
        roiPercent: 85,
        priority: 'soon',
        urgencyScore: 65,
        annual_savings: 425,
        investment_required: 8500,
        property_value_impact: 7200,
      },
      {
        id: 'demo-rec-2',
        systemType: 'Kitchen',
        title: 'Unit Kitchen Refresh',
        description: 'Update cabinets, countertops, and appliances to attract premium tenants.',
        whyText: 'Kitchen updates justify $150-200/month rent increase. Modern kitchens are the #1 feature tenants look for.',
        category: 'Rental Income Boosters',
        estimatedCost: 6500,
        valueImpact: 9750,
        netGain: 3250,
        roiPercent: 150,
        priority: 'consider',
        urgencyScore: 45,
        annual_savings: 0,
        investment_required: 6500,
        property_value_impact: 9750,
      },
      {
        id: 'demo-rec-3',
        systemType: 'Water Heater',
        title: 'Tankless Water Heater',
        description: 'Upgrade to tankless for endless hot water and lower utility bills.',
        whyText: 'Your water heater is 10 years old. Tankless units last 20+ years and reduce energy costs 20-30%.',
        category: 'Energy Efficiency',
        estimatedCost: 2200,
        valueImpact: 1650,
        netGain: -550,
        roiPercent: 75,
        priority: 'soon',
        urgencyScore: 55,
        annual_savings: 180,
        investment_required: 2200,
        property_value_impact: 1650,
      },
    ];
  }

  // Homeowner demo recommendations
  return [
    {
      id: 'demo-rec-1',
      systemType: 'HVAC',
      title: 'High-Efficiency HVAC Upgrade',
      description: 'Replace your aging HVAC with a modern high-efficiency heat pump system.',
      whyText: 'Your HVAC was installed in 2010 (14 years old). At the end of its 15-year lifespan, proactive replacement saves $3,000+ vs emergency replacement in peak summer.',
      category: 'Energy Efficiency',
      estimatedCost: 7500,
      valueImpact: 6375,
      netGain: -1125,
      roiPercent: 85,
      priority: 'urgent',
      urgencyScore: 75,
      annual_savings: 375,
      investment_required: 7500,
      property_value_impact: 6375,
    },
    {
      id: 'demo-rec-2',
      systemType: 'Windows',
      title: 'Energy-Efficient Windows',
      description: 'Replace old single-pane windows with double-pane, low-E windows.',
      whyText: 'Your windows are 18 years old. New energy-efficient windows reduce heating/cooling costs 15-25% and eliminate drafts.',
      category: 'Energy Efficiency',
      estimatedCost: 8500,
      valueImpact: 6375,
      netGain: -2125,
      roiPercent: 75,
      priority: 'soon',
      urgencyScore: 50,
      annual_savings: 340,
      investment_required: 8500,
      property_value_impact: 6375,
    },
    {
      id: 'demo-rec-3',
      systemType: 'Bathroom',
      title: 'Primary Bathroom Renovation',
      description: 'Modernize your primary bathroom with new vanity, fixtures, and tile.',
      whyText: 'Bathroom updates return 70-80% at resale and make daily life more enjoyable. A modern bathroom is a top buyer feature.',
      category: 'High ROI Renovations',
      estimatedCost: 12000,
      valueImpact: 16800,
      netGain: 4800,
      roiPercent: 140,
      priority: 'consider',
      urgencyScore: 30,
      annual_savings: 0,
      investment_required: 12000,
      property_value_impact: 16800,
    },
  ];
}
