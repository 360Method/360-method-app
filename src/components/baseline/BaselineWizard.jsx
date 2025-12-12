import React from "react";
import { SystemBaseline, storage, integrations } from "@/api/supabaseClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Upload, Camera, Zap, X, AlertCircle, MapPin, Eye, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { getSystemMetadata } from "./systemMetadata";

const QUICK_START_SYSTEMS = [
  {
    id: 'hvac',
    type: 'HVAC System',
    why: 'Failed HVAC = $8K+ emergency replacement',
    fields: ['installation_year', 'brand_model'],
    photoTips: ['The whole unit', 'Data plate/sticker', 'Brand logo', 'Yellow energy label']
  },
  {
    id: 'water_heater',
    type: 'Plumbing System',
    why: 'Water heater failure = home flood + $15K damage',
    fields: ['water_heater_year', 'water_heater_type'],
    photoTips: ['The whole tank', 'Rating plate', 'Top connections', 'Brand sticker']
  },
  {
    id: 'roof',
    type: 'Roof System',
    why: 'Small roof leak = $30K+ disaster in mold and structure',
    fields: ['installation_year', 'material_type'],
    photoTips: ['Overview of roof', 'Close-up of shingles', 'Problem areas', 'Vents & flashing']
  },
  {
    id: 'electrical',
    type: 'Electrical System',
    why: 'Faulty wiring = house fire = total loss',
    fields: ['panel_capacity', 'wiring_type'],
    photoTips: ['Panel door open', 'Main breaker', 'Panel label', 'Any date stickers']
  }
];

// System-specific AI prompts for comprehensive photo analysis
const AI_PROMPTS = {
  hvac: `You are analyzing a photo of an HVAC system (furnace, AC unit, or air handler).

Look for ANY of these:
1. Data plate/sticker with brand name, model number, serial number
2. The unit itself - identify brand from logo/design (Carrier, Trane, Lennox, Rheem, Goodman, Bryant, York, Amana, etc.)
3. Installation date stickers (often on side panel)
4. Energy rating labels (yellow EnergyGuide)
5. Service stickers from HVAC companies (may show install/service dates)

From the serial number, try to decode the manufacture year:
- Carrier/Bryant: 1st two digits = week, next two = year (e.g., 2519 = week 25, 2019)
- Trane/American Standard: First digit 0-9 = 2010-2019, then letters A-L = 2020-2031
- Lennox: First two digits = year
- Rheem: First two digits = year after 2000
- Goodman: First two digits = year

Return JSON with:
- brand: string (brand name you can identify)
- model: string (model number if visible)
- year: string (4-digit year, installation/manufacture year, best guess)
- serial: string (serial number if visible)
- notes: string (anything else useful - condition observations, type of unit, etc.)

If you can't see something clearly, leave it as empty string. Better to be accurate than guess.`,

  water_heater: `You are analyzing a photo of a water heater.

Identify:
1. Type: Tank (tall cylinder) vs Tankless (small wall box)
2. Fuel: Gas (has flue pipe/vent on top, gas line) vs Electric (no vent, electrical wires)
3. Brand from logo (Rheem, A.O. Smith, Bradford White, Rinnai, State, Whirlpool, GE, etc.)
4. Capacity from sticker (gallons)
5. Data plate info (model, serial, date)

Serial number date codes:
- Rheem: First 4 digits = MMYY (e.g., 0721 = July 2021)
- A.O. Smith: First letter = year (A=2005, B=2006... N=2018, P=2019, R=2020, etc.)
- Bradford White: First 2 letters = year and month
- State: Similar to A.O. Smith

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- type: string (one of: tank_gas, tank_electric, tankless_gas, tankless_electric, heat_pump)
- capacity: string (e.g., "50" for 50 gallons, or "tankless")
- fuel_source: string (natural_gas, propane, electric)
- notes: string (condition, any concerns visible)

Be accurate - leave as empty string if unsure.`,

  roof: `You are analyzing a photo of a roof.

Identify:
1. Material type:
   - Asphalt shingles (most common, layered rectangular pieces) = "asphalt_architectural"
   - Metal (standing seam panels or corrugated) = "metal"
   - Tile (curved clay/concrete pieces) = "tile"
   - Slate (flat stone pieces) = "slate"
   - Wood shake (wooden shingles) = "wood"
   - Flat/membrane (rubber or tar, usually commercial/modern) = "flat"

2. Condition observations:
   - Missing/damaged shingles
   - Curling or buckling
   - Moss/algae growth
   - Visible wear patterns
   - Flashing condition around vents/chimney

3. Age estimation based on wear:
   - New (0-5 years): crisp edges, consistent color
   - Mid-life (5-15 years): some weathering, slight curling
   - Aging (15-25 years): significant wear, granule loss
   - End of life (25+ years): major curling, missing pieces

Return JSON with:
- material_type: string (asphalt_architectural, metal, tile, slate, wood, flat)
- year: string (4-digit estimated install year based on condition - subtract age from current year 2024)
- condition: string (excellent, good, fair, poor)
- notes: string (specific observations about condition)

This helps homeowners know when to plan for replacement.`,

  electrical: `You are analyzing a photo of an electrical panel or wiring.

Identify:
1. Panel brand (Square D, Siemens, GE, Eaton/Cutler-Hammer, Murray, Federal Pacific, Zinsco)
2. Main breaker amperage (look for large breaker at top, usually 100, 150, or 200 amp)
3. Panel age (date stickers, or estimate from brand/style)
4. Any safety concerns:
   - Federal Pacific or Zinsco panels (known fire hazards - flag immediately!)
   - Double-tapped breakers (two wires on one breaker)
   - Rust or corrosion
   - Missing knockouts

If showing wiring:
- Copper (orange/brown color) = modern, safe = "copper"
- Aluminum (silver color) = 1960s-70s, needs monitoring = "aluminum"
- Cloth-wrapped (fabric covering) = very old, may be knob & tube = "knob_tube"

Return JSON with:
- brand: string (panel manufacturer)
- panel_capacity: string (just the number: 60, 100, 150, 200, or 400)
- year: string (4-digit panel install year if visible)
- wiring_type: string (copper, aluminum, knob_tube, mixed)
- safety_concerns: string (any red flags observed - especially mention Federal Pacific or Zinsco!)
- notes: string (general observations)

IMPORTANT: Flag any Federal Pacific or Zinsco panels as URGENT safety concern in safety_concerns field.`
};

