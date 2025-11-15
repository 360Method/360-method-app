import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { AlertTriangle, TrendingUp, Shield, ArrowRight, Sparkles } from "lucide-react";

const DEMO_SLIDES = [
  {
    id: 1,
    duration: 10000,
    icon: AlertTriangle,
    iconColor: "text-red-500",
    headline: "Stop Small Problems From Becoming Disasters",
    visual: (
      <div className="flex items-center justify-center gap-4 my-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="text-4xl mb-2">🍂</div>
          <div className="text-sm font-semibold">$50</div>
          <div className="text-xs text-gray-600">Clogged gutter</div>
        </motion.div>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5 }}
          className="h-1 w-8 bg-red-500"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="text-4xl mb-2">🏚️</div>
          <div className="text-sm font-semibold">$500</div>
          <div className="text-xs text-gray-600">Foundation damage</div>
        </motion.div>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.1 }}
          className="h-1 w-8 bg-red-500"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <div className="text-4xl mb-2">💧</div>
          <div className="text-sm font-semibold">$5,000</div>
          <div className="text-xs text-gray-600">Basement flood</div>
        </motion.div>
      </div>
    ),
    description: "Small maintenance issues cascade into expensive disasters. The 360° Method helps you catch problems early."
  },
  {
    id: 2,
    duration: 10000,
    icon: Shield,
    iconColor: "text-blue-600",
    headline: "The 360° Method: Your Property's Operating System",
    visual: (
      <div className="my-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { phase: "AWARE", steps: ["Baseline", "Inspect", "Track"], color: "blue" },
            { phase: "ACT", steps: ["Prioritize", "Schedule", "Execute"], color: "orange" },
            { phase: "ADVANCE", steps: ["Preserve", "Upgrade", "Scale"], color: "green" }
          ].map((phase, idx) => (
            <motion.div
              key={phase.phase}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.2 }}
              className={`p-4 rounded-lg border-2 border-${phase.color}-300 bg-${phase.color}-50`}
            >
              <div className={`font-bold text-${phase.color}-700 mb-2`}>{phase.phase}</div>
              {phase.steps.map((step, stepIdx) => (
                <div key={step} className="text-sm text-gray-700 mb-1">
                  {stepIdx + 1}. {step}
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </div>
    ),
    description: "A systematic 9-step framework to protect, maintain, and grow your property's value."
  },
  {
    id: 3,
    duration: 10000,
    icon: TrendingUp,
    iconColor: "text-green-600",
    headline: "Build Wealth Through Strategic Property Management",
    visual: (
      <div className="flex items-end justify-center gap-6 my-8 h-32">
        {[
          { year: "Year 1", amount: "$2.7K", label: "Catch up", height: "h-16" },
          { year: "Year 2", amount: "$5.4K", label: "Keep pace", height: "h-24" },
          { year: "Year 3", amount: "$8.1K", label: "Get ahead", height: "h-32" }
        ].map((bar, idx) => (
          <motion.div
            key={bar.year}
            initial={{ height: 0 }}
            animate={{ height: bar.height }}
            transition={{ delay: 0.5 + idx * 0.3, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className={`w-20 ${bar.height} bg-green-500 rounded-t-lg`} />
            <div className="mt-2 text-center">
              <div className="text-sm font-bold text-green-700">{bar.amount}</div>
              <div className="text-xs text-gray-600">{bar.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    ),
    description: "Potential savings: $27K-$72K over 10-15 years through prevented disasters and strategic upgrades."
  }
];

export default function WelcomeDemo() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  // Auto-advance slides
  React.useEffect(() => {
    const slide = DEMO_SLIDES[currentSlide];
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (slide.duration / 100));
        if (newProgress >= 100) {
          if (currentSlide < DEMO_SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
            return 0;
          } else {
            // Auto-navigate after last slide
            handleExplore();
            return 100;
          }
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleExplore = () => {
    navigate(createPageUrl("Dashboard") + "?demo=true");
  };

  const handleSkip = () => {
    navigate(createPageUrl("Dashboard") + "?demo=true");
  };

  const slide = DEMO_SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-3xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center ${slide.iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900">
              {slide.headline}
            </h1>

            {/* Visual */}
            <div className="mb-6">
              {slide.visual}
            </div>

            {/* Description */}
            <p className="text-center text-gray-600 mb-8">
              {slide.description}
            </p>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {DEMO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setProgress(0);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleExplore}
                className="gap-2 px-8"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Sparkles className="w-5 h-5" />
                Explore the App
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-600"
              >
                Skip (I get it)
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ⏱️ 30 seconds • Auto-advances
        </p>
      </div>
    </div>
  );
}