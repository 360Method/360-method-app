import React from 'react';
import { Info, Sparkles, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '../shared/DemoContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function DemoBanner({ onAddProperty }) {
  const { demoMode, exitDemoMode } = useDemo();
  const navigate = useNavigate();

  if (!demoMode) return null;

  const handleJoinWaitlist = () => {
    navigate(createPageUrl('Waitlist'));
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleExitDemo = () => {
    // Clear demo mode from sessionStorage
    sessionStorage.removeItem('demoMode');
    sessionStorage.removeItem('demoWizardSeen');
    exitDemoMode();
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-b-2 border-yellow-400 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left side - Demo info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-yellow-100 rounded-full p-2 flex-shrink-0">
              <Info className="w-4 h-4 text-yellow-700" />
            </div>
            <div className="text-sm min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-yellow-900 bg-yellow-200 px-2 py-0.5 rounded-md text-xs uppercase tracking-wide">
                  Demo Mode
                </span>
                <span className="text-yellow-800 font-medium hidden sm:inline">
                  Exploring sample property
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side - CTAs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleJoinWaitlist}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 shadow-lg border border-blue-700"
              style={{ minHeight: '40px', fontSize: '14px', fontWeight: '700' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Join Waitlist</span>
            </Button>
            <Button
              onClick={handleBackToLanding}
              variant="ghost"
              size="sm"
              className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
              style={{ minHeight: '40px' }}
              title="Back to Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleExitDemo}
              variant="ghost"
              size="sm"
              className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
              style={{ minHeight: '40px' }}
              title="Exit Demo"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}