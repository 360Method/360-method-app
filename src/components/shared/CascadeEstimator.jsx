// MIGRATED: AI features will use OpenAI/Supabase Edge Functions
// TODO: Connect to AI service for real-time analysis

// Cascade risk lookup tables based on system type and severity
const CASCADE_RISK_DATA = {
  "HVAC System": { baseRisk: 5, costMultiplier: 1.4 },
  "Plumbing System": { baseRisk: 7, costMultiplier: 1.8 },
  "Roof System": { baseRisk: 8, costMultiplier: 2.0 },
  "Electrical System": { baseRisk: 6, costMultiplier: 1.5 },
  "Foundation & Structure": { baseRisk: 9, costMultiplier: 2.5 },
  "Water & Sewer/Septic": { baseRisk: 7, costMultiplier: 1.6 },
  "default": { baseRisk: 5, costMultiplier: 1.3 }
};

const SEVERITY_MULTIPLIER = {
  "Low": 0.5,
  "Medium": 1.0,
  "High": 1.5,
  "Critical": 2.0,
  "default": 1.0
};

/**
 * Estimates cascade risk, cost impact, and labor hours for a maintenance issue
 * Uses rule-based logic (TODO: Replace with AI service)
 */
export async function estimateCascadeRisk({ description, system_type, severity, area, estimated_cost }) {
  try {
    // Get base data for this system type
    const systemData = CASCADE_RISK_DATA[system_type] || CASCADE_RISK_DATA["default"];
    const severityMult = SEVERITY_MULTIPLIER[severity] || SEVERITY_MULTIPLIER["default"];
    
    // Calculate cascade risk score (1-10)
    const cascade_risk_score = Math.min(10, Math.round(systemData.baseRisk * severityMult));
    
    // Calculate costs
    const baseCost = estimated_cost || 500;
    const current_fix_cost = Math.round(baseCost);
    const delayed_fix_cost = Math.round(baseCost * systemData.costMultiplier * severityMult);
    
    // Estimate labor hours based on cost (rough estimate: $75-100/hr labor)
    const min_hours = Math.max(0.5, Math.round(baseCost / 150 * 10) / 10);
    const max_hours = Math.max(1, Math.round(baseCost / 75 * 10) / 10);
    
    // Generate reasons
    const cascade_risk_reason = `${system_type} issues with ${severity?.toLowerCase() || 'moderate'} severity can affect connected systems. ${
      cascade_risk_score >= 7 ? "High risk of triggering additional failures if left unaddressed." :
      cascade_risk_score >= 4 ? "Moderate risk - could affect 1-2 other systems over time." :
      "Lower risk, but should still be addressed to prevent escalation."
    }`;
    
    const cost_impact_reason = `Delaying repairs allows the issue to worsen, potentially affecting additional components. Emergency repairs typically cost ${Math.round((systemData.costMultiplier - 1) * 100)}% more due to urgency and expanded scope.`;

    return {
      cascade_risk_score,
      cascade_risk_reason,
      current_fix_cost,
      delayed_fix_cost,
      cost_impact_reason,
      min_hours,
      max_hours,
      cost_disclaimer: "💡 Cost estimates are based on typical market rates and may vary by location, contractor, and specific conditions. Always get multiple quotes for major work."
    };
  } catch (error) {
    console.error('Cascade risk estimation failed:', error);
    throw error;
  }
}