import React, { useState, useEffect } from 'react';
import { Rocket, X, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDemo } from '../shared/DemoContext';

export default function FloatingWaitlistCTA() {
  const navigate = useNavigate();
  const location = useLocation();
  const { demoMode } = useDemo();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide on waitlist page
  useEffect(() => {
    setIsVisible(!location.pathname.includes('Waitlist'));
  }, [location.pathname]);

  if (!demoMode || !isVisible) {
    return null;
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[45] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-blue-500/50 active:scale-95 transition-all flex items-center gap-2 font-bold"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Rocket className="w-5 h-5" />
        <span className="hidden sm:inline">Join Waitlist</span>
        <ChevronUp className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[45] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl border-t-4 border-white/30 md:left-64">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 animate-bounce" />
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  Ready to Use This for Your Property?
                </h3>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5 hidden sm:block">
                  Join the waitlist for early access when we launch
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="bg-white text-blue-600 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-100 active:scale-95 transition-all shadow-lg whitespace-nowrap"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              Join Waitlist 🚀
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Minimize"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}