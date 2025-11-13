import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Eye, Zap, TrendingUp } from "lucide-react";

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
  blue: { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-600', border: 'border-orange-600', text: 'text-orange-600' },
  green: { bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-600' }
};

export default function StepNavigation({ currentStep, propertyId = null, compact = false }) {
  const currentStepData = STEPS.find(s => s.number === currentStep);
  const prevStep = STEPS.find(s => s.number === currentStep - 1);
  const nextStep = STEPS.find(s => s.number === currentStep + 1);

  if (!currentStepData) return null;

  const phaseIcon = PHASE_ICONS[currentStepData.phase];
  const PhaseIcon = phaseIcon || Eye;
  const colors = PHASE_COLORS[currentStepData.phaseColor];
  
  const buildUrl = (page) => {
    const baseUrl = createPageUrl(page);
    return propertyId ? `${baseUrl}?property=${propertyId}` : baseUrl;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 bg-white rounded-lg border-2 border-gray-300 p-3 shadow-sm">
        {prevStep ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2"
            style={{ minHeight: '44px' }}
          >
            <Link to={buildUrl(prevStep.page)}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevStep.title}</span>
            </Link>
          </Button>
        ) : (
          <div className="w-20" />
        )}

        <div className="flex items-center gap-2">
          <Badge className={`${colors.bg} text-white`}>
            Step {currentStep} of 9
          </Badge>
          <PhaseIcon className={`w-4 h-4 ${colors.text}`} />
        </div>

        {nextStep ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2"
            style={{ minHeight: '44px' }}
          >
            <Link to={buildUrl(nextStep.page)}>
              <span className="hidden sm:inline">{nextStep.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>
    );
  }

  return (
    <Card className={`border-2 ${colors.border} bg-gradient-to-r from-${currentStepData.phaseColor}-50 to-white shadow-md`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Previous Step */}
          {prevStep ? (
            <Button
              asChild
              variant="outline"
              className={`gap-2 ${colors.border} ${colors.text} hover:bg-${currentStepData.phaseColor}-50 flex-1 md:flex-initial`}
              style={{ minHeight: '48px' }}
            >
              <Link to={buildUrl(prevStep.page)}>
                <ArrowLeft className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-gray-600">Previous Step</div>
                  <div className="font-semibold">{prevStep.number}. {prevStep.title}</div>
                </div>
              </Link>
            </Button>
          ) : (
            <div className="hidden md:block flex-1" />
          )}

          {/* Current Step Indicator */}
          <div className="flex flex-col items-center gap-2">
            <Badge className={`${colors.bg} text-white px-4 py-1`}>
              Step {currentStep} of 9
            </Badge>
            <div className="flex items-center gap-2">
              <PhaseIcon className={`w-5 h-5 ${colors.text}`} />
              <span className={`font-bold ${colors.text}`}>
                Phase {currentStepData.phase === 'AWARE' ? 'I' : currentStepData.phase === 'ACT' ? 'II' : 'III'}: {currentStepData.phase}
              </span>
            </div>
          </div>

          {/* Next Step */}
          {nextStep ? (
            <Button
              asChild
              className={`gap-2 ${colors.bg} hover:opacity-90 flex-1 md:flex-initial`}
              style={{ minHeight: '48px' }}
            >
              <Link to={buildUrl(nextStep.page)}>
                <div className="text-left">
                  <div className="text-xs opacity-90">Next Step</div>
                  <div className="font-semibold">{nextStep.number}. {nextStep.title}</div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          ) : (
            <div className="hidden md:block flex-1" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className={`h-2 rounded-full ${colors.bg} transition-all duration-300`}
            style={{ width: `${(currentStep / 9) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}