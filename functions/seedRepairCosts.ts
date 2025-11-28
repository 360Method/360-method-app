import { createHelperFromRequest, corsHeaders } from './_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const helper = createHelperFromRequest(req);
    const user = await helper.auth.me();

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403, headers: corsHeaders });
    }

    const repairData = [
      // Plumbing
      {
        repair_category: 'plumbing',
        repair_type: 'leaky_faucet',
        repair_name: 'Leaky Faucet Repair',
        repair_description: 'Replace washers, O-rings, or cartridge in leaking faucet',
        cost_low: 75,
        cost_high: 200,
        cost_average: 125,
        cost_unit: 'per_job',
        typical_duration_hours: 1,
        diy_difficulty: 'easy',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'plumbing',
        repair_type: 'toilet_replacement',
        repair_name: 'Toilet Replacement',
        repair_description: 'Remove old toilet and install new toilet',
        cost_low: 200,
        cost_high: 500,
        cost_average: 350,
        cost_unit: 'per_job',
        typical_duration_hours: 2,
        diy_difficulty: 'moderate',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'plumbing',
        repair_type: 'drain_cleaning',
        repair_name: 'Drain Cleaning',
        repair_description: 'Clear clogged drain using snake or hydro jetting',
        cost_low: 100,
        cost_high: 400,
        cost_average: 200,
        cost_unit: 'per_job',
        typical_duration_hours: 1.5,
        diy_difficulty: 'moderate',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },

      // HVAC
      {
        repair_category: 'hvac',
        repair_type: 'ac_refrigerant_recharge',
        repair_name: 'AC Refrigerant Recharge',
        repair_description: 'Add refrigerant to undercharged AC system',
        cost_low: 150,
        cost_high: 400,
        cost_average: 250,
        cost_unit: 'per_job',
        typical_duration_hours: 1,
        diy_difficulty: 'professional_only',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'hvac',
        repair_type: 'thermostat_replacement',
        repair_name: 'Thermostat Replacement',
        repair_description: 'Remove old and install new programmable thermostat',
        cost_low: 100,
        cost_high: 300,
        cost_average: 175,
        cost_unit: 'per_job',
        typical_duration_hours: 1,
        diy_difficulty: 'easy',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'hvac',
        repair_type: 'furnace_ignitor_replacement',
        repair_name: 'Furnace Ignitor Replacement',
        repair_description: 'Replace failed ignitor in gas furnace',
        cost_low: 150,
        cost_high: 350,
        cost_average: 225,
        cost_unit: 'per_job',
        typical_duration_hours: 1,
        diy_difficulty: 'moderate',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },

      // Electrical
      {
        repair_category: 'electrical',
        repair_type: 'outlet_replacement',
        repair_name: 'Outlet Replacement',
        repair_description: 'Replace damaged or outdated electrical outlet',
        cost_low: 50,
        cost_high: 150,
        cost_average: 85,
        cost_unit: 'per_job',
        typical_duration_hours: 0.5,
        diy_difficulty: 'moderate',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'electrical',
        repair_type: 'circuit_breaker_replacement',
        repair_name: 'Circuit Breaker Replacement',
        repair_description: 'Replace tripped or faulty circuit breaker',
        cost_low: 100,
        cost_high: 250,
        cost_average: 150,
        cost_unit: 'per_job',
        typical_duration_hours: 1,
        diy_difficulty: 'professional_only',
        permits_typically_required: true,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },

      // Roofing
      {
        repair_category: 'roofing',
        repair_type: 'roof_leak_repair',
        repair_name: 'Roof Leak Repair',
        repair_description: 'Locate and repair source of roof leak',
        cost_low: 300,
        cost_high: 1000,
        cost_average: 500,
        cost_unit: 'per_job',
        typical_duration_hours: 3,
        diy_difficulty: 'professional_only',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'roofing',
        repair_type: 'flashing_repair',
        repair_name: 'Flashing Repair',
        repair_description: 'Repair or replace damaged roof flashing',
        cost_low: 200,
        cost_high: 600,
        cost_average: 350,
        cost_unit: 'per_job',
        typical_duration_hours: 2,
        diy_difficulty: 'difficult',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },

      // General
      {
        repair_category: 'general',
        repair_type: 'drywall_patch',
        repair_name: 'Drywall Patch Repair',
        repair_description: 'Patch and repair holes or damage in drywall',
        cost_low: 75,
        cost_high: 300,
        cost_average: 150,
        cost_unit: 'per_job',
        typical_duration_hours: 2,
        diy_difficulty: 'moderate',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      },
      {
        repair_category: 'general',
        repair_type: 'door_lock_replacement',
        repair_name: 'Door Lock Replacement',
        repair_description: 'Replace interior or exterior door lock',
        cost_low: 50,
        cost_high: 200,
        cost_average: 100,
        cost_unit: 'per_job',
        typical_duration_hours: 1,
        diy_difficulty: 'easy',
        permits_typically_required: false,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_averages'
      }
    ];

    const created: string[] = [];
    for (const data of repairData) {
      const record = await helper.asServiceRole.entities.RepairCostReference.create(data);
      created.push((record as any).id);
    }

    return Response.json({
      success: true,
      message: `Seeded ${created.length} repair cost records`,
      created_ids: created
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error seeding repair costs:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
