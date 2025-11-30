-- ============================================
-- 021_resource_center_update.sql
-- Member Resource Center - Gated Content System
-- ============================================

-- ============================================
-- STEP 1: Add new columns to resource_guides
-- ============================================

-- Slug for URL-friendly paths
ALTER TABLE resource_guides ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Free vs paid gating
ALTER TABLE resource_guides ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Checklist data for PDF generation (stored as JSON)
ALTER TABLE resource_guides ADD COLUMN IF NOT EXISTS checklist_data JSONB;

-- Region-specific tag
ALTER TABLE resource_guides ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'universal';

-- System type for filtering
ALTER TABLE resource_guides ADD COLUMN IF NOT EXISTS system_type TEXT;

-- ============================================
-- STEP 2: Update category constraint
-- ============================================

-- Drop old constraint and add new one with updated categories
ALTER TABLE resource_guides DROP CONSTRAINT IF EXISTS resource_guides_category_check;
ALTER TABLE resource_guides ADD CONSTRAINT resource_guides_category_check
  CHECK (category IN ('Awareness', 'Seasonal', 'PNW', 'Smart Homeowner', 'Getting Started'));

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_resource_guides_slug ON resource_guides(slug);
CREATE INDEX IF NOT EXISTS idx_resource_guides_is_free ON resource_guides(is_free);
CREATE INDEX IF NOT EXISTS idx_resource_guides_category ON resource_guides(category);
CREATE INDEX IF NOT EXISTS idx_resource_guides_region ON resource_guides(region);

-- ============================================
-- STEP 4: Clear existing data and insert guides
-- ============================================

-- Clear existing guides (they were placeholders)
DELETE FROM resource_guides;

-- ============================================
-- FREE GUIDES (2)
-- ============================================

INSERT INTO resource_guides (
  title, slug, description, content, category, difficulty_level,
  estimated_read_time_minutes, is_free, is_published, region, sort_order
) VALUES
(
  'The 360° Method: Your Complete Guide',
  'the-360-method-complete-guide',
  'Learn the philosophy behind proactive home maintenance and why catching the $50 fix before it becomes the $5,000 disaster is the key to protecting your investment.',
  '# The 360° Method: Your Complete Guide

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Why the 360° Method?

Most homeowners are one hidden problem away from a $10,000 emergency. A small roof leak becomes water damage becomes mold becomes structural issues. A minor HVAC rattle becomes a complete system failure in the middle of summer.

**The 360° Method changes this.** Instead of reacting to disasters, you learn to spot the warning signs early—when fixes are simple and affordable.

## What You''ll Learn

- The 3 phases of proactive home care
- How to spot problems before they become emergencies
- When to handle things yourself vs. call a professional
- How to build a relationship with trusted contractors

## The Three Phases

### Phase 1: AWARE (Know Your Home)

Before you can protect your home, you need to understand it.

**Baseline** - Document your home''s major systems: age, condition, brand, model. This is your home''s "medical record."

**Inspect** - Regular walkthroughs to spot early warning signs. Most problems announce themselves before they become emergencies.

**Track** - Keep a maintenance log. Know what''s been done, when, and by whom. This history is invaluable for future decisions.

### Phase 2: ACT (Take Action)

Knowledge without action is just worry. This phase turns awareness into results.

**Prioritize** - Not all issues are equal. Learn to rank by urgency, cost impact, and cascade risk (will this cause other problems?).

**Schedule** - Put maintenance on the calendar. Regular upkeep prevents most emergencies.

**Execute** - Get the work done. Know when to DIY and when to call a pro.

### Phase 3: ADVANCE (Build Wealth)

Your home is likely your biggest investment. Protect and grow it.

**Preserve** - Preventive maintenance extends system life. A well-maintained HVAC system lasts 15-20 years, not 10.

**Upgrade** - Strategic improvements that add value. Not all upgrades are equal—focus on the ones with real ROI.

**Scale** - For investors: portfolio-level thinking for multiple properties.

## The Core Principle: Cascade Prevention

Here''s what most homeowners don''t realize: home problems cascade.

- A clogged gutter → water pooling → foundation damage → $15,000+ repair
- A dirty HVAC filter → system strain → compressor failure → $8,000 replacement
- A small roof leak → water intrusion → mold growth → health hazard + $20,000 remediation

**The 360° Method is about breaking these chains early.** Catch the $50 problem before it becomes the $5,000 disaster.

## When to Call a Professional

The 360° Method is about awareness, not becoming a contractor. Always call a licensed professional for:

- Electrical work (beyond changing bulbs and resetting breakers)
- Plumbing repairs (beyond unclogging a drain)
- HVAC repairs (beyond filter changes)
- Roof repairs
- Structural concerns
- Gas appliance issues
- Anything requiring a permit

**When in doubt, call a pro.** The cost of a professional inspection is always less than the cost of a botched DIY repair.

## Getting Started

1. **Start with a walkthrough** - Use our First Inspection Guide to do a room-by-room assessment
2. **Document your systems** - Note the age and condition of major systems
3. **Set up reminders** - Monthly walkthrough, seasonal maintenance tasks
4. **Build your team** - Find trusted professionals before you need them urgently

---

Ready to take the first step? Check out our [First Home Inspection Walkthrough](/Resources/guide/first-home-inspection-walkthrough) guide.',
  'Getting Started',
  'Beginner',
  12,
  true,
  true,
  'universal',
  1
),
(
  'Your First Home Inspection Walkthrough',
  'first-home-inspection-walkthrough',
  'A simple room-by-room guide to inspecting your home. Learn what to look for, what''s normal, and when to call a professional.',
  '# Your First Home Inspection Walkthrough

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

You don''t need to be an expert to spot problems in your home. Most issues announce themselves with visible signs—if you know where to look.

This guide walks you through a simple inspection you can do in about 30 minutes. Do this monthly, and you''ll catch most problems early.

## What You''ll Learn

- A room-by-room inspection routine
- Key warning signs in each area
- What''s normal vs. what needs attention
- When to call a professional immediately

## Before You Start

Grab these items:
- Your phone (for photos and notes)
- A flashlight
- A step stool (for checking high areas safely)

**Important**: This is a VISUAL inspection only. Don''t open electrical panels, climb on the roof, or do anything that requires professional training or equipment.

## The Walkthrough

### Exterior (10 minutes)

**Walk the perimeter of your home.**

**Look for:**
- Cracks in foundation (hairline cracks are usually normal; anything wider than 1/4 inch needs attention)
- Gaps where siding meets foundation
- Damaged or missing siding
- Peeling paint (can indicate moisture issues)
- Gutters: attached firmly? Debris visible?
- Downspouts: directing water away from foundation?
- Trees or shrubs touching the house

**Call a pro if:** You see significant foundation cracks, water pooling near the foundation, or signs of pest damage.

### Roof (from ground level)

**Do NOT climb on your roof.** Use binoculars if needed.

**Look for:**
- Missing, curling, or damaged shingles
- Moss or algae growth
- Sagging areas
- Damaged flashing around chimneys and vents
- Clogged gutters visible from ground

**Call a pro if:** You see missing shingles, significant sagging, or any obvious damage.

### Kitchen (5 minutes)

**Look for:**
- Water under sink (open cabinet, check for moisture)
- Slow drains
- Faucet dripping
- Appliance operation (strange sounds or smells?)
- Exhaust fan working

**Call a pro if:** You smell gas, see active leaks, or notice sparking from outlets.

### Bathrooms (3 minutes each)

**Look for:**
- Caulk condition around tub/shower (cracked, missing, or moldy?)
- Toilet stability (does it rock when you sit?)
- Signs of moisture on walls or ceiling
- Exhaust fan working
- Slow drains

**Call a pro if:** You see mold growth, water stains on the ceiling below, or the toilet is loose at the base.

### Bedrooms and Living Areas (5 minutes)

**Look for:**
- Cracks in walls or ceiling
- Stains on ceiling (water intrusion signs)
- Windows: opening/closing smoothly? Condensation between panes?
- Outlets and switches: working? Warm to touch? (Warm is NOT normal)
- Smoke/CO detectors: test the button

**Call a pro if:** You find warm outlets, non-functioning detectors, or large/growing cracks.

### Basement/Crawl Space (5 minutes)

**If you have access (don''t force entry to crawl spaces):**

**Look for:**
- Water stains or active moisture
- Musty smell (indicates moisture/mold)
- Visible foundation cracks
- Efflorescence (white mineral deposits on concrete)
- Proper insulation condition
- Exposed wires or pipes in poor condition

**Call a pro if:** You see standing water, significant mold, or structural concerns.

### HVAC System (2 minutes)

**Look for:**
- Filter condition (when was it last changed?)
- Strange sounds when running
- Unusual smells from vents
- Visible rust or damage on outdoor unit
- Debris around outdoor unit

**Call a pro if:** System isn''t heating/cooling effectively, makes grinding sounds, or you smell burning.

### Water Heater (2 minutes)

**Look for:**
- Rust or corrosion on tank
- Water pooling underneath
- Age of unit (check label—most last 10-15 years)
- Strange sounds when heating

**Call a pro if:** You see active leaks, significant rust, or the unit is over 12 years old.

## After Your Walkthrough

1. **Note what you found** - Take photos of any concerns
2. **Categorize by urgency**:
   - **Immediate**: Safety issues, active leaks, gas smell → Call a pro today
   - **Soon**: Developing problems → Schedule within 2 weeks
   - **Monitor**: Minor items → Check again next month
3. **Schedule follow-up** - Set a reminder for next month''s walkthrough

## Creating Your Routine

The first walkthrough takes the longest. Once you know your home, monthly checks take 15-20 minutes.

**Recommended schedule:**
- Monthly: Quick walkthrough (this guide)
- Quarterly: Deeper check of one system
- Annually: Professional inspections for HVAC, roof

---

📥 **Download the Checklist**: Use the button above to download a printable walkthrough checklist.',
  'Getting Started',
  'Beginner',
  15,
  true,
  true,
  'universal',
  2
);

-- ============================================
-- PAID GUIDES - Home Awareness & Inspection (4)
-- ============================================

