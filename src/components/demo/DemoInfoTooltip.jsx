import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useDemo } from '../shared/DemoContext';

/**
 * Info bubble tooltip that only shows in demo mode
 * Usage: <DemoInfoTooltip title="Why This Matters" content="..." />
 */
export function DemoInfoTooltip({ title, content, position = 'right' }) {
  const { demoMode } = useDemo();
  const [isOpen, setIsOpen] = useState(false);

  if (!demoMode) return null;

  const positionClasses = {
    right: 'left-full ml-2 top-0',
    left: 'right-full mr-2 top-0',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2'
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-colors cursor-help"
        aria-label="More info"
      >
        <Info className="w-3 h-3 text-yellow-700" />
      </button>

      {isOpen && (
        <>
          {/* Mobile: Full screen overlay */}
          <div className="md:hidden fixed inset-0 bg-black/50 z-[150] flex items-end" onClick={() => setIsOpen(false)}>
            <div className="bg-white rounded-t-2xl p-6 w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                {typeof content === 'string' ? <p>{content}</p> : content}
              </div>
            </div>
          </div>

          {/* Desktop: Tooltip popup */}
          <div className={`hidden md:block absolute ${positionClasses[position]} z-[150] w-80`}>
            <div className="bg-white rounded-lg shadow-xl border-2 border-yellow-300 p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-700 space-y-2">
                {typeof content === 'string' ? <p>{content}</p> : content}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}