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
  PlayCircle, BookOpen, Lightbulb, Shield, ChevronRight, ChevronDown, Info
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
          <Card className="border-2 border-purple-200 shadow-2xl mb-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Choose Your Documentation Method
              </CardTitle>
              <p className="text-gray-600 text-lg">Pick the approach that works best for you</p>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
                {/* Quick Start Wizard */}
                <Card 
                  className={`border-2 border-purple-300 transition-all group hover:shadow-xl bg-white ${
                    canEdit ? 'hover:border-purple-500 cursor-pointer' : 'opacity-75 cursor-not-allowed'
                  }`}
                  onClick={() => canEdit && setShowWizard(true)}
                >
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <Lightbulb className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: '#1B365D' }}>
                        ⚡ Quick Start Wizard
                      </h3>
                      <Badge className="bg-purple-600 text-white mb-4 text-sm px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        10-15 minutes
                      </Badge>
                      <p className="text-gray-700 mb-6">
                        Guided step-by-step documentation of your 4 most critical systems.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
                      <p className="text-sm font-semibold text-purple-900 mb-3">✓ Perfect for:</p>
                      <ul className="text-sm text-purple-800 space-y-2">
                        <li>• First-time users</li>
                        <li>• Digital-first approach</li>
                        <li>• Quick essential coverage</li>
                        <li>• Unlock ACT phase fast</li>
                      </ul>
                    </div>

                    <Button 
                      className="w-full gap-2 text-lg py-6 group-hover:shadow-lg"
                      style={{ backgroundColor: '#9333EA', minHeight: '56px' }}
                      disabled={!canEdit}
                    >
                      <Lightbulb className="w-5 h-5" />
                      Start Quick Setup →
                    </Button>
                  </CardContent>
                </Card>

                {/* Physical Walkthrough */}
                <Card 
                  className={`border-2 border-green-300 transition-all group hover:shadow-xl bg-white ${
                    canEdit ? 'hover:border-green-500 cursor-pointer' : 'opacity-75 cursor-not-allowed'
                  }`}
                  onClick={() => canEdit && handleStartPhysicalInspection()}
                >
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: '#1B365D' }}>
                        🏠 Physical Walkthrough
                      </h3>
                      <Badge className="bg-green-600 text-white mb-4 text-sm px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        30-45 minutes
                      </Badge>
                      <p className="text-gray-700 mb-6">
                        Room-by-room route through your property.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                      <p className="text-sm font-semibold text-green-900 mb-3">✓ Perfect for:</p>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>• Complete documentation</li>
                        <li>• Physical inspection mindset</li>
                        <li>• Mobile on-site use</li>
                      </ul>
                    </div>

                    <Button 
                      className="w-full gap-2 text-lg py-6 group-hover:shadow-lg"
                      style={{ backgroundColor: '#16A34A', minHeight: '56px' }}
                      disabled={!canEdit}
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Walkthrough →
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom option */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">Or document systems individually as you go →</p>
                <Button
                  onClick={handleStartTraditionalInspection}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:border-gray-400"
                  style={{ minHeight: '48px' }}
                  disabled={!canEdit}
                >
                  Scroll down to browse all system categories
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

        {/* Why Inspections Matter - Educational Section */}
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl" style={{ color: '#1B365D' }}>
              <Lightbulb className="w-8 h-8 text-yellow-600" />
              Why Regular Inspections Matter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Catch Early */}
              <div className="bg-white rounded-lg p-5 border-2 border-red-200 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-900 text-lg">Catch Problems Early</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>Small issues become <strong>expensive disasters</strong> if ignored</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span><strong>$200 repair</strong> now vs <strong>$8,000</strong> later</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>Seasonal changes reveal <strong>hidden problems</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>Track <strong>degradation over time</strong></span>
                  </li>
                </ul>
              </div>

              {/* Prevent Cascades */}
              <div className="bg-white rounded-lg p-5 border-2 border-orange-200 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-orange-900 text-lg">Prevent Cascades</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span><strong>One failure</strong> triggers <strong>chain reactions</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span>Gutters → Foundation → Basement flooding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span>Small roof leak → Rotted deck → Interior damage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span>Stop problems <strong>before they spread</strong></span>
                  </li>
                </ul>
              </div>

              {/* Protect Value */}
              <div className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-900 text-lg">Protect Value</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>Well-maintained homes <strong>sell for 10-15% more</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>Inspection records prove <strong>proactive care</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span><strong>Faster sales</strong> with documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>Lower <strong>insurance premiums</strong> possible</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* The Bottom Line */}
            <div className="bg-white rounded-lg p-5 border-2 border-purple-300">
              <div className="flex items-start gap-3">
                <BookOpen className="w-7 h-7 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900 text-lg mb-2">The Bottom Line:</h3>
                  <p className="text-gray-800 leading-relaxed">
                    <strong>Seasonal inspections = predictable maintenance.</strong> Most homeowners only look at systems when 
                    they fail—resulting in emergency repairs at 2-3X normal cost. Regular inspections let you spot the <em>"my HVAC 
                    filter is dirty and airflow is reduced"</em> before it becomes <em>"my AC died in July and emergency replacement 
                    costs $12,000."</em> A <strong>20-minute inspection</strong> every 3 months prevents thousands in emergency costs.
                  </p>
                  <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900">
                      ⚡ <strong>Recommended:</strong> Spring (pre-AC season), Fall (pre-heating season), plus 2 mid-season checks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection to Baseline */}
            <div className="bg-white rounded-lg p-5 border-2 border-blue-300">
              <h3 className="font-bold text-blue-900 text-lg mb-3 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                How Baseline & Inspections Work Together:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-800">
                <div>
                  <p className="font-semibold mb-2 text-blue-900">Baseline (One-Time):</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Documents <strong>what you have</strong></li>
                    <li>• Records initial condition</li>
                    <li>• Sets reference point</li>
                    <li>• Example: "HVAC installed 2015, working well"</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2 text-blue-900">Inspections (Regular):</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Tracks <strong>what's changed</strong></li>
                    <li>• Identifies new issues</li>
                    <li>• Updates system conditions</li>
                    <li>• Example: "Filter dirty, airflow reduced 30%"</li>
                  </ul>
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
    </div>
  );
}