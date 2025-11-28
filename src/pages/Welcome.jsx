import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, X, Star, ChevronDown, ChevronUp, HelpCircle, Heart, Users, Target, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

const FAQ_ITEMS = [
  {
    question: "Is the 360° Method really free?",
    answer: "Yes! The 360° Method is free forever for your first property. We believe everyone deserves access to proactive property care. For homeowners with multiple properties, we offer affordable Pro plans with additional features."
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
