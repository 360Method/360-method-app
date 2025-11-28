import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDemo } from '@/components/shared/DemoContext';
import DemoExitCTA from './DemoExitCTA';
import {
  ChevronLeft,
  ChevronRight,
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
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUR_STEPS = {
  struggling: [
    { id: 'welcome', title: 'Welcome', description: "You're at 62 - let's transform from reactive to proactive.", page: 'DemoStruggling', icon: Home },
    { id: 'baseline', title: 'Step 1: Baseline', description: "Document your 6 systems - most are flagged or urgent.", page: 'DemoOverwhelmedBaseline', icon: ClipboardList },
    { id: 'inspect', title: 'Step 2: Inspect', description: "7 issues found - 2 critical, 2 urgent, 3 high priority.", page: 'DemoOverwhelmedInspect', icon: ScanSearch },
    { id: 'prioritize', title: 'Step 4: Prioritize', description: "AI ranks by urgency. CO detectors first - do TODAY.", page: 'DemoOverwhelmedPrioritize', icon: ListChecks },
    { id: 'schedule', title: 'Step 5: Schedule', description: "Plan maintenance strategically to save time and money.", page: 'DemoOverwhelmedSchedule', icon: Calendar },
    { id: 'execute', title: 'Step 6: Execute', description: "$2,650 now prevents $22,350 in emergencies.", page: 'DemoOverwhelmedExecute', icon: Wrench },
    { id: 'preserve', title: 'Step 7: Preserve', description: "$2,050 extends dying systems 3+ years.", page: 'DemoOverwhelmedPreserve', icon: Shield },
    { id: 'upgrade', title: 'Step 8: Upgrade', description: "First upgrade: CO detectors. $100 for life safety.", page: 'DemoOverwhelmedUpgrade', icon: TrendingUp },
    { id: 'scale', title: 'Step 9: Scale', description: "Your 10-year outlook: Fix $2.6K now → Build $208K equity.", page: 'DemoOverwhelmedScale', icon: Building2 },
    { id: 'complete', title: 'Complete', description: "6 months: 62 → 78. Spend $1K, prevent $17K+ disasters.", page: 'DemoStruggling', icon: CheckCircle }
  ],
  improving: [
    { id: 'welcome', title: 'Welcome', description: "You're at 78 (Bronze). Let's reach Silver (85+).", page: 'DemoImproving', icon: Home },
    { id: 'baseline', title: 'Step 1: Baseline', description: "6 systems documented. Water heater needs attention.", page: 'DemoImprovingBaseline', icon: ClipboardList },
    { id: 'inspect', title: 'Step 2: Inspect', description: "Fall inspection found 2 issues. Catching problems early.", page: 'DemoImprovingInspect', icon: ScanSearch },
    { id: 'prioritize', title: 'Step 4: Prioritize', description: "4 tasks - crawlspace vapor barrier is high priority.", page: 'DemoImprovingPrioritize', icon: ListChecks },
    { id: 'schedule', title: 'Step 5: Schedule', description: "Plan maintenance strategically to save time and money.", page: 'DemoImprovingSchedule', icon: Calendar },
    { id: 'execute', title: 'Step 6: Execute', description: "HVAC service scheduled. Preventing, not firefighting.", page: 'DemoImprovingExecute', icon: Wrench },
    { id: 'preserve', title: 'Step 7: Preserve', description: "$1,910 extends 3 systems 3-6 years.", page: 'DemoImprovingPreserve', icon: Shield },
    { id: 'upgrade', title: 'Step 8: Upgrade', description: "Smart thermostat + leak detectors: $420, 1.5yr payback.", page: 'DemoImprovingUpgrade', icon: TrendingUp },
    { id: 'scale', title: 'Step 9: Scale', description: "10-year outlook: $260K → $480K equity. 7 points to Silver.", page: 'DemoImprovingScale', icon: Building2 },
    { id: 'complete', title: 'Complete', description: "3 months: 78 → 85 (Silver). Top 15% of owners.", page: 'DemoImproving', icon: CheckCircle }
  ],
  excellent: [
    { id: 'welcome', title: 'Welcome', description: "You're at 92 (Gold) - top 5%. Maintain excellence.", page: 'DemoExcellent', icon: Home },
    { id: 'baseline', title: 'Step 1: Baseline', description: "16 systems with photos, warranties, history.", page: 'DemoExcellentBaseline', icon: ClipboardList },
    { id: 'inspect', title: 'Step 2: Inspect', description: "4 quarterly inspections. Issues cleared immediately.", page: 'DemoExcellentInspect', icon: ScanSearch },
    { id: 'track', title: 'Step 3: Track', description: "16 maintenance events logged this year.", page: 'DemoExcellentTrack', icon: BarChart3 },
    { id: 'schedule', title: 'Step 5: Schedule', description: "All tasks scheduled strategically throughout the year.", page: 'DemoExcellentSchedule', icon: Calendar },
    { id: 'execute', title: 'Step 6: Execute', description: "Routine tasks only. No emergencies, just rhythm.", page: 'DemoExcellentExecute', icon: Wrench },
    { id: 'preserve', title: 'Step 7: Preserve', description: "$2,825/year avoids $24,700 replacements.", page: 'DemoExcellentPreserve', icon: Shield },
    { id: 'upgrade', title: 'Step 8: Upgrade', description: "Surge protection done. Adding Flo monitoring.", page: 'DemoExcellentUpgrade', icon: TrendingUp },
    { id: 'scale', title: 'Step 9: Scale', description: "$550K property, $250K equity. Growing wealth.", page: 'DemoExcellentScale', icon: Building2 },
    { id: 'complete', title: 'Complete', description: "Elite ownership. Protecting $550K in value.", page: 'DemoExcellent', icon: CheckCircle }
  ],
  investor: [
    { id: 'welcome', title: 'Welcome', description: "3 properties, 7 doors, $1.2M in assets.", page: 'DemoPortfolio', icon: Home },
    { id: 'dashboard', title: 'Dashboard', description: "All properties: scores 97, 78, 62. $3,170/mo flow.", page: 'DemoInvestorDashboard', icon: Building2 },
    { id: 'properties', title: 'Properties', description: "Duplex (97), Single-family (78), Triplex (62).", page: 'DemoInvestorProperties', icon: Home },
    { id: 'prioritize', title: 'Prioritize', description: "All tasks ranked. Triplex has critical issues.", page: 'DemoInvestorPrioritize', icon: ListChecks },
    { id: 'schedule', title: 'Schedule', description: "Plan maintenance across your entire portfolio.", page: 'DemoInvestorSchedule', icon: Calendar },
    { id: 'execute', title: 'Execute', description: "Assign contractors, track progress across portfolio.", page: 'DemoInvestorExecute', icon: Wrench },
    { id: 'scale', title: 'Scale', description: "$547K equity, 17.8% ROI. 10-year: $1.8M.", page: 'DemoInvestorScale', icon: TrendingUp },
    { id: 'complete', title: 'Complete', description: "All properties to 80+. Cut repairs 60%.", page: 'DemoPortfolio', icon: CheckCircle }
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
    const currentPath = location.pathname;
    const matchingStepIndex = steps.findIndex(step =>
      currentPath.includes(step.page) || currentPath === createPageUrl(step.page)
    );
    if (matchingStepIndex !== -1 && matchingStepIndex !== currentStepIndex) {
      setCurrentStepIndex(matchingStepIndex);
    }
  }, [location.pathname, tourStarted, steps]);

  const goToStep = (index) => {
    if (index < 0 || index >= steps.length) return;

    // If going to the last step (complete), show CTA instead of navigating
    if (index === steps.length - 1) {
      setExitCTAReason('complete');
      setShowExitCTA(true);
      sessionStorage.setItem(`demoTour_${demoMode}`, 'seen');
      return;
    }

    setCurrentStepIndex(index);
    markStepVisited?.(index);
    navigate(createPageUrl(steps[index].page));
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 2) {
      // Normal next step
      goToStep(currentStepIndex + 1);
    } else if (currentStepIndex === steps.length - 2) {
      // On second-to-last step, clicking Next shows the CTA
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

  const handleTourComplete = () => {
    sessionStorage.setItem(`demoTour_${demoMode}`, 'seen');
    setExitCTAReason('complete');
    setShowExitCTA(true);
  };

  const handleCloseCTA = () => {
    setShowExitCTA(false);
    // If they completed the tour or exited, reset so they can start again
    if (exitCTAReason === 'complete') {
      setTourStarted(false);
      setCurrentStepIndex(0);
      // Remove the 'seen' flag so Start Tour button appears and works
      sessionStorage.removeItem(`demoTour_${demoMode}`);
    }
  };

  const startTour = () => {
    setTourStarted(true);
    setCurrentStepIndex(0);
    setIsMinimized(false);
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
    <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-80">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Progress */}
        <div className="h-1 bg-gray-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500">
            Step {currentStepIndex + 1} of {steps.length - 1}
          </span>
          <div className="flex items-center">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={closeTour}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">
                {currentStep?.title}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                {currentStep?.description}
              </p>
            </div>
          </div>

          {/* Dots - exclude the last "complete" step since it triggers CTA */}
          <div className="flex justify-center gap-0.5 mb-4 flex-wrap px-2">
            {steps.slice(0, -1).map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`h-1 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-2.5 bg-orange-500' :
                  i < currentStepIndex ? 'w-1 bg-green-500' :
                  'w-1 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {currentStepIndex === steps.length - 2 ? (
              <Button
                size="sm"
                onClick={nextStep}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Complete Tour
                <CheckCircle className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={nextStep}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Exit CTA Modal */}
      <DemoExitCTA
        isOpen={showExitCTA}
        onClose={handleCloseCTA}
        reason={exitCTAReason}
      />
    </div>
  );
}
