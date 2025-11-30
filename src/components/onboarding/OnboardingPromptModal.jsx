import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import {
  Home,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

/**
 * OnboardingPromptModal - Popup wizard for users who haven't completed onboarding
 *
 * Shows when:
 * - User has no properties, OR
 * - User hasn't completed onboarding
 *
 * Can be dismissed but will show again on next session
 */

const DISMISSAL_KEY = '360_onboarding_prompt_dismissed';
const DISMISSAL_EXPIRY_HOURS = 24; // Show again after 24 hours

export default function OnboardingPromptModal({
  isOpen,
  onClose,
  hasProperties = false,
  onboardingCompleted = false
}) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if user recently dismissed the modal
  const checkDismissed = () => {
    try {
      const dismissed = localStorage.getItem(DISMISSAL_KEY);
      if (dismissed) {
        const dismissedTime = new Date(dismissed);
        const now = new Date();
        const hoursDiff = (now - dismissedTime) / (1000 * 60 * 60);
        return hoursDiff < DISMISSAL_EXPIRY_HOURS;
      }
    } catch (e) {
      console.error('Error checking dismissal:', e);
    }
    return false;
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSAL_KEY, new Date().toISOString());
    } catch (e) {
      console.error('Error saving dismissal:', e);
    }
    onClose();
  };

  const handleStartOnboarding = () => {
    navigate(createPageUrl("Onboarding"));
    onClose();
  };

  // Slides for the wizard
  const slides = [
    {
      icon: Home,
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
      title: hasProperties ? "Let's finish setting up!" : "Welcome to 360° Method!",
      description: hasProperties
        ? "You have properties but haven't completed onboarding. Let's unlock the full power of your home protection system."
        : "Add your first property and discover what's at risk before it becomes an emergency.",
      highlight: null
    },
    {
      icon: Shield,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      title: "Protect Your Investment",
      description: "Most homeowners are one hidden problem away from a $10,000 emergency. We help you catch the $50 fix first.",
      highlight: {
        icon: DollarSign,
        text: "Average savings: $4,200/year",
        color: 'text-green-600'
      }
    },
    {
      icon: Sparkles,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
      title: "It Only Takes 2 Minutes",
      description: "Answer 3 quick questions, add your address, and we'll show you exactly what needs attention first.",
      highlight: {
        icon: Clock,
        text: "Setup time: ~2 minutes",
        color: 'text-purple-600'
      }
    }
  ];

  if (!isOpen || checkDismissed()) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Content */}
          <div className="relative">
            {/* Gradient header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-6 pb-12">
              <div className="flex justify-center gap-2 mb-6">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? 'w-8 bg-orange-500'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 mx-auto rounded-full ${slides[currentSlide].iconBg} flex items-center justify-center mb-4`}>
                    {React.createElement(slides[currentSlide].icon, {
                      className: `w-8 h-8 ${slides[currentSlide].iconColor}`
                    })}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-slate-300 text-sm">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Highlight badge */}
            {slides[currentSlide].highlight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center -mt-5"
              >
                <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 border border-gray-100">
                  {React.createElement(slides[currentSlide].highlight.icon, {
                    className: `w-4 h-4 ${slides[currentSlide].highlight.color}`
                  })}
                  <span className={`text-sm font-medium ${slides[currentSlide].highlight.color}`}>
                    {slides[currentSlide].highlight.text}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="p-6 pt-8">
              {/* Benefits list */}
              <div className="space-y-2 mb-6">
                {[
                  "Discover hidden risks in your home",
                  "Get personalized maintenance priorities",
                  "Earn rewards as you protect your investment"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleStartOnboarding}
                className="w-full gap-2 text-lg font-semibold"
                style={{ backgroundColor: '#f97316', minHeight: '56px' }}
              >
                {hasProperties ? "Complete Setup" : "Get Started"}
                <ArrowRight className="w-5 h-5" />
              </Button>

              {/* Dismiss link */}
              <button
                onClick={handleDismiss}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 py-2 transition-colors"
              >
                I'll do this later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
