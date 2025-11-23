import { 
  LayoutDashboard,
  Home, 
  Search, 
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
        url: createPageUrl("PropertyScore")
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
        icon: Search,
        url: createPageUrl("Baseline")
      },
      { 
        id: "inspect",
        label: "Inspect", 
        subtitle: "Seasonal checkups",
        step: "2 of 9",
        icon: Search,
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
    return selectedProperty.baseline_completion < 42;
  }
  
  if (item.requiresActComplete) {
    return selectedProperty.baseline_completion < 42;
  }
  
  return false;
}