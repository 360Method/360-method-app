// Helper to get dates relative to today - called dynamically
const getToday = () => new Date().toISOString().split('T')[0];
const getDaysFromNow = (days) => new Date(Date.now() + 86400000 * days).toISOString().split('T')[0];
const getDaysAgo = (days) => new Date(Date.now() - 86400000 * days).toISOString().split('T')[0];

// Function that returns fresh demo data with dynamic dates
export const getDemoPropertyStruggling = () => ({
  property: {
    id: 'demo-struggling-001',
    address: '1847 Riverside Drive',
    street_address: '1847 Riverside Drive',
    city: 'Vancouver',
    state: 'WA',
    zip_code: '98661',
    property_type: 'Single-Family Home',
    year_built: 2010,
    square_footage: 1850,
    bedrooms: 3,
    bathrooms: 2,
    stories: 'Single-Story',
    foundation_type: 'Concrete Slab',
    garage_type: 'Attached 2-car',
    is_demo: true,
    demo_type: 'struggling',
    baseline_completion: 20,
    health_score: 62,
    last_inspection_date: null,
    // Financial fields for Scale page
    current_value: 340000,
    mortgage_balance: 198000,
    monthly_mortgage_payment: 1350,
    total_maintenance_spent: 0,
    estimated_disasters_prevented: 0,
    certificationLevel: null,
    breakdown: { condition: 26, maintenance: 18, improvement: 18 },
    created_date: '2025-01-01T00:00:00Z'
  },
  
  systems: [
    {
      id: 'demo-s-sys-001',
      property_id: 'demo-struggling-001',
      system_type: 'HVAC System',
      nickname: 'Main HVAC',
      brand_model: 'Carrier 3-Ton Heat Pump',
      installation_year: 2007,
      condition: 'Fair',
      condition_notes: '18 years old (avg lifespan 15-20). No service records. Running but making noise.',
      warning_signs_present: ['Unusual noise', 'No maintenance history', 'Aging beyond typical lifespan'],
      last_service_date: null,
      next_service_date: null,
      estimated_lifespan_years: 15,
      replacement_cost_estimate: 6500,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-002',
      property_id: 'demo-struggling-001',
      system_type: 'Water & Sewer/Septic',
      nickname: 'Water Heater',
      brand_model: 'Rheem 40-Gal Gas',
      installation_year: 2009,
      condition: 'Fair',
      condition_notes: '16 years old (avg lifespan 10-15). Never been serviced. Still works but age is concerning.',
      warning_signs_present: ['Past typical lifespan', 'No maintenance history', 'Unknown condition'],
      last_service_date: null,
      next_service_date: null,
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 1200,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-003',
      property_id: 'demo-struggling-001',
      system_type: 'Roof System',
      nickname: 'Main Roof',
      brand_model: '3-Tab Asphalt Shingles',
      installation_year: 2010,
      condition: 'Fair',
      condition_notes: '15 years old. Some missing shingles. Gutters clogged. No recent inspection.',
      warning_signs_present: ['Missing shingles', 'Clogged gutters', 'No inspection history'],
      last_service_date: null,
      next_service_date: null,
      estimated_lifespan_years: 20,
      replacement_cost_estimate: 9000,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-004',
      property_id: 'demo-struggling-001',
      system_type: 'Electrical System',
      nickname: 'Main Panel',
      brand_model: '150A Main Panel',
      installation_year: 2010,
      condition: 'Poor',
      condition_notes: 'GFCI outlets near water NOT working. Some outlets not functioning. No recent inspection.',
      warning_signs_present: ['Failed GFCI outlets', 'Non-functional outlets', 'Safety hazard'],
      last_service_date: null,
      estimated_lifespan_years: 40,
      replacement_cost_estimate: 3500,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-005',
      property_id: 'demo-struggling-001',
      system_type: 'CO Detector',
      nickname: 'Carbon Monoxide Detectors',
      brand_model: 'None',
      installation_year: null,
      condition: 'Urgent',
      condition_notes: 'NO CARBON MONOXIDE DETECTORS INSTALLED. Critical safety issue.',
      warning_signs_present: ['No CO detectors', 'Life safety hazard'],
      last_service_date: null,
      estimated_lifespan_years: 7,
      replacement_cost_estimate: 100,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-sys-006',
      property_id: 'demo-struggling-001',
      system_type: 'Smoke Detector',
      nickname: 'Smoke Detectors',
      brand_model: 'Battery-Powered (unknown age)',
      installation_year: null,
      condition: 'Poor',
      condition_notes: 'Unknown age. Batteries likely dead. Need replacement.',
      warning_signs_present: ['Unknown age', 'Unknown battery status', 'Safety concern'],
      last_service_date: null,
      estimated_lifespan_years: 10,
      replacement_cost_estimate: 200,
      photo_urls: [],
      created_date: '2025-01-01T00:00:00Z'
    }
  ],

  tasks: [
    // PRIORITIZE PAGE TASKS (status: 'Identified') - Shows in Prioritize, needs scheduling
    {
      id: 'demo-s-task-001',
      property_id: 'demo-struggling-001',
      title: 'Install CO Detectors - LIFE SAFETY',
      description: 'No carbon monoxide detectors installed. This is a critical life safety issue. Purchase 3 battery-powered CO detectors and install one on each floor near sleeping areas.',
      system_type: 'Safety',
      priority: 'Critical',
      cascade_risk_score: 10,
      cascade_risk_reason: 'Carbon monoxide is colorless, odorless, and deadly. With gas appliances in your home and ZERO CO detectors, your family is at risk every single day. This isn\'t about property damage - it\'s about survival.',
      current_fix_cost: 100,
      delayed_fix_cost: 100,
      diy_cost: 100,
      diy_difficulty: 'Easy',
      diy_time_hours: 0.5,
      status: 'Identified',
      execution_method: 'DIY',
      key_warning: 'LIFE SAFETY: You have a gas furnace and gas water heater with NO carbon monoxide protection. This violates building codes and endangers your family.',
      urgency_timeline: 'Complete TODAY. This is not negotiable. Every night without CO detectors is a night at risk.',
      ai_tools_needed: [
        'Step ladder or sturdy chair',
        'Phillips head screwdriver',
        'Pencil (for marking)',
        'Drill with small bit (optional - for wall mounting)'
      ],
      ai_materials_needed: [
        'Kidde or First Alert CO Detector 3-pack with 10-year battery - $50-70 at Home Depot',
        'Mounting screws (usually included)',
        'Optional: Combo Smoke/CO detectors for dual protection'
      ],
      ai_sow: `1. CRITICAL: Install detectors within 10 feet of each bedroom door
2. First location: Hallway outside master bedroom
3. Second location: Main floor near gas appliances (furnace/water heater)
4. Third location: Basement or near attached garage
5. For each location: Hold detector to wall/ceiling, mark screw holes
6. Drill pilot holes or use included anchors
7. Mount the bracket securely
8. Snap detector onto bracket
9. Press TEST button - should emit loud alarm
10. If battery-activated, pull the activation tab
11. Write installation date on detector with marker
12. Download manufacturer app if smart detector
13. Test all detectors monthly - add calendar reminder
14. Replace all detectors after 7-10 years (check expiration)`,
      ai_video_tutorials: [
        {
          title: 'Where to Place Carbon Monoxide Detectors',
          url: 'https://www.youtube.com/watch?v=VEd3QpcMbEY',
          duration: '4:12',
          channel: 'NFPA'
        },
        {
          title: 'How to Install a CO Detector - Step by Step',
          url: 'https://www.youtube.com/watch?v=L_rP1SOWjGM',
          duration: '5:33',
          channel: 'Kidde Safety'
        },
        {
          title: 'Carbon Monoxide Safety - What Every Homeowner Must Know',
          url: 'https://www.youtube.com/watch?v=Rj4sF9u_jqg',
          duration: '8:45',
          channel: 'Ask This Old House'
        }
      ],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-002',
      property_id: 'demo-struggling-001',
      title: 'Fix GFCI Outlets Near Water',
      description: 'GFCI outlets in bathroom and kitchen not functioning. Electrical safety hazard. Test and reset GFCI outlets, replace if damaged.',
      system_type: 'Electrical',
      priority: 'Critical',
      cascade_risk_score: 9,
      cascade_risk_reason: 'GFCI outlets prevent electrocution by shutting off power in milliseconds when water contact is detected. Non-functioning GFCIs near your kitchen sink and bathroom mean you\'re one wet hand away from serious injury.',
      current_fix_cost: 150,
      delayed_fix_cost: 150,
      contractor_cost: 250,
      diy_cost: 150,
      diy_difficulty: 'Medium',
      diy_time_hours: 1,
      status: 'Identified',
      execution_method: 'DIY',
      key_warning: 'ELECTROCUTION HAZARD: Failed GFCI outlets in wet areas are dangerous. These safety devices exist for one reason - to save lives.',
      urgency_timeline: 'Complete this week. Until fixed, avoid using these outlets near water.',
      ai_tools_needed: [
        'GFCI outlet tester ($15 at Home Depot - essential tool)',
        'Flathead and Phillips screwdrivers',
        'Voltage tester / non-contact voltage detector',
        'Wire strippers (if replacing outlets)',
        'Needle-nose pliers',
        'Flashlight'
      ],
      ai_materials_needed: [
        'GFCI outlets (20-amp for kitchen, 15-amp for bathroom) - $15-25 each',
        'GFCI outlet covers/plates',
        'Wire nuts (assorted sizes)',
        'Electrical tape'
      ],
      ai_sow: `1. FIRST: Locate your electrical panel and identify the breakers for bathroom/kitchen
2. Turn OFF the breaker for the circuit you're testing - VERIFY with voltage tester
3. Try the RESET button on each GFCI outlet - press firmly until you hear a click
4. Then press TEST button - outlet should lose power
5. Press RESET again - power should restore
6. If buttons don't click or outlet doesn't respond, outlet needs replacement
7. FOR REPLACEMENT: With breaker OFF and verified with voltage tester
8. Remove outlet cover plate (usually one screw)
9. Remove outlet from box (two screws top and bottom)
10. Carefully pull outlet out, note wire connections
11. Take photo of wiring before disconnecting!
12. GFCI has LINE and LOAD terminals - LINE is for incoming power
13. Connect black (hot) wire to brass LINE terminal
14. Connect white (neutral) wire to silver LINE terminal
15. Connect ground (bare/green) to green ground screw
16. Push outlet into box, secure with screws
17. Install cover plate
18. Turn breaker ON, test with GFCI tester
19. Button should pop when you press TEST on tester`,
      ai_video_tutorials: [
        {
          title: 'How to Replace a GFCI Outlet - Complete Tutorial',
          url: 'https://www.youtube.com/watch?v=w6rBlHYyEwM',
          duration: '11:24',
          channel: 'This Old House'
        },
        {
          title: 'GFCI Outlet Not Working? Troubleshooting Guide',
          url: 'https://www.youtube.com/watch?v=ILBjnZq0n8s',
          duration: '8:15',
          channel: 'Everyday Home Repairs'
        },
        {
          title: 'How GFCI Outlets Work and Why You Need Them',
          url: 'https://www.youtube.com/watch?v=GNFKQ7MxK_8',
          duration: '6:02',
          channel: 'Engineering Mindset'
        }
      ],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-003',
      property_id: 'demo-struggling-001',
      title: 'Emergency Roof Shingle Repair',
      description: 'Missing shingles allowing water infiltration. Must repair before next rain. Professional inspection and targeted shingle replacement needed.',
      system_type: 'Roof',
      priority: 'Urgent',
      cascade_risk_score: 8,
      current_fix_cost: 850,
      delayed_fix_cost: 8000,
      contractor_cost: 850,
      status: 'Identified',
      execution_method: 'Contractor',
      why_urgent: 'Water damage will spread to insulation, drywall, and potentially cause mold.',
      created_date: '2025-01-01T00:00:00Z'
    },
    // SCHEDULE PAGE TASKS (status: 'Scheduled' but future date or no date) - Shows in Schedule calendar
    {
      id: 'demo-s-task-004',
      property_id: 'demo-struggling-001',
      title: 'HVAC Emergency Service',
      description: '18-year-old heat pump making noise. Needs professional deep cleaning before failure. Schedule immediate HVAC technician visit.',
      system_type: 'HVAC',
      priority: 'Urgent',
      cascade_risk_score: 7,
      current_fix_cost: 850,
      delayed_fix_cost: 6500,
      contractor_cost: 850,
      status: 'Scheduled',
      execution_method: 'Contractor',
      scheduled_date: getDaysFromNow(3), // 3 days from now
      why_urgent: 'System is past typical lifespan and showing signs of failure. Service now or replace later.',
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-005',
      property_id: 'demo-struggling-001',
      title: 'Water Heater Emergency Flush',
      description: '16-year-old water heater never serviced. Flush and inspect before catastrophic failure. Connect hose to drain valve, flush sediment, check anode rod.',
      system_type: 'Plumbing',
      priority: 'High',
      cascade_risk_score: 6,
      current_fix_cost: 350,
      delayed_fix_cost: 2500,
      contractor_cost: 350,
      status: 'Scheduled',
      execution_method: 'Contractor',
      scheduled_date: getDaysFromNow(7), // 1 week from now
      why_urgent: 'Tank is 6 years past typical lifespan. Could flood at any time.',
      created_date: '2025-01-01T00:00:00Z'
    },
    // EXECUTE PAGE TASKS (status: 'Scheduled' with today/past date) - Shows in Execute
    {
      id: 'demo-s-task-006',
      property_id: 'demo-struggling-001',
      title: 'Replace/Test Smoke Detectors',
      description: 'Smoke detectors are unknown age with likely dead batteries. Replace all units with new 10-year sealed battery models.',
      system_type: 'Safety',
      priority: 'High',
      cascade_risk_score: 9,
      cascade_risk_reason: 'Smoke detectors are your first line of defense. A non-working detector means zero warning in a fire - the difference between escape and tragedy.',
      current_fix_cost: 200,
      delayed_fix_cost: 200,
      diy_cost: 200,
      diy_difficulty: 'Easy',
      diy_time_hours: 1,
      status: 'Scheduled',
      execution_method: 'DIY',
      scheduled_date: getToday(),
      key_warning: 'Unknown age means unknown protection. Smoke detectors expire after 10 years - even with fresh batteries.',
      urgency_timeline: 'Complete TODAY - every night without working detectors is a risk to your family.',
      ai_tools_needed: [
        'Step ladder or sturdy stool',
        'Phillips head screwdriver',
        'Pencil (for marking drill holes)',
        'Drill with 3/16" bit (if mounting new locations)',
        'Flashlight (to check manufacture dates)'
      ],
      ai_materials_needed: [
        'First Alert 10-Year Sealed Battery Smoke Detector (3-pack) - $45 at Home Depot',
        'Mounting screws (usually included)',
        'Wall anchors (if mounting on drywall)',
        '9V battery for testing (temporary backup)'
      ],
      ai_sow: `1. Turn off any ceiling fans near smoke detectors
2. Use step ladder to safely reach each detector
3. Twist existing detector counterclockwise to remove from mount
4. Check manufacture date on back - if over 10 years old, replace entirely
5. If keeping: open battery compartment, replace with fresh 9V battery
6. Press and hold TEST button for 3-5 seconds - should hear loud alarm
7. For new detectors: hold mounting bracket to ceiling, mark screw holes with pencil
8. Drill pilot holes if needed, insert anchors
9. Secure mounting bracket with screws
10. Twist new detector onto bracket clockwise until it clicks
11. Press TEST button to verify operation
12. Write today's date on detector with marker for future reference
13. Repeat for all locations: hallways, each bedroom, kitchen area
14. Test interconnected function if applicable (triggering one should trigger all)`,
      ai_video_tutorials: [
        {
          title: 'How to Replace a Smoke Detector in 5 Minutes',
          url: 'https://www.youtube.com/watch?v=DnSQOxkPbPk',
          duration: '4:32',
          channel: 'This Old House'
        },
        {
          title: 'Smoke Detector Placement Guide - Where to Install',
          url: 'https://www.youtube.com/watch?v=_Z9gUd5kDcE',
          duration: '6:15',
          channel: 'NFPA'
        },
        {
          title: 'Testing Your Smoke Alarms - The Right Way',
          url: 'https://www.youtube.com/watch?v=yDCf-AUyWHs',
          duration: '3:48',
          channel: 'Home Repair Tutor'
        }
      ],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-007',
      property_id: 'demo-struggling-001',
      title: 'Clean Clogged Gutters',
      description: 'Gutters completely clogged. Water overflowing near foundation. Remove debris, flush with hose, check downspout drainage.',
      system_type: 'Gutters',
      priority: 'High',
      cascade_risk_score: 7,
      cascade_risk_reason: 'Clogged gutters cause water to overflow and pool at your foundation. This leads to basement leaks, foundation cracks, and even structural settling - turning a $0 DIY job into $5,000+ repairs.',
      current_fix_cost: 150,
      delayed_fix_cost: 5000,
      contractor_cost: 150,
      diy_cost: 0,
      diy_difficulty: 'Easy',
      diy_time_hours: 2,
      status: 'Scheduled',
      execution_method: 'DIY',
      scheduled_date: getDaysAgo(2),
      key_warning: 'OVERDUE: Every rain event with clogged gutters is actively damaging your foundation. The longer you wait, the worse it gets.',
      urgency_timeline: 'Complete IMMEDIATELY - this task is 2 days overdue. Next rain will cause more foundation damage.',
      ai_tools_needed: [
        'Extension ladder (rated for your weight + 50 lbs)',
        'Work gloves (leather or heavy rubber)',
        'Safety glasses',
        'Garden trowel or gutter scoop',
        '5-gallon bucket with hook (or garbage bag)',
        'Garden hose with spray nozzle',
        'Plumber\'s snake or flexible rod (for downspouts)'
      ],
      ai_materials_needed: [
        'Garbage bags for debris',
        'Gutter sealant (if joints leaking) - $5 at Home Depot',
        'Downspout extensions (if needed) - $8 each',
        'Gutter guards (optional but recommended) - $1-2/ft at Lowe\'s'
      ],
      ai_sow: `1. SAFETY FIRST: Set up ladder on firm, level ground. Have someone spot you if possible
2. Position ladder so you can reach gutters without overreaching - move it often
3. Wear gloves and safety glasses - gutter debris can be sharp and moldy
4. Start at downspout end and work away from it
5. Use trowel/scoop to remove leaves, twigs, and sediment into bucket
6. Remove any plants or seedlings growing in gutter (yes, this happens!)
7. Check gutter slope - should tilt toward downspouts. Mark any sags
8. After debris removal, flush entire gutter with hose starting at far end
9. Watch water flow - should move quickly to downspout with no pooling
10. Check downspout for clogs - water should flow freely out the bottom
11. If downspout clogged: disconnect at elbow, use plumber's snake to clear
12. Reconnect downspout, test again with full hose pressure
13. Verify downspout directs water 4-6 feet away from foundation
14. Add downspout extension if water dumps too close to house
15. Inspect gutter joints - apply sealant to any leaking seams
16. Consider installing gutter guards to prevent future buildup
17. Clean up all debris from ground - don't leave it near foundation`,
      ai_video_tutorials: [
        {
          title: 'How to Clean Gutters Like a Pro (Safely)',
          url: 'https://www.youtube.com/watch?v=4KGRQXj4xWo',
          duration: '8:15',
          channel: 'This Old House'
        },
        {
          title: 'Gutter Cleaning - The Complete Guide',
          url: 'https://www.youtube.com/watch?v=QZ3WdZOvnuA',
          duration: '12:03',
          channel: 'Home RenoVision DIY'
        },
        {
          title: 'How to Unclog a Downspout (3 Methods)',
          url: 'https://www.youtube.com/watch?v=fTLHe_TLGR8',
          duration: '5:42',
          channel: 'Everyday Home Repairs'
        }
      ],
      created_date: '2025-01-01T00:00:00Z'
    },
    {
      id: 'demo-s-task-008',
      property_id: 'demo-struggling-001',
      title: 'Check Furnace Filter',
      description: 'With an 18-year-old HVAC system, clean filters are critical. Check and replace if dirty to reduce strain on aging equipment.',
      system_type: 'HVAC',
      priority: 'Medium',
      cascade_risk_score: 5,
      cascade_risk_reason: 'Your HVAC is 18 years old and already on borrowed time. A clogged filter makes the system work 15% harder, shortening its remaining life and driving up energy bills. At this age, a $25 filter could mean the difference between 1 more year and 3 more years of life.',
      current_fix_cost: 25,
      delayed_fix_cost: 500,
      contractor_cost: 100,
      diy_cost: 25,
      diy_difficulty: 'Easy',
      diy_time_hours: 0.25,
      status: 'Scheduled',
      execution_method: 'DIY',
      scheduled_date: getToday(),
      key_warning: 'With your 18-year-old Carrier heat pump, filter changes aren\'t optional - they\'re life support for aging equipment.',
      urgency_timeline: 'Takes 15 minutes. Do it today - your system is already stressed.',
      ai_tools_needed: [
        'Flashlight (to see filter condition)',
        'Measuring tape (to verify filter size)',
        'Marker or pen (to note change date)'
      ],
      ai_materials_needed: [
        'Replacement filter - MERV 8-11 rating recommended for your Carrier system',
        'Most common sizes: 16x25x1, 20x20x1, 20x25x1 - CHECK YOUR CURRENT FILTER',
        'Buy 3-4 filters at once to save trips (~$5-12 each at Home Depot)',
        'Consider upgrading to pleated filters for better air quality'
      ],
      ai_sow: `1. Turn OFF your HVAC system at the thermostat (important for safety)
2. Locate your air filter - typically in return air duct, near furnace, or behind a wall vent
3. Note the airflow direction arrow on current filter (crucial for replacement)
4. Slide out the old filter carefully - dirty filters release dust
5. Check filter condition: hold up to light - if you can't see through it, it's too dirty
6. Note the filter size printed on the frame (e.g., 16x25x1)
7. If filter is dirty (gray/black), dispose and insert new filter
8. Align the airflow arrow on new filter with the direction of airflow (toward furnace)
9. Slide new filter into slot - it should fit snugly without forcing
10. Write today's date on filter frame with marker
11. Turn HVAC system back ON at thermostat
12. Listen for normal operation - no unusual sounds
13. Set phone reminder to check again in 30 days (monthly for your aging system)
14. Pro tip: Keep spare filters near the furnace so you always have one ready`,
      ai_video_tutorials: [
        {
          title: 'How to Change a Furnace Filter (Complete Guide)',
          url: 'https://www.youtube.com/watch?v=pK3Q_yOXCVY',
          duration: '5:21',
          channel: 'Word of Advice TV'
        },
        {
          title: 'Furnace Filter Direction - Which Way Does It Go?',
          url: 'https://www.youtube.com/watch?v=kCBE67N1Yqw',
          duration: '3:44',
          channel: 'HVAC School'
        },
        {
          title: 'Best Furnace Filters - MERV Ratings Explained',
          url: 'https://www.youtube.com/watch?v=pv3oRBkaAl0',
          duration: '7:18',
          channel: 'Technology Connections'
        }
      ],
      created_date: '2025-01-01T00:00:00Z'
    }
  ],

  inspections: [
    {
      id: 'demo-s-insp-001',
      property_id: 'demo-struggling-001',
      inspection_type: 'Initial Assessment',
      season: 'Fall',
      year: 2025,
      inspection_date: '2025-01-01',
      status: 'Completed',
      completion_percentage: 100,
      duration_minutes: 45,
      issues_found: 7,
      urgent_count: 2,
      flag_count: 4,
      monitor_count: 1,
      notes: 'Critical safety issues found. Multiple systems past lifespan with no service history. Immediate action required.',
      created_date: '2025-01-01T10:00:00Z',
      findings: [
        // RED - Critical/Urgent Issues
        {
          id: 'f-s-001',
          area_name: 'Safety Systems',
          item_name: 'NO CARBON MONOXIDE DETECTORS',
          severity: 'Critical',
          stoplight: 'red',
          description: 'Property has gas appliances but ZERO carbon monoxide detectors installed. This is a life-threatening safety hazard that violates building codes.',
          recommendation: 'Install 3 CO detectors immediately - one on each floor, prioritizing sleeping areas. Battery-powered units can be installed in under 30 minutes.',
          current_fix_cost: 100,
          delayed_fix_cost: 100,
          cascade_risk: 'Life Safety - CO poisoning risk with gas furnace and water heater',
          diy_difficulty: 'Easy'
        },
        {
          id: 'f-s-002',
          area_name: 'Electrical System',
          item_name: 'GFCI Outlets Not Functioning',
          severity: 'Critical',
          stoplight: 'red',
          description: 'Ground fault circuit interrupter outlets in kitchen and bathroom are not working. These safety devices prevent electrocution in wet areas.',
          recommendation: 'Test all GFCI outlets with reset button. Replace any that fail to trip or reset. If unfamiliar with electrical work, hire a licensed electrician.',
          current_fix_cost: 150,
          delayed_fix_cost: 3000,
          cascade_risk: 'Electrocution hazard - serious injury or death possible',
          diy_difficulty: 'Medium'
        },
        // YELLOW - Flag Issues
        {
          id: 'f-s-003',
          area_name: 'Roof System',
          item_name: 'Missing/Damaged Shingles',
          severity: 'Flag',
          stoplight: 'yellow',
          description: '4-6 shingles missing on south-facing slope. Exposed roof deck visible. Active water infiltration risk with next rain event.',
          recommendation: 'Schedule professional roofer within 2 weeks. Temporary tarping may be needed if rain expected. Get 3 quotes for repair vs. full replacement assessment.',
          current_fix_cost: 850,
          delayed_fix_cost: 8000,
          cascade_risk: 'High - water damage to insulation, drywall, potential mold growth'
        },
        {
          id: 'f-s-004',
          area_name: 'HVAC System',
          item_name: '18-Year-Old Heat Pump - No Service History',
          severity: 'Flag',
          stoplight: 'yellow',
          description: 'Carrier heat pump installed 2007. No maintenance records. System running but making grinding noise during startup. Past typical 15-20 year lifespan.',
          recommendation: 'Schedule HVAC technician for deep cleaning and diagnostic. Begin budgeting $6,500 for replacement within 1-2 years. Regular maintenance may extend life.',
          current_fix_cost: 350,
          delayed_fix_cost: 6500,
          cascade_risk: 'Medium - mid-winter failure would require emergency replacement at premium cost'
        },
        {
          id: 'f-s-005',
          area_name: 'Water Heater',
          item_name: '16-Year-Old Tank - Never Serviced',
          severity: 'Flag',
          stoplight: 'yellow',
          description: 'Rheem 40-gallon gas water heater from 2009. No documented service. Anode rod likely depleted. Tank rust visible at connections.',
          recommendation: 'Flush tank and inspect anode rod. If anode is depleted, this may extend life 1-2 years. Begin planning replacement - budget $1,200-1,500.',
          current_fix_cost: 200,
          delayed_fix_cost: 2500,
          cascade_risk: 'Medium - catastrophic tank failure would flood area, damage nearby systems'
        },
        {
          id: 'f-s-006',
          area_name: 'Exterior/Drainage',
          item_name: 'Gutters 100% Clogged',
          severity: 'Flag',
          stoplight: 'yellow',
          description: 'All gutters packed with debris. Observed water overflowing and pooling at foundation during rain. Downspouts disconnected in 2 locations.',
          recommendation: 'Clean all gutters and reconnect downspouts. Install gutter guards to prevent future buildup. Verify water drains away from foundation.',
          current_fix_cost: 150,
          delayed_fix_cost: 5000,
          cascade_risk: 'High - foundation water intrusion, basement flooding, structural damage'
        },
        // GREEN - Monitor Items
        {
          id: 'f-s-007',
          area_name: 'Safety Systems',
          item_name: 'Smoke Detectors - Unknown Age',
          severity: 'Monitor',
          stoplight: 'green',
          description: 'Battery-powered smoke detectors present in hallways. Age unknown. Batteries status unknown. Recommend replacement with 10-year sealed units.',
          recommendation: 'Replace all smoke detectors with new 10-year sealed battery models. Test monthly. Note: Smoke detectors expire after 10 years regardless of battery.',
          current_fix_cost: 200,
          delayed_fix_cost: 200,
          cascade_risk: 'Low - safety device, no cascade effect'
        }
      ]
    }
  ],

  maintenanceHistory: [
    {
      id: 'demo-s-hist-001',
      property_id: 'demo-struggling-001',
      date: '2025-01-01',
      type: 'Assessment',
      title: 'Initial Property Assessment',
      description: 'First-time assessment of property condition. No prior maintenance records found.',
      cost: 0,
      completed_by: '360° Method Assessment',
      notes: 'Property has been in reactive mode. No documentation, no scheduled maintenance, multiple systems at risk.'
    }
  ],

  preserveSchedules: [
    {
      id: 'demo-s-pres-001',
      season: 'Urgent Priority',
      title: 'Critical Interventions Needed',
      description: 'These aren\'t routine tasks - they\'re strategic interventions that prevent cascade failures and expensive replacements.',
      interventions: [
        {
          id: 'pres-int-s-001',
          system_id: 'demo-s-sys-001',
          system_name: 'HVAC Heat Pump',
          intervention: 'Professional Deep Cleaning & Tune-Up',
          description: '18-year-old system needs immediate deep service. Without it, system will fail within 1-2 years.',
          current_age_years: 18,
          estimated_lifespan_without: 19,
          estimated_lifespan_with: 22,
          years_extended: 3,
          investment_cost: 850,
          replacement_cost_avoided: 6500,
          roi_multiplier: 7.6,
          frequency: 'Immediate + bi-annual going forward',
          next_due: 'ASAP',
          status: 'URGENT',
          why_worth_it: '$850 investment extends dying HVAC 3 more years, avoiding $6,500 emergency replacement mid-winter.',
          not_routine_because: 'This is beyond routine - it\'s saving a failing system from imminent death.'
        },
        {
          id: 'pres-int-s-002',
          system_id: 'demo-s-sys-002',
          system_name: 'Water Heater',
          intervention: 'Emergency Anode Rod + Flush Before Total Failure',
          description: '16-year-old tank on borrowed time. This intervention could extend life 1-2 years while you budget for replacement.',
          current_age_years: 16,
          estimated_lifespan_without: 16,
          estimated_lifespan_with: 18,
          years_extended: 2,
          investment_cost: 350,
          replacement_cost_avoided: 1200,
          roi_multiplier: 3.4,
          frequency: 'One-time emergency intervention',
          next_due: 'Within 30 days',
          status: 'URGENT',
          why_worth_it: '$350 buys you 1-2 years to budget for replacement, preventing $2,500 emergency scenario.',
          not_routine_because: 'Emergency life extension on a failing asset. Buys you planning time.'
        },
        {
          id: 'pres-int-s-003',
          system_id: 'demo-s-sys-003',
          system_name: 'Roof',
          intervention: 'Targeted Shingle Replacement + Emergency Sealing',
          description: 'Missing shingles allowing water infiltration. Seal now to prevent $3K-$8K water damage.',
          current_age_years: 15,
          estimated_lifespan_without: 17,
          estimated_lifespan_with: 20,
          years_extended: 3,
          investment_cost: 850,
          replacement_cost_avoided: 9000,
          roi_multiplier: 10.6,
          frequency: 'Immediate repair',
          next_due: 'Before next rain',
          status: 'URGENT',
          why_worth_it: '$850 prevents water damage cascade and extends roof 3 years.',
          not_routine_because: 'Emergency intervention preventing catastrophic failure.'
        }
      ],
      total_investment: 2050,
      total_replacement_costs_avoided: 16700,
      average_roi: 8.1,
      why_preserve_matters: `
        You're in reactive mode. Every system is a ticking time bomb.
        
        🚨 Without PRESERVE:
        • HVAC dies mid-winter: $6,500 emergency
        • Water heater fails: $2,500 Sunday emergency
        • Roof leaks damage interior: $8,000 repair
        
        Total if you do nothing: $17,000+ in the next 12-24 months
        
        💡 With $2,050 in Strategic Interventions:
        • Extend HVAC 3 years
        • Buy time on water heater 
        • Seal roof before cascade
        
        This isn't maintenance - it's triage. Stop the bleeding, buy yourself time.
      `
    }
  ],

  upgradeProjects: [
    {
      id: 'demo-s-upg-001',
      property_id: 'demo-struggling-001',
      title: 'Add CO Detectors (Life Safety)',
      category: 'Safety',
      description: 'Install 3 carbon monoxide detectors per code requirements',
      status: 'Identified',
      priority: 10,
      
      budget: 100,
      spent: 0,
      remaining: 100,
      
      startDate: null,
      targetCompletion: null,
      
      estimatedAnnualSavings: 0,
      resaleValueIncrease: 0,
      
      milestones: [
        {
          id: 'milestone-s1',
          title: 'Purchase 3 CO detectors',
          status: 'pending',
          targetDate: null,
          cost: 100
        },
        {
          id: 'milestone-s2',
          title: 'Install detectors',
          status: 'pending',
          targetDate: null,
          cost: 0
        },
        {
          id: 'milestone-s3',
          title: 'Test all units',
          status: 'pending',
          targetDate: null,
          cost: 0
        }
      ],
      
      why_worth_it: `
        This isn't about ROI - it's about not dying.
        
        🚨 CRITICAL:
        • You have gas appliances
        • You have NO carbon monoxide detectors
        • CO is silent, odorless, deadly
        
        Cost: $100
        Value: Your life
        
        Do this TODAY.
      `,
      
      notes: 'URGENT - Life safety issue. Must be completed immediately.'
    }
  ],

  portfolioMetrics: {
    total_properties: 1,
    total_units: 1,
    current_property_value: 340000,
    outstanding_mortgage: 198000,
    current_equity: 142000,
    loan_to_value_ratio: 58.2,

    average_health_score: 62,
    total_maintenance_invested: 0,
    total_savings_from_prevention: 0,

    projected_value_10yr: 475000,
    projected_equity_10yr: 350000,
    equity_growth_10yr: 208000,

    recommendation: 'Act Now',
    recommendation_reasoning: `Your property is at risk. Without intervention, you'll face $17K-$22K in emergency repairs over the next 2-3 years.

But here's the opportunity: Fix $2,650 now → Prevent $22,350 in emergencies → Build $208K in equity over 10 years.

The 360° Method transforms reactive owners into proactive asset managers. Start today.`,

    scale_message: `You're not ready for "Scale" thinking yet - and that's okay.

Right now, focus on:
1. Critical safety fixes (CO detectors, GFCI)
2. Stopping the bleeding (roof, HVAC)
3. Building your first maintenance rhythm

Once you hit 75+, you'll unlock the full wealth-building view. For now, see what's possible if you follow through.`
  },

  stats: {
    total_systems: 6,
    systems_good: 0,
    systems_flagged: 4,
    systems_urgent: 2,
    total_tasks: 7,
    tasks_critical: 2,
    tasks_urgent: 2,
    tasks_high: 3,
    tasks_medium: 0,
    tasks_low: 0,
    total_estimated_cost_now: 2650,
    total_estimated_cost_if_delayed: 22350,
    potential_savings: 19700,
    health_score: 62
  }
});

// Legacy export for backward compatibility - calls the function to get fresh data
export const DEMO_PROPERTY_STRUGGLING = getDemoPropertyStruggling();