import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, Clock } from "lucide-react";

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

export default function InspectionSetup({ property, baselineSystems, onStart, onCancel }) {
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
      return base44.entities.Inspection.create({
        property_id: property.id,
        season: selectedSeason,
        year: new Date().getFullYear(),
        inspection_type: inspectionType,
        status: 'In Progress',
        completion_percentage: 0,
        issues_found: 0,
        checklist_items: [],
        start_time: new Date().toISOString()
      });
    },
    onSuccess: (inspection) => {
      onStart(inspection);
    },
  });

  const handleBeginWalkthrough = () => {
    createInspectionMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>New Inspection</h1>
        </div>

        {/* Property Selection */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Property:</label>
            <p className="text-lg font-semibold" style={{ color: '#1B365D' }}>{property.address}</p>
          </CardContent>
        </Card>

        {/* Inspection Type */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-gray-700 block">Inspection Type:</label>
            
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: inspectionType === 'seasonal' ? '#1B365D' : '#E5E7EB' }}>
              <input
                type="radio"
                value="seasonal"
                checked={inspectionType === 'seasonal'}
                onChange={(e) => setInspectionType(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#1B365D' }}>Seasonal Walkthrough (Best practice - quarterly)</p>
                <p className="text-sm text-gray-600 mt-1">Comprehensive inspection of all areas and systems</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: inspectionType === 'quick' ? '#1B365D' : '#E5E7EB' }}>
              <input
                type="radio"
                value="quick"
                checked={inspectionType === 'quick'}
                onChange={(e) => setInspectionType(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#1B365D' }}>Quick Check (Spot inspection of one area)</p>
                <p className="text-sm text-gray-600 mt-1">Targeted inspection of specific concerns</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: inspectionType === 'post-work' ? '#1B365D' : '#E5E7EB' }}>
              <input
                type="radio"
                value="post-work"
                checked={inspectionType === 'post-work'}
                onChange={(e) => setInspectionType(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#1B365D' }}>Post-Work Verification (After repairs completed)</p>
                <p className="text-sm text-gray-600 mt-1">Verify quality of completed repairs or improvements</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Season Selection (only for seasonal) */}
        {inspectionType === 'seasonal' && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <label className="text-sm font-medium text-gray-700 block">Season:</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SEASONS.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSeason === season
                        ? 'border-current shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={selectedSeason === season ? { 
                      borderColor: '#1B365D', 
                      backgroundColor: '#F0F4F8' 
                    } : {}}
                  >
                    <div className="text-3xl mb-2">{SEASON_ICONS[season]}</div>
                    <div className="font-semibold" style={selectedSeason === season ? { color: '#1B365D' } : {}}>
                      {season}
                    </div>
                    {season === selectedSeason && (
                      <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                        Current
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season Focus (only for seasonal) */}
        {inspectionType === 'seasonal' && (
          <Card className="border-2" style={{ borderColor: '#FFC107', backgroundColor: '#FFFBF0' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#FFC107' }} />
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1B365D' }}>
                    💡 {selectedSeason.toUpperCase()} FOCUS:
                  </h3>
                  <p className="text-gray-800 leading-relaxed">
                    {SEASON_FOCUS[selectedSeason]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Estimate */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" style={{ color: '#1B365D' }} />
              <div>
                <p className="text-sm font-medium text-gray-700">Expected Time:</p>
                <p className="text-lg font-bold" style={{ color: '#1B365D' }}>
                  {inspectionType === 'seasonal' ? '45-60 minutes' : 
                   inspectionType === 'quick' ? '10-15 minutes' : 
                   '20-30 minutes'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Begin Button */}
        <Button
          onClick={handleBeginWalkthrough}
          disabled={createInspectionMutation.isPending}
          className="w-full h-14 text-lg font-bold"
          style={{ backgroundColor: '#28A745' }}
        >
          {createInspectionMutation.isPending ? 'Starting...' : 'Begin Walkthrough'}
        </Button>
      </div>
    </div>
  );
}