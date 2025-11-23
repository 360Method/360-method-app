export const DEMO_PROPERTY_EXCELLENT = {
  property: {
    id: 'demo-excellent-001',
    address: '2847 Maple Grove Lane',
    street_address: '2847 Maple Grove Lane',
    city: 'Vancouver',
    state: 'WA',
    zip_code: '98661',
    property_type: 'Single-Family Home',
    year_built: 2015,
    square_footage: 2400,
    bedrooms: 4,
    bathrooms: 2.5,
    stories: 'Two-Story',
    foundation_type: 'Full Basement',
    garage_type: 'Attached 2-car',
    is_demo: true,
    demo_type: 'excellent',
    baseline_completion: 100,
    health_score: 92,
    last_inspection_date: '2025-10-15',
    total_maintenance_spent: 3200,
    estimated_disasters_prevented: 12400,
    certificationLevel: 'gold',
    breakdown: { condition: 37, maintenance: 33, improvement: 22 },
    quickWins: [
      { action: 'Document 2 more warranty records', points: 1, cost: 'Free' },
      { action: 'Add smart leak detectors', points: 2, cost: '$120' }
    ],
    created_date: '2025-01-01T00:00:00Z'
  },
  
  systems: [
    {
      id: 'demo-e-sys-001',
      property_id: 'demo-excellent-001',
      system_type: 'HVAC System',
      nickname: 'Main Heat Pump',
      brand_model: 'Lennox XC25 Heat Pump',
      installation_year: 2017,
      condition: 'Excellent',
      condition_notes: 'Serviced bi-annually. Last service: Oct 2025. Running at 98% efficiency.',
      last_service_date: '2025-10-10',
      next_service_date: '2026-04-10',
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 8500,
      created_date: '2025-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-002',
      property_id: 'demo-excellent-001',
      system_type: 'Water & Sewer/Septic',
      nickname: 'Water Heater',
      brand_model: 'Rheem ProTerra Hybrid',
      installation_year: 2020,
      condition: 'Excellent',
      condition_notes: 'Regularly flushed. No sediment buildup. Anode rod replaced proactively.',
      last_service_date: '2025-09-15',
      estimated_lifespan_years: 12,
      replacement_cost_estimate: 2000,
      created_date: '2025-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-003',
      property_id: 'demo-excellent-001',
      system_type: 'Roof System',
      nickname: 'Main Roof',
      brand_model: 'CertainTeed Landmark AR',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Professionally inspected annually. No issues detected.',
      last_service_date: '2025-09-20',
      estimated_lifespan_years: 30,
      replacement_cost_estimate: 12000,
      created_date: '2025-01-15T00:00:00Z'
    }
  ],

  tasks: [
    {
      id: 'demo-e-task-001',
      property_id: 'demo-excellent-001',
      title: 'Winter Inspection',
      description: 'Quarterly home systems inspection',
      system_type: 'General',
      priority: 'Routine',
      current_fix_cost: 0,
      status: 'Scheduled',
      scheduled_date: '2025-12-15',
      created_date: '2025-11-01T00:00:00Z'
    }
  ],

  inspections: [
    {
      id: 'demo-e-insp-001',
      property_id: 'demo-excellent-001',
      inspection_type: 'Fall Inspection',
      season: 'Fall',
      year: 2025,
      inspection_date: '2025-10-15',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 0,
      urgent_count: 0,
      flag_count: 0,
      created_date: '2025-10-15T14:30:00Z'
    }
  ],

  maintenanceHistory: [
    {
      id: 'demo-e-hist-001',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-001',
      date: '2025-10-10',
      type: 'Service',
      title: 'Fall HVAC Service',
      description: 'Bi-annual heat pump maintenance',
      cost: 165,
      completed_by: 'ABC Heating',
      prevented_cost: 800
    }
  ],

  portfolioMetrics: {
    total_properties: 1,
    total_units: 1,
    current_property_value: 550000,
    outstanding_mortgage: 300000,
    current_equity: 250000,
    loan_to_value_ratio: 54.5,
    
    average_health_score: 92,
    total_maintenance_invested: 3200,
    total_savings_from_prevention: 12400,
    
    projected_value_10yr: 770000,
    projected_equity_10yr: 520000,
    
    recommendation: 'Hold'
  },
  
  stats: {
    total_systems: 16,
    systems_good: 15,
    systems_flagged: 1,
    systems_urgent: 0,
    total_tasks: 4,
    tasks_urgent: 0,
    tasks_high: 0,
    tasks_medium: 1,
    health_score: 92
  }
};