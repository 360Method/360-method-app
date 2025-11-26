import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Home, CheckCircle, TrendingUp, Shield, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * DemoEngagementPopup - Shows contextual conversion prompts during demo
 */
export function DemoEngagementPopup({ trigger, context, onClose, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Get content based on trigger
  const content = getPopupContent(trigger, context);
  
  const handleSignup = () => {
    // Redirect to signup
    base44.auth.redirectToSignup();
  };
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4
      transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className={`relative bg-white rounded-2xl max-w-lg w-full shadow-2xl
        transition-all duration-300 transform
        ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 
            hover:bg-slate-100 rounded-full transition-colors"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="p-8">
          
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center 
            mx-auto mb-6 ${content.iconBg}`}>
            {content.icon}
          </div>
          
          {/* Headline */}
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">
            {content.headline}
          </h2>
          
          {/* Body */}
          <p className="text-slate-600 text-center mb-6 leading-relaxed">
            {content.body}
          </p>
          
          {/* Question */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-slate-700 text-center font-medium">
              {content.question}
            </p>
          </div>
          
          {/* CTAs */}
          <div className="space-y-3">
            <button 
              onClick={handleSignup}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white 
                py-4 rounded-xl font-semibold text-lg transition-colors
                flex items-center justify-center gap-2"
              style={{ minHeight: '48px' }}
            >
              Yes, Create My Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleClose}
              className="w-full text-slate-500 hover:text-slate-700 py-3 
                font-medium transition-colors"
              style={{ minHeight: '44px' }}
            >
              Not yet, I want to explore more
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 
            text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Free forever
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              No credit card
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              2-min setup
            </span>
          </div>
          
        </div>
        
        {/* Don't show again option */}
        <div className="border-t border-slate-100 px-8 py-4">
          <button 
            onClick={handleDismiss}
            className="w-full text-sm text-slate-400 hover:text-slate-600 
              transition-colors"
            style={{ minHeight: '44px' }}
          >
            Don't show these prompts again
          </button>
        </div>
        
      </div>
    </div>
  );
}

/**
 * Get popup content based on trigger type
 */
function getPopupContent(trigger, context) {
  const contents = {
    
    // After viewing health score
    health_score_viewed: {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      iconBg: 'bg-blue-100',
      headline: "Imagine Knowing Your Property's True Condition",
      body: `You just saw how the Health Score gives you instant clarity on a property's condition. This demo property scores ${context?.score || 78}—but what about YOUR property?`,
      question: "Would you like to see your own property's health score?"
    },
    
    // After using inspection checklist
    inspection_completed: {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      iconBg: 'bg-green-100',
      headline: "You Just Completed an Inspection Like a Pro",
      body: "That checklist you went through? It's designed to catch the small problems before they become expensive disasters. Imagine doing this for your own property.",
      question: "Ready to inspect your own property with this system?"
    },
    
    // After viewing priority system
    priorities_viewed: {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      iconBg: 'bg-purple-100',
      headline: "Never Wonder What to Fix First Again",
      body: "You just saw how the system prioritizes tasks—Safety first, then ROI, then Comfort. No more guessing. No more letting important things slip through the cracks.",
      question: "Want this priority system working for your property?"
    },
    
    // After viewing system lifecycle
    lifecycle_viewed: {
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      iconBg: 'bg-orange-100',
      headline: "See Your Future Expenses Before They Hit",
      body: "That timeline showing when systems need replacement? It's how smart property owners plan ahead and avoid surprise $10,000 bills. Your property has its own timeline waiting to be revealed.",
      question: "Want to see when YOUR systems will need attention?"
    },
    
    // After viewing seasonal guide
    seasonal_viewed: {
      icon: <Home className="w-8 h-8 text-teal-600" />,
      iconBg: 'bg-teal-100',
      headline: "Seasonal Maintenance Made Simple",
      body: "Those checklists are customized for your climate zone. Spring, Summer, Fall, Winter—each season has specific tasks that prevent problems year-round.",
      question: "Ready to get seasonal checklists for your property?"
    },
    
    // After extended engagement (3+ minutes)
    time_engaged: {
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      iconBg: 'bg-indigo-100',
      headline: "You're Serious About Protecting Your Property",
      body: "You've spent real time exploring what's possible. That tells us you understand the value of being proactive rather than reactive. Your property deserves this level of care.",
      question: "Ready to start protecting your own investment?"
    },
    
    // After viewing multiple features
    features_explored: {
      icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      headline: "You've Seen the Full Picture",
      body: "Health scores, inspections, priorities, timelines—you've explored how all the pieces work together. This isn't just an app; it's a complete system for property confidence.",
      question: "Can you see this working for your property?"
    },
    
    // Default fallback
    default: {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      iconBg: 'bg-blue-100',
      headline: "This Could Be Your Property",
      body: "Everything you're seeing in this demo—the dashboard, the scores, the checklists—it all works the same way for your own property. And it's free to start.",
      question: "Ready to protect your own investment?"
    }
  };
  
  return contents[trigger] || contents.default;
}