
import React from "react";
import { SystemBaseline } from "@/api/supabaseClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Navigation, Zap, Camera, Clock } from "lucide-react";
import SystemFormDialog from "./SystemFormDialog";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Optimal physical route through a typical property
const PHYSICAL_ZONES = [
  {
    id: 'mechanical_room',
    name: '🔧 Mechanical/Utility Room',
    subtitle: 'Start here - most critical systems in one place',
    estimatedTime: '10-15 min',
    systems: ['HVAC System', 'Plumbing System', 'Electrical System', 'Water & Sewer/Septic'],
    tips: [
      'Water heater data plate on front',
      'HVAC filter location',
      'Electrical panel amperage',
      'Main water shutoff valve'
    ],
    why: 'These 4 systems are responsible for 70% of expensive home emergencies. Document them first.'
  },
  {
    id: 'basement_crawlspace',
    name: '🏚️ Basement/Crawlspace',
    subtitle: 'While you\'re downstairs',
    estimatedTime: '5-8 min',
    systems: ['Basement/Crawlspace', 'Foundation & Structure'],
    tips: [
      'Check for moisture or water stains',
      'Look at foundation walls for cracks',
      'Note sump pump location',
      'Photo any support beams'
    ],
    why: 'Foundation issues escalate fast. Early documentation helps track changes over time.'
  },
  {
    id: 'interior_living',
    name: '🏠 Interior Living Spaces',
    subtitle: 'Kitchen, bathrooms, living areas',
    estimatedTime: '10-15 min',
    systems: ['Refrigerator', 'Range/Oven', 'Dishwasher', 'Microwave', 'Garbage Disposal', 'Washing Machine', 'Dryer'],
    tips: [
      'Open appliances to see model plates',
      'Check washing machine hose type',
      'Note appliance ages',
      'Photo serial numbers'
    ],
    why: 'Appliance failures cause water damage and fire hazards. Knowing ages helps plan replacements.'
  },
  {
    id: 'safety_systems',
    name: '🚨 Safety Systems',
    subtitle: 'Check while walking through',
    estimatedTime: '5-10 min',
    systems: ['Smoke Detector', 'CO Detector', 'Fire Extinguisher', 'Security System'],
    tips: [
      'Count detectors per floor',
      'Check installation/battery dates',
      'Test each detector',
      'Note fire extinguisher locations'
    ],
    why: '60% of fire deaths happen in homes with non-functional detectors. This saves lives.'
  },
  {
    id: 'attic',
    name: '🏚️ Attic',
    subtitle: 'Grab a flashlight',
    estimatedTime: '5-8 min',
    systems: ['Attic & Insulation', 'Roof System'],
    tips: [
      'Check insulation type and depth',
      'Look for roof deck moisture',
      'Check ventilation (soffit/ridge vents)',
      'Photo any issues or stains'
    ],
    why: 'Poor attic ventilation destroys roofs 10 years early = $20K+ premature replacement.'
  },
  {
    id: 'exterior_perimeter',
    name: '🌳 Exterior Perimeter Walk',
    subtitle: 'Walk around outside',
    estimatedTime: '10-15 min',
    systems: ['Roof System', 'Exterior Siding & Envelope', 'Windows & Doors', 'Gutters & Downspouts', 'Foundation & Structure', 'Driveways & Hardscaping'],
    tips: [
      'Look at roof from ground - missing shingles?',
      'Check siding condition',
      'Look for gutter debris',
      'Check foundation for cracks',
      'Note driveway condition'
    ],
    why: 'Exterior systems protect everything inside. Water intrusion = $25K+ in damage.'
  },
  {
    id: 'landscaping_drainage',
    name: '🌱 Landscaping & Drainage',
    subtitle: 'Final exterior check',
    estimatedTime: '5-8 min',
    systems: ['Landscaping & Grading', 'Gutters & Downspouts'],
    tips: [
      'Check ground slope away from house',
      'Note where downspouts discharge',
      'Look for low spots/pooling',
      'Check trees near foundation'
    ],
    why: 'Poor drainage = foundation damage. This is the #1 preventable cause of foundation failure.'
  },
  {
    id: 'garage',
    name: '🚗 Garage',
    subtitle: 'Last stop',
    estimatedTime: '3-5 min',
    systems: ['Garage & Overhead Door'],
    tips: [
      'Test door opener',
      'Check spring type',
      'Note door age/brand',
      'Test safety sensors'
    ],
    why: 'Broken springs = door falls = crushed vehicles/injury + 3X emergency repair costs.'
  }
];

