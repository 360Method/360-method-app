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
          
          {/* Score-First Hero */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            What's Your Home's<br />
            360° Score?
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-10">
            Most people have no idea.<br />
            See what a good score looks like.
          </p>
          
          <button
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors mb-4"
          >
            Explore Demo Homes
          </button>
          
          <p className="text-sm text-gray-500">
            No sign-up required • See real examples
          </p>
        </div>
        
        {/* Method Phases - Simple */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            How You Build Your Score
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1. AWARE</div>
              <p className="text-gray-700">Know what you have</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">2. ACT</div>
              <p className="text-gray-700">Keep it working</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">3. ADVANCE</div>
              <p className="text-gray-700">Make it better</p>
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