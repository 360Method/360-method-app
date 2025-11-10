import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import SystemCard from "../components/baseline/SystemCard";
import SystemFormDialog from "../components/baseline/SystemFormDialog";

const SYSTEM_TYPES = ["HVAC", "Plumbing", "Electrical", "Roof", "Foundation", "Gutters", "Exterior", "Windows/Doors", "Appliances", "Landscaping"];

export default function Baseline() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingSystem, setEditingSystem] = React.useState(null);

  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: systems = [], isLoading } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  // Set default property if not set
  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Calculate completion percentage
  const completionPercentage = Math.round((systems.length / SYSTEM_TYPES.length) * 100);

  // Update property baseline_completion when systems change
  React.useEffect(() => {
    if (selectedProperty && properties.length > 0) {
      const property = properties.find(p => p.id === selectedProperty);
      if (property && property.baseline_completion !== completionPercentage) {
        base44.entities.Property.update(selectedProperty, {
          baseline_completion: completionPercentage
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        });
      }
    }
  }, [completionPercentage, selectedProperty, properties]);

  const handleEditSystem = (system) => {
    setEditingSystem(system);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSystem(null);
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AWARE → Baseline</h1>
            <p className="text-gray-600 mt-1">Document your home systems to understand what you have</p>
          </div>
          {selectedProperty && (
            <Button 
              className="gap-2" 
              style={{ backgroundColor: 'var(--primary)' }}
              onClick={() => setShowDialog(true)}
            >
              <Plus className="w-4 h-4" />
              Add System
            </Button>
          )}
        </div>

        {/* Property Selector */}
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
                </div>
                {currentProperty && (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Completion</p>
                      <p className="text-2xl font-bold text-gray-900">{completionPercentage}%</p>
                    </div>
                    <div className="w-24 h-24">
                      <svg className="transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={completionPercentage >= 80 ? "#28A745" : "#1B365D"}
                          strokeWidth="10"
                          strokeDasharray={`${completionPercentage * 2.827} 283`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Alert */}
        {selectedProperty && completionPercentage >= 80 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900">Baseline Complete!</h3>
                <p className="text-green-700 text-sm">
                  You've documented {completionPercentage}% of your home systems. You can now move to the ACT phase!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Systems Grid */}
        {selectedProperty ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SYSTEM_TYPES.map((systemType) => {
                const existingSystem = systems.find(s => s.system_type === systemType);
                return (
                  <SystemCard
                    key={systemType}
                    systemType={systemType}
                    system={existingSystem}
                    onEdit={handleEditSystem}
                    onAdd={() => {
                      setEditingSystem({ system_type: systemType, property_id: selectedProperty });
                      setShowDialog(true);
                    }}
                  />
                );
              })}
            </div>

            <SystemFormDialog
              open={showDialog}
              onClose={handleCloseDialog}
              propertyId={selectedProperty}
              editingSystem={editingSystem}
            />
          </>
        ) : (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Property Selected</h3>
              <p className="text-gray-600">Please add a property first to start documenting your baseline</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}