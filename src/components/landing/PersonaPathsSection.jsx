import React from 'react';
import { Home, Shield, Award, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PersonaPathsSection() {
  const navigate = useNavigate();

  const personas = [
    {
      icon: Home,
      iconColor: 'bg-red-100 text-red-600',
      title: 'The Overwhelmed Owner',
      currentState: 'I have no idea what\'s about to break',
      currentStateColor: 'text-red-600',
      dreamState: 'Nothing surprises you anymore',
      journey: 'See transformation (62 → 80)',
      demoType: 'homeowner',
      demoScore: 'struggling'
    },
    {
      icon: Shield,
      iconColor: 'bg-orange-100 text-orange-600',
      title: 'The Organized Owner',
      currentState: 'I maintain, but could do better',
      currentStateColor: 'text-orange-600',
      dreamState: 'Systems last 30% longer, home worth 5% more',
      journey: 'See the upgrade (78 → 85)',
      demoType: 'homeowner',
      demoScore: 'improving'
    },
    {
      icon: Award,
      iconColor: 'bg-green-100 text-green-600',
      title: 'The Elite Owner',
      currentState: 'My home is dialed in',
      currentStateColor: 'text-green-600',
      dreamState: 'Maintain excellence effortlessly',
      journey: 'See elite maintenance (92)',
      demoType: 'homeowner',
      demoScore: 'excellent'
    },
    {
      icon: Briefcase,
      iconColor: 'bg-purple-100 text-purple-600',
      title: 'The Portfolio Builder',
      currentState: 'Tired of emergency calls and chaos',
      currentStateColor: 'text-purple-600',
      dreamState: 'Professional operation, phone stops buzzing',
      journey: 'See portfolio control (3 properties, 79 avg)',
      demoType: 'investor',
      demoScore: 'improving'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Where Are You on the Journey?
          </h2>
          <p className="text-xl text-slate-600">
            Select your situation to see your transformation path
          </p>
        </div>
        
        {/* Persona Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`${createPageUrl('DemoEntry')}?type=${persona.demoType}&score=${persona.demoScore}`)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${persona.iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{persona.title}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className={`text-sm font-semibold ${persona.currentStateColor} mb-1`}>Current State:</p>
                        <p className="text-gray-700">"{persona.currentState}"</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <ArrowRight className="w-4 h-4" />
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-600 mb-1">Dream State:</p>
                        <p className="text-gray-700">"{persona.dreamState}"</p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      {persona.journey}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}