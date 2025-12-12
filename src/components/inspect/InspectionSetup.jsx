import React from "react";
import { Inspection } from "@/api/supabaseClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, Clock, MapPin, Navigation, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];

const SEASON_FOCUS = {
  Spring: "Post-winter damage assessment, drainage prep for spring rains, AC testing before summer heat, pest prevention, growth season prep",
  Summer: "AC system performance, outdoor maintenance in good weather, heat-related stress on systems, prepare for fall",
  Fall: "Heating system testing before winter, gutter cleaning before rain season, weatherproofing, storm preparation",
  Winter: "Heating system monitoring, freeze protection, indoor air quality, ice dam prevention, safety systems check"
};

const SEASON_ICONS = {
  Spring: "🌸",
  Summer: "☀️",
  Fall: "🍂",
  Winter: "❄️"
};

export default function InspectionSetup({ property, baselineSystems, onComplete, onCancel }) {
  const [step, setStep] = React.useState(1); // 1: Type, 2: Season (if seasonal), 3: Confirm & Start
  const [inspectionType, setInspectionType] = React.useState('seasonal');
  const [selectedSeason, setSelectedSeason] = React.useState(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  });

  const createInspectionMutation = useMutation({
    mutationFn: async () => {
      if (!property?.id) {
        throw new Error('Property ID is required to create an inspection');
      }
      
      return Inspection.create({
        property_id: property.id,
        inspection_type: inspectionType === 'seasonal' ? 'Seasonal' : inspectionType === 'quick' ? 'Seasonal' : 'Full',
        status: 'In Progress',
        route_mode: inspectionType === 'seasonal' ? 'physical' : 'area_based',
        completion_percent: 0,
        issues_count: 0,
        checklist_items: [],
        notes: `${selectedSeason} ${new Date().getFullYear()} - ${inspectionType} Inspection`
      });
    },
    onSuccess: (inspection) => {
      onComplete(inspection);
    },
    onError: (error) => {
      console.error('Failed to create inspection:', error);
      alert('Failed to create inspection. Please try again.');
    }
  });

  const handleBeginWalkthrough = () => {
    if (!property?.id) {
      alert('No property selected. Please go back and select a property.');
      return;
    }
    createInspectionMutation.mutate();
  };

  const handleCancel = () => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
  };

  const handleNext = () => {
    if (step === 1 && inspectionType !== 'seasonal') {
      // Skip season selection for non-seasonal inspections
      setStep(3);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 3 && inspectionType !== 'seasonal') {
      // Skip back to step 1 for non-seasonal
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  // If no property, show error
  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border-none shadow-lg max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Property Selected</h1>
            <p className="text-gray-600 mb-6">Please select a property before starting an inspection.</p>
            <Button onClick={handleCancel} style={{ backgroundColor: '#1B365D', minHeight: '48px' }}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Button
          variant="ghost"
          onClick={step === 1 ? handleCancel : handleBack}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Choose Inspection Type
              </h1>
              <p className="text-gray-600">What kind of inspection are you doing?</p>
            </div>

            <div className="space-y-4">
              <Card 
                className={`border-3 cursor-pointer transition-all hover:shadow-xl ${
                  inspectionType === 'seasonal' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setInspectionType('seasonal')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      value="seasonal"
                      checked={inspectionType === 'seasonal'}
                      onChange={(e) => setInspectionType(e.target.value)}
                      className="mt-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                          Seasonal Inspection
                        </h3>
                        <Badge className="bg-green-600 text-white">RECOMMENDED</Badge>
                      </div>
                      <p className="text-gray-700 mb-3">
                        Complete inspection of all areas and systems. Best practice is quarterly - one per season.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          30-45 min
                        </Badge>
                        <Badge variant="outline">Most Comprehensive</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`border-3 cursor-pointer transition-all hover:shadow-xl ${
                  inspectionType === 'quick' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setInspectionType('quick')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      value="quick"
                      checked={inspectionType === 'quick'}
                      onChange={(e) => setInspectionType(e.target.value)}
                      className="mt-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
                        Quick Check
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Spot inspection of specific area or concern. Fast and focused.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          10-15 min
                        </Badge>
                        <Badge variant="outline">Targeted</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`border-3 cursor-pointer transition-all hover:shadow-xl ${
                  inspectionType === 'post-work' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setInspectionType('post-work')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      value="post-work"
                      checked={inspectionType === 'post-work'}
                      onChange={(e) => setInspectionType(e.target.value)}
                      className="mt-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
                        Post-Work Verification
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Verify quality of completed repairs or improvements. Document "after" condition.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          20-30 min
                        </Badge>
                        <Badge variant="outline">Quality Control</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={handleNext}
              className="w-full h-14 text-lg font-bold"
              style={{ backgroundColor: '#28A745', minHeight: '56px' }}
            >
              Next: {inspectionType === 'seasonal' ? 'Choose Season' : 'Confirm & Start'}
            </Button>
          </>
        )}

        {/* Step 2: Choose Season (seasonal only) */}
        {step === 2 && inspectionType === 'seasonal' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Choose Season
              </h1>
              <p className="text-gray-600">What season are you inspecting for?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SEASONS.map((season) => (
                <Card
                  key={season}
                  className={`border-3 cursor-pointer transition-all hover:shadow-xl ${
                    selectedSeason === season
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedSeason(season)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">{SEASON_ICONS[season]}</div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
                      {season}
                    </h3>
                    {season === (() => {
                      const month = new Date().getMonth();
                      if (month >= 2 && month <= 4) return "Spring";
                      if (month >= 5 && month <= 7) return "Summer";
                      if (month >= 8 && month <= 10) return "Fall";
                      return "Winter";
                    })() && (
                      <Badge className="bg-green-600 text-white">
                        Current Season
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Season Focus */}
            <Card className="border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-900 text-lg mb-2">
                      💡 {selectedSeason.toUpperCase()} FOCUS:
                    </h3>
                    <p className="text-gray-800 leading-relaxed">
                      {SEASON_FOCUS[selectedSeason]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full h-14 text-lg font-bold"
              style={{ backgroundColor: '#28A745', minHeight: '56px' }}
            >
              Next: Confirm & Start
            </Button>
          </>
        )}

        {/* Step 3: Confirm & Start */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Ready to Begin
              </h1>
              <p className="text-gray-600">Review your inspection setup</p>
            </div>

            {/* Summary Card */}
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Inspection Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Property</p>
                  <p className="font-semibold text-lg" style={{ color: '#1B365D' }}>
                    {property.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inspection Type</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg" style={{ color: '#1B365D' }}>
                      {inspectionType === 'seasonal' ? 'Seasonal Inspection' :
                       inspectionType === 'quick' ? 'Quick Check' :
                       'Post-Work Verification'}
                    </p>
                    {inspectionType === 'seasonal' && (
                      <Badge className="bg-green-600 text-white">RECOMMENDED</Badge>
                    )}
                  </div>
                </div>
                {inspectionType === 'seasonal' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Season</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{SEASON_ICONS[selectedSeason]}</span>
                      <p className="font-semibold text-lg" style={{ color: '#1B365D' }}>
                        {selectedSeason} {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Baseline Systems</p>
                  <p className="font-semibold" style={{ color: '#1B365D' }}>
                    {baselineSystems.length} systems documented
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-purple-900 text-lg mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  What to Expect:
                </h3>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You'll walk through different areas of your property</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Take photos of any issues you find</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>AI will suggest what to look for in each area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Your progress is saved automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Issues automatically feed into your Priority Queue
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Time Estimate */}
            <Card className="border-2 border-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6" style={{ color: '#1B365D' }} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Expected Time:</p>
                      <p className="text-xl font-bold" style={{ color: '#1B365D' }}>
                        {inspectionType === 'seasonal' ? '30-45 minutes' : 
                         inspectionType === 'quick' ? '10-15 minutes' : 
                         '20-30 minutes'}
                      </p>
                    </div>
                  </div>
                  <MapPin className="w-10 h-10 text-gray-300" />
                </div>
              </CardContent>
            </Card>

            {/* Warning for incomplete */}
            {baselineSystems.length === 0 && (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900 mb-1">
                        No Baseline Systems Documented
                      </p>
                      <p className="text-sm text-orange-800">
                        You can still inspect, but having baseline data helps identify what's changed over time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleBeginWalkthrough}
              disabled={createInspectionMutation.isPending || !property?.id}
              className="w-full h-16 text-xl font-bold"
              style={{ backgroundColor: '#28A745', minHeight: '64px' }}
            >
              {createInspectionMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Starting...
                </>
              ) : (
                <>
                  <Navigation className="w-6 h-6 mr-2" />
                  Begin Inspection
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}