
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Cloud, CheckCircle2, Circle } from "lucide-react";

const CLIMATE_ZONES = {
  "Pacific Northwest": {
    characteristics: "Heavy rainfall: 40+ inches annually (Oct-May) | Mild winters: Rare freezing | Dry summers: June-September | Key concerns: Moisture, drainage, moss growth",
    inspections: [
      { season: "Spring", window: "March 1 - May 31", deadline: "April 15", focus: "Post-winter damage, drainage prep" },
      { season: "Summer", window: "June 1 - August 31", deadline: "July 15", focus: "Exterior work, irrigation" },
      { season: "Fall", window: "September 1 - November 30", deadline: "October 15 (BEFORE RAIN SEASON)", focus: "Gutter cleaning, winterization, drainage", critical: true },
      { season: "Winter", window: "December 1 - February 28", deadline: "January 15", focus: "Interior systems, moisture control" }
    ]
  },
  "Northeast": {
    characteristics: "Four distinct seasons | Cold winters with snow/ice | Hot summers | Key concerns: Freeze/thaw cycles, ice dams, snow load",
    inspections: [
      { season: "Spring", window: "March 1 - May 31", deadline: "April 15", focus: "Winter damage assessment, exterior prep" },
      { season: "Summer", window: "June 1 - August 31", deadline: "July 15", focus: "Exterior maintenance, AC check" },
      { season: "Fall", window: "September 1 - November 30", deadline: "October 15", focus: "Winterization, heating check", critical: true },
      { season: "Winter", window: "December 1 - February 28", deadline: "January 15", focus: "Snow/ice management, interior systems" }
    ]
  },
  "Southeast": {
    characteristics: "Hot, humid summers | Mild winters | Hurricane risk (coastal) | Key concerns: Humidity, mold, storm damage",
    inspections: [
      { season: "Spring", window: "March 1 - May 31", deadline: "April 15", focus: "Pre-storm season prep, AC prep" },
      { season: "Summer", window: "June 1 - August 31", deadline: "July 15", focus: "Hurricane prep, AC maintenance", critical: true },
      { season: "Fall", window: "September 1 - November 30", deadline: "October 15", focus: "Post-storm assessment, heating prep" },
      { season: "Winter", window: "December 1 - February 28", deadline: "January 15", focus: "Mild season maintenance, moisture control" }
    ]
  },
  "Midwest": {
    characteristics: "Extreme temperature swings | Cold winters, hot summers | Tornadoes | Key concerns: Freeze/thaw, humidity extremes",
    inspections: [
      { season: "Spring", window: "March 1 - May 31", deadline: "April 15", focus: "Winter damage, storm prep", critical: true },
      { season: "Summer", window: "June 1 - August 31", deadline: "July 15", focus: "Storm damage check, AC maintenance" },
      { season: "Fall", window: "September 1 - November 30", deadline: "October 15", focus: "Winterization, heating check" },
      { season: "Winter", window: "December 1 - February 28", deadline: "January 15", focus: "Snow/freeze management" }
    ]
  },
  "Southwest": {
    characteristics: "Hot, dry climate | Intense sun exposure | Monsoons (some areas) | Key concerns: UV damage, drought, heat stress",
    inspections: [
      { season: "Spring", window: "March 1 - May 31", deadline: "April 15", focus: "Pre-summer prep, AC check", critical: true },
      { season: "Summer", window: "June 1 - August 31", deadline: "July 15", focus: "Heat management, monsoon prep" },
      { season: "Fall", window: "September 1 - November 30", deadline: "October 15", focus: "Post-summer assessment" },
      { season: "Winter", window: "December 1 - February 28", deadline: "January 15", focus: "Mild season maintenance" }
    ]
  },
  "Mountain West": {
    characteristics: "High elevation | Cold winters, heavy snow | Dry air | Key concerns: Snow load, altitude effects, freeze damage",
    inspections: [
      { season: "Spring", window: "March 1 - May 31", deadline: "April 15", focus: "Snow damage assessment, runoff management" },
      { season: "Summer", window: "June 1 - August 31", deadline: "July 15", focus: "Exterior work season" },
      { season: "Fall", window: "September 1 - November 30", deadline: "October 15", focus: "Heavy winterization, heating check", critical: true },
      { season: "Winter", window: "December 1 - February 28", deadline: "January 15", focus: "Snow management, freeze protection" }
    ]
  }
};

