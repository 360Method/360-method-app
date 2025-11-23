export const DEMO_PROPERTY_STRUGGLING = {
  property: {
    id: 'demo-struggling-001',
    address: '1847 Riverside Drive',
    street_address: '1847 Riverside Drive',
    city: 'Vancouver',
    state: 'WA',
    zip_code: '98661',
    property_type: 'Single-Family Home',
    year_built: 2010,
    square_footage: 1850,
    bedrooms: 3,
    bathrooms: 2,
    stories: 'Single-Story',
    foundation_type: 'Concrete Slab',
    garage_type: 'Attached 2-car',
    is_demo: true,
    demo_type: 'struggling',
    baseline_completion: 20,
    health_score: 62,
    last_inspection_date: null,
    total_maintenance_spent: 0,
    estimated_disasters_prevented: 0,
    certificationLevel: null,
    breakdown: { condition: 26, maintenance: 18, improvement: 18 },
    created_date: '2025-01-01T00:00:00Z'
  },
  
  systems: [
    {
      id: 'demo-s-sys-001',
      property_id: 'demo-struggling-001',
      system_type: 'HVAC System',
      nickname: 'Main HVAC',
      brand_model: 'Carrier 3-Ton Heat Pump',
      installation_year: 2007,
      condition: 'Fair',
      condition_notes: '18 years old (avg lifespan 15-20). No service records. Running but making noise.',
      warning_signs_present: ['Unusual noise', 'No maintenance history', 'Aging beyond typical lifespan'],
      last_service_date: null,
      next_service_date: null,
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 6500,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-002',
      property_id: 'demo-struggling-001',
      system_type: 'Water & Sewer/Septic',
      nickname: 'Water Heater',
      brand_model: 'Rheem 40-Gal Gas',
      installation_year: 2009,
      condition: 'Fair',
      condition_notes: '16 years old (avg lifespan 10-15). Never been serviced. Still works but age is concerning.',
      warning_signs_present: ['Past typical lifespan', 'No maintenance history', 'Unknown condition'],
      last_service_date: null,
      next_service_date: null,
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 1200,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-003',
      property_id: 'demo-struggling-001',
      system_type: 'Roof System',
      nickname: 'Main Roof',
      brand_model: '3-Tab Asphalt Shingles',
      installation_year: 2010,
      condition: 'Fair',
      condition_notes: '15 years old. Some missing shingles. Gutters clogged. No recent inspection.',
      warning_signs_present: ['Missing shingles', 'Clogged gutters', 'No inspection history'],
      last_service_date: null,
      next_service_date: null,
      estimated_lifespan_years: 20,
      replacement_cost_estimate: 9000,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-004',
      property_id: 'demo-struggling-001',
      system_type: 'Electrical System',
      nickname: 'Main Panel',
      brand_model: '150A Main Panel',
      installation_year: 2010,
      condition: 'Poor',
      condition_notes: 'GFCI outlets near water NOT working. Some outlets not functioning. No recent inspection.',
      warning_signs_present: ['Failed GFCI outlets', 'Non-functional outlets', 'Safety hazard'],
      last_service_date: null,
      estimated_lifespan_years: 40,
      replacement_cost_estimate: 3500,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-005',
      property_id: 'demo-struggling-001',
      system_type: 'CO Detector',
      nickname: 'Carbon Monoxide Detectors',
      brand_model: 'None',
      installation_year: null,
      condition: 'Urgent',
      condition_notes: 'NO CARBON MONOXIDE DETECTORS INSTALLED. Critical safety issue.',
      warning_signs_present: ['No CO detectors', 'Life safety hazard'],
      last_service_date: null,
      estimated_lifespan_years: 7,
      replacement_cost_estimate: 100,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-006',
      property_id: 'demo-struggling-001',
      system_type: 'Smoke Detector',
      nickname: 'Smoke Detectors',
      brand_model: 'Battery-Powered (unknown age)',
      installation_year: null,
      condition: 'Poor',
      condition_notes: 'Unknown age. Batteries likely dead. Need replacement.',
      warning_signs_present: ['Unknown age', 'Unknown battery status', 'Safety concern'],
      last_service_date: null,
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 200,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    }
  ],

  tasks: [],

  inspections: [],

  maintenanceHistory: [],

  preserveSchedules: [
    {
      id: 'demo-s-pres-001',
      season: 'Urgent Priority',
      title: 'Critical Interventions Needed',
      description: 'These aren\'t routine tasks - they\'re strategic interventions that prevent cascade failures and expensive replacements.',
      interventions: [
        {
          id: 'pres-int-s-001',
          system_id: 'demo-s-sys-001',
          system_name: 'HVAC Heat Pump',
          intervention: 'Professional Deep Cleaning & Tune-Up',
          description: '18-year-old system needs immediate deep service. Without it, system will fail within 1-2 years.',
          current_age_years: 18,
          estimated_lifespan_without: 19,
          estimated_lifespan_with: 22,
          years_extended: 3,
          investment_cost: 850,
          replacement_cost_avoided: 6500,
          roi_multiplier: 7.6,
          frequency: 'Immediate + bi-annual going forward',
          next_due: 'ASAP',
          status: 'URGENT',
          why_worth_it: '$850 investment extends dying HVAC 3 more years, avoiding $6,500 emergency replacement mid-winter.',
          not_routine_because: 'This is beyond routine - it\'s saving a failing system from imminent death.'
        },
        {
          id: 'pres-int-s-002',
          system_id: 'demo-s-sys-002',
          system_name: 'Water Heater',
          intervention: 'Emergency Anode Rod + Flush Before Total Failure',
          description: '16-year-old tank on borrowed time. This intervention could extend life 1-2 years while you budget for replacement.',
          current_age_years: 16,
          estimated_lifespan_without: 16,
          estimated_lifespan_with: 18,
          years_extended: 2,
          investment_cost: 350,
          replacement_cost_avoided: 1200,
          roi_multiplier: 3.4,
          frequency: 'One-time emergency intervention',
          next_due: 'Within 30 days',
          status: 'URGENT',
          why_worth_it: '$350 buys you 1-2 years to budget for replacement, preventing $2,500 emergency scenario.',
          not_routine_because: 'Emergency life extension on a failing asset. Buys you planning time.'
        },
        {
          id: 'pres-int-s-003',
          system_id: 'demo-s-sys-003',
          system_name: 'Roof',
          intervention: 'Targeted Shingle Replacement + Emergency Sealing',
          description: 'Missing shingles allowing water infiltration. Seal now to prevent $3K-$8K water damage.',
          current_age_years: 15,
          estimated_lifespan_without: 17,
          estimated_lifespan_with: 20,
          years_extended: 3,
          investment_cost: 850,
          replacement_cost_avoided: 9000,
          roi_multiplier: 10.6,
          frequency: 'Immediate repair',
          next_due: 'Before next rain',
          status: 'URGENT',
          why_worth_it: '$850 prevents water damage cascade and extends roof 3 years.',
          not_routine_because: 'Emergency intervention preventing catastrophic failure.'
        }
      ],
      total_investment: 2050,
      total_replacement_costs_avoided: 16700,
      average_roi: 8.1,
      why_preserve_matters: `
        You're in reactive mode. Every system is a ticking time bomb.
        
        🚨 Without PRESERVE:
        • HVAC dies mid-winter: $6,500 emergency
        • Water heater fails: $2,500 Sunday emergency
        • Roof leaks damage interior: $8,000 repair
        
        Total if you do nothing: $17,000+ in the next 12-24 months
        
        💡 With $2,050 in Strategic Interventions:
        • Extend HVAC 3 years
        • Buy time on water heater 
        • Seal roof before cascade
        
        This isn't maintenance - it's triage. Stop the bleeding, buy yourself time.
      `
    }
  ],

  upgradeProjects: [
    {
      id: 'demo-s-upg-001',
      property_id: 'demo-struggling-001',
      title: 'Add CO Detectors (Life Safety)',
      category: 'Safety',
      description: 'Install 3 carbon monoxide detectors per code requirements',
      status: 'Identified',
      priority: 10,
      
      budget: 100,
      spent: 0,
      remaining: 100,
      
      startDate: null,
      targetCompletion: null,
      
      estimatedAnnualSavings: 0,
      resaleValueIncrease: 0,
      
      milestones: [
        {
          id: 'milestone-s1',
          title: 'Purchase 3 CO detectors',
          status: 'pending',
          targetDate: null,
          cost: 100
        },
        {
          id: 'milestone-s2',
          title: 'Install detectors',
          status: 'pending',
          targetDate: null,
          cost: 0
        },
        {
          id: 'milestone-s3',
          title: 'Test all units',
          status: 'pending',
          targetDate: null,
          cost: 0
        }
      ],
      
      why_worth_it: `
        This isn't about ROI - it's about not dying.
        
        🚨 CRITICAL:
        • You have gas appliances
        • You have NO carbon monoxide detectors
        • CO is silent, odorless, deadly
        
        Cost: $100
        Value: Your life
        
        Do this TODAY.
      `,
      
      notes: 'URGENT - Life safety issue. Must be completed immediately.'
    }
  ],

  stats: {
    total_systems: 6,
    systems_good: 0,
    systems_flagged: 4,
    systems_urgent: 2,
    total_tasks: 0,
    tasks_urgent: 0,
    tasks_high: 0,
    tasks_medium: 0,
    tasks_low: 0,
    total_estimated_savings: 0,
    health_score: 62
  }
};