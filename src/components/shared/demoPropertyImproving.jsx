export const DEMO_PROPERTY_IMPROVING = {
  property: {
    id: 'demo-improving-001',
    address: '1847 Riverside Drive',
    street_address: '1847 Riverside Drive',
    city: 'Camas',
    state: 'WA',
    zip_code: '98607',
    property_type: 'Single-Family Home',
    year_built: 2010,
    square_footage: 2100,
    bedrooms: 3,
    bathrooms: 2,
    stories: 'Two-Story',
    foundation_type: 'Crawlspace',
    garage_type: 'Attached 2-car',
    is_demo: true,
    demo_type: 'improving',
    baseline_completion: 87,
    health_score: 78,
    last_inspection_date: '2025-10-01',
    total_maintenance_spent: 1850,
    estimated_disasters_prevented: 3200,
    certificationLevel: 'bronze',
    breakdown: { condition: 35, maintenance: 28, improvement: 15 },
    quickWins: [
      { action: 'Complete all 4 quarterly checks this year', points: 4, cost: 'Free' },
      { action: 'Add smart thermostat', points: 1, cost: '$250' },
      { action: 'Annual HVAC service', points: 2, cost: '$150' }
    ],
    created_date: '2024-06-01T00:00:00Z'
  },
  
  systems: [
    {
      id: 'demo-i-sys-001',
      property_id: 'demo-improving-001',
      system_type: 'HVAC System',
      nickname: 'Main Furnace',
      brand_model: 'Carrier Infinity 96',
      installation_year: 2012,
      condition: 'Good',
      condition_notes: 'Serviced annually. Last service: May 2025. Filter changed quarterly.',
      last_service_date: '2025-05-15',
      next_service_date: '2025-11-15',
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 7000,
      created_date: '2024-06-01T00:00:00Z'
    },
    {
      id: 'demo-i-sys-002',
      property_id: 'demo-improving-001',
      system_type: 'Water & Sewer/Septic',
      nickname: 'Water Heater',
      brand_model: 'Bradford White 50-Gal',
      installation_year: 2014,
      condition: 'Fair',
      condition_notes: 'Some sediment buildup. Needs flush. Plan replacement in 2-3 years.',
      warning_signs_present: ['Sediment buildup', 'Approaching end of life'],
      last_service_date: '2024-08-10',
      estimated_lifespan_years: 12,
      replacement_cost_estimate: 1500,
      created_date: '2024-06-01T00:00:00Z'
    },
    {
      id: 'demo-i-sys-003',
      property_id: 'demo-improving-001',
      system_type: 'Roof System',
      nickname: 'Main Roof',
      brand_model: 'GAF Timberline HD Shingles',
      installation_year: 2010,
      condition: 'Good',
      condition_notes: '25-year shingles. Few missing shingles replaced last year.',
      last_service_date: '2024-09-15',
      estimated_lifespan_years: 25,
      replacement_cost_estimate: 10000,
      created_date: '2024-06-01T00:00:00Z'
    },
    {
      id: 'demo-i-sys-004',
      property_id: 'demo-improving-001',
      system_type: 'Smoke Detector',
      nickname: 'All Smoke Detectors (5)',
      brand_model: 'Kidde Battery-Powered',
      installation_year: 2020,
      condition: 'Good',
      condition_notes: 'Batteries changed twice yearly. All units tested monthly.',
      last_service_date: '2025-10-01',
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 150,
      created_date: '2024-06-01T00:00:00Z'
    },
    {
      id: 'demo-i-sys-005',
      property_id: 'demo-improving-001',
      system_type: 'Electrical System',
      nickname: 'Main Panel',
      brand_model: 'Square D 150A Panel',
      installation_year: 2010,
      condition: 'Good',
      condition_notes: '150-amp service. All circuits labeled properly.',
      estimated_lifespan_years: 40,
      replacement_cost_estimate: 2500,
      created_date: '2024-06-01T00:00:00Z'
    },
    {
      id: 'demo-i-sys-006',
      property_id: 'demo-improving-001',
      system_type: 'Foundation & Structure',
      nickname: 'Crawlspace Foundation',
      brand_model: 'Concrete Block Foundation',
      installation_year: 2010,
      condition: 'Fair',
      condition_notes: 'Minor moisture issues. Vapor barrier needs replacement.',
      warning_signs_present: ['Moisture in crawlspace'],
      estimated_lifespan_years: 100,
      replacement_cost_estimate: 40000,
      created_date: '2024-06-01T00:00:00Z'
    }
  ],

  tasks: [
    {
      id: 'demo-i-task-001',
      property_id: 'demo-improving-001',
      title: 'Fall Gutter Cleaning',
      description: 'Clean gutters before heavy rain season',
      system_type: 'Gutters',
      priority: 'Medium',
      current_fix_cost: 150,
      contractor_cost: 150,
      status: 'Identified',
      created_date: '2025-10-01T00:00:00Z'
    },
    {
      id: 'demo-i-task-002',
      property_id: 'demo-improving-001',
      title: 'Replace Crawlspace Vapor Barrier',
      description: 'Old vapor barrier degraded. Replace to prevent moisture damage.',
      system_type: 'Foundation',
      priority: 'High',
      cascade_risk_score: 7,
      current_fix_cost: 800,
      delayed_fix_cost: 4000,
      contractor_cost: 800,
      status: 'Identified',
      created_date: '2025-09-15T00:00:00Z'
    },
    {
      id: 'demo-i-task-003',
      property_id: 'demo-improving-001',
      title: 'Schedule Fall HVAC Service',
      description: 'Annual furnace service before heating season',
      system_type: 'HVAC',
      priority: 'High',
      current_fix_cost: 150,
      contractor_cost: 150,
      status: 'Scheduled',
      scheduled_date: '2025-11-15',
      created_date: '2025-10-01T00:00:00Z'
    },
    {
      id: 'demo-i-task-004',
      property_id: 'demo-improving-001',
      title: 'Water Heater Flush',
      description: 'Annual sediment flush to extend life',
      system_type: 'Plumbing',
      priority: 'Medium',
      current_fix_cost: 120,
      contractor_cost: 120,
      status: 'Identified',
      created_date: '2025-10-01T00:00:00Z'
    }
  ],

  inspections: [
    {
      id: 'demo-i-insp-001',
      property_id: 'demo-improving-001',
      inspection_type: 'Fall Check',
      season: 'Fall',
      year: 2025,
      inspection_date: '2025-10-01',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 2,
      urgent_count: 0,
      flag_count: 2,
      monitor_count: 0,
      created_date: '2025-10-01T10:00:00Z'
    }
  ],

  maintenanceHistory: [
    {
      id: 'demo-i-hist-001',
      property_id: 'demo-improving-001',
      system_id: 'demo-i-sys-001',
      date: '2025-05-15',
      type: 'Service',
      title: 'Spring HVAC Service',
      description: 'Annual furnace maintenance',
      cost: 150,
      completed_by: 'Pro Heating',
      prevented_cost: 600
    },
    {
      id: 'demo-i-hist-002',
      property_id: 'demo-improving-001',
      system_id: 'demo-i-sys-003',
      date: '2024-09-15',
      type: 'Repair',
      title: 'Roof Shingle Replacement',
      description: 'Replaced 12 damaged shingles',
      cost: 350,
      completed_by: 'ABC Roofing',
      prevented_cost: 2000
    }
  ],

  preserveSchedules: [
    {
      id: 'demo-i-pres-001',
      season: 'Recommended Interventions',
      title: 'Strategic Life Extensions to Reach Silver (85+)',
      description: 'These high-ROI interventions extend system life and move you toward Silver certification.',
      interventions: [
        {
          id: 'pres-int-i-001',
          system_id: 'demo-i-sys-001',
          system_name: 'HVAC Furnace',
          intervention: 'Add Bi-Annual Service Program',
          description: 'Currently serviced once yearly. Upgrading to twice yearly extends furnace life 2-3 years.',
          current_age_years: 13,
          estimated_lifespan_without: 15,
          estimated_lifespan_with: 18,
          years_extended: 3,
          investment_cost: 330,
          replacement_cost_avoided: 7000,
          roi_multiplier: 21.2,
          frequency: 'Spring & Fall',
          next_due: '2026-01-15',
          status: 'Recommended',
          why_worth_it: 'Doubles service frequency extends furnace 3 years. $330/year avoids $7K replacement.',
          not_routine_because: 'Upgrade from annual to bi-annual is strategic preservation, not routine.'
        },
        {
          id: 'pres-int-i-002',
          system_id: 'demo-i-sys-002',
          system_name: 'Water Heater',
          intervention: 'Anode Rod Replacement + Anti-Scale Treatment',
          description: 'Proactive anode replacement with scale treatment extends water heater 3+ years.',
          current_age_years: 11,
          estimated_lifespan_without: 12,
          estimated_lifespan_with: 15,
          years_extended: 3,
          investment_cost: 380,
          replacement_cost_avoided: 1500,
          roi_multiplier: 3.9,
          frequency: 'One-time intervention',
          next_due: '2026-03-01',
          status: 'High Priority',
          why_worth_it: 'Water heater at end of life. $380 extends it 3 years, preventing emergency replacement.',
          not_routine_because: 'Strategic anode replacement, not routine flush.'
        },
        {
          id: 'pres-int-i-003',
          system_id: 'demo-i-sys-006',
          system_name: 'Crawlspace Foundation',
          intervention: 'Vapor Barrier Replacement + Dehumidifier',
          description: 'New vapor barrier + dehumidifier prevents moisture damage and extends foundation life.',
          current_age_years: 15,
          estimated_lifespan_without: 100,
          estimated_lifespan_with: 100,
          years_extended: 0,
          investment_cost: 1200,
          replacement_cost_avoided: 40000,
          roi_multiplier: 33.3,
          frequency: 'One-time intervention',
          next_due: '2026-04-01',
          status: 'Recommended',
          why_worth_it: 'Prevents $15K-$40K foundation damage from moisture. Critical intervention.',
          not_routine_because: 'Major structural preservation preventing cascade failure.'
        }
      ],
      total_investment: 1910,
      total_replacement_costs_avoided: 48500,
      average_roi: 25.4,
      why_preserve_matters: `
        You're doing okay, but you're still vulnerable to surprises.
        
        🎯 The Bronze → Silver Gap:
        • Bronze (78): You maintain reactively, some tracking
        • Silver (85): You preserve strategically, nothing surprises you
        
        💡 These 3 Interventions:
        • $1,910 investment
        • Extends 3 major systems 3-6 years
        • Prevents $8K-$15K in emergency replacements
        • Moves you from "pretty good" to "dialed in"
        
        This is the difference between homeowner and strategic operator.
      `
    }
  ],

  upgradeProjects: [
    {
      id: 'demo-i-upg-001',
      property_id: 'demo-improving-001',
      title: 'Smart Thermostat + Leak Detectors',
      category: 'Energy Efficiency',
      description: 'Nest thermostat + 3 smart leak detectors for monitoring',
      status: 'Planned',
      priority: 7,
      
      budget: 420,
      spent: 0,
      remaining: 420,
      
      startDate: null,
      targetCompletion: null,
      
      estimatedAnnualSavings: 280,
      paybackPeriod: 1.5,
      roi5Year: '233%',
      
      milestones: [
        {
          id: 'milestone-i1',
          title: 'Purchase equipment',
          status: 'pending',
          targetDate: null,
          cost: 420
        },
        {
          id: 'milestone-i2',
          title: 'Install thermostat',
          status: 'pending',
          targetDate: null,
          cost: 0
        },
        {
          id: 'milestone-i3',
          title: 'Install leak detectors',
          status: 'pending',
          targetDate: null,
          cost: 0
        }
      ],
      
      impactMetrics: {
        hvacRuntime: '-15%',
        monthlyEnergyCost: '-$23',
        leakProtection: 'Added',
        resaleValue: '+$1,200'
      },
      
      notes: 'Quick win. Smart monitoring gives you visibility you currently lack.'
    },
    {
      id: 'demo-i-upg-002',
      property_id: 'demo-improving-001',
      title: 'Crawlspace Encapsulation',
      category: 'Preventive Replacements',
      description: 'Full crawlspace encapsulation with vapor barrier and dehumidifier',
      status: 'Identified',
      priority: 9,
      
      budget: 3500,
      spent: 0,
      remaining: 3500,
      
      startDate: null,
      targetCompletion: null,
      
      estimatedAnnualSavings: 180,
      resaleValueIncrease: 5500,
      roi: '157%',
      
      milestones: [
        {
          id: 'milestone-i4',
          title: 'Get 3 contractor quotes',
          status: 'pending',
          targetDate: null,
          cost: 0
        },
        {
          id: 'milestone-i5',
          title: 'Schedule installation',
          status: 'pending',
          targetDate: null,
          cost: 0
        },
        {
          id: 'milestone-i6',
          title: 'Install system',
          status: 'pending',
          targetDate: null,
          cost: 3500
        }
      ],
      
      why_worth_it: `
        Your crawlspace moisture is a ticking time bomb.
        
        ⚠️ Current Risk:
        • Moisture damages floor joists
        • Mold growth (health hazard)
        • Foundation integrity threatened
        
        💡 Solution:
        • $3,500 one-time investment
        • Prevents $15K-$40K foundation damage
        • Improves indoor air quality
        • Increases home value $5,500
        
        This is the upgrade that prevents the catastrophic repair.
      `,
      
      notes: 'High priority. Prevents major structural damage. Do within 12 months.'
    }
  ],

  portfolioMetrics: {
    total_properties: 1,
    total_units: 1,
    current_property_value: 480000,
    outstanding_mortgage: 220000,
    current_equity: 260000,
    loan_to_value_ratio: 45.8,
    
    average_health_score: 78,
    total_maintenance_invested: 1850,
    total_savings_from_prevention: 3200,
    
    projected_value_10yr: 650000,
    projected_equity_10yr: 480000,
    
    recommendation: 'Hold'
  },
  
  stats: {
    total_systems: 11,
    systems_good: 7,
    systems_flagged: 3,
    systems_urgent: 1,
    total_tasks: 4,
    tasks_urgent: 0,
    tasks_high: 2,
    tasks_medium: 2,
    health_score: 78
  }
};