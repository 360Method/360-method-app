import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Sparkles, Shield, TrendingUp, Clock } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function Waitlist() {
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip_code: '',
    property_type: 'homecare',
    notes: '',
    source: source || 'waitlist_page'
  });
  const [submitted, setSubmitted] = useState(false);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const submitWaitlistMutation = useMutation({
    mutationFn: (data) => base44.entities.Waitlist.create(data),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitWaitlistMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            You're In! Welcome to the 360° Method Community 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 text-center">
            Check your inbox in the next 5 minutes for your first framework lesson.
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-4 text-lg">What Happens Next:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <div>
                  <div className="font-semibold text-gray-900">Today: Welcome Email + Framework Guide</div>
                  <div className="text-sm text-gray-600">Your first lesson: Understanding the 3×3 Framework (AWARE → ACT → ADVANCE)</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <div>
                  <div className="font-semibold text-gray-900">Day 3: The Cascade Failure Prevention Guide</div>
                  <div className="text-sm text-gray-600">Learn the 12 most dangerous areas where small problems become expensive disasters</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <div>
                  <div className="font-semibold text-gray-900">Day 7: Real Homeowner Case Study</div>
                  <div className="text-sm text-gray-600">How the Martinez family saved $12,400 in Year 1 using the 360° Method</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                <div>
                  <div className="font-semibold text-gray-900">Day 14: Your Climate Zone Playbook</div>
                  <div className="text-sm text-gray-600">Custom maintenance calendar for {formData.zip_code ? 'your area' : 'Pacific Northwest homes'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
                <div>
                  <div className="font-semibold text-green-900">Launch Day: First Access Invitation</div>
                  <div className="text-sm text-gray-600">You'll be in the first group invited when the 360° Asset Command Center goes live</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-purple-900 mb-3">🎓 Start Learning the Framework Now:</h3>
            <p className="text-purple-800 mb-4">
              While you wait for launch, master the methodology that's already protecting over 400 properties worth $180M+ in combined value.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-blue-900 mb-2">📊 PHASE I: AWARE</div>
                <div className="text-gray-600">Baseline → Inspect → Track</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-orange-900 mb-2">⚡ PHASE II: ACT</div>
                <div className="text-gray-600">Prioritize → Schedule → Execute</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-green-900 mb-2">🚀 PHASE III: ADVANCE</div>
                <div className="text-gray-600">Preserve → Upgrade → Scale</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/demo"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Explore the Demo Again
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-medium transition-colors"
            >
              Back to Home
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              You're one of <strong className="text-gray-900">{Math.floor(Math.random() * 50) + 450} homeowners</strong> on the waitlist
            </p>
          </div>
        </div>
      </div>
    );
  }

  const scrollToForm = () => {
    const formElement = document.getElementById('waitlist-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Early Access • Founding Members Only
          </div>
          
          {source === 'full-service' ? (
            <>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                We'll Handle Everything<br />For You
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join the waitlist for our full-service concierge option. 
                You focus on your life—we'll protect your property.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Master the 360° Method<br />Before Launch
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join the waitlist for the 360° Asset Command Center and start learning 
                the framework that prevents cascade failures and protects your property value.
              </p>
            </>
          )}
        </div>

        {/* Form Section - Moved to top */}
        <div id="waitlist-form" className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Join the Waitlist
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  placeholder="Smith"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                placeholder="(555) 123-4567"
              />
              <p className="text-xs text-gray-500 mt-1">We'll only text you for launch updates (never spam)</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                required
                pattern="[0-9]{5}"
                maxLength="5"
                value={formData.zip_code}
                onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                placeholder="98661"
              />
              <p className="text-xs text-gray-500 mt-1">We'll send you climate-specific maintenance tips for your area</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                I'm a... *
              </label>
              <select
                required
                value={formData.property_type}
                onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              >
                <option value="homecare">Homeowner (primary residence)</option>
                <option value="propertycare">Real Estate Investor (rental properties)</option>
                <option value="property-manager">Property Manager</option>
                <option value="both">Both homeowner and investor</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={submitWaitlistMutation.isPending}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitWaitlistMutation.isPending ? 'Joining...' : 'Join Waitlist & Start Learning'}
              {!submitWaitlistMutation.isPending && <ArrowRight className="w-5 h-5" />}
            </button>
            
            <p className="text-xs text-center text-gray-500">
              We respect your privacy. Unsubscribe anytime. No spam, ever.
            </p>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            The 360° Method: 9 Steps to Confident Property Ownership
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">I</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">AWARE</h3>
              <p className="text-blue-800 mb-4 text-sm">Know your property inside and out</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-gray-900">Baseline</div>
                    <div className="text-gray-600">Document all major systems</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-gray-900">Inspect</div>
                    <div className="text-gray-600">Seasonal walkthroughs</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-gray-900">Track</div>
                    <div className="text-gray-600">Log all maintenance history</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">II</div>
              <h3 className="text-2xl font-bold text-orange-900 mb-3">ACT</h3>
              <p className="text-orange-800 mb-4 text-sm">Fix problems before they cascade</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</div>
                  <div>
                    <div className="font-semibold text-gray-900">Prioritize</div>
                    <div className="text-gray-600">AI-powered risk scoring</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">5</div>
                  <div>
                    <div className="font-semibold text-gray-900">Schedule</div>
                    <div className="text-gray-600">Strategic maintenance planning</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">6</div>
                  <div>
                    <div className="font-semibold text-gray-900">Execute</div>
                    <div className="text-gray-600">Complete with proof photos</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">III</div>
              <h3 className="text-2xl font-bold text-green-900 mb-3">ADVANCE</h3>
              <p className="text-green-800 mb-4 text-sm">Build long-term property value</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">7</div>
                  <div>
                    <div className="font-semibold text-gray-900">Preserve</div>
                    <div className="text-gray-600">Extend system lifespans</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">8</div>
                  <div>
                    <div className="font-semibold text-gray-900">Upgrade</div>
                    <div className="text-gray-600">Strategic improvements</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">9</div>
                  <div>
                    <div className="font-semibold text-gray-900">Scale</div>
                    <div className="text-gray-600">Portfolio CFO intelligence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="font-bold text-purple-900 mb-4 text-lg">Why the 360° Method Works:</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Prevents Cascade Failures</div>
                  <div className="text-gray-600">Small $200 problems don't become $18,000 disasters</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Preserves Property Value</div>
                  <div className="text-gray-600">Well-maintained homes appreciate 3-5% faster</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Saves Time & Stress</div>
                  <div className="text-gray-600">No more emergencies, no more reactive chaos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">First Access</h3>
            <p className="text-sm text-gray-600">
              Be among the first 100 users when the 360° Asset Command Center launches
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Learn While You Wait</h3>
            <p className="text-sm text-gray-600">
              4-part email series teaching you the 360° Method before you even log in
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Founding Member Pricing</h3>
            <p className="text-sm text-gray-600">
              Lock in exclusive launch pricing that never increases
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <p className="text-gray-600 mb-4">
            Join <strong className="text-gray-900">487 homeowners</strong> already on the waitlist
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant framework access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>

        {/* Scroll to Form Button */}
        <div className="text-center mt-16">
          <button
            onClick={scrollToForm}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            Join the Waitlist Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}