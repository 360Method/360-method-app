import React, { useState } from "react";
import { SystemBaseline, storage, integrations } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MobileWizardFlow from "./MobileWizardFlow";
import PhotoCaptureStep from "./wizard-steps/PhotoCaptureStep";
import ConditionStep from "./wizard-steps/ConditionStep";
import AgeStep from "./wizard-steps/AgeStep";
import OptionalDetailsStep from "./wizard-steps/OptionalDetailsStep";
import { useDraftSave } from "./useDraftSave";

// System-specific AI prompts for comprehensive photo analysis
const AI_PROMPTS = {
  "HVAC System": `You are analyzing a photo of an HVAC system (furnace, AC unit, heat pump, or air handler).

Look for ANY of these:
1. Data plate/sticker with brand name, model number, serial number
2. The unit itself - identify brand from logo/design (Carrier, Trane, Lennox, Rheem, Goodman, Bryant, York, Amana, etc.)
3. Installation date stickers (often on side panel)
4. Energy rating labels (yellow EnergyGuide)
5. Service stickers from HVAC companies (may show install/service dates)

From the serial number, try to decode the manufacture year:
- Carrier/Bryant: 1st two digits = week, next two = year (e.g., 2519 = 2019)
- Trane/American Standard: First digit 0-9 = 2010-2019, letters A-L = 2020-2031
- Lennox: First two digits = year
- Rheem/Goodman: First two digits = year after 2000

Return JSON with:
- brand: string (brand name you can identify)
- model: string (model number if visible)
- year: string (4-digit year, installation/manufacture year)
- condition: string (excellent, good, fair, poor - based on visible rust, damage, age)
- notes: string (type of unit, condition observations)

If you can't see something clearly, leave it as empty string.`,

  "Plumbing System": `You are analyzing a photo of plumbing equipment (water heater, pipes, shutoffs).

Identify:
1. If water heater: Type (Tank vs Tankless), Fuel (Gas vs Electric), Brand, Capacity
2. Brand from logo (Rheem, A.O. Smith, Bradford White, Rinnai, State, etc.)
3. Data plate info (model, serial, date)
4. Pipe materials if visible (copper, PEX, galvanized, PVC)
5. Washing machine hoses (rubber = high risk, braided stainless = safe)

Serial number date codes:
- Rheem: First 4 digits = MMYY (e.g., 0721 = July 2021)
- A.O. Smith: First letter = year (A=2005, B=2006... N=2018, P=2019, R=2020)
- Bradford White: First 2 letters = year and month

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- type: string (tank_gas, tank_electric, tankless_gas, tankless_electric, heat_pump, pipes, shutoff)
- capacity: string (gallons if water heater)
- condition: string (excellent, good, fair, poor)
- notes: string (observations, safety concerns)

Be accurate - leave as empty string if unsure.`,

  "Electrical System": `You are analyzing a photo of an electrical panel or wiring.

Identify:
1. Panel brand (Square D, Siemens, GE, Eaton/Cutler-Hammer, Murray, Federal Pacific, Zinsco)
2. Main breaker amperage (large breaker at top: 60, 100, 150, 200, or 400 amp)
3. Panel age (date stickers, or estimate from brand/style)
4. Safety concerns:
   - Federal Pacific or Zinsco panels = URGENT fire hazard!
   - Double-tapped breakers (two wires on one breaker)
   - Rust or corrosion
   - Missing knockouts

If showing wiring:
- Copper (orange/brown) = modern, safe
- Aluminum (silver) = 1960s-70s, needs monitoring
- Cloth-wrapped (fabric) = very old, may be knob & tube

Return JSON with:
- brand: string (panel manufacturer)
- model: string
- year: string (4-digit panel install year)
- panel_capacity: string (60, 100, 150, 200, 400)
- wiring_type: string (copper, aluminum, knob_tube, mixed)
- condition: string (excellent, good, fair, poor)
- safety_concerns: string (any red flags - ESPECIALLY Federal Pacific or Zinsco!)
- notes: string (general observations)

IMPORTANT: Flag Federal Pacific or Zinsco panels as URGENT safety concern.`,

  "Roof System": `You are analyzing a photo of a roof.

Identify:
1. Material type:
   - Asphalt shingles (layered rectangles, most common)
   - Metal (standing seam panels or corrugated)
   - Tile (curved clay/concrete)
   - Slate (flat stone pieces)
   - Wood shake (wooden shingles)
   - Flat/membrane (rubber or tar)

2. Condition observations:
   - Missing/damaged shingles
   - Curling or buckling
   - Moss/algae growth
   - Granule loss
   - Flashing condition

3. Age estimation from condition:
   - New (0-5 years): crisp edges, consistent color
   - Mid-life (5-15 years): some weathering, slight curling
   - Aging (15-25 years): significant wear, granule loss
   - End of life (25+ years): major curling, missing pieces

Return JSON with:
- material_type: string (asphalt, metal, tile, slate, wood, flat)
- year: string (4-digit estimated install year based on condition)
- condition: string (excellent, good, fair, poor)
- layers: string (single, multiple - if visible)
- notes: string (specific condition observations)`,

  "Foundation & Structure": `You are analyzing foundation or structural elements.

Look for:
1. Foundation type (poured concrete, concrete block, brick, stone, pier)
2. Cracks - note location, width, pattern (vertical, horizontal, stair-step)
3. Water stains or efflorescence (white mineral deposits)
4. Bowing, bulging, or leaning walls
5. Mortar condition in block/brick foundations
6. Support posts and beams condition

Return JSON with:
- foundation_type: string (poured_concrete, block, brick, stone, pier)
- year: string (estimated age if determinable)
- condition: string (excellent, good, fair, poor)
- crack_severity: string (none, hairline, minor, major)
- water_signs: string (none, stains, active_leak, efflorescence)
- notes: string (detailed observations, specific concerns)`,

  "Water & Sewer/Septic": `You are analyzing water supply or sewer/septic components.

Look for:
1. Water meter location and condition
2. Main shutoff valve type and location
3. Sewer cleanout location
4. Septic tank lid/access point
5. Visible pipe materials
6. Any signs of leaks or backups

Return JSON with:
- component_type: string (water_main, sewer_line, septic_tank, well, cleanout)
- material: string (copper, PVC, cast_iron, galvanized, clay)
- year: string (estimated installation year)
- condition: string (excellent, good, fair, poor)
- notes: string (observations, location details)`,

  "Exterior Siding & Envelope": `You are analyzing exterior siding or building envelope.

Identify:
1. Siding material (vinyl, wood, fiber cement, brick, stucco, aluminum)
2. Condition of caulking and seals
3. Paint condition
4. Any rot, cracks, or damage
5. Trim and soffit condition

Return JSON with:
- material: string (vinyl, wood, fiber_cement, brick, stucco, aluminum)
- year: string (estimated installation year)
- condition: string (excellent, good, fair, poor)
- paint_condition: string (new, good, fading, peeling)
- notes: string (damage, concerns, maintenance needs)`,

  "Windows & Doors": `You are analyzing windows or doors.

Identify:
1. Window brand (if visible on glass corner)
2. Type: single pane, double pane, triple pane
3. Frame material (wood, vinyl, aluminum, fiberglass)
4. Seal condition (any condensation between panes = seal failure)
5. Weatherstripping condition

Return JSON with:
- brand: string (manufacturer if visible)
- year: string (installation year if known)
- type: string (single_pane, double_pane, triple_pane)
- frame_material: string (wood, vinyl, aluminum, fiberglass)
- condition: string (excellent, good, fair, poor)
- seal_status: string (good, condensation, failed)
- notes: string (specific observations)`,

  "Gutters & Downspouts": `You are analyzing gutters and downspouts.

Identify:
1. Material (aluminum, steel, copper, vinyl)
2. Style (K-style, half-round)
3. Condition - sagging, separation, damage
4. Debris accumulation
5. Gutter guards presence
6. Downspout discharge location

Return JSON with:
- material: string (aluminum, steel, copper, vinyl)
- year: string (estimated installation year)
- condition: string (excellent, good, fair, poor)
- guards_installed: string (yes, no, partial)
- notes: string (debris level, damage, discharge concerns)`,

  "Landscaping & Grading": `You are analyzing landscaping and grading around a home.

Look for:
1. Ground slope direction relative to foundation
2. Low spots where water might pool
3. Distance of plants/trees from foundation
4. Retaining wall condition
5. Drainage features (swales, french drains)

Return JSON with:
- grading_direction: string (away_from_house, toward_house, flat, mixed)
- condition: string (excellent, good, fair, poor)
- drainage_features: string (swale, french_drain, none, unknown)
- tree_proximity: string (safe, concerning, too_close)
- notes: string (specific concerns, recommendations)`,

  "Driveways & Hardscaping": `You are analyzing driveways or hardscaping.

Identify:
1. Surface material (asphalt, concrete, pavers, gravel)
2. Cracks, potholes, heaving
3. Drainage patterns
4. Edge condition
5. Last sealing (asphalt)

Return JSON with:
- material: string (asphalt, concrete, pavers, gravel)
- year: string (estimated installation year)
- condition: string (excellent, good, fair, poor)
- crack_severity: string (none, hairline, minor, major)
- notes: string (specific damage, drainage issues)`,

  "Attic & Insulation": `You are analyzing attic space or insulation.

Look for:
1. Insulation type (fiberglass batts, blown-in, spray foam)
2. Insulation depth/R-value
3. Ventilation (soffit vents, ridge vents, gable vents)
4. Moisture stains or mold
5. Roof deck condition from inside
6. Pest activity signs

Return JSON with:
- insulation_type: string (fiberglass_batts, blown_in, spray_foam, none)
- r_value: string (estimated R-value or depth)
- ventilation: string (adequate, poor, none)
- condition: string (excellent, good, fair, poor)
- moisture_signs: string (none, stains, mold, active_leak)
- notes: string (observations, pest signs, concerns)`,

  "Basement/Crawlspace": `You are analyzing a basement or crawlspace.

Look for:
1. Foundation wall condition
2. Water stains or moisture
3. Sump pump presence and condition
4. Support posts and beams
5. Floor drain location
6. Insulation on walls/ceiling

Return JSON with:
- space_type: string (full_basement, partial_basement, crawlspace)
- condition: string (excellent, good, fair, poor)
- moisture_level: string (dry, damp, wet, flooded)
- sump_pump: string (present_working, present_unknown, none)
- notes: string (cracks, water signs, structural concerns)`,

  "Garage & Overhead Door": `You are analyzing a garage or overhead door.

Identify:
1. Door brand (often on motor unit)
2. Door type (sectional, roll-up, swing)
3. Opener brand and model
4. Spring type (torsion or extension)
5. Safety sensor condition
6. Overall door condition

Return JSON with:
- brand: string (door or opener brand)
- model: string (model number)
- year: string (installation year if visible)
- door_type: string (sectional, roll_up, swing)
- spring_type: string (torsion, extension)
- condition: string (excellent, good, fair, poor)
- notes: string (opener details, maintenance needs)`,

  // Appliances
  "Refrigerator": `You are analyzing a refrigerator.

Look for model/serial plate (inside fridge, on back, or side). Identify:
1. Brand (GE, Whirlpool, Samsung, LG, Frigidaire, etc.)
2. Model number
3. Manufacturing date from serial
4. Capacity if shown
5. Overall condition

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- capacity: string (cubic feet if shown)
- condition: string (excellent, good, fair, poor)
- notes: string (features, issues observed)`,

  "Range/Oven": `You are analyzing a range or oven.

Look for model/serial plate (drawer under oven, side, or back). Identify:
1. Brand
2. Fuel type (gas or electric)
3. Type (freestanding, slide-in, wall oven)
4. Model number
5. Manufacturing date

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- fuel_type: string (gas, electric, dual_fuel)
- oven_type: string (freestanding, slide_in, wall_oven)
- condition: string (excellent, good, fair, poor)
- notes: string (features, condition details)`,

  "Dishwasher": `You are analyzing a dishwasher.

Look for model/serial plate (top edge or side of door, inside). Identify:
1. Brand
2. Model number
3. Manufacturing date
4. Any visible issues (rust, leaks)

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- condition: string (excellent, good, fair, poor)
- notes: string (features, issues)`,

  "Washing Machine": `You are analyzing a washing machine.

Look for model/serial plate (inside lid, back, or side). Identify:
1. Brand
2. Type (top load vs front load)
3. Model number
4. Manufacturing date
5. CRITICAL: Supply hose type (rubber = high flood risk, braided stainless = safe)

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- type: string (top_load, front_load)
- hose_type: string (rubber_high_risk, braided_stainless, unknown)
- condition: string (excellent, good, fair, poor)
- notes: string (capacity, features, hose concerns)`,

  "Dryer": `You are analyzing a dryer.

Look for model/serial plate (inside door, back). Identify:
1. Brand
2. Fuel type (gas or electric)
3. Model number
4. Manufacturing date
5. Vent type if visible

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- fuel_type: string (gas, electric)
- condition: string (excellent, good, fair, poor)
- notes: string (vent type, lint trap condition)`,

  "Microwave": `You are analyzing a microwave.

Look for model/serial plate (inside door, back, or side). Identify:
1. Brand
2. Type (countertop, over-range, built-in)
3. Model number
4. Manufacturing date

Return JSON with:
- brand: string
- model: string
- year: string (4-digit manufacture year)
- type: string (countertop, over_range, built_in)
- condition: string (excellent, good, fair, poor)
- notes: string (wattage, features)`,

  "Garbage Disposal": `You are analyzing a garbage disposal.

Look for label on unit under sink. Identify:
1. Brand (InSinkErator, Waste King, Moen, etc.)
2. Model/horsepower
3. Installation date if visible

Return JSON with:
- brand: string
- model: string
- year: string (4-digit installation year)
- horsepower: string (1/3, 1/2, 3/4, 1)
- condition: string (excellent, good, fair, poor)
- notes: string (noise level, grinding quality)`,

  // Safety Systems
  "Smoke Detector": `You are analyzing a smoke detector.

Look for:
1. Brand (First Alert, Kidde, Nest, etc.)
2. Type (ionization, photoelectric, combination)
3. Power source (battery, hardwired, hardwired+battery)
4. Manufacturing date (usually on back)
5. Expiration date (detectors expire after 10 years!)

Return JSON with:
- brand: string
- type: string (ionization, photoelectric, combination)
- power_source: string (battery, hardwired, hardwired_battery)
- year: string (4-digit manufacture year)
- expiration_year: string (4-digit - add 10 years to manufacture)
- location: string (location in home if mentioned)
- condition: string (excellent, good, fair, poor)
- notes: string (test status, battery type)`,

  "CO Detector": `You are analyzing a carbon monoxide detector.

Look for:
1. Brand
2. Power source
3. Manufacturing date
4. Expiration date (CO detectors expire after 5-7 years!)
5. Display type (digital readout or just alarm)

Return JSON with:
- brand: string
- power_source: string (battery, plug_in, hardwired)
- year: string (4-digit manufacture year)
- expiration_year: string (add 5-7 years to manufacture date)
- has_display: string (yes, no)
- location: string (location in home)
- condition: string (excellent, good, fair, poor)
- notes: string (test status, features)`,

  "Fire Extinguisher": `You are analyzing a fire extinguisher.

Look for:
1. Type/class (A, B, C, ABC, K)
2. Size/weight
3. Brand
4. Manufacturing date
5. Last inspection tag date
6. Pressure gauge reading

Return JSON with:
- brand: string
- type: string (A, B, C, ABC, K)
- size: string (weight in lbs)
- year: string (4-digit manufacture year)
- last_inspection: string (date if tag visible)
- pressure_status: string (good, low, overcharged)
- location: string (location in home)
- condition: string (excellent, good, fair, poor)
- notes: string (mounting, accessibility)`,

  "Radon Test": `You are analyzing radon testing equipment or results.

Look for:
1. Test type (short-term, long-term, continuous monitor)
2. Brand/model
3. Test date
4. Results if visible (pCi/L reading)

Return JSON with:
- test_type: string (short_term, long_term, continuous_monitor)
- brand: string
- year: string (test year)
- reading: string (pCi/L if visible)
- location: string (where tested)
- notes: string (mitigation status, retest needs)`,

  "Security System": `You are analyzing a security system.

Look for:
1. Brand (ADT, Vivint, SimpliSafe, Ring, etc.)
2. Panel type
3. Component types (door sensors, motion, cameras)
4. Monitoring status

Return JSON with:
- brand: string
- system_type: string (professional, diy, hybrid)
- year: string (installation year)
- monitoring: string (professional, self, none)
- components: string (list of visible components)
- condition: string (excellent, good, fair, poor)
- notes: string (features, coverage)`
};

