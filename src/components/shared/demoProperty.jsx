// Demo property data for preview mode - allows users to explore the app before adding their own property

export const DEMO_PROPERTY = {
  id: "demo-property-001",
  address: "742 Evergreen Terrace, Springfield, OR 97477",
  street_address: "742 Evergreen Terrace",
  city: "Springfield",
  state: "OR",
  zip_code: "97477",
  property_type: "Single-Family Home",
  property_use: "Primary Residence",
  year_built: 1985,
  square_footage: 2400,
  bedrooms: 4,
  bathrooms: 2.5,
  occupancy_status: "Owner Occupied",
  baseline_completion: 100,
  health_score: 72,
  setup_completed: true,
  is_demo: true
};

export const DEMO_SYSTEMS = [
  {
    id: "demo-sys-001",
    property_id: "demo-property-001",
    system_type: "HVAC System",
    brand_model: "Carrier Infinity",
    installation_year: 2015,
    condition: "Good",
    estimated_lifespan_years: 20,
    is_required: true
  },
  {
    id: "demo-sys-002",
    property_id: "demo-property-001",
    system_type: "Plumbing System",
    brand_model: "Rheem Water Heater",
    installation_year: 2018,
    condition: "Excellent",
    estimated_lifespan_years: 12,
    key_components: {
      water_heater_type: "tank",
      water_heater_capacity: "50"
    },
    is_required: true
  },
  {
    id: "demo-sys-003",
    property_id: "demo-property-001",
    system_type: "Roof System",
    installation_year: 2010,
    condition: "Good",
    estimated_lifespan_years: 25,
    key_components: {
      material_type: "asphalt_architectural"
    },
    is_required: true
  },
  {
    id: "demo-sys-004",
    property_id: "demo-property-001",
    system_type: "Electrical System",
    brand_model: "Square D",
    installation_year: 1985,
    condition: "Fair",
    key_components: {
      panel_capacity: "200",
      wiring_type: "copper"
    },
    is_required: true
  }
];

export const DEMO_TASKS = [
  {
    id: "demo-task-001",
    property_id: "demo-property-001",
    title: "Replace HVAC Air Filter",
    description: "Change air filter to maintain efficiency and air quality",
    system_type: "HVAC",
    priority: "Routine",
    status: "Identified",
    diy_cost: 25,
    contractor_cost: 75,
    cascade_risk_score: 3
  },
  {
    id: "demo-task-002",
    property_id: "demo-property-001",
    title: "Clean Gutters Before Fall Rain",
    description: "Remove leaves and debris to prevent water damage",
    system_type: "Gutters",
    priority: "High",
    status: "Identified",
    diy_cost: 0,
    contractor_cost: 150,
    cascade_risk_score: 8,
    scheduled_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "demo-task-003",
    property_id: "demo-property-001",
    title: "Test Smoke Detectors",
    description: "Test all smoke detectors and replace batteries",
    system_type: "General",
    priority: "Medium",
    status: "Completed",
    diy_cost: 15,
    completion_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];