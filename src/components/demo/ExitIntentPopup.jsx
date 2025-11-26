import React, { useEffect, useState } from 'react';
import { X, Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useDemo } from '../shared/DemoContext';

export default function ExitIntentPopup() {
  const { demoMode } = useDemo();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!demoMode) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !dismissed && window.innerWidth > 768) {
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [dismissed, demoMode]);

  if (!show || !demoMode) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300" style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => {
            setShow(false);
            setDismissed(true);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 flex items-center justify-center"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Don't Leave Your Property Unprotected
          </h2>
          <p className="text-gray-700 mb-6">
            You've seen how the 360° Method prevents disasters and builds wealth. 
            Create your free account and start protecting your property today.
          </p>

          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 active:scale-95 transition-all mb-3"
            style={{ minHeight: '44px', pointerEvents: 'auto', cursor: 'pointer' }}
          >
            Start Free Today
          </button>

          <button
            onClick={() => {
              setShow(false);
              setDismissed(true);
            }}
            className="text-gray-600 hover:text-gray-800 text-sm font-semibold py-3"
            style={{ minHeight: '44px', pointerEvents: 'auto', cursor: 'pointer' }}
          >
            Continue exploring demo
          </button>
          
          <p className="text-xs text-gray-400 text-center mt-4">
            Free forever for 1 property • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}