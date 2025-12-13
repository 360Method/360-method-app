import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { isMarketingSite, redirectToLogin, redirectToSignup } from '@/lib/domain';

export default function LandingHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="360° Method" 
              className="h-8 w-8"
            />
            <span className="font-semibold text-slate-900">360° Method</span>
          </div>
          <Link to={createPageUrl('Dashboard')}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
              Go to Dashboard →
            </button>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="360° Method" 
              className="h-8 w-8"
            />
            <span className={`font-semibold transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              360° Method
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('method')}
              className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                scrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('proof')}
              className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                scrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              Success Stories
            </button>
            <Link 
              to={createPageUrl('Pricing')}
              className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                scrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to={createPageUrl('Resources')}
              className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                scrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              Resources
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => isMarketingSite() ? redirectToLogin() : navigate('/Login')}
              className={`hidden md:block text-sm font-medium transition-opacity hover:opacity-80 ${
                scrolled ? 'text-slate-600' : 'text-white/80'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => isMarketingSite() ? redirectToSignup() : navigate('/Signup')}
              className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-lg"
            >
              Sign Up
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className={scrolled ? 'text-slate-900' : 'text-white'} />
              ) : (
                <Menu className={scrolled ? 'text-slate-900' : 'text-white'} />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed top-16 left-0 right-0 bg-white shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('method')}
                className="text-left text-slate-700 hover:text-slate-900 font-medium py-2"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('proof')}
                className="text-left text-slate-700 hover:text-slate-900 font-medium py-2"
              >
                Success Stories
              </button>
              <Link 
                to={createPageUrl('Pricing')}
                className="text-slate-700 hover:text-slate-900 font-medium py-2"
              >
                Pricing
              </Link>
              <Link 
                to={createPageUrl('Resources')}
                className="text-slate-700 hover:text-slate-900 font-medium py-2"
              >
                Resources
              </Link>
              <button
                onClick={() => isMarketingSite() ? redirectToLogin() : navigate('/Login')}
                className="text-left text-slate-700 hover:text-slate-900 font-medium py-2 border-t pt-4"
              >
                Log In
              </button>
              <button
                onClick={() => isMarketingSite() ? redirectToSignup() : navigate('/Signup')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium text-sm transition-colors text-center"
              >
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}