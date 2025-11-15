import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Sparkles, Target, TrendingUp, Unlock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function getEducationTriggers(user, properties, selectedProperty, location, systems, tasks) {
  return [
    // Removed welcome_tour trigger that was causing the loop
    
    {
      id: 'baseline_primer',
      priority: 2,
      condition: () => {
        return location.pathname.includes('/baseline') &&
               selectedProperty?.baseline_completion === 0 &&
               systems?.length === 0 &&
               !localStorage.getItem('seen_baseline_primer');
      },
      content: (onDismiss) => (
        <Card className="border-blue-500 border-2 bg-blue-50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Start with Quick Wizard (Recommended)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              The Quick Start Wizard asks simple questions and uses AI to document your 
              systems in 10-15 minutes.
            </p>
            <p className="text-sm text-gray-600">
              This is your foundation. Everything else builds on this.
            </p>
            <Button 
              size="sm"
              onClick={() => {
                localStorage.setItem('seen_baseline_primer', 'true');
                onDismiss();
              }}
            >
              Got it!
            </Button>
          </CardContent>
        </Card>
      )
    },
    
    {
      id: 'first_system_celebration',
      priority: 3,
      condition: () => {
        return systems?.length === 1 &&
               !localStorage.getItem('celebrated_first_system');
      },
      content: (onDismiss) => (
        <Dialog open={true} onOpenChange={onDismiss}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                First System Documented! 🎉
              </DialogTitle>
              <DialogDescription>
                This is how you prevent disasters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p>
                Every system you document reduces your risk of surprise $5K+ repairs.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  Why this matters:
                </p>
                <p className="text-sm text-green-800">
                  You now know the age and condition of one critical system. When it needs 
                  service, you'll be prepared—not surprised.
                </p>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => {
                  localStorage.setItem('celebrated_first_system', 'true');
                  toast.success('🎉 Keep documenting! You\'re building protection.');
                  onDismiss();
                }}
              >
                Keep Going!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )
    },
    
    {
      id: 'act_phase_unlock',
      priority: 4,
      condition: () => {
        const justUnlocked = selectedProperty?.baseline_completion >= 66 &&
                            !localStorage.getItem('celebrated_act_unlock');
        return justUnlocked;
      },
      content: (onDismiss, navigate) => (
        <Dialog open={true} onOpenChange={onDismiss}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Unlock className="w-6 h-6 text-green-600" />
                ACT Phase Unlocked! 🔓
              </DialogTitle>
              <DialogDescription>
                You know what you own. Now let's prioritize what to fix.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center border-2 border-green-200">
                <p className="text-sm font-semibold mb-2">AWARE Phase Complete ✓</p>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {systems?.length || 0}
                </div>
                <p className="text-sm text-gray-600">systems documented</p>
              </div>
              
              <p className="text-sm">
                Now that you know your property's condition, the ACT phase helps you:
              </p>
              
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Prioritize:</strong> What to fix first</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Schedule:</strong> When to fix it</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Execute:</strong> Complete the work</span>
                </li>
              </ul>
              
              <Button 
                className="w-full"
                size="lg"
                onClick={() => {
                  localStorage.setItem('celebrated_act_unlock', 'true');
                  toast.success('🎉 ACT Phase unlocked!');
                  onDismiss();
                  navigate('/prioritize');
                }}
              >
                Start Prioritizing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  ];
}

export default function ProgressiveEducation({ 
  user, 
  properties, 
  selectedProperty,
  systems,
  tasks 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dismissedTrigger, setDismissedTrigger] = useState(null);
  const hasExecutedAction = useRef(false);
  
  const triggers = useMemo(() => {
    return getEducationTriggers(
      user, 
      properties, 
      selectedProperty, 
      location,
      systems,
      tasks
    );
  }, [user, properties, selectedProperty, location, systems, tasks]);
  
  const activeTrigger = useMemo(() => {
    return triggers
      .filter(t => t.condition())
      .sort((a, b) => a.priority - b.priority)[0];
  }, [triggers]);
  
  useEffect(() => {
    // Prevent navigation loops by using a ref
    if (activeTrigger?.action && 
        activeTrigger.id !== dismissedTrigger && 
        !hasExecutedAction.current) {
      hasExecutedAction.current = true;
      activeTrigger.action(navigate);
    }
  }, [activeTrigger, navigate, dismissedTrigger]);
  
  if (!activeTrigger || activeTrigger.id === dismissedTrigger || !activeTrigger.content) {
    return null;
  }
  
  return activeTrigger.content(() => setDismissedTrigger(activeTrigger.id), navigate);
}