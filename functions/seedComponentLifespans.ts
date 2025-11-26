import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const lifespanData = [
      // Roofing
      {
        component_category: 'roofing',
        component_type: 'asphalt_shingle_roof',
        component_name: 'Asphalt Shingle Roof',
        expected_lifespan_years_min: 15,
        expected_lifespan_years_max: 30,
        expected_lifespan_years_avg: 20,
        factors_affecting_lifespan: ['Climate', 'Ventilation', 'Installation quality', 'Maintenance'],
        maintenance_impact: 'moderate',
        climate_impact: 'high',
        usage_impact: 'low',
        failure_warning_signs: ['Curling shingles', 'Missing granules', 'Cracked shingles', 'Water stains inside'],
        replacement_cost_low: 5000,
        replacement_cost_high: 15000,
        replacement_cost_avg: 8500,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      {
        component_category: 'roofing',
        component_type: 'metal_roof',
        component_name: 'Metal Roof',
        expected_lifespan_years_min: 40,
        expected_lifespan_years_max: 70,
        expected_lifespan_years_avg: 50,
        factors_affecting_lifespan: ['Material quality', 'Installation', 'Fasteners', 'Climate'],
        maintenance_impact: 'low',
        climate_impact: 'moderate',
        usage_impact: 'low',
        failure_warning_signs: ['Loose panels', 'Rust spots', 'Loose fasteners', 'Panel separation'],
        replacement_cost_low: 10000,
        replacement_cost_high: 25000,
        replacement_cost_avg: 16000,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      
      // HVAC
      {
        component_category: 'hvac',
        component_type: 'central_ac',
        component_name: 'Central Air Conditioning',
        expected_lifespan_years_min: 12,
        expected_lifespan_years_max: 20,
        expected_lifespan_years_avg: 15,
        factors_affecting_lifespan: ['Maintenance', 'Usage intensity', 'Climate', 'Installation quality'],
        maintenance_impact: 'high',
        climate_impact: 'high',
        usage_impact: 'high',
        failure_warning_signs: ['Weak airflow', 'Warm air', 'Strange noises', 'High energy bills', 'Frequent cycling'],
        replacement_cost_low: 3000,
        replacement_cost_high: 7000,
        replacement_cost_avg: 5000,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      {
        component_category: 'hvac',
        component_type: 'furnace_gas',
        component_name: 'Gas Furnace',
        expected_lifespan_years_min: 15,
        expected_lifespan_years_max: 30,
        expected_lifespan_years_avg: 20,
        factors_affecting_lifespan: ['Maintenance', 'Usage', 'Installation', 'Air filtration'],
        maintenance_impact: 'high',
        climate_impact: 'moderate',
        usage_impact: 'high',
        failure_warning_signs: ['Yellow pilot light', 'Frequent repairs', 'Uneven heating', 'Carbon monoxide detector alerts'],
        replacement_cost_low: 2000,
        replacement_cost_high: 5000,
        replacement_cost_avg: 3500,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      {
        component_category: 'hvac',
        component_type: 'heat_pump',
        component_name: 'Heat Pump',
        expected_lifespan_years_min: 10,
        expected_lifespan_years_max: 15,
        expected_lifespan_years_avg: 12,
        factors_affecting_lifespan: ['Maintenance', 'Climate', 'Usage', 'Installation'],
        maintenance_impact: 'high',
        climate_impact: 'high',
        usage_impact: 'high',
        failure_warning_signs: ['Ice buildup', 'Strange sounds', 'Reduced efficiency', 'Short cycling'],
        replacement_cost_low: 4000,
        replacement_cost_high: 8000,
        replacement_cost_avg: 6000,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      
      // Plumbing
      {
        component_category: 'plumbing',
        component_type: 'water_heater_tank',
        component_name: 'Tank Water Heater',
        expected_lifespan_years_min: 8,
        expected_lifespan_years_max: 12,
        expected_lifespan_years_avg: 10,
        factors_affecting_lifespan: ['Water quality', 'Maintenance', 'Usage', 'Installation'],
        maintenance_impact: 'high',
        climate_impact: 'low',
        usage_impact: 'moderate',
        failure_warning_signs: ['Rusty water', 'Rumbling sounds', 'Leaks', 'Inconsistent temperature'],
        replacement_cost_low: 800,
        replacement_cost_high: 2000,
        replacement_cost_avg: 1200,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      {
        component_category: 'plumbing',
        component_type: 'water_heater_tankless',
        component_name: 'Tankless Water Heater',
        expected_lifespan_years_min: 15,
        expected_lifespan_years_max: 20,
        expected_lifespan_years_avg: 18,
        factors_affecting_lifespan: ['Water quality', 'Maintenance', 'Usage', 'Installation'],
        maintenance_impact: 'high',
        climate_impact: 'low',
        usage_impact: 'moderate',
        failure_warning_signs: ['Mineral buildup', 'Inconsistent temperature', 'Error codes', 'Reduced flow'],
        replacement_cost_low: 1500,
        replacement_cost_high: 3500,
        replacement_cost_avg: 2500,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      
      // Appliances
      {
        component_category: 'appliances',
        component_type: 'refrigerator',
        component_name: 'Refrigerator',
        expected_lifespan_years_min: 10,
        expected_lifespan_years_max: 20,
        expected_lifespan_years_avg: 14,
        factors_affecting_lifespan: ['Usage', 'Maintenance', 'Quality', 'Environment'],
        maintenance_impact: 'moderate',
        climate_impact: 'low',
        usage_impact: 'high',
        failure_warning_signs: ['Warm interior', 'Excessive frost', 'Strange noises', 'Water leaks'],
        replacement_cost_low: 500,
        replacement_cost_high: 3000,
        replacement_cost_avg: 1200,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      {
        component_category: 'appliances',
        component_type: 'dishwasher',
        component_name: 'Dishwasher',
        expected_lifespan_years_min: 7,
        expected_lifespan_years_max: 12,
        expected_lifespan_years_avg: 9,
        factors_affecting_lifespan: ['Usage', 'Water quality', 'Maintenance', 'Quality'],
        maintenance_impact: 'moderate',
        climate_impact: 'low',
        usage_impact: 'high',
        failure_warning_signs: ['Poor cleaning', 'Leaks', 'Won\'t drain', 'Strange noises'],
        replacement_cost_low: 300,
        replacement_cost_high: 1500,
        replacement_cost_avg: 700,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      
      // Exterior
      {
        component_category: 'exterior',
        component_type: 'vinyl_siding',
        component_name: 'Vinyl Siding',
        expected_lifespan_years_min: 20,
        expected_lifespan_years_max: 40,
        expected_lifespan_years_avg: 30,
        factors_affecting_lifespan: ['Climate', 'Installation', 'Maintenance', 'Quality'],
        maintenance_impact: 'low',
        climate_impact: 'high',
        usage_impact: 'low',
        failure_warning_signs: ['Cracks', 'Warping', 'Fading', 'Loose panels'],
        replacement_cost_low: 3000,
        replacement_cost_high: 12000,
        replacement_cost_avg: 7000,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      },
      {
        component_category: 'exterior',
        component_type: 'wood_deck',
        component_name: 'Wood Deck',
        expected_lifespan_years_min: 10,
        expected_lifespan_years_max: 30,
        expected_lifespan_years_avg: 15,
        factors_affecting_lifespan: ['Maintenance', 'Wood type', 'Climate', 'Installation'],
        maintenance_impact: 'high',
        climate_impact: 'high',
        usage_impact: 'moderate',
        failure_warning_signs: ['Rot', 'Loose boards', 'Splinters', 'Wobbly railings'],
        replacement_cost_low: 4000,
        replacement_cost_high: 15000,
        replacement_cost_avg: 8000,
        cost_last_updated: new Date().toISOString().split('T')[0],
        data_source: 'industry_standards'
      }
    ];

    const created = [];
    for (const data of lifespanData) {
      const record = await base44.asServiceRole.entities.ComponentLifespan.create(data);
      created.push(record.id);
    }

    return Response.json({
      success: true,
      message: `Seeded ${created.length} component lifespan records`,
      created_ids: created
    });
  } catch (error) {
    console.error('Error seeding component lifespans:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});