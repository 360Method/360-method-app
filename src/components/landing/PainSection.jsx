import React from 'react';

export default function PainSection() {
  const painPoints = [
    {
      emoji: '💸',
      title: 'The $10,000 Blindside',
      description: "One day everything's fine. The next, you're writing a check for a new HVAC system, a flooded basement, or a roof that 'should have been caught sooner.' Sound familiar?",
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100'
    },
    {
      emoji: '😰',
      title: 'The Endless "What If"',
      description: "Every creak, drip, and strange noise makes you wonder: Is this THE ONE? The one that empties your savings account? You never feel truly at peace in your own home.",
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      emoji: '🎰',
      title: 'The Trust Problem',
      description: "When something breaks, you're Googling at midnight, hoping the person who shows up isn't going to rip you off. Emergency pricing. Questionable advice. No idea if it's even necessary.",
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
          Sound Familiar?
        </h2>
        <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto text-lg">
          If you've ever felt like your property owns YOU instead of the other way around...
        </p>
        
        {/* Pain Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <div 
              key={index}
              className={`${point.bgColor} border ${point.borderColor} rounded-2xl p-8`}
            >
              <div className="text-5xl mb-4">{point.emoji}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {point.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Transition Statement */}
        <p className="text-center text-2xl text-slate-700 font-medium mt-16">
          It doesn't have to be this way.
        </p>
        
      </div>
    </section>
  );
}