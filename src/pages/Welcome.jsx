import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2 } from 'lucide-react';
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
          
          {/* Simple Hero Message */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Home Maintenance is<br />
            3 Simple Phases:
          </h1>
          
          <div className="text-xl md:text-2xl text-gray-700 space-y-2 mb-10">
            <p><span className="font-bold">1. AWARE</span> - Know what you have</p>
            <p><span className="font-bold">2. ACT</span> - Keep it working</p>
            <p><span className="font-bold">3. ADVANCE</span> - Make it better</p>
          </div>
          
          <p className="text-lg text-gray-600 mb-8">
            See how it works with a real home
          </p>
        </div>
        
        {/* Demo Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Pick one to explore:
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Homeowner Demo */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-all">
              <div className="text-center mb-4">
                <Home className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Homeowner</h3>
                <p className="text-blue-800 mb-4">"I own my home"</p>
                <p className="text-sm text-blue-700 mb-6">
                  See how the 3 phases work for you
                </p>
              </div>
              <button
                onClick={() => navigate(createPageUrl('DemoEntry') + '?type=homeowner')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Explore Demo
              </button>
            </div>
            
            {/* Investor Demo */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:border-green-400 transition-all">
              <div className="text-center mb-4">
                <Building2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">Investor</h3>
                <p className="text-green-800 mb-4">"I own rentals"</p>
                <p className="text-sm text-green-700 mb-6">
                  See how the 3 phases work across multiple properties
                </p>
              </div>
              <button
                onClick={() => navigate(createPageUrl('DemoEntry') + '?type=investor')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Explore Demo
              </button>
            </div>
          </div>
        </div>

        {/* Simple footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            No sign-up required • Explore fully interactive demos
          </p>
        </div>

      </div>
    </div>
  );
}