import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useDemo } from '../shared/DemoContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * "Don't want to do this yourself?" escape hatch banner
 * Only shows in demo mode on high-effort pages
 * Usage: <DontWantDIYBanner page="baseline" />
 */
export function DontWantDIYBanner({ page }) {
  const { demoMode } = useDemo();
  const navigate = useNavigate();

  if (!demoMode) return null;

  const messages = {
    baseline: {
      title: "Don't Want To Document Everything?",
      description: "This takes 2-3 hours... or our team can do it in one visit.",
      cta: "See Full-Service Options"
    },
    inspect: {
      title: "Don't Want To Do Quarterly Walkthroughs?",
      description: "Seasonal inspections take 45 minutes each... or we send a pro.",
      cta: "See Full-Service Options"
    },
    prioritize: {
      title: "Don't Want To Manage This Yourself?",
      description: "Our team can handle prioritization, scheduling, and execution for you.",
      cta: "See Full-Service Options"
    },
    execute: {
      title: "Don't Want To Handle The Work?",
      description: "We coordinate contractors, schedule service, and manage it all for you.",
      cta: "See Full-Service Options"
    }
  };

  const message = messages[page] || messages.baseline;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-purple-900 mb-1">
            {message.title}
          </h3>
          <p className="text-sm text-purple-800 mb-3">
            {message.description}
          </p>
          <button
            onClick={() => navigate(createPageUrl('Services'))}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {message.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}