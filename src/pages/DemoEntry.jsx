import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Eye, Zap, TrendingUp, ArrowRight, Sparkles, Shield, 
  DollarSign, CheckCircle2, Target, Clock 
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useDemo } from '../components/shared/DemoContext';

export default function DemoEntry() {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemo();

  const handleEnterDemo = () => {
    enterDemoMode();
    navigate(createPageUrl('Dashboard'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <Badge className="bg-blue-600 text-white text-sm px-4 py-2 mb-4">
              No Login Required • Fully Interactive
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#1B365D' }}>
            See Property Maintenance Done Right
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Explore a fully documented home with the 360° Method—no signup required
          </p>
          
          <Button
            onClick={handleEnterDemo}
            size="lg"
            className="gap-3 text-lg px-8 py-6 shadow-2xl"
            style={{ backgroundColor: '#FF6B35', minHeight: '64px' }}
          >
            <Sparkles className="w-6 h-6" />
            Jump Into Demo Property
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Quick Value Props */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Prevent $5K+ Disasters
              </h3>
              <p className="text-gray-600">
                Catch $50 problems before they cascade into expensive emergencies
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-300 shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Save $27K-$72K
              </h3>
              <p className="text-gray-600">
                Average homeowner savings over 10-15 years through prevention
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
                Track 9 Key Systems
              </h3>
              <p className="text-gray-600">
                Monitor the systems that cause 87% of expensive failures
              </p>
            </CardContent>
          </Card>
        </div>

        {/* The 360° Method Explainer */}
        <Card className="border-2 border-indigo-300 bg-white shadow-2xl mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl md:text-3xl" style={{ color: '#1B365D' }}>
              The 360° Method: Your 3×3 Framework
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              A proven system for property owners and investors
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phase I - AWARE */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-2 text-xl">
                    Phase I: AWARE
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Know what you have.</strong> Document every system, inspect regularly, and track all maintenance.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📝</span>
                        <p className="font-semibold text-sm">1. Baseline</p>
                      </div>
                      <p className="text-xs text-gray-600">Document all major systems</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔍</span>
                        <p className="font-semibold text-sm">2. Inspect</p>
                      </div>
                      <p className="text-xs text-gray-600">Quarterly walkthroughs</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <p className="font-semibold text-sm">3. Track</p>
                      </div>
                      <p className="text-xs text-gray-600">Automatic history logging</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase II - ACT */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-orange-900 mb-2 text-xl">
                    Phase II: ACT
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Make smart decisions.</strong> Prioritize what matters, schedule strategically, execute before disasters.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎯</span>
                        <p className="font-semibold text-sm">4. Prioritize</p>
                      </div>
                      <p className="text-xs text-gray-600">AI risk scoring</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📅</span>
                        <p className="font-semibold text-sm">5. Schedule</p>
                      </div>
                      <p className="text-xs text-gray-600">Strategic timing</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">✅</span>
                        <p className="font-semibold text-sm">6. Execute</p>
                      </div>
                      <p className="text-xs text-gray-600">DIY guides & tracking</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase III - ADVANCE */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-2 text-xl">
                    Phase III: ADVANCE
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Build long-term value.</strong> Extend system lifespans, strategic upgrades, portfolio growth.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🛡️</span>
                        <p className="font-semibold text-sm">7. Preserve</p>
                      </div>
                      <p className="text-xs text-gray-600">Extend system life 3-15 years</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">💡</span>
                        <p className="font-semibold text-sm">8. Upgrade</p>
                      </div>
                      <p className="text-xs text-gray-600">High ROI improvements</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🏢</span>
                        <p className="font-semibold text-sm">9. Scale</p>
                      </div>
                      <p className="text-xs text-gray-600">Portfolio CFO intelligence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* The Result */}
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-300">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-900 mb-1">The Result:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Prevent $25K-50K+ in disasters</strong> • <strong>Add $8K-15K to resale value</strong> •
                    <strong> Budget 2-5 years ahead</strong> • <strong>Save 30%+ on maintenance costs</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Property Preview */}
        <Card className="border-2 border-blue-400 shadow-2xl mb-12">
          <CardHeader>
            <CardTitle className="text-center" style={{ color: '#1B365D' }}>
              🏡 Demo Property: 2847 Maple Grove Ln, Vancouver WA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 mb-1">16</p>
                <p className="text-sm text-gray-600">Systems Documented</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600 mb-1">8</p>
                <p className="text-sm text-gray-600">Tasks Prioritized</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600 mb-1">78/100</p>
                <p className="text-sm text-gray-600">Health Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600 mb-1">$7.2K</p>
                <p className="text-sm text-gray-600">Disasters Prevented</p>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleEnterDemo}
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                style={{ minHeight: '56px' }}
              >
                <Eye className="w-5 h-5" />
                Explore This Property Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How Demo Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#1B365D' }}>
            How the Demo Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Click Around</h3>
              <p className="text-sm text-gray-600">
                Everything is functional—navigate through all 9 steps, view systems, tasks, and insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">See Real Data</h3>
              <p className="text-sm text-gray-600">
                Realistic property example with actual baseline documentation, maintenance history, and AI insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">No Commitment</h3>
              <p className="text-sm text-gray-600">
                Explore at your own pace—create an account only when you're ready to track your own property
              </p>
            </div>
          </div>
        </div>

        {/* What You'll See */}
        <Card className="border-2 border-indigo-300 bg-white shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-center" style={{ color: '#1B365D' }}>
              What You'll Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Complete Baseline Documentation</p>
                  <p className="text-sm text-gray-600">16 systems with photos, ages, condition tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">AI-Powered Prioritization</p>
                  <p className="text-sm text-gray-600">Cascade risk analysis & cost estimates on all tasks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Seasonal Inspection History</p>
                  <p className="text-sm text-gray-600">See how quarterly walkthroughs catch problems early</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Strategic Preservation Plan</p>
                  <p className="text-sm text-gray-600">Life-extension interventions with 3x+ ROI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Maintenance Wins Dashboard</p>
                  <p className="text-sm text-gray-600">$7,200 in prevented costs already tracked</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">10-Year Wealth Projection</p>
                  <p className="text-sm text-gray-600">Portfolio CFO analytics and equity tracking</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-300">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1B365D' }}>
            Ready to Track Your Own Property?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create a free account in 30 seconds and start preventing disasters, building wealth, and sleeping soundly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/'}
              size="lg"
              className="gap-2 bg-green-600 hover:bg-green-700"
              style={{ minHeight: '56px' }}
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleEnterDemo}
              size="lg"
              variant="outline"
              className="gap-2"
              style={{ minHeight: '56px' }}
            >
              <Eye className="w-5 h-5" />
              Keep Exploring Demo
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}