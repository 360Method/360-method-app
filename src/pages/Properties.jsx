import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Home, 
  Edit, 
  Trash2, 
  TrendingUp, 
  MapPin,
  Calendar,
  DollarSign,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { createPageUrl } from "@/utils";
import PropertyWizard from "../components/properties/PropertyWizard";
import PropertyEditDialog from "../components/properties/PropertyEditDialog";
import ConfirmDialog from "../components/ui/confirm-dialog";
import UpgradePrompt from "../components/upgrade/UpgradePrompt";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function PropertiesPage() {
  const [showWizard, setShowWizard] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState(null);
  const [deletingProperty, setDeletingProperty] = React.useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deletionCounts, setDeletionCounts] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editingDraft, setEditingDraft] = React.useState(null);

  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    }
  });

  const { data: draftProperties = [] } = useQuery({
    queryKey: ['draft-properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => p.is_draft);
    }
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Determine property limit based on tier
  const userTier = user?.tier || 'free';
  const propertyLimit = userTier === 'free' ? 1 : userTier === 'pro' ? 25 : Infinity;
  const canAddProperty = properties.length < propertyLimit;

  // CASCADE DELETE: Delete property and ALL related data
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId) => {
      setIsDeleting(true);
      
      // Step 1: Delete all related data in parallel
      const [tasks, inspections, baselines] = await Promise.all([
        base44.entities.MaintenanceTask.filter({ property_id: propertyId }),
        base44.entities.Inspection.filter({ property_id: propertyId }),
        base44.entities.SystemBaseline.filter({ property_id: propertyId })
      ]);

      // Delete all related records in parallel
      await Promise.all([
        ...tasks.map(t => base44.entities.MaintenanceTask.delete(t.id)),
        ...inspections.map(i => base44.entities.Inspection.delete(i.id)),
        ...baselines.map(b => base44.entities.SystemBaseline.delete(b.id))
      ]);

      // Step 2: Delete the property itself
      await base44.entities.Property.delete(propertyId);

      return {
        tasksDeleted: tasks.length,
        inspectionsDeleted: inspections.length,
        baselinesDeleted: baselines.length
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['allSystemBaselines'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allInspections'] });
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setDeletingProperty(null);
      setDeletionCounts(null);
    },
    onError: () => {
      setIsDeleting(false);
    }
  });

  const handleWizardComplete = () => {
    setShowWizard(false);
    setEditingDraft(null);
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    queryClient.invalidateQueries({ queryKey: ['draft-properties'] });
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
  };

  const handleDeleteProperty = async (property) => {
    // Count related data before showing confirmation
    const [tasks, inspections, baselines] = await Promise.all([
      base44.entities.MaintenanceTask.filter({ property_id: property.id }),
      base44.entities.Inspection.filter({ property_id: property.id }),
      base44.entities.SystemBaseline.filter({ property_id: property.id })
    ]);

    setDeletionCounts({
      tasks: tasks.length,
      inspections: inspections.length,
      baselines: baselines.length
    });
    setDeletingProperty(property);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProperty) {
      deletePropertyMutation.mutate(deletingProperty.id);
    }
  };

  const handleAddProperty = () => {
    if (!canAddProperty) {
      setShowUpgradePrompt(true);
    } else {
      setShowWizard(true);
    }
  };

  const handleContinueDraft = (draft) => {
    setEditingDraft(draft);
    setShowWizard(true);
  };

  const handleDeleteDraft = async (draft) => {
    if (confirm('Delete this incomplete property?')) {
      await base44.entities.Property.delete(draft.id);
      queryClient.invalidateQueries({ queryKey: ['draft-properties'] });
    }
  };

  const getDeleteMessage = () => {
    if (!deletingProperty || !deletionCounts) return '';
    
    const { tasks, inspections, baselines } = deletionCounts;
    const hasData = tasks > 0 || inspections > 0 || baselines > 0;
    
    let message = `⚠️ CASCADE DELETION WARNING\n\n`;
    message += `You are about to permanently delete:\n\n`;
    message += `📍 Property: ${deletingProperty.address}\n\n`;
    
    if (hasData) {
      message += `This will also delete ALL related data:\n`;
      if (baselines > 0) message += `• ${baselines} System Baseline${baselines > 1 ? 's' : ''}\n`;
      if (tasks > 0) message += `• ${tasks} Maintenance Task${tasks > 1 ? 's' : ''}\n`;
      if (inspections > 0) message += `• ${inspections} Inspection${inspections > 1 ? 's' : ''}\n`;
      message += `\n`;
    }
    
    message += `🚨 THIS ACTION CANNOT BE UNDONE\n\n`;
    message += `All history, reports, and documentation for this property will be permanently erased from the system.`;
    
    return message;
  };

  // Portfolio analytics
  const totalValue = properties.reduce((sum, p) => sum + (p.current_value || 0), 0);
  const avgHealthScore = properties.length > 0 
    ? properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length 
    : 0;
  const totalDoors = properties.reduce((sum, p) => sum + (p.door_count || 1), 0);

  if (showWizard) {
    return (
      <PropertyWizard 
        onComplete={handleWizardComplete}
        onCancel={() => {
          setShowWizard(false);
          setEditingDraft(null);
        }}
        existingDraft={editingDraft}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              My Properties
            </h1>
            <p className="text-gray-600">
              {properties.length === 0 
                ? "Add your first property to get started"
                : `Managing ${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}`
              }
            </p>
          </div>
          <Button
            onClick={handleAddProperty}
            className="gap-2"
            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
          >
            <Plus className="w-5 h-5" />
            Add Property
          </Button>
        </div>

        {/* Educational: Why Properties Matter */}
        {properties.length === 0 && (
          <Card className="border-2 border-blue-200 bg-blue-50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                <Lightbulb className="w-6 h-6 text-blue-600" />
                Why Add Your Properties?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                The 360° Method organizes everything by property. Each property gets its own:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-900">📋 System Baseline</h3>
                  <p className="text-sm text-gray-700">Document all major systems, appliances, and their condition</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-900">🔍 Inspection History</h3>
                  <p className="text-sm text-gray-700">Track seasonal inspections and condition changes over time</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-900">📊 Maintenance Queue</h3>
                  <p className="text-sm text-gray-700">Prioritize tasks by cascade risk and cost impact</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-900">💰 Financial Tracking</h3>
                  <p className="text-sm text-gray-700">Monitor expenses, ROI, and property value over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Analytics */}
        {properties.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Home className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Total Properties</p>
                <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>{properties.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-green-700">
                  ${(totalValue / 1000000).toFixed(1)}M
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Avg Health Score</p>
                <p className="text-2xl font-bold text-purple-700">{avgHealthScore.toFixed(0)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Total Doors</p>
                <p className="text-2xl font-bold text-orange-700">{totalDoors}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Notice for Free Tier */}
        {userTier === 'free' && properties.length >= 1 && (
          <UpgradePrompt 
            context="property_limit"
            onDismiss={() => {}}
          />
        )}

        {/* Draft Properties */}
        {draftProperties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1B365D' }}>
              Incomplete Properties
            </h2>
            <div className="grid gap-4">
              {draftProperties.map((draft) => (
                <Card key={draft.id} className="border-2 border-yellow-300 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {draft.street_address || draft.address || 'Unnamed Property'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Started {new Date(draft.created_date).toLocaleDateString()}
                        </p>
                        <Badge className="mt-2 bg-yellow-600">Draft</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleContinueDraft(draft)}
                          size="sm"
                          style={{ backgroundColor: '#FF6B35', minHeight: '44px' }}
                        >
                          Continue Setup
                        </Button>
                        <Button
                          onClick={() => handleDeleteDraft(draft)}
                          variant="ghost"
                          size="sm"
                          style={{ minHeight: '44px' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2" style={{ color: '#1B365D' }}>
                      {property.address}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge style={{ backgroundColor: '#3B82F6' }}>
                        {property.property_type || 'Property'}
                      </Badge>
                      {property.door_count > 1 && (
                        <Badge variant="outline">
                          {property.door_count} doors
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" style={{ minHeight: '44px', minWidth: '44px' }}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleEditProperty(property)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProperty(property)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Property
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Health Score</p>
                    <p className="text-2xl font-bold" style={{ color: '#28A745' }}>
                      {property.health_score || 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Baseline</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {property.baseline_completion || 0}%
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => window.location.href = createPageUrl("Baseline") + `?property=${property.id}`}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ minHeight: '48px' }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Baseline
                  </Button>
                  <Button
                    onClick={() => window.location.href = createPageUrl("Prioritize") + `?property=${property.id}`}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ minHeight: '48px' }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Priority Queue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && draftProperties.length === 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                Add your first property to start using the 360° Method
              </p>
              <Button
                onClick={handleAddProperty}
                className="gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              >
                <Plus className="w-5 h-5" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Property Dialog */}
      {editingProperty && (
        <PropertyEditDialog
          property={editingProperty}
          open={!!editingProperty}
          onClose={() => setEditingProperty(null)}
        />
      )}

      {/* Delete Confirmation Dialog with CASCADE WARNING */}
      {deleteConfirmOpen && deletingProperty && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setDeletingProperty(null);
            setDeletionCounts(null);
          }}
          onConfirm={handleConfirmDelete}
          title="⚠️ Cascade Delete Property?"
          message={getDeleteMessage()}
          confirmText={isDeleting ? "Deleting..." : "Yes, Delete Everything"}
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </div>
  );
}