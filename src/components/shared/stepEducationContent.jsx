export const STEP_EDUCATION = {
  baseline: {
    stepNumber: 1,
    stepName: "Baseline",
    phase: "AWARE",
    phaseColor: "blue",
    whyItMatters: "Your baseline is the foundation. Without knowing what you have and how old it is, you can't protect it. Documenting your major systems now means catching problems when they're $50, not $5,000. This step unlocks the entire ACT phase once you document 4+ critical systems.",
    keyActions: [
      "Document each major system (HVAC, plumbing, electrical, roof, foundation, water/sewer)",
      "Record installation year, brand/model, and current condition",
      "Add photos and manuals for future reference",
      "Complete 4 systems to unlock ACT phase (Prioritize, Schedule, Execute)"
    ]
  },
  
  inspect: {
    stepNumber: 2,
    stepName: "Inspect",
    phase: "AWARE",
    phaseColor: "blue",
    whyItMatters: "Seasonal inspections catch small issues before they become disasters. A quarterly 30-minute walkthrough can identify a $50 problem before it cascades into $5,000+ of damage. This is your early warning system.",
    keyActions: [
      "Run seasonal diagnostics (Fall, Winter, Spring, Summer)",
      "Follow guided checklists for each season and climate zone",
      "Document issues with photos and notes",
      "Auto-generate maintenance tasks from findings"
    ]
  },
  
  track: {
    stepNumber: 3,
    stepName: "Track",
    phase: "AWARE",
    phaseColor: "blue",
    whyItMatters: "Your maintenance history is automatic proof of care. When you sell, buyers see a property with documented maintenance—worth $8K-$15K more. Track also reveals patterns: which systems need attention, where you're spending money, and your total savings from prevention.",
    keyActions: [
      "View all completed maintenance automatically logged from ACT phase",
      "Filter by property, system, or date range",
      "See cost savings from preventive maintenance",
      "Export records for insurance claims or sale documentation"
    ]
  },
  
  prioritize: {
    stepNumber: 4,
    stepName: "Prioritize",
    phase: "ACT",
    phaseColor: "orange",
    whyItMatters: "This is your central Ticket Queue where all maintenance work arrives. Every task—from inspections, baseline findings, AI recommendations, or manual entry—gets AI cost analysis and cascade risk scoring. You decide what matters most, choose DIY or pro service, and route work through the ACT workflow.",
    keyActions: [
      "Review AI cascade risk analysis (1-10 scale)",
      "See current fix cost vs. delayed fix cost",
      "Assign priority level (High/Medium/Low/Routine)",
      "Choose execution method (DIY, Contractor, 360° Operator)",
      "Send to Schedule or Add to Cart for professional quotes"
    ]
  },
  
  schedule: {
    stepNumber: 5,
    stepName: "Schedule",
    phase: "ACT",
    phaseColor: "orange",
    whyItMatters: "Strategic scheduling prevents costly rush fees and overlapping work. Plan maintenance when it makes sense: batch similar tasks, coordinate with seasons, and avoid emergency situations. A well-scheduled property saves 20-30% on labor costs compared to reactive repairs.",
    keyActions: [
      "Assign calendar dates to prioritized tasks",
      "Group tasks by system or area for efficiency",
      "Set reminders and deadlines",
      "View seasonal maintenance timeline",
      "Coordinate DIY and professional work"
    ]
  },
  
  execute: {
    stepNumber: 6,
    stepName: "Execute",
    phase: "ACT",
    phaseColor: "orange",
    whyItMatters: "Execution is where prevention happens. Follow AI-generated how-to guides for DIY tasks, track contractor work, and document completion. When you mark tasks complete here, they auto-archive to Track with all costs, dates, and photos preserved forever.",
    keyActions: [
      "Access AI step-by-step guides for DIY tasks",
      "View required tools, materials, and safety warnings",
      "Track actual time and cost vs. estimates",
      "Upload completion photos",
      "Auto-log to Track when marked complete"
    ]
  },
  
  preserve: {
    stepNumber: 7,
    stepName: "Preserve",
    phase: "ADVANCE",
    phaseColor: "green",
    whyItMatters: "Strategic preservation means extending system lifespans instead of replacing them. A $500 intervention can delay a $15,000 replacement by 3-5 years—that's a 30X ROI. Focus on the Big 7 systems that cause 87% of expensive failures.",
    keyActions: [
      "Review lifecycle forecasts for major systems",
      "Get AI recommendations for life-extension interventions",
      "Compare preservation cost vs. replacement cost",
      "Calculate ROI on proactive maintenance",
      "Plan strategic timing for system replacements"
    ]
  },
  
  upgrade: {
    stepNumber: 8,
    stepName: "Upgrade",
    phase: "ADVANCE",
    phaseColor: "green",
    whyItMatters: "Not all improvements are equal. Strategic upgrades deliver measurable ROI through increased property value, reduced operating costs, or higher rental income. This step helps you identify high-return projects and track them from planning to completion with photo timelines and budget tracking.",
    keyActions: [
      "Browse high-ROI upgrade ideas and templates",
      "Calculate projected ROI and payback timeline",
      "Track project milestones with photo documentation",
      "Monitor budget vs. actual costs",
      "Get AI guidance throughout execution"
    ]
  },
  
  scale: {
    stepNumber: 9,
    stepName: "SCALE",
    phase: "ADVANCE",
    phaseColor: "green",
    whyItMatters: "SCALE is your Portfolio CFO. Analyze equity position, compare properties, model 10-year wealth projections, and get AI strategic recommendations. Whether you're holding, selling, or acquiring, SCALE provides data-driven insights to optimize your real estate portfolio.",
    keyActions: [
      "Track equity position across all properties",
      "View 10-year wealth projections",
      "Get AI hold/sell/refinance recommendations",
      "Analyze portfolio performance vs. benchmarks",
      "Optimize capital allocation decisions"
    ]
  }
};