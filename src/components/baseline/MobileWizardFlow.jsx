import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileWizardFlow({ 
  steps, 
  onComplete, 
  onCancel,
  allowSkip = [],
  showProgress = true 
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canSkip = allowSkip.includes(currentStep.id);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (canSkip) {
      handleNext();
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-gray-900">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
          
          <div className="w-10" />
        </div>
        
        {showProgress && (
          <Progress value={progress} className="h-1" />
        )}
      </div>

      {/* Progress Dots */}
      {showProgress && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-3 bg-gray-50">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIndex 
                  ? 'w-8 bg-blue-600' 
                  : idx < currentStepIndex
                  ? 'w-2 bg-green-600'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="h-full"
          >
            <div className="p-6 space-y-6">
              {/* Step Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStep.title}
                </h2>
                {currentStep.subtitle && (
                  <p className="text-gray-600">
                    {currentStep.subtitle}
                  </p>
                )}
              </div>

              {/* Step Component */}
              {currentStep.component}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 space-y-3">
        {canSkip && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full"
            style={{ minHeight: '48px' }}
          >
            Skip for now
          </Button>
        )}
        
        <div className="flex gap-3">
          {!isFirstStep && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 gap-2"
              style={{ minHeight: '56px' }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '56px' }}
          >
            {isLastStep ? 'Complete' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}