import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, Lock } from 'lucide-react';

export default function JourneyRoadmap({ open, onClose, selectedProperty, systems = [], tasks = [] }) {
  const baselineComplete = selectedProperty?.baseline_completion >= 66;
  const baselineFullyComplete = selectedProperty?.baseline_completion === 100;
  const hasScheduledTasks = tasks?.some(t => t.scheduled_date);
  const hasCompletedTasks = tasks?.some(t => t.status === 'Completed');
  const actUnlocked = baselineComplete;
  
  const phases = [
    {
      name: "AWARE",
      subtitle: "Know Your Property",
      status: baselineFullyComplete ? "complete" : systems?.length > 0 ? "in-progress" : "not-started",
      steps: [
        { 
          number: 1, 
          label: "Baseline", 
          subtitle: "Document systems",
          status: baselineFullyComplete ? "complete" : systems?.length > 0 ? "in-progress" : "available",
          duration: "10-15 min"
        },
        { 
          number: 2, 
          label: "Inspect", 
          subtitle: "Seasonal checkups",
          status: baselineComplete ? "available" : "locked",
          duration: "30 min/quarter"
        },
        { 
          number: 3, 
          label: "Track", 
          subtitle: "Maintenance history",
          status: baselineComplete ? "available" : "locked",
          duration: "Ongoing"
        }
      ]
    },
    {
      name: "ACT",
      subtitle: "Fix Problems",
      status: actUnlocked ? (hasCompletedTasks ? "in-progress" : "available") : "locked",
      unlockHint: "Complete Baseline to unlock",
      steps: [
        { 
          number: 4, 
          label: "Prioritize", 
          subtitle: "Fix what matters most",
          status: actUnlocked ? (tasks?.length > 0 ? "in-progress" : "available") : "locked",
          duration: "20 min"
        },
        { 
          number: 5, 
          label: "Schedule", 
          subtitle: "Plan your maintenance",
          status: actUnlocked ? (hasScheduledTasks ? "in-progress" : "available") : "locked",
          duration: "15 min"
        },
        { 
          number: 6, 
          label: "Execute", 
          subtitle: "Complete your tasks",
          status: actUnlocked ? (hasCompletedTasks ? "in-progress" : "available") : "locked",
          duration: "Varies"
        }
      ]
    },
    {
      name: "ADVANCE",
      subtitle: "Build Value",
      status: "locked",
      unlockHint: "Complete ACT phase",
      steps: [
        { 
          number: 7, 
          label: "Preserve", 
          subtitle: "Extend system life",
          status: "locked",
          duration: "2-4 hrs/year"
        },
        { 
          number: 8, 
          label: "Upgrade", 
          subtitle: "Strategic improvements",
          status: "locked",
          duration: "As needed"
        },
        { 
          number: 9, 
          label: "Scale", 
          subtitle: "Portfolio growth",
          status: "locked",
          duration: "Ongoing"
        }
      ]
    }
  ];
  
  const getStatusIcon = (status) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in-progress":
      case "available":
        return <Circle className="w-5 h-5 text-blue-600" />;
      case "locked":
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your 360° Journey</DialogTitle>
          <DialogDescription>
            9 steps to property mastery
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          {phases.map((phase, phaseIdx) => (
            <div key={phase.name} className="space-y-4">
              {/* Phase Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    Phase {phaseIdx + 1}: {phase.name}
                  </h3>
                  <p className="text-sm text-gray-600">{phase.subtitle}</p>
                </div>
                <Badge
                  className={
                    phase.status === "complete" ? "bg-green-600 text-white" :
                    phase.status === "in-progress" ? "bg-blue-600 text-white" :
                    "bg-gray-200 text-gray-600"
                  }
                >
                  {phase.status === "complete" && "✓ Complete"}
                  {phase.status === "in-progress" && "In Progress"}
                  {phase.status === "locked" && phase.unlockHint}
                  {phase.status === "available" && "Available"}
                  {phase.status === "not-started" && "Not Started"}
                </Badge>
              </div>
              
              {/* Steps */}
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                {phase.steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      step.status === "complete" ? "bg-green-50" :
                      step.status === "in-progress" ? "bg-blue-50" :
                      step.status === "available" ? "bg-white border border-blue-200" :
                      "opacity-60 bg-gray-50"
                    }`}
                  >
                    {getStatusIcon(step.status)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {step.number}. {step.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}