INSERT INTO resource_guides (
  title, slug, description, content, category, difficulty_level,
  estimated_read_time_minutes, is_free, is_published, region, sort_order, checklist_data
) VALUES
(
  'Monthly Home Walkthrough: What to Look For',
  'monthly-home-walkthrough',
  'A comprehensive room-by-room inspection guide that takes just 15 minutes. Catch problems early before they become expensive emergencies.',
  '# Monthly Home Walkthrough: What to Look For

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Most home problems start small. A tiny leak becomes water damage becomes mold. A strange smell becomes a safety hazard. This guide helps you spot issues early—before they become expensive emergencies.

By spending just 15 minutes each month walking through your home with intention, you can catch 90% of problems in their early, affordable-to-fix stage.

## What You''ll Learn

- A simple 15-minute monthly walkthrough routine
- Key warning signs in each room
- What''s normal vs. what needs professional attention
- How to document issues for contractors

## The 15-Minute Monthly Routine

### Kitchen (3 minutes)

**Under the Sink**
Open cabinet doors and check:
- Dampness or water stains on cabinet floor
- Visible leaks at pipe connections
- Musty smell (indicates hidden moisture)
- P-trap integrity (the curved pipe)

**Appliances**
- Run garbage disposal—listen for grinding or humming without action
- Check dishwasher door seal for cracks or mold
- Verify exhaust hood fan is pulling air

**Signs of Trouble:**
- Water stains anywhere
- Slow drains in multiple fixtures
- Appliances making new sounds

**Call a pro if:** You smell gas, see sparking outlets, or find active leaks.

### Bathrooms (2 minutes each)

**Caulk and Seals**
- Check caulk around tub, shower, and toilet base
- Look for gaps, cracks, or discoloration
- Press on tile near shower floor (should be solid, not soft)

**Fixtures**
- Flush toilets—listen for continuous running
- Check for toilet wobble (sit and shift weight)
- Run water—check for slow drains

**Walls and Ceiling**
- Look for water stains, especially below upper-floor bathrooms
- Check for peeling paint (moisture indicator)
- Verify exhaust fan operates

**Call a pro if:** You see mold growth, ceiling stains from above, or a rocking toilet.

### Living Areas & Bedrooms (3 minutes)

**Walls and Ceilings**
- New cracks? Mark them with tape and date to monitor growth
- Stains? Could indicate roof or plumbing leaks
- Nail pops? Common in new homes, easy fix, but note them

**Windows and Doors**
- Open and close—sticking could indicate foundation shift
- Check for condensation between double-pane windows (seal failure)
- Look for daylight around door frames (weatherstripping needed)

**Electrical**
- Test outlet—does it work?
- Touch outlet covers—warmth is NOT normal and needs immediate attention
- Test GFCI outlets (bathroom/kitchen) with TEST button

**Smoke and CO Detectors**
- Press test button on each detector
- Replace batteries annually (pick a date you''ll remember)
- Replace units every 10 years

**Call a pro if:** Outlets are warm, cracks are growing, or detectors don''t respond.

### Basement or Crawl Space (3 minutes)

*Only if safely accessible—never force entry to crawl spaces*

**Foundation Walls**
- Hairline cracks are usually normal
- Horizontal cracks or cracks wider than 1/4" need professional evaluation
- Look for efflorescence (white crystalline deposits)—indicates moisture

**Floor and Moisture**
- Any standing water or damp spots?
- Musty smell? (moisture/mold indicator)
- Check sump pump operation (pour water in if you have one)

**Systems**
- Glance at water heater—rust, leaks?
- Listen to HVAC—unusual sounds?
- Check exposed pipes for drips

**Call a pro if:** You see standing water, horizontal foundation cracks, or significant mold.

### Exterior Quick Check (2 minutes)

*Full exterior check quarterly; monthly just hits the highlights*

**Visible from Ground**
- Gutters attached? Debris visible?
- Siding damage?
- Any obvious roof issues visible from ground?

**Foundation Perimeter**
- Water pooling near foundation?
- Soil pulling away from foundation?
- Plants touching the house?

**Call a pro if:** Water is pooling near foundation or you see significant damage.

### HVAC Quick Check (2 minutes)

**Filter**
- When did you last change it?
- If you can''t remember, change it now
- Set a phone reminder for next change

**Operation**
- Turn on system briefly
- Listen for unusual sounds
- Any burning smell when it starts?

**Outdoor Unit (if applicable)**
- Clear of debris?
- Visible damage or rust?

**Call a pro if:** System makes grinding sounds, smells like burning, or isn''t heating/cooling effectively.

## After Each Walkthrough

### Document What You Find
- Take photos of any concerns
- Note the date and location
- Compare to last month''s notes

### Categorize by Urgency

**Immediate (today):**
- Gas smell
- Active water leak
- Electrical sparking or warm outlets
- No heat in winter / no cooling in dangerous heat

**Soon (1-2 weeks):**
- Slow drains in multiple fixtures
- Growing cracks
- Persistent moisture
- HVAC not performing well

**Monitor (check next month):**
- Small cracks (mark and measure)
- Minor caulk wear
- Cosmetic issues

## Monthly Walkthrough Checklist

Use the downloadable PDF checklist to track your monthly walkthrough. Print several copies and keep them with your home documentation.

---

📥 **Download the Checklist**: [Monthly Home Walkthrough Checklist (PDF)]',
  'Awareness',
  'Beginner',
  10,
  false,
  true,
  'universal',
  10,
  '{"title": "Monthly Home Walkthrough Checklist", "sections": [{"name": "Kitchen", "items": ["Check under sink for leaks/moisture", "Run garbage disposal", "Check dishwasher door seal", "Test exhaust fan"]}, {"name": "Bathrooms", "items": ["Inspect caulk around tub/shower", "Check toilet stability", "Test for slow drains", "Look for ceiling/wall stains", "Test exhaust fan"]}, {"name": "Living Areas", "items": ["Check walls for new cracks", "Test windows open/close", "Check for condensation in windows", "Test outlets (not warm?)", "Test smoke/CO detectors"]}, {"name": "Basement/Crawl Space", "items": ["Check for standing water", "Inspect foundation for cracks", "Check for musty smell", "Glance at water heater", "Listen to HVAC"]}, {"name": "Exterior", "items": ["Check gutters attached", "Look for siding damage", "Check for water pooling at foundation"]}, {"name": "HVAC", "items": ["Check filter (change if needed)", "Listen for unusual sounds", "Check outdoor unit clear of debris"]}]}'
),
(
  'Signs Your Home Needs Professional Attention',
  'signs-home-needs-professional-attention',
  'Learn to recognize the warning signs that mean it''s time to call a licensed professional. Don''t ignore these red flags.',
  '# Signs Your Home Needs Professional Attention

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Your home talks to you—through sounds, smells, and visible changes. Learning to interpret these signals can save you thousands of dollars and protect your family''s safety.

This guide covers the warning signs that should prompt a call to a licensed professional. When you see these signs, don''t wait and don''t DIY.

## What You''ll Learn

- Critical warning signs that need immediate attention
- Signs that need professional evaluation soon
- How to describe issues when calling contractors
- What to expect from professional inspections

## IMMEDIATE: Call Today

These signs indicate potential safety hazards or rapidly worsening damage.

### Gas Smell

**What it means:** Potential gas leak—serious explosion and health risk

**What to do:**
1. Do NOT turn on/off any electrical switches
2. Leave the house immediately
3. Call your gas company''s emergency line from outside
4. Do not re-enter until cleared by professionals

### Electrical Warning Signs

**Warm or hot outlets/switch plates**
- Indicates dangerous wiring issues
- Fire hazard—call an electrician immediately

**Burning smell from outlets or panel**
- Could be melting wire insulation
- Turn off power at main breaker if safe to do so
- Call electrician immediately

**Sparking from outlets**
- Wiring failure
- Stop using that circuit
- Call electrician same day

**Frequently tripping breakers**
- Circuit overload or wiring fault
- Could indicate serious issues
- Schedule electrician this week

### Active Water Leaks

**Ceiling dripping**
- Shut off water if you can identify the source
- Place buckets to catch water
- Call plumber immediately
- Serious leaks: Call water damage restoration too

**Burst pipe**
- Shut off main water valve immediately
- Call plumber emergency line
- Don''t wait—water damage compounds quickly

### Carbon Monoxide Detector Alarm

**What to do:**
1. Get everyone out of the house immediately
2. Call 911 from outside
3. Don''t re-enter until fire department clears it
4. Have all fuel-burning appliances inspected

### Foundation: Horizontal Cracks

**What it means:** Serious structural issue from lateral pressure

**Why it''s urgent:** Horizontal cracks (as opposed to vertical) indicate the foundation is being pushed inward—this can lead to failure.

**Call:** Structural engineer, not just a foundation repair company

## SOON: Schedule Within 1-2 Weeks

These signs indicate developing problems that will worsen without attention.

### Water Stains on Ceiling

**What it means:**
- Roof leak (if top floor)
- Plumbing leak (if bathroom above)
- HVAC condensation issue

**Why act soon:** Water damage leads to mold within 24-48 hours of exposure

### Multiple Slow Drains

**What it means:**
- Main sewer line issue
- Septic problem (if applicable)
- Not just a clog you can plunge

**Why act soon:** Can lead to sewage backup

### HVAC Not Heating/Cooling Effectively

**What it means:**
- Refrigerant leak
- Compressor issue
- Ductwork problems
- Aging system failing

**Why act soon:** Complete failure often follows reduced performance

### Growing Cracks in Walls

**How to monitor:** Mark the end of the crack with tape and date it

**Call a pro if:**
- Crack grows beyond your mark
- Crack wider than 1/4 inch
- Doors/windows becoming hard to open (indicates shifting)

### Persistent Moisture or Musty Smell

**What it means:**
- Hidden water intrusion
- Mold growth likely
- Humidity control issue

**Why act soon:** Mold affects air quality and health; remediation gets expensive fast

### Roof: Missing Shingles

**What it means:**
- Weather damage
- Aging roof
- Potential for leaks

**Why act soon:** Exposed areas can leak with next rain

## SCHEDULE: This Month

These need professional attention but aren''t emergencies.

### Water Heater Over 12 Years Old

**What it means:**
- Approaching end of life
- Risk of failure and flooding
- Reduced efficiency

**What to do:** Schedule inspection and get replacement quote before it fails

### Visible Foundation Cracks (Vertical, Under 1/4")

**What it means:**
- Normal settling in most cases
- Should be monitored

**What to do:** Have a structural engineer evaluate and provide monitoring guidance

### Peeling Exterior Paint

**What it means:**
- Moisture issue behind paint
- Wood may be rotting underneath
- Needs attention before winter

### Windows with Failed Seals

**Signs:** Condensation/fogging between panes

**What it means:**
- Seal failure
- Reduced insulation value
- Won''t get better on its own

## How to Describe Issues to Contractors

When you call, be specific:

**Be ready to say:**
- What you observed (be specific: "water stain on ceiling approximately 2 feet in diameter")
- When you first noticed it
- Has it changed? (growing, getting worse)
- What''s above/below the area
- Any related symptoms (sounds, smells)

**Take photos before calling.** Contractors can often give better guidance with visual reference.

**Ask:**
- What do you think it might be?
- How urgent is this?
- What''s the rough cost range?
- When can you come look at it?

## Building Your Pro Team

Don''t wait for emergencies to find contractors. Build relationships now:

- **Plumber** - Get a recommendation before you need one
- **Electrician** - Licensed and insured
- **HVAC tech** - Ideally from a company that can service your brand
- **General contractor** - For bigger projects
- **Roofer** - Especially if your roof is over 15 years old

**How to find good contractors:**
1. Ask neighbors who they use
2. Check reviews (Google, Yelp, NextDoor)
3. Verify license and insurance
4. Get multiple quotes for non-emergency work

---

📥 **Download the Checklist**: [Warning Signs Reference Card (PDF)]',
  'Awareness',
  'Beginner',
  12,
  false,
  true,
  'universal',
  11,
  '{"title": "Home Warning Signs Reference", "sections": [{"name": "CALL TODAY - Emergency", "items": ["Gas smell", "Warm/hot outlets", "Burning smell from electrical", "Sparking outlets", "Active water leak", "CO detector alarm", "Horizontal foundation cracks"]}, {"name": "CALL THIS WEEK", "items": ["Water stains on ceiling", "Multiple slow drains", "HVAC not heating/cooling well", "Growing wall cracks", "Persistent musty smell", "Missing roof shingles"]}, {"name": "SCHEDULE THIS MONTH", "items": ["Water heater over 12 years", "Vertical foundation cracks under 1/4in", "Peeling exterior paint", "Foggy windows (seal failure)"]}]}'
),
(
  'Understanding Your Home''s Major Systems',
  'understanding-home-major-systems',
  'A homeowner''s guide to the major systems in your house—what they do, how long they last, and what maintenance they need.',
  '# Understanding Your Home''s Major Systems

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Your home is made up of several major systems working together. Understanding what they are, what they do, and how long they typically last helps you plan for maintenance and replacement.

This guide gives you the homeowner''s-eye-view—what you need to know without becoming a contractor yourself.

## What You''ll Learn

- The major systems in your home
- Typical lifespan of each system
- Signs of problems to watch for
- When to schedule professional maintenance

## Roof System

**What it does:** Protects your home from weather, directs water away from the structure

**Components:**
- Shingles or other covering
- Underlayment (waterproof layer under shingles)
- Flashing (metal pieces at joints and edges)
- Gutters and downspouts
- Ventilation

**Typical lifespan:**
- Asphalt shingles: 20-30 years
- Metal roofing: 40-70 years
- Tile: 50+ years

**Signs of trouble:**
- Missing, cracked, or curling shingles
- Granules in gutters (shingle wear)
- Light visible in attic
- Water stains on ceiling
- Moss or algae growth

**Professional maintenance:** Annual inspection recommended, especially after major storms

## HVAC System

**What it does:** Heating, Ventilation, and Air Conditioning—keeps your home comfortable year-round

**Components:**
- Furnace or heat pump
- Air conditioner (central or heat pump)
- Ductwork
- Thermostat
- Air filter

**Typical lifespan:**
- Furnace: 15-20 years
- Central AC: 15-20 years
- Heat pump: 12-15 years

**Signs of trouble:**
- Uneven heating/cooling
- Strange noises when running
- Higher than normal utility bills
- System cycling on and off frequently
- Weak airflow from vents

**Homeowner maintenance:**
- Change filter every 1-3 months
- Keep outdoor unit clear of debris
- Don''t block vents with furniture

**Professional maintenance:** Twice yearly—spring for AC, fall for heating

## Plumbing System

**What it does:** Brings clean water in, takes waste water out

**Components:**
- Supply lines (bring water in)
- Drain lines (take water out)
- Water heater
- Fixtures (faucets, toilets, etc.)
- Shut-off valves

**Typical lifespan:**
- Copper pipes: 50+ years
- PEX pipes: 40-50 years
- Water heater: 10-15 years
- Fixtures: 15-20 years

**Signs of trouble:**
- Low water pressure
- Discolored water
- Slow drains (multiple fixtures)
- Water stains or moisture
- Higher water bills
- Sound of running water when nothing is on

**Homeowner maintenance:**
- Know where your main shut-off valve is
- Test shut-off valves annually
- Don''t pour grease down drains
- Address slow drains before they become clogs

**Professional maintenance:** Water heater flush annually; overall system inspection every few years

## Electrical System

**What it does:** Delivers electricity safely throughout your home

**Components:**
- Main panel (breaker box)
- Circuits and wiring
- Outlets and switches
- Grounding system
- GFCI protection (bathrooms, kitchen, outdoor)

**Typical lifespan:**
- Wiring: 50-70 years (older homes may need updating)
- Panel: 25-40 years
- Outlets/switches: 15-25 years

**Signs of trouble:**
- Frequently tripping breakers
- Flickering lights
- Warm outlets or switch plates
- Burning smell
- Outlets that don''t work
- Two-prong outlets (outdated, no grounding)

**Homeowner maintenance:**
- Test GFCI outlets monthly (push TEST button)
- Don''t overload circuits with power strips
- Replace damaged outlet covers

**Professional maintenance:** Full inspection if buying/selling home or if home is 40+ years old

## Foundation & Structure

**What it does:** Supports your entire home, keeps it level and stable

**Components:**
- Foundation (concrete slab, crawl space, or basement)
- Framing (wood or steel structure)
- Load-bearing walls

**Typical lifespan:**
- Poured concrete foundation: 80-100+ years
- Block foundation: 50-100 years (varies)
- Wood framing: 100+ years if protected from moisture

**Signs of trouble:**
- Cracks in foundation (especially horizontal)
- Doors or windows that stick
- Uneven floors
- Gaps between walls and ceiling
- Cracks in drywall (especially at corners of windows/doors)
- Water in basement or crawl space

**Professional maintenance:** Inspection if you notice any warning signs; otherwise, as part of home purchase

## Water Heater

**What it does:** Heats water for your home—showers, dishwasher, laundry

**Types:**
- Tank (stores heated water)
- Tankless (heats on demand)
- Heat pump (efficient, uses ambient air)

**Typical lifespan:**
- Tank: 10-15 years
- Tankless: 20+ years
- Heat pump: 12-15 years

**Signs of trouble:**
- Inconsistent water temperature
- Rusty water from hot tap
- Rumbling sounds
- Water pooling around unit
- Age over 10-12 years

**Homeowner maintenance:**
- Check for leaks monthly
- Know the age of your unit
- Note the location of shut-off valve

**Professional maintenance:** Flush annually; professional inspection if unit is over 10 years old

## Exterior & Siding

**What it does:** Protects the structure from weather, provides insulation

**Types:**
- Vinyl siding: 20-40 years
- Wood siding: 20-40 years (requires maintenance)
- Fiber cement: 30-50 years
- Brick: 100+ years
- Stucco: 50+ years

**Signs of trouble:**
- Cracks or holes
- Warping or buckling
- Fading (normal) vs. peeling (moisture issue)
- Soft spots (rot)
- Gaps at seams or around windows/doors

**Professional maintenance:** Inspection if selling or if you notice issues; repainting/staining wood siding every 5-10 years

## Creating Your Home System Inventory

For each major system, document:
1. Age (check permits, prior inspection reports, or visible labels)
2. Brand and model (for HVAC, water heater)
3. Last maintenance date
4. Any known issues
5. Name of company that services it

Keep this information in one place—digital or physical—so you can reference it quickly when needed.

---

📥 **Download the Checklist**: [Home Systems Inventory Template (PDF)]',
  'Awareness',
  'Beginner',
  15,
  false,
  true,
  'universal',
  12,
  '{"title": "Home Systems Inventory", "sections": [{"name": "Roof System", "items": ["Type/material:", "Age:", "Last inspection:", "Known issues:"]}, {"name": "HVAC System", "items": ["Furnace brand/age:", "AC brand/age:", "Last professional service:", "Filter size:"]}, {"name": "Plumbing", "items": ["Pipe material:", "Water heater brand/age:", "Main shut-off location:"]}, {"name": "Electrical", "items": ["Panel amperage:", "Age of wiring:", "GFCI locations:"]}, {"name": "Foundation", "items": ["Type:", "Any known cracks:", "Last inspection:"]}, {"name": "Water Heater", "items": ["Type:", "Brand/model:", "Age:", "Shut-off location:"]}]}'
),
(
  'How to Document Your Home for Insurance',
  'document-home-for-insurance',
  'Create a complete home inventory that can save you thousands in an insurance claim. Learn what to document and how to store it safely.',
  '# How to Document Your Home for Insurance

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

If disaster strikes—fire, theft, flood—you''ll need to prove what you owned and its value. The time to create this documentation is NOW, not after the emergency.

A complete home inventory can make the difference between a quick, fair insurance settlement and a frustrating, underpaid claim.

## What You''ll Learn

- What to document and how
- Room-by-room inventory guide
- How to store documentation safely
- Keeping your inventory current

## Why Documentation Matters

**Without documentation:**
- Estimating losses from memory is difficult and incomplete
- Insurance adjusters may undervalue your claim
- Claim processing takes longer
- You may forget significant items

**With good documentation:**
- Claims are processed faster
- You receive fairer settlement amounts
- Less stress during an already difficult time
- Proof of ownership and condition

## What to Document

### For Every Room:
- Overview photos (all walls, floor, ceiling)
- Contents: furniture, electronics, decor
- Close-ups of valuable items
- Serial numbers for electronics/appliances

### For Valuables:
- Jewelry: photos and appraisals
- Art: photos and purchase receipts
- Electronics: photos, serial numbers, receipts
- Collectibles: photos and valuations

### For Major Systems:
- Photos of HVAC equipment (including model plates)
- Water heater (model and serial)
- Appliances (model and serial)
- Condition photos (for proof of pre-loss condition)

### For Structure:
- Exterior photos (all sides)
- Roof condition photos
- Recent improvements (receipts and photos)
- Custom features (built-ins, finishes)

## Room-by-Room Guide

### Living Room
- Overall room photos (each wall)
- Furniture: sofas, chairs, tables, shelving
- Electronics: TV, speakers, gaming systems
- Decor: art, rugs, lamps, collectibles
- Note: brand, model, approximate value for major items

### Kitchen
- Overall room photos
- Appliances: refrigerator, oven, dishwasher, microwave (get model numbers)
- Small appliances: mixer, blender, coffee maker, etc.
- Cookware and dishes (overview)
- Any custom features (countertops, backsplash)

### Bedrooms
- Overall room photos
- Furniture: beds, dressers, nightstands
- Electronics: TVs, computers
- Clothing estimate (inventory by category: business wear, casual, outerwear)
- Jewelry and valuables (detailed photos)

### Bathrooms
- Overall photos
- Fixtures and finishes
- Small appliances (hair dryers, etc.)
- Towels and linens (general quantity)

### Garage/Storage
- Tools (hand tools, power tools)
- Lawn equipment
- Sporting equipment
- Seasonal items (decorations, etc.)
- Vehicle-related items

### Home Office
- Computer equipment (all components, serial numbers)
- Office furniture
- Printers, monitors, peripherals
- Software (keep license keys separately)

### Outdoor/Patio
- Furniture
- Grill and accessories
- Outdoor equipment
- Landscaping features (if insured)

## How to Document

### Photos
- Use good lighting
- Capture model numbers and serial number plates
- Take wide shots AND detail shots
- Open cabinets and closets

### Video
- Walk through each room narrating contents
- Open drawers and closets to show contents
- State approximate values as you go
- Cover entire property in one session

### Written Inventory
- Spreadsheet with columns for:
  - Item description
  - Location
  - Purchase date (approximate)
  - Purchase price
  - Current value estimate
  - Serial number (if applicable)
  - Receipt location

### Receipts
- Keep major purchase receipts
- Photograph receipts (they fade)
- Store in cloud or safe deposit box

## Storage: The Critical Step

Your documentation is useless if it''s destroyed along with your home.

### Store in Multiple Locations:
- **Cloud storage** (Google Drive, Dropbox, iCloud)
- **Email to yourself** (in a dedicated folder)
- **Safe deposit box** (physical copies)
- **Family member''s home** (USB drive backup)

### Never Store ONLY:
- On a computer in your home
- In a filing cabinet in your home
- On your phone (only copy)

## Keeping It Current

### Update When You:
- Make major purchases
- Complete home improvements
- Receive valuable gifts
- Sell or donate significant items

### Annual Review:
- Walk through home with camera
- Update spreadsheet with new items
- Remove items you no longer own
- Store updated version in cloud/backup locations

## Insurance Policy Tips

**While you''re documenting, also:**
- Review your policy limits
- Check if you need riders for high-value items
- Understand your deductible
- Know the difference between replacement cost and actual cash value

**Questions for your insurance agent:**
- Is my coverage adequate for full replacement?
- Do I need separate riders for jewelry/art/collectibles?
- What''s the claims process?
- How often should I update my inventory?

---

📥 **Download the Checklist**: [Home Inventory Documentation Checklist (PDF)]',
  'Awareness',
  'Beginner',
  12,
  false,
  true,
  'universal',
  13,
  '{"title": "Home Inventory Documentation Checklist", "sections": [{"name": "Living Room", "items": ["Overall photos (all walls)", "Furniture photos", "Electronics (with serial numbers)", "Art and decor", "Rugs and window treatments"]}, {"name": "Kitchen", "items": ["Overall photos", "Appliance model numbers", "Small appliances", "Cookware overview", "Custom features"]}, {"name": "Bedrooms", "items": ["Overall photos", "Furniture", "Electronics", "Closet contents overview", "Jewelry (detailed)"]}, {"name": "Office", "items": ["Computer equipment + serials", "Monitors and peripherals", "Office furniture", "Software licenses saved"]}, {"name": "Garage/Storage", "items": ["Tools", "Lawn equipment", "Sporting goods", "Seasonal items"]}, {"name": "Storage Locations", "items": ["Cloud backup created", "Email copy sent", "Safe deposit box copy", "Family member backup"]}]}'
);

