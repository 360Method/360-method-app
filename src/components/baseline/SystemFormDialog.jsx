
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle, Info, Upload, X, Lightbulb, Plus, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SYSTEM_IMPORTANCE = {
  "HVAC System": "Your HVAC system prevents $8,000+ emergency replacements during peak seasons when you need it most. Failed systems in summer heat or winter cold mean no availability and premium pricing. Regular documentation helps you track age, plan for replacement, and catch problems before they become expensive disasters.",
  "Plumbing System": "Water damage is the #1 homeowner insurance claim, averaging $10,000+ per incident. A burst pipe or failed water heater floods your home causing structural damage and mold. Small leaks escalate into major problems. Documentation helps you track critical components and prevent catastrophic failures.",
  "Roof System": "Your roof is your home's primary defense against weather. Small leaks rot the deck, damage insulation, and create interior water damage and mold - turning a $500 repair into a $20,000-40,000 disaster. Knowing installation date helps you plan replacement before emergency failure.",
  "Foundation & Structure": "Foundation problems make homes unsellable and cost $20,000-100,000+ to repair. Small cracks grow over time. Water intrusion causes structural failure. Early documentation lets you track changes and catch problems while they're still manageable.",
  "Water & Sewer/Septic": "Sewer line failures cause sewage backup into your home - a health hazard requiring immediate evacuation and $15,000-30,000 emergency replacement. Tree roots and aging pipes fail without warning. Septic system failure means no plumbing usage and urgent expensive repairs.",
  "Electrical System": "Electrical problems cause 13% of home fires. Outdated wiring, overloaded panels, and old components create fire hazards. Insurance companies may deny claims if you knew about hazards. Documentation protects your family's safety and ensures insurability.",
  "Exterior Siding & Envelope": "Your home's exterior shell prevents water intrusion. Failed caulking and damaged siding allow water into walls causing rot, mold, and structural damage. $500 in maintenance prevents $25,000+ in wall rebuilds. In Pacific Northwest rain, this is critical.",
  "Windows & Doors": "Failed seals cause water damage and account for 30% of heating/cooling loss. Rotted frames require complete replacement at 10X the cost of maintenance. Energy waste costs $300-800/year. Proper maintenance extends life and cuts utility bills.",
  "Gutters & Downspouts": "Clogged gutters cause foundation damage, basement flooding, and landscaping erosion. This $100 maintenance task prevents $10,000-30,000 in foundation and water damage. In Pacific Northwest, this is CRITICAL before fall rain season.",
  "Landscaping & Grading": "Poor grading directs water toward your foundation causing cracks, settling, and basement flooding. Trees too close damage foundations and sewer lines. $2,000 in grading work prevents $15,000-50,000 in foundation repairs.",
  "Attic & Insulation": "Poor attic ventilation causes moisture buildup, mold growth, and premature roof failure. Ice dams damage roofs and gutters. Inadequate insulation wastes $500-2,000/year in energy costs. Proper attic maintenance extends roof life 10+ years.",
  "Basement/Crawlspace": "Water intrusion causes mold, structural damage, and ruins belongings. Moisture problems escalate quickly in closed spaces. Foundation cracks and drainage issues cost $15,000-40,000 to repair. Early detection is critical.",
  "Garage & Overhead Door": "Broken garage door springs fail suddenly, causing door to fall and potentially crushing vehicles or causing injury. Emergency repairs cost 3X normal pricing. Tracked maintenance prevents dangerous failures and extends system life.",
  "Refrigerator": "Refrigerator failures spoil food ($200-500 loss) and can cause water damage from ice maker leaks. Commercial units in rentals are critical for tenant satisfaction. Knowing age helps plan replacement before emergency failure.",
  "Range/Oven": "Gas leaks from faulty ranges are dangerous. Failed ovens in rental properties mean urgent replacement at premium prices. Tracking maintenance ensures safety and helps budget for planned replacement.",
  "Dishwasher": "Failed dishwashers leak water causing floor and cabinet damage. Tracking age (typical 9-12 year life) prevents surprise failures and water damage. In rentals, non-working appliances mean tenant complaints and urgent repairs.",
  "Washing Machine": "Burst washing machine hoses are the #1 cause of home flood damage, releasing 200+ gallons causing $8,000-15,000 in water damage and mold. Tracking installation and hose type prevents catastrophic flooding.",
  "Dryer": "Dryer fires cause $35 million in property damage annually. Lint buildup and old units are fire hazards. Tracking age and maintenance ensures safety and efficient operation. Failed units mean laundromat costs and inconvenience.",
  "Microwave": "While less critical, tracking age helps budget for replacement. In rentals, broken appliances mean tenant complaints. Built-in units require professional installation at higher cost than countertop replacements.",
  "Garbage Disposal": "Failed disposals back up sinks and can leak causing cabinet damage. Tracking age (typical 8-12 years) helps plan replacement. Proper maintenance prevents clogs and extends life.",
  "Smoke Detector": "60% of fire deaths occur in homes with non-functional detectors. Batteries die silently. Detectors expire after 10 years and won't work even with fresh batteries. Tracking locations and battery changes saves lives.",
  "CO Detector": "Carbon monoxide is an invisible, odorless killer. Non-functional detectors mean no warning of deadly gas buildup from furnaces or water heaters. Detectors expire after 5-7 years. This tracking saves lives.",
  "Fire Extinguisher": "Fire extinguishers require annual inspection and expire after 10-12 years. In the critical first minutes of a fire, a functional extinguisher can prevent total loss. Tracking ensures readiness when you need it most.",
  "Radon Test": "Radon is the 2nd leading cause of lung cancer after smoking. This invisible gas seeps from ground into homes. Testing every 2 years ensures safe levels. Mitigation costs $1,500 but prevents serious health risks.",
  "Security System": "Documented security systems can reduce insurance premiums 5-20%. Knowing installation date and monitoring status helps maintain protection. Failed systems mean no alert during break-ins."
};

