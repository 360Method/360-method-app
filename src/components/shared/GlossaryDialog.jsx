import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const GLOSSARY = {
  "360° Method": {
    simple: "A 9-step system to protect your home and build wealth",
    detailed: "Systematic approach: AWARE (know your property) → ACT (fix problems) → ADVANCE (build value). Prevents $50 problems from becoming $5,000 disasters."
  },
  "Baseline": {
    simple: "Documenting what's in your home",
    detailed: "Taking inventory of all systems (HVAC, roof, plumbing) and their condition. Like a home health checkup. Usually takes 10-15 minutes with the Quick Start Wizard."
  },
  "AWARE Phase": {
    simple: "Know your property",
    detailed: "Steps 1-3: Baseline (document systems), Inspect (seasonal checkups), Track (maintenance history). Foundation for preventing disasters."
  },
  "ACT Phase": {
    simple: "Fix problems",
    detailed: "Steps 4-6: Prioritize (what to fix first), Schedule (when to fix it), Execute (complete the work). Turn knowledge into action."
  },
  "ADVANCE Phase": {
    simple: "Build value",
    detailed: "Steps 7-9: Preserve (extend system life), Upgrade (strategic improvements), Scale (grow portfolio). Long-term wealth building."
  },
  "Cascade Failure": {
    simple: "Small problem becomes disaster",
    detailed: "$50 clogged gutter → $500 foundation damage → $5,000 basement flood. Chain reaction we help you prevent."
  },
  "Health Score": {
    simple: "Your property's overall condition",
    detailed: "0-100 score based on system conditions, maintenance history, and risk factors. Higher is better."
  },
  "System": {
    simple: "Major home component",
    detailed: "HVAC, water heater, roof, plumbing, electrical, etc. Anything that can break and needs maintenance."
  },
  "Prioritize": {
    simple: "Decide what to fix first",
    detailed: "Rank tasks by urgency, cost, and cascade risk. Fix critical safety issues before cosmetic upgrades."
  },
  "Execute": {
    simple: "Complete your tasks",
    detailed: "Do the work yourself or hire professionals. Track completion. Celebrate progress."
  },
  "Preserve": {
    simple: "Make systems last longer",
    detailed: "Preventive maintenance like flushing water heaters, servicing HVAC. Extends lifespan 20-40% and saves thousands."
  },
  "Scale": {
    simple: "Manage multiple properties",
    detailed: "Apply 360° Method across your portfolio. Investor feature for tracking 2+ properties efficiently."
  }
};

export default function GlossaryDialog({ open, onClose }) {
  const [expandedTerms, setExpandedTerms] = useState({});

  const toggleTerm = (term) => {
    setExpandedTerms(prev => ({
      ...prev,
      [term]: !prev[term]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>360° Method Glossary</DialogTitle>
          <DialogDescription>
            Every term explained in plain English
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {Object.entries(GLOSSARY).map(([term, definition]) => (
            <div 
              key={term} 
              className="border-l-4 border-blue-500 pl-4 py-2"
            >
              <h4 className="font-semibold text-base mb-1">{term}</h4>
              <p className="text-sm text-gray-700 mb-2">
                {definition.simple}
              </p>
              
              <button
                onClick={() => toggleTerm(term)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                Learn more <ChevronDown className={`w-3 h-3 transition-transform ${expandedTerms[term] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedTerms[term] && (
                <p className="text-xs text-gray-600 mt-2 pl-4 border-l-2 border-gray-200">
                  {definition.detailed}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}