export default function PhysicalWalkthroughWizard({ propertyId, property, onComplete, onSkip }) {
  const [currentZoneIndex, setCurrentZoneIndex] = React.useState(0);
  const [completedZones, setCompletedZones] = React.useState([]);
  const [showSystemDialog, setShowSystemDialog] = React.useState(false);
  const [selectedSystem, setSelectedSystem] = React.useState(null);
  const [zoneStartTime, setZoneStartTime] = React.useState(Date.now());
  const [zoneTimes, setZoneTimes] = React.useState({});

  const queryClient = useQueryClient();

  // Fetch existing systems to show what's already documented
  const { data: existingSystems = [] } = useQuery({
    queryKey: ['systemBaselines', propertyId],
    queryFn: () => SystemBaseline.filter({ property_id: propertyId }),
    enabled: !!propertyId,
  });

  const currentZone = PHYSICAL_ZONES[currentZoneIndex];
  const progress = ((currentZoneIndex + 1) / PHYSICAL_ZONES.length) * 100;
  const totalEstimatedTime = PHYSICAL_ZONES.reduce((acc, zone) => {
    const [min] = zone.estimatedTime.split('-').map(t => parseInt(t));
    return acc + min;
  }, 0);

  // Check which systems in current zone are already documented
  const systemsInZone = currentZone.systems.map(systemType => {
    const documented = existingSystems.filter(s => s.system_type === systemType);
    return {
      type: systemType,
      documented: documented.length > 0,
      count: documented.length,
      instances: documented
    };
  });

  const allSystemsInZoneDocumented = systemsInZone.every(s => s.documented);
  const someSystemsInZoneDocumented = systemsInZone.some(s => s.documented);

  const handleAddSystem = (systemType) => {
    setSelectedSystem({
      system_type: systemType,
      property_id: propertyId,
      zone: currentZone.id,
      description: null,
      allowsMultiple: ['HVAC System', 'Smoke Detector', 'CO Detector', 'Fire Extinguisher'].includes(systemType)
    });
    setShowSystemDialog(true);
  };

  const handleSystemDialogClose = () => {
    setShowSystemDialog(false);
    setSelectedSystem(null);
    // Invalidate queries to refresh the displayed systems
    queryClient.invalidateQueries({ queryKey: ['systemBaselines', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['systemBaselines'] }); // Also invalidate general query
  };

  const handleNextZone = () => {
    // Record time spent in this zone
    const timeSpent = Math.round((Date.now() - zoneStartTime) / 1000 / 60); // minutes
    setZoneTimes(prev => ({
      ...prev,
      [currentZone.id]: timeSpent
    }));

    setCompletedZones(prev => [...prev, currentZone.id]);

    if (currentZoneIndex < PHYSICAL_ZONES.length - 1) {
      setCurrentZoneIndex(prev => prev + 1);
      setZoneStartTime(Date.now());
    } else {
      // Completion celebration!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });

      toast.success('🎉 Physical Walkthrough Complete!', {
        description: `${existingSystems.length} systems documented across ${completedZones.length + 1} zones. Excellent work!`,
        duration: 5000
      });

      onComplete();
    }
  };

  const handlePreviousZone = () => {
    if (currentZoneIndex > 0) {
      setCurrentZoneIndex(prev => prev - 1);
      setZoneStartTime(Date.now());
    }
  };

  const handleSkipZone = () => {
    if (currentZoneIndex < PHYSICAL_ZONES.length - 1) {
      setCurrentZoneIndex(prev => prev + 1);
      setZoneStartTime(Date.now());
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header with Exit */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onSkip}
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Walkthrough
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Estimated Total</p>
            <p className="font-bold text-gray-900">{totalEstimatedTime} min</p>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="border-2 border-blue-300 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <CardTitle className="text-xl">Physical Walkthrough</CardTitle>
              </div>
              <Badge className="bg-white text-blue-900">
                Zone {currentZoneIndex + 1} of {PHYSICAL_ZONES.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-blue-200" />
            <p className="text-blue-100 text-sm mt-2">
              {completedZones.length} zones complete • Follow the path for maximum efficiency
            </p>
          </CardHeader>
        </Card>

        {/* Current Zone Card */}
        <Card className="border-2 border-green-300 shadow-lg mb-6">
          <CardHeader className={`${
            allSystemsInZoneDocumented ? 'bg-green-50' :
            someSystemsInZoneDocumented ? 'bg-yellow-50' :
            'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">{currentZone.name}</CardTitle>
                <p className="text-gray-600">{currentZone.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{currentZone.estimatedTime}</span>
                </div>
                {allSystemsInZoneDocumented && (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Why This Zone Matters */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-orange-900 mb-2">💡 Why This Zone Matters:</h3>
              <p className="text-sm text-orange-900">{currentZone.why}</p>
            </div>

            {/* What to Look For */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">🔍 What to Look For Here:</h3>
              <ul className="space-y-2">
                {currentZone.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-blue-900">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Systems to Document */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Systems in This Zone:</h3>
              
              {systemsInZone.map((system, idx) => (
                <Card 
                  key={idx} 
                  className={`border-2 ${
                    system.documented 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-400 transition-colors'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{system.type}</h4>
                          {system.documented && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {system.count} documented
                            </Badge>
                          )}
                        </div>
                        {system.documented && system.instances.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {system.instances.map((inst, i) => (
                              <span key={i}>
                                {inst.nickname || inst.brand_model || 'Documented'}
                                {i < system.instances.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddSystem(system.type)}
                        variant={system.documented ? "outline" : "default"}
                        size="sm"
                        className={!system.documented ? 'bg-blue-600' : ''}
                      >
                        {system.documented ? 'Add Another' : 'Document'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={handleNextZone}
                className="w-full gap-2"
                style={{ 
                  backgroundColor: allSystemsInZoneDocumented ? '#28A745' : '#3B82F6',
                  minHeight: '56px',
                  fontSize: '16px'
                }}
              >
                {allSystemsInZoneDocumented ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Next Zone
                  </>
                ) : (
                  <>
                    Continue to Next Zone
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <div className="flex gap-3">
                {currentZoneIndex > 0 && (
                  <Button
                    onClick={handlePreviousZone}
                    variant="outline"
                    className="flex-1"
                    style={{ minHeight: '48px' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Zone
                  </Button>
                )}
                
                <Button
                  onClick={handleSkipZone}
                  variant="ghost"
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Skip This Zone
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone Navigation Map */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Walkthrough Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {PHYSICAL_ZONES.map((zone, idx) => (
                <div
                  key={zone.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    idx === currentZoneIndex 
                      ? 'bg-blue-100 border-2 border-blue-400' 
                      : completedZones.includes(zone.id)
                      ? 'bg-green-50 border border-green-300'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {completedZones.includes(zone.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : idx === currentZoneIndex ? (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {idx + 1}
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      idx === currentZoneIndex ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {zone.name.replace(/[^a-zA-Z\s]/g, '').trim()}
                    </p>
                    {zoneTimes[zone.id] && (
                      <p className="text-xs text-gray-600">
                        Completed in {zoneTimes[zone.id]} min
                      </p>
                    )}
                  </div>
                  {idx === currentZoneIndex && (
                    <Badge className="bg-blue-600 text-white">Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Dialog */}
        {showSystemDialog && selectedSystem && (
          <SystemFormDialog
            open={showSystemDialog}
            onClose={handleSystemDialogClose}
            propertyId={propertyId}
            editingSystem={selectedSystem}
          />
        )}
      </div>
    </div>
  );
}
