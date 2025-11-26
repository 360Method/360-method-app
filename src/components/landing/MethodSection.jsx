import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MethodSection() {
  const navigate = useNavigate();

  const phases = [
    {
      number: 'I',
      name: 'AWARE',
      emoji: '👁️',
      tagline: 'Know Before You Need',
      description: "You can't fix what you don't see. Get complete visibility into your property's condition.",
      steps: [
        { num: 1, name: 'Baseline', desc: 'Document your starting point' },
        { num: 2, name: 'Inspect', desc: 'Conduct seasonal walkthroughs' },
        { num: 3, name: 'Track', desc: 'Build a living history' }
      ],
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      badgeColor: 'bg-blue-600',
      textColor: 'text-blue-700'
    },
    {
      number: 'II',
      name: 'ACT',
      emoji: '🔧',
      tagline: 'Fix Small Before Big',
      description: "The system tells you what to fix and when—in priority order.",
      steps: [
        { num: 4, name: 'Prioritize', desc: 'Safety first, then ROI' },
        { num: 5, name: 'Schedule', desc: 'Create your rhythm' },
        { num: 6, name: 'Execute', desc: 'Do or delegate with confidence' }
      ],
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      badgeColor: 'bg-green-600',
      textColor: 'text-green-700'
    },
    {
      number: 'III',
      name: 'ADVANCE',
      emoji: '📈',
      tagline: 'Optimize Over Time',
      description: "Go beyond maintenance to wealth building.",
      steps: [
        { num: 7, name: 'Preserve', desc: 'Extend system lifespans' },
        { num: 8, name: 'Upgrade', desc: 'Make strategic improvements' },
        { num: 9, name: 'Scale', desc: 'Grow your portfolio' }
      ],
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      badgeColor: 'bg-purple-600',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <section id="method" className="py-24 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            The 360° Method
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Three phases. Nine steps. One system that catches the $50 problem 
            before it becomes the $5,000 emergency.
          </p>
        </div>
        
        {/* Phase Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {phases.map((phase, index) => (
            <div 
              key={index}
              className={`relative ${phase.bgColor} rounded-3xl p-8 border-2 ${phase.borderColor}`}
            >
              <div className={`absolute -top-4 left-8 ${phase.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                Phase {phase.number}
              </div>
              
              <div className="text-5xl mb-4">{phase.emoji}</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{phase.name}</h3>
              <p className={`${phase.textColor} font-medium mb-4`}>{phase.tagline}</p>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {phase.description}
              </p>
              
              <ul className="space-y-3">
                {phase.steps.map((step) => (
                  <li key={step.num} className="flex items-start gap-3">
                    <span className={`${phase.textColor} font-bold flex-shrink-0`}>{step.num}.</span>
                    <div>
                      <div className="font-semibold text-slate-900">{step.name}</div>
                      <div className="text-sm text-slate-600">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
          >
            See the Method in Action →
          </button>
        </div>
        
      </div>
    </section>
  );
}