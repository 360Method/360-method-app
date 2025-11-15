import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Info, X } from 'lucide-react';
import { useDemo } from '../shared/DemoContext';

export function DemoBanner({ onAddProperty }) {
  const { demoMode, exitDemoMode } = useDemo();
  
  if (!demoMode) return null;
  
  return (
    <Alert className="rounded-none border-t-4 border-t-yellow-400 bg-yellow-50 mb-0">
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-yellow-900">
              🔒 Demo Mode - Read-Only Example
            </span>
          </div>
          <span className="text-xs text-yellow-700">
            Exploring 2847 Maple Grove Ln. Changes won't be saved.
          </span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
            onClick={() => {
              exitDemoMode();
              onAddProperty?.();
            }}
          >
            Add My Property
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={exitDemoMode}
            className="hover:bg-yellow-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}