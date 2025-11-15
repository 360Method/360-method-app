import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Check } from 'lucide-react';

export function DemoTourGuide({ currentPage }) {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('demo_tour_dismissed') === 'true'
  );
  
  if (dismissed) return null;
  
  const tourSteps = {
    dashboard: {
      title: 'Welcome to Your Demo Property',
      description: 'This is 2847 Maple Grove Ln - a fully documented home with 16 systems, 8 tasks, and complete maintenance history.',
      nextStep: 'Check out the Baseline page to see all documented systems →'
    },
    baseline: {
      title: 'Baseline: Know What You Own',
      description: 'This demo has 16 systems documented. Notice the mix of Good (9), Fair (6), and Urgent (1) conditions.',
      nextStep: 'See how these become tasks in the Prioritize page →'
    },
    prioritize: {
      title: 'Prioritize: Fix What Matters Most',
      description: '8 tasks ranked by urgency. The urgent smoke detector replacement prevents a life-safety issue.',
      nextStep: 'Check the Schedule page to see how to plan maintenance →'
    }
  };
  
  const step = tourSteps[currentPage];
  if (!step) return null;
  
  return (
    <Card className="border-2 border-purple-400 mb-6 bg-purple-50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                ?
              </span>
              {step.title}
            </h3>
            <p className="text-sm text-purple-800 mb-3">
              {step.description}
            </p>
            <p className="text-xs text-purple-700 italic">
              {step.nextStep}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDismissed(true);
              localStorage.setItem('demo_tour_dismissed', 'true');
            }}
          >
            Got it
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}