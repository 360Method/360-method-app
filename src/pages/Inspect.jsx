import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Plus,
  Eye,
  PlayCircle,
  FileText,
  Wrench
} from "lucide-react";
import { createPageUrl } from "@/utils";

import InspectionSetup from "../components/inspect/InspectionSetup";
import InspectionWalkthrough from "../components/inspect/InspectionWalkthrough";
import InspectionComplete from "../components/inspect/InspectionComplete";
import InspectionReport from "../components/inspect/InspectionReport";
import ServiceRequestDialog from "../components/services/ServiceRequestDialog";

export default function Inspect() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = searchParams.get('property');

  const [currentView, setCurrentView] = React.useState('main');
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(propertyIdFromUrl || '');
  const [activeInspection, setActiveInspection] = React.useState(null);
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedPropertyId],
    queryFn: () => base44.entities.Inspection.filter({ property_id: selectedPropertyId }, '-created_date'),
    enabled: !!selectedPropertyId,
    initialData: [],
  });

  const { data: baselineSystems = [] } = useQuery({
    queryKey: ['baseline-systems', selectedPropertyId],
    queryFn: () => base44.entities.SystemBaseline.filter({ property_id: selectedPropertyId }),
    enabled: !!selectedPropertyId,
    initialData: [],
  });

  React.useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const hasBaselineSystems = baselineSystems.length > 0;
  const inProgressInspection = inspections.find(i => i.status === 'In Progress');

  const handleStartNewInspection = () => {
    setCurrentView('setup');
    setActiveInspection(null);
  };

  const handleInspectionSetupComplete = (inspection) => {
    setActiveInspection(inspection);
    setCurrentView('walkthrough');
  };

  const handleContinueInspection = (inspection) => {
    setActiveInspection(inspection);
    setCurrentView('walkthrough');
  };

  const handleInspectionComplete = (inspection) => {
    setActiveInspection(inspection);
    setCurrentView('complete');
  };

  const handleViewPriorityQueue = () => {
    window.location.href = createPageUrl("Prioritize") + `?property=${selectedPropertyId}`;
  };

  const handleViewReport = (inspection) => {
    setActiveInspection(inspection || activeInspection);
    setCurrentView('report');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setActiveInspection(null);
  };

  const handleEditInspection = (inspection) => {
    setActiveInspection(inspection);
    setCurrentView('walkthrough');
  };

  // Render different views
  if (currentView === 'setup') {
    return (
      <InspectionSetup
        property={selectedProperty}
        baselineSystems={baselineSystems}
        onComplete={handleInspectionSetupComplete}
        onCancel={handleBackToMain}
      />
    );
  }

  if (currentView === 'walkthrough' && activeInspection) {
    return (
      <InspectionWalkthrough
        inspection={activeInspection}
        property={selectedProperty}
        baselineSystems={baselineSystems}
        onComplete={handleInspectionComplete}
        onCancel={handleBackToMain}
      />
    );
  }

  if (currentView === 'complete' && activeInspection) {
    return (
      <InspectionComplete
        inspection={activeInspection}
        property={selectedProperty}
        onViewPriorityQueue={handleViewPriorityQueue}
        onViewReport={() => handleViewReport(activeInspection)}
        onDone={handleBackToMain}
      />
    );
  }

  if (currentView === 'report' && activeInspection) {
    return (
      <InspectionReport
        inspection={activeInspection}
        property={selectedProperty}
        baselineSystems={baselineSystems}
        onBack={handleBackToMain}
        onEdit={() => handleEditInspection(activeInspection)}
      />
    );
  }

  // Main inspection dashboard view
  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
              Seasonal Diagnostics
            </h1>
          </div>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            Proactive inspections to catch problems early
          </p>
        </div>

        {/* Educational Section */}
        {inspections.length === 0 && hasBaselineSystems && (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                <Eye className="w-6 h-6 text-blue-600" />
                Why Seasonal Inspections Matter
              </h3>
              <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Most home disasters are 100% preventable with regular inspections. A dirty filter caught today prevents a $6K HVAC failure tomorrow.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2 text-red-600">❌ Without Inspections</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Small leaks become $30K water damage</li>
                    <li>• Worn parts cause system failures</li>
                    <li>• Emergency repairs cost 3X more</li>
                    <li>• Insurance often won't cover neglect</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2 text-green-600">✅ With Seasonal Inspections</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Catch issues when they're cheap to fix</li>
                    <li>• Systems last their full lifespan</li>
                    <li>• Budget for repairs, no surprises</li>
                    <li>• Documentation for insurance claims</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                💡 Pro Tip: 45 minutes per season = avoid 95% of home disasters
              </p>
            </CardContent>
          </Card>
        )}

        {/* Property Selector */}
        {properties.length > 1 && (
          <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property:</label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                  <SelectValue placeholder="Choose a property" />
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
        )}

        {/* In-Progress Inspection Alert */}
        {inProgressInspection && (
          <Card className="border-2 border-orange-300 bg-orange-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-orange-900 mb-2">
                    📋 Inspection In Progress
                  </p>
                  <p className="text-sm text-orange-800 mb-3">
                    {inProgressInspection.season} {inProgressInspection.year} inspection started{' '}
                    {new Date(inProgressInspection.created_date).toLocaleDateString()}.{' '}
                    {inProgressInspection.completion_percentage}% complete. Your progress is automatically saved.
                  </p>
                  <div className="flex flex-col md:flex-row gap-2">
                    <Button
                      onClick={() => handleContinueInspection(inProgressInspection)}
                      style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Continue Inspection
                    </Button>
                    <Button
                      onClick={() => handleViewReport(inProgressInspection)}
                      variant="outline"
                      style={{ minHeight: '48px' }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Current Progress
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Button
            onClick={handleStartNewInspection}
            disabled={!hasBaselineSystems}
            className="w-full font-bold"
            style={{ 
              backgroundColor: hasBaselineSystems ? '#3B82F6' : '#CCCCCC',
              minHeight: '56px',
              fontSize: '16px'
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Inspection
          </Button>
          
          <Button
            onClick={() => setShowServiceDialog(true)}
            variant="outline"
            style={{ minHeight: '48px' }}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Request Professional Inspection
          </Button>
        </div>

        {/* Baseline System Warning */}
        {!hasBaselineSystems && (
          <Card className="border-2 border-orange-300 bg-orange-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900 mb-2">
                    Baseline Documentation Required
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Before inspecting, document your home's systems in the Baseline phase. This creates a reference point for tracking changes over time.
                  </p>
                  <Button
                    onClick={() => window.location.href = createPageUrl("Baseline") + `?property=${selectedPropertyId}`}
                    style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                  >
                    Complete Baseline First
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inspection History */}
        {inspections.length > 0 && (
          <div>
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              Inspection History
            </h2>
            
            <div className="space-y-4">
              {inspections
                .sort((a, b) => new Date(b.inspection_date || b.created_date) - new Date(a.inspection_date || a.created_date))
                .map((inspection) => {
                  const isInProgress = inspection.status === 'In Progress';
                  const isCompleted = inspection.status === 'Completed';
                  const hasUrgentIssues = (inspection.urgent_count || 0) > 0;
                  
                  return (
                    <Card 
                      key={inspection.id}
                      className={`border-2 hover:shadow-lg transition-shadow ${
                        isInProgress ? 'border-orange-300 bg-orange-50' :
                        hasUrgentIssues ? 'border-red-300 bg-red-50' :
                        'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '18px' }}>
                                {inspection.season} {inspection.year}
                              </h3>
                              <Badge style={{ 
                                backgroundColor: isCompleted ? '#28A745' : isInProgress ? '#FF6B35' : '#666666'
                              }}>
                                {inspection.status}
                              </Badge>
                              {isInProgress && (
                                <Badge variant="outline">
                                  {inspection.completion_percentage}% Complete
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {new Date(inspection.inspection_date || inspection.created_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              {inspection.duration_minutes > 0 && ` • ${inspection.duration_minutes} minutes`}
                            </p>

                            {isCompleted && (
                              <div className="flex flex-wrap gap-4 text-sm">
                                {(inspection.urgent_count || 0) > 0 && (
                                  <span className="text-red-600 font-semibold">
                                    🚨 {inspection.urgent_count} Urgent
                                  </span>
                                )}
                                {(inspection.flag_count || 0) > 0 && (
                                  <span className="text-orange-600 font-semibold">
                                    ⚠️ {inspection.flag_count} Flag
                                  </span>
                                )}
                                {(inspection.monitor_count || 0) > 0 && (
                                  <span className="text-green-600 font-semibold">
                                    ✅ {inspection.monitor_count} Monitor
                                  </span>
                                )}
                                {inspection.issues_found === 0 && (
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    No Issues Found
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {isInProgress ? (
                              <Button
                                onClick={() => handleContinueInspection(inspection)}
                                size="sm"
                                style={{ backgroundColor: '#FF6B35', minHeight: '44px' }}
                              >
                                Continue
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleViewReport(inspection)}
                                variant="outline"
                                size="sm"
                                style={{ minHeight: '44px' }}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                View Report
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {inspections.length === 0 && hasBaselineSystems && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Inspections Yet</h3>
              <p className="text-gray-600 mb-6">
                Start your first seasonal inspection to catch problems early
              </p>
              <Button
                onClick={handleStartNewInspection}
                style={{ backgroundColor: '#3B82F6', minHeight: '56px' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Your First Inspection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ServiceRequestDialog
        open={showServiceDialog}
        onClose={() => setShowServiceDialog(false)}
        prefilledData={{
          property_id: selectedPropertyId,
          service_type: "Professional Inspection",
          description: "Request professional seasonal inspection service",
          urgency: "Medium"
        }}
      />
    </div>
  );
}