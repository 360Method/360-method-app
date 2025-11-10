
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Calendar, AlertCircle, Home } from "lucide-react";
import InspectionCard from "../components/inspect/InspectionCard";
import InspectionDialog from "../components/inspect/InspectionDialog";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];

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
          why: "Dirty filters reduce efficiency 15%, increase bills, strain system causing early failure.",
          howTo: "1. Turn off system\n2. Remove old filter\n3. Insert new filter with arrow toward furnace\n4. Write date on filter frame"
        }
      ],
      "Plumbing System": [
        {
          name: "Check for Leaks",
          duration: 30,
          points: 50,
          why: "Small leaks cause major water damage, mold, and structural problems.",
          howTo: "Check under sinks, around toilets, water heater, washing machine. Look for water stains or pooling."
        }
      ]
    },
    Summer: {
      "HVAC System": [
        {
          name: "Clean Condenser Coils",
          duration: 45,
          points: 50,
          why: "Dirty coils reduce cooling efficiency and can lead to system breakdown.",
          howTo: "1. Turn off power to outdoor unit.\n2. Gently brush off debris from coils.\n3. Spray coils with a hose (avoiding electrical components)."
        }
      ],
      "Roofing": [
        {
          name: "Inspect Roof for Damage",
          duration: 60,
          points: 75,
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
          why: "Ensures heating system is ready for colder weather, preventing unexpected breakdowns.",
          howTo: "1. Turn on thermostat to heat mode and set temperature higher than ambient.\n2. Listen for normal operation.\n3. Check vents for warm airflow."
        }
      ],
      "Plumbing System": [
        {
          name: "Drain Outdoor Faucets",
          duration: 15,
          points: 20,
          why: "Prevents pipes from freezing and bursting in cold weather.",
          howTo: "1. Turn off water supply to outdoor faucets from inside.\n2. Open outdoor faucets to drain remaining water.\n3. Disconnect hoses."
        }
      ],
      "Yard & Garden": [
        {
          name: "Clear Gutters and Downspouts",
          duration: 60,
          points: 50,
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
          why: "Ensures detectors are functioning correctly, critical for fire and carbon monoxide safety.",
          howTo: "1. Press and hold the test button on each detector until it alarms.\n2. Replace batteries if low or not sounding."
        }
      ],
      "HVAC System": [
        {
          name: "Check for Drafts Around Windows/Doors",
          duration: 30,
          points: 25,
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
            name: `${taskTemplate.name} (${instance.nickname || instance.system_type})`,
            systemId: instance.id,
            systemType: instance.system_type,
            enrichedData: {
              systemName: instance.nickname,
              systemBrand: instance.brand,
              systemModel: instance.model,
              systemAge: instance.installation_date ? new Date().getFullYear() - new Date(instance.installation_date).getFullYear() : 'N/A',
              systemFilterSize: instance.filter_size,
              systemSerialNumber: instance.serial_number,
              systemNotes: instance.notes
            }
          });
        });
      } else if (systemInstances.length === 1) {
        const instance = systemInstances[0];
        generatedTasks.push({
          ...taskTemplate,
          name: `${taskTemplate.name} ${instance.nickname ? `(${instance.nickname})` : ''}`,
          systemId: instance.id,
          systemType: instance.system_type,
          enrichedData: {
            systemName: instance.nickname,
            systemBrand: instance.brand,
            systemModel: instance.model,
            systemAge: instance.installation_date ? new Date().getFullYear() - new Date(instance.installation_date).getFullYear() : 'N/A',
            systemFilterSize: instance.filter_size,
            systemSerialNumber: instance.serial_number,
            systemNotes: instance.notes
          }
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
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingInspection, setEditingInspection] = React.useState(null);

  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Inspection.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  // Fetch baseline systems for selected property
  const { data: baselineSystems = [] } = useQuery({
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

  const createInspectionMutation = useMutation({
    mutationFn: async ({ season, year }) => {
      // Generate personalized checklist based on baseline systems
      const generatedTasks = generateInspectionTasksFromBaseline(baselineSystems, season);
      
      const checklistItems = generatedTasks.map(task => ({
        item_name: task.name,
        completed: false,
        condition_rating: 'Good',
        notes: '',
        photo_urls: [],
        systemId: task.systemId,
        systemType: task.systemType,
        enrichedData: task.enrichedData,
        why: task.why,
        howTo: task.howTo,
        duration: task.duration,
        points: task.points
      }));

      return base44.entities.Inspection.create({
        property_id: selectedProperty,
        season,
        year,
        status: 'Not Started',
        completion_percentage: 0,
        issues_found: 0,
        checklist_items: checklistItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setShowDialog(false);
    },
  });

  const handleStartInspection = (season) => {
    createInspectionMutation.mutate({ season, year: currentYear });
  };

  const handleEditInspection = (inspection) => {
    setEditingInspection(inspection);
    setShowDialog(true);
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);
  const climateZone = currentProperty?.climate_zone || 'Pacific Northwest';

  // Group inspections by season
  const inspectionsBySeason = SEASONS.reduce((acc, season) => {
    const seasonInspection = inspections.find(i => 
      i.season === season && i.year === currentYear
    );
    acc[season] = seasonInspection;
    return acc;
  }, {});

  const completedInspections = inspections.filter(i => i.status === 'Completed' && i.year === currentYear).length;
  const totalIssues = inspections.reduce((sum, i) => sum + (i.issues_found || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AWARE → Inspect</h1>
            <p className="text-gray-600 mt-1">Regular seasonal inspections catch problems early</p>
          </div>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentProperty && (
                    <p className="text-sm text-gray-600 mt-2">
                      Climate Zone: {climateZone}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedInspections}/4</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Issues Found</p>
                    <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProperty ? (
          <>
            {/* Baseline Integration Notice */}
            {baselineSystems.length === 0 ? (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-orange-900 mb-2">
                        Complete Baseline First
                      </h3>
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
            ) : (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <ClipboardCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 mb-2">
                        ✓ Personalized Checklists Ready
                      </h3>
                      <p className="text-gray-700">
                        Your inspection checklists are customized based on <strong>{baselineSystems.length} documented system{baselineSystems.length !== 1 ? 's' : ''}</strong>. 
                        Tasks include your specific system details (brand, age, filter sizes, etc.)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seasonal Inspections */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {currentYear} Seasonal Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SEASONS.map((season) => (
                    <InspectionCard
                      key={season}
                      season={season}
                      inspection={inspectionsBySeason[season]}
                      climateZone={climateZone}
                      onStart={() => handleStartInspection(season)}
                      onEdit={() => handleEditInspection(inspectionsBySeason[season])}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inspection History */}
            {inspections.filter(i => i.year < currentYear).length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    Previous Years
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inspections
                      .filter(i => i.year < currentYear)
                      .sort((a, b) => b.year - a.year)
                      .map((inspection) => (
                        <div
                          key={inspection.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{inspection.season} {inspection.year}</p>
                            <p className="text-sm text-gray-600">
                              {inspection.completion_percentage}% complete • {inspection.issues_found} issues
                            </p>
                          </div>
                          <Badge className={
                            inspection.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }>
                            {inspection.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Property Selected</h3>
              <p className="text-gray-600">Please select a property to start seasonal inspections</p>
            </CardContent>
          </Card>
        )}

        {showDialog && editingInspection && (
          <InspectionDialog
            open={showDialog}
            onClose={() => {
              setShowDialog(false);
              setEditingInspection(null);
            }}
            inspection={editingInspection}
            propertyId={selectedProperty}
            baselineSystems={baselineSystems}
          />
        )}
      </div>
    </div>
  );
}
