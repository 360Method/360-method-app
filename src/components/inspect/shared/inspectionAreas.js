/**
 * Inspection Areas - Central definition of all inspectable areas
 * Used by both Quick Spot Check and Full Walkthrough flows
 */

export const INSPECTION_AREAS = [
  {
    id: 'hvac',
    name: 'HVAC & Heating',
    icon: '❄️',
    color: '#3B82F6', // blue
    zone: 'mechanical',
    quickCheckpoints: 3,
    fullCheckpoints: 6,
    estimatedMinutes: { quick: 2, full: 5 },
    whatToCheck: 'filter condition, airflow, unusual sounds, thermostat operation',
    systemTypes: ['HVAC System']
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🚿',
    color: '#06B6D4', // cyan
    zone: 'mechanical',
    quickCheckpoints: 3,
    fullCheckpoints: 7,
    estimatedMinutes: { quick: 2, full: 5 },
    whatToCheck: 'leaks, water pressure, drains, water heater, shutoff valves',
    systemTypes: ['Plumbing System', 'Water & Sewer/Septic']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    color: '#F59E0B', // amber
    zone: 'mechanical',
    quickCheckpoints: 3,
    fullCheckpoints: 5,
    estimatedMinutes: { quick: 2, full: 4 },
    whatToCheck: 'panel condition, GFCI outlets, lights, switches, exposed wiring',
    systemTypes: ['Electrical System']
  },
  {
    id: 'foundation',
    name: 'Foundation',
    icon: '🧱',
    color: '#78716C', // stone
    zone: 'basement',
    quickCheckpoints: 3,
    fullCheckpoints: 5,
    estimatedMinutes: { quick: 2, full: 5 },
    whatToCheck: 'cracks, settling, moisture, drainage',
    systemTypes: ['Foundation & Structure']
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    color: '#EF4444', // red
    zone: 'interior',
    quickCheckpoints: 4,
    fullCheckpoints: 8,
    estimatedMinutes: { quick: 3, full: 6 },
    whatToCheck: 'appliances, plumbing fixtures, garbage disposal',
    systemTypes: ['Plumbing System', 'Refrigerator', 'Range/Oven', 'Dishwasher', 'Microwave', 'Garbage Disposal']
  },
  {
    id: 'bathrooms',
    name: 'Bathrooms',
    icon: '🚽',
    color: '#8B5CF6', // violet
    zone: 'interior',
    quickCheckpoints: 4,
    fullCheckpoints: 7,
    estimatedMinutes: { quick: 3, full: 5 },
    whatToCheck: 'fixtures, caulking, ventilation, water pressure',
    systemTypes: ['Plumbing System']
  },
  {
    id: 'attic',
    name: 'Attic & Insulation',
    icon: '🏚️',
    color: '#A855F7', // purple
    zone: 'upper',
    quickCheckpoints: 3,
    fullCheckpoints: 5,
    estimatedMinutes: { quick: 2, full: 5 },
    whatToCheck: 'insulation depth, ventilation, moisture, roof deck',
    systemTypes: ['Attic & Insulation']
  },
  {
    id: 'exterior',
    name: 'Exterior Siding',
    icon: '🏡',
    color: '#10B981', // emerald
    zone: 'exterior',
    quickCheckpoints: 3,
    fullCheckpoints: 6,
    estimatedMinutes: { quick: 2, full: 5 },
    whatToCheck: 'damage, rot, caulking, paint condition',
    systemTypes: ['Exterior Siding & Envelope', 'Foundation & Structure']
  },
  {
    id: 'gutters',
    name: 'Gutters & Downspouts',
    icon: '🌧️',
    color: '#6366F1', // indigo
    zone: 'exterior',
    quickCheckpoints: 3,
    fullCheckpoints: 5,
    estimatedMinutes: { quick: 2, full: 4 },
    whatToCheck: 'debris, sagging, proper drainage, attachments',
    systemTypes: ['Gutters & Downspouts']
  },
  {
    id: 'roof',
    name: 'Roof',
    icon: '🏠',
    color: '#DC2626', // red-600
    zone: 'exterior',
    quickCheckpoints: 3,
    fullCheckpoints: 6,
    estimatedMinutes: { quick: 2, full: 5 },
    whatToCheck: 'missing shingles, flashing, vents, moss growth, general condition',
    systemTypes: ['Roof System']
  },
  {
    id: 'driveways',
    name: 'Driveways & Hardscaping',
    icon: '🚗',
    color: '#64748B', // slate
    zone: 'exterior',
    quickCheckpoints: 3,
    fullCheckpoints: 4,
    estimatedMinutes: { quick: 2, full: 3 },
    whatToCheck: 'cracks, settling, drainage, trip hazards',
    systemTypes: ['Driveways & Hardscaping']
  },
  {
    id: 'windows',
    name: 'Windows & Doors',
    icon: '🪟',
    color: '#0EA5E9', // sky
    zone: 'exterior',
    quickCheckpoints: 3,
    fullCheckpoints: 5,
    estimatedMinutes: { quick: 2, full: 4 },
    whatToCheck: 'seals, operation, locks, weatherstripping',
    systemTypes: ['Windows & Doors']
  },
  {
    id: 'safety',
    name: 'Safety Systems',
    icon: '🚨',
    color: '#EF4444', // red
    zone: 'safety',
    quickCheckpoints: 4,
    fullCheckpoints: 6,
    estimatedMinutes: { quick: 3, full: 5 },
    whatToCheck: 'smoke detectors, CO detectors, fire extinguishers, test dates',
    systemTypes: ['Smoke Detector', 'CO Detector', 'Fire Extinguisher', 'Security System', 'Radon Test']
  }
];

