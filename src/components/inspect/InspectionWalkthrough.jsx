
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronRight, MapPin, Navigation, ArrowLeft } from "lucide-react";
// Removed createPageUrl and Link as they are not used in this component's logic.
import AreaInspection from "./AreaInspection";

// Physical zone-based routing for efficient inspection
const INSPECTION_ZONES = [
  {
    id: 'mechanical',
    name: '🔧 Mechanical Room',
    areas: ['hvac', 'plumbing', 'electrical'],
    estimatedTime: '10-15 min',
    why: 'Start here - most critical systems in one place'
  },
  {
    id: 'basement',
    name: '🏚️ Basement/Foundation',
    areas: ['foundation'], // 'basement' was added in outline but not in INSPECTION_AREAS, so keeping only 'foundation' here
    estimatedTime: '5-8 min',
    why: 'While you\'re downstairs'
  },
  {
    id: 'interior',
    name: '🏠 Interior Spaces',
    areas: ['kitchen', 'bathrooms'],
    estimatedTime: '10-12 min',
    why: 'Living areas and fixtures'
  },
  {
    id: 'upper',
    name: '🏚️ Upper Level', // Reusing '🏚️' icon for attic
    areas: ['attic'],
    estimatedTime: '5-8 min',
    why: 'Check attic and insulation'
  },
  {
    id: 'exterior',
    name: '🌳 Exterior Walk',
    areas: ['exterior', 'gutters', 'roof', 'driveways', 'windows'],
    estimatedTime: '15-20 min',
    why: 'Walk the perimeter'
  },
  {
    id: 'safety',
    name: '🚨 Safety Check',
    areas: ['safety'],
    estimatedTime: '5-10 min',
    why: 'Final safety systems check'
  }
];

const AREA_TO_SYSTEM_MAP = {
  'hvac': ['HVAC System'],
  'plumbing': ['Plumbing System', 'Water & Sewer/Septic'],
  'electrical': ['Electrical System'],
  'gutters': ['Gutters & Downspouts'],
  'roof': ['Roof System'],
  'foundation': ['Foundation & Structure'],
  'exterior': ['Exterior Siding & Envelope', 'Foundation & Structure'],
  'driveways': ['Driveways & Hardscaping'],
  'attic': ['Attic & Insulation'],
  'windows': ['Windows & Doors'],
  'kitchen': ['Plumbing System', 'Refrigerator', 'Range/Oven', 'Dishwasher', 'Microwave', 'Garbage Disposal'],
  'bathrooms': ['Plumbing System'],
  'safety': ['Smoke Detector', 'CO Detector', 'Fire Extinguisher', 'Security System', 'Radon Test']
};