export default function PropertyWizardStep3({ data, onChange, onNext, onBack }) {
  const [formData, setFormData] = React.useState({
    climate_zone: data.climate_zone || "Pacific Northwest"
  });

  const updateField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleNext = () => {
    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  const climateInfo = CLIMATE_ZONES[formData.climate_zone];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
          Add New Property - Step 3 of 4
        </h2>
        <p className="text-gray-600 mb-4">
          Property: {data.street_address}, {data.city}, {data.state}<br />
          Type: {data.property_type}, {data.door_count} door{data.door_count > 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Climate Zone */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#28A745' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6" style={{ color: '#28A745' }} />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              CLIMATE ZONE
            </h3>
          </div>

          <p className="text-gray-700 mb-4">
            Based on your ZIP code ({data.zip_code}), we've detected:
          </p>

          <div>
            <Label className="font-semibold">Climate Zone</Label>
            <Select
              value={formData.climate_zone}
              onValueChange={(value) => updateField('climate_zone', value)}
            >
              <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.keys(CLIMATE_ZONES).map((zone) => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {climateInfo && (
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Region characteristics:
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {climateInfo.characteristics}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Seasonal Inspection Schedule */}
      {climateInfo && (
        <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#FF6B35' }}>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              📅 SEASONAL INSPECTION SCHEDULE
            </h3>

            <p className="text-gray-700 mb-4">
              Based on {formData.climate_zone} climate, your recommended inspection schedule:
            </p>

            <div className="space-y-4">
              {climateInfo.inspections.map((inspection) => (
                <Card
                  key={inspection.season}
                  className={`border-2 ${inspection.critical ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${inspection.critical ? 'text-red-600' : 'text-green-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-bold mb-1" style={{ color: '#1B365D' }}>
                          {inspection.season} Inspection {inspection.critical && '(MOST CRITICAL)'}
                        </h4>
                        <p className="text-sm text-gray-700">
                          <strong>Window:</strong> {inspection.window}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Complete by:</strong> {inspection.deadline}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Focus:</strong> {inspection.focus}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-4">
              We'll remind you before each inspection window opens.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Systems Overview */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#1B365D' }}>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
            🏠 SYSTEMS IN YOUR HOME
          </h3>

          <p className="text-gray-700 mb-4">
            After saving this property, you'll document your home's systems in the AWARE → Baseline phase.
          </p>

          <p className="text-gray-700 mb-4">
            Your property type ({data.property_type}) typically has these systems:
          </p>

          <div className="space-y-4">
            <div>
              <p className="font-bold mb-2" style={{ color: '#DC3545' }}>
                REQUIRED (Must document 4 of 6 to unlock features):
              </p>
              <div className="space-y-2">
                {[
                  "HVAC System(s) - Heating and cooling",
                  "Plumbing - Water heater, supply lines",
                  "Electrical - Main panel, outlets",
                  "Roof - Covering and structure",
                  "Foundation - Basement and structure",
                  "Water/Sewer - Main lines, septic/sewer"
                ].map((system) => (
                  <div key={system} className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{system}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold mb-2" style={{ color: '#28A745' }}>
                RECOMMENDED (Complete for full protection):
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  "Exterior Siding",
                  "Windows & Doors",
                  "Gutters & Downspouts",
                  "Landscaping & Grading",
                  "Major Appliances",
                  "Attic & Insulation",
                  "Basement/Crawlspace",
                  "Garage & Door",
                  "Safety Systems"
                ].map((system) => (
                  <div key={system} className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{system}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="mt-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                💡 Many homes have MULTIPLE of some systems:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Two-story homes often have 2 HVAC zones</li>
                <li>• Some homes have 2+ water heaters</li>
                <li>• Additions may have separate systems</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                You'll be able to add multiple instances of any system during baseline documentation.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="flex-1"
          style={{ minHeight: '56px' }}
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1"
          style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
        >
          Next: Ownership Info →
        </Button>
      </div>
    </div>
  );
}
