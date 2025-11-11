import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, Eye, Layers, List } from "lucide-react";
import AreaInspection from "./AreaInspection";

// Map inspection areas to their related baseline system types
const AREA_TO_SYSTEMS_MAP = {
  'exterior': ['Exterior Siding & Envelope', 'Foundation & Structure'],
  'driveways': ['Driveways & Hardscaping'],
  'gutters': ['Gutters & Downspouts'],
  'foundation': ['Foundation & Structure'],
  'hvac': ['HVAC System'],
  'plumbing': ['Plumbing System', 'Water & Sewer/Septic'],
  'bathrooms': ['Plumbing System'],
  'kitchen': ['Plumbing System', 'Refrigerator', 'Range/Oven', 'Dishwasher', 'Microwave', 'Garbage Disposal'],
  'roof': ['Roof System'],
  'attic': ['Attic & Insulation'],
  'windows': ['Windows & Doors'],
  'electrical': ['Electrical System'],
  'safety': ['Smoke Detector', 'CO Detector', 'Fire Extinguisher', 'Radon Test', 'Security System']
};

const INSPECTION_AREAS = [
  { 
    id: 'exterior', 
    name: 'Exterior (Front & Sides)', 
    icon: '🏠',
    whatToCheck: 'Siding condition, paint, foundation cracks, drainage, grading'
  },
  { 
    id: 'driveways', 
    name: 'Driveways & Hardscaping', 
    icon: '🚗',
    whatToCheck: 'Surface cracks, potholes, heaving, drainage, edges, walkways, patios'
  },
  { 
    id: 'gutters', 
    name: 'Gutters & Downspouts', 
    icon: '🌧️',
    whatToCheck: 'Debris, sagging, leaks, proper drainage away from foundation'
  },
  { 
    id: 'foundation', 
    name: 'Foundation & Grading', 
    icon: '🏗️',
    whatToCheck: 'Cracks, settling, water pooling, proper slope away from home'
  },
  { 
    id: 'hvac', 
    name: 'HVAC Systems', 
    icon: '❄️',
    whatToCheck: 'Filters, airflow, sounds, AC test'
  },
  { 
    id: 'plumbing', 
    name: 'Plumbing Systems', 
    icon: '🚿',
    whatToCheck: 'Leaks, water heater, hoses, fixtures'
  },
  { 
    id: 'bathrooms', 
    name: 'Interior - Bathrooms', 
    icon: '🚽',
    whatToCheck: 'Caulk, fixtures, ventilation, water pressure'
  },
  { 
    id: 'kitchen', 
    name: 'Interior - Kitchen', 
    icon: '🍳',
    whatToCheck: 'Appliances, plumbing, outlets, cabinets'
  },
  { 
    id: 'roof', 
    name: 'Roof (from ground)', 
    icon: '🏠',
    whatToCheck: 'Shingles, flashing, chimney, visible damage'
  },
  { 
    id: 'attic', 
    name: 'Attic/Crawlspace', 
    icon: '🔦',
    whatToCheck: 'Insulation, moisture, pests, ventilation'
  },
  { 
    id: 'windows', 
    name: 'Windows & Doors', 
    icon: '🚪',
    whatToCheck: 'Seals, operation, weatherstripping, locks'
  },
  { 
    id: 'electrical', 
    name: 'Electrical Systems', 
    icon: '⚡',
    whatToCheck: 'Panel, outlets, GFCI tests, breakers'
  },
  { 
    id: 'safety', 
    name: 'Safety Systems', 
    icon: '🚨',
    whatToCheck: 'Detectors, extinguishers, emergency supplies'
  }
];