const INSPECTION_AREAS = [
  { id: 'hvac', name: 'HVAC & Heating', icon: '❄️', whatToCheck: 'filter condition, airflow, unusual sounds, thermostat operation' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚿', whatToCheck: 'leaks, water pressure, drains, water heater, shutoff valves' },
  { id: 'electrical', name: 'Electrical', icon: '⚡', whatToCheck: 'panel condition, GFCI outlets, lights, switches, exposed wiring' },
  { id: 'gutters', name: 'Gutters & Downspouts', icon: '🌧️', whatToCheck: 'debris, sagging, proper drainage, attachments' },
  { id: 'roof', name: 'Roof', icon: '🏠', whatToCheck: 'missing shingles, flashing, vents, moss growth, general condition' },
  { id: 'foundation', name: 'Foundation', icon: '🧱', whatToCheck: 'cracks, settling, moisture, drainage' },
  { id: 'exterior', name: 'Exterior Siding', icon: '🏡', whatToCheck: 'damage, rot, caulking, paint condition' },
  { id: 'driveways', name: 'Driveways & Hardscaping', icon: '🚗', whatToCheck: 'cracks, settling, drainage, trip hazards' },
  { id: 'attic', name: 'Attic & Insulation', icon: '🏚️', whatToCheck: 'insulation depth, ventilation, moisture, roof deck' },
  { id: 'windows', name: 'Windows & Doors', icon: '🪟', whatToCheck: 'seals, operation, locks, weatherstripping' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', whatToCheck: 'appliances, plumbing fixtures, garbage disposal' },
  { id: 'bathrooms', name: 'Bathrooms', icon: '🚽', whatToCheck: 'fixtures, caulking, ventilation, water pressure' },
  { id: 'safety', name: 'Safety Systems', icon: '🚨', whatToCheck: 'smoke detectors, CO detectors, fire extinguishers, test dates' }
];

export default function InspectionWalkthrough({ inspection, property, onComplete, onBack }) {
  const [currentAreaIndex, setCurrentAreaIndex] = React.useState(null);
  const [inspectionData, setInspectionData] = React.useState(() => {
    // Initialize inspectionData from existing checklist items if available
    const existingItems = inspection.checklist_items || [];
    const groupedByArea = {};
    existingItems.forEach(item => {
      if (item.area_id) {
        if (!groupedByArea[item.area_id]) {
          groupedByArea[item.area_id] = [];
        }
        groupedByArea[item.area_id].push(item);
      }
    });
    return groupedByArea;
  });
  const [routeMode, setRouteMode] = React.useState('physical'); // 'physical' or 'traditional'
  const [completedZones, setCompletedZones] = React.useState([]);

  const queryClient = useQueryClient();

  const { data: baselineSystems = [] } = useQuery({
    queryKey: ['systemBaselines', property.id],
    queryFn: () => base44.entities.SystemBaseline.filter({ property_id: property.id }),
  });

  const updateInspectionMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Inspection.update(inspection.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      // The outline specified onComplete() without args. Original passed updatedInspection.
      // Adhering to outline for now.
      onComplete(); 
    },
  });

  // Get systems grouped by baseline for smart grouping
  const systemsByType = baselineSystems.reduce((acc, system) => {
    if (!acc[system.system_type]) {
      acc[system.system_type] = [];
    }
    acc[system.system_type].push(system);
    return acc;
  }, {});

  // Calculate progress by zones or areas
  const getProgress = () => {
    if (routeMode === 'physical') {
      const totalZones = INSPECTION_ZONES.length;
      const completedCount = completedZones.length;
      return { completed: completedCount, total: totalZones, percent: Math.round((completedCount / totalZones) * 100) };
    } else {
      const completedAreas = Object.keys(inspectionData).length;
      return { completed: completedAreas, total: INSPECTION_AREAS.length, percent: Math.round((completedAreas / INSPECTION_AREAS.length) * 100) };
    }
  };

  const progress = getProgress();

  // Handle zone completion
  const handleZoneComplete = (zoneId) => {
    if (!completedZones.includes(zoneId)) {
      setCompletedZones(prev => [...prev, zoneId]);
    }
  };

  // Group areas by physical zones for efficient routing
  const getAreasInZone = (zoneId) => {
    const zone = INSPECTION_ZONES.find(z => z.id === zoneId);
    if (!zone) return [];
    return INSPECTION_AREAS.filter(area => zone.areas.includes(area.id));
  };

  const handleAreaComplete = (areaId, data) => {
    setInspectionData(prev => ({
      ...prev,
      [areaId]: data
    }));
    setCurrentAreaIndex(null); // Return to the list after an area is completed
  };

  const handleFinishInspection = async () => {
    const allIssues = Object.values(inspectionData).flat();
    const issuesCount = allIssues.length;
    const completionPercent = Math.round((Object.keys(inspectionData).length / INSPECTION_AREAS.length) * 100);

    await updateInspectionMutation.mutateAsync({
      checklist_items: allIssues,
      issues_found: issuesCount,
      completion_percentage: completionPercent,
      status: 'Completed',
      inspection_date: new Date().toISOString().split('T')[0]
    });
  };

  if (currentAreaIndex !== null) {
    const currentArea = INSPECTION_AREAS[currentAreaIndex];
    const existingIssues = inspectionData[currentArea.id] || [];

    return (
      <AreaInspection
        area={currentArea}
        inspection={inspection}
        property={property}
        baselineSystems={baselineSystems}
        existingIssues={existingIssues}
        onComplete={(data) => handleAreaComplete(currentArea.id, data)}
        onBack={() => setCurrentAreaIndex(null)}
      />
    );
  }

  // Physical Zone View
  if (routeMode === 'physical') {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inspection Setup
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
              Physical Walkthrough
            </h1>
            <p className="text-gray-600">Follow the optimal route through your property</p>
          </div>

          {/* Progress Card */}
          <Card className="border-2 border-blue-300 shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  <CardTitle>Inspection Progress</CardTitle>
                </div>
                <Badge className="bg-white text-blue-900">
                  Zone {completedZones.length + 1} of {INSPECTION_ZONES.length}
                </Badge>
              </div>
              <Progress value={progress.percent} className="h-2 bg-blue-200" />
              <p className="text-blue-100 text-sm mt-2">
                {progress.completed} zones complete • {INSPECTION_ZONES.length - progress.completed} remaining
              </p>
            </CardHeader>
          </Card>

          {/* Zone Cards */}
          <div className="space-y-4 mb-6">
            {INSPECTION_ZONES.map((zone, zoneIdx) => {
              const areasInZone = getAreasInZone(zone.id);
              const allAreasInZoneChecked = areasInZone.every(area => inspectionData[area.id]);
              const isZoneComplete = completedZones.includes(zone.id);

              return (
                <Card 
                  key={zone.id} 
                  className={`border-2 ${
                    isZoneComplete ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{zone.name.split(' ')[0]}</div>
                        <div>
                          <CardTitle className="text-lg">
                            {zone.name.replace(/[^a-zA-Z\s]/g, '').trim()}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{zone.why}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">{zone.estimatedTime}</div>
                        {isZoneComplete && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {areasInZone.map((area, idx) => {
                        const areaIndex = INSPECTION_AREAS.findIndex(a => a.id === area.id);
                        const isAreaComplete = inspectionData[area.id];
                        const issueCount = (inspectionData[area.id] || []).length;

                        // Get relevant systems for this area
                        const relevantSystemTypes = AREA_TO_SYSTEM_MAP[area.id] || [];
                        const systemsInArea = relevantSystemTypes.flatMap(type => systemsByType[type] || []);

                        return (
                          <div
                            key={area.id}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                              isAreaComplete ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                            } transition-colors cursor-pointer`}
                            onClick={() => setCurrentAreaIndex(areaIndex)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{area.icon}</span>
                              <div>
                                <p className="font-semibold text-gray-900">{area.name}</p>
                                {systemsInArea.length > 0 && (
                                  <p className="text-xs text-gray-600">
                                    {systemsInArea.length} system{systemsInArea.length > 1 ? 's' : ''} documented
                                  </p>
                                )}
                                {issueCount > 0 && (
                                  <Badge className="bg-orange-600 text-white text-xs mt-1">
                                    {issueCount} issue{issueCount > 1 ? 's' : ''} found
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAreaComplete ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!isZoneComplete && allAreasInZoneChecked && (
                      <Button
                        onClick={() => handleZoneComplete(zone.id)}
                        className="w-full mt-4 gap-2"
                        style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Zone Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setRouteMode('traditional')}
              variant="outline"
              className="w-full"
              style={{ minHeight: '48px' }}
            >
              Switch to Traditional View
            </Button>

            {progress.percent >= 80 && (
              <Button
                onClick={handleFinishInspection}
                className="w-full gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                disabled={updateInspectionMutation.isPending}
              >
                {updateInspectionMutation.isPending ? 'Saving...' : 'Complete Inspection'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Traditional Area View
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Setup
        </Button>

        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            {inspection.season} {inspection.year} Inspection
          </h1>
          <p className="text-gray-600">Check off each area as you go</p>
        </div>

        <Card className="border-2 border-blue-300 shadow-lg mb-6">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle>Progress</CardTitle>
              <Badge className="bg-blue-600 text-white">
                {progress.completed} of {progress.total} areas
              </Badge>
            </div>
            <Progress value={progress.percent} className="mt-2 h-2" />
          </CardHeader>
        </Card>

        <div className="space-y-4 mb-6">
          {INSPECTION_AREAS.map((area, idx) => {
            const isComplete = inspectionData[area.id];
            const issueCount = (inspectionData[area.id] || []).length;
            const relevantSystemTypes = AREA_TO_SYSTEM_MAP[area.id] || [];
            const systemsInArea = relevantSystemTypes.flatMap(type => systemsByType[type] || []);

            return (
              <Card
                key={area.id}
                className={`border-2 ${
                  isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                } transition-colors cursor-pointer`}
                onClick={() => setCurrentAreaIndex(idx)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{area.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{area.name}</h3>
                        {systemsInArea.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {systemsInArea.length} system{systemsInArea.length > 1 ? 's' : ''} documented
                          </p>
                        )}
                        {issueCount > 0 && (
                          <Badge className="bg-orange-600 text-white text-xs mt-1">
                            {issueCount} issue{issueCount > 1 ? 's' : ''} found
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setRouteMode('physical')}
            variant="outline"
            className="w-full gap-2"
            style={{ minHeight: '48px' }}
          >
            <MapPin className="w-4 h-4" />
            Switch to Physical Walkthrough
          </Button>

          {progress.percent >= 80 && (
            <Button
              onClick={handleFinishInspection}
              className="w-full gap-2"
              style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
              disabled={updateInspectionMutation.isPending}
            >
              {updateInspectionMutation.isPending ? 'Saving...' : 'Complete Inspection'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
