
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Home, ChevronDown, Filter, Clock, Trophy } from "lucide-react";
import InspectionTaskDetailView from "../components/inspect/InspectionTaskDetailView";
import InspectionCompletionScreen from "../components/inspect/InspectionCompletionScreen";
import InspectionIssueDetected from "../components/inspect/InspectionIssueDetected";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];

const SEASON_ICONS = {
  Spring: "🌸",
  Summer: "☀️",
  Fall: "🍂",
  Winter: "❄️"
};

// Inline task generation function
function generateInspectionTasksFromBaseline(systems, season) {
  if (!systems || systems.length === 0) {
    return [];
  }

  const SEASONAL_TASKS = {
    Spring: {
      "HVAC System": [
        {
          name: "Change HVAC Filter",
          duration: 15,
          points: 25,
          priority: "Important",
          why: "Dirty filters reduce efficiency 15%, increase bills, strain system causing early failure. Proper maintenance extends system life.",
          howTo: "1. Turn off system\n2. Remove old filter (note arrow direction)\n3. Insert new filter with arrow toward furnace\n4. Write today's date on filter frame"
        },
        {
          name: "Test AC System",
          duration: 30,
          points: 50,
          priority: "Important",
          why: "Testing before peak season prevents emergency breakdowns when AC is needed most. Summer failures mean 2+ week waits at premium pricing.",
          howTo: "1. Turn thermostat to COOL, set 5° below current temp\n2. Listen for smooth startup\n3. Check airflow from all vents\n4. Run for 15 minutes, check outdoor unit operation\n5. Note any unusual sounds or weak cooling"
        }
      ],
      "Plumbing System": [
        {
          name: "Check for Leaks",
          duration: 30,
          points: 50,
          priority: "Important",
          why: "Small leaks cause major water damage, mold, and structural problems. Early detection saves $10,000+ in damage costs.",
          howTo: "Check under all sinks, around toilets, water heater base, washing machine connections, dishwasher area. Look for water stains, moisture, or pooling water."
        }
      ],
      "Gutters & Downspouts": [
        {
          name: "Clean Gutters and Downspouts",
          duration: 60,
          points: 75,
          priority: "Important",
          why: "Clogged gutters cause water overflow leading to foundation damage, basement flooding, and landscaping erosion. Small task now prevents $10,000-30,000 in damage. In Pacific Northwest, this is CRITICAL before fall rain season.",
          howTo: "Use ladder safely. Scoop debris from gutters. Flush with hose to check flow. Clear any downspout clogs. Ensure water flows freely and downspouts discharge 4-6 feet from foundation."
        }
      ]
    },
    Summer: {
      "HVAC System": [
        {
          name: "Clean Condenser Coils",
          duration: 45,
          points: 50,
          priority: "Important",
          why: "Dirty coils reduce cooling efficiency and can lead to system breakdown.",
          howTo: "1. Turn off power to outdoor unit.\n2. Gently brush off debris from coils.\n3. Spray coils with a hose (avoiding electrical components)."
        }
      ],
      "Roofing": [
        {
          name: "Inspect Roof for Damage",
          duration: 60,
          points: 75,
          priority: "Moderate",
          why: "Heat and storms can damage roofing, leading to leaks and structural issues.",
          howTo: "Inspect shingles for cracks, buckling, or missing pieces. Check gutters for debris and proper drainage."
        }
      ]
    },
    Fall: {
      "HVAC System": [
        {
          name: "Test Heating System",
          duration: 20,
          points: 30,
          priority: "Important",
          why: "Ensures heating system is ready for colder weather, preventing unexpected breakdowns.",
          howTo: "1. Turn on thermostat to heat mode and set temperature higher than ambient.\n2. Listen for normal operation.\n3. Check vents for warm airflow."
        }
      ],
      "Plumbing System": [
        {
          name: "Drain Outdoor Faucets",
          duration: 15,
          points: 20,
          priority: "Critical",
          why: "Prevents pipes from freezing and bursting in cold weather.",
          howTo: "1. Turn off water supply to outdoor faucets from inside.\n2. Open outdoor faucets to drain remaining water.\n3. Disconnect hoses."
        }
      ],
      "Yard & Garden": [
        {
          name: "Clear Gutters and Downspouts",
          duration: 60,
          points: 50,
          priority: "Important",
          why: "Clogged gutters can cause water damage to roof, fascia, and foundation.",
          howTo: "1. Use a ladder to safely access gutters.\n2. Remove leaves and debris by hand or with a scoop.\n3. Flush with water to ensure clear flow."
        }
      ]
    },
    Winter: {
      "Safety Systems": [
        {
          name: "Test Smoke and CO Detectors",
          duration: 10,
          points: 15,
          priority: "Critical",
          why: "Ensures detectors are functioning correctly, critical for fire and carbon monoxide safety.",
          howTo: "1. Press and hold the test button on each detector until it alarms.\n2. Replace batteries if low or not sounding."
        }
      ],
      "HVAC System": [
        {
          name: "Check for Drafts Around Windows/Doors",
          duration: 30,
          points: 25,
          priority: "Moderate",
          why: "Drafts increase heating costs and reduce indoor comfort.",
          howTo: "Feel for cold air around window and door frames. Add weatherstripping or caulk as needed."
        }
      ]
    }
  };

  const seasonalTasks = SEASONAL_TASKS[season] || {};
  const generatedTasks = [];
  
  const systemsByType = systems.reduce((acc, system) => {
    if (!acc[system.system_type]) acc[system.system_type] = [];
    acc[system.system_type].push(system);
    return acc;
  }, {});

  Object.entries(systemsByType).forEach(([systemType, systemInstances]) => {
    const tasksForType = seasonalTasks[systemType] || [];
    
    tasksForType.forEach(taskTemplate => {
      if (systemInstances.length > 1) {
        systemInstances.forEach(instance => {
          generatedTasks.push({
            ...taskTemplate,
            name: `${taskTemplate.name} - ${instance.nickname || instance.system_type}`,
            systemId: instance.id,
            systemType: instance.system_type,
          });
        });
      } else if (systemInstances.length === 1) {
        const instance = systemInstances[0];
        generatedTasks.push({
          ...taskTemplate,
          name: `${taskTemplate.name} ${instance.nickname ? `(${instance.nickname})` : ''}`.trim(),
          systemId: instance.id,
          systemType: instance.system_type,
        });
      }
    });
  });

  return generatedTasks;
}