// Encouragement messages after each step
const ENCOURAGEMENT_MESSAGES = [
  "Great start! 3 more systems to go. 💪",
  "Halfway there! You're doing amazing! 🎯",
  "Almost done! Just one more system! 🏃",
  "You did it! Your home is now protected! 🏠🎉"
];

export default function BaselineWizard({ propertyId, property, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState({});
  const [photos, setPhotos] = React.useState({});
  const [uploading, setUploading] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);

  const queryClient = useQueryClient();

  // Fetch existing systems to check what's already documented
  const { data: existingSystems = [] } = useQuery({
    queryKey: ['systemBaselines', propertyId],
    queryFn: () => SystemBaseline.filter({ property_id: propertyId }),
    enabled: !!propertyId,
  });

  const createSystemMutation = useMutation({
    mutationFn: async (data) => {
      return SystemBaseline.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] }); // Also invalidate general query
    },
  });

  const currentSystem = QUICK_START_SYSTEMS[currentStep];
  const currentMetadata = getSystemMetadata(currentSystem.type);
  const isLastStep = currentStep === QUICK_START_SYSTEMS.length - 1;
  const progress = ((currentStep + 1) / QUICK_START_SYSTEMS.length) * 100;

  // Check if current system is already documented
  const existingSystemsForType = existingSystems.filter(s => s.system_type === currentSystem.type);
  const alreadyDocumented = existingSystemsForType.length > 0;

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadToast = toast.loading('Uploading photos...', { icon: '📸' });

    try {
      const uploadPromises = files.map(file => storage.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setPhotos(prev => ({
        ...prev,
        [currentSystem.id]: [...(prev[currentSystem.id] || []), ...urls]
      }));

      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded!`, {
        id: uploadToast,
        icon: '✅',
        duration: 2000
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.', {
        id: uploadToast,
        duration: 3000
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSmartScan = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setScanning(true);
    const scanToast = toast.loading(
      files.length > 1
        ? `🤖 AI analyzing ${files.length} photos...`
        : '🤖 AI analyzing your photo...',
      { icon: '🔍' }
    );

    try {
      // Upload all photos
      const uploadPromises = files.map(file => storage.uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises);
      const file_urls = uploadResults.map(r => r.file_url);

      // Get system-specific prompt
      const prompt = AI_PROMPTS[currentSystem.id];

      // Build system-specific JSON schema
      let response_json_schema;
      if (currentSystem.id === 'hvac') {
        response_json_schema = {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            year: { type: "string" },
            serial: { type: "string" },
            notes: { type: "string" }
          }
        };
      } else if (currentSystem.id === 'water_heater') {
        response_json_schema = {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            year: { type: "string" },
            type: { type: "string" },
            capacity: { type: "string" },
            fuel_source: { type: "string" },
            notes: { type: "string" }
          }
        };
      } else if (currentSystem.id === 'roof') {
        response_json_schema = {
          type: "object",
          properties: {
            material_type: { type: "string" },
            year: { type: "string" },
            condition: { type: "string" },
            notes: { type: "string" }
          }
        };
      } else if (currentSystem.id === 'electrical') {
        response_json_schema = {
          type: "object",
          properties: {
            brand: { type: "string" },
            panel_capacity: { type: "string" },
            year: { type: "string" },
            wiring_type: { type: "string" },
            safety_concerns: { type: "string" },
            notes: { type: "string" }
          }
        };
      }

      const result = await integrations.InvokeLLM({
        prompt,
        file_urls: files.length === 1 ? file_urls[0] : file_urls,
        response_json_schema
      });

      if (result) {
        const updates = {};

        // Process results based on system type
        if (currentSystem.id === 'hvac') {
          if (result.brand || result.model) {
            updates.brand_model = [result.brand, result.model].filter(Boolean).join(' ');
          }
          if (result.year) {
            const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
            if (yearMatch) updates.installation_year = yearMatch[0];
          }
        } else if (currentSystem.id === 'water_heater') {
          if (result.brand || result.model) {
            updates.brand_model = [result.brand, result.model].filter(Boolean).join(' ');
          }
          if (result.year) {
            const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
            if (yearMatch) updates.water_heater_year = yearMatch[0];
          }
          if (result.type) updates.water_heater_type = result.type;
          if (result.capacity) {
            // Map to dropdown values
            const cap = parseInt(result.capacity);
            if (cap <= 30) updates.capacity = '30_gal';
            else if (cap <= 40) updates.capacity = '40_gal';
            else if (cap <= 50) updates.capacity = '50_gal';
            else if (cap <= 60) updates.capacity = '60_gal';
            else if (cap <= 75) updates.capacity = '75_gal';
            else updates.capacity = '80_gal';
          }
          if (result.fuel_source) updates.fuel_source = result.fuel_source;
        } else if (currentSystem.id === 'roof') {
          if (result.material_type) updates.material_type = result.material_type;
          if (result.year) {
            const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
            if (yearMatch) updates.installation_year = yearMatch[0];
          }
          if (result.condition) updates.condition = result.condition;
        } else if (currentSystem.id === 'electrical') {
          if (result.panel_capacity) updates.panel_capacity = result.panel_capacity;
          if (result.wiring_type) updates.wiring_type = result.wiring_type;
          if (result.year) {
            const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
            if (yearMatch) updates.panel_year = yearMatch[0];
          }
          // Check for safety concerns and alert user
          if (result.safety_concerns && result.safety_concerns.toLowerCase().includes('federal pacific')) {
            toast.error('⚠️ SAFETY ALERT: Federal Pacific panel detected! These are known fire hazards. Please consult an electrician.', {
              duration: 10000
            });
          } else if (result.safety_concerns && result.safety_concerns.toLowerCase().includes('zinsco')) {
            toast.error('⚠️ SAFETY ALERT: Zinsco panel detected! These are known fire hazards. Please consult an electrician.', {
              duration: 10000
            });
          }
        }

        setFormData(prev => ({
          ...prev,
          [currentSystem.id]: {
            ...prev[currentSystem.id],
            ...updates
          }
        }));

        // Add all uploaded photos
        setPhotos(prev => ({
          ...prev,
          [currentSystem.id]: [...(prev[currentSystem.id] || []), ...file_urls]
        }));

        // Build success message based on what was found
        const foundItems = Object.keys(updates).filter(k => updates[k]);
        if (foundItems.length > 0) {
          toast.success(
            <div>
              <p className="font-bold">✨ Data extracted!</p>
              <p className="text-sm">Found: {foundItems.length} details. Review and adjust as needed.</p>
            </div>,
            { id: scanToast, duration: 4000 }
          );
        } else {
          toast.info('Photo uploaded! We couldn\'t find specific data - please enter details manually.', {
            id: scanToast,
            duration: 4000
          });
        }

        // Show any notes from AI
        if (result.notes && result.notes.trim()) {
          setTimeout(() => {
            toast.info(`📝 AI Note: ${result.notes}`, { duration: 5000 });
          }, 500);
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Scanning failed. Please enter details manually.', {
        id: scanToast,
        duration: 3000
      });
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const handleNext = async () => {
    const systemData = formData[currentSystem.id] || {};
    
    // Only create if user entered some data AND system isn't already documented
    if (!alreadyDocumented && (Object.keys(systemData).length > 0 || (photos[currentSystem.id] || []).length > 0)) {
      const baseData = {
        property_id: propertyId,
        system_type: currentSystem.type,
        photo_urls: photos[currentSystem.id] || [],
        condition: 'Good'
      };

      // Helper to parse year - returns null for 'unknown' or invalid values
      const parseYear = (val) => {
        if (!val || val === 'unknown') return null;
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
      };

      // Helper to filter out 'unknown' values from key_components
      const cleanValue = (val) => (val && val !== 'unknown') ? val : '';

      // Map wizard fields to system baseline fields
      if (currentSystem.id === 'hvac') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseYear(systemData.installation_year),
          brand_model: systemData.brand_model || ''
        });
      } else if (currentSystem.id === 'water_heater') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseYear(systemData.water_heater_year),
          key_components: {
            water_heater_type: cleanValue(systemData.water_heater_type),
            capacity: cleanValue(systemData.capacity),
            fuel_source: cleanValue(systemData.fuel_source)
          }
        });
      } else if (currentSystem.id === 'roof') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseYear(systemData.installation_year),
          key_components: {
            material_type: cleanValue(systemData.material_type)
          }
        });
      } else if (currentSystem.id === 'electrical') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseYear(systemData.panel_year),
          key_components: {
            panel_capacity: cleanValue(systemData.panel_capacity),
            wiring_type: cleanValue(systemData.wiring_type)
          }
        });
      }
    }

    if (isLastStep) {
      // Final celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const systemsDocumented = existingSystems.length +
        QUICK_START_SYSTEMS.filter((sys, idx) => idx <= currentStep && !existingSystems.some(es => es.system_type === sys.type)).length;

      toast.success(
        <div>
          <p className="font-bold text-lg">🎉 Amazing! You did it!</p>
          <p className="text-sm mt-1">{systemsDocumented} critical systems documented. Your home is now protected!</p>
        </div>,
        { id: 'wizard-complete', duration: 5000 }
      );

      onComplete();
    } else {
      // Mini celebration between steps
      const encouragement = ENCOURAGEMENT_MESSAGES[currentStep];

      // Use unique toast ID to prevent duplicate toasts
      toast.success(
        <div>
          <p className="font-bold">✅ {currentSystem.type} done!</p>
          <p className="text-sm">{encouragement}</p>
        </div>,
        { id: `step-complete-${currentStep}`, duration: 3000 }
      );

      // Small confetti burst for mid-step celebrations
      if (currentStep === 1) {
        // Halfway celebration - extra confetti!
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 }
        });
      }

      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkipStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const removePhoto = (photoUrl) => {
    setPhotos(prev => ({
      ...prev,
      [currentSystem.id]: (prev[currentSystem.id] || []).filter(url => url !== photoUrl)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Wizard
        </Button>

        <Card className="border-2 border-purple-300 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Quick Start Wizard
                </CardTitle>
                <p className="text-purple-100 mt-1">
                  Step {currentStep + 1} of {QUICK_START_SYSTEMS.length}: {currentSystem.type}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{Math.round(progress)}%</div>
                <div className="text-xs text-purple-200">Complete</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-2 bg-purple-200" />
          </CardHeader>
          <CardContent className="p-6">
            {/* Already Documented Alert */}
            {alreadyDocumented && (
              <Card className="border-2 border-green-300 bg-green-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-1">✅ Already Documented!</h3>
                      <p className="text-sm text-green-800 mb-2">
                        You already have {existingSystemsForType.length} {currentSystem.type} documented:
                      </p>
                      <ul className="text-sm text-green-800 space-y-1">
                        {existingSystemsForType.map((sys, idx) => (
                          <li key={idx}>
                            • {sys.nickname || sys.brand_model || `${currentSystem.type} #${idx + 1}`}
                            {sys.installation_year && ` (${new Date().getFullYear() - sys.installation_year} years old)`}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-green-700 mt-2 italic">
                        Skip to next system or exit to view all your documented systems
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{currentMetadata.emoji}</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
                {currentSystem.type}
              </h2>
              
              {/* Location & Visual Helper */}
              <Card className="border-2 border-blue-300 bg-blue-50 mb-4 text-left">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-900">Where to find it: </span>
                      <span className="text-gray-700">{currentMetadata.whereToFind}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Eye className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-green-900">What to look for: </span>
                      <span className="text-gray-700">{currentMetadata.visualCues}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 mb-4">
                <p className="text-sm font-semibold text-orange-900">
                  ⚠️ {currentSystem.why}
                </p>
              </div>
            </div>

            {/* Photo Guide */}
            <Card className="border-2 border-gray-200 bg-gray-50 mb-4">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gray-600" />
                  📸 What to photograph:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                  {currentSystem.photoTips.map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <span className="text-green-500">✓</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  💡 <strong>Tip:</strong> Any photo works! Our AI can identify your equipment from the whole unit, a logo, data plate, or energy label. Take multiple photos for best results!
                </p>
              </CardContent>
            </Card>

            {/* Smart Scan Option */}
            <Card className="border-2 border-green-300 bg-green-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-bold text-green-900">✨ AI Smart Scan (Easiest!)</h3>
                    <p className="text-xs text-green-800">Take 1-3 photos - our AI will identify your equipment automatically</p>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleSmartScan}
                    className="hidden"
                    disabled={scanning}
                  />
                  <Button
                    type="button"
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    style={{ minHeight: '56px', fontSize: '16px' }}
                    disabled={scanning}
                    asChild
                  >
                    <span>
                      {scanning ? (
                        <>
                          <span className="animate-spin">🔍</span>
                          AI is analyzing your photo...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          📸 Take Photo & Auto-Fill
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-center text-green-700 mt-2">
                  Works with ANY photo - data plate, whole unit, or brand logo!
                </p>
              </CardContent>
            </Card>

            {/* Manual Entry Fields */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <HelpCircle className="w-4 h-4" />
                <h3 className="font-semibold">Or enter details below:</h3>
              </div>

              {currentSystem.id === 'hvac' && (
                <>
                  <div>
                    <Label className="text-base font-medium">When was it installed?</Label>
                    <p className="text-xs text-gray-500 mb-2">Approximate year is fine! Check the data plate or ask when you moved in.</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g., 2015"
                        value={formData[currentSystem.id]?.installation_year || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            installation_year: e.target.value
                          }
                        }))}
                        className="flex-1"
                        style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            installation_year: 'unknown'
                          }
                        }))}
                        className={`whitespace-nowrap ${formData[currentSystem.id]?.installation_year === 'unknown' ? 'bg-gray-100 border-gray-400' : ''}`}
                        style={{ minHeight: '48px' }}
                      >
                        🤷 Not sure
                      </Button>
                    </div>
                    {formData[currentSystem.id]?.installation_year === 'unknown' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800">💡 That's okay! Here's how to find out:</p>
                        <ul className="list-disc ml-4 mt-1 text-yellow-700 space-y-1">
                          <li>Check for a sticker on the side of the unit</li>
                          <li>Look at the serial number - first 2-4 digits often show the year</li>
                          <li>Ask your HVAC tech next time they visit</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium">What brand is it?</Label>
                    <p className="text-xs text-gray-500 mb-2">Look for the logo on the front of the unit (Carrier, Trane, Lennox, Rheem, etc.)</p>
                    <Input
                      placeholder="e.g., Carrier, Trane, Lennox"
                      value={formData[currentSystem.id]?.brand_model || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          brand_model: e.target.value
                        }
                      }))}
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                </>
              )}

              {currentSystem.id === 'water_heater' && (
                <>
                  <div>
                    <Label className="text-base font-medium">When was it installed?</Label>
                    <p className="text-xs text-gray-500 mb-2">Water heaters typically last 8-12 years. Check the rating plate for a date.</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g., 2018"
                        value={formData[currentSystem.id]?.water_heater_year || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            water_heater_year: e.target.value
                          }
                        }))}
                        className="flex-1"
                        style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            water_heater_year: 'unknown'
                          }
                        }))}
                        className={`whitespace-nowrap ${formData[currentSystem.id]?.water_heater_year === 'unknown' ? 'bg-gray-100 border-gray-400' : ''}`}
                        style={{ minHeight: '48px' }}
                      >
                        🤷 Not sure
                      </Button>
                    </div>
                    {formData[currentSystem.id]?.water_heater_year === 'unknown' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800">💡 That's okay! Here's how to find out:</p>
                        <ul className="list-disc ml-4 mt-1 text-yellow-700 space-y-1">
                          <li>Look for a sticker on the side with the manufacture date</li>
                          <li>Check the serial number - usually first 4 digits = month/year</li>
                          <li>If it came with the house, check closing documents</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium">What type of water heater do you have?</Label>
                    <p className="text-xs text-gray-500 mb-2">Select the option that best describes your unit.</p>
                    <select
                      value={formData[currentSystem.id]?.water_heater_type || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          water_heater_type: e.target.value
                        }
                      }))}
                      className="w-full p-3 border rounded"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Tap to select...</option>
                      <option value="tank_gas">🔥 Big tank with gas (most common)</option>
                      <option value="tank_electric">⚡ Big tank with electricity</option>
                      <option value="tankless_gas">🔥 Small wall unit, no tank (tankless gas)</option>
                      <option value="tankless_electric">⚡ Small wall unit, no tank (tankless electric)</option>
                      <option value="heat_pump">🌡️ Tank with fan on top (heat pump)</option>
                      <option value="indirect">🏠 Connected to boiler (indirect)</option>
                      <option value="unknown">🤷 I'm not sure</option>
                    </select>
                    {formData[currentSystem.id]?.water_heater_type === 'unknown' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800">💡 Here's how to tell:</p>
                        <ul className="list-disc ml-4 mt-1 text-yellow-700 space-y-1">
                          <li><strong>Tall cylinder = Tank</strong> (most homes have this)</li>
                          <li><strong>Small box on wall = Tankless</strong></li>
                          <li><strong>Gas line going to it = Gas</strong>, no gas line = Electric</li>
                          <li><strong>Fan on top = Heat pump</strong> (looks like AC on a tank)</li>
                        </ul>
                      </div>
                    )}
                    {formData[currentSystem.id]?.water_heater_type && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                        {formData[currentSystem.id]?.water_heater_type === 'tank_gas' && (
                          <p>💡 <strong>Tank Gas:</strong> Standard cylinder with gas burner underneath. Look for: tall cylindrical tank (40-80 gallons), gas line connection, flue pipe for exhaust. Lifespan: 8-12 years.</p>
                        )}
                        {formData[currentSystem.id]?.water_heater_type === 'tank_electric' && (
                          <p>💡 <strong>Tank Electric:</strong> Similar cylinder but with electric elements inside. Look for: tall tank, no gas line, electrical connections at top. Lifespan: 10-15 years.</p>
                        )}
                        {formData[currentSystem.id]?.water_heater_type === 'tankless_gas' && (
                          <p>💡 <strong>Tankless Gas:</strong> Small wall-mounted unit that heats water on demand. Look for: compact box on wall, gas line, no storage tank. Lifespan: 15-20 years.</p>
                        )}
                        {formData[currentSystem.id]?.water_heater_type === 'tankless_electric' && (
                          <p>💡 <strong>Tankless Electric:</strong> Compact unit that heats water as it flows through. Look for: small wall box, electrical connection, no tank. Lifespan: 15-20 years.</p>
                        )}
                        {formData[currentSystem.id]?.water_heater_type === 'heat_pump' && (
                          <p>💡 <strong>Heat Pump:</strong> Tall unit with fan on top that uses electricity to move heat. Look for: tall cylinder with fan/compressor on top, looks like AC unit on tank. 3x more efficient than standard electric. Lifespan: 10-15 years.</p>
                        )}
                        {formData[currentSystem.id]?.water_heater_type === 'indirect' && (
                          <p>💡 <strong>Indirect:</strong> Storage tank connected to your boiler system. Look for: insulated storage tank, connections to boiler, no burner or heating element. Lifespan: 15-20 years.</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium">How big is the tank? (Optional)</Label>
                    <p className="text-xs text-gray-500 mb-2">Check the sticker on your tank - it shows the gallon capacity.</p>
                    <select
                      value={formData[currentSystem.id]?.capacity || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          capacity: e.target.value
                        }
                      }))}
                      className="w-full p-3 border rounded"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Tap to select...</option>
                      <option value="30_gal">30 gallons (small - 1-2 people)</option>
                      <option value="40_gal">40 gallons (medium - 2-3 people)</option>
                      <option value="50_gal">50 gallons (standard - 3-4 people)</option>
                      <option value="60_gal">60 gallons (large - 4-5 people)</option>
                      <option value="75_gal">75 gallons (extra large - 5-6 people)</option>
                      <option value="80_gal">80+ gallons (very large - 6+ people)</option>
                      <option value="tankless">Tankless (no tank)</option>
                      <option value="unknown">🤷 Skip for now</option>
                    </select>
                  </div>
                </>
              )}

              {currentSystem.id === 'roof' && (
                <>
                  <div>
                    <Label className="text-base font-medium">When was the roof installed?</Label>
                    <p className="text-xs text-gray-500 mb-2">Check home purchase documents or ask your realtor. Even a rough estimate helps!</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g., 2010"
                        value={formData[currentSystem.id]?.installation_year || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            installation_year: e.target.value
                          }
                        }))}
                        className="flex-1"
                        style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            installation_year: 'unknown'
                          }
                        }))}
                        className={`whitespace-nowrap ${formData[currentSystem.id]?.installation_year === 'unknown' ? 'bg-gray-100 border-gray-400' : ''}`}
                        style={{ minHeight: '48px' }}
                      >
                        🤷 Not sure
                      </Button>
                    </div>
                    {formData[currentSystem.id]?.installation_year === 'unknown' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800">💡 That's okay! Here's how to estimate:</p>
                        <ul className="list-disc ml-4 mt-1 text-yellow-700 space-y-1">
                          <li>Check your home inspection report from purchase</li>
                          <li>Look at closing documents - roof age is often listed</li>
                          <li>Ask neighbors if the whole street was done together</li>
                          <li>Condition can hint at age (our AI can help estimate!)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium">What material is your roof?</Label>
                    <p className="text-xs text-gray-500 mb-2">Look at your roof from the outside - what do the shingles/tiles look like?</p>
                    <select
                      value={formData[currentSystem.id]?.material_type || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          material_type: e.target.value
                        }
                      }))}
                      className="w-full p-3 border rounded"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Tap to select...</option>
                      <option value="asphalt_architectural">🏠 Asphalt Shingles (most common, layered rectangles)</option>
                      <option value="metal">🔩 Metal (flat panels or corrugated)</option>
                      <option value="tile">🧱 Tile (curved clay or concrete)</option>
                      <option value="slate">🪨 Slate (flat stone pieces)</option>
                      <option value="wood">🪵 Wood Shake (wooden shingles)</option>
                      <option value="flat">📦 Flat/Rubber (commercial style)</option>
                      <option value="unknown">🤷 I'm not sure</option>
                    </select>
                    {formData[currentSystem.id]?.material_type === 'unknown' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800">💡 Here's how to identify your roof:</p>
                        <ul className="list-disc ml-4 mt-1 text-yellow-700 space-y-1">
                          <li><strong>Asphalt:</strong> Layered rectangles, most homes have this</li>
                          <li><strong>Metal:</strong> Shiny flat panels or wavy sheets</li>
                          <li><strong>Tile:</strong> Curved pieces like Spanish/Mediterranean style</li>
                          <li><strong>Take a photo!</strong> Our AI can identify it for you</li>
                        </ul>
                      </div>
                    )}
                    {formData[currentSystem.id]?.material_type && formData[currentSystem.id]?.material_type !== 'unknown' && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                        {formData[currentSystem.id]?.material_type === 'asphalt_architectural' && (
                          <p>📋 <strong>Asphalt Shingles:</strong> The most common roofing material. Expected lifespan: 20-30 years. Look for: curling, missing granules, or dark spots which indicate aging.</p>
                        )}
                        {formData[currentSystem.id]?.material_type === 'metal' && (
                          <p>📋 <strong>Metal Roofing:</strong> Durable and long-lasting. Expected lifespan: 40-70 years. Watch for: rust spots, loose fasteners, or dents from hail.</p>
                        )}
                        {formData[currentSystem.id]?.material_type === 'tile' && (
                          <p>📋 <strong>Tile Roofing:</strong> Very durable clay or concrete. Expected lifespan: 50-100 years. Check for: cracked or broken tiles, especially after storms.</p>
                        )}
                        {formData[currentSystem.id]?.material_type === 'slate' && (
                          <p>📋 <strong>Slate Roofing:</strong> Premium natural stone, extremely durable. Expected lifespan: 75-200 years. Watch for: cracked or sliding tiles, rusted flashing.</p>
                        )}
                        {formData[currentSystem.id]?.material_type === 'wood' && (
                          <p>📋 <strong>Wood Shake:</strong> Natural cedar or redwood. Expected lifespan: 25-30 years. Check for: rot, moss growth, split shingles, or fire rating requirements in your area.</p>
                        )}
                        {formData[currentSystem.id]?.material_type === 'flat' && (
                          <p>📋 <strong>Flat/Membrane:</strong> Rubber (EPDM), TPO, or built-up roofing. Expected lifespan: 15-25 years. Watch for: pooling water, bubbles, or cracks in the membrane.</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentSystem.id === 'electrical' && (
                <>
                  <div>
                    <Label className="text-base font-medium">How big is your electrical panel?</Label>
                    <p className="text-xs text-gray-500 mb-2">Look at the large breaker at the very top - it shows a number like "100", "150", or "200".</p>
                    <select
                      value={formData[currentSystem.id]?.panel_capacity || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          panel_capacity: e.target.value
                        }
                      }))}
                      className="w-full p-3 border rounded"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Tap to select...</option>
                      <option value="60">60 Amp (very old - likely needs upgrade)</option>
                      <option value="100">100 Amp (older home, smaller)</option>
                      <option value="150">150 Amp (modern, medium home)</option>
                      <option value="200">200 Amp (modern, most common)</option>
                      <option value="400">400 Amp (large home)</option>
                      <option value="unknown">🤷 I'm not sure</option>
                    </select>
                    {formData[currentSystem.id]?.panel_capacity === 'unknown' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800">💡 Here's how to find it:</p>
                        <ul className="list-disc ml-4 mt-1 text-yellow-700 space-y-1">
                          <li>Open your electrical panel door (gray metal box)</li>
                          <li>Look at the biggest breaker at the very top</li>
                          <li>It will say something like "100A" or "200A"</li>
                          <li>Take a photo and our AI can read it for you!</li>
                        </ul>
                      </div>
                    )}
                    {formData[currentSystem.id]?.panel_capacity && formData[currentSystem.id]?.panel_capacity !== 'unknown' && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                        {formData[currentSystem.id]?.panel_capacity === '60' && (
                          <p>⚠️ <strong>60 Amp:</strong> Found in very old homes (pre-1960s). Not sufficient for modern appliances. Likely needs upgrade soon. Cannot support central AC or electric heating.</p>
                        )}
                        {formData[currentSystem.id]?.panel_capacity === '100' && (
                          <p>💡 <strong>100 Amp:</strong> Common in older homes. Adequate for basic needs but may struggle with multiple large appliances running simultaneously (AC + dryer + oven). May need upgrade if adding electric vehicle or major appliances.</p>
                        )}
                        {formData[currentSystem.id]?.panel_capacity === '150' && (
                          <p>✅ <strong>150 Amp:</strong> Good for most modern homes. Can handle standard appliances, AC, and electric heating comfortably. May be tight if adding EV charger.</p>
                        )}
                        {formData[currentSystem.id]?.panel_capacity === '200' && (
                          <p>✅ <strong>200 Amp:</strong> Standard for modern homes. Plenty of capacity for all major appliances, AC, electric heating, and even an EV charger. Most common in homes built after 1990.</p>
                        )}
                        {formData[currentSystem.id]?.panel_capacity === '400' && (
                          <p>✅ <strong>400 Amp:</strong> Large capacity for big homes, multiple units, or homes with extensive electrical needs (workshop, multiple EVs, large HVAC systems).</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium">What type of wiring does your home have?</Label>
                    <p className="text-xs text-gray-500 mb-2">Hint: Your home's age is a good indicator! Most homes built after 1980 have copper.</p>
                    <select
                      value={formData[currentSystem.id]?.wiring_type || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          wiring_type: e.target.value
                        }
                      }))}
                      className="w-full p-3 border rounded"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Tap to select...</option>
                      <option value="copper">✅ Copper (1980s+ homes, orange wires)</option>
                      <option value="aluminum">⚠️ Aluminum (1960s-70s homes, silver wires)</option>
                      <option value="knob_tube">🚨 Knob & Tube (pre-1950s, cloth-wrapped)</option>
                      <option value="mixed">🤷 Mixed or unsure</option>
                    </select>
                    {formData[currentSystem.id]?.wiring_type && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                        {formData[currentSystem.id]?.wiring_type === 'copper' && (
                          <p>✅ <strong>Modern Copper:</strong> This is the current standard and safest option. Copper wiring with plastic insulation (Romex). Found in homes built or rewired after 1980s. No concerns - this is what you want.</p>
                        )}
                        {formData[currentSystem.id]?.wiring_type === 'aluminum' && (
                          <p>⚠️ <strong>Aluminum:</strong> Common in homes built 1965-1975 during copper shortage. Can be fire hazard at connections if not properly maintained. Look for: "AL" or "Aluminum" stamped on wires. Recommend inspection by electrician and special outlets/switches rated for aluminum.</p>
                        )}
                        {formData[currentSystem.id]?.wiring_type === 'knob_tube' && (
                          <p>🚨 <strong>Knob & Tube:</strong> Found in homes built before 1950. Cloth-wrapped wires running through ceramic knobs. NOT GROUNDED - cannot safely power modern appliances. Major fire and insurance risk. Most insurance companies won't cover homes with active knob & tube. Plan for full rewiring ($8K-$15K).</p>
                        )}
                        {formData[currentSystem.id]?.wiring_type === 'mixed' && (
                          <p>💡 <strong>Mixed/Unsure:</strong> Many older homes have been partially rewired over time. Recommend getting an electrician inspection to identify what wiring types you have and where. They can prioritize any needed upgrades.</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium">When was the panel installed? (Optional)</Label>
                    <p className="text-xs text-gray-500 mb-2">Check inside the panel door for a date sticker. If you don't know, you can skip this!</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g., 2010"
                        value={formData[currentSystem.id]?.panel_year || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            panel_year: e.target.value
                          }
                        }))}
                        className="flex-1"
                        style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          [currentSystem.id]: {
                            ...prev[currentSystem.id],
                            panel_year: ''
                          }
                        }))}
                        className="whitespace-nowrap"
                        style={{ minHeight: '48px' }}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <Label>Photos (Optional)</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoUpload}
                className="mb-3"
                disabled={uploading}
                style={{ minHeight: '48px' }}
              />
              {uploading && <p className="text-sm text-gray-600">Uploading...</p>}
              {(photos[currentSystem.id] || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos[currentSystem.id].map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-20 h-20 object-cover rounded border-2 border-white shadow" />
                      <button
                        type="button"
                        onClick={() => removePhoto(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleNext}
                className="w-full gap-2"
                style={{ backgroundColor: '#8B5CF6', minHeight: '56px', fontSize: '16px' }}
                disabled={createSystemMutation.isPending}
              >
                {createSystemMutation.isPending ? (
                  'Saving...'
                ) : alreadyDocumented ? (
                  isLastStep ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Finish Setup
                    </>
                  ) : (
                    <>
                      Skip to Next System
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )
                ) : isLastStep ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Finish Setup
                  </>
                ) : (
                  <>
                    Next System
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSkipStep}
                variant="ghost"
                className="w-full"
                style={{ minHeight: '48px' }}
              >
                {isLastStep ? 'Skip & Finish' : 'Skip This System'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            💡 You can always add more details later from the main baseline page
          </p>
        </div>
      </div>
    </div>
  );
}