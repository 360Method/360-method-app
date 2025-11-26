import React from 'react';
import { Target, ListOrdered, Calendar, TrendingUp, Camera, FileText } from 'lucide-react';

export default function ProductSection() {
  const features = [
    {
      icon: Target,
      title: 'Property Health Score',
      description: 'Know your condition at a glance. Watch it improve as you take action.',
      color: 'blue'
    },
    {
      icon: ListOrdered,
      title: 'Smart Priority System',
      description: 'Never wonder what to fix first. Safety → ROI → Comfort.',
      color: 'green'
    },
    {
      icon: Calendar,
      title: 'Seasonal Inspection Guides',
      description: 'Checklists adapted to your climate. Know exactly what to check and when.',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Maintenance Timeline',
      description: 'See what's coming. Plan ahead. No more surprise expenses.',
      color: 'orange'
    },
    {
      icon: Camera,
      title: 'Photo Documentation',
      description: 'Track changes over time. Proof for insurance, contractors, and resale.',
      color: 'blue'
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'One-click reports for insurance, refinancing, or selling.',
      color: 'green'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Your Property Command Center
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to implement the 360° Method—in one place.
          </p>
        </div>
        
        {/* Dashboard Preview Placeholder */}
        <div className="relative mb-16">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-8">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <div className="text-xl font-semibold text-slate-700 mb-2">
                  Dashboard Preview
                </div>
                <div className="text-sm text-slate-500">
                  Real screenshots coming soon
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Screenshot Placeholder (overlapping) */}
          <div className="absolute -bottom-8 -right-4 md:right-8 w-32 md:w-48">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white p-4">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg aspect-[9/16] flex items-center justify-center">
                <div className="text-4xl">📱</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6">
                <div className={`w-12 h-12 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Statement */}
        <div className="text-center mt-12">
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            This isn't just an app. It's the implementation system for the 360° Method. 
            <span className="font-semibold text-slate-900"> Everything you need to transform from reactive to proactive.</span>
          </p>
        </div>
        
      </div>
    </section>
  );
}