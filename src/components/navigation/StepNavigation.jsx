import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Eye, Zap, TrendingUp } from "lucide-react";
import { useDemo } from "@/components/shared/DemoContext";

const STEPS = [
  { number: 1, title: "Baseline", page: "Baseline", phase: "AWARE", phaseColor: "blue" },
  { number: 2, title: "Inspect", page: "Inspect", phase: "AWARE", phaseColor: "blue" },
  { number: 3, title: "Track", page: "Track", phase: "AWARE", phaseColor: "blue" },
  { number: 4, title: "Prioritize", page: "Prioritize", phase: "ACT", phaseColor: "orange" },
  { number: 5, title: "Schedule", page: "Schedule", phase: "ACT", phaseColor: "orange" },
  { number: 6, title: "Execute", page: "Execute", phase: "ACT", phaseColor: "orange" },
  { number: 7, title: "Preserve", page: "Preserve", phase: "ADVANCE", phaseColor: "green" },
  { number: 8, title: "Upgrade", page: "Upgrade", phase: "ADVANCE", phaseColor: "green" },
  { number: 9, title: "Scale", page: "Scale", phase: "ADVANCE", phaseColor: "green" }
];

const PHASE_ICONS = {
  AWARE: Eye,
  ACT: Zap,
  ADVANCE: TrendingUp
};

const PHASE_COLORS = {
  blue: { 
    bg: 'bg-blue-600', 
    bgLight: 'bg-blue-50',
    border: 'border-blue-400', 
    text: 'text-blue-600',
    hover: 'hover:bg-blue-100'
  },
  orange: { 
    bg: 'bg-orange-600', 
    bgLight: 'bg-orange-50',
    border: 'border-orange-400', 
    text: 'text-orange-600',
    hover: 'hover:bg-orange-100'
  },
  green: { 
    bg: 'bg-green-600', 
    bgLight: 'bg-green-50',
    border: 'border-green-400', 
    text: 'text-green-600',
    hover: 'hover:bg-green-100'
  }
};

// Map regular pages to demo pages when in demo mode
const DEMO_PAGE_MAP = {
  'Schedule': 'DemoSchedule',
  'Execute': 'DemoExecute',
};

export default function StepNavigation({ currentStep, propertyId = null }) {
  const { demoMode } = useDemo();
  const currentStepData = STEPS.find(s => s.number === currentStep);
  const prevStep = STEPS.find(s => s.number === currentStep - 1);
  const nextStep = STEPS.find(s => s.number === currentStep + 1);

  if (!currentStepData) return null;

  const phaseIcon = PHASE_ICONS[currentStepData.phase];
  const PhaseIcon = phaseIcon || Eye;
  const colors = PHASE_COLORS[currentStepData.phaseColor];

  const buildUrl = (page) => {
    // Use demo pages when in demo mode
    const targetPage = demoMode && DEMO_PAGE_MAP[page] ? DEMO_PAGE_MAP[page] : page;
    const baseUrl = createPageUrl(targetPage);
    return propertyId ? `${baseUrl}?property=${propertyId}` : baseUrl;
  };

  return (
    <div className={`flex items-center justify-between gap-2 ${colors.bgLight} rounded-lg border ${colors.border} p-2 md:p-3`}>
      {/* Previous Button */}
      {prevStep ? (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={`gap-1 ${colors.text} ${colors.hover} px-2 md:px-3`}
          style={{ minHeight: '40px' }}
        >
          <Link to={buildUrl(prevStep.page)}>
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline text-xs font-semibold">{prevStep.title}</span>
          </Link>
        </Button>
      ) : (
        <div className="w-10 md:w-16" />
      )}

      {/* Center - Current Step */}
      <div className="flex items-center gap-2">
        <Badge className={`${colors.bg} text-white text-xs px-2 py-0.5`}>
          {currentStep}/9
        </Badge>
        <PhaseIcon className={`w-4 h-4 ${colors.text} hidden sm:block`} />
        <span className={`text-xs font-bold ${colors.text} hidden md:inline`}>
          {currentStepData.title}
        </span>
      </div>

      {/* Next Button */}
      {nextStep ? (
        <Button
          asChild
          size="sm"
          className={`gap-1 ${colors.bg} hover:opacity-90 px-2 md:px-3`}
          style={{ minHeight: '40px' }}
        >
          <Link to={buildUrl(nextStep.page)}>
            <span className="hidden sm:inline text-xs font-semibold">{nextStep.title}</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </Link>
        </Button>
      ) : (
        <div className="w-10 md:w-16" />
      )}
    </div>
  );
}