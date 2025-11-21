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