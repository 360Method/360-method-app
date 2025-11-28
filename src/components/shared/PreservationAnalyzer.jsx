// MIGRATED: AI features will use OpenAI/Supabase Edge Functions
// TODO: Connect to AI service for generateAIPreservationPlan

// Preservation strategies database
const PRESERVATION_STRATEGIES = {
  "HVAC System": {
    "8-12": [
      { name: "Annual professional deep cleaning", cost: 180, extensionYears: 1, description: "Removes 5+ years of efficiency-killing buildup" },
      { name: "Coil cleaning & treatment", cost: 120, extensionYears: 1, description: "Improves cooling efficiency 10-15%" }
    ],
    "12-16": [
      { name: "Deep coil cleaning & descaling", cost: 180, extensionYears: 1, description: "Removes years of buildup" },
      { name: "Refrigerant optimization", cost: 120, extensionYears: 1, description: "Improves efficiency 15-20%, reduces strain" },
      { name: "Duct sealing & optimization", cost: 600, extensionYears: 2, description: "Prevents 20-30% energy waste, reduces system strain" }
    ],
    "17+": [
      { name: "Comprehensive tune-up", cost: 300, extensionYears: 1, description: "Extract maximum remaining life" },
      { name: "Component replacement (capacitors, contactors)", cost: 400, extensionYears: 1, description: "Replace wear items before failure" }
    ]
  },
  "Plumbing System": {
    "6-8": [
      { name: "Water heater anode rod replacement", cost: 200, extensionYears: 2, description: "Prevents tank corrosion" },
      { name: "Tank flush & sediment removal", cost: 120, extensionYears: 1, description: "Improves efficiency, prevents buildup damage" }
    ],
    "9-11": [
      { name: "Anode rod replacement", cost: 200, extensionYears: 2, description: "Critical for preventing tank corrosion" },
      { name: "Tank flush & descale treatment", cost: 150, extensionYears: 1, description: "Removes damaging sediment, improves heating" },
      { name: "Expansion tank check/replacement", cost: 180, extensionYears: 1, description: "Prevents pressure damage" }
    ]
  },
  "Roof System": {
    "12-18": [
      { name: "Moss treatment & removal", cost: 400, extensionYears: 2, description: "Prevents shingle deterioration" },
      { name: "Minor flashing repair", cost: 500, extensionYears: 2, description: "Prevents leaks at vulnerable points" },
      { name: "Sealant replacement", cost: 300, extensionYears: 1, description: "Prevents moisture intrusion" }
    ],
    "18-22": [
      { name: "Comprehensive moss treatment", cost: 500, extensionYears: 2, description: "Aggressive moss removal & prevention" },
      { name: "Flashing replacement", cost: 800, extensionYears: 3, description: "Replace aging flashing before failure" },
      { name: "Shingle repairs", cost: 600, extensionYears: 2, description: "Replace damaged shingles, prevent spread" }
    ]
  },
  "Water & Sewer/Septic": {
    "15-25": [
      { name: "Septic tank pump & inspection", cost: 400, extensionYears: 2, description: "Prevents system failure" },
      { name: "Drain field treatment", cost: 300, extensionYears: 2, description: "Restores absorption capacity" }
    ],
    "25+": [
      { name: "Comprehensive septic inspection", cost: 500, extensionYears: 1, description: "Identify issues before failure" },
      { name: "Tank & field treatment", cost: 600, extensionYears: 2, description: "Extend system life" }
    ]
  },
  "Foundation & Structure": {
    "30+": [
      { name: "Foundation sealing", cost: 1500, extensionYears: 5, description: "Prevents water intrusion and cracks" },
      { name: "Drainage improvement", cost: 2000, extensionYears: 10, description: "Protects foundation long-term" }
    ]
  }
};

// Typical lifespans for systems
const SYSTEM_LIFESPANS = {
  "HVAC System": 20,
  "Plumbing System": 12,
  "Water Heater": 12,
  "Roof System": 25,
  "Electrical System": 40,
  "Water & Sewer/Septic": 40,
  "Foundation & Structure": 100,
  "Windows & Doors": 25,
  "Gutters & Downspouts": 20,
  "Exterior Siding & Envelope": 30
};

// Typical replacement costs
const REPLACEMENT_COSTS = {
  "HVAC System": 8000,
  "Plumbing System": 3500,
  "Water Heater": 3500,
  "Roof System": 18000,
  "Electrical System": 12000,
  "Water & Sewer/Septic": 25000,
  "Foundation & Structure": 50000,
  "Windows & Doors": 8000,
  "Gutters & Downspouts": 1500,
  "Exterior Siding & Envelope": 15000
};

