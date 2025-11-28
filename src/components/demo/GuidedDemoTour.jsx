import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDemo } from '@/components/shared/DemoContext';
import DemoExitCTA from './DemoExitCTA';
import * as Collapsible from '@radix-ui/react-collapsible';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Play,
  CheckCircle,
  Home,
  ClipboardList,
  ScanSearch,
  BarChart3,
  ListChecks,
  Wrench,
  Shield,
  TrendingUp,
  Building2,
  Minus,
  Calendar,
  Hand,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Visual indicator components
const ScoreDisplay = ({ score, tier }) => {
  const getScoreColor = (s) => {
    if (s >= 85) return 'bg-green-500';
    if (s >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTierBadge = (t) => {
    if (t === 'gold') return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Gold' };
    if (t === 'silver') return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Silver' };
    if (t === 'bronze') return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bronze' };
    return null;
  };

  const tierStyle = tier ? getTierBadge(tier) : null;

  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`w-14 h-14 rounded-full ${getScoreColor(score)} flex items-center justify-center`}>
        <span className="text-white font-bold text-xl">{score}</span>
      </div>
      {tierStyle && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierStyle.bg} ${tierStyle.text}`}>
          {tierStyle.label}
        </span>
      )}
    </div>
  );
};

const SeverityBadges = ({ critical = 0, urgent = 0, high = 0, medium = 0 }) => (
  <div className="flex flex-wrap justify-center gap-2">
    {critical > 0 && (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        {critical} Critical
      </span>
    )}
    {urgent > 0 && (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
        {urgent} Urgent
      </span>
    )}
    {high > 0 && (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
        {high} High
      </span>
    )}
    {medium > 0 && (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        {medium} Medium
      </span>
    )}
  </div>
);

const SystemStatusDots = ({ good = 0, warning = 0, critical = 0 }) => (
  <div className="flex items-center justify-center gap-4">
    {critical > 0 && (
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs text-gray-600">{critical} critical</span>
      </div>
    )}
    {warning > 0 && (
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span className="text-xs text-gray-600">{warning} aging</span>
      </div>
    )}
    {good > 0 && (
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-xs text-gray-600">{good} good</span>
      </div>
    )}
  </div>
);

const CostComparison = ({ now, saves }) => (
  <div className="flex items-center justify-center gap-2">
    <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm">
      ${now.toLocaleString()} now
    </span>
    <TrendingUp className="w-4 h-4 text-green-500" />
    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
      Saves ${saves.toLocaleString()}
    </span>
  </div>
);

const EquityArrow = ({ from, to, years = 10 }) => (
  <div className="flex items-center justify-center gap-2">
    <span className="text-gray-600 font-medium">${(from/1000).toFixed(0)}K</span>
    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
      <TrendingUp className="w-4 h-4 text-green-600" />
      <span className="text-xs text-green-700">{years}yr</span>
    </div>
    <span className="text-green-600 font-bold">${(to/1000).toFixed(0)}K</span>
  </div>
);

const LifeExtension = ({ systems }) => (
  <div className="flex flex-wrap justify-center gap-2">
    {systems.map((sys, i) => (
      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
        {sys.name} +{sys.years}yr
      </span>
    ))}
  </div>
);

const PriorityPreview = ({ items }) => (
  <div className="flex flex-col gap-1">
    {items.slice(0, 3).map((item, i) => (
      <div key={i} className="flex items-center gap-2 text-xs">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold ${
          i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
        }`}>
          {i + 1}
        </span>
        <span className="text-gray-700 truncate">{item}</span>
      </div>
    ))}
  </div>
);

