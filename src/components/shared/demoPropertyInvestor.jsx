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
    // Maple Street Duplex Systems
    { id: 'sys-1', property_id: 'demo-investor-1', system_type: 'HVAC System', nickname: 'Unit A Furnace', installation_year: 2010, condition: 'Good', last_service_date: '2024-09-15' },
    { id: 'sys-2', property_id: 'demo-investor-1', system_type: 'HVAC System', nickname: 'Unit B Furnace', installation_year: 2010, condition: 'Good', last_service_date: '2024-09-15' },
    { id: 'sys-3', property_id: 'demo-investor-1', system_type: 'Water & Sewer/Septic', nickname: 'Main Water Line', installation_year: 1998, condition: 'Good' },
    { id: 'sys-4', property_id: 'demo-investor-1', system_type: 'Roof System', nickname: 'Main Roof', installation_year: 2014, condition: 'Good', next_replacement_forecast: '2027' },
    
    // Oak Ridge Systems
    { id: 'sys-5', property_id: 'demo-investor-2', system_type: 'HVAC System', nickname: 'Main System', installation_year: 2005, condition: 'Excellent', last_service_date: '2024-09-15' },
    { id: 'sys-6', property_id: 'demo-investor-2', system_type: 'Roof System', nickname: 'Composition Shingle', installation_year: 2005, condition: 'Good' },
    { id: 'sys-7', property_id: 'demo-investor-2', system_type: 'Water & Sewer/Septic', nickname: 'Main Plumbing', installation_year: 2005, condition: 'Excellent' },
    
    // Cedar Court Systems
    { id: 'sys-8', property_id: 'demo-investor-3', system_type: 'Roof System', nickname: 'Main Roof', installation_year: 2003, condition: 'Fair', warning_signs_present: ['Minor leaks in Unit 2C'] },
    { id: 'sys-9', property_id: 'demo-investor-3', system_type: 'HVAC System', nickname: 'Building HVAC', installation_year: 1985, condition: 'Fair' }
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
      estimated_cost_low: 8500,
      estimated_cost_high: 11200,
      annual_savings: 840,
      payback_period_years: 12,
      total_savings_10yr: 8400,
      why_worth_it: 'Tenant comfort + energy savings + modernization. Will pay for itself in 12 years and adds $6K to building value.'
    },
    {
      id: 'inv-upgrade-2',
      property_id: 'demo-investor-1',
      title: 'Add In-Unit Washer/Dryer Hookups',
      category: 'Rental Income Boosters',
      description: 'Add W/D hookups to both units. Increases rent $75-100/unit per month.',
      status: 'Researching',
      estimated_cost_low: 4200,
      estimated_cost_high: 5800,
      rental_boost_per_month: 175,
      payback_period_years: 2.8,
      why_worth_it: '$175/mo extra income = $2,100/year. Pays for itself in 2.8 years, then pure profit.'
    },
    {
      id: 'inv-upgrade-3',
      property_id: 'demo-investor-2',
      title: 'Smart Home Package',
      category: 'Quality of Life',
      description: 'Smart thermostat, doorbell camera, smart locks. Premium tenant appeal.',
      status: 'Wishlist',
      estimated_cost_low: 850,
      estimated_cost_high: 1250,
      why_worth_it: 'Modern tech-savvy tenants willing to pay $50-75/mo more for smart features. Differentiates from competition.'
    },
    {
      id: 'inv-upgrade-4',
      property_id: 'demo-investor-3',
      title: 'Landscaping Refresh - Cedar Court',
      category: 'Quality of Life',
      description: 'New bark, flower beds, pathway lighting. First impression matters for vacancy turnovers.',
      status: 'In Progress',
      progress_percentage: 35,
      estimated_cost_low: 2400,
      estimated_cost_high: 3200,
      why_worth_it: 'Professional curb appeal reduces vacancy days by 30-50%. One month of reduced vacancy ($900) covers most of the cost.'
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