-- ============================================
-- PAID GUIDES - Seasonal Maintenance (4)
-- ============================================

INSERT INTO resource_guides (
  title, slug, description, content, category, difficulty_level,
  estimated_read_time_minutes, is_free, is_published, region, sort_order, checklist_data
) VALUES
(
  'Spring Home Maintenance: Post-Winter Checkup',
  'spring-home-maintenance',
  'Essential spring tasks to assess winter damage and prepare your home for warmer months. A complete post-winter inspection guide.',
  '# Spring Home Maintenance: Post-Winter Checkup

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Winter is hard on homes. Freeze-thaw cycles, snow loads, ice dams, and months of sealed-up indoor air all take their toll.

Spring is your opportunity to assess any damage and prepare for the warmer months ahead. This guide walks you through a complete post-winter checkup.

## What You''ll Learn

- How to assess winter damage
- Essential spring maintenance tasks
- What to schedule with professionals
- Preparing for summer

## Exterior Assessment

### Roof (Visual Inspection from Ground)

**Look for:**
- Missing, cracked, or curling shingles
- Debris accumulation
- Damaged flashing
- Sagging areas
- Gutter condition

**Winter damage signs:**
- Shingles displaced by wind or ice
- Ice dam damage at eaves
- Flashing pulled away from chimneys

**Call a pro if:** You see missing shingles, significant damage, or debris in gutters indicating granule loss.

### Gutters and Downspouts

**Tasks you can do:**
- Clear debris (leaves, twigs, shingle granules)
- Check for sagging or pulling away
- Verify downspouts direct water away from foundation

**Call a pro if:** Gutters need repair, realignment, or replacement.

### Foundation Perimeter

**Walk around your home checking:**
- New cracks in foundation?
- Soil pulled away from foundation (from freeze-thaw)?
- Water pooling near foundation?
- Window wells clear of debris?

**Action needed:**
- Fill soil gaps (grade should slope away from foundation)
- Clear debris from window wells
- Note any new cracks for monitoring

### Exterior Walls and Siding

**Check for:**
- Cracks in stucco or masonry
- Warped or damaged siding
- Peeling paint (especially on wood)
- Gaps around windows and doors

### Driveway and Walkways

**Look for:**
- New cracks from freeze-thaw
- Heaving or uneven areas
- Tripping hazards

**Note:** Sealing concrete cracks in spring prevents summer water entry.

## Interior Tasks

### HVAC Transition

**Before warm weather:**
- Change the furnace filter
- Schedule AC tune-up with professional
- Clean around outdoor AC unit
- Test AC before you need it

**Don''t skip the tune-up:** Spring is ideal—contractors are less busy than in peak summer.

### Check for Winter Damage Inside

**Look for:**
- New water stains on ceilings or walls
- Signs of ice dam damage (usually in attic or at eaves)
- Musty smells (indicate moisture problems)
- Condensation on windows

### Windows and Doors

**Tasks:**
- Open and close all windows (after being closed all winter)
- Check screens for damage
- Look for failed window seals (foggy double-pane)
- Check weatherstripping condition

### Plumbing Check

**After winter:**
- Check for leaks at faucets and under sinks
- Test outdoor faucets (turn on carefully; check for pipe damage)
- Look for signs of frozen pipe damage (stains, soft spots)
- Test sump pump (pour water in pit; pump should activate)

### Smoke and CO Detectors

**Spring is a great reminder to:**
- Test all detectors
- Replace batteries (if not hardwired with battery backup)
- Replace any detector over 10 years old

## Outdoor Tasks

### Lawn and Landscaping

**As ground thaws:**
- Assess winter damage to plants
- Check for erosion areas
- Clean up debris
- Note any drainage issues for correction

**Keep away from the house:**
- Trim bushes to 12+ inches from siding
- Keep soil graded away from foundation
- Clear debris from foundation perimeter

### Outdoor Faucets and Hoses

**Check for:**
- Freeze damage (turn on slowly; check for leaks or spraying)
- Damaged hose connections
- Hose condition

**If you find leaks:** Turn off and call a plumber. Frozen pipe damage may need repair.

### Deck and Patio

**Inspect for:**
- Loose boards or railings
- Popped nails or screws
- Wood rot or soft spots
- Need for sealing (if water doesn''t bead on surface)

## Professional Services to Schedule

**Spring is the ideal time for:**
- AC tune-up (before peak summer prices and scheduling)
- Roof inspection (if any concerns from visual check)
- Gutter cleaning (if you didn''t do it yourself)
- Pressure washing (siding, deck, driveway)
- Window cleaning
- Chimney inspection (if wood-burning fireplace used in winter)

## Spring Maintenance Checklist Summary

**Exterior:**
- [ ] Visual roof inspection
- [ ] Clean gutters/check downspouts
- [ ] Foundation perimeter check
- [ ] Siding and exterior walls
- [ ] Driveway and walkway cracks

**Interior:**
- [ ] Change HVAC filter
- [ ] Schedule AC tune-up
- [ ] Check for water stains/damage
- [ ] Test all windows/doors
- [ ] Check plumbing for leaks
- [ ] Test smoke/CO detectors

**Outdoor:**
- [ ] Assess winter plant damage
- [ ] Check outdoor faucets
- [ ] Inspect deck/patio
- [ ] Clear debris from foundation

---

📥 **Download the Checklist**: [Spring Home Maintenance Checklist (PDF)]',
  'Seasonal',
  'Beginner',
  12,
  false,
  true,
  'universal',
  20,
  '{"title": "Spring Home Maintenance Checklist", "sections": [{"name": "Exterior Check", "items": ["Visual roof inspection from ground", "Clear and inspect gutters", "Check downspouts directing water away", "Walk foundation perimeter for cracks", "Inspect siding for damage", "Check driveway and walkways for cracks"]}, {"name": "Interior Tasks", "items": ["Change HVAC filter", "Schedule AC tune-up", "Check ceilings for water stains", "Test all windows open/close", "Check door weatherstripping", "Test outdoor faucets slowly", "Test sump pump"]}, {"name": "Safety", "items": ["Test all smoke detectors", "Test CO detectors", "Replace detector batteries"]}, {"name": "Outdoor", "items": ["Clear debris from foundation perimeter", "Check for winter plant damage", "Inspect deck for loose boards", "Check outdoor faucets for freeze damage"]}, {"name": "Schedule Pros", "items": ["AC tune-up appointment", "Gutter cleaning if needed", "Roof inspection if concerns"]}]}'
),
(
  'Summer Home Care: Protecting Against Heat',
  'summer-home-care',
  'Keep your home comfortable and efficient during the hot months. Essential summer maintenance and energy-saving tips.',
  '# Summer Home Care: Protecting Against Heat

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Summer brings heat, humidity, and storms. Your home works hard to keep you cool, and your outdoor systems need extra attention.

This guide covers essential summer tasks to keep your home comfortable and prevent heat-related problems.

## What You''ll Learn

- Keeping your AC running efficiently
- Summer storm preparedness
- Preventing moisture and pest problems
- Energy-saving strategies

## Air Conditioning Care

### Monthly Tasks

**Filter changes:** Summer AC use means more frequent filter changes.
- Check monthly
- Change when visibly dirty
- Dirty filters reduce efficiency by 5-15%

**Keep the outdoor unit clear:**
- 2 feet clearance on all sides
- Clear leaves, grass clippings, debris
- Rinse with hose to remove dirt (when unit is off)

### Signs of AC Problems

**Call a pro if:**
- Not cooling effectively despite running constantly
- Ice on refrigerant lines or outdoor unit
- Strange sounds or burning smell
- Water leaking inside from unit
- Electric bills dramatically higher than same period last year

**Don''t wait on AC issues.** Summer is the busiest time for HVAC companies—wait times increase as summer progresses.

### Thermostat Tips

**Efficient settings:**
- Set no lower than 78°F when home
- Raise to 85°F when away
- Use programmable or smart thermostat
- Ceiling fans allow you to raise thermostat 4°F without comfort change

**Avoid:**
- Setting thermostat super low thinking it cools faster (it doesn''t)
- Constant on/off (maintain steady temps)
- Blocking vents with furniture or curtains

## Managing Humidity

### Indoor Humidity

**Target:** 30-50% relative humidity

**Signs of too much humidity:**
- Condensation on windows
- Musty smell
- Mold or mildew growth
- Clammy feeling

**Solutions:**
- Run bathroom exhaust during and after showers
- Use kitchen exhaust when cooking
- Run AC (it removes humidity)
- Consider a dehumidifier in damp areas

### Outdoor Moisture

**Prevent water problems:**
- Keep gutters clear
- Ensure downspouts extend 4+ feet from foundation
- Check grading directs water away from home
- Keep sprinklers pointed away from foundation

## Storm Preparedness

### Before Storm Season

**Outdoor preparation:**
- Trim dead branches from trees near house
- Secure or store outdoor furniture and decor
- Check that grading directs water away from home
- Know where your main water shut-off is located

**Indoor preparation:**
- Test sump pump
- Check battery backup on sump pump (if you have one)
- Know location of flashlights and batteries
- Have emergency contact numbers ready

### After Storms

**Inspect for:**
- Missing or damaged shingles
- Downed branches on roof
- Debris in gutters
- Water in basement

**Document damage immediately** for insurance purposes.

## Pest Prevention

Summer brings increased pest activity.

**Basic prevention:**
- Seal gaps around doors, windows, utilities
- Keep food stored in sealed containers
- Fix any moisture issues (pests love moisture)
- Keep bushes and debris away from foundation
- Don''t leave pet food out

**Call a professional for:**
- Signs of termites or carpenter ants
- Rodent activity
- Wasp or bee nests near home
- Any infestation

## Outdoor Maintenance

### Deck and Patio

**Summer tasks:**
- Check for loose boards or railings (heavy use season)
- Clean as needed
- Reapply sealer if water doesn''t bead

### Lawn and Landscaping

**Keep foundation safe:**
- Water in early morning (not at night—promotes mold)
- Keep sprinklers away from foundation
- Don''t over-water near foundation
- Maintain 12+ inches between plants and siding

### Driveway and Walkways

**Summer is ideal for:**
- Sealing concrete cracks
- Pressure washing
- Treating oil stains

## Energy Efficiency Tips

**Easy wins:**
- Close blinds during hottest parts of day
- Use ceiling fans (counter-clockwise in summer)
- Cook outdoors when possible
- Run heat-generating appliances (dishwasher, dryer) in evening
- Check for air leaks around windows and doors

**Consider:**
- Window film for sun-facing windows
- Attic ventilation check
- Smart thermostat installation

## Summer Maintenance Checklist

**Monthly:**
- [ ] Check/change AC filter
- [ ] Clean around outdoor unit
- [ ] Check for AC issues (before it fails on hottest day)

**Seasonal:**
- [ ] Test sump pump
- [ ] Check gutters for debris
- [ ] Inspect for pest activity
- [ ] Check outdoor faucets and hoses
- [ ] Seal any new cracks in driveway

---

📥 **Download the Checklist**: [Summer Home Care Checklist (PDF)]',
  'Seasonal',
  'Beginner',
  10,
  false,
  true,
  'universal',
  21,
  '{"title": "Summer Home Care Checklist", "sections": [{"name": "AC Maintenance", "items": ["Check/change AC filter monthly", "Clear 2ft around outdoor unit", "Rinse outdoor unit with hose", "Listen for unusual sounds", "Verify cooling effectively"]}, {"name": "Humidity Control", "items": ["Check for window condensation", "Use bathroom exhaust fans", "Check for musty smells", "Consider dehumidifier if needed"]}, {"name": "Storm Prep", "items": ["Trim dead tree branches", "Secure outdoor furniture", "Test sump pump", "Know water shut-off location", "Have flashlights ready"]}, {"name": "Pest Prevention", "items": ["Seal gaps at doors/windows", "Check for moisture issues", "Keep bushes away from foundation", "Store food in sealed containers"]}, {"name": "Outdoor Tasks", "items": ["Check deck for loose boards", "Keep sprinklers away from foundation", "Seal driveway cracks"]}]}'
),
(
  'Fall Preparation: Getting Ready for Cold',
  'fall-preparation',
  'Prepare your home for winter before the cold arrives. Essential fall maintenance tasks to prevent freeze damage and heating problems.',
  '# Fall Preparation: Getting Ready for Cold

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Fall is the most important maintenance season. The work you do now prevents winter emergencies—frozen pipes, heating failures, ice dams, and water damage.

Do these tasks before the first freeze for a worry-free winter.

## What You''ll Learn

- Protecting pipes from freezing
- Preparing your heating system
- Preventing ice dams and roof damage
- Winterizing outdoor areas

## Heating System Preparation

### Schedule Professional Maintenance

**Before heating season:**
- Schedule furnace/heat pump tune-up
- Fall is ideal—before contractors get busy with no-heat emergencies
- Ask about carbon monoxide testing

**Don''t skip this.** Heating failures in winter are expensive, inconvenient, and dangerous.

### Homeowner Tasks

**Before turning on heat:**
- Change or check filter
- Clear items away from furnace/vents
- Make sure all vents are open and unblocked
- Locate your thermostat manual

**When you first run the heat:**
- Slight burning smell is normal (dust burning off)
- If smell persists or is strong, turn off and call a pro
- Check that warm air comes from all vents

### Fireplace and Chimney

**If you use a wood-burning fireplace:**
- Schedule chimney inspection and cleaning
- Check damper operation
- Stock firewood away from house (pests)
- Check smoke/CO detectors near fireplace

## Protecting Pipes from Freezing

### Exterior Prep

**Before first freeze:**
- Disconnect and drain outdoor hoses
- Shut off interior valve to outdoor faucets (if you have one)
- Open outdoor faucet to drain remaining water
- Cover outdoor faucets with insulated covers

### Interior Prep

**Pipes in vulnerable areas:**
- Identify pipes in unheated spaces (garage, crawl space, attic)
- Consider pipe insulation for vulnerable runs
- Know how to drip faucets during extreme cold (last resort)

**Know your shut-off:**
- Locate main water shut-off valve
- Test that it works (turn off and on)
- Mark it clearly so you can find it in emergency

## Preventing Ice Dams and Roof Damage

### Understanding Ice Dams

Ice dams form when:
1. Heat escapes through roof
2. Snow melts on warm upper roof
3. Water refreezes at cold eaves
4. Ice builds up, backing water under shingles

**Prevention:**
- Adequate attic insulation
- Proper attic ventilation
- Sealing air leaks to attic

### Fall Roof Tasks

**Gutter maintenance:**
- Clean gutters thoroughly
- Check downspouts clear
- Ensure gutters securely attached
- Consider gutter guards if leaves are constant problem

**Roof inspection (from ground):**
- Missing or damaged shingles?
- Damaged flashing?
- Debris accumulation?
- Trim tree branches overhanging roof

**Call a pro if:** You see damage or if your roof is over 20 years old.

## Exterior Winterization

### Windows and Doors

**Check weatherstripping:**
- Close door on dollar bill—should have resistance
- Replace worn weatherstripping
- Check for light around door frames

**Storm windows:**
- Install storm windows if you have them
- Check screens for damage (store properly)
- Consider window insulation film for drafty windows

### Foundation and Exterior

**Grade check:**
- Soil should slope away from foundation (prevents water pooling and freeze damage)
- Fill any gaps where soil settled
- Clear debris from foundation perimeter

**Caulking and sealing:**
- Check caulk around windows and doors
- Seal any cracks in foundation
- Seal gaps where utilities enter house

### Outdoor Systems

**Air conditioning:**
- Turn off outdoor AC unit
- Clean around unit
- Cover with breathable cover (not plastic—traps moisture)

**Sprinkler system:**
- Drain/blow out irrigation system
- Turn off water to system
- Cover backflow preventer if above ground

## Interior Preparation

### Attic Check

**Before winter:**
- Check insulation condition
- Look for signs of pests
- Ensure ventilation clear
- Check for any daylight (indicates gaps)

### Check Detectors

**Fall is ideal for:**
- Testing smoke detectors
- Testing CO detectors
- Replacing batteries (daylight saving time reminder)
- Replacing any detector over 10 years old

### Emergency Prep

**Have ready:**
- Flashlights with fresh batteries
- Candles and matches (safe use only)
- Emergency contact numbers posted
- Know how to shut off water, gas, electricity
- Consider backup heat source safety

## Fall Maintenance Checklist

**Heating:**
- [ ] Schedule professional furnace tune-up
- [ ] Change or check filter
- [ ] Test heating system before cold weather
- [ ] Chimney inspection (if applicable)

**Pipes:**
- [ ] Disconnect and drain outdoor hoses
- [ ] Shut off exterior faucets if possible
- [ ] Install faucet covers
- [ ] Know main water shut-off location

**Roof and Gutters:**
- [ ] Clean gutters thoroughly
- [ ] Check downspouts clear
- [ ] Visual roof inspection
- [ ] Trim overhanging branches

**Exterior:**
- [ ] Check weatherstripping
- [ ] Seal window and door gaps
- [ ] Check foundation caulking
- [ ] Cover AC unit

**Interior:**
- [ ] Check attic insulation
- [ ] Test smoke and CO detectors
- [ ] Replace detector batteries

---

📥 **Download the Checklist**: [Fall Preparation Checklist (PDF)]',
  'Seasonal',
  'Beginner',
  12,
  false,
  true,
  'universal',
  22,
  '{"title": "Fall Preparation Checklist", "sections": [{"name": "Heating System", "items": ["Schedule professional furnace tune-up", "Change or check filter", "Test heating before cold weather", "Clear items from around furnace", "Chimney inspection (if wood-burning)"]}, {"name": "Freeze Protection", "items": ["Disconnect outdoor hoses", "Drain outdoor faucets", "Install faucet covers", "Know main water shut-off location", "Test shut-off valve works"]}, {"name": "Roof and Gutters", "items": ["Clean gutters thoroughly", "Check downspouts clear", "Visual roof inspection from ground", "Trim overhanging branches", "Check flashing condition"]}, {"name": "Exterior", "items": ["Check weatherstripping on doors", "Seal window gaps", "Check foundation caulking", "Grade slopes away from foundation", "Cover AC unit", "Drain sprinkler system"]}, {"name": "Interior", "items": ["Check attic insulation", "Test smoke detectors", "Test CO detectors", "Replace detector batteries", "Gather emergency supplies"]}]}'
),
(
  'Winter Readiness: Freeze Prevention Basics',
  'winter-readiness',
  'Essential winter maintenance to keep your home safe and warm. Prevent frozen pipes, heating emergencies, and winter damage.',
  '# Winter Readiness: Freeze Prevention Basics

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Winter is the season of home emergencies. Frozen pipes burst, heating systems fail, and ice causes damage. Most of these emergencies are preventable with proper preparation.

This guide focuses on surviving winter safely and preventing the most common winter disasters.

## What You''ll Learn

- Preventing frozen pipes
- Managing your heating system through winter
- Dealing with ice and snow
- What to do in winter emergencies

## Preventing Frozen Pipes

### Understanding the Risk

Pipes freeze when water inside them is exposed to temperatures below 32°F (0°C) for long enough.

**Most vulnerable:**
- Pipes along exterior walls
- Pipes in unheated spaces (garage, crawl space, attic)
- Outdoor faucets
- Pipes near windows or vents

### During Cold Snaps

**When temperatures drop significantly:**
- Open cabinet doors under sinks (especially on exterior walls)
- Let faucets drip slightly (moving water is harder to freeze)
- Keep thermostat at consistent temperature day and night
- Don''t set thermostat below 55°F, even when away

**If you leave for vacation:**
- Keep heat at minimum 55°F
- Open cabinet doors
- Have someone check the house
- Know where your main water shut-off is

### If Pipes Freeze (But Haven''t Burst)

**Signs of frozen pipe:**
- No water from faucet
- Frost visible on pipe
- Pipe bulging

**What to do:**
1. Keep faucet open
2. Apply gentle heat (hair dryer, heating pad, warm towels)
3. Start from faucet and work toward frozen area
4. Never use open flame or high heat

**Call a plumber if:** You can''t locate the freeze, pipe appears damaged, or you''re unsure.

### If a Pipe Bursts

**Immediate steps:**
1. Shut off main water valve
2. Open faucets to drain remaining water
3. Call a plumber immediately
4. If significant flooding, call water damage restoration
5. Document damage for insurance

## Heating System Winter Care

### Regular Tasks

**Monthly:**
- Check and change filter (heavy use = faster clogging)
- Listen for unusual sounds
- Verify consistent heating in all rooms

**Keep clear:**
- Area around furnace
- All vents and returns
- Items away from space heaters

### Warning Signs

**Call a pro immediately if:**
- No heat
- Burning smell (beyond first use of season)
- Yellow flame on furnace (should be blue)
- CO detector alarm
- Loud or unusual sounds

### Carbon Monoxide Safety

**CO risks increase in winter:** Windows closed, heating running, fireplaces in use.

**Prevention:**
- Annual furnace inspection
- Test CO detectors monthly
- Never run generators indoors or in garage
- Never use oven/stove for heating

**If CO alarm sounds:** Leave immediately, call 911 from outside, don''t re-enter until cleared.

### Space Heater Safety

**If you use space heaters:**
- 3 feet clearance from anything flammable
- Plug directly into wall (not extension cord)
- Turn off when leaving room or sleeping
- Choose models with auto shut-off features

## Managing Ice and Snow

### Roof and Gutters

**Ice dam prevention:**
- Keep gutters clear
- Consider heat cables in problem areas
- Roof rake to remove snow (carefully) near eaves
- Professional assessment if ice dams are recurring

**Warning:** Only rake what you can reach safely from ground. Climbing on icy roofs is extremely dangerous.

### Driveway and Walkways

**De-icing:**
- Use sparingly—salt damages concrete over time
- Consider alternatives (sand for traction, calcium chloride less harsh)
- Clear snow before it turns to ice
- Don''t pile snow against foundation

### Outdoor Tasks in Winter

**After snow/ice events:**
- Check for visible roof damage
- Ensure gutters not pulling away from weight
- Clear snow away from foundation
- Check that dryer and furnace vents aren''t blocked by snow

## Power Outage Preparation

### Have Ready

**Essentials:**
- Flashlights and batteries
- Battery-powered radio
- Charged phone battery pack
- Warm blankets
- Non-perishable food and water

### During Outages

**Safety:**
- Never use generators indoors or in garage
- Don''t use gas stove for heating
- Keep refrigerator closed (stays cold 4 hours)
- Unplug electronics to prevent surge when power returns

**Pipe protection during extended outage:**
- Drain water system if heat will be off for extended period
- Call plumber for guidance if unsure

## When to Call for Help

**Don''t wait on:**
- No heat
- Frozen or burst pipes
- CO alarm
- Water damage
- Ice dam damage

**Scheduled maintenance:**
- Annual furnace tune-up (do before winter)
- Chimney cleaning (before fireplace season)
- Roof inspection if issues suspected

## Winter Maintenance Checklist

**Ongoing:**
- [ ] Check/change filter monthly
- [ ] Monitor for cold spots in home
- [ ] Test CO detector monthly
- [ ] Keep gutters clear of ice buildup
- [ ] Check vents not blocked by snow

**During Cold Snaps:**
- [ ] Open cabinet doors on exterior walls
- [ ] Consider dripping faucets
- [ ] Keep thermostat consistent
- [ ] Check on elderly neighbors

---

📥 **Download the Checklist**: [Winter Readiness Checklist (PDF)]',
  'Seasonal',
  'Beginner',
  12,
  false,
  true,
  'universal',
  23,
  '{"title": "Winter Readiness Checklist", "sections": [{"name": "Freeze Prevention", "items": ["Know main water shut-off location", "Faucet covers installed", "Cabinet doors open during cold snaps", "Thermostat at consistent temperature", "Pipes in cold areas insulated"]}, {"name": "Heating System", "items": ["Check filter monthly", "Listen for unusual sounds", "Verify all rooms heating", "Area around furnace clear"]}, {"name": "Safety", "items": ["Test CO detectors monthly", "Test smoke detectors", "Space heaters 3ft from flammable items", "Never use oven for heat"]}, {"name": "Ice and Snow", "items": ["Keep gutters clear", "Clear snow from foundation", "Check vents not blocked by snow", "De-ice walkways safely"]}, {"name": "Emergency Prep", "items": ["Flashlights and batteries ready", "Warm blankets accessible", "Phone charger battery pack", "Know what to do in power outage"]}]}'
);

