import React from "react";
import { integrations } from "@/api/supabaseClient";

/**
 * AI-powered estimation for cart items
 * Estimates hours and cost ranges based on task details
 */
export async function estimateCartItems(items, property) {
  const prompt = `You are a home service estimator. Analyze these service requests and provide realistic time and cost estimates.

PROPERTY: ${property.address}
CLIMATE ZONE: ${property.climate_zone || 'Not specified'}
PROPERTY TYPE: ${property.property_type || 'Not specified'}

SERVICE REQUESTS (${items.length}):
${items.map((item, idx) => `
${idx + 1}. ${item.title}
   System: ${item.system_type || 'General'}
   Priority: ${item.priority || 'Medium'}
   Description: ${item.description}
   Photos: ${item.photo_urls?.length || 0}
   Customer Notes: ${item.customer_notes || 'None'}
`).join('\n')}

For EACH service request, provide:

1. ESTIMATED_HOURS: Realistic hours for professional completion
   - Include travel, setup, work, cleanup
   - Factor in typical conditions and complications
   - Be realistic, not optimistic

2. COST_MIN: Minimum cost (best case scenario)
   - Use $150/hour base rate
   - Include materials estimate
   - Account for regional factors

3. COST_MAX: Maximum cost (with typical complications)
   - Use $150/hour base rate
   - Include 20-30% buffer for unforeseen issues
   - Account for potential additional work discovered

4. WORK_DESCRIPTION: Brief 1-sentence summary of what will be done

5. MATERIALS_NOTE: Brief note on materials needed (if applicable)

IMPORTANT GUIDELINES:
- Be realistic with time estimates (buffer for real-world conditions)
- Cost = (Hours × $150) + Materials
- Min = best case, Max = with typical complications
- Emergency priority = add 50% for urgency premium
- High priority = add 25% premium
- If photos provided = more accurate estimate
- If detailed notes provided = can be more precise

COST DISCLAIMER:
All estimates are based on typical scenarios and standard rates. Actual costs may vary based on:
- Actual site conditions and accessibility
- Materials required and current pricing
- Scope changes discovered during work
- Contractor availability and scheduling
- Unforeseen complications

Return JSON array with estimates for each item in order.`;

  try {
    const result = await integrations.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          estimates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item_index: { type: "number" },
                estimated_hours: { type: "number" },
                cost_min: { type: "number" },
                cost_max: { type: "number" },
                work_description: { type: "string" },
                materials_note: { type: "string" }
              }
            }
          },
          bundle_discount_suggestion: {
            type: "string",
            description: "Suggestion for bundling savings if applicable"
          },
          scheduling_suggestion: {
            type: "string",
            description: "Suggestion for optimal scheduling"
          }
        }
      }
    });

    return {
      estimates: result.estimates || [],
      bundle_discount_suggestion: result.bundle_discount_suggestion,
      scheduling_suggestion: result.scheduling_suggestion,
      disclaimer: "⚠️ All estimates are AI-generated based on typical scenarios and $150/hour base rate. Actual costs may vary based on site conditions, materials pricing, scope changes, and unforeseen complications. Final pricing provided after operator site assessment."
    };
  } catch (error) {
    console.error("AI estimation error:", error);
    
    // Fallback estimates
    return {
      estimates: items.map((item, idx) => {
        const baseHours = item.priority === 'Emergency' ? 2 : 
                         item.priority === 'High' ? 3 : 4;
        const urgencyMultiplier = item.priority === 'Emergency' ? 1.5 : 
                                  item.priority === 'High' ? 1.25 : 1.0;
        
        return {
          item_index: idx,
          estimated_hours: baseHours * urgencyMultiplier,
          cost_min: Math.round(baseHours * 150 * urgencyMultiplier),
          cost_max: Math.round(baseHours * 150 * urgencyMultiplier * 1.3),
          work_description: `Professional ${item.system_type || 'general'} service`,
          materials_note: "Materials costs will be determined on-site"
        };
      }),
      bundle_discount_suggestion: items.length >= 3 ? "Consider bundling for 10-15% savings" : null,
      scheduling_suggestion: "Schedule during off-peak season for best availability",
      disclaimer: "⚠️ Estimates are AI-generated averages. Actual costs vary based on site conditions and materials."
    };
  }
}