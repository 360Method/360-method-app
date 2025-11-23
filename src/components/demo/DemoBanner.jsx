import React from 'react';
import { Info, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '../shared/DemoContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function DemoBanner({ onAddProperty }) {
  const { demoMode } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on landing/welcome/demoentry/waitlist pages
  const isLandingPage = location.pathname === '/' || location.pathname === '/welcome' || location.pathname === createPageUrl('Welcome');
  const isWaitlistPage = location.pathname === createPageUrl('Waitlist');
  const isDemoEntryPage = location.pathname === createPageUrl('DemoEntry');
  
  if (!demoMode || isLandingPage || isWaitlistPage || isDemoEntryPage) return null;

  const handleJoinWaitlist = () => {
    sessionStorage.setItem('navigatedFromDemo', 'true');
    navigate(createPageUrl('Waitlist'));
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-b-2 border-yellow-400 fixed left-0 right-0 z-[45] shadow-sm top-[56px] md:top-0 transition-all duration-300"
         style={{ left: '0', right: '0', marginLeft: 'var(--sidebar-width, 0px)' }}>
      <div className="px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left side - Demo info */}
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="360° Method" 
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="text-sm min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-yellow-900 bg-yellow-200 px-2 py-0.5 rounded-md text-xs uppercase tracking-wide">
                  Demo Mode
                </span>
                <span className="text-yellow-800 font-medium hidden sm:inline">
                  Exploring sample property
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side - CTAs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleJoinWaitlist}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 shadow-lg border border-blue-700"
              style={{ minHeight: '40px', fontSize: '14px', fontWeight: '700' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Join Waitlist</span>
            </Button>
            <Button
              onClick={handleBackToLanding}
              variant="ghost"
              size="sm"
              className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
              style={{ minHeight: '40px' }}
              title="Back to Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}