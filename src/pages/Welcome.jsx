import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle, X, Star, ChevronDown, ChevronUp, HelpCircle, Heart, Users, Target, Shield, Brain, Check, Compass, Home, Flag, Crown, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import {
  calculateHomeownerPlusPricing,
  calculateGoodPricing,
  calculateBetterPricing,
  calculateBestPricing
} from '@/components/shared/TierCalculator';

// JSON-LD Structured Data for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "360° Method",
  "url": "https://app.360degreemethod.com",
  "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png",
  "description": "Proactive home maintenance platform that helps property owners catch the $50 fix before it becomes the $5,000 disaster.",
  "sameAs": []
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is the 360° Method really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! The Scout plan is free forever for your first property. You get the complete 360° Method framework including baseline documentation, seasonal inspections, task tracking, and cascade risk alerts."
      }
    },
    {
      "@type": "Question",
      "name": "How much time does this actually take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most users spend about 15-20 minutes per month on property care with our system. The initial setup takes about 30 minutes to document your property's systems."
      }
    },
    {
      "@type": "Question",
      "name": "I'm not handy. Can I still use this?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! The 360° Method is designed for everyone, not just DIY experts. We help you know what needs attention, then you decide whether to handle it yourself or hire a professional."
      }
    },
    {
      "@type": "Question",
      "name": "What if I rent my property out?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The 360° Method works great for landlords and rental property owners. Our system is especially valuable for investment properties where catching problems early protects your ROI."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from a home warranty?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Home warranties cover repairs after something breaks. The 360° Method helps you prevent breaks in the first place. Prevention is always cheaper than repair."
      }
    },
    {
      "@type": "Question",
      "name": "Can I try it before signing up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Click 'See It In Action' to explore our interactive demo. You'll see exactly how the system works with sample properties. No signup required."
      }
    }
  ]
};

const FAQ_ITEMS = [
  {
    question: "Is the 360° Method really free?",
    answer: "Yes! The Scout plan is free forever for your first property. You get the complete 360° Method framework including baseline documentation, seasonal inspections, task tracking, and cascade risk alerts. Upgrade to Homeowner+ for AI-powered insights that make everything smarter."
  },
  {
    question: "How much time does this actually take?",
    answer: "Most users spend about 15-20 minutes per month on property care with our system. The initial setup takes about 30 minutes to document your property's systems. After that, our seasonal reminders and smart scheduling do the heavy lifting."
  },
  {
    question: "I'm not handy. Can I still use this?",
    answer: "Absolutely! The 360° Method is designed for everyone, not just DIY experts. We help you know what needs attention, then you decide whether to handle it yourself or hire a professional. Many tasks are simple enough for anyone, and we'll tell you which ones truly need a pro."
  },
  {
    question: "What if I rent my property out?",
    answer: "The 360° Method works great for landlords and rental property owners. In fact, our system is especially valuable for investment properties where catching problems early protects your ROI. You can track multiple properties and even share inspection reports with tenants."
  },
  {
    question: "How is this different from a home warranty?",
    answer: "Home warranties cover repairs after something breaks. The 360° Method helps you prevent breaks in the first place. Think of it as the difference between car insurance and regular oil changes. You need both, but prevention is always cheaper than repair."
  },
  {
    question: "Can I try it before signing up?",
    answer: "Yes! Click 'See It In Action' to explore our interactive demo. You'll see exactly how the system works with sample properties in different conditions, from struggling to excellent. No signup required."
  }
];

