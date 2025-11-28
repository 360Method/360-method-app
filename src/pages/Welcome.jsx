import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, X, Star, ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
              Trusted by 400+ property owners protecting $180M+ in real estate
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
                Know exactly what to fix and when—prioritized by urgency and cost impact. Do it yourself or hire help.
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

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-12">
            Real Transformations
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xl font-bold text-slate-600">
                  S
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah M.</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-slate-700 mb-4 leading-relaxed">
                "Caught a small roof leak during my first inspection that would've cost thousands later. The peace of mind alone is worth 10x what I pay."
              </blockquote>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Constant worry → Complete confidence</span>
                <span className="bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">$4,200 saved</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xl font-bold text-slate-600">
                  J
                </div>
                <div>
                  <div className="font-semibold text-slate-900">James K.</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-slate-700 mb-4 leading-relaxed">
                "I manage 8 rentals. Since the 360° Method, maintenance costs are down 30% and emergency calls have virtually stopped. My phone doesn't buzz at 2am anymore."
              </blockquote>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Firefighting → Systematic control</span>
                <span className="bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">30% cost reduction</span>
              </div>
            </div>
          </div>

          {/* Case Study Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 md:p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              The $9,500 Difference
            </h3>
            <p className="text-white/90 mb-6">
              5-year cost comparison: Reactive approach vs. 360° Method
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-6 text-white">
                <div>
                  <div className="text-sm opacity-80 mb-1">Reactive</div>
                  <div className="text-2xl md:text-3xl font-bold">$19,350</div>
                </div>
                <div>
                  <div className="text-sm opacity-80 mb-1">360° Method</div>
                  <div className="text-2xl md:text-3xl font-bold">$9,850</div>
                </div>
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
            Join 400+ property owners who've made the switch from reactive to proactive.
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
              <button onClick={() => navigate(createPageUrl('Pricing'))} className="hover:text-slate-700">Pricing</button>
              <button onClick={() => navigate(createPageUrl('Resources'))} className="hover:text-slate-700">Resources</button>
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
