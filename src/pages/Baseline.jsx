import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, CheckCircle2, AlertCircle, Shield, Award, Trophy, Edit, Trash2 } from "lucide-react";
import SystemFormDialog from "../components/baseline/SystemFormDialog";

const REQUIRED_SYSTEMS = [
  "HVAC System",
  "Plumbing System",
  "Electrical System",
  "Roof System",
  "Foundation & Structure",
  "Water & Sewer/Septic"
];

const RECOMMENDED_SYSTEMS = [
  "Exterior Siding & Envelope",
  "Windows & Doors",
  "Gutters & Downspouts",
  "Landscaping & Grading",
  "Attic & Insulation",
  "Basement/Crawlspace",
  "Garage & Overhead Door"
];

const APPLIANCE_TYPES = [
  "Refrigerator",
  "Range/Oven",
  "Dishwasher",
  "Washing Machine",
  "Dryer",
  "Microwave",
  "Garbage Disposal"
];

const SAFETY_TYPES = [
  "Smoke Detector",
  "CO Detector",
  "Fire Extinguisher",
  "Radon Test",
  "Security System"
];

const MULTI_INSTANCE_SYSTEMS = [
  "HVAC System",
  "Garage & Overhead Door",
  "Basement/Crawlspace",
  ...APPLIANCE_TYPES,
  ...SAFETY_TYPES
];

const SYSTEM_DESCRIPTIONS = {
  "HVAC System": {
    what: "Your home's climate control system - furnace, AC, ducts, and thermostat",
    why: "Failed HVAC in extreme weather = emergency replacement at 3X cost. Inefficiency wastes $500-2,000/year.",
    lifespan: "10-20 years"
  },
  "Plumbing System": {
    what: "All pipes, fixtures, drains, and water heater that manage water in/out",
    why: "Small leak = major water damage + mold = $15K+ remediation. Water heater failure floods home.",
    lifespan: "8-50+ years"
  },
  "Electrical System": {
    what: "Main panel, breakers, wiring, outlets - delivers power throughout home",
    why: "Faulty wiring = house fire = total loss. Leading cause of home fires.",
    lifespan: "25-100 years"
  },
  "Roof System": {
    what: "Shingles/covering, underlayment, flashing - primary protection from weather",
    why: "Small leak = rotted decking = interior damage + mold + structural issues = $30K+ disaster.",
    lifespan: "15-100 years"
  },
  "Foundation & Structure": {
    what: "Concrete foundation, support beams, framing - the base your home sits on",
    why: "Foundation crack = water + instability = $20K-100K+ repair. Makes home unsellable.",
    lifespan: "80-100+ years"
  },
  "Water & Sewer/Septic": {
    what: "Water service line and waste removal - sewer line or septic system",
    why: "Sewer failure = backup into home = health hazard + $15K-30K replacement.",
    lifespan: "40-100 years"
  },
  "Exterior Siding & Envelope": {
    what: "Siding, paint, trim, caulking - your home's weather-resistant outer shell",
    why: "Failed seal = water in walls = rot + mold + structural failure = $25K+ repair.",
    lifespan: "10-100 years"
  },
  "Windows & Doors": {
    what: "All exterior windows and doors - provide light, access, security",
    why: "Failed seal = water intrusion + rot. Energy loss up to 30% of heating/cooling costs.",
    lifespan: "15-50 years"
  },
  "Gutters & Downspouts": {
    what: "System that collects/directs rainwater away from home",
    why: "Clogged gutters = foundation damage + basement flooding + siding rot = $10K-30K+ damage.",
    lifespan: "10-100 years"
  },
  "Landscaping & Grading": {
    what: "Ground slope, drainage, trees, vegetation around home",
    why: "Poor grading = water toward foundation = flooding + cracks + structural damage = $15K-50K+.",
    lifespan: "Ongoing"
  },
  "Attic & Insulation": {
    what: "Space between ceiling and roof with insulation and ventilation",
    why: "Poor ventilation = moisture + mold + rotted roof deck = premature roof failure = $20K+.",
    lifespan: "20-50 years"
  },
  "Basement/Crawlspace": {
    what: "Lowest level - foundation monitoring and moisture control zone",
    why: "Water intrusion = mold + structural damage + ruined belongings = $15K-40K repair.",
    lifespan: "80-100+ years"
  },
  "Garage & Overhead Door": {
    what: "Garage structure, overhead door system, and opener",
    why: "Broken spring = door falls = crushed vehicle/injury + emergency repair at 3X cost.",
    lifespan: "10-30 years"
  }
};

