import React from "react";
import { SystemBaseline, Inspection, MaintenanceTask } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronRight, MapPin, Navigation, ArrowLeft, Loader2, AlertTriangle, Trash2, Save } from "lucide-react";
import AreaInspection from "./AreaInspection";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { format } from 'date-fns';
import { notifyInspectionCompleted } from "@/api/triggerNotification";
import { useAuth } from "@/lib/AuthContext";
import { useGamification } from "@/lib/GamificationContext";

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
    name: '🏚️ Basement/Crawlspace',
    areas: ['foundation'],
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
    name: '⬆️ Upper Level',
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

// Helper function to determine if task is seasonal and get completion window
function determineSeasonalMetadata(systemType, season, description) {
  const currentMonth = format(new Date(), 'MMMM');
  const currentSeason = season || currentMonth;
  
  // Define seasonal tasks and their recommended windows
  const seasonalTasks = {
    'HVAC System': {
      seasonal: true,
      window: 'March-April'
    },
    'Gutters & Downspouts': {
      seasonal: true,
      window: 'September-November'
    },
    'Roof System': {
      seasonal: true,
      window: 'Spring'
    },
    'Exterior Siding & Envelope': {
      seasonal: true,
      window: 'April-September'
    },
    'Windows & Doors': {
      seasonal: true,
      window: 'September-October'
    }
  };
  
  if (seasonalTasks[systemType]) {
    return {
      seasonal: true,
      recommended_completion_window: seasonalTasks[systemType].window
    };
  }
  
  const descLower = (description || '').toLowerCase();
  if (descLower.includes('annual') || descLower.includes('yearly')) {
    return {
      seasonal: true,
      recommended_completion_window: currentSeason
    };
  }
  
  if (descLower.includes('filter') && systemType === 'HVAC System') {
    return {
      seasonal: true,
      recommended_completion_window: 'Every 3 months'
    };
  }
  
  return {
    seasonal: false,
    recommended_completion_window: null
  };
}

