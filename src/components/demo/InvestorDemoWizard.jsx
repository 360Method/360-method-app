import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, BarChart3, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function InvestorDemoWizard({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to Your Portfolio Command Center",
      description: "You're viewing a demo investor portfolio with 3 properties (7 rental units total).",
      icon: Building2,
      color: "blue",
      bullets: [
        "1247 Maple Street - Duplex (2 units)",
        "3842 Oak Ridge Drive - Single Family Rental",
        "891 Cedar Court - 4-Plex (4 units)"
      ]
    },
    {
      title: "Portfolio Health at a Glance",
      description: "The dashboard shows your entire portfolio's performance, health scores, and cash flow.",
      icon: BarChart3,
      color: "green",
      bullets: [
        "Total equity: $412K across 3 properties",
        "Monthly net cash flow: $2,710",
        "Average health score: 81/100",
        "Prevented disasters: $18,400 saved"
      ]
    },
    {
      title: "Multi-Property Task Management",
      description: "Track maintenance across all properties. Filter by building, unit, or see everything at once.",
      icon: CheckCircle2,
      color: "orange",
      bullets: [
        "6 active tasks across your portfolio",
        "Unit-level task tagging (e.g., 'Unit 3B')",
        "Building-wide vs per-unit task types",
        "Prioritize by cascade risk and ROI"
      ]
    },
    {
      title: "Strategic Portfolio Intelligence (SCALE)",
      description: "Get AI-powered recommendations for when to hold, sell, refinance, or acquire new properties.",
      icon: TrendingUp,
      color: "purple",
      bullets: [
        "10-year wealth projection: +$480K equity",
        "Property-by-property strategic analysis",
        "Capital allocation optimizer",
        "Acquisition opportunity alerts"
      ]
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const colorMap = {
    blue: { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
    green: { bg: 'bg-green-600', light: 'bg-green-50', border: 'border-green-200' },
    orange: { bg: 'bg-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200' }
  };
  const colors = colorMap[currentStep.color];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleGoToScale = () => {
    onComplete();
    navigate(createPageUrl('Scale'));
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" hideClose>
        <div className="py-4">
          
          {/* Icon */}
          <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {currentStep.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6">
            {currentStep.description}
          </p>

          {/* Bullets */}
          <div className={`${colors.light} border-2 ${colors.border} rounded-lg p-4 mb-6`}>
            <ul className="space-y-2">
              {currentStep.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${colors.bg.replace('bg-', 'text-')} flex-shrink-0 mt-0.5`} />
                  <span className="text-sm text-gray-800">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onSkip}
              className="flex-1"
              style={{ minHeight: '48px' }}
            >
              Skip Tour
            </Button>
            {step === steps.length - 1 ? (
              <>
                <Button
                  onClick={onComplete}
                  variant="outline"
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Explore Demo
                </Button>
                <Button
                  onClick={handleGoToScale}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  style={{ minHeight: '48px' }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Go to SCALE
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                style={{ minHeight: '48px' }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Step Counter */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}