export default function InspectionWalkthrough({ inspection, property, baselineSystems, onComplete, onCancel }) {
  const [inspectedAreas, setInspectedAreas] = React.useState(() => {
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
  const [currentArea, setCurrentArea] = React.useState(null);
  const [startTime] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState('areas'); // 'areas' or 'systems'

  const queryClient = useQueryClient();

  const updateInspectionMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Inspection.update(inspection.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  const completeInspectionMutation = useMutation({
    mutationFn: async () => {
      const allIssues = Object.values(inspectedAreas).flat();
      const urgentCount = allIssues.filter(i => i.severity === 'Urgent').length;
      const flagCount = allIssues.filter(i => i.severity === 'Flag').length;
      const monitorCount = allIssues.filter(i => i.severity === 'Monitor').length;
      
      const endTime = new Date();
      const durationMinutes = Math.round((endTime - startTime) / 60000);

      return base44.entities.Inspection.update(inspection.id, {
        status: 'Completed',
        inspection_date: new Date().toISOString().split('T')[0],
        completion_percentage: 100,
        issues_found: allIssues.length,
        checklist_items: allIssues,
        duration_minutes: durationMinutes,
        urgent_count: urgentCount,
        flag_count: flagCount,
        monitor_count: monitorCount
      });
    },
    onSuccess: (updatedInspection) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      onComplete(updatedInspection);
    },
  });

  React.useEffect(() => {
    const allIssues = Object.values(inspectedAreas).flat();
    const totalAreas = INSPECTION_AREAS.length;
    const completedAreas = Object.keys(inspectedAreas).length;
    const percentage = Math.round((completedAreas / totalAreas) * 100);

    if (allIssues.length > 0 || completedAreas > 0) {
      updateInspectionMutation.mutate({
        status: 'In Progress',
        checklist_items: allIssues,
        completion_percentage: percentage,
        issues_found: allIssues.length
      });
    }
  }, [inspectedAreas]);

  const handleAreaInspected = (areaId, issues) => {
    setInspectedAreas(prev => ({
      ...prev,
      [areaId]: issues
    }));
    setCurrentArea(null);
  };

  const handleCompleteInspection = () => {
    completeInspectionMutation.mutate();
  };

  const handlePauseInspection = () => {
    onCancel();
  };

  const handleBackFromArea = () => {
    setCurrentArea(null);
  };

  // Group areas by their related systems for system-based view
  const getSystemsForArea = (areaId) => {
    const systemTypes = AREA_TO_SYSTEMS_MAP[areaId] || [];
    return baselineSystems.filter(sys => systemTypes.includes(sys.system_type));
  };

  // Group baseline systems by type
  const systemsByType = baselineSystems.reduce((acc, system) => {
    if (!acc[system.system_type]) {
      acc[system.system_type] = [];
    }
    acc[system.system_type].push(system);
    return acc;
  }, {});

  // Get unique system types that have documentation
  const documentedSystemTypes = Object.keys(systemsByType);

  // Get areas that have related documented systems
  const areasWithSystems = INSPECTION_AREAS.map(area => ({
    ...area,
    relatedSystems: getSystemsForArea(area.id),
    systemCount: getSystemsForArea(area.id).length
  })).filter(area => area.systemCount > 0);

  // Get areas without related systems
  const areasWithoutSystems = INSPECTION_AREAS.filter(area => 
    getSystemsForArea(area.id).length === 0
  );

  if (currentArea) {
    return (
      <AreaInspection
        area={currentArea}
        inspection={inspection}
        property={property}
        baselineSystems={baselineSystems}
        existingIssues={inspectedAreas[currentArea.id] || []}
        onComplete={(issues) => handleAreaInspected(currentArea.id, issues)}
        onBack={handleBackFromArea}
      />
    );
  }

  const totalAreas = INSPECTION_AREAS.length;
  const completedAreas = Object.keys(inspectedAreas).length;
  const allIssues = Object.values(inspectedAreas).flat();
  const urgentCount = allIssues.filter(i => i.severity === 'Urgent').length;
  const flagCount = allIssues.filter(i => i.severity === 'Flag').length;
  const monitorCount = allIssues.filter(i => i.severity === 'Monitor').length;

  const currentTime = new Date();
  const elapsed = Math.floor((currentTime - startTime) / 60000);

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        <Button
          variant="ghost"
          onClick={handlePauseInspection}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Pause & Save Inspection
        </Button>

        <Card className="border-2 mobile-card" style={{ borderColor: '#1B365D', backgroundColor: '#F0F4F8' }}>
          <CardContent className="p-4 md:p-6">
            <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '22px', lineHeight: '1.2' }}>
              {inspection.season} Inspection - In Progress
            </h1>
            <p className="text-gray-600 mb-4" style={{ fontSize: '14px' }}>
              Started: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {elapsed} minutes elapsed
            </p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress: {completedAreas} of {totalAreas} areas</span>
                <span className="font-bold">{Math.round((completedAreas / totalAreas) * 100)}%</span>
              </div>
              <Progress value={(completedAreas / totalAreas) * 100} className="h-3" />
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span>
                <strong>Issues found:</strong> {allIssues.length} total
              </span>
              {urgentCount > 0 && <span className="text-red-600">🚨 {urgentCount} urgent</span>}
              {flagCount > 0 && <span className="text-orange-600">⚠️ {flagCount} flag</span>}
              {monitorCount > 0 && <span className="text-green-600">✅ {monitorCount} monitor</span>}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs text-green-700 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Progress auto-saved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        {documentedSystemTypes.length > 0 && (
          <Card className="border-2 border-purple-300 bg-purple-50 mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">💡 Smart Inspection Mode</h3>
                  <p className="text-sm text-gray-700">
                    {viewMode === 'systems' 
                      ? `Inspecting by your documented systems (${documentedSystemTypes.length} types)`
                      : 'Inspecting all areas'}
                  </p>
                </div>
                <Button
                  onClick={() => setViewMode(viewMode === 'areas' ? 'systems' : 'areas')}
                  variant="outline"
                  className="gap-2"
                  style={{ minHeight: '44px' }}
                >
                  {viewMode === 'areas' ? (
                    <>
                      <Layers className="w-4 h-4" />
                      Group by Systems
                    </>
                  ) : (
                    <>
                      <List className="w-4 h-4" />
                      Show All Areas
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <hr className="border-gray-200 my-6" />

        {/* System-Based View */}
        {viewMode === 'systems' && areasWithSystems.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                📋 INSPECT BY YOUR DOCUMENTED SYSTEMS:
              </h2>
              <p className="text-sm text-gray-600">
                These inspection areas have systems you've already documented in your baseline
              </p>
            </div>

            <div className="space-y-3">
              {areasWithSystems.map((area) => {
                const isInspected = inspectedAreas[area.id];
                const issueCount = isInspected ? isInspected.length : 0;
                
                return (
                  <Card 
                    key={area.id}
                    className={`border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      isInspected ? 'bg-gray-50 border-green-300' : 'border-purple-300'
                    }`}
                    onClick={() => setCurrentArea(area)}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <span className="text-3xl">{area.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold" style={{ color: '#1B365D', fontSize: '16px' }}>
                                {area.name}
                              </h3>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                {area.systemCount} system{area.systemCount > 1 ? 's' : ''}
                              </Badge>
                              {isInspected && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Inspected
                                </Badge>
                              )}
                              {issueCount > 0 && (
                                <Badge className="text-xs" style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                  {issueCount} issue{issueCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Show documented systems */}
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Your systems here:</p>
                              <div className="flex flex-wrap gap-1">
                                {area.relatedSystems.map((sys, idx) => (
                                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {sys.nickname || sys.system_type}
                                    {sys.installation_year && (
                                      <span className="text-blue-600 ml-1">
                                        ({new Date().getFullYear() - sys.installation_year}yr)
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600" style={{ fontSize: '14px' }}>
                              <strong>Check:</strong> {area.whatToCheck}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hidden md:flex"
                          style={{ minHeight: '44px' }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {isInspected ? 'Re-inspect' : 'Inspect'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Areas without baseline systems */}
            {areasWithoutSystems.length > 0 && (
              <>
                <div className="mt-8 mb-4">
                  <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                    📝 OTHER AREAS TO INSPECT:
                  </h2>
                  <p className="text-sm text-gray-600">
                    These areas don't have documented baseline systems yet
                  </p>
                </div>

                <div className="space-y-3">
                  {areasWithoutSystems.map((area) => {
                    const isInspected = inspectedAreas[area.id];
                    const issueCount = isInspected ? isInspected.length : 0;
                    
                    return (
                      <Card 
                        key={area.id}
                        className={`border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                          isInspected ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => setCurrentArea(area)}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                              <span className="text-3xl">{area.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold" style={{ color: '#1B365D', fontSize: '16px' }}>
                                    {area.name}
                                  </h3>
                                  {isInspected && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Inspected
                                    </Badge>
                                  )}
                                  {issueCount > 0 && (
                                    <Badge className="text-xs" style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                      {issueCount} issue{issueCount > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  {isInspected && issueCount === 0 && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      No issues
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600" style={{ fontSize: '14px' }}>
                                  <strong>Check:</strong> {area.whatToCheck}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hidden md:flex"
                              style={{ minHeight: '44px' }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {isInspected ? 'Re-inspect' : 'Inspect'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Traditional Area-Based View */}
        {viewMode === 'areas' && (
          <>
            <div>
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
                SELECT AREA TO INSPECT:
              </h2>
              
              <div className="space-y-3">
                {INSPECTION_AREAS.map((area) => {
                  const isInspected = inspectedAreas[area.id];
                  const issueCount = isInspected ? isInspected.length : 0;
                  const systemCount = getSystemsForArea(area.id).length;
                  
                  return (
                    <Card 
                      key={area.id}
                      className={`border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                        isInspected ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setCurrentArea(area)}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                            <span className="text-3xl">{area.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold" style={{ color: '#1B365D', fontSize: '16px' }}>
                                  {area.name}
                                </h3>
                                {systemCount > 0 && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    {systemCount} system{systemCount > 1 ? 's' : ''}
                                  </Badge>
                                )}
                                {isInspected && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Inspected
                                  </Badge>
                                )}
                                {issueCount > 0 && (
                                  <Badge className="text-xs" style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                    {issueCount} issue{issueCount > 1 ? 's' : ''}
                                  </Badge>
                                )}
                                {isInspected && issueCount === 0 && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    No issues
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600" style={{ fontSize: '14px' }}>
                                <strong>Check:</strong> {area.whatToCheck}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hidden md:flex"
                            style={{ minHeight: '44px' }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {isInspected ? 'Re-inspect' : 'Inspect'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 pt-6 border-t mt-6">
          <Button
            onClick={handleCompleteInspection}
            disabled={completedAreas === 0 || completeInspectionMutation.isPending}
            className="w-full font-bold"
            style={{ 
              backgroundColor: completedAreas > 0 ? '#28A745' : '#CCCCCC',
              minHeight: '56px', 
              fontSize: '16px' 
            }}
          >
            {completeInspectionMutation.isPending ? 'Completing...' : 'Complete Inspection'}
          </Button>
          <Button
            onClick={handlePauseInspection}
            variant="outline"
            className="w-full"
            style={{ minHeight: '48px' }}
          >
            Pause & Save Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}