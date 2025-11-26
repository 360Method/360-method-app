import React from 'react';
import { CheckCircle } from 'lucide-react';
import WaitlistInlineForm from './WaitlistInlineForm';

export default function OfferSection() {
  const benefits = [
    {
      text: '<strong>Free access</strong> when we launch (no credit card required)',
      highlight: 'Free access'
    },
    {
      text: '<strong>4-part email series</strong> teaching the 360° Method',
      highlight: '4-part email series'
    },
    {
      text: '<strong>Exclusive early-bird pricing</strong> locked in forever',
      highlight: 'Exclusive early-bird pricing'
    },
    {
      text: '<strong>Property Health Assessment Guide</strong> (PDF download)',
      highlight: 'Property Health Assessment Guide'
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
            Join the waitlist for early access and exclusive bonuses
          </p>
        </div>
        
        {/* Offer Box */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm">
              🎁 Early Access Offer
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Join the Waitlist and Get:
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
          
          {/* Email Form */}
          <WaitlistInlineForm source="homepage_offer" />
          
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
              Join 400+ property owners on the waitlist
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}