export default function Welcome() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Load Elfsight script for Google Reviews widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isAuthenticated && user) {
        const userMeta = user.user_metadata || {};
        if (!userMeta.onboarding_completed) {
          navigate(createPageUrl('Onboarding'), { replace: true });
          return;
        }
        const userType = determineUserType(userMeta);
        const dashboard = getDashboardRoute(userType);
        navigate(dashboard, { replace: true });
        return;
      }
      setIsCheckingAuth(false);
    }
  }, [isLoadingAuth, isAuthenticated, user, navigate]);

  // Show loading spinner while checking auth OR if user is authenticated (will redirect)
  if (isCheckingAuth || isLoadingAuth || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>360° Method - Proactive Home Maintenance That Builds Wealth</title>
        <meta name="description" content="Stop worrying about what's breaking next. The 360° Method helps property owners catch the $50 fix before it becomes the $5,000 disaster." />
        <link rel="canonical" href="https://app.360degreemethod.com/" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png"
              alt="360° Method"
              className="h-8 w-8"
            />
            <span className="font-semibold text-slate-900">360° Method</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/BecomeOperator')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              For Operators
            </button>
            <button
              onClick={() => navigate('/Login')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/Signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-white/80 font-medium">
              For Property Owners Who Are Done Playing Defense
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Stop Worrying About What's Breaking Next.
            <span className="text-orange-400 block mt-2">Start Building Wealth.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-4">
            Most property owners are one hidden problem away from a $10,000 emergency.
            The 360° Method catches the $50 fix before it becomes the $5,000 disaster.
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-400 mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm">
              Built by a property owner, for property owners
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <button
              onClick={() => navigate('/Signup')}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            >
              Start Free Today
            </button>
            <button
              onClick={() => navigate(createPageUrl('DemoEntry'))}
              className="w-full sm:w-auto border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              See It In Action
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Free forever for 1 property • No credit card required
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Pain Section - The Problem */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            Sound Familiar?
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto text-lg">
            If you've ever felt like your property owns YOU instead of the other way around...
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The $10,000 Blindside</h3>
              <p className="text-slate-600 leading-relaxed">
                One day everything's fine. The next, you're writing a check for a new HVAC system or a flooded basement. Sound familiar?
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 md:p-8">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The Endless "What If"</h3>
              <p className="text-slate-600 leading-relaxed">
                Every creak, drip, and strange noise makes you wonder: Is this THE ONE that empties my savings? You never feel at peace.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="text-4xl mb-4">🎰</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The Trust Problem</h3>
              <p className="text-slate-600 leading-relaxed">
                When something breaks, you're Googling at midnight hoping whoever shows up won't rip you off. Emergency pricing. Questionable advice.
              </p>
            </div>
          </div>

          <p className="text-center text-2xl text-slate-700 font-medium mt-12">
            It doesn't have to be this way.
          </p>
        </div>
      </section>

      {/* Transformation Section - Before/After */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            Your Transformation
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto text-lg">
            From reactive firefighting to proactive confidence
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-400 mb-6 text-center">
                Where You Are Now
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-500">Constant worry about what's breaking next</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-500">$10,000 surprise emergencies that drain savings</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-500">Reactive firefighting that consumes weekends</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-500">No idea what your home actually needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-500">Property slowly losing value from neglect</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-green-200 shadow-lg shadow-green-500/10">
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
                Where You're Going
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Peace of mind knowing exactly what needs attention</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Small, planned investments instead of emergencies</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Proactive confidence that frees your time</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Complete visibility into your property's health</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Property appreciating faster than the market</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/Signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
            >
              Start Your Transformation
            </button>
          </div>
        </div>
      </section>

      {/* The Method - How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            The 360° Method
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto text-lg">
            Three phases that take you from overwhelmed to in control
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 md:p-8 border-2 border-blue-100 relative">
              <div className="absolute -top-3 left-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Phase 1
              </div>
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AWARE</h3>
              <p className="text-blue-700 font-medium mb-3">Know Before You Need</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Document your systems, inspect regularly, and build complete visibility into your property's condition.
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 md:p-8 border-2 border-green-100 relative">
              <div className="absolute -top-3 left-6 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Phase 2
              </div>
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">ACT</h3>
              <p className="text-green-700 font-medium mb-3">Fix Small Before Big</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Know exactly what to fix and when, prioritized by urgency and cost impact. Do it yourself or hire help.
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 md:p-8 border-2 border-purple-100 relative">
              <div className="absolute -top-3 left-6 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Phase 3
              </div>
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">ADVANCE</h3>
              <p className="text-purple-700 font-medium mb-3">Build Wealth Over Time</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Go beyond maintenance. Extend system lifespans, make strategic upgrades, and watch your equity grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection navigate={navigate} />

      {/* Social Proof - Real Google Reviews */}
      <section className="py-16 md:py-24 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            Real Transformations
          </h2>
          <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto text-lg">
            See what property owners are saying about the 360° Method
          </p>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 mb-10">
            <div className="elfsight-app-71f6f176-96aa-4ece-8490-6c2274faae5b" data-elfsight-app-lazy></div>
          </div>

          {/* You Could Be Next CTA */}
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
              You Could Be Next
            </h3>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Every property owner above started exactly where you are now. Make the choice to go from reactive to proactive.
            </p>
            <button
              onClick={() => navigate('/Signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105"
            >
              Start Your Transformation
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Common Questions</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900">{item.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-slate-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us / Origin Story Section */}
      <section id="about" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Our Story</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
              Why We Built the 360° Method
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                The 360° Method was developed by Marcin Micek after managing a 12-door rental portfolio and experiencing
                firsthand how small ignored problems become financial disasters.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                The framework draws from over 15 years of hands-on experience across multiple industries: working construction
                as a teenager, running a painting business through college, 7 years in B2B manufacturing sales, a stint in the
                insurance industry, and currently owning and operating a general contracting company.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Through trial and error, and being my own customer on every rental property I manage, I developed a systematic
                approach that actually works. The 360° Method combines everything I've learned about construction, risk assessment,
                systematic processes, and real-world property management into a framework that <strong>prevents problems rather
                than reacts to them</strong>.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                But this isn't really about me. <strong>It's about your transformation.</strong> I know what it feels like to lie
                awake wondering what's going to break next. I know the pit in your stomach when an unexpected repair bill lands.
                And I know the relief that comes when you finally feel in control.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Property ownership should make you feel confident and capable, not anxious and overwhelmed. When you follow
                this framework, you're not just maintaining a building. You're becoming a more organized, proactive, and
                financially secure version of yourself.
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-5 rounded-r-lg mb-8">
                <p className="text-slate-700 italic mb-3">
                  "I genuinely care about your success. Nothing would make me happier than hearing how this system helped you
                  sleep better at night, save money, or simply feel like a more capable property owner. Your transformation
                  story is why I built this."
                </p>
                <p className="text-sm text-slate-500 mb-0">- Marcin Micek, Founder</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Your Transformation</h4>
                <p className="text-sm text-slate-600">From reactive firefighting to confident, proactive control</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Your Peace of Mind</h4>
                <p className="text-sm text-slate-600">Sleep better knowing nothing is silently becoming a disaster</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Your Success Story</h4>
                <p className="text-sm text-slate-600">I can't wait to hear how this framework changed things for you</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
            Your Property's Future Starts Today
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Make the switch from reactive to proactive property care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={() => navigate('/Signup')}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate(createPageUrl('DemoEntry'))}
              className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Explore Demo First
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Free forever for 1 property • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-100 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png"
                alt="360° Method"
                className="h-6 w-6"
              />
              <span className="font-semibold text-slate-700">360° Method</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#faq" className="hover:text-slate-700">FAQ</a>
              <a href="#about" className="hover:text-slate-700">About Us</a>
              <button onClick={() => navigate('/BecomeOperator')} className="hover:text-slate-700">For Operators</button>
              <button onClick={() => navigate(createPageUrl('DemoEntry'))} className="hover:text-slate-700">Try Demo</button>
              <button onClick={() => navigate('/Login')} className="hover:text-slate-700">Log In</button>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 360° Method. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingSection({ navigate }) {
  const [billingCycle, setBillingCycle] = useState('annual');
  const [expandedSection, setExpandedSection] = useState(null);

  const homeownerPlusPricing = calculateHomeownerPlusPricing(billingCycle);
  const goodPricing = calculateGoodPricing(3, billingCycle);
  const betterPricing = calculateBetterPricing(15, billingCycle);
  const bestPricing = calculateBestPricing(billingCycle);

  const tiers = [
    {
      id: 'free',
      name: 'Scout',
      tagline: 'Free Forever',
      icon: Compass,
      color: '#6B7280',
      price: 0,
      keyFeature: 'Full 360° Method',
      hasAI: false,
      limit: '1 property',
      features: ['1 property (any size)', 'Baseline documentation', 'Inspection checklists', 'Task tracking', 'Cascade risk alerts'],
    },
    {
      id: 'homeowner_plus',
      name: 'Homeowner+',
      tagline: 'AI-Powered',
      icon: Home,
      color: '#3B82F6',
      price: homeownerPlusPricing.monthlyPrice,
      annualPrice: homeownerPlusPricing.annualPrice,
      keyFeature: 'AI insights',
      hasAI: true,
      limit: '1 property',
      popular: true,
      features: ['Everything in Scout', 'AI risk analysis', 'AI cost forecasting', 'AI inspection summaries', 'PDF reports'],
    },
    {
      id: 'good',
      name: 'Pioneer',
      tagline: 'For Investors',
      icon: Flag,
      color: '#28A745',
      price: goodPricing.monthlyPrice,
      annualPrice: goodPricing.annualPrice,
      keyFeature: 'Multi-property AI',
      hasAI: true,
      limit: 'Up to 25 doors',
      priceNote: '+$2/door after 3',
      features: ['Everything in Homeowner+', 'Up to 25 properties/doors', 'Portfolio analytics', 'Multi-property AI insights'],
    },
    {
      id: 'better',
      name: 'Commander',
      tagline: 'Scale Up',
      icon: Star,
      color: '#8B5CF6',
      price: betterPricing.monthlyPrice,
      annualPrice: betterPricing.annualPrice,
      keyFeature: 'Team sharing',
      hasAI: true,
      limit: 'Up to 100 doors',
      priceNote: '+$3/door after 15',
      features: ['Everything in Pioneer', 'Up to 100 doors', 'Share with team members', 'White-label PDF reports'],
    },
    {
      id: 'best',
      name: 'Elite',
      tagline: 'Unlimited',
      icon: Crown,
      color: '#F59E0B',
      price: bestPricing.monthlyPrice,
      annualPrice: bestPricing.annualPrice,
      keyFeature: 'Dedicated support',
      hasAI: true,
      limit: 'Unlimited',
      features: ['Everything in Commander', 'Unlimited properties/doors', 'Multi-user accounts', 'Dedicated account manager'],
    }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
            💰 Simple, Transparent Pricing
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Level of Protection
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual <span className="text-green-500 text-xs ml-1">Save 20%</span>
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards - Mobile: Stack, Desktop: Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            
            return (
              <div 
                key={tier.id}
                className={`relative bg-white rounded-2xl p-4 md:p-5 shadow-sm border-2 transition-all hover:shadow-lg ${
                  tier.popular ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {/* Icon & Name */}
                <div className="text-center mb-3 pt-2">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}15` }}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: tier.color }} />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-slate-900">{tier.name}</h3>
                  <p className="text-xs text-slate-500">{tier.tagline}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-3">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl md:text-3xl font-bold" style={{ color: tier.color }}>
                      ${tier.price}
                    </span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                  {tier.priceNote && (
                    <p className="text-xs text-slate-400 mt-1">{tier.priceNote}</p>
                  )}
                </div>

                {/* Key Feature Badge */}
                <div className="text-center mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 rounded-full px-3 py-1.5">
                    {tier.hasAI && <Brain className="w-3 h-3 text-purple-600" />}
                    <span className="text-slate-700 font-medium">{tier.keyFeature}</span>
                  </span>
                </div>

                {/* Limit */}
                <p className="text-center text-sm text-slate-600 mb-3 font-medium">{tier.limit}</p>

                {/* Features List - Compact */}
                <ul className="space-y-1.5 mb-4 text-xs">
                  {tier.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                  {tier.features.length > 3 && (
                    <li className="text-slate-400 text-xs pl-5">
                      +{tier.features.length - 3} more
                    </li>
                  )}
                </ul>

                {/* CTA Button */}
                {tier.id === 'free' ? (
                  <button
                    onClick={() => navigate('/Signup')}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all text-white"
                    style={{ backgroundColor: tier.color }}
                  >
                    Start Free
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/Signup')}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all border-2 hover:bg-slate-50"
                    style={{ borderColor: tier.color, color: tier.color }}
                  >
                    Get Started
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Learn More Dropdowns */}
        <div className="max-w-3xl mx-auto space-y-3">
          
          {/* AI Features */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleSection('ai')}
              className="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-semibold text-slate-900 text-sm md:text-base">What does AI do?</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'ai' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'ai' && (
              <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 md:gap-3 pt-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-xs md:text-sm">Cascade Alerts</span>
                    </div>
                    <p className="text-xs text-slate-600">Prevent $10K disasters with $200 fixes</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-xs md:text-sm">Cost Forecasting</span>
                    </div>
                    <p className="text-xs text-slate-600">Budget accurately with no surprises</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-xs md:text-sm">Smart Priority</span>
                    </div>
                    <p className="text-xs text-slate-600">Know what to fix first</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-xs md:text-sm">Spending Insights</span>
                    </div>
                    <p className="text-xs text-slate-600">Spend 30-40% less on maintenance</p>
                  </div>
                </div>
                <div className="mt-3 bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <p className="text-xs text-purple-900">
                    <strong>Result:</strong> Users prevent an average of $8,400 in disasters per year.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleSection('compare')}
              className="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-900 text-sm md:text-base">Compare all features</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'compare' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'compare' && (
              <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-xs mt-4 min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 font-semibold text-slate-700">Feature</th>
                      {tiers.map(t => (
                        <th key={t.id} className="text-center py-2 font-semibold" style={{ color: t.color }}>
                          {t.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Properties', values: ['1', '1', '25', '100', '∞'] },
                      { name: 'AI Insights', values: [false, true, true, true, true] },
                      { name: 'Cascade Alerts', values: ['Basic', 'AI', 'AI', 'AI', 'AI'] },
                      { name: 'PDF Reports', values: [false, true, true, true, true] },
                      { name: 'Portfolio Analytics', values: [false, false, true, true, true] },
                      { name: 'Team Sharing', values: [false, false, false, true, true] },
                      { name: 'Multi-user', values: [false, false, false, false, true] },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">{row.name}</td>
                        {row.values.map((val, i) => (
                          <td key={i} className="text-center py-2">
                            {typeof val === 'boolean' ? (
                              val ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                            ) : (
                              <span className="font-medium">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleSection('faq')}
              className="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                </div>
                <span className="font-semibold text-slate-900 text-sm md:text-base">Pricing FAQ</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'faq' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'faq' && (
              <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <p className="font-semibold text-sm text-slate-900 mb-1">What's a "door"?</p>
                  <p className="text-xs text-slate-600">A unit with its own kitchen. House = 1 door. Duplex = 2 doors. 12-unit building = 12 doors.</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 mb-1">Can I switch plans later?</p>
                  <p className="text-xs text-slate-600">Yes! Upgrade or downgrade anytime. Your data always stays intact.</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 mb-1">What's the difference between free and paid?</p>
                  <p className="text-xs text-slate-600">Scout gives you the complete 360° Method framework. Homeowner+ adds AI-powered insights that automatically analyze your property, predict costs, and catch problems before they become expensive.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/Signup')}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg"
          >
            Start Free Today
          </button>
          <p className="text-sm text-slate-500 mt-3">No credit card required</p>
        </div>

      </div>
    </section>
  );
}

function determineUserType(user) {
  if (user.role === 'admin') return 'admin';
  if (user.is_operator || user.operator_id) return 'operator';
  if (user.is_contractor || user.contractor_id) return 'contractor';
  if (user.user_profile_type === 'investor' || user.property_use_type === 'rental') return 'investor';
  return 'homeowner';
}

function getDashboardRoute(userType) {
  const routes = {
    admin: createPageUrl('AdminDashboard'),
    operator: createPageUrl('OperatorDashboard'),
    contractor: createPageUrl('ContractorDashboard'),
    investor: createPageUrl('DashboardInvestor'),
    homeowner: createPageUrl('Dashboard')
  };
  return routes[userType] || createPageUrl('Dashboard');
}
