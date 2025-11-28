import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/components/shared/DemoContext';
import {
  X,
  Sparkles,
  ArrowRight,
  Home,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRANSFORMATION_CONTENT = {
  struggling: {
    currentState: "Reactive & Anxious",
    currentScore: 62,
    currentColor: "text-red-600",
    currentBg: "bg-red-100",
    futureState: "Proactive & Confident",
    futureScore: "78+",
    futureColor: "text-green-600",
    futureBg: "bg-green-100",
    painPoints: [
      "Constant worry about what's breaking next",
      "Emergency repairs draining your savings",
      "No idea what shape your systems are in"
    ],
    transformation: [
      "Know exactly what needs attention",
      "Catch $50 problems before they become $5,000 disasters",
      "Sleep better knowing your home is protected"
    ],
    headline: "Stop Living in Fear of Your Next Repair Bill",
    subheadline: "In 6 months, go from reactive chaos to proactive confidence"
  },
  improving: {
    currentState: "Good Start",
    currentScore: 78,
    currentColor: "text-amber-600",
    currentBg: "bg-amber-100",
    futureState: "Top 15% of Owners",
    futureScore: "85+",
    futureColor: "text-green-600",
    futureBg: "bg-green-100",
    painPoints: [
      "Doing some maintenance but not sure what to prioritize",
      "Missing opportunities to extend system life",
      "Could be saving more with strategic timing"
    ],
    transformation: [
      "Clear priorities based on real data",
      "Strategic preservation that saves thousands",
      "Confidence that you're doing it right"
    ],
    headline: "You're Close to Excellence",
    subheadline: "A few strategic moves put you in the top 15% of homeowners"
  },
  excellent: {
    currentState: "Elite Owner",
    currentScore: 92,
    currentColor: "text-green-600",
    currentBg: "bg-green-100",
    futureState: "Wealth Builder",
    futureScore: "95+",
    futureColor: "text-emerald-600",
    futureBg: "bg-emerald-100",
    painPoints: [
      "Want to maintain your high standards effortlessly",
      "Looking to maximize property appreciation",
      "Ready to scale to more properties"
    ],
    transformation: [
      "Automated tracking keeps you at the top",
      "Your home appreciates faster than neighbors",
      "Ready to grow your real estate portfolio"
    ],
    headline: "Protect Your Excellence",
    subheadline: "Keep building wealth while others scramble with repairs"
  },
  investor: {
    currentState: "Portfolio Operator",
    currentScore: 79,
    currentColor: "text-blue-600",
    currentBg: "bg-blue-100",
    futureState: "Optimized Portfolio",
    futureScore: "85+",
    futureColor: "text-green-600",
    futureBg: "bg-green-100",
    painPoints: [
      "Hard to track multiple properties at once",
      "Reactive repairs eating into cash flow",
      "No clear view of portfolio health"
    ],
    transformation: [
      "One dashboard for your entire portfolio",
      "Cut reactive repairs by 60%",
      "Maximize ROI with strategic maintenance"
    ],
    headline: "Scale Smarter, Not Harder",
    subheadline: "Bring every property to 80+ and watch your returns grow"
  }
};

export default function DemoExitCTA({ isOpen, onClose, reason = 'exit' }) {
  const navigate = useNavigate();
  const { demoMode, exitDemoMode } = useDemo();
  const [isExiting, setIsExiting] = useState(false);

  if (!isOpen) return null;

  const content = TRANSFORMATION_CONTENT[demoMode] || TRANSFORMATION_CONTENT.struggling;
  const isTourComplete = reason === 'complete';

  const handleStartFree = () => {
    exitDemoMode();
    navigate('/Signup');
  };

  const handleContinueDemo = () => {
    onClose();
  };

  const handleExitDemo = () => {
    setIsExiting(true);
    // Clear demo mode and go to Welcome page
    sessionStorage.removeItem('demoMode');
    sessionStorage.removeItem('demoWizardSeen');
    sessionStorage.removeItem('demoVisitedSteps');
    sessionStorage.removeItem('demoIntro_struggling');
    sessionStorage.removeItem('demoIntro_improving');
    sessionStorage.removeItem('demoIntro_excellent');
    sessionStorage.removeItem('demoIntro_investor');
    sessionStorage.removeItem('demoIntro_homeowner');
    sessionStorage.removeItem('demoTour_struggling');
    sessionStorage.removeItem('demoTour_improving');
    sessionStorage.removeItem('demoTour_excellent');
    sessionStorage.removeItem('demoTour_investor');
    sessionStorage.removeItem('demoTour_homeowner');
    // Use direct location change instead of navigate + reload to avoid race condition
    window.location.href = '/Welcome';
  };

  const handleExploreOtherDemos = () => {
    // Clear current demo and go to DemoEntry to pick another
    sessionStorage.removeItem('demoMode');
    sessionStorage.removeItem('demoWizardSeen');
    sessionStorage.removeItem('demoVisitedSteps');
    sessionStorage.removeItem('demoIntro_struggling');
    sessionStorage.removeItem('demoIntro_improving');
    sessionStorage.removeItem('demoIntro_excellent');
    sessionStorage.removeItem('demoIntro_investor');
    sessionStorage.removeItem('demoIntro_homeowner');
    sessionStorage.removeItem('demoTour_struggling');
    sessionStorage.removeItem('demoTour_improving');
    sessionStorage.removeItem('demoTour_excellent');
    sessionStorage.removeItem('demoTour_investor');
    sessionStorage.removeItem('demoTour_homeowner');
    // Use direct location change instead of navigate + reload to avoid race condition
    window.location.href = '/DemoEntry';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleContinueDemo}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleContinueDemo}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center border-b border-gray-100">
          {isTourComplete ? (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {isTourComplete ? "You've Seen What's Possible" : content.headline}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {content.subheadline}
          </p>
        </div>

        {/* Transformation Visual */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Current State */}
            <div className="flex-1 text-center">
              <div className={`w-14 h-14 rounded-xl ${content.currentBg} flex items-center justify-center mx-auto mb-2`}>
                <span className={`text-lg font-bold ${content.currentColor}`}>{content.currentScore}</span>
              </div>
              <p className="text-xs font-medium text-gray-500">Today</p>
              <p className="text-sm font-semibold text-gray-700">{content.currentState}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium mt-1">Your Path</span>
            </div>

            {/* Future State */}
            <div className="flex-1 text-center">
              <div className={`w-14 h-14 rounded-xl ${content.futureBg} flex items-center justify-center mx-auto mb-2`}>
                <span className={`text-lg font-bold ${content.futureColor}`}>{content.futureScore}</span>
              </div>
              <p className="text-xs font-medium text-gray-500">Your Future</p>
              <p className="text-sm font-semibold text-gray-700">{content.futureState}</p>
            </div>
          </div>
        </div>

        {/* Pain Points vs Transformation */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Pain Points */}
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Without 360°
              </p>
              <ul className="space-y-1.5">
                {content.painPoints.map((point, i) => (
                  <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Transformation */}
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                With 360°
              </p>
              <ul className="space-y-1.5">
                {content.transformation.map((point, i) => (
                  <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-orange-900 mb-1">
              Start with YOUR property
            </p>
            <p className="text-xs text-orange-700">
              Get your real Health Score in 5 minutes. See exactly what needs attention and build your personalized action plan.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="p-6 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-2xl space-y-3">
          <Button
            onClick={handleStartFree}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2 shadow-lg"
            size="lg"
          >
            <Home className="w-4 h-4" />
            Try My Property Free
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleContinueDemo}
              variant="outline"
              className="flex-1 text-gray-600"
              size="sm"
            >
              Keep Exploring
            </Button>
            <Button
              onClick={handleExploreOtherDemos}
              variant="outline"
              className="flex-1 text-gray-600"
              size="sm"
            >
              Other Demos
            </Button>
          </div>

          <Button
            onClick={handleExitDemo}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700"
            size="sm"
          >
            Exit Demo
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Free forever for your first property. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}