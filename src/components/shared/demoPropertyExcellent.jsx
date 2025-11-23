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
    total_maintenance_spent: 8400,
    estimated_disasters_prevented: 28600,
    certificationLevel: 'gold',
    breakdown: { condition: 37, maintenance: 33, improvement: 22 },
    quickWins: [
      { action: 'Document 2 more warranty records', points: 1, cost: 'Free' },
      { action: 'Add smart leak detectors', points: 2, cost: '$120' }
    ],
    created_date: '2023-01-15T00:00:00Z'
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
      condition_notes: 'Serviced bi-annually. Last service: Oct 2025. Running at 98% efficiency. Filter changed monthly. Smart thermostat tracks performance.',
      last_service_date: '2025-10-10',
      last_service_type: 'Preventive Maintenance - Fall Service',
      next_service_date: '2026-04-10',
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 8500,
      warranty_info: 'Parts warranty until 2027',
      photo_urls: [],
      maintenance_costs: 1485,
      lifespan_extension_total_years: 3,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-002',
      property_id: 'demo-excellent-001',
      system_type: 'Water & Sewer/Septic',
      nickname: 'Water Heater',
      brand_model: 'Rheem ProTerra Hybrid',
      installation_year: 2020,
      condition: 'Excellent',
      condition_notes: 'Regularly flushed annually. No sediment buildup. Anode rod inspected yearly and replaced proactively in 2024. Temperature set correctly at 120°F.',
      last_service_date: '2025-09-15',
      last_service_type: 'Annual Flush & Inspection',
      next_service_date: '2026-09-15',
      estimated_lifespan_years: 12,
      replacement_cost_estimate: 2000,
      warranty_info: '10-year warranty until 2030',
      maintenance_costs: 340,
      lifespan_extension_total_years: 2,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-003',
      property_id: 'demo-excellent-001',
      system_type: 'Roof System',
      nickname: 'Main Roof',
      brand_model: 'CertainTeed Landmark AR',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Professionally inspected annually. No issues detected. Gutters cleaned quarterly. Moss treatment applied. All flashing intact.',
      last_service_date: '2025-09-20',
      last_service_type: 'Annual Professional Inspection',
      next_service_date: '2026-09-20',
      estimated_lifespan_years: 30,
      replacement_cost_estimate: 12000,
      warranty_info: 'Lifetime warranty on shingles',
      maintenance_costs: 875,
      lifespan_extension_total_years: 5,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-004',
      property_id: 'demo-excellent-001',
      system_type: 'Plumbing System',
      nickname: 'Main Plumbing',
      brand_model: 'PEX piping throughout',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'All fixtures working perfectly. No leaks detected. Water pressure optimal. Shut-off valves tested quarterly.',
      last_service_date: '2025-10-01',
      last_service_type: 'Leak Detection Inspection',
      next_service_date: '2026-10-01',
      estimated_lifespan_years: 50,
      replacement_cost_estimate: 8000,
      maintenance_costs: 425,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-005',
      property_id: 'demo-excellent-001',
      system_type: 'Electrical System',
      nickname: 'Main Electrical Panel',
      brand_model: 'Square D 200 amp panel',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: '200 amp service. All circuits labeled. GFCI outlets tested quarterly. Surge protection installed. No issues.',
      last_service_date: '2025-08-15',
      last_service_type: 'Electrical Safety Inspection',
      next_service_date: '2028-08-15',
      estimated_lifespan_years: 40,
      replacement_cost_estimate: 3500,
      maintenance_costs: 285,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-006',
      property_id: 'demo-excellent-001',
      system_type: 'Foundation & Structure',
      nickname: 'Foundation',
      brand_model: 'Poured concrete foundation',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'No cracks. Proper grading maintained. Gutters direct water away. Annual inspection shows no settlement.',
      last_service_date: '2025-09-20',
      last_service_type: 'Annual Foundation Inspection',
      next_service_date: '2026-09-20',
      estimated_lifespan_years: 100,
      replacement_cost_estimate: 35000,
      maintenance_costs: 180,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-007',
      property_id: 'demo-excellent-001',
      system_type: 'Gutters & Downspouts',
      nickname: 'Gutter System',
      brand_model: '5-inch seamless aluminum',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Cleaned quarterly. All downspouts extended 6+ feet. Guards installed. No sagging.',
      last_service_date: '2025-10-25',
      last_service_type: 'Fall Cleaning',
      next_service_date: '2026-01-25',
      estimated_lifespan_years: 25,
      replacement_cost_estimate: 2200,
      maintenance_costs: 520,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-008',
      property_id: 'demo-excellent-001',
      system_type: 'Windows & Doors',
      nickname: 'Windows & Doors',
      brand_model: 'Pella 350 Series',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Double-pane vinyl windows. All seals intact. Weather stripping maintained. Door hardware lubricated annually.',
      last_service_date: '2025-09-10',
      last_service_type: 'Seal & Hardware Inspection',
      next_service_date: '2026-09-10',
      estimated_lifespan_years: 25,
      replacement_cost_estimate: 15000,
      maintenance_costs: 195,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-009',
      property_id: 'demo-excellent-001',
      system_type: 'Exterior Siding & Envelope',
      nickname: 'Siding',
      brand_model: 'HardiePlank fiber cement',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Professionally painted in 2022. No cracks or damage. Caulking maintained annually.',
      last_service_date: '2025-08-20',
      last_service_type: 'Caulking Maintenance',
      next_service_date: '2026-08-20',
      estimated_lifespan_years: 50,
      replacement_cost_estimate: 22000,
      maintenance_costs: 485,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-010',
      property_id: 'demo-excellent-001',
      system_type: 'Attic & Insulation',
      nickname: 'Attic',
      brand_model: 'R-49 blown-in fiberglass',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Proper ventilation. No moisture issues. Insulation level verified. Radiant barrier installed.',
      last_service_date: '2025-09-15',
      last_service_type: 'Annual Inspection',
      next_service_date: '2026-09-15',
      estimated_lifespan_years: 50,
      replacement_cost_estimate: 3500,
      maintenance_costs: 125,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-011',
      property_id: 'demo-excellent-001',
      system_type: 'Refrigerator',
      nickname: 'Kitchen Refrigerator',
      brand_model: 'Samsung Family Hub',
      installation_year: 2020,
      condition: 'Excellent',
      condition_notes: 'Coils cleaned bi-annually. Temperature monitored. Water filter changed every 6 months.',
      last_service_date: '2025-09-01',
      last_service_type: 'Coil Cleaning & Filter Change',
      next_service_date: '2026-03-01',
      estimated_lifespan_years: 13,
      replacement_cost_estimate: 2500,
      maintenance_costs: 145,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-012',
      property_id: 'demo-excellent-001',
      system_type: 'Washing Machine',
      nickname: 'Laundry Washer',
      brand_model: 'LG Front-Load',
      installation_year: 2018,
      condition: 'Excellent',
      condition_notes: 'Cleaned monthly. Hoses inspected. No leaks. Runs efficiently.',
      last_service_date: '2025-10-05',
      last_service_type: 'Routine Maintenance',
      estimated_lifespan_years: 11,
      replacement_cost_estimate: 900,
      maintenance_costs: 85,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-013',
      property_id: 'demo-excellent-001',
      system_type: 'Smoke Detector',
      nickname: 'Smoke Detectors',
      brand_model: 'Nest Protect (4 units)',
      installation_year: 2020,
      condition: 'Excellent',
      condition_notes: 'Smart detectors. Self-testing. Batteries changed annually. All interconnected.',
      last_service_date: '2025-03-15',
      last_test_date: '2025-11-10',
      last_battery_change: '2025-03-15',
      next_service_date: '2026-03-15',
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 500,
      maintenance_costs: 120,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-014',
      property_id: 'demo-excellent-001',
      system_type: 'CO Detector',
      nickname: 'Carbon Monoxide Detectors',
      brand_model: 'First Alert (3 units)',
      installation_year: 2020,
      condition: 'Excellent',
      condition_notes: 'Tested monthly. Batteries changed annually. All functioning perfectly.',
      last_service_date: '2025-03-15',
      last_test_date: '2025-11-10',
      last_battery_change: '2025-03-15',
      next_service_date: '2026-03-15',
      estimated_lifespan_years: 7,
      replacement_cost_estimate: 150,
      maintenance_costs: 90,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-015',
      property_id: 'demo-excellent-001',
      system_type: 'Garage & Overhead Door',
      nickname: 'Garage Door',
      brand_model: 'Clopay Canyon Ridge',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Opener serviced annually. Springs balanced. Safety sensors tested monthly. Lubricated quarterly.',
      last_service_date: '2025-08-10',
      last_service_type: 'Annual Maintenance',
      next_service_date: '2026-08-10',
      estimated_lifespan_years: 30,
      replacement_cost_estimate: 1800,
      maintenance_costs: 285,
      created_date: '2023-01-15T00:00:00Z'
    },
    {
      id: 'demo-e-sys-016',
      property_id: 'demo-excellent-001',
      system_type: 'Landscaping & Grading',
      nickname: 'Yard & Grading',
      brand_model: 'Professional landscaping',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Proper grading maintained. Irrigation system winterized annually. Sprinkler heads checked each spring.',
      last_service_date: '2025-10-20',
      last_service_type: 'Fall Cleanup & Winterization',
      next_service_date: '2026-04-15',
      estimated_lifespan_years: 999,
      replacement_cost_estimate: 5000,
      maintenance_costs: 1850,
      created_date: '2023-01-15T00:00:00Z'
    }
  ],

  tasks: [
    {
      id: 'demo-e-task-001',
      property_id: 'demo-excellent-001',
      title: 'Winter Quarterly Inspection',
      description: 'Complete quarterly home systems walk-through inspection',
      system_type: 'General',
      priority: 'Routine',
      current_fix_cost: 0,
      diy_cost: 0,
      diy_difficulty: 'Easy',
      diy_time_hours: 1.5,
      status: 'Scheduled',
      scheduled_date: '2025-12-15',
      execution_method: 'DIY',
      seasonal: true,
      recommended_completion_window: 'December 2025',
      created_date: '2025-11-01T00:00:00Z'
    },
    {
      id: 'demo-e-task-002',
      property_id: 'demo-excellent-001',
      title: 'HVAC Filter Change',
      description: 'Replace monthly HVAC filter',
      system_type: 'HVAC',
      priority: 'Routine',
      current_fix_cost: 0,
      diy_cost: 18,
      diy_difficulty: 'Easy',
      diy_time_hours: 0.25,
      status: 'Scheduled',
      scheduled_date: '2025-12-01',
      execution_method: 'DIY',
      seasonal: false,
      created_date: '2025-11-01T00:00:00Z'
    },
    {
      id: 'demo-e-task-003',
      property_id: 'demo-excellent-001',
      title: 'Test Smoke & CO Detectors',
      description: 'Monthly safety device testing',
      system_type: 'General',
      priority: 'Routine',
      current_fix_cost: 0,
      diy_cost: 0,
      diy_difficulty: 'Easy',
      diy_time_hours: 0.5,
      status: 'Scheduled',
      scheduled_date: '2025-12-01',
      execution_method: 'DIY',
      seasonal: false,
      created_date: '2025-11-01T00:00:00Z'
    },
    {
      id: 'demo-e-task-004',
      property_id: 'demo-excellent-001',
      title: 'Spring HVAC Service',
      description: 'Professional bi-annual heat pump maintenance (Spring service)',
      system_type: 'HVAC',
      priority: 'Routine',
      current_fix_cost: 0,
      contractor_cost: 165,
      status: 'Identified',
      recommended_completion_window: 'April 2026',
      execution_method: 'Professional',
      contractor_name: 'ABC Heating & Cooling',
      contractor_phone: '(360) 555-0123',
      seasonal: true,
      created_date: '2025-11-01T00:00:00Z'
    }
  ],

  inspections: [
    {
      id: 'demo-e-insp-001',
      property_id: 'demo-excellent-001',
      inspection_type: 'Fall Quarterly Inspection',
      season: 'Fall',
      year: 2025,
      inspection_date: '2025-10-15',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 0,
      urgent_count: 0,
      flag_count: 0,
      notes: 'All systems performing excellently. No issues detected. Property in top condition.',
      created_date: '2025-10-15T14:30:00Z'
    },
    {
      id: 'demo-e-insp-002',
      property_id: 'demo-excellent-001',
      inspection_type: 'Summer Quarterly Inspection',
      season: 'Summer',
      year: 2025,
      inspection_date: '2025-07-20',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 1,
      urgent_count: 0,
      flag_count: 1,
      notes: 'Minor gutter debris noted and cleared immediately. All other systems excellent.',
      created_date: '2025-07-20T10:15:00Z'
    },
    {
      id: 'demo-e-insp-003',
      property_id: 'demo-excellent-001',
      inspection_type: 'Spring Quarterly Inspection',
      season: 'Spring',
      year: 2025,
      inspection_date: '2025-04-18',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 0,
      urgent_count: 0,
      flag_count: 0,
      notes: 'All systems ready for summer. No concerns.',
      created_date: '2025-04-18T09:00:00Z'
    },
    {
      id: 'demo-e-insp-004',
      property_id: 'demo-excellent-001',
      inspection_type: 'Winter Quarterly Inspection',
      season: 'Winter',
      year: 2025,
      inspection_date: '2025-01-22',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 0,
      urgent_count: 0,
      flag_count: 0,
      notes: 'Heating system performing optimally. All winterization complete.',
      created_date: '2025-01-22T11:30:00Z'
    }
  ],

  maintenanceHistory: [
    {
      id: 'demo-e-hist-001',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-001',
      date: '2025-10-10',
      type: 'Service',
      title: 'Fall HVAC Maintenance',
      description: 'Bi-annual heat pump professional service - fall tune-up',
      cost: 165,
      completed_by: 'ABC Heating & Cooling',
      prevented_cost: 1200,
      notes: 'System running at 98% efficiency. Refrigerant levels perfect. No issues detected.'
    },
    {
      id: 'demo-e-hist-002',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-001',
      date: '2025-04-15',
      type: 'Service',
      title: 'Spring HVAC Maintenance',
      description: 'Bi-annual heat pump professional service - spring tune-up',
      cost: 165,
      completed_by: 'ABC Heating & Cooling',
      prevented_cost: 1200
    },
    {
      id: 'demo-e-hist-003',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-002',
      date: '2025-09-15',
      type: 'Service',
      title: 'Water Heater Annual Service',
      description: 'Annual tank flush, anode rod inspection, and safety check',
      cost: 145,
      completed_by: 'Pro Plumbing Services',
      prevented_cost: 800,
      notes: 'Anode rod still in good condition. No sediment found.'
    },
    {
      id: 'demo-e-hist-004',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-002',
      date: '2024-03-10',
      type: 'Replacement',
      title: 'Proactive Anode Rod Replacement',
      description: 'Replaced anode rod before failure to extend water heater life',
      cost: 195,
      completed_by: 'Pro Plumbing Services',
      prevented_cost: 2000,
      notes: 'Extended water heater lifespan by 2-3 years with this preventive replacement.'
    },
    {
      id: 'demo-e-hist-005',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-003',
      date: '2025-09-20',
      type: 'Inspection',
      title: 'Annual Roof Inspection',
      description: 'Professional roof inspection by licensed contractor',
      cost: 225,
      completed_by: 'Summit Roofing',
      prevented_cost: 3500,
      notes: 'All shingles intact. No moss. Flashing perfect. Excellent condition.'
    },
    {
      id: 'demo-e-hist-006',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-003',
      date: '2024-10-05',
      type: 'Service',
      title: 'Moss Treatment',
      description: 'Professional moss treatment and prevention',
      cost: 275,
      completed_by: 'Summit Roofing',
      prevented_cost: 1800
    },
    {
      id: 'demo-e-hist-007',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-007',
      date: '2025-10-25',
      type: 'Service',
      title: 'Fall Gutter Cleaning',
      description: 'Quarterly gutter and downspout cleaning',
      cost: 135,
      completed_by: 'Clean Gutters LLC',
      prevented_cost: 2200,
      notes: 'Removed 2 gallons of debris. All downspouts flowing freely.'
    },
    {
      id: 'demo-e-hist-008',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-007',
      date: '2025-07-15',
      type: 'Service',
      title: 'Summer Gutter Cleaning',
      description: 'Quarterly gutter and downspout cleaning',
      cost: 135,
      completed_by: 'Clean Gutters LLC',
      prevented_cost: 2200
    },
    {
      id: 'demo-e-hist-009',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-004',
      date: '2025-10-01',
      type: 'Inspection',
      title: 'Leak Detection Inspection',
      description: 'Professional thermal camera leak detection service',
      cost: 225,
      completed_by: 'Pro Plumbing Services',
      prevented_cost: 4500,
      notes: 'No leaks detected. All connections secure. Water pressure optimal.'
    },
    {
      id: 'demo-e-hist-010',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-005',
      date: '2025-08-15',
      type: 'Inspection',
      title: 'Electrical Safety Inspection',
      description: 'Licensed electrician safety inspection and testing',
      cost: 285,
      completed_by: 'Bright Electric',
      prevented_cost: 3500,
      notes: 'All circuits functioning properly. No safety concerns. Panel in excellent condition.'
    },
    {
      id: 'demo-e-hist-011',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-009',
      date: '2025-08-20',
      type: 'Service',
      title: 'Exterior Caulking Maintenance',
      description: 'Annual caulking inspection and maintenance',
      cost: 185,
      completed_by: 'Pro Painters',
      prevented_cost: 2500
    },
    {
      id: 'demo-e-hist-012',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-015',
      date: '2025-08-10',
      type: 'Service',
      title: 'Garage Door Annual Service',
      description: 'Professional maintenance - balance, lubrication, safety test',
      cost: 145,
      completed_by: 'Overhead Door Co',
      prevented_cost: 1200,
      notes: 'Springs balanced. All safety sensors working. Opener functioning perfectly.'
    },
    {
      id: 'demo-e-hist-013',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-016',
      date: '2025-10-20',
      type: 'Service',
      title: 'Fall Yard Cleanup & Winterization',
      description: 'Seasonal yard maintenance and irrigation winterization',
      cost: 425,
      completed_by: 'Green Thumb Landscaping',
      prevented_cost: 1500
    },
    {
      id: 'demo-e-hist-014',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-016',
      date: '2025-04-10',
      type: 'Service',
      title: 'Spring Lawn & Irrigation Start-up',
      description: 'Spring cleanup and irrigation system activation',
      cost: 385,
      completed_by: 'Green Thumb Landscaping',
      prevented_cost: 1200
    },
    {
      id: 'demo-e-hist-015',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-013',
      date: '2025-03-15',
      type: 'Maintenance',
      title: 'Smoke Detector Battery Replacement',
      description: 'Annual battery replacement for all smoke detectors',
      cost: 45,
      completed_by: 'DIY',
      prevented_cost: 500,
      notes: 'All 4 units tested and batteries replaced. Self-test passed.'
    },
    {
      id: 'demo-e-hist-016',
      property_id: 'demo-excellent-001',
      system_id: 'demo-e-sys-014',
      date: '2025-03-15',
      type: 'Maintenance',
      title: 'CO Detector Battery Replacement',
      description: 'Annual battery replacement for all CO detectors',
      cost: 30,
      completed_by: 'DIY',
      prevented_cost: 150,
      notes: 'All 3 units tested and batteries replaced.'
    }
  ],

  upgrades: [
    {
      id: 'demo-e-upgrade-001',
      property_id: 'demo-excellent-001',
      title: 'Smart Home Integration',
      category: 'Energy Efficiency',
      description: 'Installed smart thermostat, leak detectors, and monitoring system',
      current_state: 'Basic home systems',
      upgraded_state: 'Smart-enabled monitoring and control',
      investment_required: 850,
      actual_cost: 850,
      annual_savings: 320,
      property_value_impact: 2500,
      roi_timeline_months: 32,
      status: 'Completed',
      completion_date: '2023-08-15',
      project_manager: 'DIY',
      notes: 'Nest thermostat + 3 leak detectors. System alerts on phone. Reduced energy bills by 12%.',
      created_date: '2023-07-01T00:00:00Z'
    },
    {
      id: 'demo-e-upgrade-002',
      property_id: 'demo-excellent-001',
      title: 'Attic Radiant Barrier',
      category: 'Energy Efficiency',
      description: 'Installed radiant barrier in attic to reduce cooling costs',
      current_state: 'Standard insulation only',
      upgraded_state: 'Radiant barrier + insulation',
      investment_required: 1200,
      actual_cost: 1200,
      annual_savings: 280,
      property_value_impact: 1800,
      roi_timeline_months: 43,
      status: 'Completed',
      completion_date: '2024-05-20',
      project_manager: 'Contractor',
      notes: 'Reduced summer cooling costs significantly. Attic temps down 15°F.',
      created_date: '2024-04-01T00:00:00Z'
    },
    {
      id: 'demo-e-upgrade-003',
      property_id: 'demo-excellent-001',
      title: 'Gutter Guards Installation',
      category: 'Preventive Replacements',
      description: 'Installed high-quality gutter guards on all gutters',
      current_state: 'Open gutters requiring frequent cleaning',
      upgraded_state: 'Gutter guards - reduced maintenance',
      investment_required: 1800,
      actual_cost: 1800,
      annual_savings: 540,
      property_value_impact: 1500,
      roi_timeline_months: 40,
      status: 'Completed',
      completion_date: '2023-06-10',
      project_manager: 'Contractor',
      notes: 'Cut gutter cleaning from 4x/year to 1x/year. Major time saver.',
      created_date: '2023-05-01T00:00:00Z'
    }
  ],

  preserveSchedules: [
    {
      id: 'demo-e-preserve-full',
      season: 'Ongoing Excellence Program',
      title: 'Elite-Level Strategic Preservation',
      description: 'Systematic life extension interventions maintaining Gold standard and preventing all major replacements.',
      interventions: [
        {
          id: 'pres-int-e-001',
          system_id: 'demo-e-sys-001',
          system_name: 'HVAC Heat Pump',
          intervention: 'Bi-Annual Professional Service Program',
          description: 'Spring & Fall deep service keeps heat pump running at 98% efficiency, extending life from 12 to 15+ years.',
          current_age_years: 8,
          estimated_lifespan_without: 12,
          estimated_lifespan_with: 15,
          years_extended: 3,
          investment_cost: 330,
          replacement_cost_avoided: 8500,
          roi_multiplier: 25.8,
          frequency: 'Twice yearly',
          next_due: '2026-04-10',
          status: 'Active - Ongoing',
          why_worth_it: '$330/year avoids $8,500 replacement. Extended lifespan 3 years already.',
          not_routine_because: 'Professional preservation program, not routine filter changes.'
        },
        {
          id: 'pres-int-e-002',
          system_id: 'demo-e-sys-002',
          system_name: 'Water Heater',
          intervention: 'Proactive Anode Rod Replacement',
          description: 'Replaced anode rod in 2024 at 4-year mark, preventing tank corrosion and extending life 2-3 years.',
          current_age_years: 5,
          estimated_lifespan_without: 10,
          estimated_lifespan_with: 13,
          years_extended: 3,
          investment_cost: 195,
          replacement_cost_avoided: 2000,
          roi_multiplier: 10.3,
          frequency: 'Every 4-5 years',
          next_due: '2028-09-15',
          status: 'Completed',
          why_worth_it: '$195 extends water heater life 2-3 years beyond typical 10-year lifespan.',
          not_routine_because: 'Strategic replacement that extends asset life, not routine flush.'
        },
        {
          id: 'pres-int-e-003',
          system_id: 'demo-e-sys-003',
          system_name: 'Roof System',
          intervention: 'Annual Professional Inspection + Moss Treatment',
          description: 'Annual inspection, moss treatment, minor flashing repairs extend roof from 25 to 30+ years.',
          current_age_years: 10,
          estimated_lifespan_without: 25,
          estimated_lifespan_with: 32,
          years_extended: 7,
          investment_cost: 500,
          replacement_cost_avoided: 12000,
          roi_multiplier: 24.0,
          frequency: 'Annual',
          next_due: '2026-09-20',
          status: 'Active - Ongoing',
          why_worth_it: '$500/year extends $12K roof 7 years. Already extended lifespan 5 years.',
          not_routine_because: 'Professional preservation program beyond gutter cleaning.'
        },
        {
          id: 'pres-int-e-004',
          system_id: 'demo-e-sys-007',
          system_name: 'Gutter System',
          intervention: 'Gutter Guard Installation (Completed 2023)',
          description: 'Installed premium guards reducing cleaning from 4x/year to 1x/year, preventing overflow damage.',
          current_age_years: 10,
          estimated_lifespan_without: 20,
          estimated_lifespan_with: 28,
          years_extended: 8,
          investment_cost: 1800,
          replacement_cost_avoided: 2200,
          roi_multiplier: 1.2,
          frequency: 'One-time',
          next_due: 'N/A - Completed',
          status: 'Completed',
          why_worth_it: 'Also prevents $5K+ foundation damage from overflows. Time savings = $400/year.',
          not_routine_because: 'Capital upgrade preventing cascade failures.'
        }
      ],
      total_investment: 2825,
      total_replacement_costs_avoided: 24700,
      average_roi: 8.7,
      why_preserve_matters: `
        You're Gold certified (92). How do you stay there?
        
        🏆 Elite Preservation Strategy:
        • Not reacting - you're preventing
        • Not maintaining - you're extending
        • Not spending - you're investing
        
        💡 Your Current Program:
        • $2,825/year in strategic interventions
        • Avoided $24,700 in replacements
        • Extended major systems 21 years total
        • ROI: 8.7x average
        
        This is what separates good homeowners from elite operators.
        You're not just maintaining - you're protecting $550K in property value.
      `
    }
  ],

  upgradeProjects: [
    {
      id: 'demo-e-upg-001',
      property_id: 'demo-excellent-001',
      title: 'Whole-House Surge Protection',
      category: 'Safety',
      description: 'Professional-grade surge protection at main panel + point-of-use protection',
      status: 'Completed',
      priority: 8,
      
      budget: 950,
      spent: 925,
      remaining: 25,
      
      startDate: '2024-03-10',
      targetCompletion: '2024-03-15',
      actualCompletion: '2024-03-14',
      
      estimatedAnnualSavings: 0,
      resaleValueIncrease: 1200,
      
      milestones: [
        {
          id: 'milestone-e1',
          title: 'Get electrician quotes',
          status: 'completed',
          completedDate: '2024-02-28',
          cost: 0
        },
        {
          id: 'milestone-e2',
          title: 'Schedule installation',
          status: 'completed',
          completedDate: '2024-03-05',
          cost: 0
        },
        {
          id: 'milestone-e3',
          title: 'Install main panel surge protector',
          status: 'completed',
          completedDate: '2024-03-14',
          cost: 625
        },
        {
          id: 'milestone-e4',
          title: 'Install point-of-use protectors',
          status: 'completed',
          completedDate: '2024-03-14',
          cost: 300
        }
      ],
      
      impactMetrics: {
        protection: 'HVAC, electronics, appliances',
        insuranceDiscount: 'Potential 2-5%',
        resaleValue: '+$1,200',
        peaceOfMind: 'High'
      },
      
      why_worth_it: `
        You have $15K+ in smart appliances and electronics.
        
        ⚡ Risk Without Protection:
        • Lightning strike = $8K-$15K damage
        • Power surge destroys HVAC board ($2,500)
        • Ruins smart devices, TVs, computers
        
        💡 Solution:
        • $925 one-time investment
        • Protects $15K+ in equipment
        • Potential insurance discount
        • Platinum-level protection
        
        Elite homes have elite protection. This is how you stay Gold.
      `,
      
      notes: 'Completed under budget. Peace of mind during Pacific NW storms.'
    },
    {
      id: 'demo-e-upg-002',
      property_id: 'demo-excellent-001',
      title: 'Advanced Water Leak Detection System',
      category: 'Safety',
      description: 'Flo by Moen whole-house water monitoring with auto-shutoff',
      status: 'In Progress',
      priority: 8,
      
      budget: 850,
      spent: 750,
      remaining: 100,
      
      startDate: '2025-11-01',
      targetCompletion: '2025-12-15',
      
      estimatedAnnualSavings: 0,
      resaleValueIncrease: 1800,
      
      milestones: [
        {
          id: 'milestone-e5',
          title: 'Research systems',
          status: 'completed',
          completedDate: '2025-10-20',
          cost: 0
        },
        {
          id: 'milestone-e6',
          title: 'Purchase Flo system',
          status: 'completed',
          completedDate: '2025-11-05',
          cost: 600
        },
        {
          id: 'milestone-e7',
          title: 'Professional installation',
          status: 'in-progress',
          targetDate: '2025-12-10',
          cost: 250
        },
        {
          id: 'milestone-e8',
          title: 'Configure alerts',
          status: 'pending',
          targetDate: '2025-12-15',
          cost: 0
        }
      ],
      
      impactMetrics: {
        leakDetection: '24/7 monitoring',
        autoShutoff: 'Prevents $50K floods',
        insuranceDiscount: 'Up to 10%',
        resaleValue: '+$1,800'
      },
      
      why_worth_it: `
        Water damage is the #1 homeowner fear.
        
        🚰 What This Prevents:
        • Toilet supply line bursts while you're at work ($8K damage)
        • Water heater leak floods basement ($12K)
        • Washing machine hose failure ($15K)
        
        💡 Flo System:
        • Detects leaks in real-time
        • Auto-shuts off water to prevent flooding
        • Monitors usage patterns
        • Insurance discount up to 10%
        
        Elite protection for an elite property.
      `,
      
      notes: 'Installation scheduled Dec 10. This is Platinum-level infrastructure.'
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
    total_maintenance_invested: 8400,
    total_savings_from_prevention: 28600,
    
    projected_value_10yr: 770000,
    projected_equity_10yr: 520000,
    
    recommendation: 'Hold - Excellent asset performing optimally'
  },
  
  stats: {
    total_systems: 16,
    systems_good: 16,
    systems_excellent: 16,
    systems_flagged: 0,
    systems_urgent: 0,
    total_tasks: 4,
    tasks_urgent: 0,
    tasks_high: 0,
    tasks_medium: 0,
    tasks_routine: 4,
    health_score: 92,
    certificationLevel: 'gold',
    quarterly_inspections_completed: 4,
    maintenance_events_last_year: 16
  }
};