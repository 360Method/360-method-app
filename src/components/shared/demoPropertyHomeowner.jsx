export const DEMO_PROPERTY_HOMEOWNER = {
  property: {
    id: 'demo-homeowner-001',
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
    demo_type: 'homeowner',
    baseline_completion: 100,
    health_score: 78,
    last_inspection_date: '2025-10-15',
    total_maintenance_spent: 3200,
    estimated_disasters_prevented: 7200,
    created_date: '2024-01-01T00:00:00Z'
  },
  
  systems: [
    {
      id: 'demo-h-sys-001',
      property_id: 'demo-homeowner-001',
      system_type: 'HVAC System',
      nickname: 'Main Heat Pump',
      brand_model: 'Lennox XC25 Heat Pump',
      installation_year: 2017,
      condition: 'Good',
      condition_notes: 'Serviced every 6 months. Last service: April 2024. Filter changed quarterly. Running at 95% efficiency.',
      last_service_date: '2024-04-10',
      next_service_date: '2024-10-15',
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 8500,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-002',
      property_id: 'demo-homeowner-001',
      system_type: 'Water & Sewer/Septic',
      nickname: 'Water Heater',
      brand_model: 'Rheem ProTerra 50-Gal Hybrid',
      installation_year: 2016,
      condition: 'Fair',
      condition_notes: 'Showing signs of age. Minor sediment buildup detected during last flush. No leaks. Plan replacement within 12-18 months.',
      warning_signs_present: ['Sediment buildup', 'Age approaching end of lifespan'],
      last_service_date: '2024-03-15',
      next_service_date: '2025-03-15',
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 1800,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-003',
      property_id: 'demo-homeowner-001',
      system_type: 'Roof System',
      nickname: 'Main Roof',
      brand_model: 'CertainTeed Landmark AR Shingles',
      installation_year: 2015,
      condition: 'Good',
      condition_notes: '30-year architectural shingles. No missing/damaged shingles. Flashing intact. Gutters clean.',
      last_service_date: '2024-09-20',
      next_service_date: '2025-09-20',
      estimated_lifespan_years: 30,
      replacement_cost_estimate: 12000,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-004',
      property_id: 'demo-homeowner-001',
      system_type: 'Plumbing System',
      nickname: 'Main Plumbing',
      brand_model: 'Type L Copper Piping',
      installation_year: 2015,
      condition: 'Good',
      condition_notes: 'Copper supply lines, PVC drains. No visible leaks. Water pressure normal (60 PSI).',
      last_service_date: '2024-10-01',
      estimated_lifespan_years: 50,
      replacement_cost_estimate: 8000,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-005',
      property_id: 'demo-homeowner-001',
      system_type: 'Electrical System',
      nickname: 'Main Panel',
      brand_model: 'Square D 200A Main Panel',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: '200-amp service. 32 circuit breakers. All labeled. GFCI outlets in kitchen, bathrooms, garage.',
      last_service_date: '2024-06-10',
      estimated_lifespan_years: 40,
      replacement_cost_estimate: 3500,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-006',
      property_id: 'demo-homeowner-001',
      system_type: 'Windows & Doors',
      nickname: 'All Windows',
      brand_model: 'Pella 250 Series Vinyl Double-Hung',
      installation_year: 2015,
      condition: 'Fair',
      condition_notes: 'Dual-pane vinyl windows. 3 windows have broken seals (foggy between panes). Consider replacement for those 3 within 1-2 years.',
      warning_signs_present: ['3 windows with failed seals', 'Reduced efficiency'],
      estimated_lifespan_years: 20,
      replacement_cost_estimate: 4500,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-007',
      property_id: 'demo-homeowner-001',
      system_type: 'Foundation & Structure',
      nickname: 'Foundation',
      brand_model: '8-inch Poured Concrete',
      installation_year: 2015,
      condition: 'Excellent',
      condition_notes: 'Poured concrete walls. No visible cracks. Proper drainage. Sump pump functioning.',
      last_service_date: '2024-09-01',
      estimated_lifespan_years: 100,
      replacement_cost_estimate: 50000,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-008',
      property_id: 'demo-homeowner-001',
      system_type: 'Basement/Crawlspace',
      nickname: 'Sump Pump',
      brand_model: 'Zoeller M53 Mighty-Mate',
      installation_year: 2015,
      condition: 'Good',
      condition_notes: '1/3 HP submersible pump with battery backup. Tested quarterly. At end of typical 10-year lifespan.',
      last_service_date: '2024-09-15',
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 800,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-009',
      property_id: 'demo-homeowner-001',
      system_type: 'Washing Machine',
      nickname: 'Washer Hoses',
      brand_model: 'Floodchek Braided Stainless Steel',
      installation_year: 2022,
      condition: 'Excellent',
      condition_notes: 'Braided stainless steel hoses (replaced rubber hoses). Auto-shutoff feature. No leaks.',
      last_service_date: '2024-06-01',
      estimated_lifespan_years: 5,
      replacement_cost_estimate: 50,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-010',
      property_id: 'demo-homeowner-001',
      system_type: 'Smoke Detector',
      nickname: 'All Smoke Detectors (6)',
      brand_model: 'First Alert Hardwired with Battery Backup',
      installation_year: 2015,
      condition: 'Urgent',
      condition_notes: 'Hardwired interconnected system. Units are 10 years old - REPLACE IMMEDIATELY per manufacturer guidelines.',
      warning_signs_present: ['Units at end of rated 10-year lifespan', 'Sensors may be degraded'],
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 300,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-011',
      property_id: 'demo-homeowner-001',
      system_type: 'Dishwasher',
      nickname: 'Kitchen Dishwasher',
      brand_model: 'Bosch SHPM65Z55N',
      installation_year: 2019,
      condition: 'Good',
      condition_notes: 'Stainless steel interior. Runs quietly. No leaks. Occasional error code (cleared by reset).',
      last_service_date: '2024-08-20',
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 800,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-012',
      property_id: 'demo-homeowner-001',
      system_type: 'Refrigerator',
      nickname: 'Kitchen Refrigerator',
      brand_model: 'Samsung RF28R7201SR French Door',
      installation_year: 2021,
      condition: 'Excellent',
      condition_notes: 'Counter-depth French door with ice maker. Cooling properly at optimal temps (37°F fridge, 0°F freezer).',
      last_service_date: '2024-07-01',
      estimated_lifespan_years: 13,
      replacement_cost_estimate: 2500,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-013',
      property_id: 'demo-homeowner-001',
      system_type: 'Range/Oven',
      nickname: 'Kitchen Range',
      brand_model: 'GE JGB735SPSS Gas Range',
      installation_year: 2015,
      condition: 'Good',
      condition_notes: '5-burner gas range. Oven calibrated correctly. All burners ignite properly.',
      last_service_date: '2024-06-15',
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 1200,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-014',
      property_id: 'demo-homeowner-001',
      system_type: 'Microwave',
      nickname: 'Over-Range Microwave',
      brand_model: 'Whirlpool WMH53521HZ',
      installation_year: 2015,
      condition: 'Fair',
      condition_notes: 'Over-range microwave with vent. Heating inconsistent. Fan/light working. Consider replacement soon.',
      warning_signs_present: ['Magnetron may be weakening', 'Takes longer to heat'],
      estimated_lifespan_years: 9,
      replacement_cost_estimate: 400,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-015',
      property_id: 'demo-homeowner-001',
      system_type: 'Garage & Overhead Door',
      nickname: 'Garage Door Opener',
      brand_model: 'LiftMaster 8550W Elite Series',
      installation_year: 2020,
      condition: 'Good',
      condition_notes: 'Belt-drive opener with battery backup. WiFi enabled. Safety sensors functioning properly.',
      last_service_date: '2024-05-10',
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 400,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'demo-h-sys-016',
      property_id: 'demo-homeowner-001',
      system_type: 'Exterior Siding & Envelope',
      nickname: 'Exterior Paint',
      brand_model: 'Sherwin-Williams Duration Exterior Acrylic',
      installation_year: 2018,
      condition: 'Fair',
      condition_notes: 'Beginning to fade and chalk. Minor peeling at eaves. Recommend repaint within 1-2 years to protect siding.',
      warning_signs_present: ['Paint oxidizing', 'Minor cracking at trim'],
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 5500,
      photo_urls: [],
      created_date: '2024-01-15T00:00:00Z'
    }
  ],
  
  tasks: [
    {
      id: 'demo-h-task-001',
      property_id: 'demo-homeowner-001',
      title: 'Replace All Smoke Detectors',
      description: 'All 6 smoke detectors are 10 years old and must be replaced per manufacturer specifications. This is a critical life-safety issue.',
      system_type: 'General',
      priority: 'High',
      cascade_risk_score: 10,
      cascade_risk_reason: 'CRITICAL - Failed detection could result in injury/death in fire',
      current_fix_cost: 300,
      delayed_fix_cost: 300,
      urgency_timeline: 'Immediate - Already at end of rated lifespan',
      diy_cost: 250,
      diy_difficulty: 'Medium',
      diy_time_hours: 2.5,
      contractor_cost: 350,
      status: 'Identified',
      source: 'INSPECTION',
      created_date: '2025-10-15T00:00:00Z'
    },
    {
      id: 'demo-h-task-002',
      property_id: 'demo-homeowner-001',
      title: 'Budget for Water Heater Replacement (2025)',
      description: 'Water heater is 9 years old with sediment buildup. Plan replacement in next 12-18 months before failure occurs.',
      system_type: 'Plumbing',
      priority: 'High',
      cascade_risk_score: 7,
      cascade_risk_reason: 'Failure could flood garage and damage stored items',
      current_fix_cost: 1800,
      delayed_fix_cost: 3500,
      cost_impact_reason: 'Emergency replacement costs 2x more + water damage cleanup',
      urgency_timeline: '12-18 months before failure likely',
      contractor_cost: 1800,
      status: 'Identified',
      source: 'INSPECTION',
      created_date: '2025-10-15T00:00:00Z'
    },
    {
      id: 'demo-h-task-003',
      property_id: 'demo-homeowner-001',
      title: 'Replace 3 Windows with Failed Seals',
      description: 'Living room and master bedroom windows have broken seals causing fogging. Reducing energy efficiency.',
      system_type: 'Windows/Doors',
      priority: 'Medium',
      cascade_risk_score: 4,
      cascade_risk_reason: 'Reduced efficiency, higher heating/cooling costs',
      current_fix_cost: 1200,
      delayed_fix_cost: 1200,
      urgency_timeline: '12-24 months',
      contractor_cost: 1200,
      status: 'Identified',
      source: 'INSPECTION',
      created_date: '2025-10-15T00:00:00Z'
    },
    {
      id: 'demo-h-task-004',
      property_id: 'demo-homeowner-001',
      title: 'Proactive Sump Pump Replacement',
      description: 'Sump pump is 10 years old (end of typical lifespan). Replace before next rainy season to avoid basement flooding.',
      system_type: 'Plumbing',
      priority: 'High',
      cascade_risk_score: 8,
      cascade_risk_reason: 'Failure during heavy rain could flood basement',
      current_fix_cost: 800,
      delayed_fix_cost: 5000,
      cost_impact_reason: 'Basement flood cleanup and damaged items',
      urgency_timeline: 'Before rainy season (Nov-Mar)',
      diy_cost: 600,
      diy_difficulty: 'Medium',
      diy_time_hours: 3.5,
      contractor_cost: 1000,
      status: 'Identified',
      source: 'PRESERVATION_RECOMMENDATION',
      created_date: '2025-10-15T00:00:00Z'
    },
    {
      id: 'demo-h-task-005',
      property_id: 'demo-homeowner-001',
      title: 'Fall Gutter Cleaning',
      description: 'Annual gutter cleaning before rainy season. Prevents water damage to roof and foundation.',
      system_type: 'Gutters',
      priority: 'Medium',
      cascade_risk_score: 6,
      cascade_risk_reason: 'Overflow can damage roof edge and foundation',
      current_fix_cost: 200,
      delayed_fix_cost: 3000,
      cost_impact_reason: 'Water damage to fascia boards and foundation issues',
      urgency_timeline: 'Within 2 weeks',
      diy_cost: 0,
      diy_difficulty: 'Easy',
      diy_time_hours: 2,
      contractor_cost: 200,
      status: 'Identified',
      source: 'SEASONAL_CHECKLIST',
      seasonal: true,
      recommended_completion_window: 'Before Nov 15',
      created_date: '2025-10-15T00:00:00Z'
    },
    {
      id: 'demo-h-task-006',
      property_id: 'demo-homeowner-001',
      title: 'Replace Microwave',
      description: 'Microwave heating inconsistently. Magnetron likely failing. Replace within 6-12 months.',
      system_type: 'Appliances',
      priority: 'Low',
      cascade_risk_score: 2,
      current_fix_cost: 400,
      delayed_fix_cost: 400,
      urgency_timeline: '6-12 months',
      contractor_cost: 400,
      status: 'Identified',
      source: 'INSPECTION',
      created_date: '2025-04-20T00:00:00Z'
    },
    {
      id: 'demo-h-task-007',
      property_id: 'demo-homeowner-001',
      title: 'Schedule Exterior Repainting',
      description: 'Exterior paint fading and chalking. Repaint in 2025 to protect siding from water damage.',
      system_type: 'Exterior',
      priority: 'Medium',
      cascade_risk_score: 5,
      cascade_risk_reason: 'Delayed painting could allow water damage to siding',
      current_fix_cost: 5500,
      delayed_fix_cost: 12000,
      cost_impact_reason: 'Water damage could require siding replacement',
      urgency_timeline: 'Next summer (dry weather)',
      contractor_cost: 5500,
      status: 'Identified',
      source: 'INSPECTION',
      created_date: '2025-10-15T00:00:00Z'
    },
    {
      id: 'demo-h-task-008',
      property_id: 'demo-homeowner-001',
      title: 'Fall HVAC Service',
      description: 'Bi-annual HVAC service before heating season. Ensures system runs efficiently through winter.',
      system_type: 'HVAC',
      priority: 'Medium',
      current_fix_cost: 150,
      delayed_fix_cost: 150,
      contractor_cost: 150,
      status: 'Scheduled',
      scheduled_date: '2025-10-28',
      source: 'SEASONAL_CHECKLIST',
      seasonal: true,
      contractor_name: 'ABC Heating & Cooling',
      created_date: '2025-10-15T00:00:00Z'
    }
  ],

  inspections: [
    {
      id: 'demo-h-insp-001',
      property_id: 'demo-homeowner-001',
      inspection_type: 'Fall Winterization',
      season: 'Fall',
      year: 2025,
      inspection_date: '2025-10-15',
      duration_minutes: 42,
      completed_by: 'Self',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 5,
      urgent_count: 1,
      flag_count: 3,
      monitor_count: 1,
      checklist_items: [
        {
          area_id: 'safety',
          item_name: 'Replace All Smoke Detectors (6 units)',
          description: 'All 6 hardwired smoke detectors are 10 years old - at end of manufacturer-rated lifespan. Sensors degrade over time. CRITICAL: Replace immediately per safety guidelines.',
          severity: 'Urgent',
          system: 'General',
          is_quick_fix: false,
          current_fix_cost: 300,
          delayed_fix_cost: 300,
          cascade_risk_score: 10,
          cascade_risk_reason: 'CRITICAL - Failed smoke detection in fire could result in injury/death',
          photo_urls: []
        },
        {
          area_id: 'plumbing',
          item_name: 'Water Heater Sediment Buildup',
          description: 'Water heater (9 years old) showing moderate sediment buildup. Anode rod 40% depleted. Plan replacement within 12-18 months before failure.',
          severity: 'Flag',
          system: 'Plumbing System',
          is_quick_fix: false,
          current_fix_cost: 1800,
          delayed_fix_cost: 3500,
          cascade_risk_score: 7,
          cascade_risk_reason: 'Failure could flood garage and damage stored items',
          cost_impact_reason: 'Emergency replacement costs 2x + water damage cleanup',
          photo_urls: []
        },
        {
          area_id: 'basement',
          item_name: 'Sump Pump at End of Lifespan',
          description: 'Sump pump is 10 years old (end of typical lifespan). Currently functional but replace proactively before next rainy season to prevent basement flooding.',
          severity: 'Flag',
          system: 'Foundation & Structure',
          is_quick_fix: false,
          current_fix_cost: 800,
          delayed_fix_cost: 5000,
          cascade_risk_score: 8,
          cascade_risk_reason: 'Failure during heavy rain could flood basement',
          cost_impact_reason: 'Basement flood cleanup and damaged items',
          photo_urls: []
        },
        {
          area_id: 'windows',
          item_name: '3 Windows with Failed Seals',
          description: 'Living room and master bedroom windows showing fogging between panes (broken seals). Reducing energy efficiency. Plan replacement within 1-2 years.',
          severity: 'Flag',
          system: 'Windows & Doors',
          is_quick_fix: false,
          current_fix_cost: 1200,
          delayed_fix_cost: 1200,
          cascade_risk_score: 4,
          cascade_risk_reason: 'Reduced efficiency, higher heating/cooling costs',
          photo_urls: []
        },
        {
          area_id: 'exterior',
          item_name: 'Exterior Paint Fading',
          description: 'Paint (2018) beginning to fade and chalk. Minor peeling at eaves. Recommend repaint within 1-2 years to protect siding from water damage.',
          severity: 'Monitor',
          system: 'Exterior Siding & Envelope',
          is_quick_fix: false,
          current_fix_cost: 5500,
          delayed_fix_cost: 12000,
          cascade_risk_score: 5,
          cascade_risk_reason: 'Delayed painting could allow water damage to siding',
          cost_impact_reason: 'Water damage could require siding replacement',
          photo_urls: []
        }
      ],
      next_inspection_due: '2026-01-15',
      notes: 'Property ready for winter. Smoke detectors are the urgent priority - life safety issue.',
      created_date: '2025-10-15T14:30:00Z'
    },
    {
      id: 'demo-h-insp-002',
      property_id: 'demo-homeowner-001',
      inspection_type: 'Spring Opening',
      season: 'Spring',
      year: 2025,
      inspection_date: '2025-04-20',
      duration_minutes: 38,
      completed_by: 'Self',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 2,
      urgent_count: 0,
      flag_count: 1,
      monitor_count: 1,
      checklist_items: [
        {
          area_id: 'gutters',
          item_name: 'Fall Gutter Cleaning Needed',
          description: 'Gutters clear now but will need cleaning before fall rainy season. Prevents water damage to roof and foundation.',
          severity: 'Monitor',
          system: 'Gutters & Downspouts',
          is_quick_fix: false,
          current_fix_cost: 200,
          delayed_fix_cost: 3000,
          cascade_risk_score: 6,
          cascade_risk_reason: 'Overflow can damage roof edge and foundation',
          cost_impact_reason: 'Water damage to fascia boards and foundation issues',
          photo_urls: []
        },
        {
          area_id: 'kitchen',
          item_name: 'Microwave Heating Inconsistent',
          description: 'Over-range microwave heating inconsistently. Magnetron likely failing. Replace within 6-12 months.',
          severity: 'Flag',
          system: 'Appliances',
          is_quick_fix: false,
          current_fix_cost: 400,
          delayed_fix_cost: 400,
          cascade_risk_score: 2,
          photo_urls: []
        }
      ],
      next_inspection_due: '2025-07-20',
      notes: 'Excellent spring condition. All major systems operating normally.',
      created_date: '2025-04-20T10:15:00Z'
    }
  ],

  maintenanceHistory: [
    {
      id: 'demo-h-hist-001',
      property_id: 'demo-homeowner-001',
      system_id: 'demo-h-sys-009',
      date: '2022-06-01',
      type: 'Replacement',
      title: 'Upgraded Washing Machine Hoses',
      description: 'Replaced rubber hoses with braided stainless steel auto-shutoff hoses',
      cost: 45,
      completed_by: 'DIY',
      time_spent_hours: 0.5,
      notes: 'Easy upgrade. Prevents potential $5,000+ flood damage.',
      before_photo_url: null,
      after_photo_url: null,
      prevented_cost: 5000
    },
    {
      id: 'demo-h-hist-002',
      property_id: 'demo-homeowner-001',
      system_id: 'demo-h-sys-001',
      date: '2024-04-10',
      type: 'Service',
      title: 'Spring HVAC Service',
      description: 'Professional bi-annual HVAC maintenance',
      cost: 165,
      completed_by: 'ABC Heating & Cooling',
      time_spent_hours: 1.5,
      notes: 'Cleaned coils, changed filter, checked refrigerant. System running at 95% efficiency.',
      prevented_cost: 800
    },
    {
      id: 'demo-h-hist-003',
      property_id: 'demo-homeowner-001',
      system_id: 'demo-h-sys-003',
      date: '2024-04-20',
      type: 'Maintenance',
      title: 'Spring Gutter Cleaning',
      description: 'Removed debris and flushed downspouts',
      cost: 0,
      completed_by: 'DIY',
      time_spent_hours: 2,
      notes: 'Prevents foundation damage and basement flooding.',
      prevented_cost: 3000
    },
    {
      id: 'demo-h-hist-004',
      property_id: 'demo-homeowner-001',
      system_id: 'demo-h-sys-002',
      date: '2024-03-15',
      type: 'Service',
      title: 'Water Heater Flush',
      description: 'Annual sediment flush and anode rod inspection',
      cost: 150,
      completed_by: 'Plumbing Pro',
      time_spent_hours: 1,
      notes: 'Moderate sediment buildup. Anode rod 40% depleted. Plan replacement 2025.',
      prevented_cost: 1200
    },
    {
      id: 'demo-h-hist-005',
      property_id: 'demo-homeowner-001',
      system_id: 'demo-h-sys-008',
      date: '2024-09-15',
      type: 'Test',
      title: 'Sump Pump Quarterly Test',
      description: 'Tested sump pump operation and battery backup',
      cost: 0,
      completed_by: 'DIY',
      time_spent_hours: 0.25,
      notes: 'Pump working properly. Battery backup functional. Replace proactively before winter.',
      prevented_cost: 8000
    }
  ],

  preserveSchedules: [
    {
      id: 'demo-h-pres-001',
      season: 'Annual',
      title: 'Strategic Life Extension Interventions',
      description: 'High-ROI maintenance that extends system life 3-15 years. NOT routine maintenance (that\'s ACT phase).',
      interventions: [
        {
          id: 'pres-int-001',
          system_id: 'demo-h-sys-001',
          system_name: 'HVAC Heat Pump',
          intervention: 'Deep HVAC Service & Coil Treatment',
          description: 'Professional deep clean, coil treatment, refrigerant optimization. Goes beyond bi-annual service.',
          current_age_years: 8,
          estimated_lifespan_without: 12,
          estimated_lifespan_with: 16,
          years_extended: 4,
          investment_cost: 800,
          replacement_cost_avoided: 8500,
          roi_multiplier: 10.6,
          frequency: 'Every 3-4 years',
          next_due: '2026-01-01',
          status: 'Recommended',
          why_worth_it: 'Extends heat pump life 4 years, avoiding $8,500 replacement. Deep cleaning restores 90%+ efficiency.',
          not_routine_because: 'This is beyond routine filter changes and bi-annual service. It\'s a strategic deep intervention.'
        },
        {
          id: 'pres-int-002',
          system_id: 'demo-h-sys-002',
          system_name: 'Water Heater',
          intervention: 'Anode Rod Replacement + Tank Treatment',
          description: 'Replace sacrificial anode rod and apply tank protection treatment. Extends life significantly.',
          current_age_years: 9,
          estimated_lifespan_without: 10,
          estimated_lifespan_with: 13,
          years_extended: 3,
          investment_cost: 350,
          replacement_cost_avoided: 1800,
          roi_multiplier: 5.1,
          frequency: 'One-time intervention',
          next_due: '2025-03-01',
          status: 'Recommended',
          why_worth_it: 'Proactive anode replacement can extend water heater life 3+ years beyond typical 10-year lifespan.',
          not_routine_because: 'Annual flushes are ACT. This is a strategic replacement that extends life.'
        },
        {
          id: 'pres-int-003',
          system_id: 'demo-h-sys-003',
          system_name: 'Roof',
          intervention: 'Roof Coating Application',
          description: 'Professional elastomeric coating protects shingles, seals small cracks, extends life 5-7 years.',
          current_age_years: 10,
          estimated_lifespan_without: 25,
          estimated_lifespan_with: 32,
          years_extended: 7,
          investment_cost: 2500,
          replacement_cost_avoided: 12000,
          roi_multiplier: 4.8,
          frequency: 'One-time intervention',
          next_due: '2026-06-01',
          status: 'Planned',
          why_worth_it: 'Coating extends roof life 5-7 years, delaying $12K replacement. Also improves energy efficiency.',
          not_routine_because: 'Gutter cleaning is routine (ACT). Coating is a strategic life extension investment.'
        },
        {
          id: 'pres-int-004',
          system_id: 'demo-h-sys-007',
          system_name: 'Foundation',
          intervention: 'Exterior Waterproofing & Drainage Upgrade',
          description: 'Install perimeter drainage system and waterproof exterior foundation walls.',
          current_age_years: 10,
          estimated_lifespan_without: 100,
          estimated_lifespan_with: 100,
          years_extended: 0,
          investment_cost: 4500,
          replacement_cost_avoided: 50000,
          roi_multiplier: 11.1,
          frequency: 'One-time intervention',
          next_due: '2027-01-01',
          status: 'Future Consideration',
          why_worth_it: 'Prevents foundation damage from water intrusion. Foundation repairs cost $30K-$50K+. This prevents catastrophic failure.',
          not_routine_because: 'This is major preventive work, not routine inspection. Prevents cascade failure.'
        }
      ],
      total_investment: 8150,
      total_replacement_costs_avoided: 72300,
      average_roi: 8.9,
      why_preserve_matters: `
        70-80% of your home's capital is tied up in just 7 major systems. 
        PRESERVE finds strategic interventions (ROI 3x+) that extend system life 3-15 years, 
        avoiding emergency replacements.
        
        🎯 The Big 7 Systems:
        • HVAC & Water Systems: Heating, cooling, hot water, drainage
        • Structural: Roof, foundation, major structures (deck, driveway)
        • Envelope: Siding, windows, doors, garage
        • Major Appliances: Fridge, washer, dryer, range, dishwasher
        
        💡 Strategic Focus:
        • NOT routine maintenance (that's ACT) - filters, batteries, etc.
        • NOT full replacements (that's UPGRADE) - new systems
        • Strategic interventions only: $500-$5,000 investments that extend life 3-15 years
        • ROI threshold: Must return 3x+ to recommend
        
        Example: Spend $800 on HVAC deep service to extend life 4 years, 
        avoiding $8,500 replacement = 10.6x ROI.
      `
    }
  ],

  upgradeProjects: [
    {
      id: 'demo-h-upg-001',
      property_id: 'demo-homeowner-001',
      title: 'Smart Thermostat Installation',
      category: 'Energy Efficiency',
      description: 'Replace manual thermostats with Nest Learning Thermostats (2 units)',
      status: 'In Progress',
      priority: 8,
      
      budget: 600,
      spent: 350,
      remaining: 250,
      
      startDate: '2024-10-15',
      targetCompletion: '2024-11-30',
      actualCompletion: null,
      daysElapsed: 35,
      daysRemaining: 10,
      
      estimatedAnnualSavings: 320,
      paybackPeriod: 1.9,
      roi5Year: '167%',
      
      milestones: [
        {
          id: 'milestone-1',
          title: 'Research & purchase thermostats',
          status: 'completed',
          completedDate: '2024-10-18',
          cost: 350
        },
        {
          id: 'milestone-2',
          title: 'Install living room thermostat',
          status: 'completed',
          completedDate: '2024-10-22',
          cost: 0
        },
        {
          id: 'milestone-3',
          title: 'Install bedroom thermostat',
          status: 'in-progress',
          targetDate: '2024-11-25',
          cost: 0
        },
        {
          id: 'milestone-4',
          title: 'Configure scheduling & automation',
          status: 'pending',
          targetDate: '2024-11-30',
          cost: 0
        }
      ],
      
      impactMetrics: {
        hvacRuntime: '-18%',
        monthlyEnergyCost: '-$27',
        comfort: 'Improved',
        resaleValue: '+$500'
      },
      
      notes: 'Nest thermostats purchased. Living room installed and working great. Bedroom installation scheduled for next weekend.'
    },
    {
      id: 'demo-h-upg-002',
      property_id: 'demo-homeowner-001',
      title: 'Attic Insulation Upgrade',
      category: 'Energy Efficiency',
      description: 'Add blown-in insulation to increase R-value from R-30 to R-49',
      status: 'Completed',
      priority: 9,
      
      budget: 2200,
      spent: 2150,
      remaining: 50,
      
      startDate: '2024-06-01',
      targetCompletion: '2024-06-15',
      actualCompletion: '2024-06-12',
      
      estimatedAnnualSavings: 450,
      paybackPeriod: 4.8,
      roi5Year: '104%',
      
      milestones: [
        {
          id: 'milestone-5',
          title: 'Get 3 contractor quotes',
          status: 'completed',
          completedDate: '2024-05-20',
          cost: 0
        },
        {
          id: 'milestone-6',
          title: 'Schedule installation',
          status: 'completed',
          completedDate: '2024-05-28',
          cost: 0
        },
        {
          id: 'milestone-7',
          title: 'Insulation installed (R-49)',
          status: 'completed',
          completedDate: '2024-06-12',
          cost: 2150
        },
        {
          id: 'milestone-8',
          title: 'Post-install inspection',
          status: 'completed',
          completedDate: '2024-06-12',
          cost: 0
        }
      ],
      
      impactMetrics: {
        coolingCosts: '-22%',
        heatingCosts: '-28%',
        monthlyEnergyCost: '-$38',
        comfort: 'Significantly improved',
        resaleValue: '+$1,500'
      },
      
      notes: 'Completed under budget and ahead of schedule. Already noticing lower AC bills in summer.'
    },
    {
      id: 'demo-h-upg-003',
      property_id: 'demo-homeowner-001',
      title: 'LED Lighting Conversion',
      category: 'Energy Efficiency',
      description: 'Convert all 26 light fixtures to LED bulbs',
      status: 'Planned',
      priority: 6,
      
      budget: 450,
      spent: 0,
      remaining: 450,
      
      startDate: null,
      targetCompletion: '2025-02-28',
      
      estimatedAnnualSavings: 180,
      paybackPeriod: 2.5,
      roi5Year: '100%',
      
      milestones: [
        {
          id: 'milestone-9',
          title: 'Inventory all fixtures (26 bulbs)',
          status: 'completed',
          completedDate: '2024-11-10',
          cost: 0
        },
        {
          id: 'milestone-10',
          title: 'Purchase LED bulbs',
          status: 'pending',
          targetDate: '2025-01-15',
          cost: 350
        },
        {
          id: 'milestone-11',
          title: 'Replace all bulbs',
          status: 'pending',
          targetDate: '2025-02-01',
          cost: 0
        },
        {
          id: 'milestone-12',
          title: 'Update electrical panel labels',
          status: 'pending',
          targetDate: '2025-02-28',
          cost: 0
        }
      ],
      
      impactMetrics: {
        energyUsage: '-75%',
        bulbLifespan: '+10× longer',
        monthlyEnergyCost: '-$15',
        maintenanceFrequency: '-90%'
      },
      
      notes: 'Waiting for post-holiday sales on LED bulbs. Target: $12-15 per bulb.'
    },
    {
      id: 'demo-h-upg-004',
      property_id: 'demo-homeowner-001',
      title: 'Kitchen Backsplash Refresh',
      category: 'Quality of Life',
      description: 'Install subway tile backsplash to modernize kitchen',
      status: 'Planned',
      priority: 4,
      
      budget: 1800,
      spent: 0,
      remaining: 1800,
      
      startDate: null,
      targetCompletion: '2025-05-30',
      
      estimatedAnnualSavings: 0,
      resaleValueIncrease: 3500,
      roi: '94%',
      
      milestones: [
        {
          id: 'milestone-13',
          title: 'Design selection & material sourcing',
          status: 'pending',
          targetDate: '2025-03-15',
          cost: 0
        },
        {
          id: 'milestone-14',
          title: 'Purchase tiles & materials',
          status: 'pending',
          targetDate: '2025-04-01',
          cost: 1200
        },
        {
          id: 'milestone-15',
          title: 'DIY installation (weekend project)',
          status: 'pending',
          targetDate: '2025-05-15',
          cost: 0
        },
        {
          id: 'milestone-16',
          title: 'Grout & seal',
          status: 'pending',
          targetDate: '2025-05-30',
          cost: 150
        }
      ],
      
      impactMetrics: {
        aesthetics: 'Modern upgrade',
        maintenance: 'Easier to clean',
        resaleValue: '+$3,500',
        personalEnjoyment: 'High'
      },
      
      why_worth_it: `
        This isn't about ROI - it's about joy! Quality of life upgrades matter.
        
        Benefits:
        • Start every day in a space you love
        • Improved functionality (easier to clean)
        • Increased home value (~$3,500)
        • Makes your home feel new again
        
        💡 The 360° Method Philosophy:
        Wealth building isn't just about numbers. Strategic "fun" upgrades that bring 
        you daily joy are investments in your happiness. Budget for them guilt-free 
        after you've handled critical maintenance.
      `,
      
      notes: 'Subway tile with dark grout - timeless look. DIY to save $1,200 in labor.'
    }
  ],

  portfolioMetrics: {
    total_properties: 1,
    total_units: 1,
    current_property_value: 550000,
    outstanding_mortgage: 300000,
    current_equity: 250000,
    loan_to_value_ratio: 54.5,
    
    average_health_score: 78,
    total_maintenance_invested: 4800,
    total_savings_from_prevention: 7200,
    roi_on_maintenance: 150,
    
    properties_needing_attention: 0,
    upcoming_capex_12mo: 2000,
    maintenance_cost_per_unit_annual: 1200,
    
    projected_value_10yr: 770000,
    projected_equity_10yr: 520000,
    equity_growth_10yr: 270000,
    appreciation_rate_assumed: 3.5,
    
    recommendation: 'Hold',
    recommendation_reasoning: `
      With 78/100 health score and strong equity position, this property is 
      well-maintained and appreciating. Continue preventive maintenance to 
      maximize long-term value.
    `,
    
    scale_message: `
      You have 1 property. SCALE features unlock with 2+ properties.
      
      Add more properties to access:
      • Portfolio-wide equity tracking
      • Multi-property performance benchmarking
      • Strategic hold/sell/refinance recommendations
      • Capital allocation optimizer
      • 10-year wealth trajectory modeling
    `,
    
    why_scale_matters: `
      SCALE transforms the 360° Method from tactical maintenance into long-term 
      wealth strategy. It answers: "What is my equity position?", 
      "Should I sell, hold, or refinance?", and "What's my 10-year wealth trajectory?"
      
      🎯 SCALE Is Your Portfolio CFO:
      • Equity Position Tracker: Current value, debt, and net worth
      • Strategic Advisor: AI-powered hold/sell/refinance recommendations
      • Wealth Projections: 10-year scenarios and growth forecasts
      • Capital Optimizer: Where to invest for maximum ROI
      • Performance Benchmarking: Compare vs market averages
      
      💡 The Transformation:
      • Before SCALE: "This app helps me maintain my home" (tactical)
      • After SCALE: "This app is my portfolio CFO" (strategic)
      
      The Cherry on Top: SCALE proves membership value by showing $2M+ equity 
      growth potential over 10 years, strategic capital allocation, and portfolio 
      performance benchmarking.
    `
  },
  
  stats: {
    total_systems: 16,
    systems_good: 9,
    systems_flagged: 6,
    systems_urgent: 1,
    total_tasks: 8,
    tasks_urgent: 1,
    tasks_high: 3,
    tasks_medium: 3,
    tasks_low: 1,
    total_estimated_savings: 7200,
    health_score: 78
  }
};