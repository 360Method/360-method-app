import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Shield, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";

export default function OnboardingWelcome({ onNext, user }) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-700">
      {/* Hero Section */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome to the</h1>
              <h1 className="text-3xl md:text-4xl font-bold">360° Method</h1>
            </div>
          </div>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
            {user?.full_name ? `Hi ${user.full_name.split(' ')[0]}! ` : ''}
            Transform how you manage your property. Save thousands in avoided disasters, 
            plan years ahead with confidence, and unlock your home's full potential.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Shield className="w-8 h-8 mb-2 text-green-300" />
              <p className="font-bold text-lg mb-1">Prevent Disasters</p>
              <p className="text-sm text-blue-100">$25K-50K in avoided emergencies</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <DollarSign className="w-8 h-8 mb-2 text-yellow-300" />
              <p className="font-bold text-lg mb-1">Budget Smart</p>
              <p className="text-sm text-blue-100">Plan 2-5 years ahead</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <TrendingUp className="w-8 h-8 mb-2 text-blue-300" />
              <p className="font-bold text-lg mb-1">Boost Value</p>
              <p className="text-sm text-blue-100">$8K-15K higher sale price</p>
            </div>
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="w-full md:w-auto gap-3 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            style={{ backgroundColor: '#28A745', minHeight: '64px', paddingLeft: '32px', paddingRight: '32px' }}
          >
            <Sparkles className="w-6 h-6" />
            Let's Get Started
            <ArrowRight className="w-6 h-6" />
          </Button>
        </CardContent>
      </Card>

      {/* What You'll Accomplish */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold" style={{ color: '#1B365D' }}>
              What You'll Accomplish in the Next 5 Minutes
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Tell Us About Your Goals</h3>
                <p className="text-sm text-gray-600">
                  Are you managing your home or building an investment portfolio? We'll tailor your experience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Add Your First Property</h3>
                <p className="text-sm text-gray-600">
                  Quick address verification and we'll check if 360° Operator services are available in your area.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Choose Your Documentation Path</h3>
                <p className="text-sm text-gray-600">
                  Quick AI wizard, physical walkthrough, or explore at your own pace—your choice!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  ⚡ Time Investment: 5 minutes now saves you thousands later
                </p>
                <p className="text-xs text-orange-800">
                  Every minute you invest in setup prevents hours of emergency stress and costly surprises down the road.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof / Testimonial */}
      <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💬</div>
            <div>
              <p className="text-lg italic text-gray-700 mb-3">
                "I wish I had this 5 years ago. The 360° Method helped me catch a $15,000 HVAC disaster 
                before it happened. I scheduled the replacement on my timeline and saved over $8,000."
              </p>
              <p className="text-sm font-semibold text-gray-900">
                — Sarah M., Homeowner
              </p>
              <p className="text-xs text-gray-500">Portland, OR • 1 property</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}