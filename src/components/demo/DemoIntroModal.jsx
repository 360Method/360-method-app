import React, { useState, useEffect } from 'react';
import { useDemo } from '@/components/shared/DemoContext';
import { X, Play, Eye, Wrench, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_INTROS = {
  struggling: {
    title: "Meet the Overwhelmed Owner",
    score: 62,
    scoreColor: "text-red-600",
    scoreBg: "bg-red-100",
    subtitle: "Health Score: Critical",
    story: "This homeowner bought their house 8 years ago and has been in 'reactive mode' ever since. Every few months, something breaks - and it's always expensive. They worry constantly about what's failing next.",
    situation: [
      "No documentation of home systems",
      "Unknown ages on HVAC, water heater, roof",
      "Emergency repairs eating into savings",
      "Constant anxiety about hidden problems"
    ],
    transformation: "In 6 months, this owner can go from 62 → 78 by catching the $50 fixes before they become $5,000 disasters.",
    youllSee: "Systems with critical issues, urgent safety tasks, and the path to stability."
  },
  improving: {
    title: "Meet the Organized Owner",
    score: 78,
    scoreColor: "text-amber-600",
    scoreBg: "bg-amber-100",
    subtitle: "Health Score: Bronze",
    story: "This homeowner is doing better than most. They've started documenting systems and doing some maintenance. But they know they could do better - they want to move from reactive to truly proactive.",
    situation: [
      "Basic system documentation started",
      "Some regular maintenance happening",
      "A few issues that need attention",
      "Room to improve and save more"
    ],
    transformation: "In 3 months, this owner can reach Silver (85+) with strategic interventions and smart upgrades.",
    youllSee: "A property on the right track with clear next steps to level up."
  },
  excellent: {
    title: "Meet the Elite Owner",
    score: 92,
    scoreColor: "text-green-600",
    scoreBg: "bg-green-100",
    subtitle: "Health Score: Gold",
    story: "This is what excellence looks like. Every system documented, quarterly inspections completed, maintenance logged, and strategic preservation extending system life by years. No surprises, no emergencies.",
    situation: [
      "Complete documentation with photos",
      "Quarterly inspections - 4 completed",
      "16 maintenance events this year",
      "$24,700 in disasters prevented"
    ],
    transformation: "This owner isn't just maintaining - they're building wealth. Their $550K property is appreciating faster than neighbors.",
    youllSee: "The gold standard of property care and wealth protection."
  },
  investor: {
    title: "Meet the Portfolio Operator",
    score: 79,
    scoreColor: "text-blue-600",
    scoreBg: "bg-blue-100",
    subtitle: "3 Properties • 7 Doors • $1.2M Assets",
    story: "This investor manages a small portfolio: a duplex (97 score), a single-family (78), and a triplex (62). They need to see everything at once and prioritize across properties.",
    situation: [
      "Platinum performer: Duplex at 97",
      "Bronze performer: Single-family at 78",
      "Struggling: Triplex at 62 with issues",
      "$3,170/mo net cash flow"
    ],
    transformation: "By bringing all properties to 80+, this investor can cut reactive repairs 60% and maximize returns.",
    youllSee: "Portfolio-wide visibility, cross-property priorities, and wealth metrics."
  }
};

export default function DemoIntroModal() {
  const { demoMode } = useDemo();
  const [isOpen, setIsOpen] = useState(false);

  const intro = DEMO_INTROS[demoMode];

  useEffect(() => {
    if (demoMode && intro) {
      const hasSeenIntro = sessionStorage.getItem(`demoIntro_${demoMode}`);
      if (!hasSeenIntro) {
        setIsOpen(true);
      }
    }
  }, [demoMode, intro]);

  const handleClose = () => {
    sessionStorage.setItem(`demoIntro_${demoMode}`, 'seen');
    setIsOpen(false);
  };

  if (!isOpen || !intro) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with score */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-xl ${intro.scoreBg} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-2xl font-bold ${intro.scoreColor}`}>{intro.score}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{intro.title}</h2>
              <p className={`text-sm font-medium ${intro.scoreColor}`}>{intro.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="p-6 pb-4">
          <p className="text-gray-600 leading-relaxed">{intro.story}</p>
        </div>

        {/* Current situation */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Situation:</h3>
          <ul className="space-y-1.5">
            {intro.situation.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Transformation */}
        <div className="px-6 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>The Transformation:</strong> {intro.transformation}
            </p>
          </div>
        </div>

        {/* What you'll see */}
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-500">
            <strong>In this demo:</strong> {intro.youllSee}
          </p>
        </div>

        {/* The Method */}
        <div className="px-6 pb-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">The 360° Method:</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">AWARE</p>
                <p className="text-xs text-gray-500">Know your home</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                  <Wrench className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">ACT</p>
                <p className="text-xs text-gray-500">Fix problems</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-1">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">ADVANCE</p>
                <p className="text-xs text-gray-500">Build wealth</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <Button
            onClick={handleClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
            size="lg"
          >
            <Play className="w-4 h-4" />
            Start Exploring
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Use the guided tour to walk through each step
          </p>
        </div>
      </div>
    </div>
  );
}