export function analyzePreservationOpportunity(system) {
  const lifespan = SYSTEM_LIFESPANS[system.system_type] || 20;
  const age = system.installation_year ? new Date().getFullYear() - system.installation_year : null;
  
  if (!age) return null;
  
  const percentLifespan = (age / lifespan) * 100;
  
  // Only show preservation for systems 50-95% through lifespan
  if (percentLifespan < 50 || percentLifespan > 95) {
    return null;
  }
  
  // Get strategies for this system type and age
  const strategies = getStrategiesForSystem(system.system_type, age);
  
  if (!strategies || strategies.length === 0) {
    return null;
  }
  
  const replacementCost = REPLACEMENT_COSTS[system.system_type] || 5000;
  const totalPreservationCost = strategies.reduce((sum, s) => sum + s.cost, 0);
  const totalExtension = strategies.reduce((sum, s) => sum + s.extensionYears, 0);
  
  // Calculate failure risk
  const failureRisk = calculateFailureRisk(percentLifespan, system.condition);
  
  // Calculate ROI
  const annualSavings = replacementCost / totalExtension;
  const roi = annualSavings / totalPreservationCost;
  
  return {
    system: system,
    priority: percentLifespan > 75 ? "HIGH" : percentLifespan > 60 ? "MEDIUM" : "LOW",
    strategies: strategies,
    investment: totalPreservationCost,
    extensionYears: totalExtension,
    replacementCost: replacementCost,
    roi: roi,
    annualSavings: annualSavings,
    failureRisk: failureRisk,
    percentLifespan: Math.round(percentLifespan),
    age: age,
    lifespan: lifespan
  };
}

function getStrategiesForSystem(systemType, age) {
  const systemStrategies = PRESERVATION_STRATEGIES[systemType];
  if (!systemStrategies) return [];
  
  // Find matching age range
  for (const [ageRange, strategies] of Object.entries(systemStrategies)) {
    if (ageRange.includes('+')) {
      const minAge = parseInt(ageRange);
      if (age >= minAge) return strategies;
    } else {
      const [min, max] = ageRange.split('-').map(n => parseInt(n));
      if (age >= min && age <= max) return strategies;
    }
  }
  
  return [];
}

function calculateFailureRisk(percentLifespan, condition) {
  let baseRisk = 0;
  
  if (percentLifespan >= 90) baseRisk = 40;
  else if (percentLifespan >= 80) baseRisk = 30;
  else if (percentLifespan >= 70) baseRisk = 20;
  else if (percentLifespan >= 60) baseRisk = 15;
  else baseRisk = 10;
  
  // Adjust for condition
  const conditionMultiplier = {
    "Excellent": 0.5,
    "Good": 1,
    "Fair": 1.5,
    "Poor": 2,
    "Urgent": 3
  };
  
  const multiplier = conditionMultiplier[condition] || 1;
  return Math.min(Math.round(baseRisk * multiplier), 80);
}

export async function generatePreservationRecommendations(systems) {
  const opportunities = systems
    .map(s => analyzePreservationOpportunity(s))
    .filter(o => o !== null);
  
  if (opportunities.length === 0) return null;
  
  // Sort by priority (HIGH first) and ROI
  opportunities.sort((a, b) => {
    if (a.priority !== b.priority) {
      const priorityOrder = { "HIGH": 0, "MEDIUM": 1, "LOW": 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.roi - a.roi;
  });
  
  const totalInvestment = opportunities.reduce((sum, o) => sum + o.investment, 0);
  const totalSavings = opportunities.reduce((sum, o) => sum + o.replacementCost, 0);
  
  return {
    opportunities,
    totalInvestment,
    totalSavings,
    totalROI: totalSavings / totalInvestment
  };
}

export async function generateAIPreservationPlan(system, preservationOpportunity) {
  try {
    const prompt = `Create a detailed preservation plan for this aging home system:

System: ${system.system_type}
Age: ${preservationOpportunity.age} years (${preservationOpportunity.percentLifespan}% of ${preservationOpportunity.lifespan}-year typical lifespan)
Condition: ${system.condition}
Failure Risk: ${preservationOpportunity.failureRisk}% in next 2 years

Recommended Preservation:
${preservationOpportunity.strategies.map(s => `- ${s.name} ($${s.cost}) - ${s.description}`).join('\n')}

Total Investment: $${preservationOpportunity.investment}
Potential Extension: ${preservationOpportunity.extensionYears} years
Replacement Cost Avoided: $${preservationOpportunity.replacementCost}

Provide:
1. Why preservation makes sense now (2-3 sentences)
2. What happens if you skip preservation (consequences)
3. Best timing for this preservation work (season/urgency)
4. Additional preventive tips to maximize lifespan

Be persuasive but realistic. Focus on cost savings and disaster prevention.`;

    // TODO: Replace with OpenAI or Supabase Edge Function call
    // For now, return a static response based on the system data
    const plan = {
      why_now: `Your ${system.system_type} is ${preservationOpportunity.age} years old (${preservationOpportunity.percentLifespan}% of its expected lifespan). Acting now can extend its life by ${preservationOpportunity.extensionYears} years and save you $${preservationOpportunity.replacementCost.toLocaleString()} in replacement costs.`,
      consequences_of_skipping: `Without preservation, your ${system.system_type} has a ${preservationOpportunity.failureRisk}% chance of failure in the next 2 years. Emergency replacements typically cost 20-40% more than planned ones.`,
      best_timing: preservationOpportunity.priority === "HIGH" ? "Schedule within the next 30 days" : preservationOpportunity.priority === "MEDIUM" ? "Schedule within the next 3 months" : "Schedule within the next 6 months",
      preventive_tips: [
        "Schedule regular professional inspections",
        "Keep maintenance records up to date",
        "Address small issues before they become big problems",
        "Follow manufacturer maintenance recommendations"
      ]
    };

    return plan;
  } catch (error) {
    console.error('Failed to generate AI preservation plan:', error);
    return null;
  }
}