export default function InspectionWalkthrough({ inspection, property, onComplete, onCancel }) {
  const [currentAreaIndex, setCurrentAreaIndex] = React.useState(null);
  const [inspectionData, setInspectionData] = React.useState(() => {
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
  const [routeMode, setRouteMode] = React.useState('physical');
  const [completedZones, setCompletedZones] = React.useState([]);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { awardXP, checkAchievement, hasAchievement } = useGamification();

  // Track if we've already awarded "start inspection" XP for this session
  const hasAwardedStartXP = React.useRef(false);

  // Track completed areas for XP awards (to avoid duplicate awards on re-renders)
  const awardedAreasRef = React.useRef(new Set());
  const awardedIssuesRef = React.useRef(0);

  const { data: baselineSystems = [] } = useQuery({
    queryKey: ['systemBaselines', property.id],
    queryFn: () => SystemBaseline.filter({ property_id: property.id }),
  });

  const saveInspectionMutation = useMutation({
    mutationFn: async (data) => {
      return Inspection.update(inspection.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return MaintenanceTask.create(taskData);
    },
  });

  const updateSystemMutation = useMutation({
    mutationFn: async ({ systemId, updates }) => {
      return SystemBaseline.update(systemId, updates);
    },
  });

  const deleteInspectionMutation = useMutation({
    mutationFn: async () => {
      return Inspection.delete(inspection.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      onCancel();
    },
  });

  const systemsByType = baselineSystems.reduce((acc, system) => {
    if (!acc[system.system_type]) {
      acc[system.system_type] = [];
    }
    acc[system.system_type].push(system);
    return acc;
  }, {});

  // ========================================
  // GAMIFICATION: Award XP when starting inspection
  // Only awards once per component mount (new inspection session)
  // ========================================
  React.useEffect(() => {
    if (!hasAwardedStartXP.current && inspection?.id) {
      hasAwardedStartXP.current = true;
      awardXP('start_inspection', {
        entityType: 'inspection',
        entityId: inspection.id,
        season: inspection.season
      }).catch(err => {
        console.error('Error awarding start inspection XP:', err);
      });
    }
  }, [inspection?.id, awardXP]);

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

  const handleZoneComplete = (zoneId) => {
    if (!completedZones.includes(zoneId)) {
      setCompletedZones(prev => [...prev, zoneId]);
    }
  };

  const getAreasInZone = (zoneId) => {
    const zone = INSPECTION_ZONES.find(z => z.id === zoneId);
    if (!zone) return [];
    return INSPECTION_AREAS.filter(area => zone.areas.includes(area.id));
  };

  const handleAreaComplete = async (areaId, data) => {
    const updatedInspectionData = {
      ...inspectionData,
      [areaId]: data
    };
    setInspectionData(updatedInspectionData);

    const allIssues = Object.values(updatedInspectionData).flat();
    const issuesCount = allIssues.length;
    const completionPercent = Math.round((Object.keys(updatedInspectionData).length / INSPECTION_AREAS.length) * 100);

    try {
      await saveInspectionMutation.mutateAsync({
        checklist_items: allIssues,
        issues_found: issuesCount,
        completion_percentage: completionPercent,
        status: completionPercent === 100 ? 'Completed' : 'In Progress'
      });

      // ========================================
      // GAMIFICATION: Award XP for completing room
      // ========================================
      if (!awardedAreasRef.current.has(areaId)) {
        awardedAreasRef.current.add(areaId);
        const areaName = INSPECTION_AREAS.find(a => a.id === areaId)?.name || areaId;
        await awardXP('complete_room', {
          entityType: 'inspection_area',
          entityId: inspection.id,
          areaId: areaId,
          areaName
        });
      }

      // Award XP for finding issues (only for newly found issues)
      const issuesInThisArea = data.length;
      if (issuesInThisArea > awardedIssuesRef.current) {
        const newIssues = issuesInThisArea - awardedIssuesRef.current;
        for (let i = 0; i < newIssues; i++) {
          await awardXP('find_issue', {
            entityType: 'inspection_issue',
            inspectionId: inspection.id
          });
        }
        awardedIssuesRef.current = issuesInThisArea;
      }
    } catch (error) {
      console.error('Failed to save inspection progress:', error);
    }

    setCurrentAreaIndex(null);
  };

  const handleSaveAndFinish = async () => {
    const completionPercent = Math.round((Object.keys(inspectionData).length / INSPECTION_AREAS.length) * 100);
    
    // Show warning if not 100% complete
    if (completionPercent < 100) {
      setShowIncompleteWarning(true);
      return;
    }

    await completeInspection();
  };

  const completeInspection = async () => {
    setIsCompleting(true);
    setShowIncompleteWarning(false);

    try {
      const allIssues = Object.values(inspectionData).flat();
      const issuesCount = allIssues.length;
      const completionPercent = Math.round((Object.keys(inspectionData).length / INSPECTION_AREAS.length) * 100);

      await saveInspectionMutation.mutateAsync({
        checklist_items: allIssues,
        issues_found: issuesCount,
        completion_percentage: completionPercent,
        status: 'Completed',
        inspection_date: new Date().toISOString().split('T')[0]
      });

      const tasksToCreate = allIssues.filter(issue => issue.is_quick_fix === false);

      for (const issue of tasksToCreate) {
        const seasonalMeta = determineSeasonalMetadata(
          issue.system || 'General',
          inspection.season,
          issue.description || issue.notes
        );

        const taskData = {
          property_id: property.id,
          title: issue.item_name || issue.description?.substring(0, 50) || 'Inspection Issue',
          description: `Issue found during ${inspection.season} ${inspection.year} inspection in ${INSPECTION_AREAS.find(a => a.id === issue.area_id)?.name || 'unknown area'}.\n\n${issue.description || issue.notes || ''}`,
          system_type: issue.system || 'General',
          priority: issue.severity === 'Urgent' ? 'High' : issue.severity === 'Flag' ? 'Medium' : 'Low',
          status: 'Identified',
          photo_urls: issue.photo_urls || [],
          current_fix_cost: issue.current_fix_cost || 0,
          delayed_fix_cost: issue.delayed_fix_cost || 0,
          cascade_risk_score: issue.cascade_risk_score || 0,
          cascade_risk_reason: issue.cascade_risk_reason || '',
          cost_impact_reason: issue.cost_impact_reason || '',
          has_cascade_alert: (issue.cascade_risk_score || 0) >= 7,
          execution_type: issue.who_will_fix === 'diy' ? 'DIY' : issue.who_will_fix === 'professional' ? 'Professional' : 'Not Decided',
          estimated_hours: issue.max_hours || null,
          seasonal: seasonalMeta.seasonal,
          recommended_completion_window: seasonalMeta.recommended_completion_window
        };

        await createTaskMutation.mutateAsync(taskData);

        if (issue.system && issue.system !== 'General') {
          const systemsToUpdate = baselineSystems.filter(s => s.system_type === issue.system);
          for (const system of systemsToUpdate) {
            const conditionUpdates = {};

            if (issue.severity === 'Urgent') {
              conditionUpdates.condition = 'Urgent';
            } else if (issue.severity === 'Flag' && ['Good', 'Excellent'].includes(system.condition)) {
              conditionUpdates.condition = 'Fair';
            }

            const existingWarnings = system.warning_signs_present || [];
            const newWarning = issue.description?.substring(0, 100) || issue.notes?.substring(0, 100) || '';
            if (newWarning && !existingWarnings.includes(newWarning)) {
              conditionUpdates.warning_signs_present = [...existingWarnings, newWarning];
            }

            const timestamp = new Date().toLocaleDateString();
            const existingNotes = system.condition_notes || '';
            const newNote = `\n[${timestamp}] ${inspection.season} ${inspection.year} Inspection: ${issue.description || issue.notes || ''}`;
            if (!existingNotes.includes(newNote)) {
              conditionUpdates.condition_notes = existingNotes + newNote;
            }

            if (Object.keys(conditionUpdates).length > 0) {
              await updateSystemMutation.mutateAsync({
                systemId: system.id,
                updates: conditionUpdates
              });
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['seasonal-reminders'] });

      // Trigger notification for inspection completion
      if (user?.id) {
        notifyInspectionCompleted({
          inspectionId: inspection.id,
          propertyId: property.id,
          userId: user.id,
          issueCount: issuesCount,
          healthScore: null // Could calculate health score here if available
        });
      }

      // ========================================
      // GAMIFICATION: Award XP for completing inspection
      // ========================================
      try {
        await awardXP('complete_inspection', {
          entityType: 'inspection',
          entityId: inspection.id,
          issuesFound: issuesCount,
          season: inspection.season
        });

        // Check for first inspection achievement
        if (!hasAchievement('first_inspection')) {
          await checkAchievement('first_inspection');
        }

        // Check for eagle eye achievement (10+ issues found total)
        if (issuesCount >= 10 && !hasAchievement('eagle_eye')) {
          await checkAchievement('eagle_eye');
        }
      } catch (err) {
        console.error('Error awarding inspection completion XP:', err);
        // Don't block the user flow
      }

      onComplete();
    } catch (error) {
      console.error('Error completing inspection:', error);
      alert('Failed to complete inspection. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const allIssues = Object.values(inspectionData).flat();
      const issuesCount = allIssues.length;
      const completionPercent = Math.round((Object.keys(inspectionData).length / INSPECTION_AREAS.length) * 100);

      await saveInspectionMutation.mutateAsync({
        checklist_items: allIssues,
        issues_found: issuesCount,
        completion_percentage: completionPercent,
        status: 'In Progress'
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
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

  if (routeMode === 'physical') {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inspect
          </Button>

          <div className="mb-6">
            <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
              Physical Walkthrough
            </h1>
            <p className="text-gray-600">Follow the optimal route through your property</p>
          </div>

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
                            {zone.name.replace(/[^a-zA-Z\s\/]/g, '').trim()}
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

          <div className="space-y-3">
            <Button
              onClick={() => setRouteMode('traditional')}
              variant="outline"
              className="w-full"
              style={{ minHeight: '48px' }}
            >
              Switch to Traditional View
            </Button>

            {progress.completed > 0 && (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Progress Auto-Saved
                      </p>
                      <p className="text-xs text-blue-800">
                        Your inspection data is automatically saved after each area. You can safely leave and come back anytime.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {progress.completed > 0 && (
              <>
                <Button
                  onClick={handleSaveProgress}
                  variant="outline"
                  className="w-full gap-2"
                  style={{ minHeight: '48px' }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Progress
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSaveAndFinish}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Completing & Creating Tasks...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Finish Inspection
                    </>
                  )}
                </Button>
              </>
            )}

            {progress.completed > 0 && (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                style={{ minHeight: '48px' }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Current Inspection
              </Button>
            )}
          </div>

          {showDeleteConfirm && (
            <ConfirmDialog
              open={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={() => {
                deleteInspectionMutation.mutate();
                setShowDeleteConfirm(false);
              }}
              title="Delete Inspection?"
              message={`Are you sure you want to delete this ${inspection.season} ${inspection.year} inspection? All progress (${progress.percent}% complete) will be permanently lost. This cannot be undone.`}
              confirmText="Yes, Delete"
              cancelText="Cancel"
              variant="destructive"
            />
          )}

          {showIncompleteWarning && (
            <ConfirmDialog
              open={showIncompleteWarning}
              onClose={() => setShowIncompleteWarning(false)}
              onConfirm={completeInspection}
              title="Inspection Not Complete"
              message={`This inspection is only ${progress.percent}% complete (${progress.completed} of ${progress.total} areas checked). You can finish it now and create tasks from the issues found, or continue inspecting to get full coverage.\n\nDo you want to finish the inspection now with partial completion?`}
              confirmText="Yes, Finish Now"
              cancelText="Continue Inspecting"
              variant="default"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inspect
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

          {progress.completed > 0 && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Progress Auto-Saved
                    </p>
                    <p className="text-xs text-blue-800">
                      Your inspection data is automatically saved after each area. You can safely leave and come back anytime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {progress.completed > 0 && (
            <>
              <Button
                onClick={handleSaveProgress}
                variant="outline"
                className="w-full gap-2"
                style={{ minHeight: '48px' }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Progress
                  </>
                )}
              </Button>

              <Button
                onClick={handleSaveAndFinish}
                className="w-full gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completing & Creating Tasks...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Finish Inspection
                  </>
                )}
              </Button>
            </>
          )}

          {progress.completed > 0 && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              style={{ minHeight: '48px' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Current Inspection
            </Button>
          )}
        </div>

        {showDeleteConfirm && (
          <ConfirmDialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              deleteInspectionMutation.mutate();
              setShowDeleteConfirm(false);
            }}
            title="Delete Inspection?"
            message={`Are you sure you want to delete this ${inspection.season} ${inspection.year} inspection? All progress (${progress.percent}% complete) will be permanently lost. This cannot be undone.`}
            confirmText="Yes, Delete"
            cancelText="Cancel"
            variant="destructive"
          />
        )}

        {showIncompleteWarning && (
          <ConfirmDialog
            open={showIncompleteWarning}
            onClose={() => setShowIncompleteWarning(false)}
            onConfirm={completeInspection}
            title="Inspection Not Complete"
            message={`This inspection is only ${progress.percent}% complete (${progress.completed} of ${progress.total} areas checked). You can finish it now and create tasks from the issues found, or continue inspecting to get full coverage.\n\nDo you want to finish the inspection now with partial completion?`}
            confirmText="Yes, Finish Now"
            cancelText="Continue Inspecting"
            variant="default"
          />
        )}
      </div>
    </div>
  );
}