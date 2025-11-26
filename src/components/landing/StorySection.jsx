import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function StorySection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Photo Column */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden flex items-center justify-center">
              {/* Placeholder for founder photo */}
              <div className="text-center">
                <div className="w-32 h-32 bg-slate-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-6xl text-slate-500">👤</span>
                </div>
                <p className="text-slate-500 text-sm">Marcin Micek</p>
              </div>
            </div>
            
            {/* Floating Credential Badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-100">
              <div className="text-2xl font-bold text-slate-900">10+</div>
              <div className="text-sm text-slate-600">Years Experience</div>
            </div>
          </div>
          
          {/* Story Column */}
          <div>
            <div className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
              The Story Behind the Method
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
              "I Watched a $50 Problem Become a $10,000 Disaster. Then I Made Sure It Would Never Happen Again."
            </h2>
            
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Ten years ago, I stood in a gutted bathroom staring at $10,000 worth of damage. 
                The cause? A tiny leak that had been slowly destroying the subfloor for months. 
                The previous owner never knew. The home inspector missed it. And now it was my problem.
              </p>
              <p>
                That moment changed everything.
              </p>
              <p>
                I spent years developing a system—first for my own rental properties, then for 
                hundreds of property owners tired of playing defense. I combined my construction 
                background, insurance risk assessment training, and real-world property management 
                experience into one comprehensive framework.
              </p>
              <p className="font-medium text-slate-900">
                Today, that system is the 360° Method—and it's helped over 400 property owners 
                protect more than $180 million in real estate.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="font-semibold text-slate-900">— Marcin Micek</div>
              <div className="text-slate-500">Creator, 360° Method</div>
            </div>
            
            {/* Credibility Bullets */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                400+ properties managed
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                $180M+ protected
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                10+ years experience
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </section>
  );
}