import React from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            The Choice Is Simple
          </h2>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Without Column */}
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
            <h3 className="text-xl font-bold text-slate-400 mb-6 text-center">
              Without the 360° Method
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <span className="text-slate-500">
                  Constant worry about what's breaking next
                </span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <span className="text-slate-500">
                  $10,000 surprise emergencies that drain your savings
                </span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <span className="text-slate-500">
                  Reactive firefighting that consumes your weekends
                </span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <span className="text-slate-500">
                  Property slowly losing value from neglect
                </span>
              </li>
            </ul>
            <button 
              className="w-full mt-8 py-3 rounded-lg border border-slate-300 text-slate-400 font-medium cursor-not-allowed"
              disabled
            >
              Keep Worrying
            </button>
          </div>
          
          {/* With Column */}
          <div className="bg-white rounded-2xl p-8 border-2 border-orange-200 shadow-lg shadow-orange-500/10">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
              With the 360° Method
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  Peace of mind knowing your property is protected
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  Small, planned investments that build wealth
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  Proactive confidence that frees your time
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  Property appreciating faster than the market
                </span>
              </li>
            </ul>
            <button 
              onClick={() => navigate('/Login')}
              className="w-full mt-8 py-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg"
              style={{ minHeight: '48px' }}
            >
              Start Free Today →
            </button>
          </div>
          
        </div>
        
        {/* Bottom Text */}
        <p className="text-center text-slate-600 mt-8 text-lg">
          400+ property owners have already made the choice. 
          <span className="font-medium text-slate-900"> Your property's future is waiting.</span>
        </p>
        
      </div>
    </section>
  );
}