-- ============================================
-- PAID GUIDES - PNW-Specific (3)
-- ============================================

INSERT INTO resource_guides (
  title, slug, description, content, category, difficulty_level,
  estimated_read_time_minutes, is_free, is_published, region, sort_order, checklist_data
) VALUES
(
  'Pacific Northwest Rain & Moisture Management',
  'pnw-rain-moisture-management',
  'Living in the PNW means managing moisture year-round. Learn to protect your home from the region''s unique challenges.',
  '# Pacific Northwest Rain & Moisture Management

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

The Pacific Northwest receives 35-50+ inches of rain annually—much of it during a concentrated rainy season. This constant moisture creates unique challenges for homeowners.

This guide helps PNW homeowners recognize and prevent moisture-related problems before they cause serious damage.

## What You''ll Learn

- PNW-specific moisture challenges
- Protecting your home exterior
- Indoor humidity management
- Seasonal moisture maintenance

## Understanding PNW Moisture Challenges

### The Rainy Season Reality

**October through May** brings:
- Extended periods of rain
- High humidity (often 80%+)
- Limited drying opportunities
- Moss and mold growth conditions

### Common PNW Moisture Problems

- **Moss on roofs and hardscape**
- **Mold and mildew on exteriors**
- **Basement/crawl space moisture**
- **Wood rot on siding and trim**
- **Gutter overflow from debris and rain volume**

## Exterior Protection

### Gutters: Your First Defense

**In the PNW, gutters work overtime:**
- Clean gutters minimum twice yearly (fall and late winter)
- Check after major storms
- Consider gutter guards (but still inspect regularly)
- Ensure downspouts extend 4+ feet from foundation

**Signs of problems:**
- Water overflowing during rain
- Water staining on siding below gutters
- Gutters pulling away from fascia
- Pooling water near foundation

### Roof Vigilance

**PNW roofs face:**
- Constant moisture
- Debris from evergreen trees
- Moss and algae growth
- Limited dry periods

**Monitoring:**
- Visual inspection from ground after storms
- Watch for moss accumulation
- Check for debris buildup in valleys
- Look for damaged or missing shingles

**Moss treatment:**
- Zinc strips can prevent moss growth
- Have moss removed professionally if significant
- Don''t pressure wash—it damages shingles

### Siding and Trim

**Wood components are vulnerable:**
- Check for peeling paint (traps moisture)
- Look for soft spots (rot indicator)
- Ensure caulking is intact around windows/doors
- Keep plants 12+ inches from siding for airflow

**Signs of moisture intrusion:**
- Paint bubbling or peeling
- Wood feels soft when pressed
- Visible mold or mildew
- Staining on siding

### Foundation and Grading

**Critical in the PNW:**
- Ground should slope AWAY from foundation
- No water pooling within 10 feet of house
- French drains may be necessary
- Check crawl space for standing water

**After heavy rains:**
- Walk the perimeter and look for pooling
- Check basement/crawl space for moisture
- Note any new drainage issues

## Indoor Humidity Management

### Target Humidity

**Ideal:** 30-50% relative humidity

**PNW reality:** Often much higher without intervention

### Managing Indoor Moisture

**Ventilation is key:**
- Run bathroom fans during and 30 minutes after showers
- Use kitchen exhaust when cooking
- Consider whole-house ventilation system
- Open windows when weather permits (dry days)

**Dehumidification:**
- Portable dehumidifiers for problem areas
- Crawl space dehumidifier if applicable
- Target below 50% humidity

### Signs of Excess Indoor Humidity

- Condensation on windows
- Musty smell
- Mold in bathrooms/kitchen
- Damp feeling in closets
- Warping of wood furniture

## Crawl Space Considerations

**PNW crawl spaces are high-risk for:**
- Standing water
- Mold growth
- Pest infestation
- Structural damage

**Protection measures:**
- Vapor barrier on ground
- Adequate ventilation (or encapsulation)
- Dehumidifier if needed
- Regular inspection (twice yearly minimum)

**Call a pro if:** Standing water, visible mold, or musty smell.

## Seasonal Maintenance Calendar

### Fall (September-October)
- [ ] Clean gutters thoroughly
- [ ] Inspect roof from ground
- [ ] Check exterior caulking
- [ ] Test sump pump
- [ ] Clear foundation perimeter

### Winter (December-January)
- [ ] Check gutters mid-season
- [ ] Monitor crawl space/basement
- [ ] Watch for ice dams (rare but possible)
- [ ] Manage indoor humidity

### Spring (March-April)
- [ ] Clean gutters again
- [ ] Assess moss growth on roof
- [ ] Check for winter moisture damage
- [ ] Inspect siding and trim
- [ ] Address any drainage issues

### Summer (July-August)
- [ ] Take advantage of dry weather for repairs
- [ ] Paint/seal wood surfaces
- [ ] Address moss if needed
- [ ] Improve drainage if issues noted

---

📥 **Download the Checklist**: [PNW Moisture Management Checklist (PDF)]',
  'PNW',
  'Beginner',
  12,
  false,
  true,
  'pnw',
  30,
  '{"title": "PNW Moisture Management Checklist", "sections": [{"name": "Gutters (Check 2x Yearly)", "items": ["Clean all debris", "Check downspout extensions 4ft+", "Look for water staining on siding", "Ensure securely attached"]}, {"name": "Roof Monitoring", "items": ["Visual check from ground after storms", "Watch for moss accumulation", "Check for debris in valleys", "Note any missing shingles"]}, {"name": "Exterior", "items": ["Check caulking at windows/doors", "Look for soft spots in wood", "Keep plants 12in from siding", "Check paint condition"]}, {"name": "Foundation", "items": ["Ground slopes away from house", "No water pooling near foundation", "Check crawl space for moisture"]}, {"name": "Indoor Humidity", "items": ["Run bathroom fans 30min post-shower", "Use kitchen exhaust when cooking", "Target 30-50% humidity", "Watch for window condensation"]}]}'
),
(
  'Moss, Mold & Mildew: PNW Homeowner''s Guide',
  'pnw-moss-mold-mildew-guide',
  'Dealing with the green stuff that loves PNW weather. Learn to identify, prevent, and address moss, mold, and mildew safely.',
  '# Moss, Mold & Mildew: PNW Homeowner''s Guide

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

In the Pacific Northwest, green growth isn''t just in your yard—it''s on your roof, siding, deck, and concrete. While some of this is cosmetic, some can cause real damage or health concerns.

This guide helps you understand what''s growing on your home and when to be concerned.

## What You''ll Learn

- Difference between moss, mold, and mildew
- What''s harmful vs. cosmetic
- Prevention strategies
- When to call professionals

## Moss vs. Mold vs. Mildew

### Moss

**What it is:** A plant (not a fungus) that loves moisture and shade

**Where it grows:**
- North-facing roofs
- Shaded areas
- Concrete and pavers
- Wood surfaces

**Is it harmful?**
- On roofs: YES—lifts shingles, traps moisture, causes rot
- On concrete: Mostly cosmetic, but can be slippery
- On decks: Can retain moisture leading to rot

### Mold

**What it is:** A fungus that can be black, green, or other colors

**Where it grows:**
- Damp interior spaces
- Bathrooms and kitchens
- Basements and crawl spaces
- Behind walls with moisture issues

**Is it harmful?**
- Indoor mold can affect air quality and health
- Black mold requires professional remediation
- Exterior mold is less concerning but indicates moisture

### Mildew

**What it is:** An early-stage surface mold

**Where it grows:**
- Bathrooms (shower, around tub)
- Kitchens (under sink, around fixtures)
- Fabrics and paper

**Is it harmful?**
- Surface mildew is easily cleaned
- Indicates excess humidity
- Address the humidity, not just the mildew

## Moss on Roofs

### Why It''s a Problem

Moss doesn''t just sit on top of shingles—it:
- Grows under shingle edges
- Holds moisture against roofing
- Speeds deterioration
- Can cause leaks

### Prevention

**Zinc or copper strips:**
- Installed at ridge line
- Rain carries metals down roof
- Inhibits moss growth

**Tree trimming:**
- Reduce shade on roof
- Improve air circulation
- Reduce debris

**Gutter maintenance:**
- Clean gutters prevent debris buildup on roof edges

### Treatment

**What NOT to do:**
- Don''t pressure wash—damages shingles
- Don''t scrub vigorously—removes granules
- Don''t use harsh chemicals

**Safe approach:**
- Have professionals remove significant moss
- Apply moss killer product (follow directions carefully)
- Brush GENTLY with soft brush
- Prevention is better than treatment

## Mold Concerns

### Indoor Mold Warning Signs

**Look for:**
- Visible black, green, or fuzzy growth
- Musty or earthy smell
- Water stains on walls/ceiling
- Peeling paint or wallpaper

**Common locations:**
- Bathroom corners and ceilings
- Under sinks
- Around windows with condensation
- Basements and crawl spaces

### When to Call Professionals

**Call a mold remediation specialist if:**
- Black mold visible (Stachybotrys)
- Mold covering more than 10 square feet
- Mold in HVAC system
- Mold behind walls
- Health symptoms (respiratory issues, allergies worsening)

### Small Area Mold

**Surface mold on tile/glass (less than 10 sq ft):**
- Mix 1 cup bleach to 1 gallon water
- Ventilate the area well
- Wear gloves and eye protection
- Scrub with solution
- Rinse and dry completely

**After cleaning:**
- Address the moisture source
- Improve ventilation
- Monitor for return

## Exterior Green Growth

### On Siding

**Prevention:**
- Keep plants trimmed away from siding
- Ensure good air circulation
- Address sprinkler overspray

**Cleaning:**
- Soft wash (low pressure + cleaning solution) is safer than pressure washing
- Consider professional cleaning for significant growth

### On Decks and Patios

**Prevention:**
- Keep clean of debris
- Allow to dry between rains (when possible)
- Regular sweeping

**Cleaning:**
- Wood decks: Use appropriate deck cleaner
- Concrete: Can use pressure washer carefully
- Follow with sealer to prevent recurrence

## Managing Indoor Humidity

**The key to preventing mold and mildew:**
- Target 30-50% relative humidity
- Run bathroom exhaust fans 30+ minutes after showers
- Use kitchen exhaust when cooking
- Consider dehumidifier for damp areas
- Fix any water leaks immediately

## Seasonal PNW Considerations

**Rainy season (Oct-May):**
- Monitor indoor humidity closely
- Run exhaust fans consistently
- Check for condensation on windows
- Inspect problem areas monthly

**Dry season (June-Sept):**
- Address exterior growth
- Make repairs that require dry weather
- Reseal decks and concrete
- Have moss removed if significant

---

📥 **Download the Checklist**: [Moss, Mold & Mildew Reference Guide (PDF)]',
  'PNW',
  'Beginner',
  10,
  false,
  true,
  'pnw',
  31,
  '{"title": "PNW Moss/Mold/Mildew Reference", "sections": [{"name": "Moss on Roof", "items": ["Visual check for moss accumulation", "Consider zinc strips for prevention", "Have significant moss professionally removed", "Never pressure wash shingles"]}, {"name": "Indoor Mold Check", "items": ["Check bathroom corners and ceiling", "Look under sinks for moisture", "Check around window frames", "Note any musty smells"]}, {"name": "When to Call Pro", "items": ["Black mold visible", "More than 10 sq ft affected", "Mold in HVAC system", "Health symptoms occurring"]}, {"name": "Humidity Control", "items": ["Target 30-50% humidity", "Bathroom fan 30min after showers", "Kitchen exhaust when cooking", "Fix water leaks immediately"]}, {"name": "Exterior Maintenance", "items": ["Keep plants away from siding", "Sweep deck regularly", "Address sprinkler overspray", "Clean gutters regularly"]}]}'
),
(
  'PNW Freeze Cycles: Protecting Pipes & Exteriors',
  'pnw-freeze-cycles',
  'PNW winters bring freeze-thaw cycles that can damage pipes, concrete, and exteriors. Learn how to protect your home.',
  '# PNW Freeze Cycles: Protecting Pipes & Exteriors

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Pacific Northwest winters are mild compared to other regions, but that can make freeze events more dangerous. Many homes aren''t built for extreme cold, and freeze-thaw cycles cause unique damage.

This guide helps PNW homeowners prepare for and survive freezing weather.

## What You''ll Learn

- Why PNW freezes are particularly risky
- Protecting pipes from freezing
- Preventing freeze-thaw damage
- What to do during a freeze event

## Why PNW Freezes Are Different

### The Challenge

**PNW freeze risks:**
- Homes often not built for extreme cold
- Pipes frequently in vulnerable locations
- Fewer freezing days means less preparedness
- Freeze-thaw cycles cause unique damage

**Typical freeze pattern:**
- Occasional cold snaps (below 32°F)
- Often followed quickly by warming
- Multiple freeze-thaw cycles per winter
- Rare but possible extended freezes

## Protecting Pipes

### Most Vulnerable Areas

**PNW homes often have pipes in:**
- Crawl spaces (common in PNW)
- Exterior walls (especially older homes)
- Garages (often unheated)
- Near exterior vents

### Before Freeze Season

**Fall preparation:**
- Disconnect and drain outdoor hoses
- Locate and test main water shut-off
- Identify vulnerable pipes
- Install insulated faucet covers on exterior spigots

**If you have a crawl space:**
- Check that vents can be closed or covered
- Consider pipe insulation for vulnerable runs
- Ensure crawl space vapor barrier intact

### During Cold Snaps

**When freezing temps forecast:**
- Open cabinet doors under sinks on exterior walls
- Let faucets drip slightly (cold water side)
- Keep thermostat at consistent temp (at least 55°F)
- If you have crawl space vents, close or cover them

**If leaving home:**
- Don''t set thermostat below 55°F
- Open cabinet doors
- Shut off main water if leaving for extended period
- Have someone check on the house

### Signs of Frozen Pipes

**Warning signs:**
- No water from faucet
- Only a trickle of water
- Frost visible on exposed pipes
- Unusual sounds when turning on water

### If Pipes Freeze (But Haven''t Burst)

**Steps:**
1. Keep faucet open
2. Apply gentle heat (hair dryer, heating pad)
3. Start from faucet, work toward frozen area
4. Never use open flame

**Call a plumber if:**
- Can''t locate freeze
- Pipe looks damaged
- Not comfortable thawing yourself

### If Pipe Bursts

**Immediate steps:**
1. Shut off main water valve
2. Open faucets to drain pressure
3. Call plumber immediately
4. Call water damage restoration if significant flooding
5. Document for insurance

## Freeze-Thaw Damage

### Concrete and Masonry

**The problem:**
- Water enters small cracks
- Freezing expands the water
- Thawing allows more water to enter
- Cycle repeats, widening damage

**Affected areas:**
- Driveways and walkways
- Steps and patios
- Foundation (surface spalling)
- Retaining walls

**Prevention:**
- Seal cracks before winter
- Apply concrete sealer
- Ensure proper drainage

### Exterior Paint and Caulking

**Freeze-thaw degrades:**
- Paint adhesion
- Caulk flexibility
- Wood protection

**Check and maintain:**
- Caulk around windows and doors
- Paint on wood surfaces
- Siding condition

## PNW Cold Weather Checklist

### Before Cold Season (October)
- [ ] Disconnect outdoor hoses
- [ ] Install faucet covers
- [ ] Locate main water shut-off
- [ ] Check crawl space for issues
- [ ] Seal concrete cracks

### When Freeze Forecast
- [ ] Open cabinet doors (exterior walls)
- [ ] Set thermostat to consistent temp
- [ ] Let faucets drip if extended freeze
- [ ] Close crawl space vents
- [ ] Ensure garage doors closed

### After Freeze Event
- [ ] Check all faucets for water flow
- [ ] Look for signs of pipe damage
- [ ] Check basement/crawl space for water
- [ ] Inspect exterior for damage

## When to Call Professionals

**Plumber:**
- Frozen pipes you can''t locate or thaw
- Burst pipes
- Installing freeze protection

**Foundation/Concrete:**
- Significant freeze-thaw damage
- Spalling or crumbling concrete
- Foundation cracks

---

📥 **Download the Checklist**: [PNW Freeze Protection Checklist (PDF)]',
  'PNW',
  'Beginner',
  10,
  false,
  true,
  'pnw',
  32,
  '{"title": "PNW Freeze Protection Checklist", "sections": [{"name": "Fall Prep (October)", "items": ["Disconnect outdoor hoses", "Install faucet covers", "Know main water shut-off location", "Check crawl space condition", "Seal concrete cracks"]}, {"name": "When Freeze Forecast", "items": ["Open cabinet doors under sinks", "Keep thermostat at 55°F minimum", "Drip faucets if extended freeze", "Close crawl space vents", "Keep garage doors closed"]}, {"name": "After Freeze Event", "items": ["Check all faucets work", "Look for pipe damage signs", "Check basement for water", "Inspect exterior for damage"]}, {"name": "Pipe Freeze Response", "items": ["Keep faucet open", "Apply gentle heat (hair dryer)", "Never use open flame", "Call plumber if can''t locate"]}, {"name": "If Pipe Bursts", "items": ["Turn off main water valve", "Open faucets to drain", "Call plumber immediately", "Document for insurance"]}]}'
);

