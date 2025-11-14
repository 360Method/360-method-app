/**
 * Milestone templates for different upgrade types
 * Each template provides step-by-step guidance for common upgrades
 */

export const UPGRADE_MILESTONES = {
  "Kitchen Refresh": [
    {
      title: "Planning & Design",
      description: "Choose materials, finalize layout, order items",
      ai_guidance: "Measure twice, order once. Lead times for custom countertops can be 3-4 weeks. Get samples home to see them in your lighting before committing.",
      typical_duration_days: 14,
      photo_prompts: ["Current kitchen (all angles)", "Material samples"]
    },
    {
      title: "Demo & Prep",
      description: "Remove old countertops, prep cabinet surfaces",
      ai_guidance: "Protect floors and adjacent rooms. Disconnect plumbing before removing sinks. Check for water damage under old countertops - address before proceeding.",
      typical_duration_days: 2,
      photo_prompts: ["Cabinets prepped", "Any damage discovered"]
    },
    {
      title: "Cabinet Work",
      description: "Paint/reface cabinets, install hardware",
      ai_guidance: "Use deglosser before painting. Apply thin coats, sand between. Hardware spacing must be exact - use a template. Wait 48hrs before heavy use.",
      typical_duration_days: 5,
      photo_prompts: ["Cabinets painted", "Hardware installed"]
    },
    {
      title: "Countertop Installation",
      description: "Template, cut, and install new countertops",
      ai_guidance: "Professional templating is worth it - errors here are expensive. Ensure cabinets are level before installation. Seams should be minimal and in low-traffic areas.",
      typical_duration_days: 1,
      photo_prompts: ["Countertops installed", "Seams (if any)"]
    },
    {
      title: "Backsplash & Fixtures",
      description: "Install backsplash, sink, faucet, lighting",
      ai_guidance: "Backsplash should extend 1/4 inch over countertop edge. Use spacers for consistent tile gaps. Grout needs 24hrs to cure. LED under-cabinet lights add great value.",
      typical_duration_days: 3,
      photo_prompts: ["Backsplash complete", "Sink/faucet installed"]
    },
    {
      title: "Final Touches & Cleanup",
      description: "Paint touch-ups, final cleaning, punch list",
      ai_guidance: "Caulk all seams (sink, backsplash, countertop edges). Remove all labels/stickers. Clean and polish everything. Take 'after' photos from same angles as 'before'.",
      typical_duration_days: 1,
      photo_prompts: ["Final result (all angles)", "Close-ups of details"]
    }
  ],

  "HVAC Replacement": [
    {
      title: "System Selection",
      description: "Size system, choose efficiency rating, get quotes",
      ai_guidance: "Manual J load calculation is essential - improper sizing costs thousands in efficiency. Get 3 quotes. Don't cheap out - efficiency pays back. Verify warranty terms.",
      typical_duration_days: 7,
      photo_prompts: ["Current system model number", "Quotes"]
    },
    {
      title: "Pre-Installation Prep",
      description: "Clear access paths, move valuables, confirm install date",
      ai_guidance: "Installer needs 3ft clearance around equipment. Move anything in attic/basement. Confirm electrical panel has capacity. Pets should be secured on install day.",
      typical_duration_days: 1,
      photo_prompts: ["Old system (for records)"]
    },
    {
      title: "Old System Removal",
      description: "Disconnect and remove old equipment, refrigerant recovery",
      ai_guidance: "Licensed tech must recover refrigerant (illegal to vent). Take photos of old system's model/serial for rebates. Check for ductwork issues while system is out.",
      typical_duration_days: 1,
      photo_prompts: ["Old system removed", "Any ductwork issues found"]
    },
    {
      title: "New System Installation",
      description: "Install new equipment, connect refrigerant lines, electrical",
      ai_guidance: "New pad should be level. Refrigerant lines must be insulated. Disconnect should be within sight of unit. Smart thermostat is worth the upgrade.",
      typical_duration_days: 1,
      photo_prompts: ["New outdoor unit", "New indoor handler/furnace", "Thermostat"]
    },
    {
      title: "System Testing & Startup",
      description: "Test all modes, check refrigerant charge, verify airflow",
      ai_guidance: "Installer should test heating AND cooling modes. Check all vents for proper airflow. Get startup checklist signed. Register warranty immediately.",
      typical_duration_days: 1,
      photo_prompts: ["System running", "Warranty docs"]
    },
    {
      title: "Documentation & Handoff",
      description: "Receive manuals, maintenance plan, warranty info",
      ai_guidance: "File warranty documents immediately. Schedule first maintenance visit in 3 months. Change filters every 90 days. Update system baseline in your property data.",
      typical_duration_days: 1,
      photo_prompts: ["Installation certificate", "Serial numbers"]
    }
  ],

  "Bathroom Remodel": [
    {
      title: "Planning & Design",
      description: "Choose fixtures, tile, layout changes",
      ai_guidance: "Verify rough-in dimensions match your fixtures. Buy 10% extra tile for cuts/mistakes. Bring samples home. Consider long-term accessibility (aging in place).",
      typical_duration_days: 14,
      photo_prompts: ["Current bathroom", "Material samples"]
    },
    {
      title: "Demo & Rough-In",
      description: "Remove old fixtures, tile, assess subfloor/walls",
      ai_guidance: "Check for water damage behind tub/shower. Rotted subfloor must be replaced now. Upgrade plumbing if old galvanized steel. Now's the time to move outlets/lights.",
      typical_duration_days: 2,
      photo_prompts: ["Demo complete", "Subfloor condition"]
    },
    {
      title: "Waterproofing & Prep",
      description: "Install cement board, waterproof membrane, prep surfaces",
      ai_guidance: "Waterproofing is critical - corners, seams, and penetrations must be sealed. Use RedGard or similar membrane. Let it cure fully before tiling.",
      typical_duration_days: 2,
      photo_prompts: ["Cement board installed", "Waterproofing applied"]
    },
    {
      title: "Tile Installation",
      description: "Install floor and shower/tub tile",
      ai_guidance: "Start with focal wall or shower. Use spacers for consistent gaps. Wet saw is worth renting. Check level constantly. Grout after 24hrs of tile set.",
      typical_duration_days: 3,
      photo_prompts: ["Floor tile", "Wall tile"]
    },
    {
      title: "Fixture Installation",
      description: "Install vanity, toilet, tub/shower fixtures",
      ai_guidance: "Don't overtighten toilet bolts. Use plumber's putty sparingly. Test all fixtures before final trim. Caulk between fixtures and tile/walls.",
      typical_duration_days: 2,
      photo_prompts: ["Vanity installed", "Fixtures complete"]
    },
    {
      title: "Final Touches",
      description: "Paint, trim, hardware, final cleaning",
      ai_guidance: "Bathroom paint should be moisture-resistant. Caulk all seams. Ensure exhaust fan works properly. Clean grout haze immediately.",
      typical_duration_days: 1,
      photo_prompts: ["Final result", "Detail shots"]
    }
  ],

  "Exterior Paint": [
    {
      title: "Surface Prep",
      description: "Pressure wash, scrape loose paint, sand, caulk",
      ai_guidance: "Proper prep is 70% of the job. Let siding dry 48hrs after washing. Scrape all loose paint. Caulk gaps but don't over-caulk - wood needs to breathe.",
      typical_duration_days: 3,
      photo_prompts: ["Before washing", "After prep"]
    },
    {
      title: "Prime & Repair",
      description: "Prime bare wood, repair damaged siding",
      ai_guidance: "Prime all bare wood within 48hrs of exposure. Replace rotted boards now. Use exterior-grade primer. Check weather forecast - need 48hrs of no rain.",
      typical_duration_days: 2,
      photo_prompts: ["Primed surfaces", "Repairs completed"]
    },
    {
      title: "First Coat",
      description: "Apply first coat of paint",
      ai_guidance: "Paint in shade, follow the sun around house. Don't paint in direct sun or if below 50°F. Back-brush after spraying for better adhesion. Evening temps matter too.",
      typical_duration_days: 2,
      photo_prompts: ["First coat progress"]
    },
    {
      title: "Second Coat",
      description: "Apply final coat of paint",
      ai_guidance: "Wait minimum time between coats per can instructions. Check for holidays (missed spots). Consistent sheen matters - use same batch of paint.",
      typical_duration_days: 2,
      photo_prompts: ["Second coat complete"]
    },
    {
      title: "Trim & Detail Work",
      description: "Paint trim, shutters, doors",
      ai_guidance: "Trim often needs different sheen than siding. Tape carefully. Multiple thin coats beat one thick coat. Don't forget door edges.",
      typical_duration_days: 2,
      photo_prompts: ["Trim painted", "Details complete"]
    },
    {
      title: "Cleanup & Inspection",
      description: "Remove tape, touch-ups, final walkthrough",
      ai_guidance: "Remove tape while paint is still slightly tacky. Touch up carefully. Take final photos from street level. Save leftover paint for future touch-ups.",
      typical_duration_days: 1,
      photo_prompts: ["Final result", "Street view"]
    }
  ],

  "Deck Addition": [
    {
      title: "Design & Permits",
      description: "Finalize design, submit for permits",
      ai_guidance: "Deck permits typically required if over 30 inches high or attached to house. Check frost depth requirements for footings. HOA approval may be needed.",
      typical_duration_days: 14,
      photo_prompts: ["Site before", "Design plans"]
    },
    {
      title: "Site Prep & Footings",
      description: "Mark layout, dig footings, pour concrete",
      ai_guidance: "Call 811 for utility locate before digging. Footings must go below frost line. Use sonotube forms. Let concrete cure minimum 3 days before loading.",
      typical_duration_days: 3,
      photo_prompts: ["Footings dug", "Concrete poured"]
    },
    {
      title: "Frame & Ledger",
      description: "Attach ledger board, install posts, frame deck",
      ai_guidance: "Ledger MUST be properly flashed and bolted (not screwed). Posts should be plumb. Use joist hangers. Check square at every step.",
      typical_duration_days: 3,
      photo_prompts: ["Ledger attached", "Frame complete"]
    },
    {
      title: "Decking Installation",
      description: "Install deck boards, proper spacing",
      ai_guidance: "Start straightest boards against house. Maintain 1/8 inch gaps for drainage. Pre-drill ends to prevent splitting. Stagger board ends.",
      typical_duration_days: 2,
      photo_prompts: ["Decking progress", "Board pattern"]
    },
    {
      title: "Railing & Stairs",
      description: "Install railings, build stairs",
      ai_guidance: "Railing height: 36-42 inches. Balusters max 4 inch gaps (safety). Stair rise: 7-7.75 inches. Run: 10-11 inches. First/last step critical.",
      typical_duration_days: 3,
      photo_prompts: ["Railings installed", "Stairs complete"]
    },
    {
      title: "Finish & Seal",
      description: "Apply stain/sealant, final inspection",
      ai_guidance: "Wait 2 weeks for wood to dry before staining. Choose stain based on sun exposure. Apply when temps are 50-90°F. Seal annually for longevity.",
      typical_duration_days: 2,
      photo_prompts: ["Finished deck", "Close-up of finish"]
    }
  ],

  "Roof Replacement": [
    {
      title: "Inspection & Planning",
      description: "Roof inspection, material selection, contractor quotes",
      ai_guidance: "Get 3 detailed quotes. Verify contractors are licensed and insured. Check references. Understand warranty (labor vs materials). Consider upgraded underlayment.",
      typical_duration_days: 10,
      photo_prompts: ["Current roof condition", "Problem areas"]
    },
    {
      title: "Preparation",
      description: "Deliver materials, protect landscaping, set up",
      ai_guidance: "Cover AC units, pool, garden beds. Move cars from driveway. Inform neighbors (noise). Materials delivered day before is ideal.",
      typical_duration_days: 1,
      photo_prompts: ["Materials delivered", "Site protected"]
    },
    {
      title: "Tear-Off",
      description: "Remove old shingles, inspect decking",
      ai_guidance: "Check for rotted decking - replace now. Verify drip edge and flashing. This is loudest day - warn family. Magnet sweep critical after.",
      typical_duration_days: 1,
      photo_prompts: ["Old shingles removed", "Decking condition"]
    },
    {
      title: "Decking Repair & Underlayment",
      description: "Replace damaged decking, install ice/water shield",
      ai_guidance: "Ice/water shield on eaves, valleys, penetrations. Synthetic underlayment lasts longer than felt. Overlap properly. Check attic ventilation while open.",
      typical_duration_days: 1,
      photo_prompts: ["New decking", "Underlayment installed"]
    },
    {
      title: "Shingle Installation",
      description: "Install new shingles, ridge cap, vents",
      ai_guidance: "Shingles must be straight from bottom up. 6 nails per shingle minimum. Proper offset pattern prevents leaks. Ridge vent improves attic ventilation.",
      typical_duration_days: 2,
      photo_prompts: ["Shingles going on", "Ridge complete"]
    },
    {
      title: "Cleanup & Final Inspection",
      description: "Magnet sweep, gutter cleaning, final walkthrough",
      ai_guidance: "Magnet sweep driveway/yard for nails. Clean gutters of debris. Check attic for leaks after first rain. Get warranty documents. Update system baseline.",
      typical_duration_days: 1,
      photo_prompts: ["Completed roof", "Clean yard"]
    }
  ],

  "Solar Panel Installation": [
    {
      title: "Site Assessment & Design",
      description: "Solar assessment, system sizing, permit application",
      ai_guidance: "Optimal orientation is south-facing. Shading analysis critical. Size system to offset 80-100% of usage. Federal tax credit is 30%. Get 3 quotes.",
      typical_duration_days: 14
    },
    {
      title: "Permits & Utility Approval",
      description: "Obtain building permits, utility interconnection agreement",
      ai_guidance: "Permits can take 2-4 weeks. Utility approval required before activation. Understand net metering rules in your area. Some utilities have wait lists.",
      typical_duration_days: 21
    },
    {
      title: "Electrical Upgrades",
      description: "Upgrade panel if needed, install disconnect",
      ai_guidance: "Many older panels need upgrading to handle solar. Must have emergency disconnect. Conduit run should be neat and code-compliant.",
      typical_duration_days: 1
    },
    {
      title: "Roof Mounting",
      description: "Install mounting system, attach to rafters",
      ai_guidance: "Mounts must hit rafters, not just decking. Flashing under each mount prevents leaks. Check roof condition - replace roof first if needed (within 5 years).",
      typical_duration_days: 1
    },
    {
      title: "Panel & Inverter Installation",
      description: "Install panels, inverter, wiring",
      ai_guidance: "Micro-inverters vs string inverter - each has pros/cons. Panels should be grounded. Inverter needs ventilation. Monitoring app is essential.",
      typical_duration_days: 1
    },
    {
      title: "Inspection & Activation",
      description: "Building inspection, utility approval, system activation",
      ai_guidance: "Building inspector must approve before activation. Utility does final meter swap. Monitor first month closely. Register for federal tax credit immediately.",
      typical_duration_days: 7
    }
  ],

  "Window Replacement": [
    {
      title: "Selection & Ordering",
      description: "Choose windows, place order",
      ai_guidance: "Measure existing openings carefully. U-factor and SHGC ratings matter for efficiency. Low-E coating worth it. Lead time: 4-6 weeks for custom sizes.",
      typical_duration_days: 10
    },
    {
      title: "Prep & Protection",
      description: "Clear area, protect floors, prep openings",
      ai_guidance: "Move furniture away from windows. Drop cloths on floors. Have backup plan if weather turns - windows open to elements during install.",
      typical_duration_days: 1
    },
    {
      title: "Removal & Inspection",
      description: "Remove old windows, inspect framing",
      ai_guidance: "Check for rot in sill and framing. Must be repaired before new window. Maintain exterior caulk line integrity. Save one old window for measurements.",
      typical_duration_days: 1
    },
    {
      title: "Installation",
      description: "Set new windows, shim, seal",
      ai_guidance: "Windows must be level and plumb. Shim at hinge points. Don't over-shim - can bow frame. Low-expansion foam for gaps. Exterior caulk is critical.",
      typical_duration_days: 2
    },
    {
      title: "Trim & Finish",
      description: "Install interior/exterior trim, paint",
      ai_guidance: "Interior trim conceals gaps. Exterior trim must be caulked and painted. Test window operation before final trim. Adjust if needed.",
      typical_duration_days: 1
    },
    {
      title: "Cleanup & Testing",
      description: "Clean windows, test all functions, final walkthrough",
      ai_guidance: "Remove all stickers/labels. Test locks and operation. Clean glass. Keep warranty documents. Note improved energy efficiency for tracking.",
      typical_duration_days: 1
    }
  ]
};

