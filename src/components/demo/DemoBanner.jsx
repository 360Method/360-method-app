import React from 'react';
import { Info, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '../shared/DemoContext';

export function DemoBanner({ onAddProperty }) {
  const { demoMode, exitDemoMode } = useDemo();

  if (!demoMode) return null;

  const handleCreateAccount = () => {
    window.location.href = '/';
  };

  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-300 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-yellow-900">Demo Mode:</span>
              <span className="text-yellow-800 ml-2">
                Exploring 2847 Maple Grove Ln with full data
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-yellow-700 hidden lg:inline">
              Ready to track your own property?
            </span>
            <Button
              onClick={handleCreateAccount}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white gap-1 flex-shrink-0"
              style={{ minHeight: '36px' }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Start Free</span>
              <span className="sm:hidden">Sign Up</span>
            </Button>
            <Button
              onClick={exitDemoMode}
              variant="ghost"
              size="sm"
              className="text-yellow-700 hover:text-yellow-900 flex-shrink-0"
              style={{ minHeight: '36px' }}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}