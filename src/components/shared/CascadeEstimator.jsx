import { base44 } from "@/api/base44Client";

/**
 * Uses AI to estimate cascade risk and cost impact for maintenance issues
 * @param {Object} issueData - The issue details
 * @param {string} issueData.description - Description of the issue
 * @param {string} issueData.system_type - Type of system (HVAC, Plumbing, etc.)
 * @param {string} issueData.severity - Severity level (Urgent, Flag, Monitor)
 * @param {string} issueData.area - Area where issue was found
 * @param {string} issueData.estimated_cost - Cost range selected by user
 * @returns {Promise<Object>} AI-generated estimates with disclaimer
 */
export async function estimateCascadeRisk(issueData) {
  const prompt = `You are a home maintenance expert analyzing a property issue to help homeowners understand cascade risks and cost impacts.

ISSUE DETAILS:
- System Type: ${issueData.system_type}
- Area: ${issueData.area}
- Description: ${issueData.description}
- User-Rated Severity: ${issueData.severity}
- User-Estimated Cost Range: ${issueData.estimated_cost}

Your task is to provide:

1. CASCADE RISK SCORE (1-10): How likely this issue triggers a domino effect of failures
   - 1-3: Low risk, isolated issue
   - 4-6: Moderate risk, could affect related systems
   - 7-9: High risk, likely cascade
   - 10: Critical, immediate cascade potential

2. CASCADE RISK REASON: A clear, specific explanation (2-3 sentences) of:
   - What systems could fail in sequence
   - How the cascade progresses step-by-step
   - The final worst-case scenario
   Format as: "Initial issue → Secondary failure → Tertiary damage → Final outcome ($XX-$XXK)"

3. CURRENT FIX COST: Realistic estimate to fix NOW (in dollars, whole number)
   - Consider labor, materials, typical regional pricing
   - Professional service pricing (not DIY)

4. DELAYED FIX COST: Realistic estimate if delayed 3-6 months (in dollars, whole number)
   - Include cascaded damage
   - Emergency pricing premium
   - Secondary repairs needed

5. COST IMPACT REASON: A clear, specific explanation (2-3 sentences) of:
   - Why delaying increases the cost
   - What additional damage accumulates
   - Why emergency repairs cost more

IMPORTANT GUIDELINES:
- Be realistic with cost estimates based on typical US market rates
- If the user selected a cost range like "$50-200", use that as a baseline for current_fix_cost
- Delayed costs should be 3-10X higher for cascade risks, less for simple issues
- Use specific system knowledge (e.g., HVAC compressor failure, foundation settling)
- Be educational but concise
- Focus on the SPECIFIC issue described, not generic examples

IMPORTANT DISCLAIMER:
All cost estimates are averages based on typical scenarios. Actual costs may vary significantly based on:
- Property condition and accessibility
- Extent of damage discovered during work
- Local contractor rates and market conditions
- Materials required and availability
- Unforeseen complications

Return your analysis as a JSON object.`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          cascade_risk_score: {
            type: "number",
            description: "Risk score from 1-10"
          },
          cascade_risk_reason: {
            type: "string",
            description: "Explanation of cascade pattern with dollar amounts"
          },
          current_fix_cost: {
            type: "number",
            description: "Estimated cost to fix now in dollars"
          },
          delayed_fix_cost: {
            type: "number",
            description: "Estimated cost if delayed in dollars"
          },
          cost_impact_reason: {
            type: "string",
            description: "Explanation of why delaying increases cost"
          }
        }
      }
    });

    return {
      cascade_risk_score: Math.min(10, Math.max(1, result.cascade_risk_score || 5)),
      cascade_risk_reason: result.cascade_risk_reason || "Small issue can lead to larger problems over time, increasing repair costs.",
      current_fix_cost: Math.max(0, result.current_fix_cost || 200),
      delayed_fix_cost: Math.max(0, result.delayed_fix_cost || 2000),
      cost_impact_reason: result.cost_impact_reason || "Delaying repairs allows the problem to worsen, requiring more extensive work and emergency service premiums.",
      cost_disclaimer: "⚠️ Cost estimates are AI-generated averages based on typical scenarios. Actual costs may vary significantly based on property condition, scope of work, contractor rates, and unforeseen complications. Get professional estimates for accurate pricing."
    };
  } catch (error) {
    console.error("AI estimation error:", error);
    
    // Fallback to basic estimates if AI fails
    const severityScores = {
      'Urgent': 9,
      'Flag': 6,
      'Monitor': 3
    };

    const costEstimates = {
      'free': { current: 0, delayed: 500 },
      '1-50': { current: 25, delayed: 1000 },
      '50-200': { current: 125, delayed: 2500 },
      '200-500': { current: 350, delayed: 5000 },
      '500-1500': { current: 1000, delayed: 10000 },
      '1500+': { current: 3000, delayed: 20000 },
      'unknown': { current: 500, delayed: 5000 }
    };

    const costs = costEstimates[issueData.estimated_cost] || { current: 200, delayed: 2000 };

    return {
      cascade_risk_score: severityScores[issueData.severity] || 5,
      cascade_risk_reason: `Small ${issueData.system_type} issues can escalate to larger system failures, requiring emergency repairs at significantly higher costs.`,
      current_fix_cost: costs.current,
      delayed_fix_cost: costs.delayed,
      cost_impact_reason: `Delaying ${issueData.system_type} repairs allows the problem to compound, often requiring emergency service with premium pricing and additional damage restoration.`,
      cost_disclaimer: "⚠️ Cost estimates are AI-generated averages. Actual costs may vary based on property condition, scope of work, and contractor rates. Get professional estimates for accurate pricing."
    };
  }
}

/**
 * Parse user-selected cost range to get midpoint estimate
 */
export function parseCostRange(costRange) {
  const ranges = {
    'free': 0,
    '1-50': 25,
    '50-200': 125,
    '200-500': 350,
    '500-1500': 1000,
    '1500+': 3000,
    'unknown': 500
  };
  return ranges[costRange] || 500;
}