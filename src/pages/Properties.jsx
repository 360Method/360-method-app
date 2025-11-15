
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Home,
  Plus,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Zap,
  Upload,
  ArrowRight,
  HelpCircle,
  X,
  ArrowDown,
  Info,
  Lock,
  Sparkles
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import PropertyWizardWelcome from "../components/properties/PropertyWizardWelcome";
import PropertyWizardSimplified from "../components/properties/PropertyWizardSimplified";
import PropertySuccessScreen from "../components/properties/PropertySuccessScreen";
import QuickPropertyAdd from "../components/properties/QuickPropertyAdd";
import PropertyDashboard from "../components/properties/PropertyDashboard";
import EnhancedPropertyCard from "../components/properties/EnhancedPropertyCard";
import PropertyWizard from "../components/properties/PropertyWizard";
import { createPageUrl } from "@/utils";
import { useDemo } from "../components/shared/DemoContext";

export default function Properties() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(location.search);
  const { demoMode, demoData, exitDemoMode } = useDemo();

  // URL params
  const newParam = searchParams.get('new');
  const editId = searchParams.get('edit');
  const modeParam = searchParams.get('mode');

  // State
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSimplifiedWizard, setShowSimplifiedWizard] = useState(false);
  const [showCompleteWizard, setShowCompleteWizard] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [completedProperty, setCompletedProperty] = useState(null);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [showMethodInfo, setShowMethodInfo] = useState(false);

  // Fetch data - only fetch real properties if not in demo mode
  const { data: realProperties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date'),
    enabled: !demoMode
  });

  // Use demo property OR real properties (never mix)
  const properties = demoMode 
    ? (demoData?.property ? [demoData.property] : [])
    : realProperties;

  console.log('=== PROPERTIES PAGE STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Real properties:', realProperties);
  console.log('Properties (final):', properties);
  console.log('Can edit:', !demoMode);

  const canEdit = !demoMode;

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (propertyId) => base44.entities.Property.delete(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
      setShowConfirmDelete(false);
      setPropertyToDelete(null);
    }
  });

  // Check if first time (show welcome)
  useEffect(() => {
    if (demoMode) return; // Don't show wizards in demo mode
    
    const hideWelcome = localStorage.getItem('hidePropertyWelcome');
    if (newParam === 'true' && properties.length === 0 && !hideWelcome) {
      setShowWelcome(true);
    } else if (newParam === 'true') {
      setShowQuickAdd(true);
    }
  }, [newParam, properties.length, demoMode]);

  // Handle edit mode
  useEffect(() => {
    if (demoMode) return; // Don't allow editing in demo mode
    
    if (editId) {
      setEditingPropertyId(editId);
      if (modeParam === 'complete') {
        setShowCompleteWizard(true);
      } else {
        setShowSimplifiedWizard(true);
      }
    }
  }, [editId, modeParam, demoMode]);

  const handleAddProperty = (mode = 'quick') => {
    if (demoMode) return; // Don't allow adding in demo mode
    
    const hideWelcome = localStorage.getItem('hidePropertyWelcome');

    if (properties.length === 0 && !hideWelcome) {
      setShowWelcome(true);
    } else if (mode === 'quick') {
      setShowQuickAdd(true);
    } else if (mode === 'complete') {
      setShowCompleteWizard(true);
    } else {
      setShowSimplifiedWizard(true);
    }
  };

  const handleWizardComplete = (property) => {
    setShowSimplifiedWizard(false);
    setShowCompleteWizard(false);
    setEditingPropertyId(null);
    setCompletedProperty(property);
    setShowSuccessScreen(true);
    queryClient.invalidateQueries(['properties']);

    // Clear URL params
    window.history.replaceState({}, '', createPageUrl('Properties'));
  };

  const handleQuickAddSuccess = (propertyId) => {
    setShowQuickAdd(false);
    navigate(`/baseline?propertyId=${propertyId}&welcome=true`);
  };

  const handleSuccessContinue = () => {
    setShowSuccessScreen(false);
    setCompletedProperty(null);
  };

  const handleDeleteProperty = (propertyId) => {
    if (demoMode) return;
    setPropertyToDelete(propertyId);
    setShowConfirmDelete(true);
  };

  const handleExitDemoAndAddProperty = () => {
    exitDemoMode();
    setTimeout(() => {
      setShowSimplifiedWizard(true);
    }, 100);
  };

  // Show welcome screen
  if (showWelcome) {
    return (
      <PropertyWizardWelcome
        onContinue={() => {
          setShowWelcome(false);
          setShowSimplifiedWizard(true);
        }}
        onSkip={() => {
          setShowWelcome(false);
          navigate(createPageUrl('Properties'));
        }}
      />
    );
  }

  // Show success screen
  if (showSuccessScreen && completedProperty) {
    return (
      <PropertySuccessScreen
        property={completedProperty}
        onAddAnother={() => {
          setShowSuccessScreen(false);
          setCompletedProperty(null);
          setShowSimplifiedWizard(true);
        }}
        onGoToDashboard={() => {
          setShowSuccessScreen(false);
          setCompletedProperty(null);
          navigate(createPageUrl('Dashboard'));
        }}
      />
    );
  }

  // Show simplified wizard
  if (showSimplifiedWizard) {
    const editingProperty = editingPropertyId ? properties.find(p => p.id === editingPropertyId) : null;

    return (
      <PropertyWizardSimplified
        existingProperty={editingProperty}
        onComplete={handleWizardComplete}
        onCancel={() => {
          setShowSimplifiedWizard(false);
          setEditingPropertyId(null);
          navigate(createPageUrl('Properties'));
        }}
      />
    );
  }

  // Show complete wizard
  if (showCompleteWizard) {
    const editingProperty = editingPropertyId ? properties.find(p => p.id === editingPropertyId) : null;

    return (
      <PropertyWizard
        existingProperty={editingProperty}
        onComplete={handleWizardComplete}
        onCancel={() => {
          setShowCompleteWizard(false);
          setEditingPropertyId(null);
          navigate(createPageUrl('Properties'));
        }}
      />
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* Demo Banner */}
        {demoMode && (
          <Alert className="mb-6 mt-4 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-yellow-900">
                <strong>Demo Mode:</strong> Viewing demo property. 
                Exit demo to manage your real properties.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={exitDemoMode}
                className="border-yellow-600 text-yellow-900 hover:bg-yellow-100"
              >
                Exit Demo
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Foundation Layer Header */}
        <div className="mb-6 mt-4">
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gray-700 text-white text-sm px-3 py-1.5">
                      🏗️ Foundation Layer
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
                    <span>Properties flow through:</span>
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <span className="text-blue-600">AWARE</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-orange-600">ACT</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-green-600">ADVANCE</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                  onClick={() => setShowMethodInfo(true)}
                  style={{ minHeight: '40px' }}
                >
                  <HelpCircle className="w-4 h-4" />
                  About the 360° Method
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Your Properties
              </h1>
              <p className="text-gray-600 text-lg">
                The foundation of your 360° Method journey
              </p>
            </div>

            {/* Add Property Dropdown - Hidden in demo mode */}
            {!demoMode && properties.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 gap-2" style={{ minHeight: '48px' }}>
                    <Plus className="w-5 h-5" />
                    Add Property
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleAddProperty('simple')}>
                    <Home className="w-4 h-4 mr-2" />
                    Guided Setup (Recommended)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddProperty('quick')}>
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Add (Expert)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddProperty('complete')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Complete Setup (All Details)
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import (Coming Soon)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Why This Step Matters */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Why Properties Are Your Foundation</h3>
                <p className="text-sm text-blue-800">
                  Think of each property as a patient. Just like a doctor needs your medical history, the 360° Method needs to know about your property to prevent disasters.
                </p>
              </div>
              {whyExpanded ? (
                <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
            </button>

            {whyExpanded && (
              <div className="mt-4 pt-4 border-t border-blue-200 space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Your property is your largest asset.</strong> The 360° Method tracks 9 major systems that cause 87% of expensive failures.
                </p>
                <p>
                  <strong>What happens after you add a property:</strong>
                </p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>Phase I - AWARE:</strong> Baseline → Inspect → Track your major systems</li>
                  <li>• <strong>Phase II - ACT:</strong> Prioritize → Schedule → Execute maintenance</li>
                  <li>• <strong>Phase III - ADVANCE:</strong> Preserve → Upgrade → SCALE (Portfolio CFO)</li>
                </ul>
                <p className="text-xs mt-2 p-2 bg-blue-100 rounded">
                  ⚡ <strong>3 Phases × 3 Steps = 9 Total Steps</strong>
                  <br />Properties are the foundation that flows through this 3×3 system.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading your properties...</p>
            </CardContent>
          </Card>
        )}

        {/* Demo Property Display */}
        {demoMode && properties.length > 0 && (
          <div className="space-y-6">
            {properties.map(property => (
              <Card 
                key={property.id}
                className="border-2 border-yellow-400 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                          {property.address}
                        </h3>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-400">
                          <Lock className="w-3 h-3 mr-1" />
                          Demo Property
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {property.city}, {property.state} {property.zip_code}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Type</p>
                          <p className="font-semibold">{property.property_type || 'Single-Family Home'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Year Built</p>
                          <p className="font-semibold">{property.year_built}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Square Feet</p>
                          <p className="font-semibold">{property.square_footage?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Health Score</p>
                          <p className="font-semibold text-green-600 text-xl">
                            {property.health_score}/100
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-yellow-300">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Baseline</p>
                          <p className="font-semibold text-blue-600">
                            {property.baseline_completion}% Complete
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      📊 Demo Property Highlights:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 16 systems documented (Baseline 100% complete)</li>
                      <li>• 8 prioritized tasks (1 urgent, 3 high priority)</li>
                      <li>• $7,200 in prevented costs from proactive maintenance</li>
                      <li>• 2 seasonal inspections completed (Fall & Spring 2024)</li>
                      <li>• 4 strategic upgrades planned (incl. bathroom remodel)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Exit Demo CTA */}
            <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
              <CardContent className="p-8 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Add Your Real Property?
                </h3>
                <p className="text-gray-700 mb-6 max-w-md mx-auto">
                  Exit demo mode to add and manage your properties with the complete 360° Method. 
                  Document your systems, track maintenance, and prevent costly failures.
                </p>
                <Button 
                  onClick={handleExitDemoAndAddProperty}
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
                  style={{ minHeight: '56px' }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Exit Demo & Add My Property
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State - Only for non-demo mode */}
        {!isLoading && !demoMode && properties.length === 0 && (
          <Card className="border-2 border-blue-300">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-6 flex items-center justify-center">
                <Home className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Add Your First Property
              </h2>
              <p className="text-gray-600 mb-2 max-w-md mx-auto">
                Start protecting your largest asset with the 360° Method. It only takes 5 minutes.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Track systems, prevent disasters, and build wealth through strategic maintenance
              </p>
              <Button
                onClick={() => handleAddProperty('simple')}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                style={{ minHeight: '56px', fontSize: '18px' }}
              >
                <Plus className="w-6 h-6" />
                Add My First Property
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Property Dashboard - Only for non-demo mode */}
        {!isLoading && !demoMode && properties.length > 0 && (
          <PropertyDashboard
            properties={properties}
            onAddProperty={() => handleAddProperty('simple')}
            onQuickAdd={() => handleAddProperty('quick')}
            onEditProperty={(propertyId) => {
              setEditingPropertyId(propertyId);
              setShowSimplifiedWizard(true);
            }}
            onDeleteProperty={handleDeleteProperty}
          />
        )}

        {/* Quick Add Modal */}
        {canEdit && (
          <QuickPropertyAdd
            open={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
            onSuccess={handleQuickAddSuccess}
          />
        )}

        {/* Delete Confirmation */}
        {canEdit && (
          <ConfirmDialog
            isOpen={showConfirmDelete}
            onClose={() => {
              setShowConfirmDelete(false);
              setPropertyToDelete(null);
            }}
            onConfirm={() => {
              if (propertyToDelete) {
                deleteMutation.mutate(propertyToDelete);
              }
            }}
            title="Delete Property?"
            description="This will permanently delete this property and all associated data (systems, tasks, inspections, upgrades). This action cannot be undone."
            confirmText="Delete Property"
            confirmVariant="destructive"
          />
        )}

        {/* Method Info Modal */}
        {showMethodInfo && (
          <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center p-4" onClick={() => setShowMethodInfo(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                    The 360° Method
                  </h2>
                  <p className="text-sm text-gray-600">A 3×3 system for property management</p>
                </div>
                <button
                  onClick={() => setShowMethodInfo(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                  style={{ minHeight: '40px', minWidth: '40px' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                      <span className="text-white text-lg">🏗️</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Foundation: Properties</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    Your properties are the foundation. Each property flows through the 3×3 method below.
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowDown className="w-8 h-8 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <h3 className="font-bold text-blue-900 text-lg">AWARE</h3>
                    </div>
                    <div className="space-y-2 ml-10">
                      <p className="text-sm text-blue-800">
                        <strong>1. Baseline:</strong> Document all major systems
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>2. Inspect:</strong> Regular condition check-ins
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>3. Track:</strong> Monitor health over time
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <h3 className="font-bold text-orange-900 text-lg">ACT</h3>
                    </div>
                    <div className="space-y-2 ml-10">
                      <p className="text-sm text-orange-800">
                        <strong>1. Prioritize:</strong> Rank tasks by urgency
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>2. Schedule:</strong> Plan maintenance timeline
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>3. Execute:</strong> Complete and verify work
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                        3
                      </div>
                      <h3 className="font-bold text-green-900 text-lg">ADVANCE</h3>
                    </div>
                    <div className="space-y-2 ml-10">
                      <p className="text-sm text-green-800">
                        <strong>1. Preserve:</strong> Extend system lifespan
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>2. Upgrade:</strong> Strategic improvements
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>3. SCALE:</strong> Portfolio CFO intelligence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 text-center">
                  <p className="font-bold text-purple-900 mb-1">
                    3 Phases × 3 Steps = 9 Total Steps
                  </p>
                  <p className="text-sm text-purple-800">
                    Each property in your portfolio progresses through this systematic approach
                  </p>
                </div>

                <button
                  onClick={() => setShowMethodInfo(false)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  style={{ minHeight: '48px' }}
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
