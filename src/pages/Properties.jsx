
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  MoreVertical,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Building2,
  Shield,
  TrendingUp,
  Target,
  Clock, // Added icon
  Play // Added icon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PropertyWizard from "../components/properties/PropertyWizard";
import PropertyEditDialog from "../components/properties/PropertyEditDialog";
import UpgradePrompt from "../components/upgrade/UpgradePrompt";
import ConfirmDialog from "../components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Properties() {
  const [showWizard, setShowWizard] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState(null);
  const [deletingProperty, setDeletingProperty] = React.useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);
  const [whyExpanded, setWhyExpanded] = React.useState(false);
  const [resumingDraft, setResumingDraft] = React.useState(null); // New state for resuming drafts
  const queryClient = useQueryClient();

  // Fetch completed properties (not drafts)
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft); // Filter out drafts
    },
  });

  // Fetch draft properties
  const { data: draftProperties = [] } = useQuery({
    queryKey: ['draft-properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-updated_date');
      return allProps.filter(p => p.is_draft === true); // Filter for drafts
    },
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const propertyLimit = user?.property_limit || 1;
  const canAddProperty = properties.length < propertyLimit;

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId) => base44.entities.Property.delete(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['draft-properties'] }); // Invalidate draft properties as well
      setDeletingProperty(null);
    },
  });

  const handleWizardComplete = () => {
    setShowWizard(false);
    setResumingDraft(null); // Reset resumingDraft on wizard completion
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
  };

  const handleDelete = (property) => {
    setDeletingProperty(property);
  };

  const confirmDelete = async () => {
    if (deletingProperty) {
      await deletePropertyMutation.mutateAsync(deletingProperty.id);
    }
  };

  const handleAddProperty = () => {
    if (!canAddProperty) {
      setShowUpgradePrompt(true);
    } else {
      setShowWizard(true);
      setResumingDraft(null); // Ensure no draft is being resumed when adding new
    }
  };

  // New function to resume a draft
  const handleResumeDraft = (draft) => {
    setResumingDraft(draft);
    setShowWizard(true);
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-white p-4">
        <PropertyWizard
          onComplete={handleWizardComplete}
          onCancel={() => {
            setShowWizard(false);
            setResumingDraft(null); // Reset resumingDraft on wizard cancel
          }}
          existingDraft={resumingDraft} // Pass existing draft to wizard
        />
      </div>
    );
  }

  const getDeleteMessage = () => {
    if (!deletingProperty) return '';
    
    return `Are you sure you want to delete ${deletingProperty.address || deletingProperty.street_address || 'this property'}?

⚠️ This will permanently delete:
• All property information
• All system baselines
• All inspection records
• All maintenance tasks
• All service requests

This action cannot be undone.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            My Properties
          </h1>
          <p className="text-gray-600 text-lg">
            Your property portfolio command center
          </p>
        </div>

        {/* Why This Step Matters - Educational Card */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Why Property Management Matters</h3>
                <p className="text-sm text-blue-800">
                  Properties are the foundation of the 360° Method. Each property you add becomes a complete lifecycle management system - from documentation to preservation to scaling.
                </p>
              </div>
              {whyExpanded ? (
                <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
            </button>
          </CardHeader>
          {whyExpanded && (
            <CardContent className="pt-0">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">🎯 What Happens When You Add a Property:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li><strong>Baseline Documentation:</strong> Create a complete inventory of every system</li>
                    <li><strong>Seasonal Inspections:</strong> Catch issues before they become disasters</li>
                    <li><strong>Maintenance Tracking:</strong> Log every repair, track spending, calculate ROI</li>
                    <li><strong>Lifecycle Forecasting:</strong> Know when systems will need replacement 2-5 years ahead</li>
                    <li><strong>Value Tracking:</strong> Document improvements that increase property value</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">💡 Single Property vs. Portfolio:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Single Property Owners:</strong> Focus on maximizing home value, reducing operating costs, and building a complete maintenance history for eventual sale.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">
                    <strong>Portfolio Owners:</strong> Track aggregate metrics across properties, identify patterns, optimize operator relationships, and scale maintenance operations efficiently.
                  </p>
                </div>
                <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-600">
                  <p className="text-xs text-blue-900">
                    <strong>Best Practice:</strong> Start with your primary residence or highest-value property first. Complete its baseline (Step 1) before adding additional properties.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Draft Properties Section */}
        {draftProperties.length > 0 && (
          <Card className="mb-6 border-2 border-orange-300 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl" style={{ color: '#1B365D' }}>
                <Clock className="w-6 h-6 text-orange-600" />
                Unfinished Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                You have {draftProperties.length} incomplete {draftProperties.length === 1 ? 'property' : 'properties'}. 
                These won't affect your dashboard or analytics until completed.
              </p>
              <div className="space-y-3">
                {draftProperties.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-orange-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {draft.formatted_address || draft.street_address || 'Unnamed Property'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Last updated: {new Date(draft.updated_date).toLocaleDateString()}
                        {draft.draft_step !== undefined && draft.draft_step >= 0 && (
                          <> • Step {draft.draft_step + 1} of 5</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResumeDraft(draft)}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem 
                            onClick={() => handleDelete(draft)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Draft
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Prompt */}
        {showUpgradePrompt && (
          <div className="mb-6">
            <UpgradePrompt
              context="property_limit"
              onDismiss={() => setShowUpgradePrompt(false)}
            />
          </div>
        )}

        {/* Enhanced Add Property Widget */}
        <Card className="mb-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #28A745 0%, #20C997 100%)' }}>
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
                  🏠 Add New Property
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {properties.length === 0 
                    ? "Start your property protection journey by adding your first property. Our guided wizard will walk you through address verification, property details, and system documentation setup."
                    : "Expand your portfolio by adding another property. Track multiple properties from a single dashboard and unlock portfolio-level insights."
                  }
                </p>

                {/* Value Props */}
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-green-600" />
                      <p className="font-semibold text-sm text-gray-900">Protect Your Asset</p>
                    </div>
                    <p className="text-xs text-gray-600">Prevent $25K-50K+ in disasters through proactive maintenance</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold text-sm text-gray-900">Increase Value</p>
                    </div>
                    <p className="text-xs text-gray-600">Documentation adds $8K-15K to resale value</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-purple-600" />
                      <p className="font-semibold text-sm text-gray-900">Plan Ahead</p>
                    </div>
                    <p className="text-xs text-gray-600">Budget 2-5 years ahead with lifecycle forecasting</p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={handleAddProperty}
                    className="flex-1 font-bold text-lg"
                    style={{ backgroundColor: '#28A745', minHeight: '56px' }}
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    {properties.length === 0 ? 'Add Your First Property' : 'Add Another Property'}
                  </Button>
                  {properties.length === 0 && (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      style={{ minHeight: '56px' }}
                    >
                      <Link to={createPageUrl("Resources")}>
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Learn How It Works
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Property Limit Info */}
                <div className="mt-4 flex items-center justify-between p-3 bg-white/60 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      <strong>{properties.length}</strong> of <strong>{propertyLimit}</strong> properties used
                    </span>
                  </div>
                  {!canAddProperty && (
                    <Badge className="bg-orange-600 text-white">
                      Limit Reached
                    </Badge>
                  )}
                  {canAddProperty && propertyLimit > 1 && (
                    <Badge className="bg-green-600 text-white">
                      {propertyLimit - properties.length} slots available
                    </Badge>
                  )}
                </div>

                {!canAddProperty && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-900 mb-1">
                          Property Limit Reached
                        </p>
                        <p className="text-xs text-orange-800 mb-2">
                          You've reached your plan's property limit. Upgrade to manage more properties and unlock portfolio-level analytics.
                        </p>
                        <Button
                          asChild
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Link to={createPageUrl("Pricing")}>
                            View Upgrade Options
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {properties.length === 0 && draftProperties.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-12 text-center">
              <Home className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Your Portfolio Awaits</h3>
              <p className="text-gray-600 mb-2 max-w-md mx-auto">
                Add your first property to unlock the full power of the 360° Method
              </p>
              <p className="text-sm text-gray-500 mb-6">
                ⏱️ Setup takes 5-10 minutes • 🔒 Your data is private and secure
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const setupProgress = property.baseline_completion || 0;
              const isSetupComplete = setupProgress >= 66;
              const needsAttention = setupProgress < 66;

              return (
                <Card
                  key={property.id}
                  className={`border-2 hover:shadow-xl transition-shadow ${
                    needsAttention ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 bg-white'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                              {property.address}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {property.property_type || "Property"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {property.door_count || 1} door{property.door_count > 1 ? 's' : ''}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {property.climate_zone || "Climate"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            style={{ minHeight: '44px', minWidth: '44px' }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => handleEdit(property)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(property)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Setup Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">360° Method Progress:</span>
                        <span className="text-sm font-bold" style={{ color: needsAttention ? '#FF6B35' : '#28A745' }}>
                          {setupProgress}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${setupProgress}%`,
                            backgroundColor: needsAttention ? '#FF6B35' : '#28A745'
                          }}
                        />
                      </div>
                      {needsAttention && (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-orange-100 rounded border border-orange-300">
                          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-orange-900">
                              Complete Baseline to Unlock Full Features
                            </p>
                            <p className="text-xs text-orange-700">
                              Document your systems to access inspections, prioritization, and preservation forecasting
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">Health Score</p>
                        <p className="text-xl font-bold" style={{ color: '#1B365D' }}>
                          {isSetupComplete ? `${property.health_score || 0}/100` : '--'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">Year Built</p>
                        <p className="text-xl font-bold" style={{ color: '#1B365D' }}>
                          {property.year_built || '--'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">Square Footage</p>
                        <p className="text-xl font-bold" style={{ color: '#1B365D' }}>
                          {property.square_footage ? `${property.square_footage.toLocaleString()}` : '--'}
                        </p>
                        <p className="text-xs text-gray-500">sq ft</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">Maintenance</p>
                        <p className="text-xl font-bold text-green-700">
                          ${(property.total_maintenance_spent || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-3">
                      {needsAttention ? (
                        <Button
                          asChild
                          className="flex-1 font-semibold"
                          style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                        >
                          <Link to={createPageUrl("Baseline") + `?property=${property.id}`}>
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Complete Baseline Setup
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            asChild
                            className="flex-1"
                            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                          >
                            <Link to={createPageUrl("Inspect") + `?property=${property.id}`}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Start Inspection
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                            style={{ minHeight: '48px' }}
                          >
                            <Link to={createPageUrl("Dashboard")}>
                              View Dashboard
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Portfolio Summary (for multi-property users) */}
        {properties.length > 1 && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 mt-6 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-2xl" style={{ color: '#1B365D' }}>
                <Building2 className="w-7 h-7 text-purple-600" />
                📊 Portfolio Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>
                    {properties.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Doors</p>
                  <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>
                    {properties.reduce((sum, p) => sum + (p.door_count || 1), 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                  <p className="text-3xl font-bold text-green-700">
                    ${properties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Avg Health</p>
                  <p className="text-3xl font-bold text-orange-700">
                    {Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)}/100
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/60 rounded border">
                <p className="text-xs text-gray-700">
                  💡 <strong>Portfolio Tip:</strong> Properties with health scores below 70 need attention. Focus on completing baselines and inspections for maximum protection.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Property Dialog */}
      {editingProperty && (
        <PropertyEditDialog
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProperty && (
        <ConfirmDialog
          open={!!deletingProperty}
          onClose={() => setDeletingProperty(null)}
          onConfirm={confirmDelete}
          title="Delete Property?"
          message={getDeleteMessage()}
          confirmText="Yes, Delete Property"
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </div>
  );
}
