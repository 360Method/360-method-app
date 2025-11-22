// Enhanced system metadata with visual cues and location helpers
export const SYSTEM_METADATA = {
  "HVAC System": {
    emoji: "🌡️❄️",
    color: "#3B82F6",
    whereToFind: "Usually in hallway closet, basement, or garage. Look for large metal box with air filter slot.",
    visualCues: "Metal cabinet with air filter, thermostat on wall, vents in ceiling/floor",
    quickTip: "Check filter monthly - dirty filters reduce efficiency 15%"
  },
  "Plumbing System": {
    emoji: "🚰💧",
    color: "#06B6D4",
    whereToFind: "Water heater in garage/basement/closet. Check under all sinks and behind toilets.",
    visualCues: "Tall cylinder tank (40-80 gallons), copper/PEX pipes, shut-off valves",
    quickTip: "Water heater failure causes $15K+ in flood damage"
  },
  "Electrical System": {
    emoji: "⚡🔌",
    color: "#F59E0B",
    whereToFind: "Gray metal panel box usually in garage, basement, or utility room. Often near water heater.",
    visualCues: "Gray metal box with breakers inside, labeled with room names",
    quickTip: "Electrical issues cause 13% of home fires"
  },
  "Roof System": {
    emoji: "🏠☂️",
    color: "#EF4444",
    whereToFind: "Exterior roof - use binoculars from ground or check attic for leaks/daylight.",
    visualCues: "Shingles (asphalt/tile), flashing around chimney/vents, gutters at edge",
    quickTip: "Small roof leak = $20K-40K disaster in mold and structure"
  },
  "Foundation & Structure": {
    emoji: "🏗️🔨",
    color: "#8B5CF6",
    whereToFind: "Basement/crawlspace walls, exterior perimeter at ground level.",
    visualCues: "Concrete walls/slab, visible cracks, settling, moisture stains",
    quickTip: "Foundation issues cost $20K-100K+ and make homes unsellable"
  },
  "Water & Sewer/Septic": {
    emoji: "💧🚽",
    color: "#10B981",
    whereToFind: "Septic tank in yard (buried), sewer line runs from house to street/tank.",
    visualCues: "Green access cover in yard, cleanout pipe on exterior wall",
    quickTip: "Septic backup or sewer line failure = $5K-15K emergency"
  },
  "Exterior Siding & Envelope": {
    emoji: "🏡🛡️",
    color: "#6366F1",
    whereToFind: "Walk around entire house exterior, check all walls and trim.",
    visualCues: "Siding panels (vinyl/wood/brick), caulking around windows/doors",
    quickTip: "Failed siding causes water intrusion leading to $20K+ damage"
  },
  "Windows & Doors": {
    emoji: "🚪🪟",
    color: "#EC4899",
    whereToFind: "All windows and doors throughout house - interior and exterior.",
    visualCues: "Glass panes, frames, weatherstripping, locks, screens",
    quickTip: "Failed seals account for 30% of heating/cooling loss"
  },
  "Gutters & Downspouts": {
    emoji: "🌧️⬇️",
    color: "#14B8A6",
    whereToFind: "Roof edge perimeter, downspouts at corners directing water away.",
    visualCues: "Metal/vinyl channels along roof edge, downspouts to ground",
    quickTip: "Clogged gutters cause $10K-30K in foundation/basement damage"
  },
  "Landscaping & Grading": {
    emoji: "🌳🏞️",
    color: "#84CC16",
    whereToFind: "Entire yard - check slope away from foundation, sprinklers, drainage.",
    visualCues: "Ground slope, mulch/plants near foundation, drainage channels",
    quickTip: "Poor grading directs water TO foundation causing $15K+ damage"
  },
  "Driveways & Hardscaping": {
    emoji: "🚗🛣️",
    color: "#64748B",
    whereToFind: "Driveway, walkways, patios, retaining walls.",
    visualCues: "Concrete/asphalt cracks, settling, drainage issues",
    quickTip: "Cracks allow water infiltration causing major structural issues"
  },
  "Attic & Insulation": {
    emoji: "⬆️🏠",
    color: "#F97316",
    whereToFind: "Access hatch in ceiling (hallway/closet). Use flashlight and ladder.",
    visualCues: "Pink/yellow insulation batts, roof decking visible, vents",
    quickTip: "Poor ventilation causes $2K/year energy waste + roof damage"
  },
  "Basement/Crawlspace": {
    emoji: "⬇️🕳️",
    color: "#78716C",
    whereToFind: "Basement stairs or crawlspace access door (often exterior). Use flashlight.",
    visualCues: "Concrete/dirt floor, foundation walls, pipes, moisture",
    quickTip: "Moisture here causes mold, rot, and structural failure"
  },
  "Garage & Overhead Door": {
    emoji: "🚗🚪",
    color: "#475569",
    whereToFind: "Garage - check door, opener mechanism, safety sensors.",
    visualCues: "Large door with springs/cables, wall-mounted opener motor",
    quickTip: "Failed springs = $300 repair, failed safety sensors = injury risk"
  },
  "Refrigerator": {
    emoji: "🧊❄️",
    color: "#3B82F6",
    whereToFind: "Kitchen - pull out to check coils on back/bottom.",
    visualCues: "Large appliance, water line if ice maker, coils dusty = inefficient",
    quickTip: "Clean coils annually - saves $150/year in energy"
  },
  "Range/Oven": {
    emoji: "🔥🍳",
    color: "#EF4444",
    whereToFind: "Kitchen - built-in or freestanding unit.",
    visualCues: "Burners/elements, oven door, gas line or 240V plug",
    quickTip: "Gas leaks = fire/explosion risk. Check for odors regularly"
  },
  "Dishwasher": {
    emoji: "🍽️💧",
    color: "#06B6D4",
    whereToFind: "Kitchen - built under counter next to sink.",
    visualCues: "Pull down door, spray arms inside, water line underneath",
    quickTip: "Leaks cause water damage to cabinets and flooring"
  },
  "Washing Machine": {
    emoji: "👕💧",
    color: "#8B5CF6",
    whereToFind: "Laundry room/closet - front or top load.",
    visualCues: "Large drum, hoses to wall (check for bulging/cracks)",
    quickTip: "Burst hoses cause $5K-10K in water damage - replace every 5 years"
  },
  "Dryer": {
    emoji: "👔🔥",
    color: "#F59E0B",
    whereToFind: "Next to washer - vent hose goes to exterior wall.",
    visualCues: "Large drum, lint trap, vent hose (metal preferred)",
    quickTip: "Lint buildup causes 2,900 fires/year - clean vent annually"
  },
  "Microwave": {
    emoji: "📻🍕",
    color: "#6366F1",
    whereToFind: "Kitchen - countertop or over-range mounted.",
    visualCues: "Box with door, turntable inside, vents if over-range",
    quickTip: "Test door seal - damaged seals leak radiation"
  },
  "Garbage Disposal": {
    emoji: "🗑️💧",
    color: "#10B981",
    whereToFind: "Under kitchen sink - black cylinder attached to drain.",
    visualCues: "Motor underneath sink, reset button on bottom, switch on wall",
    quickTip: "Jams = loud noise. Reset button on bottom solves 80% of issues"
  },
  "Smoke Detector": {
    emoji: "🚨💨",
    color: "#EF4444",
    whereToFind: "Ceiling/wall in each bedroom, hallway, living area.",
    visualCues: "Round white disc, test button, battery compartment",
    quickTip: "60% of fire deaths = non-functional detectors. Test monthly!"
  },
  "CO Detector": {
    emoji: "☠️⚠️",
    color: "#DC2626",
    whereToFind: "Wall near bedrooms and fuel-burning appliances.",
    visualCues: "Similar to smoke detector, digital display (optional)",
    quickTip: "Carbon monoxide is invisible/odorless killer. Replace every 5-7 years"
  },
  "Fire Extinguisher": {
    emoji: "🧯🔥",
    color: "#EF4444",
    whereToFind: "Kitchen, garage, near furnace. Mount 3-5ft high.",
    visualCues: "Red cylinder with pressure gauge, hose, and pin",
    quickTip: "Check pressure gauge monthly. Replace after 10-12 years"
  },
  "Security System": {
    emoji: "🔒📹",
    color: "#7C3AED",
    whereToFind: "Entry doors, windows, control panel near main entrance.",
    visualCues: "Sensors on doors/windows, cameras, keypad/touchscreen",
    quickTip: "Test all sensors monthly. Update codes after workers visit"
  },
  "Radon Test": {
    emoji: "☢️🏠",
    color: "#F59E0B",
    whereToFind: "Lowest livable level (basement/ground floor) - test kit or monitor.",
    visualCues: "Small electronic monitor or mail-in test kit",
    quickTip: "Radon = #2 cause of lung cancer. Test every 2 years"
  }
};

