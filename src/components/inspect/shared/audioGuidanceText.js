/**
 * Audio Guidance Text - Voice scripts for the Full Walkthrough
 * Written in friendly, simple language for non-tech users
 */

export const AUDIO_GUIDANCE = {
  // Welcome and setup
  welcome: {
    intro: "Welcome to your full property walkthrough. I'll guide you through each area step by step. Take your time, and tap the button when you're ready to move on.",
    audioToggle: "You can turn voice guidance on or off anytime by tapping the speaker icon.",
    startTip: "Have your phone ready for photos if you spot any issues. Let's get started!"
  },

  // Area-specific guidance
  areas: {
    hvac: {
      intro: "Let's check your heating and cooling system. Walk over to your furnace or air handler.",
      checkpoints: {
        'hvac-filter': "Look at the air filter. Pull it out if you can. A clean filter is white or light gray. If it's dark or clogged with dust, it needs replacing.",
        'hvac-filter-full': "Look at the air filter. Pull it out if you can. A clean filter is white or light gray. If it's dark or clogged with dust, it needs replacing.",
        'hvac-sounds': "Turn on your heating or cooling system and listen. You should hear a normal hum. Any grinding, squealing, or rattling sounds mean something needs attention.",
        'hvac-sounds-full': "Turn on your heating or cooling system and listen carefully. Normal is a quiet hum. Grinding, squealing, rattling, or banging sounds are warning signs.",
        'hvac-airflow': "Walk to the nearest air vent. Can you feel air coming out? Good airflow means the system is working properly.",
        'hvac-vents': "Check a few vents around the house. Make sure they're open, not blocked by furniture, and air is flowing from each one.",
        'hvac-thermostat': "Look at your thermostat. Is the display working? Try adjusting the temperature and see if you hear the system respond.",
        'hvac-condensate': "Look at the floor around your furnace or air conditioner unit. Any water puddles or stains? The floor should be completely dry.",
        'hvac-outdoor': "If you have a central air conditioner, check the outdoor unit. It should be clear of leaves and debris, with plants at least two feet away."
      },
      complete: "Great job checking the HVAC system. This is one of the most important systems in your home."
    },

    plumbing: {
      intro: "Now let's check your plumbing. Start by going to a sink in your home.",
      checkpoints: {
        'plumbing-leaks': "Open the cabinet under your sink and look inside. Is it completely dry? Look for any drips, water stains, or dampness.",
        'plumbing-leaks-full': "Open the cabinet under each sink in your home. Check for any moisture, drips, or water stains. Even small drips can cause big problems.",
        'plumbing-drains': "Run water in the sink. Watch how quickly it drains. It should flow down fast without gurgling sounds.",
        'plumbing-drains-full': "Run water in a few sinks around your home. Each should drain quickly and quietly, without gurgling or backing up.",
        'plumbing-water-heater': "Find your water heater. Look for any rust spots on the outside and check the floor for water. Turn on a hot water faucet to make sure hot water is working.",
        'plumbing-water-heater-full': "At your water heater, check the outside for rust or corrosion. Look at the floor underneath for any water. The area should be completely dry.",
        'plumbing-pressure': "Turn on a faucet all the way. Is the water flow strong and steady, or does it seem weak?",
        'plumbing-toilets': "Flush each toilet. Does it flush with a strong swirl? After flushing, listen - the water should stop running within about 30 seconds.",
        'plumbing-shutoffs': "Do you know where your main water shutoff valve is? In an emergency, you need to be able to turn off all water quickly.",
        'plumbing-exposed': "Look at any visible pipes, like under sinks. Do you see any green or white crusty buildup? That's corrosion and should be checked."
      },
      complete: "Excellent! Catching plumbing issues early can save thousands in water damage."
    },

    electrical: {
      intro: "Let's check your electrical system. Safety first - never touch wires directly.",
      checkpoints: {
        'electrical-panel': "Find your electrical panel, usually in the garage, basement, or utility room. Can you easily reach it? Are the breakers labeled so you know what each one controls?",
        'electrical-panel-full': "Your electrical panel should have at least 3 feet of clear space in front of it. Is the path clear, or are things stored too close?",
        'electrical-gfci': "Find a GFCI outlet - they have Test and Reset buttons, usually in bathrooms or kitchens. Press the Test button, then Reset. The outlet should click off and back on.",
        'electrical-gfci-full': "Test all GFCI outlets in bathrooms, kitchen, garage, and outdoors. Press Test, then Reset on each one. They should all click off and come back on.",
        'electrical-outlets': "Look at a few outlets around the house. Are the faceplates secure and undamaged? Try plugging something in - never any sparks or warmth.",
        'electrical-outlets-full': "Check outlets throughout the house. They should be secure, not cracked or discolored. Never plug in if an outlet feels warm or shows burn marks.",
        'electrical-labels': "Look inside your electrical panel. Is each breaker switch labeled? This helps you quickly find the right breaker in an emergency.",
        'electrical-exposed': "Walk through your home and look for any visible wires that aren't inside walls or covered. All wiring should be protected."
      },
      complete: "Good work! Electrical safety is crucial for your family's wellbeing."
    },

    foundation: {
      intro: "Time to check your foundation. Head to your basement or crawlspace if you have one.",
      checkpoints: {
        'foundation-cracks': "Look at the walls carefully. Small hairline cracks are usually okay. But cracks wider than a pencil, or horizontal cracks, are more serious.",
        'foundation-cracks-full': "Examine basement or crawlspace walls. Vertical hairline cracks are common. Horizontal cracks or cracks wider than a quarter inch need professional attention.",
        'foundation-water': "Is the space dry? Look for any standing water, damp spots on walls, or white powdery deposits. These are signs of moisture problems.",
        'foundation-moisture': "Touch the walls if safe to do so. They should feel dry. Any dampness, even without visible water, is a warning sign.",
        'foundation-smell': "Take a deep breath. Fresh, dry basements smell like concrete. A musty, earthy smell often means hidden moisture or mold.",
        'foundation-mold': "Look for any dark spots or fuzzy growth on walls, floor, or stored items. This could be mold and should be addressed.",
        'foundation-floor': "Look at the floor. Is it level, or do you notice slopes or dips? Check for large cracks in the concrete.",
        'foundation-drainage': "When you're outside later, check if the ground slopes away from your house. Water should naturally flow away from your foundation."
      },
      complete: "Foundation issues caught early are much easier and cheaper to fix. Well done!"
    },

    kitchen: {
      intro: "Let's check your kitchen. We'll look at plumbing and appliances.",
      checkpoints: {
        'kitchen-sink': "Open the cabinet under your kitchen sink. Is it completely dry inside? Look for any drips, stains, or moisture.",
        'kitchen-sink-full': "Check under the sink carefully. Move items aside and look for water, stains, mold, or any musty smell.",
        'kitchen-faucet': "Turn on the kitchen faucet. Is the water pressure good? Turn it off - does it stop completely without dripping?",
        'kitchen-faucet-full': "Test hot and cold water. Both should have good pressure. When you turn off the faucet, it should stop completely - no drips.",
        'kitchen-disposal': "If you have a garbage disposal, run water and turn it on. Does it run smoothly and grind properly?",
        'kitchen-disposal-full': "Run cold water, turn on the disposal. It should run smoothly without jamming. When done, water should drain quickly.",
        'kitchen-dishwasher': "Look at the floor in front of and around your dishwasher. Any water stains? After it runs, open it - is water draining completely?",
        'kitchen-appliances': "Do a quick check - does the stove work? The oven? The microwave? Each appliance should turn on when you try it.",
        'kitchen-fridge': "Is your refrigerator cold? Look at the floor underneath and behind it for any water leaks.",
        'kitchen-stove': "Turn on each stove burner briefly. Each should heat up. If you have gas, the flame should be blue, not yellow.",
        'kitchen-vent': "Turn on your range hood or vent fan above the stove. Does the fan run? Can you feel it pulling air?",
        'kitchen-caulk': "Look at the line of caulk where your sink meets the countertop. Is it solid and intact, or cracked and separating?"
      },
      complete: "Kitchen done! Most kitchen issues are easy to fix when caught early."
    },

    bathrooms: {
      intro: "Now let's check the bathrooms. We'll go through each one.",
      checkpoints: {
        'bath-leaks': "Open the cabinet under the bathroom sink. Check for any water, moisture, or stains inside.",
        'bath-sink-full': "Under each bathroom sink, check carefully for any signs of water - even small drips or old water stains.",
        'bath-toilet': "Flush the toilet. Does it flush with good force? After flushing, listen - it should stop running within 30 seconds.",
        'bath-toilet-full': "Flush and watch the entire cycle. Strong flush, quick refill, and it should stop running completely.",
        'bath-toilet-base': "Look at the floor around the base of the toilet. Is it dry? Gently try to rock the toilet - it shouldn't move at all.",
        'bath-caulk': "Look at the caulk around your bathtub or shower. Is it solid and clean, or is it cracked, peeling, or showing mold?",
        'bath-caulk-full': "Check all caulk lines - around the tub, shower, sink, and toilet base. Solid caulk keeps water where it belongs.",
        'bath-vent': "Turn on the bathroom exhaust fan. Can you feel it pulling air? Hold a tissue near it - it should pull toward the fan.",
        'bath-vent-full': "The exhaust fan should pull air out of the bathroom. If it's weak or noisy, it may need cleaning or replacement.",
        'bath-faucet': "Turn on bathroom faucets. Good pressure? Turn them off - they should stop completely without dripping.",
        'bath-grout': "Look at the grout between tiles in your shower or around the tub. Is it solid and intact, or crumbling and missing in spots?"
      },
      complete: "Bathrooms checked! Water damage from bathrooms is very common but very preventable."
    },

    attic: {
      intro: "Let's check the attic. Be careful on the ladder and watch your step up there.",
      checkpoints: {
        'attic-insulation': "Look at the insulation. Is it spread evenly everywhere, or can you see bare spots or thin areas?",
        'attic-insulation-full': "Good insulation should be 10 to 14 inches deep - about the depth of your hand plus a few inches. Measure if you can.",
        'attic-moisture': "Look at the underside of the roof. Do you see any water stains, dark spots, or actual moisture?",
        'attic-moisture-full': "Examine the roof boards from inside. They should be dry and uniform in color. Stains or discoloration mean water is getting in.",
        'attic-pests': "Look around for any signs of pests - droppings that look like small pellets, nests, or chewed materials.",
        'attic-pests-full': "Check corners and along walls for pest evidence. Rodent droppings, bird nests, or insect damage all need attention.",
        'attic-vents': "Can you see the soffit vents at the edge of the roof? Make sure insulation isn't blocking them - air needs to flow through.",
        'attic-exhaust': "Look for any pipes or ducts that end in the attic. Bathroom and kitchen vents should go all the way outside, not stop in the attic."
      },
      complete: "Attic inspection complete! A healthy attic helps protect your whole house."
    },

    exterior: {
      intro: "Time to walk around the outside of your house. We'll check the siding and overall condition.",
      checkpoints: {
        'exterior-siding': "Walk slowly around your house and look at the siding. Any cracks, holes, or pieces that are damaged or missing?",
        'exterior-siding-full': "Examine the siding closely. Press on it in a few spots - it should feel firm. Soft spots mean rot.",
        'exterior-paint': "How does the paint look? Is it solid and protective, or is it peeling, bubbling, or showing bare wood?",
        'exterior-paint-full': "Paint protects the wood underneath. Peeling or cracking paint means moisture can get in.",
        'exterior-caulk': "Look at the caulk around windows and doors. It should be solid with no gaps. Poke it gently - it should be flexible, not cracked.",
        'exterior-caulk-full': "Check all caulked areas - around windows, doors, and where different materials meet. Any cracks let water in.",
        'exterior-trim': "Look at the trim around windows and doors. Press on it - is it solid, or does it feel soft?",
        'exterior-grade': "Look at the ground next to your foundation. Does it slope away from the house? Water should naturally flow away.",
        'exterior-vents': "Find your dryer vent on the outside. Is the flap clean and moving freely? Blocked dryer vents are a fire hazard."
      },
      complete: "Exterior check complete! The outside of your home is your first line of defense."
    },

    gutters: {
      intro: "Let's check the gutters. You may need to look up or use a ladder for some of this.",
      checkpoints: {
        'gutters-debris': "Look into the gutters if you can safely see them. Are they clear, or filled with leaves and debris?",
        'gutters-debris-full': "Gutters should be completely clear so water can flow freely. Debris leads to clogs and overflows.",
        'gutters-secure': "Walk along and look at how the gutters attach to the house. Do they look straight and tight, or are they sagging or pulling away?",
        'gutters-secure-full': "Gutters should be firmly attached and level or slightly sloping toward downspouts. Sagging means they're holding water.",
        'gutters-downspouts': "Follow each downspout to the ground. Where does the water go? It should direct water at least 4 feet away from your foundation.",
        'gutters-downspouts-full': "Every downspout needs an extension or splash block to move water away from the house. Water at the foundation causes big problems.",
        'gutters-leaks': "On a rainy day or after rain, look for water dripping from gutter seams or joints.",
        'gutters-rust': "Look for rust spots or holes in the gutters, especially at joints and corners."
      },
      complete: "Gutters done! Clean gutters protect your foundation, siding, and landscaping."
    },

    roof: {
      intro: "Now let's check the roof. You can do most of this from the ground with a good look.",
      checkpoints: {
        'roof-shingles': "Look at your roof from the ground. Do all the shingles look flat and in place? Look for any that are curled, cracked, or missing.",
        'roof-shingles-full': "Scan the entire roof surface. Every shingle should be flat and overlapping properly. Missing or damaged shingles let water in.",
        'roof-flashing': "Look at the metal pieces around chimneys, vents, and where the roof meets walls. They should be tight and not lifted up.",
        'roof-flashing-full': "Flashing is the metal that seals joints and edges. If it's lifted, rusted, or has gaps, water will find its way in.",
        'roof-moss': "Do you see any green moss or dark streaks on the roof? Some is normal in wet climates, but heavy growth can damage shingles.",
        'roof-moss-full': "Moss holds moisture against shingles. Dark streaks are algae. Both should be treated to extend roof life.",
        'roof-vents': "Look at the vents on your roof - plumbing pipes, exhaust fans. Do they all have caps and look sealed?",
        'roof-chimney': "If you have a chimney, does it have a cap on top? Is the flashing around the base intact?",
        'roof-valleys': "Look at the valleys where two roof sections meet. These are common leak points. They should be clear of debris."
      },
      complete: "Roof inspection done! Your roof is your home's umbrella - keeping it healthy is essential."
    },

    driveways: {
      intro: "Let's check your driveway and walkways. Walk the full length looking carefully.",
      checkpoints: {
        'driveway-cracks': "Walk your driveway and look for cracks. Small hairline cracks are normal. Larger cracks that you can fit a finger into should be sealed.",
        'driveway-cracks-full': "Look for cracks wider than a quarter inch. These let water in, which freezes and makes cracks bigger.",
        'driveway-level': "As you walk, feel for uneven spots. Are there raised sections or sunken areas that could be trip hazards?",
        'driveway-settling': "Look for areas where the concrete or asphalt has sunk. This usually means soil problems underneath.",
        'driveway-drainage': "After rain, does water sit on the driveway, or does it drain away? Standing water damages the surface over time.",
        'driveway-drainage-full': "Good drainage means no puddles within a day of rain. If water pools, you may need drainage improvements.",
        'driveway-edge': "Check the edges of your driveway. Are they solid, or crumbling and breaking apart?"
      },
      complete: "Driveway check complete! Sealing cracks early prevents expensive replacement later."
    },

    windows: {
      intro: "Let's check your windows and doors. Go around to each one.",
      checkpoints: {
        'windows-seals': "Look through your windows. Do you see any fog or moisture trapped between the two panes of glass? This means the seal has failed.",
        'windows-seals-full': "A fogged window means the seal is broken and insulation is compromised. The window will need replacement eventually.",
        'windows-operation': "Try opening and closing a few windows. They should move smoothly without force or sticking.",
        'windows-operation-full': "Every window should open, close, and lock easily. Difficulty usually means the frame has shifted or hardware needs attention.",
        'windows-locks': "Try the locks on several windows. They should click into place firmly and hold the window closed.",
        'windows-weather': "Look at the weatherstripping around windows - the rubber or foam seal. Is it intact, or is it cracked, torn, or missing?",
        'windows-weather-full': "Good weatherstripping keeps drafts out and conditioned air in. Damaged weatherstripping means higher energy bills.",
        'windows-caulk': "From outside, look at the caulk around window frames. It should be solid with no cracks or gaps."
      },
      complete: "Windows and doors checked! Good seals save energy and keep your home comfortable."
    },

    safety: {
      intro: "Finally, let's check your safety systems. This is the most important check of all.",
      checkpoints: {
        'safety-smoke': "Find each smoke detector in your home. Press and hold the test button. You should hear a loud beep.",
        'safety-smoke-full': "Test every smoke detector. There should be one on each level and near each sleeping area. Press test button until it beeps.",
        'safety-smoke-age': "Look for a manufacture date on your smoke detectors. They should be replaced every 10 years.",
        'safety-co': "Find your carbon monoxide detectors. Press the test button on each one to make sure they work.",
        'safety-co-full': "Carbon monoxide is invisible and deadly. Test each detector. They should be near bedrooms and on each level.",
        'safety-extinguisher': "Find your fire extinguisher. Look at the pressure gauge - the needle should be in the green zone.",
        'safety-extinguisher-full': "Your fire extinguisher should be easily accessible, with the gauge in green. Check the expiration date too.",
        'safety-batteries': "Have you replaced the batteries in your detectors this year? If not, now is a good time.",
        'safety-escape': "Does your family know two ways out of each room in case of fire? It's worth discussing and practicing.",
        'safety-radon': "If you haven't tested for radon in the past few years, consider getting a test kit. It's an invisible danger."
      },
      complete: "Safety check complete! Your family's safety is the most important thing your home protects."
    }
  },

  // Completion messages
  completion: {
    allDone: "Congratulations! You've completed your full property walkthrough. You should feel proud - you're taking great care of your home.",
    issuesFound: "We found some items that need attention. Don't worry - catching these early means easier and cheaper fixes.",
    noIssues: "Great news! Everything looks good. Your home is in excellent shape.",
    reportReady: "Your inspection report is ready. It shows exactly what needs attention and what's in good shape.",
    nextSteps: "Check your Priority Queue to see recommended next steps, organized by urgency."
  }
};

// Helper function to get audio text for a checkpoint
export const getCheckpointAudio = (areaId, checkpointId) => {
  const areaGuidance = AUDIO_GUIDANCE.areas[areaId];
  if (!areaGuidance || !areaGuidance.checkpoints) return null;
  return areaGuidance.checkpoints[checkpointId] || null;
};

// Helper function to get area intro
export const getAreaIntro = (areaId) => {
  const areaGuidance = AUDIO_GUIDANCE.areas[areaId];
  return areaGuidance?.intro || null;
};

// Helper function to get area completion message
export const getAreaComplete = (areaId) => {
  const areaGuidance = AUDIO_GUIDANCE.areas[areaId];
  return areaGuidance?.complete || null;
};