// Photo tips for each system type
const PHOTO_TIPS = {
  "HVAC System": ["The whole unit", "Data plate/sticker", "Brand logo", "Yellow energy label"],
  "Plumbing System": ["Water heater tank", "Rating plate", "Main shutoff valve", "Supply hoses"],
  "Electrical System": ["Panel door open", "Main breaker", "Panel label", "Any date stickers"],
  "Roof System": ["Overview of roof", "Close-up of shingles", "Problem areas", "Vents & flashing"],
  "Foundation & Structure": ["Foundation walls", "Any cracks", "Water stains", "Support beams"],
  "Water & Sewer/Septic": ["Water meter", "Cleanout cap", "Septic access", "Main shutoff"],
  "Exterior Siding & Envelope": ["Full wall view", "Close-up of siding", "Caulking/seals", "Any damage"],
  "Windows & Doors": ["Full window/door", "Brand label", "Weatherstripping", "Any condensation"],
  "Gutters & Downspouts": ["Gutter run", "Downspout", "Any sagging", "Discharge area"],
  "Landscaping & Grading": ["Slope near foundation", "Drainage areas", "Trees near house", "Low spots"],
  "Driveways & Hardscaping": ["Full driveway", "Cracks/damage", "Edges", "Drainage"],
  "Attic & Insulation": ["Insulation coverage", "Ventilation", "Roof deck", "Any stains"],
  "Basement/Crawlspace": ["Foundation walls", "Floor/ground", "Sump pump", "Any moisture"],
  "Garage & Overhead Door": ["Door exterior", "Opener unit", "Springs", "Safety sensors"],
  "Refrigerator": ["Model plate (inside)", "Full unit", "Back panel", "Ice maker"],
  "Range/Oven": ["Model plate (drawer)", "Burners/elements", "Full unit", "Control panel"],
  "Dishwasher": ["Model plate (door edge)", "Inside tub", "Full unit", "Spray arms"],
  "Washing Machine": ["Model plate", "Supply hoses", "Full unit", "Controls"],
  "Dryer": ["Model plate", "Vent connection", "Full unit", "Lint trap"],
  "Microwave": ["Model plate", "Full unit", "Inside", "Controls"],
  "Garbage Disposal": ["Unit under sink", "Model label", "Reset button", "Splash guard"],
  "Smoke Detector": ["Full unit", "Back/date label", "Test button", "Location shot"],
  "CO Detector": ["Full unit", "Back/date label", "Display", "Location shot"],
  "Fire Extinguisher": ["Full unit", "Pressure gauge", "Inspection tag", "Type label"],
  "Radon Test": ["Test device", "Results display", "Location", "Test date"],
  "Security System": ["Main panel", "Sensors", "Cameras", "Keypad"]
};

