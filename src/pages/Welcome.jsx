import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, TrendingUp, Shield, Users, Zap, Home, Building2, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Welcome() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    checkAuthAndRoute();
  }, []);
  
  const checkAuthAndRoute = async () => {
    try {
      const user = await base44.auth.me();
      
      if (user) {
        if (!user.onboarding_completed) {
          navigate(createPageUrl('Onboarding'), { replace: true });
          return;
        }
        
        const userType = determineUserType(user);
        const dashboard = getDashboardRoute(userType);
        navigate(dashboard, { replace: true });
        return;
      }
      
      setIsCheckingAuth(false);
    } catch (e) {
      setIsCheckingAuth(false);
    }
  };
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - ClickFunnels Style */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-blue-50 pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Trust Bar */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Join 10,000+ Property Owners</span>
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Stop Worrying About<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Surprise $10K Repairs
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
              The 360° Method helps property owners prevent emergencies, extend asset life, and build real wealth.
            </p>
            
            <p className="text-lg text-gray-600 mb-10">
              Finally, a system that tells you exactly what to maintain, when to maintain it, and how much it really costs—before disaster strikes.
            </p>
            
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="group px-10 py-5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                Start Your Free Account
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate(createPageUrl('DemoEntry'))}
                className="px-10 py-5 bg-white text-gray-800 border-2 border-gray-300 rounded-xl hover:border-gray-400 font-bold text-xl transition-all shadow-lg"
              >
                See How It Works
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              ✓ Free forever for 1 property &nbsp;•&nbsp; ✓ No credit card required &nbsp;•&nbsp; ✓ Get started in 60 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Trusted By Property Owners Nationwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="text-2xl font-bold text-gray-400">10,000+</div>
            <div className="text-2xl font-bold text-gray-400">Properties</div>
            <div className="text-2xl font-bold text-gray-400">$50M+</div>
            <div className="text-2xl font-bold text-gray-400">Protected</div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            
            {/* Without 360° */}
            <div>
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
                Without 360° Method
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Reactive, Stressful, & Expensive
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 font-bold">✕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Surprise $10K+ emergencies</p>
                    <p className="text-gray-600 text-sm">Water heater dies. HVAC fails. Roof leaks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 font-bold">✕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">No idea what needs attention</p>
                    <p className="text-gray-600 text-sm">Guessing which systems are at risk.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 font-bold">✕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Property value declining</p>
                    <p className="text-gray-600 text-sm">Deferred maintenance costs you equity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 font-bold">✕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Constant worry & stress</p>
                    <p className="text-gray-600 text-sm">"What's going to break next?"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* With 360° */}
            <div>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                With 360° Method
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Proactive, Confident, & Profitable
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Prevent 80% of emergencies</p>
                    <p className="text-gray-600 text-sm">Catch issues early, save thousands.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Know exactly what to maintain</p>
                    <p className="text-gray-600 text-sm">AI-powered schedule personalized to your property.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Increase property value 5-7%</p>
                    <p className="text-gray-600 text-sm">Well-maintained homes sell for premium.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Sleep easy every night</p>
                    <p className="text-gray-600 text-sm">Everything is tracked, nothing is forgotten.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need To Protect Your Property
            </h2>
            <p className="text-xl text-gray-600">
              The complete system for stress-free property ownership
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Baseline Assessment
              </h3>
              <p className="text-gray-600 mb-4">
                Document every system, know their age and condition. Get a complete picture in minutes.
              </p>
              <button 
                onClick={() => navigate(createPageUrl('DemoEntry'))}
                className="text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-2"
              >
                See it in action <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI-Powered Maintenance Calendar
              </h3>
              <p className="text-gray-600 mb-4">
                Never miss maintenance again. Get personalized schedules based on your systems and climate.
              </p>
              <button 
                onClick={() => navigate(createPageUrl('DemoEntry'))}
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2"
              >
                Explore the calendar <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Replacement Forecasting
              </h3>
              <p className="text-gray-600 mb-4">
                Know what's coming and when. Budget intelligently with 5-year expense forecasts.
              </p>
              <button 
                onClick={() => navigate(createPageUrl('DemoEntry'))}
                className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2"
              >
                See forecasting <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Persona Journeys Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              See Your Journey
            </h2>
            <p className="text-xl text-gray-600">
              Choose the path that matches where you are today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            <button
              onClick={() => navigate(createPageUrl('DemoEntry') + '?score=struggling')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-orange-500 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                  <Home className="w-7 h-7 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">62</div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Overwhelmed Owner</h3>
              <p className="text-gray-600 mb-4">"I have no idea what's about to break"</p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all">
                See transformation journey <ArrowRight className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => navigate(createPageUrl('DemoEntry') + '?score=improving')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-blue-500 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">78</div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Organized Owner</h3>
              <p className="text-gray-600 mb-4">"I maintain, but could do better"</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                See upgrade journey <ArrowRight className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => navigate(createPageUrl('DemoEntry') + '?score=excellent')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-green-500 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">92</div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Elite Owner</h3>
              <p className="text-gray-600 mb-4">"My home is dialed in"</p>
              <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                See elite system <ArrowRight className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => navigate(createPageUrl('DemoEntry') + '?score=portfolio')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-purple-500 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">79</div>
                  <div className="text-xs text-gray-500">Portfolio Avg</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Portfolio Builder</h3>
              <p className="text-gray-600 mb-4">"Tired of emergency calls"</p>
              <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                See portfolio control <ArrowRight className="w-5 h-5" />
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Property Owners, Real Results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Caught my HVAC system before it died. Saved me $8,000 in emergency repairs. This system pays for itself."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-200"></div>
                <div>
                  <p className="font-bold text-gray-900">Michael R.</p>
                  <p className="text-sm text-gray-600">Dallas, TX</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "As a landlord with 4 rentals, this changed everything. No more surprise calls at midnight."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-200"></div>
                <div>
                  <p className="font-bold text-gray-900">Sarah K.</p>
                  <p className="text-sm text-gray-600">Phoenix, AZ</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "My home appraised 6% higher than comps because of the maintenance records. Worth every penny."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-200"></div>
                <div>
                  <p className="font-bold text-gray-900">David L.</p>
                  <p className="text-sm text-gray-600">Seattle, WA</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready To Stop Worrying?
          </h2>
          <p className="text-xl text-orange-100 mb-10">
            Join 10,000+ property owners who sleep better at night
          </p>
          
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="group px-12 py-6 bg-white text-orange-600 rounded-xl hover:bg-gray-50 font-black text-2xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-flex items-center gap-3"
          >
            Start Your Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="text-orange-100 mt-6">
            ✓ Free forever for 1 property &nbsp;•&nbsp; ✓ Setup in 60 seconds &nbsp;•&nbsp; ✓ No credit card required
          </p>
        </div>
      </div>

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