/**
 * Get milestones for a specific upgrade
 * @param {string} upgradeTitle - Title of the upgrade
 * @param {string} upgradeCategory - Category of the upgrade
 * @returns {array} - Array of milestone objects
 */
export function getMilestonesForUpgrade(upgradeTitle, upgradeCategory) {
  // First try exact title match
  if (UPGRADE_MILESTONES[upgradeTitle]) {
    return UPGRADE_MILESTONES[upgradeTitle].map((m, i) => ({
      ...m,
      id: `milestone-${i}`,
      order: i,
      status: 'Not Started',
      completed_date: null,
      photos: [],
      notes: ''
    }));
  }
  
  // Fall back to generic milestones by category
  const genericMilestones = {
    "High ROI Renovations": [
      { 
        title: "Planning & Budgeting", 
        description: "Define scope and budget",
        ai_guidance: "Get 3 quotes minimum. Compare materials and warranties. Set contingency budget of 15-20%.",
        typical_duration_days: 7
      },
      { 
        title: "Design & Selection", 
        description: "Choose materials and finishes",
        ai_guidance: "Samples are worth it - see materials in your space. Balance aesthetics with ROI. Higher quality often pays back.",
        typical_duration_days: 7
      },
      { 
        title: "Preparation", 
        description: "Order materials, prep area",
        ai_guidance: "Verify lead times. Protect adjacent areas. Have backup plan for living arrangements during work.",
        typical_duration_days: 3
      },
      { 
        title: "Execution", 
        description: "Complete main work",
        ai_guidance: "Daily check-ins if using contractor. Document any changes. Take progress photos. Address issues immediately.",
        typical_duration_days: 7
      },
      { 
        title: "Finishing", 
        description: "Final touches and cleanup",
        ai_guidance: "Walk through with contractor for punch list. Don't accept less than excellent. Touch-ups should be included.",
        typical_duration_days: 2
      },
      { 
        title: "Documentation", 
        description: "Final photos and paperwork",
        ai_guidance: "Get all warranties and receipts. Take before/after photos from same angles. Update property baseline. Get lien releases.",
        typical_duration_days: 1
      }
    ],
    "Energy Efficiency": [
      { title: "Assessment", description: "Evaluate current system", ai_guidance: "Document current energy usage. Identify biggest energy drains. Consider whole-house approach.", typical_duration_days: 3 },
      { title: "Selection", description: "Choose new equipment", ai_guidance: "Higher SEER/efficiency costs more upfront but pays back faster. Look for utility rebates. Verify warranties.", typical_duration_days: 7 },
      { title: "Installation", description: "Install new system", ai_guidance: "Professional installation critical for efficiency equipment. Verify proper sizing. Test all modes before sign-off.", typical_duration_days: 1 },
      { title: "Testing & Commissioning", description: "Verify performance", ai_guidance: "Monitor energy usage first month. Adjust settings as needed. Report issues immediately while under warranty.", typical_duration_days: 30 },
      { title: "Documentation", description: "Record warranties and baselines", ai_guidance: "File all warranty docs. Register products. Update system baseline. Schedule first maintenance. Track savings.", typical_duration_days: 1 }
    ]
  };
  
  const milestones = genericMilestones[upgradeCategory] || genericMilestones["High ROI Renovations"];
  
  return milestones.map((m, i) => ({
    ...m,
    id: `milestone-${i}`,
    order: i,
    status: 'Not Started',
    completed_date: null,
    photos: [],
    notes: ''
  }));
}

/**
 * Initialize milestones when creating a new upgrade project
 * @param {object} template - UpgradeTemplate object
 * @param {string} customTitle - Custom title if user changed it
 * @returns {array} - Initialized milestones
 */
export function initializeMilestones(template, customTitle = null) {
  const title = customTitle || template?.title;
  const category = template?.category || 'High ROI Renovations';
  
  return getMilestonesForUpgrade(title, category);
}