// Investor Demo Data - 3-Property Portfolio
export const DEMO_PORTFOLIO_INVESTOR = {
  portfolioStats: {
    totalProperties: 3,
    totalUnits: 7,
    totalValue: 785000,
    totalEquity: 412000,
    totalDebt: 373000,
    ltv: 47.5,
    averageHealthScore: 81,
    occupancyRate: 86,
    monthlyRevenue: 4850,
    monthlyExpenses: 2140,
    netCashFlow: 2710,
    portfolioROI: 18.2,
    cashOnCashReturn: 22.4,
    preventedCosts: 18400,
    yearToDateMaintenance: 8950
  },

  properties: [
    {
      id: 'demo-investor-1',
      nickname: 'Maple Street Duplex',
      address: '1247 Maple Street',
      city: 'Vancouver',
      state: 'WA',
      zip_code: '98661',
      property_type: 'Duplex',
      door_count: 2,
      year_built: 1998,
      square_footage: 2400,
      bedrooms: 4,
      bathrooms: 2,
      purchase_date: '2019-03',
      purchase_price: 285000,
      current_value: 340000,
      mortgage_balance: 198000,
      equity: 142000,
      monthly_rent: 2400,
      monthly_mortgage: 1180,
      health_score: 84,
      last_inspection_date: '2024-10-15',
      occupancy_status: 'Both units occupied',
      baseline_completion: 100,
      units: [
        {
          unit_id: 'A',
          nickname: 'Unit A',
          bedrooms: 2,
          bathrooms: 1,
          square_footage: 1200,
          occupancy_status: 'Tenant-Occupied',
          tenant_name: 'Johnson Family',
          monthly_rent: 1200
        },
        {
          unit_id: 'B',
          nickname: 'Unit B',
          bedrooms: 2,
          bathrooms: 1,
          square_footage: 1200,
          occupancy_status: 'Tenant-Occupied',
          tenant_name: 'Martinez Couple',
          monthly_rent: 1200
        }
      ]
    },
    {
      id: 'demo-investor-2',
      nickname: 'Oak Ridge Single Family',
      address: '3842 Oak Ridge Drive',
      city: 'Portland',
      state: 'OR',
      zip_code: '97202',
      property_type: 'Single-Family Home',
      door_count: 1,
      year_built: 2005,
      square_footage: 1850,
      bedrooms: 3,
      bathrooms: 2,
      purchase_date: '2021-07',
      purchase_price: 325000,
      current_value: 375000,
      mortgage_balance: 265000,
      equity: 110000,
      monthly_rent: 2250,
      monthly_mortgage: 1420,
      health_score: 88,
      last_inspection_date: '2024-09-28',
      occupancy_status: 'Tenant Occupied',
      baseline_completion: 100
    },
    {
      id: 'demo-investor-3',
      nickname: 'Cedar Court 4-Plex',
      address: '891 Cedar Court',
      city: 'Vancouver',
      state: 'WA',
      zip_code: '98664',
      property_type: 'Fourplex',
      door_count: 4,
      year_built: 1985,
      square_footage: 3600,
      bedrooms: 4,
      bathrooms: 4,
      purchase_date: '2023-01',
      purchase_price: 450000,
      current_value: 495000,
      mortgage_balance: 380000,
      equity: 115000,
      monthly_rent: 3600,
      monthly_mortgage: 2050,
      health_score: 72,
      last_inspection_date: '2024-11-01',
      occupancy_status: '3 occupied, 1 vacant',
      baseline_completion: 100,
      units: [
        { unit_id: '1A', nickname: 'Unit 1A', bedrooms: 1, bathrooms: 1, square_footage: 900, occupancy_status: 'Tenant-Occupied', monthly_rent: 900 },
        { unit_id: '2C', nickname: 'Unit 2C', bedrooms: 1, bathrooms: 1, square_footage: 900, occupancy_status: 'Tenant-Occupied', monthly_rent: 900 },
        { unit_id: '3B', nickname: 'Unit 3B', bedrooms: 1, bathrooms: 1, square_footage: 900, occupancy_status: 'Tenant-Occupied', monthly_rent: 900 },
        { unit_id: '4D', nickname: 'Unit 4D', bedrooms: 1, bathrooms: 1, square_footage: 900, occupancy_status: 'Vacant', monthly_rent: 0 }
      ]
    }
  ],

  systems: [
    // ==========================================
    // PROPERTY 1: MAPLE STREET DUPLEX (1998) - 16 SYSTEMS
    // ==========================================
    { id: 'sys-1', property_id: 'demo-investor-1', system_type: 'HVAC System', nickname: 'Unit A Furnace', brand_model: 'Carrier 80% Gas Furnace', installation_year: 2010, condition: 'Good', last_service_date: '2024-09-15', estimated_lifespan_years: 18, replacement_cost_estimate: 3500 },
    { id: 'sys-2', property_id: 'demo-investor-1', system_type: 'HVAC System', nickname: 'Unit B Furnace', brand_model: 'Carrier 80% Gas Furnace', installation_year: 2010, condition: 'Good', last_service_date: '2024-09-15', estimated_lifespan_years: 18, replacement_cost_estimate: 3500 },
    { id: 'sys-3', property_id: 'demo-investor-1', system_type: 'Roof System', nickname: 'Main Roof', brand_model: 'Asphalt Shingles', installation_year: 2014, condition: 'Good', estimated_lifespan_years: 20, replacement_cost_estimate: 8500 },
    { id: 'sys-4', property_id: 'demo-investor-1', system_type: 'Water & Sewer/Septic', nickname: 'Main Water Line', brand_model: 'Copper Supply', installation_year: 1998, condition: 'Good', estimated_lifespan_years: 50, replacement_cost_estimate: 4000 },
    { id: 'sys-5', property_id: 'demo-investor-1', system_type: 'Plumbing System', nickname: 'Unit A Water Heater', brand_model: 'Rheem 40-Gal Gas', installation_year: 2013, condition: 'Fair', estimated_lifespan_years: 10, replacement_cost_estimate: 1200 },
    { id: 'sys-6', property_id: 'demo-investor-1', system_type: 'Plumbing System', nickname: 'Unit B Water Heater', brand_model: 'Rheem 40-Gal Gas', installation_year: 2013, condition: 'Fair', estimated_lifespan_years: 10, replacement_cost_estimate: 1200 },
    { id: 'sys-7', property_id: 'demo-investor-1', system_type: 'Electrical System', nickname: 'Main Panel', brand_model: '200A Panel', installation_year: 1998, condition: 'Good', estimated_lifespan_years: 40, replacement_cost_estimate: 3000 },
    { id: 'sys-8', property_id: 'demo-investor-1', system_type: 'Foundation & Structure', nickname: 'Foundation', installation_year: 1998, condition: 'Good', estimated_lifespan_years: 100, replacement_cost_estimate: 40000 },
    { id: 'sys-9', property_id: 'demo-investor-1', system_type: 'Gutters & Downspouts', nickname: 'Gutters', installation_year: 1998, condition: 'Good', estimated_lifespan_years: 20, replacement_cost_estimate: 1500 },
    { id: 'sys-10', property_id: 'demo-investor-1', system_type: 'Windows & Doors', nickname: 'All Windows', installation_year: 1998, condition: 'Fair', estimated_lifespan_years: 25, replacement_cost_estimate: 6000 },
    { id: 'sys-11', property_id: 'demo-investor-1', system_type: 'Exterior Siding & Envelope', nickname: 'Siding', installation_year: 1998, condition: 'Good', estimated_lifespan_years: 30, replacement_cost_estimate: 12000 },
    { id: 'sys-12', property_id: 'demo-investor-1', system_type: 'Garage & Overhead Door', nickname: 'Garage Door', installation_year: 2008, condition: 'Good', estimated_lifespan_years: 20, replacement_cost_estimate: 1200 },
    { id: 'sys-13', property_id: 'demo-investor-1', system_type: 'Refrigerator', nickname: 'Unit A Fridge', installation_year: 2015, condition: 'Good', estimated_lifespan_years: 13, replacement_cost_estimate: 1200 },
    { id: 'sys-14', property_id: 'demo-investor-1', system_type: 'Refrigerator', nickname: 'Unit B Fridge', installation_year: 2016, condition: 'Good', estimated_lifespan_years: 13, replacement_cost_estimate: 1200 },
    { id: 'sys-15', property_id: 'demo-investor-1', system_type: 'Dishwasher', nickname: 'Unit A Dishwasher', installation_year: 2018, condition: 'Good', estimated_lifespan_years: 10, replacement_cost_estimate: 700 },
    { id: 'sys-16', property_id: 'demo-investor-1', system_type: 'Dishwasher', nickname: 'Unit B Dishwasher', installation_year: 2018, condition: 'Good', estimated_lifespan_years: 10, replacement_cost_estimate: 700 },
    
    // ==========================================
    // PROPERTY 2: OAK RIDGE SINGLE FAMILY (2005) - 16 SYSTEMS
    // ==========================================
    { id: 'sys-17', property_id: 'demo-investor-2', system_type: 'HVAC System', nickname: 'Main System', brand_model: 'Trane XV20i Heat Pump', installation_year: 2005, condition: 'Excellent', last_service_date: '2024-09-15', estimated_lifespan_years: 20, replacement_cost_estimate: 6200 },
    { id: 'sys-18', property_id: 'demo-investor-2', system_type: 'Roof System', nickname: 'Composition Shingle', brand_model: 'GAF Timberline HD', installation_year: 2005, condition: 'Good', estimated_lifespan_years: 25, replacement_cost_estimate: 9500 },
    { id: 'sys-19', property_id: 'demo-investor-2', system_type: 'Water & Sewer/Septic', nickname: 'Main Plumbing', installation_year: 2005, condition: 'Excellent', estimated_lifespan_years: 50, replacement_cost_estimate: 5000 },
    { id: 'sys-20', property_id: 'demo-investor-2', system_type: 'Plumbing System', nickname: 'Water Heater', brand_model: 'AO Smith 50-Gal', installation_year: 2016, condition: 'Good', estimated_lifespan_years: 10, replacement_cost_estimate: 1400 },
    { id: 'sys-21', property_id: 'demo-investor-2', system_type: 'Electrical System', nickname: 'Main Panel', installation_year: 2005, condition: 'Excellent', estimated_lifespan_years: 40, replacement_cost_estimate: 3500 },
    { id: 'sys-22', property_id: 'demo-investor-2', system_type: 'Foundation & Structure', nickname: 'Foundation', installation_year: 2005, condition: 'Excellent', estimated_lifespan_years: 100, replacement_cost_estimate: 45000 },
    { id: 'sys-23', property_id: 'demo-investor-2', system_type: 'Windows & Doors', nickname: 'All Windows', installation_year: 2005, condition: 'Good', estimated_lifespan_years: 25, replacement_cost_estimate: 5500 },
    { id: 'sys-24', property_id: 'demo-investor-2', system_type: 'Exterior Siding & Envelope', nickname: 'Fiber Cement Siding', installation_year: 2005, condition: 'Excellent', estimated_lifespan_years: 50, replacement_cost_estimate: 15000 },
    { id: 'sys-25', property_id: 'demo-investor-2', system_type: 'Gutters & Downspouts', nickname: 'Gutters', installation_year: 2005, condition: 'Good', estimated_lifespan_years: 20, replacement_cost_estimate: 1600 },
    { id: 'sys-26', property_id: 'demo-investor-2', system_type: 'Garage & Overhead Door', nickname: 'Garage Door', installation_year: 2005, condition: 'Good', estimated_lifespan_years: 20, replacement_cost_estimate: 1400 },
    { id: 'sys-27', property_id: 'demo-investor-2', system_type: 'Refrigerator', nickname: 'Kitchen Fridge', installation_year: 2019, condition: 'Excellent', estimated_lifespan_years: 13, replacement_cost_estimate: 2000 },
    { id: 'sys-28', property_id: 'demo-investor-2', system_type: 'Dishwasher', nickname: 'Kitchen Dishwasher', installation_year: 2020, condition: 'Excellent', estimated_lifespan_years: 10, replacement_cost_estimate: 900 },
    { id: 'sys-29', property_id: 'demo-investor-2', system_type: 'Range/Oven', nickname: 'Kitchen Range', installation_year: 2005, condition: 'Good', estimated_lifespan_years: 15, replacement_cost_estimate: 1300 },
    { id: 'sys-30', property_id: 'demo-investor-2', system_type: 'Washing Machine', nickname: 'Washer', installation_year: 2018, condition: 'Good', estimated_lifespan_years: 11, replacement_cost_estimate: 800 },
    { id: 'sys-31', property_id: 'demo-investor-2', system_type: 'Dryer', nickname: 'Dryer', installation_year: 2018, condition: 'Good', estimated_lifespan_years: 13, replacement_cost_estimate: 700 },
    { id: 'sys-32', property_id: 'demo-investor-2', system_type: 'Smoke Detector', nickname: 'Smoke Detectors (5)', installation_year: 2020, condition: 'Good', estimated_lifespan_years: 10, replacement_cost_estimate: 200 },
    
    // ==========================================
    // PROPERTY 3: CEDAR COURT 4-PLEX (1985) - 16 SYSTEMS
    // ==========================================
    { id: 'sys-33', property_id: 'demo-investor-3', system_type: 'HVAC System', nickname: 'Building HVAC', brand_model: 'Carrier Gas Furnace', installation_year: 1985, condition: 'Fair', estimated_lifespan_years: 20, replacement_cost_estimate: 18000, warning_signs_present: ['Age - 39 years old', 'Higher utility bills'] },
    { id: 'sys-34', property_id: 'demo-investor-3', system_type: 'Roof System', nickname: 'Main Roof', brand_model: 'Asphalt Shingles', installation_year: 2003, condition: 'Fair', estimated_lifespan_years: 20, replacement_cost_estimate: 14500, warning_signs_present: ['Minor leaks in Unit 2C', 'Age - 22 years'] },
    { id: 'sys-35', property_id: 'demo-investor-3', system_type: 'Water & Sewer/Septic', nickname: 'Main Water Line', installation_year: 1985, condition: 'Fair', estimated_lifespan_years: 50, replacement_cost_estimate: 6000 },
    { id: 'sys-36', property_id: 'demo-investor-3', system_type: 'Plumbing System', nickname: 'Building Plumbing', installation_year: 1985, condition: 'Fair', estimated_lifespan_years: 50, replacement_cost_estimate: 12000 },
    { id: 'sys-37', property_id: 'demo-investor-3', system_type: 'Electrical System', nickname: 'Main Panel', installation_year: 1985, condition: 'Fair', estimated_lifespan_years: 40, replacement_cost_estimate: 4500 },
    { id: 'sys-38', property_id: 'demo-investor-3', system_type: 'Foundation & Structure', nickname: 'Foundation', installation_year: 1985, condition: 'Good', estimated_lifespan_years: 100, replacement_cost_estimate: 50000 },
    { id: 'sys-39', property_id: 'demo-investor-3', system_type: 'Windows & Doors', nickname: 'Building Windows', installation_year: 1998, condition: 'Fair', estimated_lifespan_years: 25, replacement_cost_estimate: 9800, warning_signs_present: ['Single-pane in some units'] },
    { id: 'sys-40', property_id: 'demo-investor-3', system_type: 'Exterior Siding & Envelope', nickname: 'Vinyl Siding', installation_year: 1995, condition: 'Fair', estimated_lifespan_years: 40, replacement_cost_estimate: 16000 },
    { id: 'sys-41', property_id: 'demo-investor-3', system_type: 'Gutters & Downspouts', nickname: 'Gutters', installation_year: 1985, condition: 'Fair', estimated_lifespan_years: 20, replacement_cost_estimate: 2200 },
    { id: 'sys-42', property_id: 'demo-investor-3', system_type: 'Garage & Overhead Door', nickname: 'Garage Door', installation_year: 2010, condition: 'Good', estimated_lifespan_years: 20, replacement_cost_estimate: 1500 },
    { id: 'sys-43', property_id: 'demo-investor-3', system_type: 'Refrigerator', nickname: 'Unit 1A Fridge', installation_year: 2016, condition: 'Good', estimated_lifespan_years: 13, replacement_cost_estimate: 1000 },
    { id: 'sys-44', property_id: 'demo-investor-3', system_type: 'Refrigerator', nickname: 'Unit 2C Fridge', installation_year: 2018, condition: 'Good', estimated_lifespan_years: 13, replacement_cost_estimate: 1000 },
    { id: 'sys-45', property_id: 'demo-investor-3', system_type: 'Refrigerator', nickname: 'Unit 3B Fridge', installation_year: 2015, condition: 'Fair', estimated_lifespan_years: 13, replacement_cost_estimate: 1000, warning_signs_present: ['Compressor noise'] },
    { id: 'sys-46', property_id: 'demo-investor-3', system_type: 'Driveways & Hardscaping', nickname: 'Parking Lot', installation_year: 2005, condition: 'Fair', estimated_lifespan_years: 20, replacement_cost_estimate: 8500 },
    { id: 'sys-47', property_id: 'demo-investor-3', system_type: 'Landscaping & Grading', nickname: 'Drainage System', installation_year: 1985, condition: 'Fair', estimated_lifespan_years: 30, replacement_cost_estimate: 4000 },
    { id: 'sys-48', property_id: 'demo-investor-3', system_type: 'Smoke Detector', nickname: 'Smoke Detectors (12)', installation_year: 2015, condition: 'Good', estimated_lifespan_years: 10, replacement_cost_estimate: 400 }
  ],

  tasks: [
    {
      id: 'inv-task-1',
      property_id: 'demo-investor-3',
      title: 'Turnover Unit 4D at Cedar Court',
      description: 'Complete turnover within 7 days to minimize vacancy loss. Includes deep clean, carpet shampoo, paint touch-ups, HVAC filter, appliance check.',
      priority: 'High',
      status: 'Identified',
      scheduled_date: '2024-11-22',
      current_fix_cost: 1850,
      cascade_risk_score: 6,
      cascade_risk_reason: 'Each day delayed = $30 lost revenue',
      system_type: 'General',
      source: 'MANUAL',
      unit_tag: '4D'
    },
    {
      id: 'inv-task-2',
      property_id: 'demo-investor-3',
      title: 'Cedar Court Roof Replacement (Plan for 2025)',
      description: 'Asphalt shingles are 22 years old. Minor leaks starting in Unit 2C. Replace before rainy season 2025.',
      priority: 'High',
      status: 'Identified',
      scheduled_date: '2025-04-01',
      current_fix_cost: 14500,
      delayed_fix_cost: 23000,
      cascade_risk_score: 9,
      cascade_risk_reason: 'Delaying 1 year could cause $8K-$15K in interior water damage across 4 units',
      system_type: 'Roof',
      source: 'PRESERVATION_RECOMMENDATION',
      scope: 'building_wide'
    },
    {
      id: 'inv-task-3',
      property_id: 'demo-investor-1',
      title: 'Annual Safety Inspections - Maple Street',
      description: 'State law requires annual CO/smoke detector testing for rentals.',
      priority: 'High',
      status: 'Identified',
      scheduled_date: '2024-12-15',
      current_fix_cost: 150,
      cascade_risk_score: 3,
      cascade_risk_reason: 'Non-compliance = $500-$2000 fines',
      system_type: 'General',
      source: 'SEASONAL_CHECKLIST',
      scope: 'building_wide'
    },
    {
      id: 'inv-task-4',
      property_id: 'demo-investor-1',
      title: 'Water Heater Replacement - Unit A',
      description: 'Unit A water heater is 11 years old. Proactive replacement prevents emergency scenario mid-winter.',
      priority: 'Medium',
      status: 'Scheduled',
      scheduled_date: '2024-12-30',
      current_fix_cost: 1200,
      delayed_fix_cost: 1700,
      cascade_risk_score: 6,
      cascade_risk_reason: 'Emergency replacement costs 40% more + tenant satisfaction risk',
      system_type: 'Plumbing',
      source: 'PRESERVATION_RECOMMENDATION',
      unit_tag: 'A'
    },
    {
      id: 'inv-task-5',
      property_id: 'demo-investor-2',
      title: 'HVAC Tune-Up Before Heating Season',
      description: 'Annual preventive maintenance extends HVAC life 5-7 years and maintains efficiency.',
      priority: 'Routine',
      status: 'Scheduled',
      scheduled_date: '2024-11-25',
      current_fix_cost: 185,
      cascade_risk_score: 2,
      system_type: 'HVAC',
      source: 'SEASONAL_CHECKLIST',
      scope: 'building_wide'
    },
    {
      id: 'inv-task-6',
      property_id: 'demo-investor-3',
      title: 'Refrigerator Repair - Unit 3B',
      description: 'Compressor making noise, likely needs replacement soon.',
      priority: 'Medium',
      status: 'Identified',
      current_fix_cost: 850,
      cascade_risk_score: 4,
      system_type: 'Appliances',
      source: 'INSPECTION',
      unit_tag: '3B'
    }
  ],

  inspections: [
    {
      id: 'insp-1',
      property_id: 'demo-investor-1',
      season: 'Fall',
      year: 2024,
      inspection_date: '2024-10-15',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 3
    },
    {
      id: 'insp-2',
      property_id: 'demo-investor-2',
      season: 'Fall',
      year: 2024,
      inspection_date: '2024-09-28',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 0
    },
    {
      id: 'insp-3',
      property_id: 'demo-investor-3',
      season: 'Fall',
      year: 2024,
      inspection_date: '2024-11-01',
      status: 'Completed',
      completion_percentage: 100,
      issues_found: 5
    }
  ],

  maintenanceHistory: [
    {
      id: 'maint-1',
      property_id: 'demo-investor-3',
      title: 'Emergency plumbing repair - Unit 3B',
      completion_date: '2024-11-05',
      actual_cost: 385,
      execution_type: 'Professional',
      status: 'Completed'
    },
    {
      id: 'maint-2',
      property_id: 'demo-investor-1',
      title: 'Gutter cleaning (both units)',
      completion_date: '2024-10-20',
      actual_cost: 150,
      execution_type: 'Professional',
      status: 'Completed'
    },
    {
      id: 'maint-3',
      property_id: 'demo-investor-2',
      title: 'HVAC annual service',
      completion_date: '2024-09-15',
      actual_cost: 185,
      execution_type: 'Professional',
      status: 'Completed'
    },
    {
      id: 'maint-4',
      property_id: 'demo-investor-3',
      title: 'Repaint Unit 1A after move-out',
      completion_date: '2024-08-12',
      actual_cost: 850,
      execution_type: 'Professional',
      status: 'Completed'
    }
  ],

  upgrades: [
    {
      id: 'inv-upgrade-1',
      property_id: 'demo-investor-3',
      title: 'Energy Efficient Windows - All 4 Units',
      category: 'Energy Efficiency',
      description: 'Replace all single-pane windows with dual-pane low-E windows. Reduces heating costs 25-30% and increases property value.',
      status: 'Planned',
      investment_required: 9800,
      annual_savings: 840,
      roi_timeline_months: 140,
      property_value_impact: 6000,
      priority_score: 7
    },
    {
      id: 'inv-upgrade-2',
      property_id: 'demo-investor-1',
      title: 'Add In-Unit Washer/Dryer Hookups',
      category: 'Rental Income Boosters',
      description: 'Add W/D hookups to both units. Increases rent $75-100/unit per month.',
      status: 'Identified',
      investment_required: 5000,
      annual_savings: 2100,
      roi_timeline_months: 29,
      property_value_impact: 8000,
      priority_score: 9
    },
    {
      id: 'inv-upgrade-3',
      property_id: 'demo-investor-2',
      title: 'Smart Home Package',
      category: 'Rental Income Boosters',
      description: 'Smart thermostat, doorbell camera, smart locks. Premium tenant appeal.',
      status: 'Identified',
      investment_required: 1050,
      annual_savings: 750,
      roi_timeline_months: 17,
      property_value_impact: 3000,
      priority_score: 6
    },
    {
      id: 'inv-upgrade-4',
      property_id: 'demo-investor-3',
      title: 'Landscaping Refresh - Cedar Court',
      category: 'Curb Appeal',
      description: 'New bark, flower beds, pathway lighting. First impression matters for vacancy turnovers.',
      status: 'In Progress',
      progress_percentage: 35,
      investment_required: 2800,
      property_value_impact: 4500,
      priority_score: 5
    }
  ],

  preserveSchedules: [
    {
      id: 'preserve-inv-1',
      property_id: 'demo-investor-3',
      total_investment: 3800,
      total_replacement_costs_avoided: 21500,
      average_roi: 5.7,
      interventions: [
        {
          id: 'int-1',
          system_name: 'Roof System',
          intervention: 'Professional roof coating + targeted shingle repairs',
          description: '22-year-old asphalt shingles showing minor wear. Strategic coating extends life 5-7 years and seals minor leaks before they cascade.',
          investment_cost: 2200,
          replacement_cost_avoided: 14500,
          years_extended: 6,
          roi_multiplier: 6.6,
          frequency: 'One-time (then monitor)',
          status: 'Recommended',
          why_worth_it: '$2,200 now extends roof 6 years = delays $14,500 replacement. Prevents interior water damage across 4 units.',
          not_routine_because: 'This is NOT a cleaning. Strategic coating intervention extends capital asset life. Routine = gutter cleaning (ACT phase).'
        },
        {
          id: 'int-2',
          system_name: 'HVAC System',
          intervention: 'Add zoning controls + smart thermostats',
          description: 'Building HVAC is 39 years old but still functional. Adding zone controls reduces strain, extends life 3-5 years, cuts energy 20%.',
          investment_cost: 1200,
          replacement_cost_avoided: 6500,
          years_extended: 4,
          roi_multiplier: 5.4,
          frequency: 'One-time upgrade',
          status: 'Planned',
          why_worth_it: '$1,200 smart upgrade delays $18K HVAC replacement 4 years. Also saves $300/year on energy = extra ROI.',
          not_routine_because: 'This is capital improvement, not maintenance. Routine = filter changes (ACT phase).'
        }
      ]
    },
    {
      id: 'preserve-inv-2',
      property_id: 'demo-investor-1',
      total_investment: 1400,
      total_replacement_costs_avoided: 4800,
      average_roi: 3.4,
      interventions: [
        {
          id: 'int-3',
          system_name: 'Water Heater - Unit A',
          intervention: 'Install anode rod + flush sediment',
          description: '11-year-old water heater. Strategic anode replacement extends life 3-5 years, prevents emergency winter failure.',
          investment_cost: 350,
          replacement_cost_avoided: 1400,
          years_extended: 4,
          roi_multiplier: 4.0,
          frequency: 'Every 4-5 years',
          status: 'Recommended',
          why_worth_it: '$350 extends life 4 years. Avoids mid-winter emergency replacement at 2x cost + tenant disruption.',
          not_routine_because: 'Anode replacement is strategic preservation, not routine flush (that\'s ACT).'
        },
        {
          id: 'int-4',
          system_name: 'Water Heater - Unit B',
          intervention: 'Install anode rod + flush sediment',
          description: '11-year-old water heater. Strategic anode replacement extends life 3-5 years.',
          investment_cost: 350,
          replacement_cost_avoided: 1400,
          years_extended: 4,
          roi_multiplier: 4.0,
          frequency: 'Every 4-5 years',
          status: 'Recommended',
          why_worth_it: 'Same as Unit A. Do both at once for efficiency.',
          not_routine_because: 'Strategic preservation intervention.'
        },
        {
          id: 'int-5',
          system_name: 'Roof System',
          intervention: 'Preventive flashing repair + seal joints',
          description: 'Roof is 10 years old. Minor flashing gaps detected. Sealing now prevents major leaks and extends roof life 2-3 years.',
          investment_cost: 700,
          replacement_cost_avoided: 2000,
          years_extended: 3,
          roi_multiplier: 2.9,
          frequency: 'One-time',
          status: 'Optional',
          why_worth_it: '$700 to seal problem areas prevents $2K in emergency repairs + interior damage.',
          not_routine_because: 'Strategic sealing intervention, not routine gutter cleaning.'
        }
      ]
    }
  ],

  scaleData: {
    portfolioSummary: {
      totalProperties: 3,
      totalUnits: 7,
      totalValue: 785000,
      totalEquity: 412000,
      totalDebt: 373000,
      ltv: 47.5,
      avgHealthScore: 81,
      occupancyRate: 86,
      monthlyRevenue: 4850,
      monthlyExpenses: 2140,
      netCashFlow: 2710,
      annualizedROI: 18.2,
      cashOnCashReturn: 22.4
    },

    tenYearProjection: {
      currentEquity: 412000,
      projectedEquity2034: 892000,
      wealthGain: 480000,
      assumedAppreciation: 3.5,
      assumedRentGrowth: 2.8,
      projectedCashFlow2034: 5840,
      totalCashFlowDecade: 389000,
      totalWealth2034: 1281000
    },

    propertyComparison: [
      {
        property: 'Maple Street Duplex',
        healthScore: 84,
        equity: 142000,
        cashFlow: 1220,
        roi: 21.2,
        recommendation: 'Hold - Strong performer, minimal CapEx needed',
        nextMajorExpense: 'Roof replacement 2027 (~$8,500)'
      },
      {
        property: 'Oak Ridge Single Family',
        healthScore: 88,
        equity: 110000,
        cashFlow: 830,
        roi: 16.5,
        recommendation: 'Hold - Newer property, low maintenance, appreciating market',
        nextMajorExpense: 'HVAC replacement 2032 (~$6,200)'
      },
      {
        property: 'Cedar Court 4-Plex',
        healthScore: 72,
        equity: 115000,
        cashFlow: 1550,
        roi: 17.8,
        recommendation: 'Invest - Roof CapEx 2025 ($14.5K) will boost health score to 85+',
        nextMajorExpense: 'Roof replacement 2025 (~$14,500) - CRITICAL'
      }
    ],

    capExPlanning: {
      next12Months: 16500,
      next5Years: 42000,
      breakdown: [
        { item: 'Cedar Court Roof', year: 2025, cost: 14500 },
        { item: 'Maple Street Water Heaters', year: 2025, cost: 2400 },
        { item: 'Oak Ridge Deck Reseal', year: 2026, cost: 1200 },
        { item: 'Maple Street Roof', year: 2027, cost: 8500 },
        { item: 'Cedar Court HVAC', year: 2028, cost: 18000 }
      ]
    },

    acquisitionOpportunity: {
      message: 'Based on your cash flow ($2,710/mo) and equity ($412K), you could acquire a 4th property',
      potentialPurchasePrice: 350000,
      downPayment: 70000,
      projectedCashFlow: 950,
      newPortfolioROI: 19.1,
      recommendation: 'Consider HELOC on Maple Street ($142K equity) to fund down payment'
    }
  }
};