import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, Calendar, CheckCircle2, AlertTriangle, Clock, Eye, FileText, Trash2,
  PlayCircle, BookOpen, Lightbulb, Shield, ChevronRight, ChevronDown, Info, Wrench
} from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InspectionSetup from "../components/inspect/InspectionSetup";
import InspectionWalkthrough from "../components/inspect/InspectionWalkthrough";
import InspectionComplete from "../components/inspect/InspectionComplete";
import InspectionReport from "../components/inspect/InspectionReport";
import InspectionWizard from "../components/inspect/InspectionWizard";
import ServiceRequestDialog from "../components/services/ServiceRequestDialog";
import ConfirmDialog from "../components/ui/confirm-dialog";
import StepNavigation from "../components/navigation/StepNavigation";
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';
import DemoCTA from '../components/demo/DemoCTA';

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function Inspect() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = searchParams.get('property');

  const [inspectionView, setInspectionView] = React.useState('main');
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(propertyIdFromUrl || '');
  const [currentInspection, setCurrentInspection] = React.useState(null);
  const [serviceRequestOpen, setServiceRequestOpen] = React.useState(false);
  const [inspectionToDelete, setInspectionToDelete] = React.useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [viewingInspection, setViewingInspection] = React.useState(null);
  const [showWizard, setShowWizard] = React.useState(false);

  const queryClient = useQueryClient();
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (demoMode) markStepVisited(2);
  }, [demoMode, markStepVisited]);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      if (demoMode) {
        return isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
      }
      const allProps = await base44.entities.Property.list();
      return allProps.filter(p => !p.is_draft);
    },
  });

  const { data: realInspections = [] } = useQuery({
    queryKey: ['inspections', selectedPropertyId],
    queryFn: () => {
      if (demoMode) {
        if (isInvestor) {
          if (!selectedPropertyId) return [];
          return demoData?.inspections?.filter(i => i.property_id === selectedPropertyId) || [];
        }
        return demoData?.inspections || [];
      }
      return base44.entities.Inspection.filter({ property_id: selectedPropertyId }, '-created_date');
    },
    enabled: !!selectedPropertyId
  });

  const inspections = realInspections;

  console.log('=== INSPECT STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Inspections:', inspections);
  console.log('Inspections count:', inspections?.length);

  const { data: realBaselineSystems = [] } = useQuery({
    queryKey: ['baseline-systems', selectedPropertyId],
    queryFn: () => {
      if (demoMode) {
        if (isInvestor) {
          if (!selectedPropertyId) return [];
          return demoData?.systems?.filter(s => s.property_id === selectedPropertyId) || [];
        }
        return demoData?.systems || [];
      }
      return base44.entities.SystemBaseline.filter({ property_id: selectedPropertyId });
    },
    enabled: !!selectedPropertyId
  });

  const baselineSystems = realBaselineSystems;

  const canEdit = !demoMode;

  const deleteInspectionMutation = useMutation({
    mutationFn: async (inspectionId) => {
      return base44.entities.Inspection.delete(inspectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setDeleteConfirmOpen(false);
      setInspectionToDelete(null);
    },
  });

  // Initialize selected property from URL or first available property
  React.useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      if (propertyIdFromUrl) {
        setSelectedPropertyId(propertyIdFromUrl);
      } else {
        setSelectedPropertyId(properties[0].id);
      }
    }
  }, [properties, selectedPropertyId, propertyIdFromUrl]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const hasBaselineSystems = baselineSystems.length > 0;
  const inProgressInspection = inspections.find(i => i.status === 'In Progress');

  const handleStartNewInspection = () => {
    if (demoMode) return;
    setInspectionView('setup');
    setCurrentInspection(null);
  };

  const handleStartTraditionalInspection = () => {
    if (demoMode) return;
    setInspectionView('setup');
    setCurrentInspection(null);
  };

  const handleStartPhysicalInspection = () => {
    if (demoMode) return;
    // Create a new inspection and go directly to physical walkthrough
    setInspectionView('setup');
    setCurrentInspection({ usePhysicalWalkthrough: true });
  };

  const handleInspectionSetupComplete = (inspection) => {
    setCurrentInspection(inspection);
    setInspectionView('walkthrough');
  };

  const handleContinueInspection = (inspection) => {
    setCurrentInspection(inspection);
    setInspectionView('walkthrough');
  };

  const handleInspectionComplete = (inspection) => {
    setCurrentInspection(inspection);
    setInspectionView('complete');
  };

  const handleViewPriorityQueue = () => {
    window.location.href = createPageUrl("Prioritize") + `?property=${selectedPropertyId}`;
  };

  const handleViewReport = (inspection) => {
    setViewingInspection(inspection);
    setCurrentInspection(inspection || currentInspection);
    setInspectionView('report');
  };

  const handleWizardComplete = (inspectionData) => {
    console.log('Inspection wizard completed:', inspectionData);
    setShowWizard(false);
    // In real app: save inspection data
  };

  const handleBackToMain = () => {
    setInspectionView('main');
    setCurrentInspection(null);
  };

  const handleEditInspection = (inspection) => {
    if (demoMode) return;
    setCurrentInspection(inspection);
    setInspectionView('walkthrough');
  };

  const handleDeleteInspection = (inspection) => {
    if (demoMode) return;
    setInspectionToDelete(inspection);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (inspectionToDelete) {
      await deleteInspectionMutation.mutateAsync(inspectionToDelete.id);
      setInspectionToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const getDeleteMessage = () => {
    if (!inspectionToDelete) return '';
    
    const hasIssues = (inspectionToDelete.issues_found || 0) > 0;
    
    let message = `Are you sure you want to delete the ${inspectionToDelete.season} ${inspectionToDelete.year} inspection?`;
    
    if (hasIssues && inspectionToDelete.status === 'Completed') {
      message += `\n\n⚠️ Warning: This inspection documented ${inspectionToDelete.issues_found} issue(s). Deleting it will permanently remove the inspection report and all findings.`;
    } else if (inspectionToDelete.status === 'In Progress') {
      message += `\n\n⚠️ Warning: This inspection is in progress (${inspectionToDelete.completion_percentage}% complete). All progress will be lost.`;
    }
    
    message += '\n\nThis action cannot be undone.';
    
    return message;
  };

  // Render different views
  if (inspectionView === 'setup') {
    return (
      <InspectionSetup
        property={selectedProperty}
        baselineSystems={baselineSystems}
        onComplete={handleInspectionSetupComplete}
        onCancel={handleBackToMain}
      />
    );
  }

  if (inspectionView === 'walkthrough' && currentInspection) {
    return (
      <InspectionWalkthrough
        inspection={currentInspection}
        property={selectedProperty}
        baselineSystems={baselineSystems}
        onComplete={handleInspectionComplete}
        onCancel={handleBackToMain}
      />
    );
  }

  if (inspectionView === 'complete' && currentInspection) {
    return (
      <InspectionComplete
        inspection={currentInspection}
        property={selectedProperty}
        onViewPriorityQueue={handleViewPriorityQueue}
        onViewReport={() => handleViewReport(currentInspection)}
        onDone={handleBackToMain}
      />
    );
  }

  if (inspectionView === 'report' && currentInspection) {
    // Find the property for this inspection - either from selectedProperty or by property_id
    const reportProperty = selectedProperty || properties.find(p => p.id === currentInspection.property_id);
    
    return (
      <InspectionReport
        inspection={currentInspection}
        property={reportProperty}
        baselineSystems={baselineSystems}
        onBack={handleBackToMain}
        onEdit={() => handleEditInspection(currentInspection)}
      />
    );
  }

  // Main inspection dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={2} propertyId={selectedPropertyId !== '' ? selectedPropertyId : null} />
        </div>

        {/* Demo Banner */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> View detailed inspection reports with findings below. 
              Click "View" on any inspection to see the full report. Read-only example.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
              Phase I - AWARE
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 2 of 9
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Inspect
              </h1>
              <DemoInfoTooltip 
                title="Step 2: Inspect"
                content="Seasonal walkthroughs (4x/year) catch small problems before they cascade into expensive failures. This is your early warning system."
              />
            </div>
            {canEdit && selectedPropertyId && hasBaselineSystems && (
              <Button
                onClick={() => setShowWizard(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Inspection
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-lg">
            Seasonal inspections to catch issues before they cascade
          </p>
        </div>

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-2 border-gray-200 shadow-sm mb-6">
            <CardContent className="p-4">
              <Label className="mb-2 block text-sm">Select Property</Label>
              <Select value={selectedPropertyId || ""} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
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

        {/* MAIN METHOD SELECTOR - Clean, focused view */}
        {selectedPropertyId && hasBaselineSystems && !inProgressInspection && (
          <Card className="border-2 border-orange-200 shadow-2xl mb-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Choose Your Inspection Method
              </CardTitle>
              <p className="text-gray-600 text-lg">Pick the approach that works best for you</p>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
                {/* Quick Inspection Wizard */}
                <Card 
                  className={`border-2 border-orange-300 transition-all group hover:shadow-xl bg-white ${
                    canEdit ? 'hover:border-orange-500 cursor-pointer' : 'opacity-75 cursor-not-allowed'
                  }`}
                  onClick={() => canEdit && setShowWizard(true)}
                >
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <Eye className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: '#1B365D' }}>
                        ⚡ Quick Inspection
                      </h3>
                      <Badge className="bg-orange-600 text-white mb-4 text-sm px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        15-20 minutes
                      </Badge>
                      <p className="text-gray-700 mb-6">
                        Focused check of your 6 essential systems for critical issues.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 mb-6 text-left">
                      <p className="text-sm font-semibold text-orange-900 mb-3">✓ Perfect for:</p>
                      <ul className="text-sm text-orange-800 space-y-2">
                        <li>• Seasonal check-ins (quarterly)</li>
                        <li>• Pre-winter/summer prep</li>
                        <li>• Spot-checking critical systems</li>
                        <li>• Quick issue identification</li>
                      </ul>
                    </div>

                    <Button 
                      className="w-full gap-2 text-lg py-6 group-hover:shadow-lg"
                      style={{ backgroundColor: '#EA580C', minHeight: '56px' }}
                      disabled={!canEdit}
                    >
                      <Eye className="w-5 h-5" />
                      Start Quick Inspection →
                    </Button>
                  </CardContent>
                </Card>

                {/* Full Property Walkthrough */}
                <Card 
                  className={`border-2 border-teal-300 transition-all group hover:shadow-xl bg-white ${
                    canEdit ? 'hover:border-teal-500 cursor-pointer' : 'opacity-75 cursor-not-allowed'
                  }`}
                  onClick={() => canEdit && handleStartPhysicalInspection()}
                >
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: '#1B365D' }}>
                        🏠 Full Property Walkthrough
                      </h3>
                      <Badge className="bg-teal-600 text-white mb-4 text-sm px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        30-45 minutes
                      </Badge>
                      <p className="text-gray-700 mb-6">
                        Comprehensive room-by-room inspection with detailed notes.
                      </p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4 mb-6 text-left">
                      <p className="text-sm font-semibold text-teal-900 mb-3">✓ Perfect for:</p>
                      <ul className="text-sm text-teal-800 space-y-2">
                        <li>• Thorough seasonal inspections</li>
                        <li>• Pre/post-tenant turnover</li>
                        <li>• Post-storm assessments</li>
                        <li>• Annual comprehensive review</li>
                      </ul>
                    </div>

                    <Button 
                      className="w-full gap-2 text-lg py-6 group-hover:shadow-lg"
                      style={{ backgroundColor: '#0D9488', minHeight: '56px' }}
                      disabled={!canEdit}
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Full Walkthrough →
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom option */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">Or create a custom inspection checklist →</p>
                <Button
                  onClick={handleStartTraditionalInspection}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:border-gray-400"
                  style={{ minHeight: '48px' }}
                  disabled={!canEdit}
                >
                  Build Custom Inspection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NEW: Step Education Card - Collapsed by default */}
        <StepEducationCard 
          {...STEP_EDUCATION.inspect}
          defaultExpanded={false}
          className="mb-6"
        />

        {demoMode && (
          <RegionalAdaptationBox
            step="seasonal inspections"
            regionalAdaptations={{
              description: "Inspection timing and focus areas shift dramatically by climate. A fall inspection in Seattle looks nothing like one in Phoenix.",
              howItWorks: "Inspection checklists, timing windows, and urgency levels adapt to your region's critical maintenance seasons",
              examples: {
                'pacific-northwest': [
                  'Fall: Pre-rain prep (gutters, drainage) - CRITICAL',
                  'Winter: Storm damage monitoring',
                  'Spring: Moisture damage assessment',
                  'Summer: Preventive maintenance window'
                ],
                'southwest': [
                  'Spring: Pre-summer AC critical check',
                  'Summer: Heat stress monitoring',
                  'Fall: Post-monsoon damage assessment',
                  'Winter: Off-season maintenance window'
                ],
                'midwest-northeast': [
                  'Fall: Pre-freeze winterization - CRITICAL',
                  'Winter: Freeze damage monitoring',
                  'Spring: Thaw damage assessment',
                  'Summer: Foundation & AC maintenance'
                ],
                'southeast': [
                  'Spring: Pre-hurricane season prep - CRITICAL',
                  'Summer: Hurricane damage monitoring',
                  'Fall: Storm recovery assessment',
                  'Winter: Termite & mold prevention'
                ]
              }
            }}
          />
        )}

        {/* Need Help Card - Demo Only */}
        {demoMode && selectedPropertyId && hasBaselineSystems && (
          <Card className="border-2 border-blue-300 bg-blue-50 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-blue-900 mb-2">Need Help?</p>
                  <p className="text-gray-700 mb-4">
                    Reach out to your local 360° Operator for professional inspection services.
                  </p>
                  <Button
                    onClick={() => window.location.href = createPageUrl('Waitlist')}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Find a Local Operator
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Need Help Card - Demo Only */}
        {demoMode && selectedPropertyId && hasBaselineSystems && (
          <Card className="border-2 border-blue-300 bg-blue-50 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Wrench className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-blue-900 mb-2">Need Help?</p>
                  <p className="text-gray-700 mb-4">
                    Reach out to your local 360° Operator for professional inspection services.
                  </p>
                  <Button
                    onClick={() => window.location.href = createPageUrl('Waitlist')}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Find a Local Operator
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Why Inspections Matter - Condensed Educational Section */}
        <Card className="border-2 border-yellow-200 bg-yellow-50 shadow-lg mb-8">
          <CardContent className="p-6">
            <button
              onClick={() => {
                const whySection = document.getElementById('why-inspections-expanded');
                if (whySection) {
                  const isExpanded = whySection.style.display !== 'none';
                  whySection.style.display = isExpanded ? 'none' : 'block';
                }
              }}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 text-lg mb-2">Why Regular Inspections Matter</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  <strong>Seasonal inspections = predictable maintenance.</strong> Catch $200 issues before they become $8,000 emergencies. 
                  Regular 20-minute check-ins prevent cascade failures and protect your home's value.
                </p>
                <p className="text-sm text-yellow-700 mt-2 font-semibold">
                  ⚡ Recommended: Quarterly inspections (Spring, Summer, Fall, Winter)
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            </button>

            {/* Expandable Full Content */}
            <div id="why-inspections-expanded" style={{ display: 'none' }} className="mt-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Catch Early */}
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-red-900">Catch Problems Early</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-800">
                    <li>• $200 repair now vs $8,000 later</li>
                    <li>• Seasonal changes reveal hidden problems</li>
                    <li>• Track degradation over time</li>
                  </ul>
                </div>

                {/* Prevent Cascades */}
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-orange-900">Prevent Cascades</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-800">
                    <li>• One failure triggers chain reactions</li>
                    <li>• Gutters → Foundation → Flooding</li>
                    <li>• Stop problems before they spread</li>
                  </ul>
                </div>

                {/* Protect Value */}
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-green-900">Protect Value</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-800">
                    <li>• Homes sell for 10-15% more</li>
                    <li>• Records prove proactive care</li>
                    <li>• Lower insurance premiums</li>
                  </ul>
                </div>
              </div>

              {/* How They Work Together */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Baseline vs Inspections
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-800">
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Baseline (One-Time):</p>
                    <p>Documents what you have, sets reference point</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Inspections (Regular):</p>
                    <p>Tracks what's changed, identifies new issues</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In-Progress Inspection Alert */}
        {inProgressInspection && (
          <Card className="border-2 border-orange-300 bg-orange-50 mb-8">
            <CardContent className="p-6">
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
                  <Progress value={inProgressInspection.completion_percentage} className="w-full mb-3" />
                  <div className="flex flex-col md:flex-row gap-2">
                    <Button
                      onClick={() => handleContinueInspection(inProgressInspection)}
                      style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Continue
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

        {/* Baseline System Warning */}
        {!hasBaselineSystems && selectedPropertyId && (
          <Card className="border-2 border-orange-300 bg-orange-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900 mb-2">
                    Baseline Documentation Required First
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
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
                              <h3 className="font-bold text-xl" style={{ color: '#1B365D' }}>
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

                          <div className="flex items-center gap-2">
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
                                View
                              </Button>
                            )}

                            {canEdit && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" style={{ minHeight: '44px', minWidth: '44px' }}>
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                  {isCompleted && (
                                    <DropdownMenuItem onClick={() => handleEditInspection(inspection)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Edit/Review
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteInspection(inspection)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
        {inspections.length === 0 && hasBaselineSystems && !inProgressInspection && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Inspections Yet</h3>
              <p className="text-gray-600 mb-6">
                Choose your inspection method above to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {canEdit && (
        <ServiceRequestDialog
          open={serviceRequestOpen}
          onClose={() => setServiceRequestOpen(false)}
          prefilledData={{
            property_id: selectedPropertyId,
            service_type: "Professional Inspection",
            description: "Request professional seasonal inspection service",
            urgency: "Medium"
          }}
        />
      )}

      {canEdit && deleteConfirmOpen && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setInspectionToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Inspection?"
          message={getDeleteMessage()}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      )}

      {showWizard && (
        <InspectionWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
          properties={properties}
        />
      )}

      <DemoCTA />
    </div>
  );
}