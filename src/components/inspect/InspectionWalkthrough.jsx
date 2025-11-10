import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import AreaInspection from "./AreaInspection";

const INSPECTION_AREAS = [
  { 
    id: 'exterior', 
    name: 'Exterior (Front & Sides)', 
    icon: '🏠',
    whatToCheck: 'Siding condition, paint, foundation cracks, drainage, grading'
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
  const [inspectedAreas, setInspectedAreas] = React.useState({});
  const [currentArea, setCurrentArea] = React.useState(null);
  const [startTime] = React.useState(new Date());

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

  const handleAreaInspected = (areaId, issues) => {
    setInspectedAreas(prev => ({
      ...prev,
      [areaId]: issues
    }));
    setCurrentArea(null);
    
    // Update inspection progress
    const totalAreas = INSPECTION_AREAS.length;
    const completedAreas = Object.keys({ ...inspectedAreas, [areaId]: issues }).length;
    const percentage = Math.round((completedAreas / totalAreas) * 100);
    
    updateInspectionMutation.mutate({
      completion_percentage: percentage
    });
  };

  const handleCompleteInspection = () => {
    completeInspectionMutation.mutate();
  };

  const handlePauseInspection = () => {
    const allIssues = Object.values(inspectedAreas).flat();
    updateInspectionMutation.mutate({
      status: 'In Progress',
      checklist_items: allIssues
    });
    onCancel();
  };

  if (currentArea) {
    return (
      <AreaInspection
        area={currentArea}
        inspection={inspection}
        property={property}
        baselineSystems={baselineSystems}
        existingIssues={inspectedAreas[currentArea.id] || []}
        onComplete={(issues) => handleAreaInspected(currentArea.id, issues)}
        onBack={() => setCurrentArea(null)}
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Button
          variant="ghost"
          onClick={handlePauseInspection}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Pause Inspection
        </Button>

        {/* Progress Header */}
        <Card className="border-2" style={{ borderColor: '#1B365D', backgroundColor: '#F0F4F8' }}>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
              {inspection.season} Inspection - In Progress
            </h1>
            <p className="text-gray-600 mb-4">
              Started: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {elapsed} minutes elapsed
            </p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress: {completedAreas} of {totalAreas} areas inspected</span>
                <span className="font-bold">{Math.round((completedAreas / totalAreas) * 100)}%</span>
              </div>
              <Progress value={(completedAreas / totalAreas) * 100} className="h-3" />
            </div>

            <div className="flex gap-4 text-sm">
              <span>
                <strong>Issues found:</strong> {allIssues.length} total
              </span>
              {urgentCount > 0 && <span className="text-red-600">🚨 {urgentCount} urgent</span>}
              {flagCount > 0 && <span className="text-orange-600">⚠️ {flagCount} flag</span>}
              {monitorCount > 0 && <span className="text-green-600">✅ {monitorCount} monitor</span>}
            </div>
          </CardContent>
        </Card>

        <hr className="border-gray-200" />

        {/* Area Selection */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#1B365D' }}>SELECT AREA TO INSPECT:</h2>
          
          <div className="space-y-3">
            {INSPECTION_AREAS.map((area) => {
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-3xl">{area.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold" style={{ color: '#1B365D' }}>
                              {area.name}
                            </h3>
                            {isInspected && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Inspected
                              </Badge>
                            )}
                            {issueCount > 0 && (
                              <Badge style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                {issueCount} issue{issueCount > 1 ? 's' : ''} found
                              </Badge>
                            )}
                            {isInspected && issueCount === 0 && (
                              <Badge className="bg-blue-100 text-blue-800">
                                No issues
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            <strong>What to check:</strong> {area.whatToCheck}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-6 border-t">
          <Button
            onClick={handleCompleteInspection}
            disabled={completedAreas === 0 || completeInspectionMutation.isPending}
            className="w-full h-14 text-lg font-bold"
            style={{ backgroundColor: '#28A745' }}
          >
            {completeInspectionMutation.isPending ? 'Completing...' : 'Complete Inspection'}
          </Button>
          <Button
            onClick={handlePauseInspection}
            variant="outline"
            className="w-full"
          >
            Pause Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}