import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Sparkles, Home, Building2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        
        {/* Logo & Brand */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Stop Reacting to Problems.<br />
            Start Preventing Disasters.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
            The 360° Method transforms reactive chaos into proactive control. 
            Small problems stay small. Big savings compound over time.
          </p>
          
          {/* Dual CTAs - Homeowner vs Investor */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-4xl mx-auto mb-8">
            {/* Homeowner CTA */}
            <div className="flex-1 bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 hover:border-blue-500 transition-all">
              <div className="mb-4">
                <div className="text-5xl mb-3">🏡</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">I'm a Homeowner</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Protect your largest asset. Sleep soundly knowing small problems 
                  won't become expensive disasters.
                </p>
              </div>
              <button
                onClick={() => navigate(createPageUrl('DemoEntry') + '?type=homeowner')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition-colors"
              >
                Explore Homeowner Demo →
              </button>
            </div>
            
            {/* Investor CTA */}
            <div className="flex-1 bg-green-50 border-2 border-green-300 rounded-2xl p-6 hover:border-green-500 transition-all">
              <div className="mb-4">
                <div className="text-5xl mb-3">🏢</div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">I'm an Investor</h3>
                <p className="text-green-800 text-sm mb-4">
                  Maximize ROI across your portfolio. Turn maintenance from a cost 
                  center into a wealth-building strategy.
                </p>
              </div>
              <button
                onClick={() => navigate(createPageUrl('DemoEntry') + '?type=investor')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg transition-colors"
              >
                Explore Investor Demo →
              </button>
            </div>
          </div>
          
          {/* Secondary CTA - Skip to Waitlist */}
          <div className="text-center">
            <button
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="text-blue-700 hover:text-blue-900 underline text-base font-semibold"
            >
              Skip demo, join waitlist →
            </button>
          </div>
        </div>

        {/* Visual Problem → Solution */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* The Problem */}
            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                😰 The Old Way (Reactive)
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                One Surprise Away From Crisis
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>No system for tracking maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Small problems become expensive disasters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Emergency repairs at the worst times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Losing thousands in preventable failures</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                😌 The 360° Way (Proactive)
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Systematic Prevention = Peace of Mind
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Know exactly what you have and when it was serviced</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Catch $50 problems before they cascade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Plan maintenance on your schedule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Save $27K-$72K over 10-15 years</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* The 3×3 Framework (Visual) */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              The 360° Method: A Proven 3×3 Framework
            </h2>
            <p className="text-lg text-gray-600">
              Three phases. Three steps each. Nine total steps that protect your largest asset.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Phase 1: AWARE */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">AWARE</h3>
              <p className="text-blue-800 text-sm mb-4">Know Your Property</p>
              <ul className="space-y-2 text-sm text-blue-900">
                <li><strong>1. Baseline:</strong> Document systems</li>
                <li><strong>2. Inspect:</strong> Seasonal check-ins</li>
                <li><strong>3. Track:</strong> Build history</li>
              </ul>
            </div>

            {/* Phase 2: ACT */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">ACT</h3>
              <p className="text-orange-800 text-sm mb-4">Fix Problems Smart</p>
              <ul className="space-y-2 text-sm text-orange-900">
                <li><strong>4. Prioritize:</strong> Rank by urgency</li>
                <li><strong>5. Schedule:</strong> Plan timeline</li>
                <li><strong>6. Execute:</strong> Complete work</li>
              </ul>
            </div>

            {/* Phase 3: ADVANCE */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">ADVANCE</h3>
              <p className="text-green-800 text-sm mb-4">Build Long-Term Value</p>
              <ul className="space-y-2 text-sm text-green-900">
                <li><strong>7. Preserve:</strong> Extend lifespans</li>
                <li><strong>8. Upgrade:</strong> Strategic improvements</li>
                <li><strong>9. SCALE:</strong> Portfolio intelligence</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-2xl font-bold text-gray-900">
              3 Phases × 3 Steps = <span className="text-blue-600">9 Total Steps</span>
            </p>
            <p className="text-gray-600 mt-2">Each property flows through this systematic approach</p>
          </div>
        </div>

        {/* Social Proof / Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-12">
          <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md">
            <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">$27K-$72K</div>
            <div className="text-xs md:text-sm text-gray-600">Average savings over 10-15 years</div>
          </div>
          <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md">
            <div className="text-2xl md:text-4xl font-bold text-green-600 mb-2">87%</div>
            <div className="text-xs md:text-sm text-gray-600">Of failures prevented by tracking 9 systems</div>
          </div>
          <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md">
            <div className="text-2xl md:text-4xl font-bold text-purple-600 mb-2">$8K-$15K</div>
            <div className="text-xs md:text-sm text-gray-600">Added value at resale with maintenance history</div>
          </div>
          <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md">
            <div className="text-2xl md:text-4xl font-bold text-orange-600 mb-2">30X</div>
            <div className="text-xs md:text-sm text-gray-600">Typical ROI on preventive maintenance</div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Join thousands of homeowners and investors who protect their properties systematically.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs md:text-sm text-gray-500">
            <div>✓ No credit card required</div>
            <div>✓ Try full demo first</div>
            <div>✓ Your data is private</div>
          </div>
        </div>

      </div>
    </div>
  );
}