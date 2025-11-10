import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, Eye, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import InspectionSetup from "../components/inspect/InspectionSetup";
import InspectionWalkthrough from "../components/inspect/InspectionWalkthrough";
import InspectionComplete from "../components/inspect/InspectionComplete";
import InspectionReport from "../components/inspect/InspectionReport";

export default function Inspect() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [currentView, setCurrentView] = React.useState('history'); // 'history' | 'setup' | 'walkthrough' | 'complete' | 'report'
  const [activeInspection, setActiveInspection] = React.useState(null);
  const [viewingReport, setViewingReport] = React.useState(null);

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

  const currentProperty = properties.find(p => p.id === selectedProperty);

  const sortedInspections = inspections
    .sort((a, b) => new Date(b.inspection_date || b.created_date) - new Date(a.inspection_date || a.created_date));

  const handleStartInspection = () => {
    setCurrentView('setup');
  };

  const handleInspectionSetup = (inspectionData) => {
    setActiveInspection(inspectionData);
    setCurrentView('walkthrough');
  };

  const handleCompleteInspection = (completedInspection) => {
    setActiveInspection(completedInspection);
    setCurrentView('complete');
  };

  const handleViewReport = (inspection) => {
    setViewingReport(inspection);
    setCurrentView('report');
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
    setActiveInspection(null);
    setViewingReport(null);
    queryClient.invalidateQueries({ queryKey: ['inspections'] });
    queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
  };

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1B365D' }}>No Property Selected</h3>
              <p className="text-gray-600">Please select a property to start inspections</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'setup') {
    return (
      <InspectionSetup
        property={currentProperty}
        baselineSystems={baselineSystems}
        onStart={handleInspectionSetup}
        onCancel={handleBackToHistory}
      />
    );
  }

  if (currentView === 'walkthrough' && activeInspection) {
    return (
      <InspectionWalkthrough
        inspection={activeInspection}
        property={currentProperty}
        baselineSystems={baselineSystems}
        onComplete={handleCompleteInspection}
        onCancel={handleBackToHistory}
      />
    );
  }

  if (currentView === 'complete' && activeInspection) {
    return (
      <InspectionComplete
        inspection={activeInspection}
        property={currentProperty}
        onViewPriorityQueue={() => {
          handleBackToHistory();
          // TODO: Navigate to ACT → Prioritize
        }}
        onViewReport={() => {
          setViewingReport(activeInspection);
          setCurrentView('report');
        }}
        onDone={handleBackToHistory}
      />
    );
  }

  if (currentView === 'report' && viewingReport) {
    return (
      <InspectionReport
        inspection={viewingReport}
        property={currentProperty}
        baselineSystems={baselineSystems}
        onBack={handleBackToHistory}
      />
    );
  }

  // Main history view
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>AWARE → INSPECT</h1>
          <p className="text-xl text-gray-600">Visual Property Walkthrough</p>
          <p className="text-gray-600 mt-1">Catch problems when they're small, cheap, and easy to fix</p>
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

        {/* Start New Inspection Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartInspection}
            className="h-16 px-12 text-lg font-bold"
            style={{ backgroundColor: '#28A745' }}
            disabled={baselineSystems.length === 0}
          >
            <Plus className="w-6 h-6 mr-2" />
            Start New Inspection
          </Button>
        </div>

        {baselineSystems.length === 0 && (
          <Card className="border-2" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>Complete Baseline First</h3>
                  <p className="text-gray-700">
                    Document your property systems in the Baseline module first. This personalizes your inspection walkthrough based on the systems you actually have.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <hr className="border-gray-200" />

        {/* Inspection History */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B365D' }}>INSPECTION HISTORY:</h2>
          
          {sortedInspections.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">No Inspections Yet</h3>
                <p className="text-gray-600">Start your first inspection to begin tracking your property's condition</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedInspections.map((inspection) => {
                const urgentCount = (inspection.checklist_items || []).filter(item => 
                  item.severity === 'Urgent' || item.condition_rating === 'Urgent'
                ).length;
                const flagCount = (inspection.checklist_items || []).filter(item => 
                  item.severity === 'Flag' || item.condition_rating === 'Poor'
                ).length;
                const monitorCount = (inspection.checklist_items || []).filter(item => 
                  item.severity === 'Monitor' || item.condition_rating === 'Fair'
                ).length;
                const completedTasks = (inspection.checklist_items || []).filter(item => 
                  item.completed || item.status === 'Completed'
                ).length;
                const totalTasks = (inspection.checklist_items || []).length;

                return (
                  <Card key={inspection.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                              {inspection.season} {inspection.year}
                            </h3>
                            {inspection.status === 'Completed' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                            {inspection.status === 'In Progress' && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {inspection.inspection_date 
                              ? new Date(inspection.inspection_date).toLocaleDateString('en-US', { 
                                  month: 'long', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : 'Date not recorded'}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {urgentCount > 0 && (
                              <span className="text-sm">
                                🚨 <strong>{urgentCount}</strong> urgent
                              </span>
                            )}
                            {flagCount > 0 && (
                              <span className="text-sm">
                                ⚠️ <strong>{flagCount}</strong> flag
                              </span>
                            )}
                            {monitorCount > 0 && (
                              <span className="text-sm">
                                ✅ <strong>{monitorCount}</strong> monitor
                              </span>
                            )}
                          </div>
                          {totalTasks > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Status:</strong> {completedTasks} of {totalTasks} addressed
                              {completedTasks === totalTasks && " ✓"}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleViewReport(inspection)}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          View Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}