import React from 'react';

export default function SocialProofBar() {
  const stats = [
    { number: '400+', label: 'Properties Managed' },
    { number: '$180M+', label: 'Real Estate Protected' },
    { number: '$8,400', label: 'Avg Saved Per Year' },
    { number: '30%', label: 'Longer System Lifespan' }
  ];

  return (
    <section className="bg-slate-100 py-8 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold text-slate-900">{stat.number}</div>
              <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}