-- ============================================
-- PAID GUIDES - Smart Homeowner (4)
-- ============================================

INSERT INTO resource_guides (
  title, slug, description, content, category, difficulty_level,
  estimated_read_time_minutes, is_free, is_published, region, sort_order, checklist_data
) VALUES
(
  'Finding & Vetting Licensed Contractors',
  'finding-vetting-contractors',
  'How to find trustworthy contractors before you need them urgently. Questions to ask, red flags to watch, and how to verify credentials.',
  '# Finding & Vetting Licensed Contractors

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

The best time to find a good contractor is BEFORE you need one urgently. When your furnace dies in January or your roof is leaking, you don''t have time to properly vet someone.

This guide helps you build a team of trusted professionals so you''re prepared when needs arise.

## What You''ll Learn

- Where to find quality contractors
- Questions to ask before hiring
- Red flags to watch for
- How to verify credentials
- Building ongoing relationships

## Types of Contractors to Have on Call

### Essential (Find These First)

**Plumber**
- Emergency repairs
- Water heater issues
- Drain problems

**Electrician**
- Safety issues
- Outlet/switch problems
- Panel upgrades

**HVAC Technician**
- Heating and cooling service
- Emergency repairs
- Annual maintenance

### Important

**General Contractor**
- Larger projects
- Multiple trades needed
- Remodels

**Roofer**
- Leak repairs
- Inspections
- Replacement

**Handyman**
- Small repairs
- Multiple small tasks
- Non-specialty work

## Where to Find Contractors

### Best Sources

**Personal recommendations:**
- Ask neighbors, friends, family
- NextDoor and local community groups
- Real estate agents often have lists
- Property managers know who''s reliable

**Professional networks:**
- Check trade association member lists
- Better Business Bureau (BBB)
- Chamber of Commerce

### Verify Before Hiring

**Check:**
- State license lookup (required for most trades)
- Insurance verification (ask for certificate)
- BBB rating and complaints
- Online reviews (Google, Yelp, Angi)
- References from past customers

## Questions to Ask

### Initial Phone Call

1. "Are you licensed and insured?"
2. "How long have you been in business?"
3. "Do you handle this type of work?"
4. "What''s your typical availability?"
5. "Do you provide written estimates?"

### Before Hiring

1. "Can I see your license and insurance certificate?"
2. "Will you pull necessary permits?"
3. "What''s included in your quote?"
4. "What''s your warranty on work?"
5. "Can I have references from recent similar jobs?"
6. "Who will do the work—you or subcontractors?"
7. "What''s your payment schedule?"

### Red Flags

**Avoid contractors who:**
- Won''t provide license number
- Ask for full payment upfront
- Only accept cash
- Pressure you to decide immediately
- Can''t provide references
- Have no physical address
- Show up at your door unsolicited
- Offer significantly lower prices than others

## Getting Quotes

### For Larger Jobs

**Get 3 quotes when possible:**
- Ensures fair pricing
- Reveals different approaches
- Helps identify outliers

**Compare:**
- Scope of work (are they quoting the same thing?)
- Materials quality
- Timeline
- Payment terms
- Warranty

**Lowest price isn''t always best:**
- May indicate cutting corners
- May be a bait-and-switch (low quote, extras added)
- Quality work has fair compensation

### For Service Calls

**Understand the pricing:**
- Service call fee (just to show up)
- Hourly rate
- Parts markup
- After-hours rates

## Working with Contractors

### Before Work Begins

- Get written contract or detailed quote
- Understand payment schedule
- Agree on timeline
- Know who to contact with questions
- Clear access to work area

### During the Job

- Be available for questions
- Don''t micromanage
- Document progress (photos)
- Address concerns promptly
- Pay on agreed schedule

### After Completion

- Inspect work before final payment
- Get any warranty documentation
- Keep records (photos, receipts, contracts)
- Leave reviews for good work
- Add to your contractor list for future

## Building Relationships

### The Value of Repeat Customers

**Good contractors value repeat clients:**
- They know your home
- Faster response times
- May prioritize your emergencies
- More willing to fit in small jobs

### Maintaining Relationships

- Pay on time
- Be respectful of their time
- Provide referrals for good work
- Schedule annual maintenance
- Keep their contact info accessible

## Emergency Situations

**When you can''t vet thoroughly:**
- Still verify license online (takes 2 minutes)
- Don''t agree to large upfront payments
- Get something in writing before work
- Take photos before and after
- Trust your instincts on red flags

---

📥 **Download the Checklist**: [Contractor Vetting Scorecard (PDF)]',
  'Smart Homeowner',
  'Beginner',
  12,
  false,
  true,
  'universal',
  40,
  '{"title": "Contractor Vetting Scorecard", "sections": [{"name": "Verify Before Hiring", "items": ["License number verified online", "Insurance certificate provided", "BBB rating checked", "Online reviews read", "References contacted"]}, {"name": "Questions to Ask", "items": ["Licensed and insured?", "Years in business?", "Written estimate provided?", "Warranty on work?", "Who does the actual work?", "Payment schedule?"]}, {"name": "Red Flags - Avoid If", "items": ["Won''t provide license number", "Wants full payment upfront", "Only accepts cash", "Pressure to decide immediately", "No references available", "Showed up at door unsolicited"]}, {"name": "Before Work Begins", "items": ["Written contract signed", "Payment schedule agreed", "Timeline established", "Contact info exchanged"]}, {"name": "After Work Complete", "items": ["Inspect work before final payment", "Get warranty documentation", "Keep all records", "Leave review if deserved"]}]}'
),
(
  'When to Call a Pro: The Decision Guide',
  'when-to-call-a-pro',
  'Know when to tackle it yourself and when to call a professional. A practical decision framework for common home issues.',
  '# When to Call a Pro: The Decision Guide

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

Part of being a smart homeowner is knowing what you can handle and what requires a professional. This guide helps you make that decision for common home situations.

The underlying principle: **If it involves safety, permits, or specialized knowledge—call a pro.**

## What You''ll Learn

- General decision-making framework
- System-by-system guidance
- When to call vs. when to wait
- DIY tasks most homeowners can handle

## The Decision Framework

### Call a Pro If:

**Safety is involved:**
- Electrical work (beyond changing light bulbs)
- Gas appliances
- Structural concerns
- Working at heights
- Mold beyond small surface areas

**Permits are required:**
- Electrical changes
- Plumbing changes
- Structural modifications
- HVAC replacement
- Roofing (sometimes)

**Specialized tools/knowledge needed:**
- HVAC refrigerant work
- Electrical panel work
- Main sewer line issues
- Roof repairs
- Foundation issues

**Warranty could be voided:**
- HVAC systems under warranty
- Appliances under warranty
- Recent professional work

**You''re uncertain:**
- If you need to ask "can I do this?"—consider calling a pro
- The cost of a botched DIY often exceeds professional cost
- Peace of mind has value

## Electrical

### Call a Pro For:
- Anything in the electrical panel
- Adding new circuits
- Outlet/switch replacement (unless very confident)
- Any hardwired fixture installation
- Troubleshooting electrical problems
- Any work that requires a permit

### Homeowner Tasks:
- Changing light bulbs
- Replacing lamp cords
- Testing GFCI outlets (push the TEST button)
- Resetting tripped breakers

## Plumbing

### Call a Pro For:
- Water heater installation or repair
- Main line clogs or sewer issues
- Gas line work
- Installing new fixtures (unless very confident)
- Frozen pipe repair
- Anything involving the main shut-off or water meter
- Persistent leaks

### Homeowner Tasks:
- Plunging toilet or slow drain
- Replacing toilet flapper
- Unclogging a simple drain
- Cleaning aerators
- Replacing showerhead (screw on type)
- Knowing where shut-offs are

## HVAC

### Call a Pro For:
- Annual maintenance
- Any repair work
- Thermostat wiring
- Refrigerant issues
- Strange sounds or smells
- Not heating/cooling properly
- Any warranty work

### Homeowner Tasks:
- Changing air filter (most important!)
- Keeping area around equipment clear
- Keeping outdoor unit clean and clear
- Programming thermostat

## Roofing

### Call a Pro For:
- Any roof repairs
- Missing or damaged shingles
- Leak repair
- Flashing issues
- Moss removal (if using chemicals or significant amount)
- Any work requiring ladder on roof

### Homeowner Tasks:
- Visual inspection from ground
- Gutter cleaning (from ground or short ladder)
- Keeping roof clear of debris (from ground with roof rake)
- Scheduling professional inspections

## Appliances

### Call a Pro For:
- Gas appliance issues (always)
- Electrical appliance repair (usually)
- Warranty work
- Installation involving gas, electricity, or plumbing connections

### Homeowner Tasks:
- Cleaning (filters, coils, etc.)
- Troubleshooting basics (check power, check connections)
- Replacing easily accessible filters
- Reading error codes (then often still call pro)

## Foundation & Structure

### ALWAYS Call a Pro For:
- Any foundation concerns
- Cracks that seem significant or are growing
- Doors/windows sticking (could indicate settling)
- Sloping floors
- Any structural modification

### Homeowner Tasks:
- Monitoring existing cracks (mark and date)
- Maintaining proper drainage away from foundation
- Noting changes for professional evaluation

## Making the Call

### Questions to Ask Yourself:

1. **Could I get hurt doing this?**
   - If yes → Call a pro

2. **Does this require specialized tools I don''t have?**
   - If yes → Probably call a pro

3. **Is this work that requires a permit?**
   - If yes → Call a pro

4. **What''s the worst case if I mess this up?**
   - Major damage, safety issue → Call a pro
   - Minor inconvenience → Maybe DIY

5. **Will this void a warranty?**
   - If yes → Call a pro

6. **Have I done this successfully before?**
   - If no → Research heavily or call a pro

## Cost Comparison Reality

**DIY isn''t always cheaper:**
- Time has value
- Mistakes are expensive
- Pros have tools and knowledge
- Some jobs have hidden complexity
- Professional work often has warranty

**When DIY makes sense:**
- Routine maintenance
- Cosmetic improvements
- Simple tasks you''re confident in
- Learning experiences with low stakes

---

📥 **Download the Checklist**: [DIY vs. Pro Decision Flowchart (PDF)]',
  'Smart Homeowner',
  'Beginner',
  10,
  false,
  true,
  'universal',
  41,
  '{"title": "DIY vs Pro Decision Guide", "sections": [{"name": "ALWAYS Call a Pro", "items": ["Electrical panel or new circuits", "Gas appliance issues", "Structural concerns", "Foundation problems", "Significant mold", "Roof repairs", "Main sewer line issues"]}, {"name": "Ask Yourself", "items": ["Could I get hurt?", "Does it need a permit?", "Do I have the right tools?", "What if I mess up?", "Will it void a warranty?"]}, {"name": "Homeowner Tasks - Electrical", "items": ["Change light bulbs", "Test GFCI outlets", "Reset tripped breakers"]}, {"name": "Homeowner Tasks - Plumbing", "items": ["Plunge toilets/drains", "Replace toilet flapper", "Clean aerators", "Know shut-off locations"]}, {"name": "Homeowner Tasks - HVAC", "items": ["Change air filter", "Keep equipment area clear", "Program thermostat"]}, {"name": "Homeowner Tasks - General", "items": ["Clean gutters (safely)", "Visual inspections", "Monitor and document issues", "Maintain proper drainage"]}]}'
),
(
  'Home Maintenance Budget Planning',
  'home-maintenance-budget',
  'How much should you set aside for home maintenance? A practical guide to budgeting for routine care and unexpected repairs.',
  '# Home Maintenance Budget Planning

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

One of the biggest mistakes homeowners make is not budgeting for maintenance. Homes require ongoing investment—and the surprise factor of unplanned repairs causes financial stress.

This guide helps you plan for both routine maintenance and the unexpected.

## What You''ll Learn

- How much to budget for maintenance
- Creating a home maintenance fund
- Prioritizing when budget is limited
- Planning for major replacements

## The 1% Rule (And Why It''s Just a Start)

### The Traditional Guideline

**Set aside 1-2% of your home''s value annually for maintenance.**

Example: $400,000 home = $4,000-$8,000/year

### Reality Check

**The 1% rule is a baseline, but consider:**
- Older homes need more
- Newer homes need less (initially)
- Climate affects maintenance costs
- Previous maintenance history matters
- Your comfort with DIY affects costs

### Adjusted Guidelines

| Home Age | Budget (% of value) |
|----------|---------------------|
| 0-5 years | 0.5-1% |
| 5-15 years | 1-1.5% |
| 15-25 years | 1.5-2% |
| 25+ years | 2-3% |

## Two Types of Savings

### Routine Maintenance Fund

**For predictable annual expenses:**
- HVAC service (2x year): $200-400
- Gutter cleaning: $150-300
- Filter replacements: $50-150
- Minor repairs: $200-500
- Pest control: $200-400
- Lawn/landscape maintenance: Varies

**Typical annual routine: $1,000-$3,000+**

### Emergency/Replacement Fund

**For unexpected repairs and planned replacements:**
- Emergency repairs (water heater fails, etc.)
- Major system replacements
- Storm damage (beyond insurance)
- Unexpected issues discovered

**Goal: $5,000-$15,000+ depending on home age and systems**

## Planning for Major Replacements

### Know Your Systems

**Estimate when major expenses will hit:**

| System | Typical Lifespan | Replacement Cost |
|--------|-----------------|------------------|
| Roof | 20-30 years | $8,000-$25,000 |
| HVAC | 15-20 years | $5,000-$12,000 |
| Water Heater | 10-15 years | $1,000-$3,000 |
| Appliances | 10-15 years | $500-$2,000 each |
| Windows | 20-30 years | $500-$1,000 per window |

### Calculate Monthly Savings

**Example: Roof replacement in 10 years, estimated $15,000**
- $15,000 ÷ 120 months = $125/month

**For each major system:**
1. Estimate replacement cost
2. Estimate years until needed
3. Divide to get monthly savings target

## When Budget Is Tight

### Prioritize

**Safety first:**
1. Anything affecting safety
2. Problems that will get worse (and more expensive)
3. Items affecting habitability
4. Cosmetic and comfort items

### Reduce Costs

**DIY where appropriate:**
- Filter changes
- Basic cleaning and maintenance
- Monitoring and documentation

**Shop for service:**
- Get multiple quotes
- Ask about seasonal discounts
- Consider service plans for HVAC

**Prevent problems:**
- The best way to save is avoiding big repairs
- Regular maintenance prevents costly emergencies

### If You Can''t Afford a Repair

**Options:**
- Payment plans (many contractors offer)
- Personal loan (for essential repairs)
- Home equity line (for major work)
- Prioritize and plan

**Don''t ignore:**
- Safety issues
- Problems that compound (water damage, etc.)
- Issues affecting habitability

## Creating Your Budget

### Step 1: List Known Annual Expenses

- HVAC maintenance: $____
- Gutter cleaning: $____
- Filters: $____
- Pest control: $____
- Lawn care: $____
- Other routine: $____

**Total Routine: $____/year**

### Step 2: Estimate Emergency/Replacement Needs

- Current emergency fund: $____
- Target emergency fund: $____
- Gap: $____
- Monthly savings to close gap: $____

### Step 3: Plan Major Replacements

| System | Years to Replace | Cost | Monthly Savings |
|--------|------------------|------|-----------------|
| | | | |
| | | | |
| | | | |

**Total monthly replacement savings: $____**

### Step 4: Total Monthly Budget

- Routine (÷12): $____
- Emergency fund building: $____
- Replacement fund: $____

**Total Monthly: $____**

## Tips for Success

**Automate savings:**
- Separate savings account for home maintenance
- Automatic monthly transfer
- Don''t touch except for home needs

**Track spending:**
- Keep records of all maintenance
- Note what you''re spending vs. budget
- Adjust annually

**Plan ahead:**
- Know your systems'' ages
- Anticipate replacements
- Get quotes before you''re desperate

---

📥 **Download the Checklist**: [Annual Maintenance Budget Template (PDF)]',
  'Smart Homeowner',
  'Beginner',
  12,
  false,
  true,
  'universal',
  42,
  '{"title": "Annual Home Maintenance Budget", "sections": [{"name": "Routine Annual Expenses", "items": ["HVAC maintenance: $____", "Gutter cleaning: $____", "Filter replacements: $____", "Pest control: $____", "Lawn care: $____", "Minor repairs: $____", "TOTAL ROUTINE: $____"]}, {"name": "Emergency Fund", "items": ["Current balance: $____", "Target (based on home age): $____", "Monthly savings to reach target: $____"]}, {"name": "Major Replacements", "items": ["Roof - Age:___ Replace in:___ Cost:___ Monthly:___", "HVAC - Age:___ Replace in:___ Cost:___ Monthly:___", "Water Heater - Age:___ Replace in:___ Cost:___ Monthly:___", "Other: ___"]}, {"name": "Monthly Budget Summary", "items": ["Routine ÷ 12: $____", "Emergency fund: $____", "Replacement fund: $____", "TOTAL MONTHLY: $____"]}]}'
),
(
  'Preparing Your Home for Sale',
  'preparing-home-for-sale',
  'What maintenance and repairs actually matter when selling your home? Focus on what buyers notice and what inspections reveal.',
  '# Preparing Your Home for Sale

⚠️ **DISCLAIMER**: This guide is for educational purposes only. The 360° Method provides awareness and maintenance guidance—not professional repair advice. Always consult a licensed contractor for repairs, safety concerns, or work requiring permits. When in doubt, call a pro.

## Introduction

When preparing to sell your home, it''s tempting to either do nothing or try to fix everything. Neither approach is optimal.

This guide helps you focus on what actually matters: what buyers notice, what inspections reveal, and what improvements provide real return.

## What You''ll Learn

- What buyers notice first
- Pre-inspection considerations
- Repairs that matter vs. don''t
- Documentation that helps your sale

## What Buyers Notice First

### Curb Appeal

**First impressions matter:**
- Clean driveway and walkways
- Maintained landscaping
- Fresh mulch and edging
- Exterior paint condition
- Working exterior lighting

**Low-cost improvements:**
- Power wash driveway and walkways
- Clean or paint front door
- Update house numbers
- Add potted plants
- Replace worn welcome mat

### Interior First Impressions

**Entry and main living areas:**
- Clean, fresh smell
- Bright lighting
- Clean floors
- Neutral, uncluttered spaces
- Working doors and handles

**Kitchens and bathrooms:**
- Clean and bright
- Working fixtures
- No visible damage
- Updated hardware (easy upgrade)
- Caulk in good condition

## The Pre-Listing Inspection Debate

### Pros of Pre-Listing Inspection

- Know what buyers'' inspector will find
- Fix issues before they become negotiation points
- Demonstrates transparency
- Avoids surprises during closing

### Cons

- Cost upfront ($300-500)
- Creates disclosure obligation for findings
- May reveal more than expected

### Recommendation

**Consider a pre-listing inspection if:**
- Home is older (15+ years)
- You haven''t maintained well
- You want to price accurately
- You want fewer negotiations

## What Inspectors Look For

### Common Inspection Findings

**Major concerns (buyers care most):**
- Roof condition and remaining life
- HVAC age and condition
- Water intrusion signs
- Electrical panel issues
- Foundation concerns
- Plumbing problems

**Common findings (less concerning):**
- Missing GFCI outlets
- Minor caulking issues
- Cosmetic defects
- Normal wear items

### Address Before Listing

**Fix these:**
- Active leaks
- Non-working systems
- Safety hazards
- Items that suggest deferred maintenance

**Consider fixing:**
- Things that will be flagged as safety issues
- Inexpensive items that look bad
- Things that affect appraisal

**Usually don''t fix:**
- Cosmetic preferences (let buyer choose)
- Expensive upgrades (rarely recoup cost)
- Items at end of life (price accordingly instead)

## Documentation That Helps

### Create a Home File

**Include:**
- List of recent improvements (dates, costs, contractors)
- Maintenance records (HVAC service, etc.)
- Warranties still in effect
- Manuals for major systems
- Permit records for improvements
- Receipts for major work

### Why It Matters

- Demonstrates care and maintenance
- Builds buyer confidence
- Supports your asking price
- Answers inspection questions
- Transfers knowledge to new owner

## Room-by-Room Prep

### Throughout House
- [ ] Touch up paint where needed
- [ ] Fix sticky doors and drawers
- [ ] Ensure all lights work
- [ ] Deep clean carpets
- [ ] Clean windows inside and out

### Kitchen
- [ ] Clean all appliances inside and out
- [ ] Fix any plumbing drips
- [ ] Replace worn caulk
- [ ] Update hardware if dated (easy upgrade)
- [ ] Declutter counters

### Bathrooms
- [ ] Recaulk tub/shower if needed
- [ ] Fix running toilets
- [ ] Ensure exhaust fans work
- [ ] Deep clean grout
- [ ] Update fixtures if dated

### Exterior
- [ ] Clean gutters
- [ ] Touch up exterior paint
- [ ] Repair visible damage
- [ ] Tidy landscaping
- [ ] Clean or paint front door

## What NOT to Do

### Don''t Over-Improve

**Rarely recoup cost:**
- Major kitchen remodel (unless truly outdated)
- Bathroom addition
- Pool installation
- High-end landscaping

**Better approach:**
- Clean, repair, and update affordably
- Let buyers add their own style
- Price home appropriately

### Don''t Hide Problems

**Disclosure is required:**
- Known material defects must be disclosed
- Hidden problems will likely be found
- Concealment can lead to legal issues

**Better approach:**
- Address what you can
- Disclose what you know
- Price appropriately for condition

## Working with Your Agent

**Your real estate agent can help:**
- Identify what buyers expect in your market
- Recommend cost-effective improvements
- Connect you with contractors
- Set pricing based on condition

**Ask your agent:**
- What improvements will get best return?
- What are buyers in this area expecting?
- What are comparable homes showing?
- What should we disclose?

---

📥 **Download the Checklist**: [Pre-Sale Preparation Checklist (PDF)]',
  'Smart Homeowner',
  'Beginner',
  12,
  false,
  true,
  'universal',
  43,
  '{"title": "Pre-Sale Preparation Checklist", "sections": [{"name": "Curb Appeal", "items": ["Power wash driveway/walkways", "Maintain landscaping", "Add fresh mulch", "Clean/paint front door", "Check exterior lighting"]}, {"name": "Interior Prep", "items": ["Touch up paint", "Fix sticky doors/drawers", "Ensure all lights work", "Deep clean carpets", "Clean all windows"]}, {"name": "Kitchen", "items": ["Clean appliances inside/out", "Fix plumbing drips", "Replace worn caulk", "Declutter counters"]}, {"name": "Bathrooms", "items": ["Recaulk tub/shower if needed", "Fix running toilets", "Test exhaust fans", "Deep clean grout"]}, {"name": "Documentation to Gather", "items": ["List of improvements with dates", "Maintenance records", "Active warranties", "Appliance manuals", "Permit records"]}, {"name": "Before Listing", "items": ["Consider pre-listing inspection", "Fix active leaks", "Address safety hazards", "Clean gutters"]}]}'
);