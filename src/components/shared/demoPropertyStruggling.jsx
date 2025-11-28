// Helper to get dates relative to today - called dynamically
const getToday = () => new Date().toISOString().split('T')[0];
const getDaysFromNow = (days) => new Date(Date.now() + 86400000 * days).toISOString().split('T')[0];
const getDaysAgo = (days) => new Date(Date.now() - 86400000 * days).toISOString().split('T')[0];

// Function that returns fresh demo data with dynamic dates
export const getDemoPropertyStruggling = () => ({
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

  tasks: [
    // PRIORITIZE PAGE TASKS (status: 'Identified') - Shows in Prioritize, needs scheduling
    {
      id: 'demo-s-task-001',
      property_id: 'demo-struggling-001',
      title: 'Install CO Detectors - LIFE SAFETY',
      description: 'No carbon monoxide detectors installed. This is a critical life safety issue. Purchase 3 battery-powered CO detectors and install one on each floor near sleeping areas.',
      system_type: 'Safety',
      priority: 'Critical',
      cascade_risk_score: 10,
      current_fix_cost: 100,
      delayed_fix_cost: 100,
      diy_cost: 100,
      diy_difficulty: 'Easy',
      diy_time_hours: 0.5,
      status: 'Identified',
      execution_method: 'DIY',
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-002',
      property_id: 'demo-struggling-001',
      title: 'Fix GFCI Outlets Near Water',
      description: 'GFCI outlets in bathroom and kitchen not functioning. Electrical safety hazard. Test and reset GFCI outlets, replace if damaged.',
      system_type: 'Electrical',
      priority: 'Critical',
      cascade_risk_score: 9,
      current_fix_cost: 150,
      delayed_fix_cost: 150,
      contractor_cost: 250,
      diy_cost: 150,
      diy_difficulty: 'Medium',
      diy_time_hours: 1,
      status: 'Identified',
      execution_method: 'DIY',
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-003',
      property_id: 'demo-struggling-001',
      title: 'Emergency Roof Shingle Repair',
      description: 'Missing shingles allowing water infiltration. Must repair before next rain. Professional inspection and targeted shingle replacement needed.',
      system_type: 'Roof',
      priority: 'Urgent',
      cascade_risk_score: 8,
      current_fix_cost: 850,
      delayed_fix_cost: 8000,
      contractor_cost: 850,
      status: 'Identified',
      execution_method: 'Contractor',
      why_urgent: 'Water damage will spread to insulation, drywall, and potentially cause mold.',
      created_date: '2025-01-01T00:00:00Z'
    },
    // SCHEDULE PAGE TASKS (status: 'Scheduled' but future date or no date) - Shows in Schedule calendar
    {
      id: 'demo-s-task-004',
      property_id: 'demo-struggling-001',
      title: 'HVAC Emergency Service',
      description: '18-year-old heat pump making noise. Needs professional deep cleaning before failure. Schedule immediate HVAC technician visit.',
      system_type: 'HVAC',
      priority: 'Urgent',
      cascade_risk_score: 7,
      current_fix_cost: 850,
      delayed_fix_cost: 6500,
      contractor_cost: 850,
      status: 'Scheduled',
      execution_method: 'Contractor',
      scheduled_date: getDaysFromNow(3), // 3 days from now
      why_urgent: 'System is past typical lifespan and showing signs of failure. Service now or replace later.',
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-005',
      property_id: 'demo-struggling-001',
      title: 'Water Heater Emergency Flush',
      description: '16-year-old water heater never serviced. Flush and inspect before catastrophic failure. Connect hose to drain valve, flush sediment, check anode rod.',
      system_type: 'Plumbing',
      priority: 'High',
      cascade_risk_score: 6,
      current_fix_cost: 350,
      delayed_fix_cost: 2500,
      contractor_cost: 350,
      status: 'Scheduled',
      execution_method: 'Contractor',
      scheduled_date: getDaysFromNow(7), // 1 week from now
      why_urgent: 'Tank is 6 years past typical lifespan. Could flood at any time.',
      created_date: '2025-01-01T00:00:00Z'
    },
    // EXECUTE PAGE TASKS (status: 'Scheduled' with today/past date) - Shows in Execute
    {
      id: 'demo-s-task-006',
      property_id: 'demo-struggling-001',
      title: 'Replace/Test Smoke Detectors',
      description: 'Smoke detectors are unknown age with likely dead batteries. Replace all units with new 10-year sealed battery models.',
      system_type: 'Safety',
      priority: 'High',
      cascade_risk_score: 9,
      current_fix_cost: 200,
      delayed_fix_cost: 200,
      diy_cost: 200,
      diy_difficulty: 'Easy',
      diy_time_hours: 1,
      status: 'Scheduled',
      execution_method: 'DIY',
      scheduled_date: getToday(), // Today
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-007',
      property_id: 'demo-struggling-001',
      title: 'Clean Clogged Gutters',
      description: 'Gutters completely clogged. Water overflowing near foundation. Remove debris, flush with hose, check downspout drainage.',
      system_type: 'Gutters',
      priority: 'High',
      cascade_risk_score: 7,
      current_fix_cost: 150,
      delayed_fix_cost: 5000,
      contractor_cost: 150,
      diy_cost: 0,
      diy_difficulty: 'Easy',
      diy_time_hours: 2,
      status: 'Scheduled',
      execution_method: 'DIY',
      scheduled_date: getDaysAgo(2), // 2 days ago - overdue
      why_urgent: 'Water pooling at foundation causes basement flooding and structural damage.',
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-008',
      property_id: 'demo-struggling-001',
      title: 'Check Furnace Filter',
      description: 'With an 18-year-old HVAC system, clean filters are critical. Check and replace if dirty to reduce strain on aging equipment.',
      system_type: 'HVAC',
      priority: 'Medium',
      cascade_risk_score: 5,
      current_fix_cost: 25,
      delayed_fix_cost: 500,
      diy_cost: 25,
      diy_difficulty: 'Easy',
      diy_time_hours: 0.25,
      status: 'Scheduled',
      execution_method: 'DIY',
      scheduled_date: getToday(), // Today
      created_date: '2025-01-01T00:00:00Z'
    }
  ],

  inspections: [
    {
      id: 'demo-s-insp-001',
      property_id: 'demo-struggling-001',
      inspection_type: 'Initial Assessment',
      season: 'Fall',
      year: 2025,
      inspection_date: '2025-01-01',
      status: 'Completed',
      completion_percentage: 100,
      duration_minutes: 45,
      issues_found: 7,
      urgent_count: 2,
      flag_count: 4,
      monitor_count: 1,
      notes: 'Critical safety issues found. Multiple systems past lifespan with no service history. Immediate action required.',
      created_date: '2025-01-01T10:00:00Z',
      findings: [
        // RED - Critical/Urgent Issues
        {
          id: 'f-s-001',
          area_name: 'Safety Systems',
          item_name: 'NO CARBON MONOXIDE DETECTORS',
          severity: 'Critical',
          stoplight: 'red',
          description: 'Property has gas appliances but ZERO carbon monoxide detectors installed. This is a life-threatening safety hazard that violates building codes.',
          recommendation: 'Install 3 CO detectors immediately - one on each floor, prioritizing sleeping areas. Battery-powered units can be installed in under 30 minutes.',
          current_fix_cost: 100,
          delayed_fix_cost: 100,
          cascade_risk: 'Life Safety - CO poisoning risk with gas furnace and water heater',
          diy_difficulty: 'Easy'
        },
        {
          id: 'f-s-002',
          area_name: 'Electrical System',
          item_name: 'GFCI Outlets Not Functioning',
          severity: 'Critical',
          stoplight: 'red',
          description: 'Ground fault circuit interrupter outlets in kitchen and bathroom are not working. These safety devices prevent electrocution in wet areas.',
          recommendation: 'Test all GFCI outlets with reset button. Replace any that fail to trip or reset. If unfamiliar with electrical work, hire a licensed electrician.',
          current_fix_cost: 150,
          delayed_fix_cost: 3000,
          cascade_risk: 'Electrocution hazard - serious injury or death possible',
          diy_difficulty: 'Medium'
        },
        // YELLOW - Flag Issues
        {
          id: 'f-s-003',
          area_name: 'Roof System',
          item_name: 'Missing/Damaged Shingles',
          severity: 'Flag',
          stoplight: 'yellow',
          description: '4-6 shingles missing on south-facing slope. Exposed roof deck visible. Active water infiltration risk with next rain event.',
          recommendation: 'Schedule professional roofer within 2 weeks. Temporary tarping may be needed if rain expected. Get 3 quotes for repair vs. full replacement assessment.',
          current_fix_cost: 850,
          delayed_fix_cost: 8000,
          cascade_risk: 'High - water damage to insulation, drywall, potential mold growth'
        },
        {
          id: 'f-s-004',
          area_name: 'HVAC System',
          item_name: '18-Year-Old Heat Pump - No Service History',
          severity: 'Flag',
          stoplight: 'yellow',
          description: 'Carrier heat pump installed 2007. No maintenance records. System running but making grinding noise during startup. Past typical 15-20 year lifespan.',
          recommendation: 'Schedule HVAC technician for deep cleaning and diagnostic. Begin budgeting $6,500 for replacement within 1-2 years. Regular maintenance may extend life.',
          current_fix_cost: 350,
          delayed_fix_cost: 6500,
          cascade_risk: 'Medium - mid-winter failure would require emergency replacement at premium cost'
        },
        {
          id: 'f-s-005',
          area_name: 'Water Heater',
          item_name: '16-Year-Old Tank - Never Serviced',
          severity: 'Flag',
          stoplight: 'yellow',
          description: 'Rheem 40-gallon gas water heater from 2009. No documented service. Anode rod likely depleted. Tank rust visible at connections.',
          recommendation: 'Flush tank and inspect anode rod. If anode is depleted, this may extend life 1-2 years. Begin planning replacement - budget $1,200-1,500.',
          current_fix_cost: 200,
          delayed_fix_cost: 2500,
          cascade_risk: 'Medium - catastrophic tank failure would flood area, damage nearby systems'
        },
        {
          id: 'f-s-006',
          area_name: 'Exterior/Drainage',
          item_name: 'Gutters 100% Clogged',
          severity: 'Flag',
          stoplight: 'yellow',
          description: 'All gutters packed with debris. Observed water overflowing and pooling at foundation during rain. Downspouts disconnected in 2 locations.',
          recommendation: 'Clean all gutters and reconnect downspouts. Install gutter guards to prevent future buildup. Verify water drains away from foundation.',
          current_fix_cost: 150,
          delayed_fix_cost: 5000,
          cascade_risk: 'High - foundation water intrusion, basement flooding, structural damage'
        },
        // GREEN - Monitor Items
        {
          id: 'f-s-007',
          area_name: 'Safety Systems',
          item_name: 'Smoke Detectors - Unknown Age',
          severity: 'Monitor',
          stoplight: 'green',
          description: 'Battery-powered smoke detectors present in hallways. Age unknown. Batteries status unknown. Recommend replacement with 10-year sealed units.',
          recommendation: 'Replace all smoke detectors with new 10-year sealed battery models. Test monthly. Note: Smoke detectors expire after 10 years regardless of battery.',
          current_fix_cost: 200,
          delayed_fix_cost: 200,
          cascade_risk: 'Low - safety device, no cascade effect'
        }
      ]
    }
  ],

  maintenanceHistory: [
    {
      id: 'demo-s-hist-001',
      property_id: 'demo-struggling-001',
      date: '2025-01-01',
      type: 'Assessment',
      title: 'Initial Property Assessment',
      description: 'First-time assessment of property condition. No prior maintenance records found.',
      cost: 0,
      completed_by: '360° Method Assessment',
      notes: 'Property has been in reactive mode. No documentation, no scheduled maintenance, multiple systems at risk.'
    }
  ],

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
    total_tasks: 7,
    tasks_critical: 2,
    tasks_urgent: 2,
    tasks_high: 3,
    tasks_medium: 0,
    tasks_low: 0,
    total_estimated_cost_now: 2650,
    total_estimated_cost_if_delayed: 22350,
    potential_savings: 19700,
    health_score: 62
  }
});

// Legacy export for backward compatibility - calls the function to get fresh data
export const DEMO_PROPERTY_STRUGGLING = getDemoPropertyStruggling();