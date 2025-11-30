import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Thermometer,
  CloudRain,
  DollarSign,
  HelpCircle,
  Shield,
  PiggyBank,
  Home,
  TrendingUp,
  Key,
  AlertTriangle,
  Users,
  Eye,
  Sparkles,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

/**
 * OnboardingIntentSurvey - Step 0 of onboarding
 *
 * 3 fast tap questions to understand WHY the user signed up:
 * 1. Fear: What keeps you up at night?
 * 2. Goal: What's your main goal?
 * 3. Trigger: What brought you here?
 *
 * This data personalizes the entire onboarding experience.
 */

// ============================================
// INTENT OPTIONS
// ============================================
const INTENT_OPTIONS = {
  fears: [
    {
      id: 'hvac_failure',
      icon: Thermometer,
      label: 'HVAC failure',
      description: 'Heating or cooling breakdown',
      riskFocus: 'HVAC System',
      color: 'text-red-500'
    },
    {
      id: 'roof_leak',
      icon: CloudRain,
      label: 'Roof leak',
      description: 'Water damage from above',
      riskFocus: 'Roof System',
      color: 'text-blue-500'
    },
    {
      id: 'surprise_bill',
      icon: DollarSign,
      label: 'Surprise bill',
      description: 'Unexpected major expense',
      riskFocus: 'all',
      color: 'text-green-500'
    },
    {
      id: 'dont_know',
      icon: HelpCircle,
      label: "Don't know what's wrong",
      description: 'Hidden problems I might miss',
      riskFocus: 'all',
      color: 'text-purple-500'
    }
  ],
  goals: [
    {
      id: 'protect_value',
      icon: Shield,
      label: 'Protect my home value',
      description: 'Keep my investment safe',
      persona: 'protector',
      color: 'text-blue-500'
    },
    {
      id: 'save_money',
      icon: PiggyBank,
      label: 'Save money on repairs',
      description: 'Avoid expensive emergencies',
      persona: 'saver',
      color: 'text-green-500'
    },
    {
      id: 'prepare_sell',
      icon: Home,
      label: 'Prepare to sell',
      description: 'Maximize sale price',
      persona: 'seller',
      color: 'text-orange-500'
    },
    {
      id: 'build_wealth',
      icon: TrendingUp,
      label: 'Build wealth (investor)',
      description: 'Manage multiple properties',
      persona: 'investor',
      color: 'text-purple-500'
    }
  ],
  triggers: [
    {
      id: 'just_bought',
      icon: Key,
      label: 'Just bought my home',
      description: 'New homeowner',
      urgency: 'high',
      color: 'text-yellow-500'
    },
    {
      id: 'had_emergency',
      icon: AlertTriangle,
      label: 'Had a repair emergency',
      description: "Don't want that again",
      urgency: 'critical',
      color: 'text-red-500'
    },
    {
      id: 'friend_recommended',
      icon: Users,
      label: 'Friend recommended',
      description: 'Word of mouth',
      urgency: 'medium',
      color: 'text-blue-500'
    },
    {
      id: 'saw_ad',
      icon: Eye,
      label: 'Saw an ad / article',
      description: 'Marketing brought me here',
      urgency: 'low',
      color: 'text-slate-500'
    }
  ]
};

// Question configuration
const QUESTIONS = [
  {
    key: 'fear',
    title: "What keeps you up at night?",
    subtitle: "About your home",
    options: INTENT_OPTIONS.fears
  },
  {
    key: 'goal',
    title: "What's your main goal?",
    subtitle: "With the 360° Method",
    options: INTENT_OPTIONS.goals
  },
  {
    key: 'trigger',
    title: "What brought you here today?",
    subtitle: "Tell us what's happening",
    options: INTENT_OPTIONS.triggers
  }
];

export default function OnboardingIntentSurvey({ onNext, user }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({ fear: null, goal: null, trigger: null });
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (optionId) => {
    if (isAnimating) return;

    const question = QUESTIONS[currentQuestion];
    const newAnswers = { ...answers, [question.key]: optionId };
    setAnswers(newAnswers);

    setIsAnimating(true);

    // Brief delay for visual feedback before advancing
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // All questions answered - proceed to next step
        onNext({ intent: newAnswers });
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = () => {
    // Skip with default values
    onNext({
      intent: {
        fear: 'dont_know',
        goal: 'protect_value',
        trigger: 'saw_ad'
      }
    });
  };

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in-50 duration-500">
      <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <CardContent className="p-6 md:p-10">
          {/* Header */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-6"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentQ.title}</h1>
            <p className="text-slate-400">{currentQ.subtitle}</p>
          </motion.div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {QUESTIONS.map((_, idx) => (
              <motion.div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentQuestion
                    ? 'w-8 bg-orange-500'
                    : idx < currentQuestion
                    ? 'w-2.5 bg-green-500'
                    : 'w-2.5 bg-slate-600'
                }`}
                layoutId={`dot-${idx}`}
              />
            ))}
          </div>

          {/* Options grid - 2x2 on mobile */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-3 md:gap-4"
            >
              {currentQ.options.map((option, idx) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={answers[currentQ.key] === option.id}
                  onSelect={() => handleSelect(option.id)}
                  delay={idx * 0.05}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Back button (after first question) */}
          {currentQuestion > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleBack}
              className="flex items-center gap-1 text-slate-400 hover:text-white mt-6 mx-auto transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </motion.button>
          )}
        </CardContent>
      </Card>

      {/* Skip option */}
      <button
        onClick={handleSkip}
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 text-center transition-colors"
      >
        Skip personalization
      </button>

      {/* Privacy note */}
      <p className="text-xs text-slate-400 text-center mt-4 px-4">
        Your answers help us personalize your experience. We never share this data.
      </p>
    </div>
  );
}

/**
 * Individual option card component
 */
function OptionCard({ option, selected, onSelect, delay = 0 }) {
  const IconComponent = option.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-4 md:p-5 rounded-xl border-2 transition-all text-left min-h-[110px] md:min-h-[120px] ${
        selected
          ? 'border-orange-500 bg-orange-500/20'
          : 'border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
        selected ? 'bg-orange-500/30' : 'bg-slate-700'
      }`}>
        <IconComponent className={`w-5 h-5 ${selected ? 'text-orange-400' : option.color}`} />
      </div>
      <p className={`font-semibold text-sm md:text-base ${selected ? 'text-orange-300' : 'text-white'}`}>
        {option.label}
      </p>
      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
        {option.description}
      </p>
    </motion.button>
  );
}

// Export the intent options for use in other components
export { INTENT_OPTIONS, QUESTIONS };
