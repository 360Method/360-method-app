import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const DemoWizard = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  const screens = [
    {
      title: "Welcome to Your Demo Property! 🏡",
      subtitle: "2847 Maple Grove Ln, Vancouver WA 98661",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            This is a fully documented property using the 360° Method. 
            Everything you see is <strong>real data</strong> showing how the system works.
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h4 className="font-bold text-blue-900 mb-3">Already Documented For You:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">16 Systems</div>
                  <div className="text-gray-600">HVAC, roof, plumbing, etc.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">8 Tasks</div>
                  <div className="text-gray-600">Prioritized with AI analysis</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">2 Inspections</div>
                  <div className="text-gray-600">Fall 2025 + Spring 2025</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">$7,200 Saved</div>
                  <div className="text-gray-600">Prevented disasters</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            <strong>Note:</strong> Demo mode is view-only. You can explore everything, 
            but changes won't be saved. Ready to see how it works?
          </p>
        </div>
      )
    },
    {
      title: "Phase I: AWARE (Steps 1-3)",
      subtitle: "Know Your Property",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-bold text-blue-900 mb-2">Baseline</h4>
                <p className="text-sm text-blue-800">
                  Document all major systems. This demo has 16 systems documented 
                  with ages, models, and condition ratings.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-bold text-blue-900 mb-2">Inspect</h4>
                <p className="text-sm text-blue-800">
                  Seasonal walkthroughs catch problems early. This demo includes 
                  Fall 2025 and Spring 2025 inspections.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-bold text-blue-900 mb-2">Track</h4>
                <p className="text-sm text-blue-800">
                  All completed work auto-logs here. See 5 maintenance records 
                  with photos, costs, and dates.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-700">
            <strong>💡 Try it:</strong> Navigate to Baseline, Inspect, or Track 
            in the sidebar to see each step in action.
          </p>
        </div>
      )
    },
    {
      title: "Phase II: ACT (Steps 4-6)",
      subtitle: "Fix Problems Smart",
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-3">4</div>
                <h4 className="font-bold text-orange-900 mb-2">Prioritize</h4>
                <p className="text-sm text-orange-800">
                  See 8 tasks with AI cost analysis and cascade risk scoring. 
                  1 urgent, 3 high priority, 4 routine.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-3">5</div>
                <h4 className="font-bold text-orange-900 mb-2">Schedule</h4>
                <p className="text-sm text-orange-800">
                  Plan maintenance strategically. Demo shows scheduled tasks 
                  across fall and winter seasons.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-3">6</div>
                <h4 className="font-bold text-orange-900 mb-2">Execute</h4>
                <p className="text-sm text-orange-800">
                  Click into tasks to see AI how-to guides, completion tracking, 
                  and photo documentation.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-700">
            <strong>💡 Try it:</strong> Go to Prioritize to see the ticket queue, 
            or Execute to view detailed task guides.
          </p>
        </div>
      )
    },
    {
      title: "Phase III: ADVANCE (Steps 7-9)",
      subtitle: "Build Long-Term Value",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-3">7</div>
                <h4 className="font-bold text-green-900 mb-2">Preserve</h4>
                <p className="text-sm text-green-800">
                  Strategic interventions extend system lifespans. See 4 preservation 
                  opportunities with 3×+ ROI projections.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-3">8</div>
                <h4 className="font-bold text-green-900 mb-2">Upgrade</h4>
                <p className="text-sm text-green-800">
                  Track improvements with budget and ROI. Demo includes bathroom 
                  remodel with photo timeline.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-3">9</div>
                <h4 className="font-bold text-green-900 mb-2">SCALE</h4>
                <p className="text-sm text-green-800">
                  Portfolio CFO intelligence. See 10-year wealth projections and 
                  equity tracking for this property.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-700">
            <strong>💡 Try it:</strong> Explore Preserve for lifecycle forecasts, 
            or SCALE for financial projections.
          </p>
        </div>
      )
    },
    {
      title: "Ready to Explore! 🎉",
      subtitle: "Navigate anywhere using the sidebar",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">What You Can Do:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">✓</div>
                <div>
                  <div className="font-semibold">Click anywhere</div>
                  <div className="text-sm text-gray-600">All pages, buttons, and features are explorable</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">✓</div>
                <div>
                  <div className="font-semibold">View real data</div>
                  <div className="text-sm text-gray-600">Everything you see is how the system works for real users</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">✓</div>
                <div>
                  <div className="font-semibold">Exit anytime</div>
                  <div className="text-sm text-gray-600">Click "Exit Demo" in the yellow banner at the top</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
            <h4 className="font-bold text-yellow-900 mb-2">💡 Impressed?</h4>
            <p className="text-yellow-800 mb-4">
              Join our waitlist to be notified when you can track your own property. 
              We'll send you exclusive content about the 360° Method while you wait.
            </p>
            <button
              onClick={() => {
                onComplete();
                navigate(createPageUrl('Waitlist'));
              }}
              className="px-6 py-3 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 font-bold shadow-md"
              style={{ minHeight: '48px' }}
            >
              Join Waitlist
            </button>
          </div>
        </div>
      )
    }
  ];
  
  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{screens[currentStep].title}</h2>
            <p className="text-sm text-gray-600">{screens[currentStep].subtitle}</p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-8">
          {screens[currentStep].content}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <div className="flex gap-2">
            {screens.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              {currentStep < screens.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Start Exploring'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoWizard;