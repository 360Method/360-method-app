import { base44 } from "@/api/base44Client";

/**
 * Estimates cascade risk, cost impact, and labor hours for a maintenance issue
 * Uses AI to analyze the description, system type, severity, and area
 */
export async function estimateCascadeRisk({ description, system_type, severity, area, estimated_cost }) {
  try {
    const prompt = `You are an expert home maintenance advisor analyzing a potential issue.

ISSUE DETAILS:
- System: ${system_type}
- Severity: ${severity}
- Area: ${area}
- Description: ${description}
- User's estimated cost: ${estimated_cost}

Analyze this issue and provide:

1. CASCADE RISK SCORE (1-10):
   - How likely is this to trigger other failures?
   - What systems could cascade if left unaddressed?
   - Score 1-3: Low risk, isolated issue
   - Score 4-6: Moderate risk, could affect 1-2 other systems
   - Score 7-10: High risk, could trigger chain reaction

2. CASCADE RISK REASON:
   - Explain what systems could fail and how the cascade happens
   - Be specific about the chain reaction
   - Example: "Leaky roof leads to water damage in attic insulation, then ceiling damage, then mold growth"

3. CURRENT FIX COST:
   - Realistic cost to fix NOW (in USD, whole number)
   - Consider: parts, labor, typical market rates
   - Be conservative but realistic
   - Use the user's estimate as a reference point

4. DELAYED FIX COST:
   - Realistic cost if delayed 6-12 months (in USD, whole number)
   - Factor in: worsening damage, additional systems affected, emergency pricing
   - Be realistic about cost escalation

5. COST IMPACT REASON:
   - Explain WHY delaying makes it more expensive
   - What additional damage/work is created by waiting?

6. LABOR HOURS ESTIMATE:
   - Provide BOTH minimum and maximum hours for an average DIY homeowner or handyman
   - Consider: skill level required, access difficulty, typical work pace
   - Format: Return two separate numbers (min_hours and max_hours)
   - Example: Simple faucet repair = 1-2 hours, HVAC filter = 0.25-0.5 hours, Roof patch = 4-8 hours

Be realistic and practical. Don't fear-monger, but don't minimize real risks either.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          cascade_risk_score: { type: "number" },
          cascade_risk_reason: { type: "string" },
          current_fix_cost: { type: "number" },
          delayed_fix_cost: { type: "number" },
          cost_impact_reason: { type: "string" },
          min_hours: { type: "number" },
          max_hours: { type: "number" }
        },
        required: [
          "cascade_risk_score",
          "cascade_risk_reason",
          "current_fix_cost",
          "delayed_fix_cost",
          "cost_impact_reason",
          "min_hours",
          "max_hours"
        ]
      }
    });

    // Add disclaimer about cost estimates
    return {
      ...result,
      cost_disclaimer: "💡 Cost estimates are AI-generated averages based on typical market rates and may vary by location, contractor, and specific conditions. Always get multiple quotes for major work."
    };
  } catch (error) {
    console.error('Cascade risk estimation failed:', error);
    throw error;
  }
}