import React, { useState } from 'react';
import { Check, X, Brain, Shield, Users, Share2, Compass, Flag, Star, Crown, Home, ChevronDown, Zap, TrendingUp, BarChart3, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  calculateHomeownerPlusPricing, 
  calculateGoodPricing, 
  calculateBetterPricing, 
  calculateBestPricing,
  getTierConfig 
} from '../shared/TierCalculator';

export default function PricingSection() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('annual');
  const [expandedSection, setExpandedSection] = useState(null);

  const homeownerPlusPricing = calculateHomeownerPlusPricing(billingCycle);
  const goodPricing = calculateGoodPricing(3, billingCycle); // Base pricing for 3 doors
  const betterPricing = calculateBetterPricing(15, billingCycle); // Base pricing for 15 doors
  const bestPricing = calculateBestPricing(billingCycle);

  const tiers = [
    {
      id: 'free',
      name: 'Scout',
      tagline: 'Free Forever',
      icon: Compass,
      color: '#6B7280',
      price: 0,
      bestFor: 'Getting started',
      keyFeature: 'Full 360° Method',
      hasAI: false,
      limit: '1 property',
      features: ['1 property (any size)', 'Baseline documentation', 'Inspection checklists', 'Task tracking', 'Cascade risk alerts'],
      notIncluded: ['AI insights', 'PDF reports']
    },
    {
      id: 'homeowner_plus',
      name: 'Homeowner+',
      tagline: 'AI-Powered',
      icon: Home,
      color: '#3B82F6',
      price: homeownerPlusPricing.monthlyPrice,
      annualPrice: homeownerPlusPricing.annualPrice,
      bestFor: 'Homeowners',
      keyFeature: 'AI insights',
      hasAI: true,
      limit: '1 property',
      popular: true,
      features: ['Everything in Scout', 'AI risk analysis', 'AI cost forecasting', 'AI inspection summaries', 'PDF reports'],
      notIncluded: ['Multiple properties', 'Portfolio analytics']
    },
    {
      id: 'good',
      name: 'Pioneer',
      tagline: 'For Investors',
      icon: Flag,
      color: '#28A745',
      price: goodPricing.monthlyPrice,
      annualPrice: goodPricing.annualPrice,
      bestFor: 'Small portfolios',
      keyFeature: 'Multi-property AI',
      hasAI: true,
      limit: 'Up to 25 doors',
      priceNote: '+$2/door after 3',
      features: ['Everything in Homeowner+', 'Up to 25 properties/doors', 'Portfolio analytics', 'Multi-property AI insights'],
      notIncluded: ['Team sharing', 'White-label reports']
    },
    {
      id: 'better',
      name: 'Commander',
      tagline: 'Scale Up',
      icon: Star,
      color: '#8B5CF6',
      price: betterPricing.monthlyPrice,
      annualPrice: betterPricing.annualPrice,
      bestFor: 'Growing portfolio',
      keyFeature: 'Team sharing',
      hasAI: true,
      limit: 'Up to 100 doors',
      priceNote: '+$3/door after 15',
      features: ['Everything in Pioneer', 'Up to 100 doors', 'Share with team members', 'White-label PDF reports', 'AI portfolio comparison'],
      notIncluded: ['Unlimited doors', 'Dedicated manager']
    },
    {
      id: 'best',
      name: 'Elite',
      tagline: 'Unlimited',
      icon: Crown,
      color: '#F59E0B',
      price: bestPricing.monthlyPrice,
      annualPrice: bestPricing.annualPrice,
      bestFor: 'Property managers',
      keyFeature: 'Dedicated support',
      hasAI: true,
      limit: 'Unlimited',
      features: ['Everything in Commander', 'Unlimited properties/doors', 'Multi-user accounts', 'Custom AI reporting', 'Dedicated account manager', 'Phone support (4hr)'],
      notIncluded: []
    }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <section id="pricing" className="py-24 bg-slate-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
            💰 Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Level of Protection
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual <span className="text-green-500 text-xs ml-1">Save 20%</span>
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            
            return (
              <div 
                key={tier.id}
                className={`relative bg-white rounded-2xl p-5 shadow-sm border-2 transition-all hover:shadow-lg ${
                  tier.popular ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {/* Icon & Name */}
                <div className="text-center mb-4 pt-2">
                  <div 
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tier.color }} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                  <p className="text-xs text-slate-500">{tier.tagline}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold" style={{ color: tier.color }}>
                      ${tier.price}
                    </span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                  {tier.priceNote && (
                    <p className="text-xs text-slate-400 mt-1">{tier.priceNote}</p>
                  )}
                  {billingCycle === 'annual' && tier.annualPrice && (
                    <p className="text-xs text-slate-500 mt-1">
                      Billed ${tier.annualPrice}/yr
                    </p>
                  )}
                </div>

                {/* Key Feature Badge */}
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 rounded-full px-3 py-1.5">
                    {tier.hasAI && <Brain className="w-3 h-3 text-purple-600" />}
                    <span className="text-slate-700 font-medium">{tier.keyFeature}</span>
                  </span>
                </div>

                {/* Limit */}
                <p className="text-center text-sm text-slate-600 mb-4 font-medium">{tier.limit}</p>

                {/* Features List - Compact */}
                <ul className="space-y-2 mb-5 text-xs">
                  {tier.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                  {tier.features.length > 4 && (
                    <li className="text-slate-400 text-xs pl-6">
                      +{tier.features.length - 4} more
                    </li>
                  )}
                </ul>

                {/* CTA Button */}
                {tier.id === 'free' ? (
                  <button
                    onClick={() => navigate('/Signup')}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all text-white"
                    style={{ backgroundColor: tier.color }}
                  >
                    Start Free
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/Signup')}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all border-2 hover:bg-slate-50"
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
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-semibold text-slate-900">What does AI do?</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'ai' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'ai' && (
              <div className="px-5 pb-5 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-sm">Cascade Alerts</span>
                    </div>
                    <p className="text-xs text-slate-600">Prevent $10K disasters with $200 fixes</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-sm">Cost Forecasting</span>
                    </div>
                    <p className="text-xs text-slate-600">Budget accurately with no surprises</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-sm">Smart Priority</span>
                    </div>
                    <p className="text-xs text-slate-600">Know what to fix first</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-sm">Spending Insights</span>
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
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-900">Compare all features</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'compare' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'compare' && (
              <div className="px-5 pb-5 border-t border-slate-100 overflow-x-auto">
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
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                </div>
                <span className="font-semibold text-slate-900">Pricing FAQ</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'faq' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'faq' && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
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
                  <p className="text-xs text-slate-600">Scout gives you the complete 360° Method framework. Homeowner+ adds AI-powered insights that analyze your property, predict costs, and catch problems before they become expensive.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
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

