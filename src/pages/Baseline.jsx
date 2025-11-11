
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, CheckCircle2, AlertCircle, Shield, Award, Trophy, Edit, Trash2, BookOpen, Video, Calculator, ShoppingCart, DollarSign, TrendingUp, Lightbulb, Zap, Target, Sparkles, Lock, Unlock, MapPin, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SystemFormDialog from "../components/baseline/SystemFormDialog";
import AddToCartDialog from "../components/cart/AddToCartDialog";
import ConfirmDialog from "../components/ui/confirm-dialog";
import BaselineWizard from "../components/baseline/BaselineWizard";
import PhysicalWalkthroughWizard from "../components/baseline/PhysicalWalkthroughWizard";

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
  "Driveways & Hardscaping",
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
  "Driveways & Hardscaping",
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
  "Driveways & Hardscaping": {
    what: "Driveways, walkways, patios, retaining walls - all hard surfaces and structures",
    why: "Cracks expand = water infiltration = foundation damage + trip hazards + major replacement $10K-30K+.",
    lifespan: "15-30 years"
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

// Milestone definitions
const MILESTONES = [
  {
    id: 'first_system',
    threshold: 1,
    icon: '🎯',
    title: 'First Step Complete!',
    message: "You've documented your first system. This is how you take control.",
    badge: 'Getting Started'
  },
  {
    id: 'act_unlocked',
    threshold: 4,
    icon: '🔓',
    title: 'ACT Phase Unlocked!',
    message: 'You can now prioritize and schedule maintenance tasks.',
    badge: 'ACT Access',
    unlocks: ['Priority Queue', 'Task Scheduling', 'Cascade Prevention']
  },
  {
    id: 'essentials_complete',
    threshold: 6,
    icon: '🛡️',
    title: 'Essential Systems Complete!',
    message: 'All critical systems documented. Your foundation is solid.',
    badge: 'Foundation Secured'
  },
  {
    id: 'halfway',
    threshold: 8,
    icon: '⭐',
    title: 'Halfway There!',
    message: "You're building serious protection. Keep going!",
    badge: 'Momentum Builder'
  },
  {
    id: 'recommended_complete',
    threshold: 14, // 6 Required + 8 Recommended = 14
    icon: '🏆',
    title: 'Recommended Systems Complete!',
    message: 'You have comprehensive coverage. This is elite homeownership.',
    badge: 'Elite Protection'
  },
  {
    id: 'baseline_boss',
    threshold: 16, // 14 + 1 Appliance type + 1 Safety type = 16
    icon: '👑',
    title: 'BASELINE BOSS!',
    message: "Complete documentation. You're in the top 1% of homeowners.",
    badge: 'Baseline Boss',
    unlocks: ['Advanced Analytics', 'Predictive Maintenance', 'Maximum ROI']
  }
];

export default function Baseline() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [showDialog, setShowDialog] = React.useState(false);
  const [showCartDialog, setShowCartDialog] = React.useState(false);
  const [editingSystem, setEditingSystem] = React.useState(null);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [lastAddedSystemType, setLastAddedSystemType] = React.useState(null);
  const [deletingSystem, setDeletingSystem] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  // const [viewMode, setViewMode] = React.useState('cards'); // 'cards' or 'compact' - Not yet used in this implementation
  const [showWizard, setShowWizard] = React.useState(false);
  const [showPhysicalWalkthrough, setShowPhysicalWalkthrough] = React.useState(false);
  const [recentMilestone, setRecentMilestone] = React.useState(null);

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

  // Calculate completion metrics for milestone check
  const systemsByType = systems.reduce((acc, system) => {
    if (!acc[system.system_type]) {
      acc[system.system_type] = [];
    }
    acc[system.system_type].push(system);
    return acc;
  }, {});

  const requiredSystemTypes = REQUIRED_SYSTEMS.filter(type => systemsByType[type]?.length > 0);
  const requiredComplete = requiredSystemTypes.length;
  
  const recommendedSystemTypes = RECOMMENDED_SYSTEMS.filter(type => systemsByType[type]?.length > 0);
  const recommendedComplete = recommendedSystemTypes.length;
  
  const applianceTypes = APPLIANCE_TYPES.filter(type => systemsByType[type]?.length > 0);
  const appliancesComplete = applianceTypes.length;
  
  const safetyTypes = SAFETY_TYPES.filter(type => systemsByType[type]?.length > 0);
  const safetyComplete = safetyTypes.length;
  
  const totalSystemTypes = requiredComplete + recommendedComplete + (appliancesComplete > 0 ? 1 : 0) + (safetyComplete > 0 ? 1 : 0);
  
  // Check if user just hit a milestone
  React.useEffect(() => {
    const milestone = MILESTONES.find(m => m.threshold === totalSystemTypes);
    if (milestone && !recentMilestone) {
      setRecentMilestone(milestone);
      setTimeout(() => setRecentMilestone(null), 10000);
    }
  }, [totalSystemTypes, recentMilestone]);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SystemBaseline.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
    },
  });

  const handleDeleteSystem = (system) => {
    setDeletingSystem(system);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingSystem) {
      await deleteMutation.mutateAsync(deletingSystem.id);
      setDeletingSystem(null);
      setShowDeleteDialog(false);
    }
  };

  const getDeleteMessage = () => {
    if (!deletingSystem) return '';
    
    const instanceCount = systems.filter(s => s.system_type === deletingSystem.system_type).length;
    const isRequired = REQUIRED_SYSTEMS.includes(deletingSystem.system_type);
    const systemName = deletingSystem.nickname || deletingSystem.system_type;
    
    let message = `Are you sure you want to delete "${systemName}"? This action cannot be undone.`;
    
    if (isRequired && instanceCount === 1) {
      message += "\n\n⚠️ Warning: This is a required system. Deleting it will affect your baseline completion percentage and may lock the ACT phase features.";
    }
    
    return message;
  };

  // Calculate completion metrics
  // These are already calculated above for the milestone check, but we need them again for display
  // const requiredSystemTypes = REQUIRED_SYSTEMS.filter(type => systemsByType[type]?.length > 0); // Already defined
  // const requiredComplete = requiredSystemTypes.length; // Already defined
  
  // const recommendedSystemTypes = RECOMMENDED_SYSTEMS.filter(type => systemsByType[type]?.length > 0); // Already defined
  // const recommendedComplete = recommendedSystemTypes.length; // Already defined
  
  // const applianceTypes = APPLIANCE_TYPES.filter(type => systemsByType[type]?.length > 0); // Already defined
  // const appliancesComplete = applianceTypes.length; // Already defined
  
  // const safetyTypes = SAFETY_TYPES.filter(type => systemsByType[type]?.length > 0); // Already defined
  // const safetyComplete = safetyTypes.length; // Already defined
  
  // const totalSystemTypes = requiredComplete + recommendedComplete + (appliancesComplete > 0 ? 1 : 0) + (safetyComplete > 0 ? 1 : 0); // Already defined
  
  const essentialProgress = Math.round((requiredComplete / REQUIRED_SYSTEMS.length) * 100);
  const recommendedProgress = Math.round((recommendedComplete / RECOMMENDED_SYSTEMS.length) * 100);
  // Update overall progress calculation to reflect new total (6 Req + 8 Rec + 1 App + 1 Safe = 16)
  const overallProgress = Math.round((totalSystemTypes / 16) * 100);
  
  const actPhaseUnlocked = requiredComplete >= 4;
  const allRequiredComplete = requiredComplete === REQUIRED_SYSTEMS.length;
  // Update baselineBoss threshold (was 13 for 15 total, now 14 for 16 total)
  const baselineBoss = totalSystemTypes >= 14;

  // Get next milestone
  const nextMilestone = MILESTONES.find(m => m.threshold > totalSystemTypes);
  const systemsToNextMilestone = nextMilestone ? nextMilestone.threshold - totalSystemTypes : 0;

  // Dynamic messaging for status card
  let statusMessage = "";
  let statusSubtext = "";
  let statusBorderColor = "";
  let statusBgColor = "";
  let statusIconElement = null;
  let whyItMattersReminder = null;

  if (baselineBoss) {
    statusMessage = "🏆 BASELINE BOSS!";
    statusSubtext = "You have comprehensive documentation. This is elite-level homeownership.";
    statusBorderColor = "border-purple-300";
    statusBgColor = "bg-purple-50";
    statusIconElement = <Trophy className="w-8 h-8 text-purple-600" />;
    whyItMattersReminder = {
      icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
      text: "Your complete baseline = strategic control + maximum home value + peace of mind. You're prepared for anything.",
      color: "text-purple-800"
    };
  } else if (allRequiredComplete) {
    statusMessage = "All Essential Systems Documented!";
    statusSubtext = "You've secured the basics. Now, build complete peace of mind by adding appliances and safety systems.";
    statusBorderColor = "border-green-300";
    statusBgColor = "bg-green-50";
    statusIconElement = <Award className="w-8 h-8 text-green-600" />;
    whyItMattersReminder = {
      icon: <Shield className="w-4 h-4 text-green-600" />,
      text: "Complete baseline = Budget 2-3 years ahead + Avoid emergency costs + Increase home value $8K-15K at sale.",
      color: "text-green-800"
    };
  } else if (actPhaseUnlocked) {
    statusMessage = "🎉 ACT Phase Unlocked!";
    statusSubtext = "You can now prioritize and schedule maintenance. Consider completing your full baseline for maximum protection.";
    statusBorderColor = "border-green-300";
    statusBgColor = "bg-green-50";
    statusIconElement = <CheckCircle2 className="w-8 h-8 text-green-600" />;
    whyItMattersReminder = {
      icon: <DollarSign className="w-4 h-4 text-green-600" />,
      text: "Keep going! Full baseline = Prevent $25K-50K in disasters + Strategic planning + No surprises.",
      color: "text-green-800"
    };
  } else {
    const systemsNeeded = 4 - requiredComplete;
    statusMessage = `Complete ${systemsNeeded} more essential system type${systemsNeeded > 1 ? 's' : ''}`;
    statusSubtext = "Unlock the ACT phase to prioritize and schedule maintenance for your home.";
    statusBorderColor = "border-orange-300";
    statusBgColor = "bg-orange-50";
    statusIconElement = <AlertCircle className="w-8 h-8 text-orange-600" />;
    whyItMattersReminder = {
      icon: <Lightbulb className="w-4 h-4 text-orange-600" />,
      text: "Each system documented = More control over your home + Fewer surprises + Better budgeting. Keep going!",
      color: "text-orange-800"
    };
  }

  // Update property baseline_completion
  React.useEffect(() => {
    if (selectedProperty && properties.length > 0) {
      const property = properties.find(p => p.id === selectedProperty);
      if (property && property.baseline_completion !== overallProgress) {
        base44.entities.Property.update(selectedProperty, {
          baseline_completion: overallProgress
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        });
      }
    }
  }, [overallProgress, selectedProperty, properties, queryClient]);

  const handleEditSystem = (system) => {
    // Save scroll position before opening dialog
    setScrollPosition(window.scrollY);
    
    setEditingSystem({
      ...system,
      description: SYSTEM_DESCRIPTIONS[system.system_type],
      allowsMultiple: MULTI_INSTANCE_SYSTEMS.includes(system.system_type)
    });
    setShowDialog(true);
  };

  const handleAddSystem = (systemType) => {
    // Save scroll position and system type before opening dialog
    setScrollPosition(window.scrollY);
    setLastAddedSystemType(systemType);
    
    setEditingSystem({ 
      system_type: systemType, 
      property_id: selectedProperty,
      is_required: REQUIRED_SYSTEMS.includes(systemType),
      description: SYSTEM_DESCRIPTIONS[systemType],
      allowsMultiple: MULTI_INSTANCE_SYSTEMS.includes(systemType)
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSystem(null);
    
    // Restore scroll position after a short delay to allow DOM updates
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleRequestProService = () => {
    setShowCartDialog(true);
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);

  const renderSystemGroup = (systemType, instances, isRequired) => {
    const allowsMultiple = MULTI_INSTANCE_SYSTEMS.includes(systemType);
    
    if (instances.length === 0) {
      // No instances - show add button
      return (
        <Card
          key={systemType}
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group" // Added group class
          onClick={() => handleAddSystem(systemType)}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {systemType}
                {isRequired && <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">REQUIRED</Badge>}
              </h3>
              {isRequired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 group-hover:bg-gray-50"> {/* Added group-hover effect */}
              <Plus className="w-4 h-4" />
              Document {systemType}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Has instances - show list
    return (
      <Card key={systemType} className={`border-2 shadow-md hover:shadow-lg transition-shadow ${isRequired ? 'border-red-200' : 'border-blue-200'}`}> {/* Added shadow and hover effects */}
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
          {instances.map((instance, idx) => {
            const age = instance.installation_year ? new Date().getFullYear() - instance.installation_year : null;
            const isOld = age && instance.estimated_lifespan_years && age >= instance.estimated_lifespan_years * 0.8;
            
            return (
              <div key={instance.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {instance.nickname || `${systemType} ${instances.length > 1 ? `#${idx + 1}` : ''}`}
                    {isOld && ( // Conditional badge for aging systems
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                        Aging
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {instance.brand_model && `${instance.brand_model} • `}
                    {instance.installation_year && `Installed ${instance.installation_year} (${age}yr)`}
                  </p>
                  {instance.condition && instance.condition !== 'Good' && ( // Conditional badge for system condition
                    <Badge className={
                      instance.condition === 'Urgent' ? 'bg-red-600 text-white mt-1' :
                      instance.condition === 'Poor' ? 'bg-orange-600 text-white mt-1' :
                      'bg-yellow-600 text-white mt-1'
                    }>
                      {instance.condition}
                    </Badge>
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
            );
          })}
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

  // Conditional render for the Wizard
  if (showWizard && selectedProperty) {
    return (
      <BaselineWizard
        propertyId={selectedProperty}
        property={currentProperty}
        onComplete={() => {
          setShowWizard(false);
          queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
          // Optionally trigger a celebration if wizard completes a milestone
          const milestone = MILESTONES.find(m => m.threshold === totalSystemTypes);
          if (milestone) {
            setRecentMilestone(milestone);
            setTimeout(() => setRecentMilestone(null), 10000);
          }
        }}
        onSkip={() => setShowWizard(false)}
      />
    );
  }

  // Conditional render for the Physical Walkthrough Wizard
  if (showPhysicalWalkthrough && selectedProperty) {
    return (
      <PhysicalWalkthroughWizard
        propertyId={selectedProperty}
        property={currentProperty}
        onComplete={() => {
          setShowPhysicalWalkthrough(false);
          queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
        }}
        onSkip={() => setShowPhysicalWalkthrough(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>AWARE → BASELINE</h1>
          <p className="text-xl text-gray-600">Document Your Property Systems</p>
          <p className="text-gray-600 mt-1">Know what you have, when it was installed, and when to replace it</p>
        </div>

        {/* Milestone Celebration */}
        {recentMilestone && (
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 animate-pulse">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-6xl mb-3">{recentMilestone.icon}</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
                  {recentMilestone.title}
                </h2>
                <p className="text-lg text-gray-700 mb-4">{recentMilestone.message}</p>
                {recentMilestone.unlocks && (
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <p className="font-semibold mb-2 text-purple-900">🎁 Unlocked Features:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {recentMilestone.unlocks.map((unlock, idx) => (
                        <Badge key={idx} className="bg-purple-600 text-white">
                          <Unlock className="w-3 h-3 mr-1" />
                          {unlock}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2 mt-4">
                  {recentMilestone.badge}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
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
                </div>
                {currentProperty && systems.length === 0 && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowWizard(true)}
                      className="gap-2"
                      style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                    >
                      <Sparkles className="w-5 h-5" />
                      Quick Start
                    </Button>
                    <Button
                      onClick={() => setShowPhysicalWalkthrough(true)}
                      className="gap-2"
                      style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                    >
                      <MapPin className="w-5 h-5" />
                      Physical Walkthrough
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProperty ? (
          <>
            {/* Status Message with Professional Option AND Why It Matters Reminder */}
            <Card className={`border-2 ${statusBorderColor}`} style={{ backgroundColor: statusBgColor }}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{statusIconElement}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>{statusMessage}</h3>
                      <p className="text-gray-700">{statusSubtext}</p>
                      
                      {/* Next Milestone Progress */}
                      {nextMilestone && totalSystemTypes < MILESTONES[MILESTONES.length - 1].threshold && (
                        <div className="mt-4 p-3 bg-white/80 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Next: {nextMilestone.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {systemsToNextMilestone} more
                            </Badge>
                          </div>
                          <Progress 
                            value={(totalSystemTypes / nextMilestone.threshold) * 100} 
                            className="h-2"
                          />
                          {nextMilestone.unlocks && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {nextMilestone.unlocks.map((unlock, idx) => (
                                <span key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  {unlock}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Condensed "Why It Matters" Reminder - Always visible after first system */}
                      {systems.length > 0 && whyItMattersReminder && (
                        <div className="mt-3 p-3 bg-white/60 border border-gray-300 rounded-lg">
                          <div className="flex items-start gap-2">
                            {whyItMattersReminder.icon}
                            <p className={`text-xs font-medium leading-relaxed ${whyItMattersReminder.color}`}>
                              💡 {whyItMattersReminder.text}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>{overallProgress}%</p>
                    <p className="text-sm text-gray-600">Overall Complete</p>
                    <p className="text-xs text-gray-500 mt-1">{totalSystemTypes} of 16 types</p> {/* Updated display */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Service CTA */}
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    💼
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-900 mb-1">
                      Want help documenting your property?
                    </p>
                    <p className="text-xs text-gray-700 mb-3">
                      Our certified technicians will walk through your home and document everything - taking 2-3 hours of work off your plate.
                    </p>
                    <Button
                      onClick={handleRequestProService}
                      variant="default"
                      className="gap-2"
                      style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add Professional Baseline to Cart ($299)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Essential Systems */}
            <Card className="border-2 border-red-200 shadow-lg">
              <CardHeader className="bg-red-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Essential Systems (Start Here)
                  </CardTitle>
                  <Badge className="bg-red-600 text-white">
                    {requiredComplete}/{REQUIRED_SYSTEMS.length} complete
                  </Badge>
                </div>
                <Progress value={essentialProgress} className="mt-2 h-2" />
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-700 mb-6">
                  Complete <span className="font-bold">4 of these {REQUIRED_SYSTEMS.length} essential systems</span> to unlock the ACT phase.
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
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Complete Protection (Recommended)
                  </CardTitle>
                  <Badge className="bg-blue-600 text-white">
                    {recommendedComplete}/{RECOMMENDED_SYSTEMS.length} complete
                  </Badge>
                </div>
                <Progress value={recommendedProgress} className="mt-2 h-2" />
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
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                    🔌 Major Appliances
                  </CardTitle>
                  <Badge className="bg-purple-600 text-white">
                    {appliancesComplete}/{APPLIANCE_TYPES.length} types
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
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                    🚨 Safety Systems
                  </CardTitle>
                  <Badge className="bg-orange-600 text-white">
                    {safetyComplete}/{SAFETY_TYPES.length} types
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
              systemDescription={editingSystem?.description}
              allowsMultiple={editingSystem?.allowsMultiple}
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

        <AddToCartDialog
          open={showCartDialog}
          onClose={() => setShowCartDialog(false)}
          prefilledData={{
            property_id: selectedProperty,
            source_type: "custom",
            title: "Professional Baseline Assessment",
            description: "Complete system documentation service.",
            system_type: "General",
            priority: "Medium",
            estimated_hours: 2.5,
            estimated_cost_min: 299,
            estimated_cost_max: 299
          }}
        />

        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingSystem(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete System Documentation?"
          message={getDeleteMessage()}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </div>
  );
}