export default function Inspect() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [selectedSeason, setSelectedSeason] = React.useState(() => {
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 4) return "Spring"; // March, April, May
    if (month >= 5 && month <= 7) return "Summer"; // June, July, August
    if (month >= 8 && month <= 10) return "Fall";  // September, October, November
    return "Winter"; // December, January, February
  });
  const [expandedTask, setExpandedTask] = React.useState(null);
  const [completionScreen, setCompletionScreen] = React.useState(null);
  const [issueScreen, setIssueScreen] = React.useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = React.useState(false);
  const [showHighPriorityOnly, setShowHighPriorityOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("priority"); // Currently unused, but kept for future expansion
  const [collapsedSystems, setCollapsedSystems] = React.useState({});

  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: inspections = [], isLoading: isLoadingInspections } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Inspection.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: baselineSystems = [], isLoading: isLoadingBaselineSystems } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  const currentInspection = inspections.find(i => 
    i.season === selectedSeason && i.year === currentYear
  );

  const createInspectionMutation = useMutation({
    mutationFn: async () => {
      const generatedTasks = generateInspectionTasksFromBaseline(baselineSystems, selectedSeason);
      
      const checklistItems = generatedTasks.map(task => ({
        item_name: task.name,
        completed: false,
        condition_rating: 'Good',
        notes: '',
        photo_urls: [],
        systemId: task.systemId,
        systemType: task.systemType,
        why: task.why,
        howTo: task.howTo,
        duration: task.duration,
        points: task.points,
        priority: task.priority
      }));

      return base44.entities.Inspection.create({
        property_id: selectedProperty,
        season: selectedSeason,
        year: currentYear,
        status: 'Not Started',
        completion_percentage: 0,
        issues_found: 0,
        checklist_items: checklistItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] });
    },
  });

  React.useEffect(() => {
    // Only attempt to create if a property is selected, baseline systems are loaded,
    // and there isn't already an inspection for the current season/year.
    if (selectedProperty && baselineSystems.length > 0 && !currentInspection && !isLoadingBaselineSystems && !isLoadingInspections) {
      createInspectionMutation.mutate();
    }
  }, [selectedProperty, selectedSeason, baselineSystems, currentInspection, isLoadingBaselineSystems, isLoadingInspections]);


  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1B365D' }}>No Property Selected</h3>
              <p className="text-gray-600">Please select a property to start seasonal inspections</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (expandedTask && currentInspection) {
    return (
      <InspectionTaskDetailView
        task={expandedTask}
        inspection={currentInspection}
        propertyId={selectedProperty}
        baselineSystems={baselineSystems}
        onBack={() => setExpandedTask(null)}
        onComplete={(updatedTask) => {
          setExpandedTask(null);
          // Assuming condition_rating is updated within the InspectionTaskDetailView
          if (updatedTask.condition_rating === 'Poor' || updatedTask.condition_rating === 'Urgent') {
            setIssueScreen({ task: updatedTask, inspection: currentInspection });
          } else {
            setCompletionScreen({ task: updatedTask, inspection: currentInspection });
          }
        }}
      />
    );
  }

  if (completionScreen) {
    return (
      <InspectionCompletionScreen
        task={completionScreen.task}
        inspection={completionScreen.inspection}
        onViewChecklist={() => {
          setCompletionScreen(null);
          queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] }); // Refresh checklist
        }}
        onNextTask={() => {
          setCompletionScreen(null);
          queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] }); // Refresh checklist
          // Logic to find and set the next incomplete task to expandedTask
          const nextTask = checklistItems.find(item => !item.completed);
          if (nextTask) {
            setExpandedTask(nextTask);
          }
        }}
      />
    );
  }

  if (issueScreen) {
    return (
      <InspectionIssueDetected
        task={issueScreen.task}
        inspection={issueScreen.inspection}
        propertyId={selectedProperty}
        onScheduleService={() => {
          setIssueScreen(null);
          queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] }); // Refresh checklist
          // TODO: Navigate to service request or open a service request form
        }}
        onHandleMyself={() => {
          setIssueScreen(null);
          queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] }); // Refresh checklist
        }}
        onBack={() => {
          setIssueScreen(null);
          queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] }); // Refresh checklist
        }}
      />
    );
  }

  if (baselineSystems.length === 0 && !isLoadingBaselineSystems) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>AWARE → Inspect</h1>
            <p className="text-gray-600 mt-1">Seasonal maintenance checklists tailored to your home and climate</p>
          </div>

          <Card className="border-2" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>Complete Baseline First</h3>
                  <p className="text-gray-700 mb-4">
                    Document your property systems in the Baseline module first. Your seasonal inspection checklists will be personalized based on the systems you have (HVAC units, water heaters, appliances, etc.)
                  </p>
                  <p className="text-sm text-gray-600">
                    This ensures you only inspect systems that actually exist in your property and tasks include your specific system details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const checklistItems = currentInspection?.checklist_items || [];
  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalPoints = checklistItems.reduce((sum, item) => sum + (item.points || 0), 0);
  const earnedPoints = checklistItems.filter(item => item.completed).reduce((sum, item) => sum + (item.points || 0), 0);

  // Group tasks by system
  let tasksBySystem = checklistItems.reduce((acc, item) => {
    const system = item.systemType || "General"; // Default to "General" if systemType is missing
    if (!acc[system]) acc[system] = [];
    acc[system].push(item);
    return acc;
  }, {});

  // Apply filters
  Object.keys(tasksBySystem).forEach(system => {
    let filtered = tasksBySystem[system];
    if (showIncompleteOnly) {
      filtered = filtered.filter(t => !t.completed);
    }
    if (showHighPriorityOnly) {
      filtered = filtered.filter(t => t.priority === "Important" || t.priority === "Critical");
    }
    tasksBySystem[system] = filtered;
  });

  // Remove empty systems after filtering
  tasksBySystem = Object.fromEntries(Object.entries(tasksBySystem).filter(([, tasks]) => tasks.length > 0));

  const toggleSystem = (system) => {
    setCollapsedSystems(prev => ({
      ...prev,
      [system]: !prev[system]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>AWARE → Inspect</h1>
          <p className="text-gray-600 mt-1">Seasonal maintenance checklists tailored to your home and climate</p>
        </div>

        {/* Property Selector */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Season Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SEASONS.map((season) => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedSeason === season
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedSeason === season ? { backgroundColor: '#1B365D' } : {}}
            >
              <span className="mr-2">{SEASON_ICONS[season]}</span>
              {season}
            </button>
          ))}
        </div>

        {/* Active Season Progress */}
        <Card className="border-2" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Current Season: {selectedSeason}</p>
                <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                  {completedCount} of {checklistItems.length} tasks complete ({Math.round((completedCount / Math.max(checklistItems.length, 1)) * 100)}%)
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${(completedCount / Math.max(checklistItems.length, 1)) * 100}%`,
                    backgroundColor: '#28A745'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-600">Points Earned: </span>
                <span className="font-bold" style={{ color: '#1B365D' }}>{earnedPoints} PP</span>
              </div>
              <div>
                <span className="text-gray-600">Available: </span>
                <span className="font-bold" style={{ color: '#FF6B35' }}>{totalPoints - earnedPoints} PP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showIncompleteOnly}
                  onCheckedChange={setShowIncompleteOnly}
                />
                <span className="text-sm text-gray-700">Show only incomplete tasks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={showHighPriorityOnly}
                  onCheckedChange={setShowHighPriorityOnly}
                />
                <span className="text-sm text-gray-700">Show only high priority</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <div className="space-y-4">
          {Object.entries(tasksBySystem).map(([system, tasks]) => (
            <Card key={system} className="border-none shadow-sm">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleSystem(system)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${collapsedSystems[system] ? 'rotate-180' : ''}`}
                      style={{ color: '#1B365D' }}
                    />
                    <h3 className="text-lg font-semibold" style={{ color: '#1B365D' }}>
                      {system} ({tasks.filter(t => t.completed).length}/{tasks.length} tasks)
                    </h3>
                  </div>
                  {tasks.length > 0 && tasks.filter(t => t.completed).length === tasks.length && (
                    <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
                  )}
                </button>

                {!collapsedSystems[system] && (
                  <div className="px-6 pb-6 space-y-3">
                    {tasks.map((task, idx) => {
                      const systemDetails = baselineSystems.find(s => s.id === task.systemId);
                      return (
                        <div
                          key={idx}
                          className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setExpandedTask(task)}
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={task.completed}
                              onClick={(e) => e.stopPropagation()} // Prevent opening detail view when checking
                              onCheckedChange={async (checked) => {
                                // Optimistically update UI
                                const updatedChecklist = currentInspection.checklist_items.map(item =>
                                  item.item_name === task.item_name && item.systemId === task.systemId
                                    ? { ...item, completed: checked }
                                    : item
                                );
                                // Call API to update the inspection
                                await base44.entities.Inspection.update(currentInspection.id, {
                                  checklist_items: updatedChecklist
                                });
                                queryClient.invalidateQueries({ queryKey: ['inspections', selectedProperty] });
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h4 className={`text-lg font-semibold mb-2 ${task.completed ? 'line-through text-gray-500' : ''}`} style={!task.completed ? { color: '#1B365D' } : {}}>
                                {task.item_name}
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.duration} min
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  {task.points} PP
                                </Badge>
                                {task.priority && (
                                  <Badge style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                    ⚠️ {task.priority}
                                  </Badge>
                                )}
                              </div>
                              {systemDetails && (
                                <div className="text-sm text-gray-600 mb-2">
                                  <p><strong>Your system:</strong> {systemDetails.brand_model || systemDetails.system_type}</p>
                                  {systemDetails.installation_date && (
                                    <p><strong>Installed:</strong> {new Date(systemDetails.installation_date).getFullYear()}</p>
                                  )}
                                  {systemDetails.key_components?.filter_size && (
                                    <p><strong>Filter size:</strong> {systemDetails.key_components.filter_size}</p>
                                  )}
                                  {systemDetails.last_service_date && (
                                    <p><strong>Last service:</strong> {new Date(systemDetails.last_service_date).toLocaleDateString()}</p>
                                  )}
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTask(task);
                                }}
                              >
                                Expand Details
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
