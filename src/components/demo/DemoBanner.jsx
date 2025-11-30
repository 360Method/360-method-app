import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '../shared/DemoContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DemoExitCTA from './DemoExitCTA';

export function DemoBanner({ onAddProperty }) {
  const { demoMode } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitCTA, setShowExitCTA] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState('256px');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Listen for sidebar width changes via CSS variable and window resize
  useEffect(() => {
    const updateSidebarWidth = () => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim() || '256px';
      setSidebarWidth(width);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateSidebarWidth();
    handleResize();

    // Create observer to watch for style changes
    const observer = new MutationObserver(updateSidebarWidth);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Demo banner should show when:
  // 1. User is in demo mode (session state)
  // 2. NOT on landing/welcome pages (those have their own flows)
  const isLandingPage = location.pathname === '/' ||
                        location.pathname === '/welcome' ||
                        location.pathname === createPageUrl('Welcome') ||
                        location.pathname === createPageUrl('Waitlist');

  // Hide banner if not in demo mode OR on landing pages
  if (!demoMode || isLandingPage) return null;

  const handleStartFree = () => {
    navigate('/Signup');
  };

  const handleBackToLanding = () => {
    setShowExitCTA(true);
  };

  return (
    <div
      className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-b-2 border-yellow-400 fixed right-0 z-[35] shadow-sm top-[56px] md:top-0 transition-all duration-300"
      style={{ left: isMobile ? 0 : sidebarWidth }}>
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
              onClick={handleStartFree}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2 shadow-lg border border-orange-700"
              style={{ minHeight: '40px', fontSize: '14px', fontWeight: '700' }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Start Free</span>
              <span className="sm:hidden">Sign Up</span>
            </Button>
            <Button
              onClick={handleBackToLanding}
              variant="ghost"
              size="sm"
              className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
              style={{ minHeight: '40px' }}
              title="Exit Demo"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Exit CTA Modal */}
      <DemoExitCTA
        isOpen={showExitCTA}
        onClose={() => setShowExitCTA(false)}
        reason="exit"
      />
    </div>
  );
}