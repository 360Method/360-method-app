import React from 'react';
import { Mail, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid md:grid-cols-5 gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
                alt="360° Method" 
                className="h-10 w-10"
              />
              <span className="font-semibold text-xl">360° Method</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Own with Confidence.<br />
              Build with Purpose.<br />
              Grow with Strategy.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <Link to={createPageUrl('Pricing')} className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('DemoEntry')} className="hover:text-white transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/Login')}
                  className="hover:text-white transition-colors"
                >
                  Sign Up Free
                </button>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link to={createPageUrl('Resources')} className="hover:text-white transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Waitlist')} className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © 2025 360° Method. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:hello@360method.com" className="text-slate-400 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}