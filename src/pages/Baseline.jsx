
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, CheckCircle2, AlertCircle, Shield, Award, Trophy, Edit, Trash2, BookOpen, Video, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SystemFormDialog from "../components/baseline/SystemFormDialog";
import ServiceRequestDialog from "../components/services/ServiceRequestDialog";

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
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);
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
  
  const essentialProgress = Math.round((requiredComplete / REQUIRED_SYSTEMS.length) * 100);
  const recommendedProgress = Math.round((recommendedComplete / RECOMMENDED_SYSTEMS.length) * 100);
  const overallProgress = Math.round((totalSystemTypes / 15) * 100);
  
  const actPhaseUnlocked = requiredComplete >= 4;
  const allRequiredComplete = requiredComplete === REQUIRED_SYSTEMS.length;
  const baselineBoss = totalSystemTypes >= 13;

  // Dynamic messaging for status card
  let statusMessage = "";
  let statusSubtext = "";
  let statusBorderColor = "";
  let statusBgColor = "";
  let statusIconElement = null;

  if (baselineBoss) {
    statusMessage = "🏆 BASELINE BOSS!";
    statusSubtext = "You have comprehensive documentation. This is elite-level homeownership.";
    statusBorderColor = "border-purple-300";
    statusBgColor = "bg-purple-50";
    statusIconElement = <Trophy className="w-8 h-8 text-purple-600" />;
  } else if (allRequiredComplete) {
    statusMessage = "All Essential Systems Documented!";
    statusSubtext = "You've secured the basics. Now, build complete peace of mind by adding appliances and safety systems.";
    statusBorderColor = "border-green-300";
    statusBgColor = "bg-green-50";
    statusIconElement = <Award className="w-8 h-8 text-green-600" />;
  } else if (actPhaseUnlocked) {
    statusMessage = "🎉 ACT Phase Unlocked!";
    statusSubtext = "You can now prioritize and schedule maintenance. Consider completing your full baseline for maximum protection.";
    statusBorderColor = "border-green-300";
    statusBgColor = "bg-green-50";
    statusIconElement = <CheckCircle2 className="w-8 h-8 text-green-600" />;
  } else {
    const systemsNeeded = 4 - requiredComplete;
    statusMessage = `Complete ${systemsNeeded} more essential system type${systemsNeeded > 1 ? 's' : ''}`;
    statusSubtext = "Unlock the ACT phase to prioritize and schedule maintenance for your home.";
    statusBorderColor = "border-orange-300";
    statusBgColor = "bg-orange-50";
    statusIconElement = <AlertCircle className="w-8 h-8 text-orange-600" />;
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
    setEditingSystem({
      ...system,
      description: SYSTEM_DESCRIPTIONS[system.system_type],
      allowsMultiple: MULTI_INSTANCE_SYSTEMS.includes(system.system_type)
    });
    setShowDialog(true);
  };

  const handleAddSystem = (systemType) => {
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
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);

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
                {isRequired && <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">REQUIRED</Badge>}
              </h3>
              {isRequired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}
            </div>
            {description && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">{description.what}</p>
                <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                  <p className="text-xs font-semibold text-orange-900 mb-1">⚠️ Why Document This?</p>
                  <p className="text-xs text-orange-800">{description.why}</p>
                </div>
              </div>
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>AWARE → BASELINE</h1>
          <p className="text-xl text-gray-600">Document Your Property Systems</p>
          <p className="text-gray-600 mt-1">Know what you have, when it was installed, and when to replace it</p>
        </div>

        {/* Why Baseline Matters - Enhanced Educational Section */}
        {systems.length === 0 && (
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '24px' }}>
                <BookOpen className="w-8 h-8 text-blue-600" />
                Why Complete Your Baseline? (The Real Story)
              </h3>
              
              {/* The Big Picture */}
              <div className="bg-white p-6 rounded-lg mb-6">
                <h4 className="font-bold mb-3 text-lg" style={{ color: '#1B365D' }}>
                  💡 Here's What Most People Don't Know:
                </h4>
                <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  Your baseline isn't just a list—it's your home's <strong>financial defense system</strong>. 
                  Without knowing what you have, when it was installed, and how long it should last, you're 
                  flying blind with the largest investment of your life.
                </p>
                <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 p-3 rounded">
                  <p className="font-semibold text-orange-900 mb-2">
                    Real Example: The $43,000 Difference
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    Homeowner A has no baseline. Their 15-year-old HVAC dies in July = $12K emergency replacement. 
                    Unknown roof age leads to leak = $8K interior damage. Water heater fails = $4K flood cleanup. 
                    Foundation crack ignored = $19K structural repair. <strong>Total: $43,000 in preventable disasters.</strong>
                  </p>
                  <p className="text-sm text-green-800 font-semibold mt-3">
                    Homeowner B has complete baseline. Replaces HVAC at 13 years = $6K planned. Roof renewed at 18 years = 
                    $9K scheduled. Water heater at 10 years = $1.2K no emergency. Foundation monitored = $0 caught early. 
                    <strong>Total: $16,200 invested strategically.</strong> Saved $26,800 and avoided all disasters.
                  </p>
                </div>
              </div>

              {/* The Concrete Benefits */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-lg border-2 border-green-300">
                  <div className="text-3xl mb-3">💰</div>
                  <h5 className="font-bold mb-2" style={{ color: '#28A745' }}>Avoid Financial Disasters</h5>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Budget for replacements 2-3 years ahead</li>
                    <li>• Never caught off-guard by failures</li>
                    <li>• Plan = save 40-60% vs. emergency</li>
                    <li>• Prevent cascade failures ($20K-50K+)</li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-lg border-2 border-blue-300">
                  <div className="text-3xl mb-3">🏆</div>
                  <h5 className="font-bold mb-2" style={{ color: '#3B82F6' }}>Maximize Home Value</h5>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Prove maintenance = +$5-15K sale price</li>
                    <li>• Pass inspections with confidence</li>
                    <li>• Eliminate buyer negotiation leverage</li>
                    <li>• Show you're a serious owner</li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-lg border-2 border-purple-300">
                  <div className="text-3xl mb-3">🎯</div>
                  <h5 className="font-bold mb-2" style={{ color: '#8B5CF6' }}>Strategic Control</h5>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Know exactly what needs attention</li>
                    <li>• Budget accurately for 5-10 years</li>
                    <li>• Make informed upgrade decisions</li>
                    <li>• Sleep well knowing your home</li>
                  </ul>
                </div>
              </div>

              {/* Without vs. With Comparison */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 border-2 border-red-300 p-5 rounded-lg">
                  <p className="font-bold mb-3 text-red-800 text-lg flex items-center gap-2">
                    <span className="text-2xl">❌</span> WITHOUT BASELINE
                  </p>
                  <ul className="text-sm text-gray-800 space-y-2">
                    <li><strong>→</strong> 20-year-old water heater fails unexpectedly</li>
                    <li><strong>=</strong> $6,500 emergency + $3,000 flood damage</li>
                    <li className="pt-2 border-t border-red-200"></li>
                    <li><strong>→</strong> Unknown roof age, surprise leak during rain</li>
                    <li><strong>=</strong> $8,000 interior damage + $12,000 emergency roof</li>
                    <li className="pt-2 border-t border-red-200"></li>
                    <li><strong>→</strong> Selling home with no maintenance records</li>
                    <li><strong>=</strong> Buyers negotiate -$10K to -$20K discount</li>
                    <li className="pt-2 border-t border-red-200"></li>
                    <li><strong>→</strong> Can't budget for upcoming replacements</li>
                    <li><strong>=</strong> Living paycheck-to-paycheck with home emergencies</li>
                    <li className="pt-2 border-t border-red-200 mt-3"></li>
                    <li className="font-bold text-red-900 pt-2">
                      TOTAL COST: $39,500+ in preventable disasters over 10 years
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-2 border-green-300 p-5 rounded-lg">
                  <p className="font-bold mb-3 text-green-800 text-lg flex items-center gap-2">
                    <span className="text-2xl">✅</span> WITH COMPLETE BASELINE
                  </p>
                  <ul className="text-sm text-gray-800 space-y-2">
                    <li><strong>→</strong> Know water heater is 12 years old, replace proactively</li>
                    <li><strong>=</strong> $1,400 planned replacement, zero emergencies</li>
                    <li className="pt-2 border-t border-green-200"></li>
                    <li><strong>→</strong> Track roof installed 2005, budget for 2028 replacement</li>
                    <li><strong>=</strong> $10,000 planned vs. $20,000 emergency with damage</li>
                    <li className="pt-2 border-t border-green-200"></li>
                    <li><strong>→</strong> Selling with complete system documentation</li>
                    <li><strong>=</strong> Buyers confident, sell $8K-15K above asking</li>
                    <li className="pt-2 border-t border-green-200"></li>
                    <li><strong>→</strong> Budget spreadsheet shows exactly what's coming</li>
                    <li><strong>=</strong> Save $200-400/month with confidence, no surprises</li>
                    <li className="pt-2 border-t border-green-200 mt-3"></li>
                    <li className="font-bold text-green-900 pt-2">
                      TOTAL SAVINGS: $28,100+ avoided costs + peace of mind
                    </li>
                  </ul>
                </div>
              </div>

              {/* Time Investment Reality */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 p-5 rounded-lg mb-6">
                <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                  ⏱️ "But This Looks Like A Lot of Work..."
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-2 text-gray-900">Reality Check:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      <li>• <strong>Essential systems (6):</strong> 2-3 hours total</li>
                      <li>• <strong>Per system:</strong> 15-30 minutes average</li>
                      <li>• <strong>Complete baseline (15):</strong> 4-6 hours one-time</li>
                      <li>• <strong>After setup:</strong> 5 min updates per year</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2 text-gray-900">Compare That To:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      <li>• Researching emergency plumber at 2am: <strong>3 hours stress</strong></li>
                      <li>• Getting insurance quotes after flood: <strong>8 hours chaos</strong></li>
                      <li>• Negotiating with buyer over mystery systems: <strong>$10K+ loss</strong></li>
                      <li>• Worrying about unknown home issues: <strong>Priceless anxiety</strong></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <p className="text-center font-bold text-blue-900">
                    💎 Invest 4-6 hours once = Save $25,000-50,000+ over homeownership + eliminate stress
                  </p>
                </div>
              </div>

              {/* Getting Started Path */}
              <div className="bg-white p-5 rounded-lg border-2 border-green-300">
                <h4 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '18px' }}>
                  🚀 Your Path: Start Small, Build Complete Protection
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded">
                    <Badge className="bg-red-600 text-white flex-shrink-0">Step 1</Badge>
                    <div>
                      <p className="font-semibold text-gray-900">Document 4 Essential Systems (unlock ACT phase)</p>
                      <p className="text-sm text-gray-700">Start with the big ones: HVAC, Plumbing, Roof, Electrical. Takes 1-2 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
                    <Badge className="bg-blue-600 text-white flex-shrink-0">Step 2</Badge>
                    <div>
                      <p className="font-semibold text-gray-900">Add Remaining Essential + Recommended (complete protection)</p>
                      <p className="text-sm text-gray-700">Foundation, Water/Sewer, Exterior, Gutters. Another 1-2 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded">
                    <Badge className="bg-purple-600 text-white flex-shrink-0">Step 3</Badge>
                    <div>
                      <p className="font-semibold text-gray-900">Complete with Appliances & Safety (Baseline Boss status)</p>
                      <p className="text-sm text-gray-700">Document all appliances and safety systems. Final 1-2 hours.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Links */}
              <div className="border-t border-blue-300 pt-6 mt-6">
                <p className="font-semibold mb-4" style={{ color: '#1B365D', fontSize: '16px' }}>
                  📚 Still Not Convinced? Learn More:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-3"
                  >
                    <Link to={createPageUrl("ResourceGuides") + "?category=Getting Started"}>
                      <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-left">Complete Baseline Guide<br/><span className="text-xs text-gray-600">15-min read</span></span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-3"
                  >
                    <Link to={createPageUrl("VideoTutorials") + "?category=Getting Started"}>
                      <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-left">Video Walkthrough<br/><span className="text-xs text-gray-600">23-min tutorial</span></span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-3"
                  >
                    <Link to={createPageUrl("ROICalculators")}>
                      <Calculator className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-left">Calculate Your Savings<br/><span className="text-xs text-gray-600">Interactive tool</span></span>
                    </Link>
                  </Button>
                </div>
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
                {currentProperty && (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">System Types</p>
                      <p className="text-2xl font-bold text-gray-900">{totalSystemTypes}/15</p>
                      <p className="text-xs text-gray-500">{overallProgress}% complete</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProperty ? (
          <>
            {/* Status Message with Professional Option */}
            <Card className={`border-2 ${statusBorderColor}`} style={{ backgroundColor: statusBgColor }}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{statusIconElement}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>{statusMessage}</h3>
                      <p className="text-gray-700">{statusSubtext}</p>
                      
                      {/* Professional Service CTA for incomplete baseline */}
                      {essentialProgress < 100 && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Feeling overwhelmed? Let us handle the documentation.
                          </p>
                          <p className="text-xs text-gray-700 mb-3">
                            Our pros document everything in 2 hours, provide complete report with photos, and identify all issues. 
                            First assessment includes system age verification and priority recommendations.
                          </p>
                          <Button
                            onClick={() => setShowServiceDialog(true)}
                            variant="outline"
                            className="w-full md:w-auto"
                            style={{ borderColor: '#28A745', color: '#28A745' }}
                          >
                            Schedule Professional Baseline Assessment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>{overallProgress}%</p>
                    <p className="text-sm text-gray-600">Overall Complete</p>
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
        <ServiceRequestDialog
          open={showServiceDialog}
          onClose={() => setShowServiceDialog(false)}
          prefilledData={{
            property_id: selectedProperty,
            service_type: "Professional Baseline Assessment",
            description: "I would like a professional to document all systems in my property and provide a complete baseline assessment."
          }}
        />
      </div>
    </div>
  );
}
