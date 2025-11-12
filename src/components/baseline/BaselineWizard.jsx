
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Upload, Camera, Zap, X, AlertCircle } from "lucide-react";

const QUICK_START_SYSTEMS = [
  {
    id: 'hvac',
    type: 'HVAC System',
    icon: '❄️',
    why: 'Failed HVAC = $8K+ emergency replacement',
    fields: ['installation_year', 'brand_model']
  },
  {
    id: 'water_heater',
    type: 'Plumbing System',
    icon: '🚿',
    why: 'Water heater failure = home flood + $15K damage',
    fields: ['water_heater_year', 'water_heater_type']
  },
  {
    id: 'roof',
    type: 'Roof System',
    icon: '🏠',
    why: 'Small roof leak = $30K+ disaster in mold and structure',
    fields: ['installation_year', 'material_type']
  },
  {
    id: 'electrical',
    type: 'Electrical System',
    icon: '⚡',
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
  const isLastStep = currentStep === QUICK_START_SYSTEMS.length - 1;
  const progress = ((currentStep + 1) / QUICK_START_SYSTEMS.length) * 100;

  // Check if current system is already documented
  const existingSystemsForType = existingSystems.filter(s => s.system_type === currentSystem.type);
  const alreadyDocumented = existingSystemsForType.length > 0;

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setPhotos(prev => ({
        ...prev,
        [currentSystem.id]: [...(prev[currentSystem.id] || []), ...urls]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSmartScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
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

        alert('✅ Data extracted! Review and adjust as needed.');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Scanning failed. Please enter information manually.');
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
          key_components: {
            water_heater_year: systemData.water_heater_year || '',
            water_heater_type: systemData.water_heater_type || ''
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
          key_components: {
            panel_capacity: systemData.panel_capacity || '',
            wiring_type: systemData.wiring_type || ''
          }
        });
      }
    }

    if (isLastStep) {
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
              <div className="text-6xl mb-3">{currentSystem.icon}</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
                {currentSystem.type}
              </h2>
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
                    <Label>Type</Label>
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
                      <option value="tank">Tank</option>
                      <option value="tankless">Tankless</option>
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
                    <Label>Panel Capacity</Label>
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
                      <option value="">Select amperage...</option>
                      <option value="100">100 Amp</option>
                      <option value="150">150 Amp</option>
                      <option value="200">200 Amp</option>
                    </select>
                  </div>
                  <div>
                    <Label>Wiring Type</Label>
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
                      <option value="">Select type...</option>
                      <option value="copper">Copper (Modern)</option>
                      <option value="aluminum">Aluminum (1960s-70s)</option>
                      <option value="knob_tube">Knob & Tube (Pre-1950)</option>
                    </select>
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
