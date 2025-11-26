import React from 'react';
import { Star } from 'lucide-react';

export default function TransformationProof() {
  const testimonials = [
    {
      quote: "Caught a small roof leak during my first seasonal inspection that would've cost thousands to fix later. The peace of mind alone is worth 10x what I pay.",
      name: "Sarah M.",
      role: "HomeCare Essential Member",
      transformation: "From constant worry → Complete confidence",
      metric: "$4,200 saved",
      metricColor: "bg-green-100 text-green-700",
      avatar: "S"
    },
    {
      quote: "I manage 8 rental doors. Since implementing the 360° Method, my maintenance costs are down 30% and emergency calls have virtually stopped. My phone doesn't buzz at 2am anymore.",
      name: "James K.",
      role: "PropertyCare Premium • 8 Doors",
      transformation: "From firefighting → Systematic control",
      metric: "30% cost reduction",
      metricColor: "bg-green-100 text-green-700",
      avatar: "J"
    }
  ];

  return (
    <section id="proof" className="py-24 bg-slate-900 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real Property Owners. Real Transformations.
          </h2>
        </div>
        
        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8">
              
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-2xl font-bold text-slate-600">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Quote */}
              <blockquote className="text-slate-700 text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Metrics */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  {testimonial.transformation}
                </div>
                <div className={`${testimonial.metricColor} font-semibold px-3 py-1 rounded-full text-sm`}>
                  {testimonial.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Case Study CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-center">
          <div className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-2">
            Case Study
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            The $9,500 Difference
          </h3>
          <p className="text-white/90 mb-6 text-lg">
            5-year cost comparison: Reactive approach vs. 360° Method
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 text-white">
              <div>
                <div className="text-sm opacity-80 mb-1">Reactive Approach</div>
                <div className="text-3xl font-bold">$19,350</div>
                <div className="text-xs opacity-70 mt-1">Emergency repairs + replacements</div>
              </div>
              <div>
                <div className="text-sm opacity-80 mb-1">360° Method</div>
                <div className="text-3xl font-bold">$9,850</div>
                <div className="text-xs opacity-70 mt-1">Planned maintenance + prevention</div>
              </div>
            </div>
          </div>
          <button className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors">
            Read the Full Case Study →
          </button>
        </div>
        
      </div>
    </section>
  );
}