import {
  LayoutDashboard,
  Home,
  ClipboardList,
  ScanSearch,
  Activity,
  ListOrdered,
  Calendar,
  CheckCircle2,
  Shield,
  Lightbulb,
  Building2,
  BookOpen,
  Award
} from 'lucide-react';
import { createPageUrl } from '@/utils';

// Centralized demo page mapping for all demo modes
export const getDemoPageMap = (demoMode) => {
  if (demoMode === 'struggling') {
    return {
      'Dashboard': 'DemoStruggling',
      'Properties': 'DemoOverwhelmedBaseline',
      'Score360': 'DemoOverwhelmedScore',
      'Baseline': 'DemoOverwhelmedBaseline',
      'Inspect': 'DemoOverwhelmedInspect',
      'Track': 'DemoOverwhelmedTrack',
      'Prioritize': 'DemoOverwhelmedPrioritize',
      'Schedule': 'DemoOverwhelmedSchedule',
      'Execute': 'DemoOverwhelmedExecute',
      'Preserve': 'DemoOverwhelmedPreserve',
      'Upgrade': 'DemoOverwhelmedUpgrade',
      'Scale': 'DemoOverwhelmedScale',
    };
  } else if (demoMode === 'improving') {
    return {
      'Dashboard': 'DemoImproving',
      'Properties': 'DemoImprovingBaseline',
      'Score360': 'DemoImprovingScore',
      'Baseline': 'DemoImprovingBaseline',
      'Inspect': 'DemoImprovingInspect',
      'Track': 'DemoImprovingTrack',
      'Prioritize': 'DemoImprovingPrioritize',
      'Schedule': 'DemoImprovingSchedule',
      'Execute': 'DemoImprovingExecute',
      'Preserve': 'DemoImprovingPreserve',
      'Upgrade': 'DemoImprovingUpgrade',
      'Scale': 'DemoImprovingScale',
    };
  } else if (demoMode === 'excellent') {
    return {
      'Dashboard': 'DemoExcellent',
      'Properties': 'DemoExcellentBaseline',
      'Score360': 'DemoExcellentScore',
      'Baseline': 'DemoExcellentBaseline',
      'Inspect': 'DemoExcellentInspect',
      'Track': 'DemoExcellentTrack',
      'Prioritize': 'DemoExcellentPrioritize',
      'Schedule': 'DemoExcellentSchedule',
      'Execute': 'DemoExcellentExecute',
      'Preserve': 'DemoExcellentPreserve',
      'Upgrade': 'DemoExcellentUpgrade',
      'Scale': 'DemoExcellentScale',
    };
  } else if (demoMode === 'investor') {
    return {
      'Dashboard': 'DemoPortfolio',
      'Properties': 'DemoPortfolioProperties',
      'Score360': 'DemoPortfolioScore',
      'Baseline': 'DemoPortfolioBaseline',
      'Inspect': 'DemoPortfolioInspect',
      'Track': 'DemoPortfolioTrack',
      'Prioritize': 'DemoPortfolioPrioritize',
      'Schedule': 'DemoPortfolioSchedule',
      'Execute': 'DemoPortfolioExecute',
      'Preserve': 'DemoPortfolioPreserve',
      'Upgrade': 'DemoPortfolioUpgrade',
      'Scale': 'DemoPortfolioScale',
    };
  }
  // Fallback for legacy demo modes or homeowner
  return {
    'Schedule': 'DemoSchedule',
    'Execute': 'DemoExecute',
  };
};

// Helper to get the demo URL for a page
export const getDemoUrl = (page, demoMode) => {
  if (!demoMode) return createPageUrl(page);
  const demoPageMap = getDemoPageMap(demoMode);
  const targetPage = demoPageMap[page] || page;
  return createPageUrl(targetPage);
};

export const NAVIGATION_STRUCTURE = [
  {
    section: "Core",
    items: [
      { 
        id: "dashboard",
        label: "Dashboard", 
        subtitle: "Your command center", 
        icon: LayoutDashboard,
        url: createPageUrl("Dashboard")
      },
      { 
        id: "properties",
        label: "Properties", 
        subtitle: "Manage your assets", 
        icon: Home,
        url: createPageUrl("Properties")
      },
      { 
        id: "score",
        label: "360° Score", 
        subtitle: "View & share report", 
        icon: Award,
        url: createPageUrl("Score360")
      },
      { 
        id: "resources",
        label: "Resources", 
        subtitle: "Guides & tutorials", 
        icon: BookOpen,
        url: createPageUrl("Resources")
      }
    ]
  },
  {
    section: "Phase I: AWARE",
    sectionSubtitle: "Know Your Property",
    phase: 1,
    items: [
      {
        id: "baseline",
        label: "Baseline",
        subtitle: "Document your systems",
        step: "1 of 9",
        icon: ClipboardList,
        url: createPageUrl("Baseline")
      },
      {
        id: "inspect",
        label: "Inspect",
        subtitle: "Seasonal checkups",
        step: "2 of 9",
        icon: ScanSearch,
        url: createPageUrl("Inspect")
      },
      { 
        id: "track",
        label: "Track", 
        subtitle: "Maintenance history",
        step: "3 of 9",
        icon: Activity,
        url: createPageUrl("Track")
      }
    ]
  },
  {
    section: "Phase II: ACT",
    sectionSubtitle: "Fix Problems",
    phase: 2,
    items: [
      { 
        id: "prioritize",
        label: "Prioritize", 
        subtitle: "Fix what matters most",
        step: "4 of 9",
        icon: ListOrdered,
        url: createPageUrl("Prioritize"),
        requiresBaselineComplete: true,
        unlockHint: "Complete Baseline to unlock"
      },
      { 
        id: "schedule",
        label: "Schedule", 
        subtitle: "Plan your maintenance",
        step: "5 of 9",
        icon: Calendar,
        url: createPageUrl("Schedule"),
        requiresBaselineComplete: true,
        unlockHint: "Complete Baseline to unlock"
      },
      { 
        id: "execute",
        label: "Execute", 
        subtitle: "Complete your tasks",
        step: "6 of 9",
        icon: CheckCircle2,
        url: createPageUrl("Execute"),
        requiresBaselineComplete: true,
        unlockHint: "Complete Baseline to unlock"
      }
    ]
  },
  {
    section: "Phase III: ADVANCE",
    sectionSubtitle: "Build Value",
    phase: 3,
    items: [
      { 
        id: "preserve",
        label: "Preserve", 
        subtitle: "Extend system life",
        step: "7 of 9",
        icon: Shield,
        url: createPageUrl("Preserve"),
        requiresActComplete: true,
        unlockHint: "Complete ACT phase to unlock"
      },
      { 
        id: "upgrade",
        label: "Upgrade", 
        subtitle: "Strategic improvements",
        step: "8 of 9",
        icon: Lightbulb,
        url: createPageUrl("Upgrade"),
        requiresActComplete: true,
        unlockHint: "Complete ACT phase to unlock"
      },
      { 
        id: "scale",
        label: "Grow", 
        subtitle: "Portfolio growth",
        step: "9 of 9",
        icon: Building2,
        url: createPageUrl("Scale"),
        requiresActComplete: true,
        unlockHint: "Complete ACT phase to unlock"
      }
    ]
  }
];

export function isNavItemLocked(item, selectedProperty) {
  if (!selectedProperty) return false;
  
  if (item.requiresBaselineComplete) {
    return selectedProperty.baseline_completion < 66;
  }
  
  if (item.requiresActComplete) {
    return selectedProperty.baseline_completion < 66;
  }
  
  return false;
}