const PortfolioSummary = ({ properties, doors, value }) => (
  <div className="flex items-center justify-center gap-4 text-sm">
    <div className="text-center">
      <div className="font-bold text-gray-900">{properties}</div>
      <div className="text-xs text-gray-500">Properties</div>
    </div>
    <div className="w-px h-8 bg-gray-200"></div>
    <div className="text-center">
      <div className="font-bold text-gray-900">{doors}</div>
      <div className="text-xs text-gray-500">Doors</div>
    </div>
    <div className="w-px h-8 bg-gray-200"></div>
    <div className="text-center">
      <div className="font-bold text-green-600">${(value/1000000).toFixed(1)}M</div>
      <div className="text-xs text-gray-500">Value</div>
    </div>
  </div>
);

const PropertyScores = ({ scores }) => (
  <div className="flex items-center justify-center gap-2">
    {scores.map((s, i) => (
      <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
        s >= 85 ? 'bg-green-500' : s >= 70 ? 'bg-yellow-500' : 'bg-red-500'
      }`}>
        {s}
      </div>
    ))}
  </div>
);

const CheckmarkList = ({ items }) => (
  <div className="flex flex-wrap justify-center gap-2">
    {items.map((item, i) => (
      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
        <CheckCircle className="w-3 h-3" />
        {item}
      </span>
    ))}
  </div>
);

const ROIIndicator = ({ investment, returns, payback }) => (
  <div className="flex items-center justify-center gap-3">
    <div className="text-center">
      <div className="text-sm font-bold text-gray-700">${investment}</div>
      <div className="text-xs text-gray-500">Cost</div>
    </div>
    <TrendingUp className="w-5 h-5 text-green-500" />
    <div className="text-center">
      <div className="text-sm font-bold text-green-600">{payback}</div>
      <div className="text-xs text-gray-500">Payback</div>
    </div>
  </div>
);

// Render the appropriate visual for a step
const VisualIndicator = ({ visual }) => {
  if (!visual) return null;

  switch (visual.type) {
    case 'score':
      return <ScoreDisplay score={visual.score} tier={visual.tier} />;
    case 'severity':
      return <SeverityBadges {...visual.data} />;
    case 'systems':
      return <SystemStatusDots {...visual.data} />;
    case 'cost':
      return <CostComparison now={visual.now} saves={visual.saves} />;
    case 'equity':
      return <EquityArrow from={visual.from} to={visual.to} years={visual.years} />;
    case 'life':
      return <LifeExtension systems={visual.systems} />;
    case 'priority':
      return <PriorityPreview items={visual.items} />;
    case 'portfolio':
      return <PortfolioSummary {...visual.data} />;
    case 'scores':
      return <PropertyScores scores={visual.scores} />;
    case 'checklist':
      return <CheckmarkList items={visual.items} />;
    case 'roi':
      return <ROIIndicator {...visual.data} />;
    default:
      return null;
  }
};

const TOUR_STEPS = {
  struggling: [
    {
      id: 'welcome',
      title: 'Your Starting Point',
      pointer: "Tap any system card to see details",
      visual: { type: 'score', score: 62 },
      details: "You're at 62 - let's transform from reactive to proactive. This score means you're at risk for expensive surprises.",
      page: 'DemoStruggling',
      icon: Home
    },
    {
      id: 'score',
      title: '360 Property Score',
      pointer: "Your home's report card - scroll to see breakdown",
      visual: { type: 'score', score: 62 },
      details: "Score 62 = at risk. This certified report shows exactly what's dragging you down and how to fix it.",
      page: 'DemoOverwhelmedScore',
      icon: Award
    },
    {
      id: 'baseline',
      title: 'Baseline',
      pointer: "Tap a red system to see what's wrong",
      visual: { type: 'systems', data: { critical: 2, warning: 4, good: 0 } },
      details: "Your 6 systems are documented. 2 urgent (red), 4 flagged (yellow). That's why your score is low.",
      page: 'DemoOverwhelmedBaseline',
      icon: ClipboardList
    },
    {
      id: 'inspect',
      title: 'Inspect',
      pointer: "Scroll down to see each issue",
      visual: { type: 'severity', data: { critical: 2, urgent: 2, high: 3 } },
      details: "7 issues found: 2 critical, 2 urgent, 3 high priority. Critical ones need action TODAY.",
      page: 'DemoOverwhelmedInspect',
      icon: ScanSearch
    },
    {
      id: 'prioritize',
      title: 'Prioritize',
      pointer: "Tap #1 to see why it's urgent",
      visual: { type: 'priority', items: ['CO detectors - CRITICAL', 'Fix GFCI outlets', 'Roof shingle repair'] },
      details: "AI ranked your 8 tasks by urgency. CO detectors are #1 - life safety issue, do TODAY.",
      page: 'DemoOverwhelmedPrioritize',
      icon: ListChecks
    },
    {
      id: 'schedule',
      title: 'Schedule',
      pointer: "Tap a task to schedule it",
      visual: { type: 'checklist', items: ['This week', 'This month', 'This quarter'] },
      details: "Plan maintenance strategically. Spreading tasks out makes it manageable and affordable.",
      page: 'DemoOverwhelmedSchedule',
      icon: Calendar
    },
    {
      id: 'execute',
      title: 'Execute',
      pointer: "Tap 'Start' to begin this task",
      visual: { type: 'cost', now: 2650, saves: 22350 },
      details: "This is where you take action. $2,650 in fixes now prevents $22,350 in emergency repairs later.",
      page: 'DemoOverwhelmedExecute',
      icon: Wrench
    },
    {
      id: 'preserve',
      title: 'Preserve',
      pointer: "Tap a system to extend its life",
      visual: { type: 'life', systems: [{ name: 'HVAC', years: 3 }, { name: 'Water Heater', years: 2 }, { name: 'Roof', years: 3 }] },
      details: "$2,050 investment extends 3 failing systems. ROI: 8.1x. That's $16,700 saved.",
      page: 'DemoOverwhelmedPreserve',
      icon: Shield
    },
    {
      id: 'upgrade',
      title: 'Upgrade',
      pointer: "Tap to see the full ROI breakdown",
      visual: { type: 'roi', data: { investment: 100, returns: 'Life safety', payback: 'Immediate' } },
      details: "First upgrade: CO detectors. $100 investment for life safety - no brainer.",
      page: 'DemoOverwhelmedUpgrade',
      icon: TrendingUp
    },
    {
      id: 'scale',
      title: 'Scale',
      pointer: "Scroll to see your 10-year projection",
      visual: { type: 'equity', from: 142000, to: 350000, years: 10 },
      details: "Fix $2.6K now, build $350K in equity over 10 years. That's the power of proactive care.",
      page: 'DemoOverwhelmedScale',
      icon: Building2
    },
    {
      id: 'complete',
      title: 'Your Transformation',
      pointer: "Ready to start your journey?",
      visual: { type: 'score', score: 78, tier: 'bronze' },
      details: "In 6 months: 62 → 78. Spend $1K strategically, prevent $17K+ in disasters. You've got this.",
      page: 'DemoStruggling',
      icon: CheckCircle
    }
  ],
  improving: [
    {
      id: 'welcome',
      title: 'Your Starting Point',
      pointer: "You're doing well - let's level up",
      visual: { type: 'score', score: 78, tier: 'bronze' },
      details: "You're at 78 (Bronze). Let's reach Silver (85+) and join the top 15% of homeowners.",
      page: 'DemoImproving',
      icon: Home
    },
    {
      id: 'score',
      title: '360 Property Score',
      pointer: "Bronze certified! Scroll to see next level",
      visual: { type: 'score', score: 78, tier: 'bronze' },
      details: "78 = Bronze certified. You're ahead of 65% of homeowners. See your path to Silver (85+).",
      page: 'DemoImprovingScore',
      icon: Award
    },
    {
      id: 'baseline',
      title: 'Baseline',
      pointer: "Tap the yellow system to check it",
      visual: { type: 'systems', data: { critical: 1, warning: 3, good: 7 } },
      details: "11 systems documented. 7 healthy, 3 aging, 1 needs attention. You're organized.",
      page: 'DemoImprovingBaseline',
      icon: ClipboardList
    },
    {
      id: 'inspect',
      title: 'Inspect',
      pointer: "Scroll to see the 5 findings",
      visual: { type: 'severity', data: { high: 2, medium: 3 } },
      details: "Fall inspection found 5 issues: 2 flags, 3 to monitor. You're catching things early.",
      page: 'DemoImprovingInspect',
      icon: ScanSearch
    },
    {
      id: 'prioritize',
      title: 'Prioritize',
      pointer: "Tap to see why vapor barrier matters",
      visual: { type: 'priority', items: ['Crawlspace vapor barrier', 'HVAC service', 'Gutter cleaning', 'Dryer vent'] },
      details: "4 tasks total. Crawlspace vapor barrier is high priority - prevents moisture damage.",
      page: 'DemoImprovingPrioritize',
      icon: ListChecks
    },
    {
      id: 'schedule',
      title: 'Schedule',
      pointer: "Tap to add to your calendar",
      visual: { type: 'checklist', items: ['Scheduled', 'Planned', 'Routine'] },
      details: "Plan maintenance strategically throughout the year. No rush, just rhythm.",
      page: 'DemoImprovingSchedule',
      icon: Calendar
    },
    {
      id: 'execute',
      title: 'Execute',
      pointer: "Tap to see scheduled service",
      visual: { type: 'checklist', items: ['HVAC scheduled', 'No emergencies'] },
      details: "HVAC service scheduled. You're preventing, not firefighting. This is the way.",
      page: 'DemoImprovingExecute',
      icon: Wrench
    },
    {
      id: 'preserve',
      title: 'Preserve',
      pointer: "Tap a system to see maintenance tips",
      visual: { type: 'life', systems: [{ name: 'HVAC', years: 5 }, { name: 'Roof', years: 3 }, { name: 'Appliances', years: 4 }] },
      details: "$1,910 extends 3 systems by 3-6 years. Smart money management.",
      page: 'DemoImprovingPreserve',
      icon: Shield
    },
    {
      id: 'upgrade',
      title: 'Upgrade',
      pointer: "Tap to see the payback period",
      visual: { type: 'roi', data: { investment: 420, returns: 'Energy savings', payback: '1.5 years' } },
      details: "Smart thermostat + leak detectors: $420 investment, 1.5 year payback. Easy win.",
      page: 'DemoImprovingUpgrade',
      icon: TrendingUp
    },
    {
      id: 'scale',
      title: 'Scale',
      pointer: "Scroll to see your equity growth",
      visual: { type: 'equity', from: 260000, to: 480000, years: 10 },
      details: "10-year outlook: $260K → $480K equity. Just 7 points to Silver tier.",
      page: 'DemoImprovingScale',
      icon: Building2
    },
    {
      id: 'complete',
      title: 'Your Goal',
      pointer: "Ready to reach Silver?",
      visual: { type: 'score', score: 85, tier: 'silver' },
      details: "3 months: 78 → 85 (Silver). You'll be in the top 15% of homeowners.",
      page: 'DemoImproving',
      icon: CheckCircle
    }
  ],
  excellent: [
    {
      id: 'welcome',
      title: 'Elite Status',
      pointer: "See how you maintain excellence",
      visual: { type: 'score', score: 92, tier: 'gold' },
      details: "You're at 92 (Gold) - top 5% of homeowners. Now it's about maintaining excellence.",
      page: 'DemoExcellent',
      icon: Home
    },
    {
      id: 'score',
      title: '360 Property Score',
      pointer: "Gold certified! Top 5% of homeowners",
      visual: { type: 'score', score: 92, tier: 'gold' },
      details: "92 = Gold certified. Insurance advantages, faster sale, zero surprises. This is the goal.",
      page: 'DemoExcellentScore',
      icon: Award
    },
    {
      id: 'baseline',
      title: 'Baseline',
      pointer: "Tap any system to see full history",
      visual: { type: 'checklist', items: ['16 systems', 'Photos', 'Warranties', 'History'] },
      details: "16 systems documented with photos, warranties, and full service history. This is the gold standard.",
      page: 'DemoExcellentBaseline',
      icon: ClipboardList
    },
    {
      id: 'inspect',
      title: 'Inspect',
      pointer: "Tap to see inspection history",
      visual: { type: 'checklist', items: ['Q1 done', 'Q2 done', 'Q3 done', 'Q4 done'] },
      details: "4 quarterly inspections completed. Issues cleared immediately. Zero surprises.",
      page: 'DemoExcellentInspect',
      icon: ScanSearch
    },
    {
      id: 'track',
      title: 'Track',
      pointer: "Scroll to see full maintenance log",
      visual: { type: 'checklist', items: ['16 events this year'] },
      details: "16 maintenance events logged this year. Full visibility into your property's care.",
      page: 'DemoExcellentTrack',
      icon: BarChart3
    },
    {
      id: 'schedule',
      title: 'Schedule',
      pointer: "Tap to see your annual plan",
      visual: { type: 'checklist', items: ['All scheduled', 'Year planned'] },
      details: "All tasks scheduled strategically throughout the year. Predictable, manageable, stress-free.",
      page: 'DemoExcellentSchedule',
      icon: Calendar
    },
    {
      id: 'execute',
      title: 'Execute',
      pointer: "Tap to see routine task list",
      visual: { type: 'checklist', items: ['4 routine tasks', 'No emergencies'] },
      details: "Routine tasks only. No emergencies, just rhythm. This is what proactive looks like.",
      page: 'DemoExcellentExecute',
      icon: Wrench
    },
    {
      id: 'preserve',
      title: 'Preserve',
      pointer: "Tap to see your ROI",
      visual: { type: 'cost', now: 2825, saves: 28600 },
      details: "$2,825/year in preventive care has saved $28,600. That's 8.7x return.",
      page: 'DemoExcellentPreserve',
      icon: Shield
    },
    {
      id: 'upgrade',
      title: 'Upgrade',
      pointer: "Tap to see next upgrade",
      visual: { type: 'checklist', items: ['Surge done', 'Flo next'] },
      details: "Surge protection complete. Now adding Flo water monitoring for leak detection.",
      page: 'DemoExcellentUpgrade',
      icon: TrendingUp
    },
    {
      id: 'scale',
      title: 'Scale',
      pointer: "Scroll to see your wealth growth",
      visual: { type: 'equity', from: 250000, to: 520000, years: 10 },
      details: "$550K property, $250K equity today → $520K in 10 years.",
      page: 'DemoExcellentScale',
      icon: Building2
    },
    {
      id: 'complete',
      title: 'Stay Elite',
      pointer: "Keep protecting your $550K asset",
      visual: { type: 'score', score: 92, tier: 'gold' },
      details: "Elite ownership. Protecting $550K in value with minimal stress. This is the goal.",
      page: 'DemoExcellent',
      icon: CheckCircle
    }
  ],
  investor: [
    {
      id: 'welcome',
      title: 'Your Portfolio',
      pointer: "Tap a property card to dive in",
      visual: { type: 'portfolio', data: { properties: 3, doors: 7, value: 1200000 } },
      details: "3 properties, 7 doors, $1.2M in assets. Let's maximize your returns.",
      page: 'DemoPortfolio',
      icon: Home
    },
    {
      id: 'score',
      title: 'Portfolio Score',
      pointer: "See all 3 property scores at once",
      visual: { type: 'scores', scores: [97, 78, 62] },
      details: "Portfolio average: 79. One property needs work. This report helps you prioritize capital.",
      page: 'DemoInvestorScore',
      icon: Award
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      pointer: "Tap a score to see details",
      visual: { type: 'scores', scores: [97, 78, 62] },
      details: "All properties at a glance: Duplex (97), Single-family (78), Triplex (62). $3,170/mo cash flow.",
      page: 'DemoInvestorDashboard',
      icon: Building2
    },
    {
      id: 'properties',
      title: 'Properties',
      pointer: "Tap the red score to investigate",
      visual: { type: 'scores', scores: [97, 78, 62] },
      details: "Duplex is elite. Single-family is improving. Triplex needs work - that's your focus.",
      page: 'DemoInvestorProperties',
      icon: Home
    },
    {
      id: 'prioritize',
      title: 'Prioritize',
      pointer: "Tap to see Triplex issues first",
      visual: { type: 'severity', data: { critical: 2, urgent: 3, high: 4 } },
      details: "All tasks ranked across portfolio. Triplex has critical issues - address these first.",
      page: 'DemoInvestorPrioritize',
      icon: ListChecks
    },
    {
      id: 'schedule',
      title: 'Schedule',
      pointer: "Tap to plan across properties",
      visual: { type: 'checklist', items: ['Multi-property view', 'Batch scheduling'] },
      details: "Plan maintenance across your entire portfolio. Batch similar tasks for efficiency.",
      page: 'DemoInvestorSchedule',
      icon: Calendar
    },
    {
      id: 'execute',
      title: 'Execute',
      pointer: "Tap to assign contractors",
      visual: { type: 'checklist', items: ['Assign', 'Track', 'Verify'] },
      details: "Assign contractors, track progress across all properties from one screen.",
      page: 'DemoInvestorExecute',
      icon: Wrench
    },
    {
      id: 'scale',
      title: 'Scale',
      pointer: "Scroll to see 10-year projection",
      visual: { type: 'equity', from: 547000, to: 1800000, years: 10 },
      details: "$547K equity today, 17.8% ROI. 10-year projection: $1.8M. This is wealth building.",
      page: 'DemoInvestorScale',
      icon: TrendingUp
    },
    {
      id: 'complete',
      title: 'Your Goal',
      pointer: "Ready to optimize your portfolio?",
      visual: { type: 'scores', scores: [97, 85, 80] },
      details: "Get all properties to 80+. Cut repair costs 60%. Maximize your returns.",
      page: 'DemoPortfolio',
      icon: CheckCircle
    }
  ]
};

export default function GuidedDemoTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { demoMode, markStepVisited, visitedSteps } = useDemo();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [showExitCTA, setShowExitCTA] = useState(false);
  const [exitCTAReason, setExitCTAReason] = useState('exit');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const steps = TOUR_STEPS[demoMode] || [];
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (demoMode && !tourStarted) {
      const hasSeenTour = sessionStorage.getItem(`demoTour_${demoMode}`);
      if (!hasSeenTour) {
        setTourStarted(true);
      }
    }
  }, [demoMode, tourStarted]);

  useEffect(() => {
    if (!tourStarted || !steps.length) return;
    const currentPath = location.pathname.toLowerCase();

    // Try to find a matching step - use exact URL match first, then check if path ends with page name
    let matchingStepIndex = steps.findIndex(step => {
      const stepUrl = createPageUrl(step.page).toLowerCase();
      // Exact match
      if (currentPath === stepUrl) return true;
      // Path ends with the page name (handles /PageName format)
      if (currentPath.endsWith('/' + step.page.toLowerCase())) return true;
      return false;
    });

    // Special handling: if on Score360 page, find the score step for current demo mode
    if (matchingStepIndex === -1 && currentPath.includes('score360')) {
      matchingStepIndex = steps.findIndex(step => step.id === 'score');
    }

    if (matchingStepIndex !== -1 && matchingStepIndex !== currentStepIndex) {
      setCurrentStepIndex(matchingStepIndex);
      setDetailsOpen(false); // Close details when navigating
    }
  }, [location.pathname, tourStarted, steps]);

  const goToStep = (index) => {
    if (index < 0 || index >= steps.length) return;

    if (index === steps.length - 1) {
      setExitCTAReason('complete');
      setShowExitCTA(true);
      sessionStorage.setItem(`demoTour_${demoMode}`, 'seen');
      return;
    }

    setCurrentStepIndex(index);
    setDetailsOpen(false);
    markStepVisited?.(index);
    navigate(createPageUrl(steps[index].page));
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 2) {
      goToStep(currentStepIndex + 1);
    } else if (currentStepIndex === steps.length - 2) {
      setExitCTAReason('complete');
      setShowExitCTA(true);
      sessionStorage.setItem(`demoTour_${demoMode}`, 'seen');
    }
  };
  const prevStep = () => currentStepIndex > 0 && goToStep(currentStepIndex - 1);

  const closeTour = () => {
    setExitCTAReason('exit');
    setShowExitCTA(true);
  };

  const handleCloseCTA = () => {
    setShowExitCTA(false);
    if (exitCTAReason === 'complete') {
      setTourStarted(false);
      setCurrentStepIndex(0);
      sessionStorage.removeItem(`demoTour_${demoMode}`);
    }
  };

  const startTour = () => {
    setTourStarted(true);
    setCurrentStepIndex(0);
    setIsMinimized(false);
    setDetailsOpen(false);
    sessionStorage.removeItem(`demoTour_${demoMode}`);
    if (steps[0]) navigate(createPageUrl(steps[0].page));
  };

  if (!demoMode || !steps.length) return null;

  // Start button
  if (!tourStarted) {
    return (
      <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
        <button
          onClick={startTour}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Tour
        </button>
      </div>
    );
  }

  // Minimized
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>{currentStepIndex + 1}/{steps.length - 1}</span>
          <div className="flex gap-0.5">
            {steps.slice(0, -1).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i === currentStepIndex ? 'bg-orange-500' :
                  i < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </button>
      </div>
    );
  }

  const Icon = currentStep?.icon || Home;

  return (
    <>
      {/* Compact mobile navigation bar */}
      <div className="fixed bottom-20 left-2 right-2 z-50 md:bottom-6 md:left-auto md:right-6 md:w-72">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Single row: nav + title + nav */}
          <div className="flex items-center px-2 py-2 gap-1">
            {/* Back button */}
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Center content - tap to expand */}
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex-1 flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentStep?.title}</p>
                <p className="text-xs text-gray-500">{currentStepIndex + 1}/{steps.length - 1}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Next/Complete button */}
            {currentStepIndex === steps.length - 2 ? (
              <button
                onClick={nextStep}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={closeTour}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Expandable details panel */}
          <Collapsible.Root open={detailsOpen} onOpenChange={setDetailsOpen}>
            <Collapsible.Content>
              <div className="px-3 pb-3 border-t border-gray-100">
                {/* Action pointer */}
                <div className="flex items-center gap-2 py-2 text-sm text-gray-700">
                  <Hand className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{currentStep?.pointer}</span>
                </div>

                {/* Progress dots - tappable */}
                <div className="flex justify-center gap-1.5 py-2 flex-wrap">
                  {steps.slice(0, -1).map((step, i) => (
                    <button
                      key={i}
                      onClick={() => goToStep(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentStepIndex ? 'w-6 bg-orange-500' :
                        i < currentStepIndex ? 'w-2 bg-green-500' :
                        'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      title={step.title}
                    />
                  ))}
                </div>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </div>

      {/* Exit CTA Modal */}
      <DemoExitCTA
        isOpen={showExitCTA}
        onClose={handleCloseCTA}
        reason={exitCTAReason}
      />
    </>
  );
}
