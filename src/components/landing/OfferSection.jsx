import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function OfferSection() {
  const benefits = [
    {
      text: '<strong>Full dashboard access</strong> for 1 property forever',
      highlight: 'Full dashboard access'
    },
    {
      text: '<strong>Property health scoring</strong> and cascade risk detection',
      highlight: 'Property health scoring'
    },
    {
      text: '<strong>Seasonal inspection checklists</strong> tailored to your climate',
      highlight: 'Seasonal inspection checklists'
    },
    {
      text: '<strong>Maintenance tracking</strong> with photo documentation',
      highlight: 'Maintenance tracking'
    }
  ];

  return (
    <section id="offer" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Protecting Your Property Today
          </h2>
          <p className="text-xl text-slate-300">
            Create your free account and get instant access
          </p>
        </div>
        
        {/* Offer Box */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm">
              🎁 Free Account Includes
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Start Free Today and Get:
          </h3>
          
          {/* Benefits */}
          <ul className="space-y-4 mb-8">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span 
                  className="text-slate-700"
                  dangerouslySetInnerHTML={{ __html: benefit.text }}
                />
              </li>
            ))}
          </ul>
          
          {/* CTA Button */}
          <button
            onClick={() => navigate('/Login')}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 active:scale-95 transition-all shadow-lg mb-3"
            style={{ minHeight: '48px' }}
          >
            Create Free Account
          </button>
          <p className="text-xs text-center text-slate-500">
            No credit card required • 2-minute setup
          </p>
          
        </div>
        
        {/* Social Proof Below */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-white" />
            </div>
            <span className="text-slate-400 text-sm">
              Join 400+ property owners protecting their investments
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}