export default function SystemFormDialog({ open, onClose, propertyId, editingSystem, systemDescription, allowsMultiple }) {
  // Initialize form data based on whether we're editing or creating
  const getInitialFormData = React.useCallback(() => {
    if (editingSystem?.id) {
      // Editing existing system - load all its data
      return {
        system_type: editingSystem.system_type || "",
        nickname: editingSystem.nickname || "",
        brand_model: editingSystem.brand_model || "",
        installation_year: editingSystem.installation_year || "",
        warranty_info: editingSystem.warranty_info || "",
        last_service_date: editingSystem.last_service_date || "",
        next_service_date: editingSystem.next_service_date || "",
        last_battery_change: editingSystem.last_battery_change || "",
        last_test_date: editingSystem.last_test_date || "",
        condition: editingSystem.condition || "Good",
        condition_notes: editingSystem.condition_notes || "",
        warning_signs_present: editingSystem.warning_signs_present || [],
        photo_urls: editingSystem.photo_urls || [],
        manual_urls: editingSystem.manual_urls || [],
        estimated_lifespan_years: editingSystem.estimated_lifespan_years || "",
        replacement_cost_estimate: editingSystem.replacement_cost_estimate || "",
        key_components: editingSystem.key_components || {}
      };
    } else if (editingSystem?.system_type) {
      // Adding new system - just set the type
      return {
        system_type: editingSystem.system_type,
        nickname: "",
        brand_model: "",
        installation_year: "",
        warranty_info: "",
        last_service_date: "",
        next_service_date: "",
        last_battery_change: "",
        last_test_date: "",
        condition: "Good",
        condition_notes: "",
        warning_signs_present: [],
        photo_urls: [],
        manual_urls: [],
        estimated_lifespan_years: "",
        replacement_cost_estimate: "",
        key_components: {},
        is_required: editingSystem.is_required
      };
    }

    // Default empty state
    return {
      system_type: "",
      nickname: "",
      brand_model: "",
      installation_year: "",
      warranty_info: "",
      last_service_date: "",
      next_service_date: "",
      last_battery_change: "",
      last_test_date: "",
      condition: "Good",
      condition_notes: "",
      warning_signs_present: [],
      photo_urls: [],
      manual_urls: [],
      estimated_lifespan_years: "",
      replacement_cost_estimate: "",
      key_components: {}
    };
  }, [editingSystem]); // Dependency array for useCallback

  const [formData, setFormData] = React.useState(getInitialFormData);
  const [photos, setPhotos] = React.useState(() => getInitialFormData().photo_urls || []);
  const [manuals, setManuals] = React.useState(() => {
    const initialData = getInitialFormData();
    // Ensure manuals is an array of objects with { url, name }
    return (initialData.manual_urls || []).map(item =>
      typeof item === 'string' ? { url: item, name: item.split('/').pop() } : item
    );
  });
  const [uploading, setUploading] = React.useState(false);
  const [uploadingManuals, setUploadingManuals] = React.useState(false);
  const [warnings, setWarnings] = React.useState([]);
  const [showAddAnother, setShowAddAnother] = React.useState(false);
  const [scanningBarcode, setScanningBarcode] = React.useState(false);
  const [aiAnalysis, setAiAnalysis] = React.useState(null);
  const [generatingAnalysis, setGeneratingAnalysis] = React.useState(false);

  const queryClient = useQueryClient();

  // Effect to reset form data when dialog opens or editingSystem changes
  React.useEffect(() => {
    if (open) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setPhotos(initialData.photo_urls || []); // Sync photos state with formData's photos
      setManuals((initialData.manual_urls || []).map(item =>
        typeof item === 'string' ? { url: item, name: item.split('/').pop() } : item
      )); // Sync manuals state
      setShowAddAnother(false); // Reset this flag when dialog opens
      setAiAnalysis(null); // Reset AI analysis when dialog opens
    }
  }, [editingSystem, open, getInitialFormData]);

  // Check for warnings based on form data
  React.useEffect(() => {
    const newWarnings = [];
    const components = formData.key_components;

    // HVAC warnings
    if (formData.system_type === "HVAC System") {
      const age = formData.installation_year ? new Date().getFullYear() - formData.installation_year : 0;
      if (age >= 15) {
        newWarnings.push({ level: "warning", message: "HVAC system is approaching typical replacement age (15-20 years)" });
      }
    }

    // Plumbing warnings
    if (formData.system_type === "Plumbing System") {
      if (components.washing_machine_hoses === "rubber") {
        newWarnings.push({
          level: "danger",
          message: "⚠️ REPLACE IMMEDIATELY - Rubber hoses are the #1 cause of home flood damage. Switch to braided stainless steel hoses ($20 at hardware store). This is urgent."
        });
      }
      if (!components.main_shutoff_known) {
        newWarnings.push({
          level: "warning",
          message: "FIND THIS NOW - Knowing your main water shutoff location is critical for emergencies"
        });
      }
      const heaterAge = components.water_heater_year ? new Date().getFullYear() - components.water_heater_year : 0;
      if (heaterAge >= 10) {
        newWarnings.push({ level: "warning", message: "Water heater is 10+ years old - plan for replacement soon" });
      }
    }

    // Electrical warnings
    if (formData.system_type === "Electrical System") {
      if (components.wiring_type === "knob_tube") {
        newWarnings.push({
          level: "danger",
          message: "🔥 SAFETY HAZARD - Knob and tube wiring is dangerous. Schedule electrician evaluation immediately. Many insurers won't cover homes with this wiring."
        });
      }
      if (components.wiring_type === "aluminum") {
        newWarnings.push({
          level: "warning",
          message: "⚠️ Aluminum wiring needs professional evaluation - can be fire hazard"
        });
      }
    }

    // Roof warnings
    if (formData.system_type === "Roof System") {
      const age = formData.installation_year ? new Date().getFullYear() - formData.installation_year : 0;
      const lifespan = formData.estimated_lifespan_years || 20;
      if (age >= lifespan * 0.9) {
        newWarnings.push({ level: "warning", message: "Roof is approaching end of expected lifespan - budget for replacement" });
      }
      if (components.multiple_layers) {
        newWarnings.push({
          level: "warning",
          message: "Multiple layers = problems. Cannot add another layer. Full tear-off required at next replacement."
        });
      }
    }

    setWarnings(newWarnings);
  }, [formData]);

  // Generate AI risk analysis after system is saved
  const generateAiAnalysis = React.useCallback(async (savedSystem) => {
    if (!savedSystem.installation_year || !savedSystem.system_type) return;

    setGeneratingAnalysis(true);
    try {
      const systemAge = new Date().getFullYear() - savedSystem.installation_year;
      const lifespanYears = savedSystem.estimated_lifespan_years || 20; // Use a default if not specified
      const remainingYears = Math.max(0, lifespanYears - systemAge);

      const analysisPrompt = `Analyze this home system and provide maintenance insights:

System: ${savedSystem.system_type}
${savedSystem.nickname ? `Location: ${savedSystem.nickname}` : ''}
${savedSystem.brand_model ? `Brand/Model: ${savedSystem.brand_model}` : ''}
Age: ${systemAge} years old (installed ${savedSystem.installation_year})
Expected lifespan: ${lifespanYears} years
Remaining lifespan: ${remainingYears} years
Current condition: ${savedSystem.condition}
${savedSystem.condition_notes ? `Condition notes: ${savedSystem.condition_notes}` : ''}
${savedSystem.warning_signs_present?.length > 0 ? `Warning signs: ${savedSystem.warning_signs_present.join(', ')}` : ''}

Provide:
1. Risk assessment based on age and condition (1-10 scale, where 10 is highest risk)
2. Specific warning signs to watch for during inspections
3. Recommended maintenance tasks in the next 6-12 months
4. Estimated timeline for replacement if nearing end-of-life

Be specific, practical, and focus on preventing expensive failures.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number" },
            risk_explanation: { type: "string" },
            warning_signs: { type: "array", items: { type: "string" } },
            recommended_actions: { type: "array", items: { type: "string" } },
            replacement_timeline: { type: "string" }
          },
          required: ["risk_score", "risk_explanation", "warning_signs", "recommended_actions", "replacement_timeline"]
        }
      });

      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Optionally show an error message to the user
      alert("Failed to generate AI analysis. Please try again later.");
    } finally {
      setGeneratingAnalysis(false);
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const submitData = {
        ...data,
        property_id: propertyId,
        installation_year: parseInt(data.installation_year) || null,
        estimated_lifespan_years: parseInt(data.estimated_lifespan_years) || null,
        replacement_cost_estimate: parseFloat(data.replacement_cost_estimate) || null,
        photo_urls: photos,
        manual_urls: manuals.map(m => m.url), // Save only the URLs
        is_required: editingSystem?.is_required || false
      };

      if (editingSystem?.id) {
        return base44.entities.SystemBaseline.update(editingSystem.id, submitData);
      } else {
        return base44.entities.SystemBaseline.create(submitData);
      }
    },
    onSuccess: (savedSystem) => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });

      // Only generate AI analysis for *new* systems that have an installation_year
      if (!editingSystem?.id && savedSystem.installation_year && savedSystem.system_type) {
        generateAiAnalysis(savedSystem);
      } else if (!editingSystem?.id && allowsMultiple) {
        // If it's a new system, allows multiple, but no year for AI analysis (or analysis failed)
        setShowAddAnother(true);
      } else {
        // If it's an existing system, or a new single system, or new multi-system without year for AI analysis
        onClose();
      }
    },
    onError: (error) => {
      console.error("Save failed:", error);
      alert("Failed to save system. Please try again.");
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...newUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Clear input
    }
  };

  const handleManualUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingManuals(true);

    try {
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => ({ url: r.file_url, name: r.file_name || r.file_url.split('/').pop() }));
      setManuals(prev => [...prev, ...newUrls]);
    } catch (error) {
      console.error('Manual upload failed:', error);
    } finally {
      setUploadingManuals(false);
      e.target.value = ''; // Clear input
    }
  };

  const handleBarcodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanningBarcode(true);
    try {
      // Upload the barcode image
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Use AI to extract product info from data plate
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing a product data plate or model label. Extract the following information:

        1. Brand/Manufacturer name
        2. Model number
        3. Serial number (if visible)
        4. Year of manufacture or installation date (look for "MFG Date", "Mfg Year", "Date", or year numbers)

        Be thorough - look for ALL text on the plate. Years might be in formats like:
        - "2015"
        - "MFG 03/2018"
        - "Date: 2020"

        Return ONLY valid data you can clearly read. If you cannot find a field, return an empty string for it.

        Return as JSON.`,
        file_urls: file_url,
        response_json_schema: {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            serial: { type: "string" },
            year: { type: "string" }
          },
          required: ["brand", "model", "serial", "year"]
        }
      });

      console.log("AI extraction result:", result);

      // Populate form with extracted data
      if (result && (result.brand || result.model || result.year)) {
        // Build brand_model string
        const brandModel = [result.brand, result.model].filter(Boolean).join(' ').trim();

        // Extract year from various formats
        let extractedYear = "";
        if (result.year) {
          const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
          if (yearMatch) {
            extractedYear = yearMatch[0];
          }
        }

        // Update form based on system type
        if (brandModel || extractedYear) {
          setFormData(prev => {
            const updates = { ...prev };

            // Set brand/model for all systems
            if (brandModel) {
              updates.brand_model = brandModel;
            }

            // For Plumbing System, populate water heater year in key_components
            if (extractedYear) {
              if (formData.system_type === "Plumbing System") {
                updates.key_components = {
                  ...prev.key_components,
                  water_heater_year: extractedYear
                };
              } else {
              // For all other systems, use installation_year
                updates.installation_year = extractedYear;
              }
            }

            return updates;
          });

          // Show success feedback
          const successMessage = `✅ Data extracted successfully!\n\nBrand/Model: ${brandModel || 'N/A'}\nYear: ${extractedYear || 'N/A'}`;
          console.log(successMessage);
          alert(successMessage);
        } else {
          alert("Could not extract clear data from the image. Please try taking a clearer photo or enter the information manually.");
        }

        // Add image to photos only if not already present
        if (!photos.includes(file_url)) {
          setPhotos(prev => [...prev, file_url]);
        }
      } else {
        alert("Could not extract data from the image. Please try:\n- Taking a clearer photo\n- Ensuring good lighting\n- Getting closer to the data plate\n\nOr enter the information manually.");
      }
    } catch (error) {
      console.error('Barcode scan failed:', error);
      alert("Scanning failed. Please try again or enter the information manually.");
    } finally {
      setScanningBarcode(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeManual = (index) => {
    setManuals(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleAddAnother = () => {
    setShowAddAnother(false);
    setFormData({
      system_type: formData.system_type,
      nickname: "",
      brand_model: "",
      installation_year: "",
      warranty_info: "",
      last_service_date: "",
      next_service_date: "",
      last_battery_change: "",
      last_test_date: "",
      condition: "Good",
      condition_notes: "",
      warning_signs_present: [],
      photo_urls: [],
      manual_urls: [],
      estimated_lifespan_years: "",
      replacement_cost_estimate: "",
      key_components: {}
    });
    setPhotos([]);
    setManuals([]);
  };

  const updateComponent = (key, value) => {
    setFormData(prev => ({
      ...prev,
      key_components: {
        ...prev.key_components,
        [key]: value
      }
    }));
  };

  const renderSystemSpecificFields = () => {
    switch (formData.system_type) {
      case "HVAC System":
        return (
          <>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Section 1: Heating Unit</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand_model}
                      onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
                      placeholder="e.g., Carrier, Trane, Lennox"
                    />
                  </div>
                  <div>
                    <Label>Installation Date</Label>
                    <Input
                      type="number"
                      value={formData.installation_year}
                      onChange={(e) => setFormData({ ...formData, installation_year: e.target.value })}
                      placeholder="Year installed"
                    />
                    <p className="text-xs text-gray-600 mt-1">Check permit sticker or ask previous owner</p>
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <Select
                      value={formData.key_components.fuel_type || ""}
                      onValueChange={(value) => updateComponent('fuel_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural_gas">Natural Gas</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="oil">Oil</SelectItem>
                        <SelectItem value="propane">Propane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Section 2: Cooling Unit</h4>
                <div className="space-y-4">
                  <div>
                    <Label>SEER Rating</Label>
                    <Input
                      value={formData.key_components.seer_rating || ""}
                      onChange={(e) => updateComponent('seer_rating', e.target.value)}
                      placeholder="e.g., 14"
                    />
                    <p className="text-xs text-gray-600 mt-1">Higher number = more efficient. Found on yellow EnergyGuide label</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Section 3: Maintenance History</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Last Service Date</Label>
                    <Input
                      type="date"
                      value={formData.last_service_date}
                      onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Filter Size</Label>
                    <Select
                      value={formData.key_components.filter_size || ""}
                      onValueChange={(value) => updateComponent('filter_size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14x20x1">14 x 20 x 1</SelectItem>
                        <SelectItem value="14x24x1">14 x 24 x 1</SelectItem>
                        <SelectItem value="14x25x1">14 x 25 x 1</SelectItem>
                        <SelectItem value="15x20x1">15 x 20 x 1</SelectItem>
                        <SelectItem value="16x20x1">16 x 20 x 1</SelectItem>
                        <SelectItem value="16x24x1">16 x 24 x 1</SelectItem>
                        <SelectItem value="16x25x1">16 x 25 x 1</SelectItem>
                        <SelectItem value="18x24x1">18 x 24 x 1</SelectItem>
                        <SelectItem value="18x25x1">18 x 25 x 1</SelectItem>
                        <SelectItem value="20x20x1">20 x 20 x 1</SelectItem>
                        <SelectItem value="20x24x1">20 x 24 x 1</SelectItem>
                        <SelectItem value="20x25x1">20 x 25 x 1</SelectItem>
                        <SelectItem value="20x30x1">20 x 30 x 1</SelectItem>
                        <SelectItem value="24x24x1">24 x 24 x 1</SelectItem>
                        <SelectItem value="16x20x2">16 x 20 x 2</SelectItem>
                        <SelectItem value="16x25x2">16 x 25 x 2</SelectItem>
                        <SelectItem value="20x20x2">20 x 20 x 2</SelectItem>
                        <SelectItem value="20x25x2">20 x 25 x 2</SelectItem>
                        <SelectItem value="16x20x4">16 x 20 x 4</SelectItem>
                        <SelectItem value="16x25x4">16 x 25 x 4</SelectItem>
                        <SelectItem value="20x20x4">20 x 20 x 4</SelectItem>
                        <SelectItem value="20x25x4">20 x 25 x 4</SelectItem>
                        <SelectItem value="custom">Custom/Other Size</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-1">
                      Written on filter frame. Common sizes listed - select "Custom" if yours isn't here.
                    </p>
                    {formData.key_components.filter_size === "custom" && (
                      <Input
                        value={formData.key_components.filter_size_custom || ""}
                        onChange={(e) => updateComponent('filter_size_custom', e.target.value)}
                        placeholder="Enter custom size (e.g., 17x22x1)"
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hvac-maintenance-contract"
                      checked={formData.key_components.has_maintenance_contract || false}
                      onCheckedChange={(checked) => updateComponent('has_maintenance_contract', checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="hvac-maintenance-contract" className="font-normal cursor-pointer">
                      I have a maintenance contract
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "Plumbing System":
        return (
          <>
            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Section 1: Water Heater (Most Critical)</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={formData.key_components.water_heater_type || ""}
                      onValueChange={(value) => updateComponent('water_heater_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tank">Tank</SelectItem>
                        <SelectItem value="tankless">Tankless</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <Select
                      value={formData.key_components.water_heater_fuel || ""}
                      onValueChange={(value) => updateComponent('water_heater_fuel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural_gas">Natural Gas</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="propane">Propane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-red-700 font-bold">Installation Year (CRITICAL)</Label>
                    <Input
                      type="number"
                      value={formData.key_components.water_heater_year || ""}
                      onChange={(e) => updateComponent('water_heater_year', e.target.value)}
                      placeholder="Year installed"
                      className="border-red-300"
                    />
                    {!formData.key_components.water_heater_year && (
                      <p className="text-xs text-red-700 mt-1 font-medium">⚠️ This is essential for planning replacement</p>
                    )}
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <Select
                      value={formData.key_components.water_heater_capacity || ""}
                      onValueChange={(value) => updateComponent('water_heater_capacity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 gallons</SelectItem>
                        <SelectItem value="40">40 gallons</SelectItem>
                        <SelectItem value="50">50 gallons</SelectItem>
                        <SelectItem value="75">75 gallons</SelectItem>
                        <SelectItem value="80">80 gallons</SelectItem>
                        <SelectItem value="tankless">Tankless</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Section 2: Main Water Shutoff</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Location</Label>
                    <Select
                      value={formData.key_components.shutoff_location || ""}
                      onValueChange={(value) => updateComponent('shutoff_location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Where is it?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basement">Basement</SelectItem>
                        <SelectItem value="garage">Garage</SelectItem>
                        <SelectItem value="crawlspace">Crawlspace</SelectItem>
                        <SelectItem value="utility_room">Utility Room</SelectItem>
                        <SelectItem value="exterior">Exterior</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="main-shutoff-known"
                      checked={formData.key_components.main_shutoff_known || false}
                      onCheckedChange={(checked) => updateComponent('main_shutoff_known', checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="main-shutoff-known" className="font-normal cursor-pointer">
                      I know where it is and can access it quickly
                    </Label>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Section 3: Washing Machine (High Risk)</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">Supply Line Type</Label>
                    <Select
                      value={formData.key_components.washing_machine_hoses || ""}
                      onValueChange={(value) => updateComponent('washing_machine_hoses', value)}
                    >
                      <SelectTrigger className={formData.key_components.washing_machine_hoses === "rubber" ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stainless">Braided Stainless Steel</SelectItem>
                        <SelectItem value="rubber">Rubber Hoses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "Electrical System":
        return (
          <>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Section 1: Main Panel</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Panel Capacity</Label>
                    <Select
                      value={formData.key_components.panel_capacity || ""}
                      onValueChange={(value) => updateComponent('panel_capacity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select amperage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 Amp</SelectItem>
                        <SelectItem value="100">100 Amp</SelectItem>
                        <SelectItem value="150">150 Amp</SelectItem>
                        <SelectItem value="200">200 Amp</SelectItem>
                        <SelectItem value="400">400 Amp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Panel Brand</Label>
                    <Input
                      value={formData.brand_model}
                      onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
                      placeholder="e.g., Square D, Siemens, GE"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Section 2: Wiring Type (CRITICAL FOR SAFETY)</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">Wiring Type</Label>
                    <Select
                      value={formData.key_components.wiring_type || ""}
                      onValueChange={(value) => updateComponent('wiring_type', value)}
                    >
                      <SelectTrigger className={
                        formData.key_components.wiring_type === "knob_tube" ? "border-red-500" :
                        formData.key_components.wiring_type === "aluminum" ? "border-orange-500" : ""
                      }>
                        <SelectValue placeholder="Select wiring type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copper">Copper (Modern - Good)</SelectItem>
                        <SelectItem value="aluminum">Aluminum (1960s-70s - Safety Concern)</SelectItem>
                        <SelectItem value="knob_tube">Knob & Tube (Pre-1950 - Replace Immediately)</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Section 3: Safety Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="gfci-bathrooms"
                      checked={formData.key_components.gfci_bathrooms || false}
                      onCheckedChange={(checked) => updateComponent('gfci_bathrooms', checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="gfci-bathrooms" className="font-normal cursor-pointer">
                      GFCI outlets in bathrooms
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="gfci-kitchen"
                      checked={formData.key_components.gfci_kitchen || false}
                      onCheckedChange={(checked) => updateComponent('gfci_kitchen', checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="gfci-kitchen" className="font-normal cursor-pointer">
                      GFCI outlets in kitchen
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="afci-breakers"
                      checked={formData.key_components.afci_breakers || false}
                      onCheckedChange={(checked) => updateComponent('afci_breakers', checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="afci-breakers" className="font-normal cursor-pointer">
                      AFCI breakers present
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "Roof System":
        return (
          <>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Section 1: Roofing Material</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Material Type</Label>
                    <Select
                      value={formData.key_components.material_type || ""}
                      onValueChange={(value) => {
                        updateComponent('material_type', value);
                        const lifespans = {
                          "asphalt_3tab": 18,
                          "asphalt_architectural": 25,
                          "metal": 55,
                          "tile": 75,
                          "slate": 100,
                          "flat": 18
                        };
                        setFormData(prev => ({
                          ...prev,
                          estimated_lifespan_years: lifespans[value] || ""
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asphalt_3tab">Asphalt Shingles (3-Tab)</SelectItem>
                        <SelectItem value="asphalt_architectural">Asphalt Shingles (Architectural)</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="slate">Slate</SelectItem>
                        <SelectItem value="flat">Flat/Membrane</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.estimated_lifespan_years && (
                      <p className="text-sm text-green-700 mt-1">
                        Typical lifespan: {formData.estimated_lifespan_years} years
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Section 2: Installation Date (MOST CRITICAL)</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-red-700 font-bold text-lg">Installation Year</Label>
                    <Input
                      type="number"
                      value={formData.installation_year}
                      onChange={(e) => setFormData({ ...formData, installation_year: e.target.value })}
                      placeholder="Year installed"
                      className="border-red-300 text-lg"
                    />
                    <p className="text-sm text-red-700 mt-2 font-medium">
                      ⚠️ THIS IS THE MOST IMPORTANT FIELD - This determines when you'll need replacement
                    </p>
                    {formData.installation_year && formData.estimated_lifespan_years && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium">
                          Your roof is {new Date().getFullYear() - formData.installation_year} years old with approximately{' '}
                          {Math.max(0, formData.estimated_lifespan_years - (new Date().getFullYear() - formData.installation_year))} years remaining
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Section 3: Condition</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Number of Layers</Label>
                    <Select
                      value={formData.key_components.layers || ""}
                      onValueChange={(value) => {
                        updateComponent('layers', value);
                        updateComponent('multiple_layers', value === "multiple");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select layers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Layer</SelectItem>
                        <SelectItem value="multiple">Multiple Layers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Brand/Model</Label>
              <Input
                value={formData.brand_model}
                onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
                placeholder="Enter brand and model"
              />
            </div>
            <div>
              <Label>Installation Year</Label>
              <Input
                type="number"
                value={formData.installation_year}
                onChange={(e) => setFormData({ ...formData, installation_year: e.target.value })}
                placeholder="Year installed"
              />
            </div>
            <div>
              <Label>Last Service Date</Label>
              <Input
                type="date"
                value={formData.last_service_date}
                onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
              />
            </div>
          </div>
        );
    }
  };

  // Show AI analysis before "Add Another" screen
  if (aiAnalysis && !showAddAnother) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI System Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Risk Score */}
            <Card className={`border-2 ${
              aiAnalysis.risk_score >= 7 ? 'border-red-300 bg-red-50' :
              aiAnalysis.risk_score >= 4 ? 'border-orange-300 bg-orange-50' :
              'border-green-300 bg-green-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">Risk Assessment</h3>
                  <Badge className={
                    aiAnalysis.risk_score >= 7 ? 'bg-red-600' :
                    aiAnalysis.risk_score >= 4 ? 'bg-orange-600' :
                    'bg-green-600'
                  }>
                    Risk Score: {aiAnalysis.risk_score}/10
                  </Badge>
                </div>
                <p className="text-sm text-gray-800">{aiAnalysis.risk_explanation}</p>
              </CardContent>
            </Card>

            {/* Warning Signs to Watch */}
            {aiAnalysis.warning_signs?.length > 0 && (
              <Card className="border-2 border-yellow-300 bg-yellow-50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-700" />
                    Warning Signs to Watch For
                  </h3>
                  <ul className="space-y-2">
                    {aiAnalysis.warning_signs.map((sign, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="text-yellow-700 font-bold mt-0.5">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions */}
            {aiAnalysis.recommended_actions?.length > 0 && (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-700" />
                    Recommended Actions (Next 6-12 Months)
                  </h3>
                  <ul className="space-y-2">
                    {aiAnalysis.recommended_actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Replacement Timeline */}
            {aiAnalysis.replacement_timeline && (
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">Replacement Planning</h3>
                  <p className="text-sm text-gray-800">{aiAnalysis.replacement_timeline}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              {allowsMultiple ? (
                <>
                  <Button
                    onClick={() => {
                      setAiAnalysis(null); // Clear AI analysis to show add another screen
                      setShowAddAnother(true);
                    }}
                    className="w-full gap-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Another {formData.system_type}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Done
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onClose}
                  className="w-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


  if (showAddAnother) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              ✓ {formData.system_type} Documented!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-6">
            <div className="text-5xl">🎉</div>
            <p className="text-lg text-gray-700">
              +10 PP
            </p>
            <p className="text-gray-600">
              Do you have another {formData.system_type}?
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleAddAnother}
                className="w-full gap-2"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Plus className="w-4 h-4" />
                Add Another {formData.system_type}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Back to Baseline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Check if this system should have barcode scanner
  const showBarcodeScanner = [
    "HVAC System",
    "Plumbing System",
    "Refrigerator",
    "Range/Oven",
    "Dishwasher",
    "Washing Machine",
    "Dryer",
    "Microwave",
    "Garbage Disposal"
  ].includes(formData.system_type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingSystem?.id ? 'Update' : "Let's Document Your"} {formData.system_type}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Why This Matters - Prominent Educational Section */}
          {!editingSystem?.id && SYSTEM_IMPORTANCE[formData.system_type] && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5 -mt-2">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-900 text-lg mb-2">💡 Why This Matters:</h3>
                  <p className="text-gray-800 leading-relaxed">
                    {SYSTEM_IMPORTANCE[formData.system_type]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barcode Scanner for Systems with Model/Serial Numbers */}
          {showBarcodeScanner && (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">📷</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 mb-1">Quick Scan Model/Serial Plate</h3>
                  <p className="text-sm text-purple-800 mb-3">
                    {formData.system_type === "HVAC System" &&
                      "Take a photo of the unit's data plate (usually on furnace or outdoor AC unit) and we'll extract the details automatically"
                    }
                    {formData.system_type === "Plumbing System" &&
                      "Take a photo of your water heater's data plate and we'll extract brand, model, and year automatically"
                    }
                    {!["HVAC System", "Plumbing System"].includes(formData.system_type) &&
                      "Take a photo of the model/serial number plate and we'll extract the details automatically"
                    }
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleBarcodeUpload}
                      className="hidden"
                      disabled={scanningBarcode}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 border-purple-400 text-purple-700 hover:bg-purple-100"
                      disabled={scanningBarcode}
                      asChild
                    >
                      <span>
                        {scanningBarcode ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            Scanning...
                          </>
                        ) : (
                          <>
                            📸 Scan Data Plate
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Nickname Field for Multi-Instance Systems */}
          {allowsMultiple && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <Label className="text-blue-900 font-bold text-lg">
                Nickname / Location {!editingSystem?.id && "(Required)"}
              </Label>
              <Input
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., Main Floor Unit, Upstairs Zone, Unit A, Master Bedroom"
                className="mt-2"
                required={allowsMultiple && !editingSystem?.id}
              />
              <p className="text-sm text-blue-800 mt-2">
                Give this a name so you can tell them apart
              </p>
            </div>
          )}

          {/* Warnings Display */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              {warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                    warning.level === "danger"
                      ? "bg-red-50 border-red-500"
                      : warning.level === "warning"
                      ? "bg-orange-50 border-orange-500"
                      : "bg-green-50 border-green-500"
                  }`}
                >
                  {warning.level === "danger" ? (
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : warning.level === "warning" ? (
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      warning.level === "danger"
                        ? "text-red-900"
                        : warning.level === "warning"
                        ? "text-orange-900"
                        : "text-green-900"
                    }`}
                  >
                    {warning.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* System-specific fields */}
          {renderSystemSpecificFields()}

          {/* General Condition Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Overall Condition</h4>
            <div className="space-y-4">
              <div>
                <Label>Current Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.condition_notes}
                  onChange={(e) => setFormData({ ...formData, condition_notes: e.target.value })}
                  placeholder="Any known issues or recurring problems?"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Photos
            </h4>
            <p className="text-sm text-blue-800 mb-4">
              Take photos with model plates and installation dates visible
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="mb-4"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-600">Uploading...</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              {photos.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-24 h-24 object-cover rounded border-2 border-white shadow" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Manuals & Documents Upload Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              📄 Owner's Manuals & Warranty Documents
            </h4>
            <p className="text-sm text-green-800 mb-4">
              Upload PDFs of manuals, warranty info, or installation guides. Never lose important documents again!
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              multiple
              onChange={handleManualUpload}
              className="mb-4"
              disabled={uploadingManuals}
            />
            {uploadingManuals && <p className="text-sm text-gray-600">Uploading manuals...</p>}
            {manuals.length > 0 && (
              <div className="space-y-2 mt-4">
                {manuals.map((manual, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-green-300 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📄</span>
                      <span className="text-sm font-medium text-gray-700">
                        {manual.name || `Document ${idx + 1}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeManual(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={saveMutation.isPending || generatingAnalysis}
              className="w-full h-14 text-lg font-semibold"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {generatingAnalysis ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Generating AI Analysis...
                </>
              ) : (saveMutation.isPending ? 'Saving...' : editingSystem?.id ? `Update ${formData.system_type}` : `Save ${formData.system_type}`)}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {editingSystem?.id ? 'Cancel' : 'Skip for Now'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
