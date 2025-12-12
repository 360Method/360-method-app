/**
 * Inspection Checkpoints - Yes/No questions for each area
 * Quick checkpoints: 3-4 essential questions
 * Full checkpoints: 5-8 comprehensive questions
 */

export const INSPECTION_CHECKPOINTS = {
  hvac: {
    quick: [
      {
        id: 'hvac-filter',
        question: 'Is the air filter clean?',
        goodDescription: 'Filter is white/light gray, air flows freely',
        badDescription: 'Filter is dark, clogged with dust/debris',
        severity: 'Flag', // if answered "no"
        photoExample: true
      },
      {
        id: 'hvac-sounds',
        question: 'Does the system run quietly?',
        goodDescription: 'Normal hum, no grinding or squealing',
        badDescription: 'Grinding, squealing, rattling, or banging sounds',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'hvac-airflow',
        question: 'Is air coming from the vents?',
        goodDescription: 'Strong, steady airflow from all vents',
        badDescription: 'Weak or no airflow from some vents',
        severity: 'Flag',
        photoExample: false
      }
    ],
    full: [
      {
        id: 'hvac-filter-full',
        question: 'Is the air filter clean?',
        goodDescription: 'Filter is white/light gray, air flows freely',
        badDescription: 'Filter is dark, clogged with dust/debris',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'hvac-sounds-full',
        question: 'Does the system run quietly without unusual sounds?',
        goodDescription: 'Normal hum only',
        badDescription: 'Grinding, squealing, rattling, or banging',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'hvac-vents',
        question: 'Are all vents clear and providing airflow?',
        goodDescription: 'All vents open, unobstructed, good airflow',
        badDescription: 'Blocked vents or weak airflow',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'hvac-thermostat',
        question: 'Does the thermostat respond correctly?',
        goodDescription: 'Display works, system responds to changes',
        badDescription: 'Blank display, no response, wrong temperature',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'hvac-condensate',
        question: 'Is the area around the unit dry (no water leaks)?',
        goodDescription: 'Floor is dry, no water stains',
        badDescription: 'Puddles, water stains, or moisture',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'hvac-outdoor',
        question: 'Is the outdoor unit clear of debris?',
        goodDescription: 'Clear of leaves, plants 2ft away',
        badDescription: 'Covered in debris, plants too close',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  plumbing: {
    quick: [
      {
        id: 'plumbing-leaks',
        question: 'Any visible water leaks under sinks?',
        goodDescription: 'Dry under all sinks, no drips',
        badDescription: 'Water puddles, drips, or water stains',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'plumbing-drains',
        question: 'Do all drains flow freely?',
        goodDescription: 'Water drains quickly, no gurgling',
        badDescription: 'Slow drains or standing water',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'plumbing-water-heater',
        question: 'Is the water heater working without rust?',
        goodDescription: 'Hot water available, no visible rust',
        badDescription: 'No hot water, rust spots, or leaks',
        severity: 'Urgent',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'plumbing-leaks-full',
        question: 'Are all areas under sinks completely dry?',
        goodDescription: 'No moisture, stains, or drips',
        badDescription: 'Water puddles, stains, or active drips',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'plumbing-pressure',
        question: 'Is water pressure good at all faucets?',
        goodDescription: 'Strong, consistent flow',
        badDescription: 'Weak flow or sputtering',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'plumbing-drains-full',
        question: 'Do all drains flow freely without gurgling?',
        goodDescription: 'Fast drain, no sounds',
        badDescription: 'Slow, gurgling, or backed up',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'plumbing-toilets',
        question: 'Do all toilets flush properly without running?',
        goodDescription: 'Clean flush, stops running quickly',
        badDescription: 'Weak flush or continuously running',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'plumbing-water-heater-full',
        question: 'Is the water heater free of rust and leaks?',
        goodDescription: 'Clean exterior, dry floor',
        badDescription: 'Rust, corrosion, or water puddles',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'plumbing-shutoffs',
        question: 'Do you know where the main water shutoff is?',
        goodDescription: 'Location known and accessible',
        badDescription: 'Unknown location or blocked access',
        severity: 'Monitor',
        photoExample: false
      },
      {
        id: 'plumbing-exposed',
        question: 'Are visible pipes free of corrosion?',
        goodDescription: 'Clean pipes, no green or white buildup',
        badDescription: 'Corrosion, mineral deposits, or stains',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  electrical: {
    quick: [
      {
        id: 'electrical-panel',
        question: 'Is the electrical panel accessible and labeled?',
        goodDescription: 'Easy to access, breakers labeled',
        badDescription: 'Blocked, unlabeled, or damaged',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'electrical-gfci',
        question: 'Do GFCI outlets work (test/reset buttons)?',
        goodDescription: 'Test button trips, reset restores power',
        badDescription: 'Buttons don\'t work or won\'t reset',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'electrical-outlets',
        question: 'Are all outlets working without sparks?',
        goodDescription: 'All outlets provide power, no sparks',
        badDescription: 'Dead outlets, sparks, or warm plates',
        severity: 'Urgent',
        photoExample: false
      }
    ],
    full: [
      {
        id: 'electrical-panel-full',
        question: 'Is the electrical panel accessible with 3ft clearance?',
        goodDescription: 'Clear path, nothing blocking panel',
        badDescription: 'Items blocking or too close',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'electrical-labels',
        question: 'Are all circuit breakers labeled correctly?',
        goodDescription: 'Each breaker clearly labeled',
        badDescription: 'Missing or incorrect labels',
        severity: 'Monitor',
        photoExample: false
      },
      {
        id: 'electrical-gfci-full',
        question: 'Do all GFCI outlets test and reset properly?',
        goodDescription: 'All test/reset buttons work',
        badDescription: 'Failed test or won\'t reset',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'electrical-outlets-full',
        question: 'Are all outlets secure without damage?',
        goodDescription: 'Tight, no cracks or discoloration',
        badDescription: 'Loose, cracked, or discolored',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'electrical-exposed',
        question: 'Is all wiring properly covered (no exposed wires)?',
        goodDescription: 'All wiring in conduit or behind walls',
        badDescription: 'Exposed or hanging wires visible',
        severity: 'Urgent',
        photoExample: true
      }
    ]
  },

  foundation: {
    quick: [
      {
        id: 'foundation-cracks',
        question: 'Are the walls free of large cracks?',
        goodDescription: 'No cracks, or only hairline cracks',
        badDescription: 'Cracks wider than 1/4 inch',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'foundation-water',
        question: 'Is the basement/crawlspace dry?',
        goodDescription: 'No water, moisture, or stains',
        badDescription: 'Water, dampness, or water stains',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'foundation-smell',
        question: 'Is it free of musty/mold smells?',
        goodDescription: 'Normal air, no musty odor',
        badDescription: 'Musty, earthy, or mold smell',
        severity: 'Flag',
        photoExample: false
      }
    ],
    full: [
      {
        id: 'foundation-cracks-full',
        question: 'Are walls free of cracks wider than 1/4 inch?',
        goodDescription: 'Solid walls or only hairline cracks',
        badDescription: 'Visible cracks, especially horizontal',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'foundation-floor',
        question: 'Is the floor level without major cracks?',
        goodDescription: 'Level floor, no large cracks',
        badDescription: 'Uneven, sloping, or cracked',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'foundation-moisture',
        question: 'Are walls and floor completely dry?',
        goodDescription: 'Dry to touch, no stains',
        badDescription: 'Damp, wet, or white mineral deposits',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'foundation-mold',
        question: 'Is it free of mold or mildew?',
        goodDescription: 'No visible mold or musty smell',
        badDescription: 'Mold spots, musty odor',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'foundation-drainage',
        question: 'Is water draining away from the foundation outside?',
        goodDescription: 'Ground slopes away from house',
        badDescription: 'Water pooling near foundation',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  kitchen: {
    quick: [
      {
        id: 'kitchen-sink',
        question: 'Is the area under the sink dry?',
        goodDescription: 'Completely dry, no stains',
        badDescription: 'Water, dampness, or stains',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'kitchen-disposal',
        question: 'Does the garbage disposal work?',
        goodDescription: 'Runs smoothly, drains well',
        badDescription: 'Won\'t turn on, jams, or leaks',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'kitchen-faucet',
        question: 'Does the faucet work without dripping?',
        goodDescription: 'Good flow, stops completely',
        badDescription: 'Drips when off, low pressure',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'kitchen-appliances',
        question: 'Are all appliances working?',
        goodDescription: 'All turn on and function properly',
        badDescription: 'Any appliance not working',
        severity: 'Flag',
        photoExample: false
      }
    ],
    full: [
      {
        id: 'kitchen-sink-full',
        question: 'Is the area under the sink completely dry?',
        goodDescription: 'Dry, no stains or moisture',
        badDescription: 'Any water, stains, or dampness',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'kitchen-faucet-full',
        question: 'Does the faucet have good pressure and no drips?',
        goodDescription: 'Strong flow, stops completely when off',
        badDescription: 'Weak flow or dripping',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'kitchen-disposal-full',
        question: 'Does the garbage disposal run smoothly?',
        goodDescription: 'Turns on, grinds, drains well',
        badDescription: 'Won\'t run, jams, or leaks',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'kitchen-dishwasher',
        question: 'Is the dishwasher leak-free and draining?',
        goodDescription: 'No leaks, drains completely',
        badDescription: 'Water underneath or standing water inside',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'kitchen-fridge',
        question: 'Is the refrigerator cold and leak-free?',
        goodDescription: 'Cold inside, dry underneath',
        badDescription: 'Not cold enough or water leaking',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'kitchen-stove',
        question: 'Do all stove burners and oven work?',
        goodDescription: 'All burners heat, oven reaches temperature',
        badDescription: 'Any burner not working',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'kitchen-vent',
        question: 'Does the range hood/vent work?',
        goodDescription: 'Fan runs, vents outside or filters air',
        badDescription: 'Won\'t turn on or weak suction',
        severity: 'Monitor',
        photoExample: false
      },
      {
        id: 'kitchen-caulk',
        question: 'Is the caulking around the sink intact?',
        goodDescription: 'Solid caulk line, no gaps',
        badDescription: 'Cracked, missing, or moldy caulk',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  bathrooms: {
    quick: [
      {
        id: 'bath-leaks',
        question: 'Is the area under the sink dry?',
        goodDescription: 'Completely dry, no stains',
        badDescription: 'Water, dampness, or stains',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'bath-toilet',
        question: 'Does the toilet flush and stop running?',
        goodDescription: 'Flushes well, stops within 30 seconds',
        badDescription: 'Weak flush or keeps running',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'bath-caulk',
        question: 'Is the caulking around tub/shower intact?',
        goodDescription: 'Solid caulk, no gaps or mold',
        badDescription: 'Cracked, missing, or moldy',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'bath-vent',
        question: 'Does the exhaust fan work?',
        goodDescription: 'Runs and pulls air out',
        badDescription: 'Won\'t turn on or weak',
        severity: 'Flag',
        photoExample: false
      }
    ],
    full: [
      {
        id: 'bath-sink-full',
        question: 'Is under the sink completely dry?',
        goodDescription: 'No water, stains, or moisture',
        badDescription: 'Any wetness or water stains',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'bath-faucet',
        question: 'Do faucets work without dripping?',
        goodDescription: 'Good pressure, stop completely',
        badDescription: 'Drips or low pressure',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'bath-toilet-full',
        question: 'Does the toilet flush properly and stop running?',
        goodDescription: 'Strong flush, stops within 30 seconds',
        badDescription: 'Weak flush or continuously running',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'bath-toilet-base',
        question: 'Is the base of the toilet dry and stable?',
        goodDescription: 'Dry floor, toilet doesn\'t rock',
        badDescription: 'Water at base or toilet moves',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'bath-caulk-full',
        question: 'Is all caulking intact without mold?',
        goodDescription: 'Solid caulk lines, no mold',
        badDescription: 'Cracked, missing, or moldy caulk',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'bath-vent-full',
        question: 'Does the exhaust fan work and vent outside?',
        goodDescription: 'Runs, pulls air, vents outside',
        badDescription: 'Doesn\'t work or vents into attic',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'bath-grout',
        question: 'Is the grout in good condition?',
        goodDescription: 'Solid grout, no cracks or missing pieces',
        badDescription: 'Crumbling, missing, or stained grout',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  attic: {
    quick: [
      {
        id: 'attic-insulation',
        question: 'Is insulation evenly spread?',
        goodDescription: 'Even coverage, no bare spots',
        badDescription: 'Thin spots or missing insulation',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'attic-moisture',
        question: 'Is the attic dry with no water stains?',
        goodDescription: 'Dry wood, no stains',
        badDescription: 'Water stains, damp wood, or mold',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'attic-pests',
        question: 'Any signs of pests (droppings, nests)?',
        goodDescription: 'No droppings, nests, or damage',
        badDescription: 'Droppings, nests, or chewed materials',
        severity: 'Flag',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'attic-insulation-full',
        question: 'Is insulation at least 10-14 inches deep?',
        goodDescription: 'Deep, even insulation throughout',
        badDescription: 'Thin, compressed, or missing',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'attic-vents',
        question: 'Are soffit and ridge vents clear?',
        goodDescription: 'All vents open and unblocked',
        badDescription: 'Blocked by insulation or debris',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'attic-moisture-full',
        question: 'Is the roof deck dry without stains?',
        goodDescription: 'Dry wood, no discoloration',
        badDescription: 'Water stains, wet spots, or mold',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'attic-pests-full',
        question: 'Is it free of pest evidence?',
        goodDescription: 'No droppings, nests, or damage',
        badDescription: 'Signs of rodents, birds, or insects',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'attic-exhaust',
        question: 'Do bathroom/kitchen vents exit through the roof?',
        goodDescription: 'Vents go outside, not into attic',
        badDescription: 'Vents terminate in attic',
        severity: 'Urgent',
        photoExample: true
      }
    ]
  },

  exterior: {
    quick: [
      {
        id: 'exterior-siding',
        question: 'Is the siding free of damage?',
        goodDescription: 'No cracks, holes, or missing pieces',
        badDescription: 'Damage, rot, or missing sections',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-paint',
        question: 'Is paint in good condition?',
        goodDescription: 'Solid paint, no peeling or bubbling',
        badDescription: 'Peeling, bubbling, or bare wood',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-caulk',
        question: 'Is caulking around windows/doors intact?',
        goodDescription: 'Solid caulk, no gaps',
        badDescription: 'Cracked, missing, or separated caulk',
        severity: 'Flag',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'exterior-siding-full',
        question: 'Is siding free of cracks, holes, or rot?',
        goodDescription: 'Solid siding, no damage',
        badDescription: 'Cracks, holes, soft spots, or rot',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-paint-full',
        question: 'Is exterior paint in good condition?',
        goodDescription: 'Solid paint coverage',
        badDescription: 'Peeling, cracking, or fading',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-trim',
        question: 'Is trim around windows/doors solid?',
        goodDescription: 'Firm trim, no rot or gaps',
        badDescription: 'Soft, rotted, or separated trim',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-caulk-full',
        question: 'Is caulking at all joints intact?',
        goodDescription: 'Solid caulk lines everywhere',
        badDescription: 'Missing, cracked, or failing caulk',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-grade',
        question: 'Does ground slope away from the house?',
        goodDescription: 'Ground slopes away for drainage',
        badDescription: 'Ground slopes toward house or flat',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'exterior-vents',
        question: 'Are dryer/exhaust vents clear?',
        goodDescription: 'Vents unobstructed, damper works',
        badDescription: 'Blocked, damaged, or missing cover',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  gutters: {
    quick: [
      {
        id: 'gutters-debris',
        question: 'Are gutters free of debris?',
        goodDescription: 'Clear gutters, water flows freely',
        badDescription: 'Leaves, dirt, or blockages',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'gutters-secure',
        question: 'Are gutters securely attached?',
        goodDescription: 'Tight to house, no sagging',
        badDescription: 'Sagging, loose, or pulling away',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'gutters-downspouts',
        question: 'Do downspouts direct water away?',
        goodDescription: 'Extensions move water 4+ feet away',
        badDescription: 'Dumping at foundation',
        severity: 'Urgent',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'gutters-debris-full',
        question: 'Are gutters clear of all debris?',
        goodDescription: 'Completely clear, water flows',
        badDescription: 'Debris buildup blocking flow',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'gutters-secure-full',
        question: 'Are all gutters securely attached?',
        goodDescription: 'Tight, level, no gaps',
        badDescription: 'Sagging, loose, or separated',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'gutters-leaks',
        question: 'Are gutter seams leak-free?',
        goodDescription: 'No drips at joints',
        badDescription: 'Water leaking at seams/corners',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'gutters-downspouts-full',
        question: 'Do downspouts move water at least 4ft from foundation?',
        goodDescription: 'Extensions or splash blocks in place',
        badDescription: 'Water dumping near foundation',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'gutters-rust',
        question: 'Are gutters free of rust or holes?',
        goodDescription: 'Solid metal, no rust spots',
        badDescription: 'Rust, corrosion, or holes',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  roof: {
    quick: [
      {
        id: 'roof-shingles',
        question: 'Are all shingles in place?',
        goodDescription: 'All shingles flat and intact',
        badDescription: 'Missing, curled, or damaged shingles',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'roof-flashing',
        question: 'Is flashing around vents intact?',
        goodDescription: 'Flashing sealed, no gaps',
        badDescription: 'Lifted, rusted, or missing flashing',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'roof-moss',
        question: 'Is the roof free of moss/algae?',
        goodDescription: 'Clean roof surface',
        badDescription: 'Moss, algae, or dark streaks',
        severity: 'Flag',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'roof-shingles-full',
        question: 'Are all shingles flat, intact, and in place?',
        goodDescription: 'Complete coverage, no damage',
        badDescription: 'Missing, curled, cracked, or lifted',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'roof-flashing-full',
        question: 'Is all flashing properly sealed?',
        goodDescription: 'Tight, sealed, no rust',
        badDescription: 'Lifted, rusty, or gaps visible',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'roof-vents',
        question: 'Are roof vents intact with no damage?',
        goodDescription: 'All vents secure and sealed',
        badDescription: 'Cracked, missing caps, or damaged',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'roof-moss-full',
        question: 'Is roof free of moss, algae, or debris?',
        goodDescription: 'Clean roof surface',
        badDescription: 'Growth or debris accumulation',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'roof-chimney',
        question: 'Is chimney cap and flashing intact?',
        goodDescription: 'Cap in place, flashing sealed',
        badDescription: 'Missing cap or failing flashing',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'roof-valleys',
        question: 'Are roof valleys clear and sealed?',
        goodDescription: 'Clear valleys, no debris buildup',
        badDescription: 'Debris or damaged valley flashing',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  driveways: {
    quick: [
      {
        id: 'driveway-cracks',
        question: 'Is the driveway free of large cracks?',
        goodDescription: 'Smooth surface or only hairline cracks',
        badDescription: 'Cracks wider than 1/4 inch',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'driveway-level',
        question: 'Is the surface level without trip hazards?',
        goodDescription: 'Even surface, no raised sections',
        badDescription: 'Uneven, heaving, or sunken areas',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'driveway-drainage',
        question: 'Does water drain away properly?',
        goodDescription: 'Water flows away, no puddles',
        badDescription: 'Standing water or pooling',
        severity: 'Flag',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'driveway-cracks-full',
        question: 'Are there any cracks wider than 1/4 inch?',
        goodDescription: 'Solid surface, minor hairlines only',
        badDescription: 'Large cracks or spreading damage',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'driveway-settling',
        question: 'Is the surface level without settling?',
        goodDescription: 'Even grade throughout',
        badDescription: 'Sunken areas or heaving',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'driveway-drainage-full',
        question: 'Does water drain properly after rain?',
        goodDescription: 'Drains within hours, no standing water',
        badDescription: 'Persistent puddles or poor drainage',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'driveway-edge',
        question: 'Are edges intact without crumbling?',
        goodDescription: 'Solid edges, no breakdown',
        badDescription: 'Crumbling or broken edges',
        severity: 'Monitor',
        photoExample: true
      }
    ]
  },

  windows: {
    quick: [
      {
        id: 'windows-seals',
        question: 'Are window seals intact (no fog between panes)?',
        goodDescription: 'Clear glass, no fogging',
        badDescription: 'Fog or moisture between panes',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'windows-operation',
        question: 'Do all windows open and close easily?',
        goodDescription: 'Smooth operation, locks work',
        badDescription: 'Stuck, hard to move, or won\'t lock',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'windows-weather',
        question: 'Is weatherstripping intact?',
        goodDescription: 'Solid seal, no gaps',
        badDescription: 'Missing, torn, or compressed',
        severity: 'Flag',
        photoExample: true
      }
    ],
    full: [
      {
        id: 'windows-seals-full',
        question: 'Are all window seals intact without fogging?',
        goodDescription: 'Clear panes, no seal failure',
        badDescription: 'Fogged, moisture, or condensation',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'windows-operation-full',
        question: 'Do all windows operate smoothly?',
        goodDescription: 'Open, close, and lock easily',
        badDescription: 'Stuck, binding, or difficult',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'windows-locks',
        question: 'Do all window locks engage properly?',
        goodDescription: 'All locks work and hold',
        badDescription: 'Broken, stuck, or missing locks',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'windows-weather-full',
        question: 'Is weatherstripping in good condition?',
        goodDescription: 'Tight seal, no light visible',
        badDescription: 'Gaps, torn, or missing sections',
        severity: 'Flag',
        photoExample: true
      },
      {
        id: 'windows-caulk',
        question: 'Is exterior caulking around windows intact?',
        goodDescription: 'Solid caulk, no cracks or gaps',
        badDescription: 'Cracked, missing, or separated',
        severity: 'Flag',
        photoExample: true
      }
    ]
  },

  safety: {
    quick: [
      {
        id: 'safety-smoke',
        question: 'Do all smoke detectors work?',
        goodDescription: 'All beep when tested',
        badDescription: 'Any detector not working or missing',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'safety-co',
        question: 'Do all CO detectors work?',
        goodDescription: 'All beep when tested',
        badDescription: 'Any detector not working or missing',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'safety-extinguisher',
        question: 'Is the fire extinguisher charged?',
        goodDescription: 'Gauge in green zone',
        badDescription: 'Gauge in red or expired',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'safety-batteries',
        question: 'Were detector batteries replaced this year?',
        goodDescription: 'Replaced within 12 months',
        badDescription: 'Unknown or over 12 months',
        severity: 'Flag',
        photoExample: false
      }
    ],
    full: [
      {
        id: 'safety-smoke-full',
        question: 'Are smoke detectors on every level and tested?',
        goodDescription: 'Every level covered, all test okay',
        badDescription: 'Missing levels or failed tests',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'safety-smoke-age',
        question: 'Are smoke detectors less than 10 years old?',
        goodDescription: 'Manufacture date within 10 years',
        badDescription: 'Over 10 years or unknown age',
        severity: 'Flag',
        photoExample: false
      },
      {
        id: 'safety-co-full',
        question: 'Are CO detectors near bedrooms and tested?',
        goodDescription: 'Near sleeping areas, all test okay',
        badDescription: 'Poorly located or failed tests',
        severity: 'Urgent',
        photoExample: false
      },
      {
        id: 'safety-extinguisher-full',
        question: 'Is fire extinguisher accessible and charged?',
        goodDescription: 'Easy access, gauge shows full',
        badDescription: 'Blocked, empty, or expired',
        severity: 'Urgent',
        photoExample: true
      },
      {
        id: 'safety-escape',
        question: 'Do you have a fire escape plan?',
        goodDescription: 'Family knows two exits from each room',
        badDescription: 'No plan or family doesn\'t know it',
        severity: 'Monitor',
        photoExample: false
      },
      {
        id: 'safety-radon',
        question: 'Has radon been tested (if applicable)?',
        goodDescription: 'Tested and under 4 pCi/L or mitigated',
        badDescription: 'Never tested or high levels',
        severity: 'Flag',
        photoExample: false
      }
    ]
  }
};

// Helper functions
export const getCheckpointsForArea = (areaId, mode = 'quick') => {
  const areaCheckpoints = INSPECTION_CHECKPOINTS[areaId];
  if (!areaCheckpoints) return [];
  return areaCheckpoints[mode] || areaCheckpoints.quick || [];
};

export const getAllQuickCheckpoints = () => {
  return Object.entries(INSPECTION_CHECKPOINTS).reduce((acc, [areaId, checkpoints]) => {
    acc[areaId] = checkpoints.quick || [];
    return acc;
  }, {});
};

export const getAllFullCheckpoints = () => {
  return Object.entries(INSPECTION_CHECKPOINTS).reduce((acc, [areaId, checkpoints]) => {
    acc[areaId] = checkpoints.full || [];
    return acc;
  }, {});
};
