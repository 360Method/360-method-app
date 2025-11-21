import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, ArrowLeft, Hand, ChevronRight, X, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDemo } from '../shared/DemoContext';
import { createPageUrl } from '@/utils';

export default function InteractiveDemoTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { demoMode } = useDemo();
  const [currentStep, setCurrentStep] = useState(0);
  const [tourActive, setTourActive] = useState(false);

  // Tour steps with explicit actions
  const TOUR_STEPS = [
    // Step 0: Welcome
    {
      id: 'welcome',
      page: createPageUrl('Dashboard'),
      title: '👋 Welcome to Your Demo!',
      message: "Let's take a quick tour. We'll show you exactly where to tap.",
      action: 'tap-continue',
      position: 'center',
      targetElement: null,
      mobileInstructions: 'Tap the button below to start'
    },

    // Step 1: Health Score
    {
      id: 'health-score',
      page: createPageUrl('Dashboard'),
      title: '💚 Property Health Score',
      message: 'This shows your home\'s overall condition. See how preventive care keeps it strong.',
      action: 'tap-element',
      position: 'bottom',
      targetElement: '[data-tour="health-score"]',
      highlightPulse: true,
      showArrow: 'down',
      mobileInstructions: 'Tap the Health Score card above ☝️',
      nextStepOnClick: true
    },

    // Step 2: Prevented Costs
    {
      id: 'prevented-costs',
      page: createPageUrl('Dashboard'),
      title: '💰 Money Saved',
      message: 'See disasters prevented! This is real money you didn\'t have to spend on emergencies.',
      action: 'tap-element',
      position: 'bottom',
      targetElement: '[data-tour="prevented-costs"]',
      highlightPulse: true,
      showArrow: 'down',
      mobileInstructions: 'Tap the Prevented Costs card above ☝️',
      nextStepOnClick: true
    },

    // Step 3: Open Sidebar
    {
      id: 'open-menu',
      page: createPageUrl('Dashboard'),
      title: '📱 The 9-Step Journey',
      message: 'The 360° Method has 9 steps. Let\'s explore them. Open the menu.',
      action: 'tap-element',
      position: 'bottom-right',
      targetElement: '[data-tour="menu-button"]',
      highlightPulse: true,
      showArrow: 'left',
      mobileInstructions: 'Tap the ☰ menu icon in top corner 👆',
      blinkElement: true,
      nextStepOnClick: true
    },

    // Step 4: Properties in Sidebar
    {
      id: 'sidebar-properties',
      page: createPageUrl('Dashboard'),
      title: '🏠 Step 1: Properties',
      message: 'Start here - see your property details and what you own.',
      action: 'tap-element',
      position: 'right',
      targetElement: '[data-tour="sidebar-properties"]',
      highlightPulse: true,
      showArrow: 'right',
      mobileInstructions: 'Tap "Properties" in the menu 👉',
      blinkElement: true,
      nextStepOnClick: true,
      navigateTo: createPageUrl('Properties')
    },

    // Step 5: Property Card
    {
      id: 'property-card',
      page: createPageUrl('Properties'),
      title: '🏡 Your Property Profile',
      message: 'This is your home\'s profile - address, value, and all the details.',
      action: 'auto-advance',
      position: 'bottom',
      targetElement: '[data-tour="property-card"]',
      highlightPulse: true,
      showArrow: 'down',
      mobileInstructions: 'See your property details 👇',
      autoScroll: true,
      nextStepDelay: 3000
    },

    // Step 6: Back to Menu - Baseline
    {
      id: 'menu-baseline',
      page: createPageUrl('Properties'),
      title: '📋 Step 2: Baseline',
      message: 'Next step - document all major systems. Open menu.',
      action: 'tap-element',
      position: 'bottom-right',
      targetElement: '[data-tour="menu-button"]',
      highlightPulse: true,
      showArrow: 'left',
      mobileInstructions: 'Tap ☰ menu again 👆',
      blinkElement: true,
      nextStepOnClick: true
    },

    // Step 7: Baseline in Sidebar
    {
      id: 'sidebar-baseline',
      page: createPageUrl('Properties'),
      title: '📝 AWARE Phase: Baseline',
      message: 'Document every major system in your home.',
      action: 'tap-element',
      position: 'right',
      targetElement: '[data-tour="sidebar-baseline"]',
      highlightPulse: true,
      showArrow: 'right',
      mobileInstructions: 'Tap "Baseline" 👉',
      blinkElement: true,
      nextStepOnClick: true,
      navigateTo: createPageUrl('Baseline')
    },

    // Step 8: Systems List
    {
      id: 'systems-list',
      page: createPageUrl('Baseline'),
      title: '🔧 16 Systems Documented',
      message: 'Every major system tracked - HVAC, roof, plumbing, appliances. Tap one to see details.',
      action: 'tap-element',
      position: 'bottom',
      targetElement: '[data-tour="system-card-first"]',
      highlightPulse: true,
      showArrow: 'down',
      mobileInstructions: 'Tap the first system card below 👇',
      autoScroll: true,
      nextStepOnClick: true
    },

    // Step 9: Prioritize
    {
      id: 'menu-prioritize',
      page: createPageUrl('Baseline'),
      title: '🎯 Step 4: Prioritize',
      message: 'Now let\'s see your task queue. Open menu.',
      action: 'tap-element',
      position: 'bottom-right',
      targetElement: '[data-tour="menu-button"]',
      highlightPulse: true,
      showArrow: 'left',
      mobileInstructions: 'Open menu 👆',
      blinkElement: true,
      nextStepOnClick: true
    },

    {
      id: 'sidebar-prioritize',
      page: createPageUrl('Baseline'),
      title: '🎯 ACT Phase: Prioritize',
      message: 'See all tasks ranked by urgency and cascade risk.',
      action: 'tap-element',
      position: 'right',
      targetElement: '[data-tour="sidebar-prioritize"]',
      highlightPulse: true,
      showArrow: 'right',
      mobileInstructions: 'Tap "Prioritize" 👉',
      blinkElement: true,
      nextStepOnClick: true,
      navigateTo: createPageUrl('Prioritize')
    },

    // Step 10: Task Queue
    {
      id: 'task-queue',
      page: createPageUrl('Prioritize'),
      title: '📋 Your Action Queue',
      message: 'These are recommended seasonal tasks. Notice the options: DIY, Find Your Own Pro, or 360° Service.',
      action: 'auto-advance',
      position: 'bottom',
      targetElement: '[data-tour="task-queue"]',
      highlightPulse: true,
      showArrow: 'down',
      mobileInstructions: 'See task cards below 👇',
      autoScroll: true,
      nextStepDelay: 4000
    },

    // Final Step
    {
      id: 'tour-complete',
      page: createPageUrl('Prioritize'),
      title: '🎉 Tour Complete!',
      message: "You've seen the key steps: Properties → Baseline → Prioritize. The full 9-step method guides you through AWARE → ACT → ADVANCE phases. Explore freely!",
      action: 'tap-continue',
      position: 'center',
      targetElement: null,
      mobileInstructions: 'Tap below to finish',
      showRestartOption: true
    }
  ];

  const currentStepData = TOUR_STEPS[currentStep];

  // Start tour AFTER wizard completes
  useEffect(() => {
    if (demoMode) {
      const wizardSeen = sessionStorage.getItem('demoWizardSeen');
      const tourCompleted = sessionStorage.getItem('demo_tour_completed');
      
      // Only start tour if wizard was seen and tour hasn't been completed
      if (wizardSeen && !tourCompleted) {
        // Delay slightly to ensure wizard has fully closed
        const timer = setTimeout(() => {
          setTourActive(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } else {
      setTourActive(false);
    }
  }, [demoMode]);

  // Navigate if step requires different page
  useEffect(() => {
    if (tourActive && currentStepData?.navigateTo) {
      const timer = setTimeout(() => {
        if (location.pathname !== currentStepData.navigateTo) {
          navigate(currentStepData.navigateTo);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, tourActive, currentStepData, location.pathname, navigate]);

  // Auto-scroll to element
  useEffect(() => {
    if (tourActive && currentStepData?.targetElement && currentStepData?.autoScroll) {
      setTimeout(() => {
        const element = document.querySelector(currentStepData.targetElement);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [currentStep, tourActive, currentStepData]);

  // Auto-advance after delay
  useEffect(() => {
    if (tourActive && currentStepData?.nextStepDelay) {
      const timer = setTimeout(() => {
        handleNextStep();
      }, currentStepData.nextStepDelay);
      return () => clearTimeout(timer);
    }
  }, [currentStep, tourActive, currentStepData]);

  // Intercept clicks on target elements
  useEffect(() => {
    if (!tourActive || !currentStepData?.nextStepOnClick || !currentStepData?.targetElement) {
      return;
    }

    const handleClick = (e) => {
      const target = e.target.closest(currentStepData.targetElement);
      if (target) {
        // For center modals, don't prevent default
        if (currentStepData.position !== 'center') {
          e.preventDefault();
          e.stopPropagation();
        }
        setTimeout(() => handleNextStep(), 200);
      }
    };

    // Use capture phase for better control
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [tourActive, currentStep, currentStepData]);

  const handleNextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const endTour = () => {
    setTourActive(false);
    sessionStorage.setItem('demo_tour_completed', 'true');
  };

  const restartTour = () => {
    setCurrentStep(0);
    setTourActive(true);
    sessionStorage.removeItem('demo_tour_completed');
    navigate(createPageUrl('Dashboard'));
  };

  if (!demoMode || !tourActive) {
    return null;
  }

  return (
    <>
      {/* Backdrop Overlay - blocks interaction outside highlighted area */}
      <div 
        className="fixed inset-0 bg-black/75 z-[9998]"
        onClick={(e) => {
          // Prevent clicks on backdrop
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Spotlight on Target Element */}
      {currentStepData.targetElement && (
        <SpotlightHighlight 
          targetSelector={currentStepData.targetElement}
          pulse={currentStepData.highlightPulse}
          blink={currentStepData.blinkElement}
        />
      )}

      {/* Arrow Indicator */}
      {currentStepData.showArrow && currentStepData.targetElement && (
        <ArrowIndicator
          targetSelector={currentStepData.targetElement}
          direction={currentStepData.showArrow}
        />
      )}

      {/* Instruction Card */}
      <InstructionCard
        step={currentStepData}
        stepNumber={currentStep + 1}
        totalSteps={TOUR_STEPS.length}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onSkip={endTour}
        onRestart={restartTour}
        canGoBack={currentStep > 0}
      />
    </>
  );
}

// Spotlight Component - Highlights target with pulsing glow
function SpotlightHighlight({ targetSelector, pulse, blink }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const r = element.getBoundingClientRect();
        setRect({
          top: r.top - 8,
          left: r.left - 8,
          width: r.width + 16,
          height: r.height + 16
        });
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [targetSelector]);

  if (!rect) return null;

  return (
    <>
      {/* Glowing highlight ring */}
      <div
        className={`fixed z-[9999] rounded-xl pointer-events-none ${
          pulse ? 'animate-pulse-ring' : ''
        }`}
        style={{
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          boxShadow: 'inset 0 0 0 4px rgba(59, 130, 246, 1), 0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 20px 8px rgba(59, 130, 246, 0.4), 0 0 60px 20px rgba(59, 130, 246, 0.3)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.15) 100%)',
          border: '2px solid rgba(59, 130, 246, 0.8)'
        }}
      />

      {/* Animated ripple effect */}
      <div
        className="fixed z-[9998] rounded-xl pointer-events-none animate-ripple"
        style={{
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          border: '3px solid rgba(59, 130, 246, 0.6)'
        }}
      />

      {/* Hand pointer with bounce animation */}
      <div
        className="fixed z-[10000] pointer-events-none"
        style={{
          top: `${rect.top + rect.height / 2 - 24}px`,
          left: `${rect.left + rect.width / 2 - 24}px`
        }}
      >
        <div className="relative animate-tap-bounce">
          <div className="absolute -inset-2 bg-blue-400 rounded-full opacity-30 animate-ping" />
          <Hand className="w-12 h-12 text-blue-500 drop-shadow-lg relative z-10" style={{ filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.5))' }} />
        </div>
      </div>
    </>
  );
}

// Arrow Indicator Component
function ArrowIndicator({ targetSelector, direction }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        
        const positions = {
          down: { top: rect.bottom + 20, left: rect.left + rect.width / 2 - 20 },
          up: { top: rect.top - 60, left: rect.left + rect.width / 2 - 20 },
          left: { top: rect.top + rect.height / 2 - 20, left: rect.left - 60 },
          right: { top: rect.top + rect.height / 2 - 20, left: rect.right + 20 }
        };

        setPosition(positions[direction]);
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 100);
    
    return () => clearInterval(interval);
  }, [targetSelector, direction]);

  if (!position) return null;

  const ArrowIcon = {
    down: ArrowDown,
    up: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight
  }[direction];

  return (
    <div
      className="fixed z-[10000] pointer-events-none"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="relative">
        {/* Pulsing glow behind arrow */}
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-40 animate-pulse blur-md scale-150" />
        
        {/* Arrow container with bounce */}
        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
          <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping" />
          <ArrowIcon className="w-7 h-7 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
        </div>
      </div>
    </div>
  );
}

// Instruction Card Component - Mobile-optimized bottom sheet
function InstructionCard({ 
  step, 
  stepNumber, 
  totalSteps, 
  onNext, 
  onPrev, 
  onSkip,
  onRestart,
  canGoBack 
}) {
  const isCenter = step.position === 'center';

  if (isCenter) {
    // Center modal for welcome/completion
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {step.title}
            </h2>
            <p className="text-gray-700 text-base leading-relaxed">
              {step.message}
            </p>
          </div>

          {step.showRestartOption ? (
            <div className="space-y-3">
              <button
                onClick={onSkip}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-transform"
              >
                Start Exploring 🎉
              </button>
              <button
                onClick={onRestart}
                className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Restart Tour
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onNext}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                Let's Go!
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={onSkip}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold"
              >
                Skip Tour
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bottom sheet for step-by-step instructions
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10001] p-3 md:p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-lg mx-auto border-4 border-blue-500">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-gray-600">
            Step {stepNumber} of {totalSteps}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 p-2"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full mb-4">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>

        {/* Instruction Content */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-700 mb-3 text-sm md:text-base leading-relaxed">
            {step.message}
          </p>
          
          {/* Mobile-specific instruction with enhanced styling */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-3 border-blue-400 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-30 animate-pulse" />
              <Hand className="w-8 h-8 md:w-9 md:h-9 text-blue-600 relative z-10 animate-wiggle" />
            </div>
            <p className="text-blue-900 font-bold text-base md:text-lg leading-snug">
              {step.mobileInstructions}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {canGoBack && (
            <button
              onClick={onPrev}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 active:scale-95 transition-transform"
              style={{ minHeight: '48px' }}
            >
              Back
            </button>
          )}
          {step.action === 'tap-continue' && (
            <button
              onClick={onNext}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{ minHeight: '48px' }}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}