import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Upload, Camera, Zap, X, AlertCircle, MapPin, Eye } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { getSystemMetadata } from "./systemMetadata";

const QUICK_START_SYSTEMS = [
  {
    id: 'hvac',
    type: 'HVAC System',
    why: 'Failed HVAC = $8K+ emergency replacement',
    fields: ['installation_year', 'brand_model']
  },
  {
    id: 'water_heater',
    type: 'Plumbing System',
    why: 'Water heater failure = home flood + $15K damage',
    fields: ['water_heater_year', 'water_heater_type']
  },
  {
    id: 'roof',
    type: 'Roof System',
    why: 'Small roof leak = $30K+ disaster in mold and structure',
    fields: ['installation_year', 'material_type']
  },
  {
    id: 'electrical',
    type: 'Electrical System',
    why: 'Faulty wiring = house fire = total loss',
    fields: ['panel_capacity', 'wiring_type']
  }
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
    queryFn: () => base44.entities.SystemBaseline.filter({ property_id: propertyId }),
    enabled: !!propertyId,
  });

  const createSystemMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.SystemBaseline.create(data);
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
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
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
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const scanToast = toast.loading('AI scanning...', { icon: '🤖' });

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract information from this ${currentSystem.type} photo. Look for model plates, serial numbers, installation dates, and any visible brand/model information. Return ONLY data you can clearly see.`,
        file_urls: file_url,
        response_json_schema: {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            year: { type: "string" },
            notes: { type: "string" }
          }
        }
      });

      if (result) {
        const updates = {};
        if (result.brand || result.model) {
          updates.brand_model = [result.brand, result.model].filter(Boolean).join(' ');
        }
        if (result.year) {
          const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
          if (yearMatch) {
            updates.installation_year = yearMatch[0];
          }
        }

        setFormData(prev => ({
          ...prev,
          [currentSystem.id]: {
            ...prev[currentSystem.id],
            ...updates
          }
        }));

        setPhotos(prev => ({
          ...prev,
          [currentSystem.id]: [...(prev[currentSystem.id] || []), file_url]
        }));

        toast.success('Data extracted! Review and adjust as needed.', {
          id: scanToast,
          icon: '✨',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Scanning failed. Please enter manually.', {
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
        condition: 'Good',
        is_required: true
      };

      // Map wizard fields to system baseline fields
      if (currentSystem.id === 'hvac') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseInt(systemData.installation_year) || null,
          brand_model: systemData.brand_model || ''
        });
      } else if (currentSystem.id === 'water_heater') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseInt(systemData.water_heater_year) || null,
          key_components: {
            water_heater_type: systemData.water_heater_type || '',
            capacity: systemData.capacity || '',
            fuel_source: systemData.fuel_source || ''
          }
        });
      } else if (currentSystem.id === 'roof') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseInt(systemData.installation_year) || null,
          key_components: {
            material_type: systemData.material_type || ''
          }
        });
      } else if (currentSystem.id === 'electrical') {
        await createSystemMutation.mutateAsync({
          ...baseData,
          installation_year: parseInt(systemData.panel_year) || null,
          key_components: {
            panel_capacity: systemData.panel_capacity || '',
            wiring_type: systemData.wiring_type || ''
          }
        });
      }
    }

    if (isLastStep) {
      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const systemsDocumented = existingSystems.length + 
        QUICK_START_SYSTEMS.filter((sys, idx) => idx <= currentStep && !existingSystems.some(es => es.system_type === sys.type)).length;

      toast.success('🎉 Baseline Started!', {
        description: `${systemsDocumented} critical systems documented. Great start! Continue adding more systems from the baseline page.`,
        duration: 5000
      });

      onComplete();
    } else {
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

            {/* Smart Scan Option */}
            <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-blue-900">⚡ Quick Scan</h3>
                    <p className="text-xs text-blue-800">Take a photo of the data plate - we'll extract the info</p>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleSmartScan}
                    className="hidden"
                    disabled={scanning}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-blue-400 bg-white hover:bg-blue-50"
                    disabled={scanning}
                    asChild
                  >
                    <span>
                      {scanning ? (
                        <>
                          <span className="animate-spin">⚙️</span>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          📸 Scan Data Plate
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </CardContent>
            </Card>

            {/* Manual Entry Fields */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Or enter manually:</h3>
              
              {currentSystem.id === 'hvac' && (
                <>
                  <div>
                    <Label>Installation Year</Label>
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
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  <div>
                    <Label>Brand/Model</Label>
                    <Input
                      placeholder="e.g., Carrier 58MVC"
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
                    <Label>Installation Year</Label>
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
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  <div>
                    <Label>Water Heater Type</Label>
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
                      <option value="">Select type...</option>
                      <option value="tank_gas">Tank - Gas (40-80 gallons, most common)</option>
                      <option value="tank_electric">Tank - Electric (40-80 gallons)</option>
                      <option value="tankless_gas">Tankless - Gas (on-demand, wall-mounted)</option>
                      <option value="tankless_electric">Tankless - Electric (on-demand, compact)</option>
                      <option value="heat_pump">Heat Pump (hybrid electric, energy efficient)</option>
                      <option value="indirect">Indirect (uses boiler for heating)</option>
                    </select>
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
                    <Label>Capacity (Optional)</Label>
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
                      <option value="">Select capacity...</option>
                      <option value="30_gal">30 gallons (1-2 people)</option>
                      <option value="40_gal">40 gallons (2-3 people)</option>
                      <option value="50_gal">50 gallons (3-4 people)</option>
                      <option value="60_gal">60 gallons (4-5 people)</option>
                      <option value="75_gal">75 gallons (5-6 people)</option>
                      <option value="80_gal">80+ gallons (6+ people)</option>
                      <option value="tankless">Tankless (varies)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Fuel/Energy Source (Optional)</Label>
                    <select
                      value={formData[currentSystem.id]?.fuel_source || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [currentSystem.id]: {
                          ...prev[currentSystem.id],
                          fuel_source: e.target.value
                        }
                      }))}
                      className="w-full p-3 border rounded"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Select fuel source...</option>
                      <option value="natural_gas">Natural Gas</option>
                      <option value="propane">Propane (LP)</option>
                      <option value="electric">Electric</option>
                      <option value="oil">Oil</option>
                      <option value="solar">Solar</option>
                    </select>
                  </div>
                </>
              )}

              {currentSystem.id === 'roof' && (
                <>
                  <div>
                    <Label>Installation Year</Label>
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
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  <div>
                    <Label>Material</Label>
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
                      <option value="">Select material...</option>
                      <option value="asphalt_architectural">Asphalt Shingles</option>
                      <option value="metal">Metal</option>
                      <option value="tile">Tile</option>
                      <option value="slate">Slate</option>
                    </select>
                  </div>
                </>
              )}

              {currentSystem.id === 'electrical' && (
                <>
                  <div>
                    <Label>Panel Capacity (Amps)</Label>
                    <p className="text-xs text-gray-600 mb-2">This is the total electrical capacity of your home. Check the main breaker label in your electrical panel.</p>
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
                      <option value="">Select panel size...</option>
                      <option value="60">60 Amp (Very old homes, needs upgrade)</option>
                      <option value="100">100 Amp (Older homes, basic needs)</option>
                      <option value="150">150 Amp (Standard modern home)</option>
                      <option value="200">200 Amp (Modern home, most common)</option>
                      <option value="400">400 Amp (Large home or multiple units)</option>
                    </select>
                    {formData[currentSystem.id]?.panel_capacity && (
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
                    <Label>Wiring Type</Label>
                    <p className="text-xs text-gray-600 mb-2">The type of wiring in your home. Age of house is usually the best indicator if you're unsure.</p>
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
                      <option value="">Select wiring type...</option>
                      <option value="copper">Modern Copper (1980s+) - Safe, standard</option>
                      <option value="aluminum">Aluminum (1960s-70s) - Needs monitoring</option>
                      <option value="knob_tube">Knob & Tube (Pre-1950) - Needs replacement</option>
                      <option value="mixed">Mixed/Unsure</option>
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
                    <Label>Panel Age (Optional)</Label>
                    <p className="text-xs text-gray-600 mb-2">When was your electrical panel last replaced? Check for a date sticker inside the panel door.</p>
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
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}
                    />
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