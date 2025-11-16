
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Stop $50 Problems From Becoming
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> $5,000 Disasters</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            The 360° Method helps homeowners prevent expensive failures through 
            systematic maintenance. Most save <strong>$27,000-$72,000</strong> over 10-15 years.
          </p>
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
                Most Homeowners Are One Surprise Away From Crisis
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
                Systematic Prevention = Financial Peace of Mind
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

        {/* Two Paths Forward */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Choose Your Path
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Path 1: Try Demo */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 md:p-8 text-center">
              <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                🎮 Explore Demo First
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-6">
                See a fully documented property with all 9 steps in action. 
                No signup required.
              </p>
              <ul className="text-left text-xs md:text-sm text-gray-700 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>16 systems documented</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>8 prioritized tasks with AI cost analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Full maintenance history + projections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>See $7,200 in prevented disasters</span>
                </li>
              </ul>
              <button
                onClick={() => navigate(createPageUrl('DemoEntry'))}
                className="w-full px-6 md:px-8 py-3 md:py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-xl text-base md:text-lg transition-colors shadow-lg"
              >
                Explore Demo Property →
              </button>
              <p className="text-xs text-gray-600 mt-3">
                No login • No commitment • Full access
              </p>
            </div>

            {/* Path 2: Join Waitlist */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 md:p-8 text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                🏠 Join Waitlist
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-6">
                Be first to know when you can track your own property. 
                Get exclusive early access content.
              </p>
              <ul className="text-left text-xs md:text-sm text-gray-700 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Early access notification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>4-part educational email series</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Exclusive launch discount</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Priority access to features</span>
                </li>
              </ul>
              <button
                onClick={() => navigate(createPageUrl('Waitlist'))}
                className="w-full px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base md:text-lg transition-colors shadow-lg"
              >
                Join Waitlist →
              </button>
              <p className="text-xs text-gray-600 mt-3">
                No credit card • Free updates • Unsubscribe anytime
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Join thousands of homeowners who sleep soundly knowing their 
            largest asset is systematically protected.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs md:text-sm text-gray-500">
            <div>✓ No credit card required</div>
            <div>✓ Free forever (1 property)</div>
            <div>✓ Your data is private</div>
          </div>
        </div>

      </div>
    </div>
  );
}
