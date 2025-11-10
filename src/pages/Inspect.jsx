import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, Eye, CheckCircle, AlertTriangle, Clock, Wrench, ChevronRight } from "lucide-react";
import InspectionSetup from "../components/inspect/InspectionSetup.jsx";
import InspectionWalkthrough from "../components/inspect/InspectionWalkthrough.jsx";
import InspectionComplete from "../components/inspect/InspectionComplete.jsx";
import InspectionReport from "../components/inspect/InspectionReport.jsx";
import ServiceRequestDialog from "../components/services/ServiceRequestDialog.jsx";

export default function Inspect() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [currentView, setCurrentView] = React.useState('history');
  const [activeInspection, setActiveInspection] = React.useState(null);
  const [viewingReport, setViewingReport] = React.useState(null);
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);

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

  const handleContinueInspection = (inspection) => {
    setActiveInspection(inspection);
    setCurrentView('walkthrough');
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
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
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

  // Main history view - Mobile first
  return (
    <div className="min-h-screen bg-white pb-4">
      <div className="mobile-container md:max-w-4xl md:mx-auto">
        {/* Header - Mobile optimized */}
        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
            INSPECT
          </h1>
          <p className="text-gray-600" style={{ fontSize: '16px', lineHeight: '1.5' }}>
            Visual Property Walkthrough
          </p>
        </div>

        {/* Property Selector - Full width on mobile */}
        <Card className="border-none shadow-sm mobile-card">
          <CardContent className="p-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Property</label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
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

        {/* Action Buttons - Stacked on mobile, side-by-side on desktop */}
        <div className="space-y-3 mb-6 md:flex md:gap-4 md:space-y-0">
          <Button
            onClick={handleStartInspection}
            className="w-full font-bold text-base"
            style={{ backgroundColor: '#28A745', minHeight: '56px' }}
            disabled={baselineSystems.length === 0}
          >
            <Plus className="w-6 h-6 mr-2" />
            Start DIY Inspection
          </Button>
          <Button
            onClick={() => setShowServiceDialog(true)}
            variant="outline"
            className="w-full font-bold text-base"
            style={{ borderColor: '#28A745', color: '#28A745', minHeight: '56px' }}
          >
            <Wrench className="w-6 h-6 mr-2" />
            Get Professional Help
          </Button>
        </div>

        {/* Baseline Warning - Mobile optimized */}
        {baselineSystems.length === 0 && (
          <Card className="border-2 mobile-card" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#FF6B35' }} />
                <div>
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    Complete Baseline First
                  </h3>
                  <p className="text-gray-700 mb-0" style={{ fontSize: '16px', lineHeight: '1.5' }}>
                    Document your property systems in the Baseline module first. This personalizes your inspection walkthrough.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <hr className="border-gray-200 my-6" />

        {/* Inspection History */}
        <div>
          <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
            Inspection History
          </h2>
          
          {sortedInspections.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
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
                const completedTasks = (inspection.checklist_items || []).filter(item => 
                  item.completed || item.status === 'Completed'
                ).length;
                const totalTasks = (inspection.checklist_items || []).length;

                return (
                  <Card 
                    key={inspection.id} 
                    className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewReport(inspection)}
                    style={{ minHeight: '80px' }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '18px' }}>
                              {inspection.season} {inspection.year}
                            </h3>
                            {inspection.status === 'Completed' && (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1" style={{ minHeight: '24px' }}>
                                <CheckCircle className="w-3 h-3" />
                                <span style={{ fontSize: '12px' }}>Complete</span>
                              </Badge>
                            )}
                            {inspection.status === 'In Progress' && (
                              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1" style={{ minHeight: '24px' }}>
                                <Clock className="w-3 h-3" />
                                <span style={{ fontSize: '12px' }}>In Progress</span>
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2" style={{ fontSize: '14px' }}>
                            {inspection.inspection_date 
                              ? new Date(inspection.inspection_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : 'Date not recorded'}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 text-sm" style={{ fontSize: '14px' }}>
                            {urgentCount > 0 && <span>🚨 <strong>{urgentCount}</strong> urgent</span>}
                            {flagCount > 0 && <span>⚠️ <strong>{flagCount}</strong> flag</span>}
                            {totalTasks > 0 && (
                              <span className="text-gray-600">
                                {completedTasks}/{totalTasks} addressed
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                      
                      {inspection.status === 'In Progress' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinueInspection(inspection);
                          }}
                          className="w-full mt-3"
                          style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                        >
                          Continue Inspection
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ServiceRequestDialog
        open={showServiceDialog}
        onClose={() => setShowServiceDialog(false)}
        prefilledData={{
          property_id: selectedProperty,
          service_type: "Seasonal Inspection",
          description: "I would like to schedule a professional seasonal property inspection with issue identification and reporting."
        }}
      />
    </div>
  );
}