// Default for any system not specifically listed
const DEFAULT_AI_PROMPT = `You are analyzing a photo of home equipment or systems.

Look for:
1. Brand name and logo
2. Model number
3. Serial number (may contain date code)
4. Installation date stickers
5. Condition indicators

Return JSON with:
- brand: string
- model: string
- year: string (4-digit year if determinable)
- condition: string (excellent, good, fair, poor)
- notes: string (any useful observations)

Be accurate - leave as empty string if unsure.`;

const DEFAULT_PHOTO_TIPS = ["Full unit photo", "Model/serial plate", "Brand logo", "Any damage"];

export default function SystemFormDialogMobile({ 
  open, 
  onClose, 
  propertyId, 
  editingSystem,
  allowsMultiple 
}) {
  const [formData, setFormData] = useState({
    system_type: editingSystem?.system_type || "",
    installation_year: editingSystem?.installation_year || "",
    condition: editingSystem?.condition || "Good",
    brand_model: editingSystem?.brand_model || "",
    nickname: editingSystem?.nickname || "",
    condition_notes: editingSystem?.condition_notes || "",
    last_service_date: editingSystem?.last_service_date || "",
    warranty_info: editingSystem?.warranty_info || "",
    photo_urls: editingSystem?.photo_urls || []
  });
  
  const [photos, setPhotos] = useState(editingSystem?.photo_urls || []);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [aiExtractedYear, setAiExtractedYear] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const draftKey = `baseline-draft-${propertyId}-${formData.system_type}`;
  const { clearDraft } = useDraftSave(draftKey, formData, isDirty);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Helper to convert empty strings to null for date fields
      const cleanDate = (val) => (val && val.trim() !== '') ? val : null;
      // Helper to convert empty strings to null for text fields
      const cleanText = (val) => (val && val.trim() !== '') ? val.trim() : null;

      const submitData = {
        property_id: propertyId,
        system_type: data.system_type,
        nickname: cleanText(data.nickname),
        brand_model: cleanText(data.brand_model),
        installation_year: parseInt(data.installation_year) || null,
        condition: data.condition || 'Good',
        condition_notes: cleanText(data.condition_notes),
        last_service_date: cleanDate(data.last_service_date),
        warranty_info: cleanText(data.warranty_info),
        photo_urls: photos
      };

      if (editingSystem?.id) {
        return SystemBaseline.update(editingSystem.id, submitData);
      } else {
        return SystemBaseline.create(submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
      clearDraft();
      setIsDirty(false);
      toast.success(`${formData.system_type} saved! +10 PropertyIQ Points`, { 
        icon: '🎉', 
        duration: 3000 
      });
      onClose();
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error('Failed to save. Please try again.', { duration: 3000 });
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadToast = toast.loading('Uploading...', { icon: '📸' });

    try {
      const uploadPromises = files.map(file =>
        storage.uploadFile(file)
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setPhotos(prev => [...prev, ...urls]);
      setIsDirty(true);
      
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} added!`, {
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

      // Get system-specific prompt or use default
      const prompt = AI_PROMPTS[formData.system_type] || DEFAULT_AI_PROMPT;

      // Build response schema based on system type
      const response_json_schema = {
        type: "object",
        properties: {
          brand: { type: "string" },
          model: { type: "string" },
          year: { type: "string" },
          condition: { type: "string" },
          notes: { type: "string" }
        }
      };

      const result = await integrations.InvokeLLM({
        prompt,
        file_urls: files.length === 1 ? file_urls[0] : file_urls,
        response_json_schema
      });

      if (result) {
        const updates = {};

        // Extract brand/model
        if (result.brand || result.model) {
          updates.brand_model = [result.brand, result.model].filter(Boolean).join(' ');
        }

        // Extract year
        if (result.year) {
          const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
          if (yearMatch) {
            updates.installation_year = yearMatch[0];
            setAiExtractedYear(yearMatch[0]);
          }
        }

        // Extract condition if provided
        if (result.condition) {
          const conditionMap = {
            'excellent': 'Excellent',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
          };
          const mappedCondition = conditionMap[result.condition.toLowerCase()];
          if (mappedCondition) {
            updates.condition = mappedCondition;
          }
        }

        setFormData(prev => ({ ...prev, ...updates }));
        setPhotos(prev => [...prev, ...file_urls]);
        setIsDirty(true);

        // Build success message
        const foundItems = Object.keys(updates).filter(k => updates[k]);
        if (foundItems.length > 0) {
          toast.success(
            <div>
              <p className="font-bold">✨ Data extracted!</p>
              <p className="text-sm">Found {foundItems.length} details. Review and adjust as needed.</p>
            </div>,
            { id: scanToast, duration: 4000 }
          );
        } else {
          toast.info('Photos uploaded! We couldn\'t find specific data - please enter details below.', {
            id: scanToast,
            duration: 4000
          });
        }

        // Show any notes/safety concerns from AI
        if (result.notes && result.notes.trim()) {
          setTimeout(() => {
            toast.info(`📝 AI Note: ${result.notes}`, { duration: 5000 });
          }, 500);
        }

        // Alert on safety concerns (electrical panels)
        if (result.safety_concerns && result.safety_concerns.toLowerCase().includes('federal pacific')) {
          setTimeout(() => {
            toast.error('⚠️ SAFETY ALERT: Federal Pacific panel detected! These are known fire hazards. Please consult an electrician.', {
              duration: 10000
            });
          }, 1000);
        } else if (result.safety_concerns && result.safety_concerns.toLowerCase().includes('zinsco')) {
          setTimeout(() => {
            toast.error('⚠️ SAFETY ALERT: Zinsco panel detected! These are known fire hazards. Please consult an electrician.', {
              duration: 10000
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Scan failed. Enter details manually or try another photo.', {
        id: scanToast,
        duration: 3000
      });
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
    toast.info('Photo removed', { duration: 1500 });
  };

  // Get photo tips for current system
  const photoTips = PHOTO_TIPS[formData.system_type] || DEFAULT_PHOTO_TIPS;

  const steps = [
    {
      id: 'photo',
      title: '📸 Take a Photo',
      subtitle: 'Our AI will identify your equipment automatically!',
      component: (
        <PhotoCaptureStep
          photos={photos}
          onUpload={handlePhotoUpload}
          onRemove={handleRemovePhoto}
          uploading={uploading}
          onScan={handleSmartScan}
          scanning={scanning}
          systemType={formData.system_type}
          photoTips={photoTips}
        />
      )
    },
    {
      id: 'condition',
      title: "What's its condition?",
      subtitle: 'Be honest - this helps planning',
      component: (
        <ConditionStep
          value={formData.condition}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, condition: val }));
            setIsDirty(true);
          }}
        />
      )
    },
    {
      id: 'age',
      title: 'How old is it?',
      subtitle: 'Critical for planning replacement',
      component: (
        <AgeStep
          value={formData.installation_year}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, installation_year: val }));
            setIsDirty(true);
          }}
          aiExtractedYear={aiExtractedYear}
          systemType={formData.system_type}
        />
      )
    },
    {
      id: 'details',
      title: 'Extra Details',
      subtitle: 'Add more info if you want',
      component: (
        <OptionalDetailsStep
          formData={formData}
          onChange={(updates) => {
            setFormData(prev => ({ ...prev, ...updates }));
            setIsDirty(true);
          }}
        />
      )
    }
  ];

  if (!open) return null;

  return (
    <MobileWizardFlow
      steps={steps}
      onComplete={() => saveMutation.mutate(formData)}
      onCancel={onClose}
      allowSkip={['photo', 'details']}
      showProgress={true}
    />
  );
}