// Physical zones for guided walkthrough
export const INSPECTION_ZONES = [
  {
    id: 'mechanical',
    name: 'Mechanical Room',
    emoji: '🔧',
    areas: ['hvac', 'plumbing', 'electrical'],
    estimatedTime: '10-15 min',
    description: 'Start here - most critical systems in one place'
  },
  {
    id: 'basement',
    name: 'Basement/Crawlspace',
    emoji: '🏚️',
    areas: ['foundation'],
    estimatedTime: '5-8 min',
    description: 'While you\'re downstairs, check the foundation'
  },
  {
    id: 'interior',
    name: 'Interior Spaces',
    emoji: '🏠',
    areas: ['kitchen', 'bathrooms'],
    estimatedTime: '10-12 min',
    description: 'Living areas and fixtures'
  },
  {
    id: 'upper',
    name: 'Upper Level',
    emoji: '⬆️',
    areas: ['attic'],
    estimatedTime: '5-8 min',
    description: 'Check attic and insulation'
  },
  {
    id: 'exterior',
    name: 'Exterior Walk',
    emoji: '🌳',
    areas: ['exterior', 'gutters', 'roof', 'driveways', 'windows'],
    estimatedTime: '15-20 min',
    description: 'Walk the perimeter of your property'
  },
  {
    id: 'safety',
    name: 'Safety Check',
    emoji: '🚨',
    areas: ['safety'],
    estimatedTime: '5-10 min',
    description: 'Final safety systems check'
  }
];

// Helper functions
export const getAreaById = (areaId) => {
  return INSPECTION_AREAS.find(area => area.id === areaId);
};

export const getAreasInZone = (zoneId) => {
  const zone = INSPECTION_ZONES.find(z => z.id === zoneId);
  if (!zone) return [];
  return INSPECTION_AREAS.filter(area => zone.areas.includes(area.id));
};

export const getZoneForArea = (areaId) => {
  return INSPECTION_ZONES.find(zone => zone.areas.includes(areaId));
};

export const calculateTotalTime = (areaIds, mode = 'quick') => {
  return areaIds.reduce((total, areaId) => {
    const area = getAreaById(areaId);
    return total + (area?.estimatedMinutes[mode] || 0);
  }, 0);
};

// Get ordered areas for full walkthrough (by zone order)
export const getOrderedAreasForWalkthrough = () => {
  const orderedAreas = [];
  INSPECTION_ZONES.forEach(zone => {
    zone.areas.forEach(areaId => {
      const area = getAreaById(areaId);
      if (area) {
        orderedAreas.push({
          ...area,
          zoneName: zone.name,
          zoneEmoji: zone.emoji
        });
      }
    });
  });
  return orderedAreas;
};