export const getSystemMetadata = (systemType) => {
  return SYSTEM_METADATA[systemType] || {
    emoji: "📋",
    color: "#6B7280",
    whereToFind: "Location varies by property.",
    visualCues: "See system documentation for details.",
    quickTip: "Document age and condition for maintenance tracking"
  };
};

export const INSPECTION_AREA_HELPERS = {
  hvac: {
    seasonalFocus: {
      Spring: "Test AC before summer heat. Check filter, clean outdoor unit, listen for odd sounds.",
      Summer: "Monitor cooling efficiency. Check refrigerant levels if not cooling properly.",
      Fall: "Switch to heat test. Check furnace filter, test thermostat, clear vents.",
      Winter: "Monitor heating efficiency. Change filter monthly during heavy use."
    },
    whereToStart: "Start at thermostat, follow to indoor unit (furnace/air handler), then outdoor AC unit."
  },
  plumbing: {
    seasonalFocus: {
      Spring: "Check for winter freeze damage, test outdoor spigots, flush water heater.",
      Summer: "Monitor water heater for leaks/corrosion. Check washing machine hoses.",
      Fall: "Drain outdoor spigots, insulate exposed pipes for freeze protection.",
      Winter: "Prevent frozen pipes - keep faucets dripping in extreme cold."
    },
    whereToStart: "Start at water heater, then check under every sink, behind toilets, and washing machine."
  },
  electrical: {
    seasonalFocus: {
      Spring: "Test GFCI outlets (bathroom/kitchen/outdoor). Check for warm outlets/switches.",
      Summer: "Monitor for overloaded circuits (AC running). Check outdoor outlets.",
      Fall: "Test smoke/CO detectors. Replace batteries. Check holiday light capacity.",
      Winter: "Avoid overloading with space heaters. Check extension cord safety."
    },
    whereToStart: "Start at main panel, check breakers labeled, then test GFCI outlets."
  },
  foundation: {
    seasonalFocus: {
      Spring: "Check for new cracks after winter freeze/thaw. Monitor drainage.",
      Summer: "Watch for soil pulling away from foundation (drought settling).",
      Fall: "Direct water AWAY from foundation. Clean gutters before rain.",
      Winter: "Prevent ice dams. Monitor for foundation cracks from freeze."
    },
    whereToStart: "Walk entire perimeter exterior, then check basement/crawlspace interior walls."
  },
  gutters: {
    seasonalFocus: {
      Spring: "Clear winter debris. Check for loose brackets from ice/snow weight.",
      Summer: "Minor cleaning. Check downspouts direct water 4-6 feet away.",
      Fall: "CRITICAL: Clean before rainy season. Clear all leaves/debris.",
      Winter: "Prevent ice dams. Ensure proper attic ventilation/insulation."
    },
    whereToStart: "Walk perimeter looking up at roof edge. Check downspouts at ground level."
  },
  roof: {
    seasonalFocus: {
      Spring: "Check for winter damage. Look for missing/damaged shingles.",
      Summer: "Inspect from ground with binoculars. Check attic for leaks on hot days.",
      Fall: "Clean debris. Trim overhanging branches. Check flashing.",
      Winter: "Monitor for ice dams. Check attic for moisture/daylight."
    },
    whereToStart: "Use binoculars from ground - look for damaged shingles, then check attic interior."
  }
};