import React from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <span className="text-xl">🏠</span>
          <span className="text-sm text-white/80 font-medium">
            For Property Owners Who Are Done Playing Defense
          </span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Your Home Is Either Making You Money<br />
          Or Costing You a Fortune.<br />
          <span className="text-orange-400">Right Now, You Don't Know Which.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Most property owners are one hidden problem away from a $10,000 emergency. 
          The 360° Method transforms reactive homeowners into proactive asset 
          managers—catching the $50 fix before it becomes the $5,000 disaster.
        </p>
        
        {/* Social Proof */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm">
            Trusted by 400+ property owners protecting $180M+ in real estate
          </span>
        </div>
        
        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            style={{ minHeight: '56px' }}
          >
            Start Free Today
          </button>
          <button 
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="w-full sm:w-auto border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{ minHeight: '56px' }}
          >
            Explore Demo First →
          </button>
        </div>
        
        {/* Microcopy */}
        <p className="mt-4 text-sm text-slate-500">
          Free forever for 1 property • No credit card required
        </p>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>
  );
}