export default function Baseline() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingSystem, setEditingSystem] = React.useState(null);
  const [showCelebration, setShowCelebration] = React.useState(false);

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

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SystemBaseline.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
    },
  });

  const handleDeleteSystem = (system) => {
    const instanceCount = systems.filter(s => s.system_type === system.system_type).length;
    const isRequired = REQUIRED_SYSTEMS.includes(system.system_type);
    
    let message = `Are you sure you want to delete '${system.nickname || system.system_type}'? This cannot be undone.`;
    
    if (isRequired && instanceCount === 1) {
      message += "\n\n⚠️ This is a required system. Deleting it will affect your baseline completion.";
    }
    
    if (confirm(message)) {
      deleteMutation.mutate(system.id);
    }
  };

  // Group systems by type
  const systemsByType = systems.reduce((acc, system) => {
    if (!acc[system.system_type]) {
      acc[system.system_type] = [];
    }
    acc[system.system_type].push(system);
    return acc;
  }, {});

  // Calculate completion metrics
  const requiredSystemTypes = REQUIRED_SYSTEMS.filter(type => systemsByType[type]?.length > 0);
  const requiredComplete = requiredSystemTypes.length;
  
  const recommendedSystemTypes = RECOMMENDED_SYSTEMS.filter(type => systemsByType[type]?.length > 0);
  const recommendedComplete = recommendedSystemTypes.length;
  
  const applianceTypes = APPLIANCE_TYPES.filter(type => systemsByType[type]?.length > 0);
  const appliancesComplete = applianceTypes.length;
  
  const safetyTypes = SAFETY_TYPES.filter(type => systemsByType[type]?.length > 0);
  const safetyComplete = safetyTypes.length;
  
  const totalSystemTypes = requiredComplete + recommendedComplete + (appliancesComplete > 0 ? 1 : 0) + (safetyComplete > 0 ? 1 : 0);
  
  const requiredPercent = Math.round((requiredComplete / REQUIRED_SYSTEMS.length) * 100);
  const recommendedPercent = Math.round((recommendedComplete / RECOMMENDED_SYSTEMS.length) * 100);
  const overallPercent = Math.round((totalSystemTypes / 15) * 100);
  
  const actPhaseUnlocked = requiredComplete >= 4;
  const allRequiredComplete = requiredComplete === 6;
  const baselineBoss = totalSystemTypes >= 13;

  // Update property baseline_completion
  React.useEffect(() => {
    if (selectedProperty && properties.length > 0) {
      const property = properties.find(p => p.id === selectedProperty);
      if (property && property.baseline_completion !== overallPercent) {
        base44.entities.Property.update(selectedProperty, {
          baseline_completion: overallPercent
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        });
      }
    }
  }, [overallPercent, selectedProperty, properties]);

  const handleEditSystem = (system) => {
    setEditingSystem(system);
    setShowDialog(true);
  };

  const handleAddSystem = (systemType) => {
    setEditingSystem({ 
      system_type: systemType, 
      property_id: selectedProperty,
      is_required: REQUIRED_SYSTEMS.includes(systemType)
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSystem(null);
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);

  // Dynamic messaging
  let statusMessage = "";
  let statusColor = "text-blue-600";
  let statusIcon = Shield;

  if (baselineBoss) {
    statusMessage = "🏆 BASELINE BOSS! You have comprehensive documentation. This is elite-level homeownership.";
    statusColor = "text-purple-600";
    statusIcon = Trophy;
  } else if (allRequiredComplete) {
    statusMessage = "All essential systems documented! Want complete peace of mind? Add appliances and safety systems.";
    statusColor = "text-green-600";
    statusIcon = Award;
  } else if (actPhaseUnlocked) {
    statusMessage = "🎉 ACT Phase Unlocked! You can now prioritize and schedule maintenance. Consider completing your full baseline for maximum protection.";
    statusColor = "text-green-600";
    statusIcon = CheckCircle2;
  } else {
    statusMessage = `Complete ${4 - requiredComplete} more essential system type${4 - requiredComplete > 1 ? 's' : ''} to unlock ACT phase`;
    statusColor = "text-orange-600";
    statusIcon = AlertCircle;
  }

  const StatusIcon = statusIcon;

  const renderSystemGroup = (systemType, instances, isRequired) => {
    const allowsMultiple = MULTI_INSTANCE_SYSTEMS.includes(systemType);
    const description = SYSTEM_DESCRIPTIONS[systemType];
    
    if (instances.length === 0) {
      // No instances - show add button
      return (
        <Card
          key={systemType}
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => handleAddSystem(systemType)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {systemType}
                {isRequired && <span className="text-red-600 text-xs">*REQUIRED</span>}
              </h3>
              {isRequired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-600 mb-2">{description.what}</p>
            )}
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Document {systemType}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Has instances - show list
    return (
      <Card key={systemType} className={`border-2 shadow-lg ${isRequired ? 'border-red-200' : 'border-blue-200'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-base">{systemType} ({instances.length})</span>
              {isRequired && (
                <Badge className="bg-green-600 text-white text-xs">COMPLETE</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {instances.map((instance, idx) => (
            <div key={instance.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {instance.nickname || `${systemType} ${instances.length > 1 ? `#${idx + 1}` : ''}`}
                </h4>
                <p className="text-sm text-gray-600">
                  {instance.brand_model && `${instance.brand_model} • `}
                  {instance.installation_year && `Installed ${instance.installation_year}`}
                </p>
                {instance.last_service_date && (
                  <p className="text-xs text-gray-500">
                    Last service: {new Date(instance.last_service_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditSystem(instance)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSystem(instance)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {allowsMultiple && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-2"
              onClick={() => handleAddSystem(systemType)}
            >
              <Plus className="w-4 h-4" />
              Add Another {systemType}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AWARE → Baseline</h1>
            <p className="text-gray-600 mt-1">Document your home systems to understand what you have</p>
          </div>
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
                      <p className="text-sm text-gray-600">System Types</p>
                      <p className="text-2xl font-bold text-gray-900">{totalSystemTypes}/15</p>
                      <p className="text-xs text-gray-500">{overallPercent}% complete</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Message */}
        {selectedProperty && (
          <Card className={`border-2 ${actPhaseUnlocked ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="p-6 flex items-center gap-4">
              <StatusIcon className={`w-8 h-8 ${statusColor} flex-shrink-0`} />
              <div>
                <p className={`font-semibold ${statusColor}`}>{statusMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProperty ? (
          <>
            {/* Essential Systems */}
            <Card className="border-2 border-red-200 shadow-lg">
              <CardHeader className="bg-red-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Essential Systems (Start Here)
                  </CardTitle>
                  <Badge className="bg-red-600 text-white">
                    {requiredComplete}/6 complete
                  </Badge>
                </div>
                <Progress value={requiredPercent} className="mt-2 h-2" />
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-700 mb-6">
                  Complete <span className="font-bold">4 of these 6 essential systems</span> to unlock the ACT phase.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {REQUIRED_SYSTEMS.map((systemType) => 
                    renderSystemGroup(systemType, systemsByType[systemType] || [], true)
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Systems */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Complete Protection (Recommended)
                  </CardTitle>
                  <Badge className="bg-blue-600 text-white">
                    {recommendedComplete}/7 complete
                  </Badge>
                </div>
                <Progress value={recommendedPercent} className="mt-2 h-2" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {RECOMMENDED_SYSTEMS.map((systemType) => 
                    renderSystemGroup(systemType, systemsByType[systemType] || [], false)
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Major Appliances */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    🔌 Major Appliances
                  </CardTitle>
                  <Badge className="bg-purple-600 text-white">
                    {appliancesComplete}/7 types
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-700 mb-6">
                  Document each appliance type. You can add multiple of each (especially useful for multi-unit properties).
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {APPLIANCE_TYPES.map((applianceType) => 
                    renderSystemGroup(applianceType, systemsByType[applianceType] || [], false)
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Safety Systems */}
            <Card className="border-2 border-orange-200 shadow-lg">
              <CardHeader className="bg-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    🚨 Safety Systems
                  </CardTitle>
                  <Badge className="bg-orange-600 text-white">
                    {safetyComplete}/5 types
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-700 mb-6">
                  Add detectors and extinguishers for each location. Track batteries and test dates.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SAFETY_TYPES.map((safetyType) => 
                    renderSystemGroup(safetyType, systemsByType[safetyType] || [], false)
                  )}
                </div>
              </CardContent>
            </Card>

            <SystemFormDialog
              open={showDialog}
              onClose={handleCloseDialog}
              propertyId={selectedProperty}
              editingSystem={editingSystem}
              systemDescription={editingSystem ? SYSTEM_DESCRIPTIONS[editingSystem.system_type] : null}
              allowsMultiple={editingSystem ? MULTI_INSTANCE_SYSTEMS.includes(editingSystem.system_type) : false}
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