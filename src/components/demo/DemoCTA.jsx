import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDemo } from '@/components/shared/DemoContext';

export default function DemoCTA() {
  const navigate = useNavigate();
  const { demoMode } = useDemo();

  // Only show in demo mode
  if (!demoMode) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Achieve Excellence?</h2>
        <p className="text-lg md:text-xl mb-8 opacity-95">
          Join the waitlist to start your journey to elite property maintenance
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button 
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold px-8 py-3 rounded-lg text-lg transition-colors"
            onClick={() => navigate(createPageUrl('Waitlist'))}
          >
            Join Waitlist
          </button>
          <button 
            className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
            onClick={() => navigate(createPageUrl('DemoEntry'))}
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