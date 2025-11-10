import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Plus, Calendar, AlertTriangle } from "lucide-react";
import InspectionCard from "../components/inspect/InspectionCard";
import InspectionDialog from "../components/inspect/InspectionDialog";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const CURRENT_YEAR = new Date().getFullYear();

const CLIMATE_CHECKLISTS = {
  "Pacific Northwest": {
    Spring: ["Clean gutters and downspouts", "Check for winter moisture damage", "Inspect roof for moss growth", "Test sump pump", "Service HVAC system", "Check exterior caulking and weatherstripping"],
    Summer: ["Inspect deck and outdoor structures", "Check irrigation system", "Power wash exterior", "Inspect windows and screens", "Check attic ventilation", "Trim trees away from house"],
    Fall: ["Clean gutters before rain season", "Check heating system", "Inspect and seal foundation cracks", "Check roof and flashing", "Drain outdoor faucets", "Store outdoor furniture"],
    Winter: ["Check for ice dams", "Inspect insulation", "Test smoke and CO detectors", "Check for drafts", "Monitor for moisture and condensation", "Keep gutters clear of debris"]
  },
  "Northeast": {
    Spring: ["Inspect foundation for frost damage", "Check roof for winter damage", "Service AC system", "Clean gutters", "Check sump pump", "Inspect exterior paint"],
    Summer: ["Check AC efficiency", "Inspect deck and patio", "Test outdoor lighting", "Check for pest activity", "Trim vegetation", "Inspect windows"],
    Fall: ["Winterize outdoor faucets", "Clean gutters", "Service heating system", "Check insulation", "Seal windows and doors", "Inspect chimney"],
    Winter: ["Check for ice dams", "Monitor heating system", "Check pipes for freezing", "Test smoke detectors", "Remove snow from roof", "Check humidity levels"]
  }
};

export default function Inspect() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [showDialog, setShowDialog] = React.useState(false);
  const [selectedInspection, setSelectedInspection] = React.useState(null);

  const queryClient = useQueryClient();

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

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  const currentProperty = properties.find(p => p.id === selectedProperty);
  const climateZone = currentProperty?.climate_zone || "Pacific Northwest";
  
  const handleStartInspection = (season) => {
    const checklist = (CLIMATE_CHECKLISTS[climateZone] || CLIMATE_CHECKLISTS["Pacific Northwest"])[season];
    const checklistItems = checklist.map(item => ({
      item_name: item,
      completed: false,
      condition_rating: "Good",
      notes: "",
      photo_urls: []
    }));

    setSelectedInspection({
      season,
      year: CURRENT_YEAR,
      checklist_items: checklistItems,
      property_id: selectedProperty
    });
    setShowDialog(true);
  };

  const handleEditInspection = (inspection) => {
    setSelectedInspection(inspection);
    setShowDialog(true);
  };

  const completedInspections = inspections.filter(i => i.status === 'Completed');
  const upcomingInspections = SEASONS.filter(season => 
    !inspections.some(i => i.season === season && i.year === CURRENT_YEAR)
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AWARE → Inspect</h1>
            <p className="text-gray-600 mt-1">Seasonal inspection checklists tailored to your climate</p>
          </div>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {climateZone}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {completedInspections.length} of {SEASONS.length} seasonal inspections complete
                  </p>
                  <Progress value={(completedInspections.length / SEASONS.length) * 100} className="w-48 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {upcomingInspections.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900">Pending Inspections</h3>
                <p className="text-orange-700 text-sm">
                  You have {upcomingInspections.length} seasonal inspection{upcomingInspections.length > 1 ? 's' : ''} to complete this year
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {SEASONS.map(season => {
            const existingInspection = inspections.find(i => i.season === season && i.year === CURRENT_YEAR);
            return (
              <InspectionCard
                key={season}
                season={season}
                inspection={existingInspection}
                climateZone={climateZone}
                onStart={() => handleStartInspection(season)}
                onEdit={() => handleEditInspection(existingInspection)}
              />
            );
          })}
        </div>

        {inspections.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Inspection History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspections.filter(i => i.status === 'Completed').slice(0, 10).map(inspection => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-semibold">{inspection.season} {inspection.year}</h4>
                      <p className="text-sm text-gray-600">
                        Completed: {new Date(inspection.inspection_date).toLocaleDateString()}
                      </p>
                      {inspection.issues_found > 0 && (
                        <Badge variant="outline" className="mt-1 bg-orange-50 text-orange-700 border-orange-200">
                          {inspection.issues_found} issue{inspection.issues_found > 1 ? 's' : ''} found
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEditInspection(inspection)}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <InspectionDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedInspection(null);
          }}
          inspection={selectedInspection}
          propertyId={selectedProperty}
        />
      </div>
    </div>
  );
}