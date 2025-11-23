import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, ArrowRight, Shield, TrendingUp, Award, Briefcase } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="360° Method Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          
          <p className="text-base md:text-lg font-semibold mb-8 tracking-wide" style={{ color: '#6B5A3D' }}>
            Own with Confidence. Build with Purpose. Grow with Strategy.
          </p>
          
          {/* Transformation-First Hero */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            How To Stop Worrying About Your Home Breaking Down And Start Building Wealth
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
            Most property owners are one surprise away from a $10,000 emergency. See how the 3-phase system prevents this.
          </p>
          
          <button
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors mb-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ minHeight: '60px', minWidth: '280px' }}
          >
            Explore Demo Properties
          </button>
          
          <p className="text-sm text-gray-500 mb-12">
            No sign-up • Real examples • Choose your path
          </p>
        </div>
        
        {/* 4 Transformation-First Demo Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          
          {/* Card 1 - The Overwhelmed Owner */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">The Overwhelmed Owner</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-red-600 mb-1">Current State:</p>
                    <p className="text-gray-700">"I have no idea what's about to break"</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-1">Dream State:</p>
                    <p className="text-gray-700">"Nothing surprises you anymore"</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Journey: See transformation (62 → 80)
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - The Organized Owner */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">The Organized Owner</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-orange-600 mb-1">Current State:</p>
                    <p className="text-gray-700">"I maintain, but could do better"</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-1">Dream State:</p>
                    <p className="text-gray-700">"Systems last 30% longer, home worth 5% more"</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Journey: See the upgrade (78 → 85)
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - The Elite Owner */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">The Elite Owner</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-1">Current State:</p>
                    <p className="text-gray-700">"My home is dialed in"</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-1">Dream State:</p>
                    <p className="text-gray-700">"Maintain excellence effortlessly"</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Journey: See elite maintenance (92)
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - The Portfolio Builder */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">The Portfolio Builder</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-purple-600 mb-1">Current State:</p>
                    <p className="text-gray-700">"Tired of emergency calls and chaos"</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-1">Dream State:</p>
                    <p className="text-gray-700">"Professional operation, phone stops buzzing"</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Journey: See portfolio control (3 properties, 79 avg)
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}