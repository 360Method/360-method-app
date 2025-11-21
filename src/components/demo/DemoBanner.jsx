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
    <div className="bg-yellow-50 border-b-2 border-yellow-300 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left side - Back to Landing */}
          <button
            onClick={handleBackToLanding}
            className="flex items-center gap-2 text-yellow-700 hover:text-yellow-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Landing</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          {/* Center - Demo info */}
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-yellow-900">Demo Mode:</span>
              <span className="text-yellow-800 ml-2">
                Exploring 2847 Maple Grove Ln
              </span>
            </div>
          </div>
          
          {/* Right side - CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-yellow-900 font-semibold hidden lg:inline">
              Ready to track your own property?
            </span>
            <Button
              onClick={handleJoinWaitlist}
              size="sm"
              className="bg-yellow-700 hover:bg-yellow-800 text-white gap-1 flex-shrink-0 shadow-md"
              style={{ minHeight: '40px', fontSize: '15px', fontWeight: '600' }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Join Waitlist</span>
              <span className="sm:hidden">Waitlist</span>
            </Button>
            <Button
              onClick={handleExitDemo}
              variant="ghost"
              size="sm"
              className="text-yellow-700 hover:text-yellow-900 flex-shrink-0"
              style={{ minHeight: '36px' }}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Demo</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}