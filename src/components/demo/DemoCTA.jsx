import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDemo } from '@/components/shared/DemoContext';
import { base44 } from '@/api/base44Client';

export default function DemoCTA() {
  const navigate = useNavigate();
  const { demoMode } = useDemo();

  // Only show in demo mode
  if (!demoMode) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Protect Your Property?</h2>
        <p className="text-lg md:text-xl mb-8 opacity-95">
          Create your free account and start the 360° Method today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button 
            className="bg-orange-500 text-white hover:bg-orange-600 font-bold px-8 py-3 rounded-lg text-lg transition-colors"
            onClick={() => base44.auth.redirectToLogin()}
            style={{ minHeight: '48px' }}
          >
            Start Free Today
          </button>
          <button 
            className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            style={{ minHeight: '48px' }}
          >
            Try Another Demo
          </button>
        </div>
        <p className="text-sm opacity-75">
          Demo uses hypothetical data. Actual results, timelines, and benefits vary by property and individual circumstances.
        </p>
      </div>
    </div>
  );
}