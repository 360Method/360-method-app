import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

export default function NextStepCard({ selectedProperty, tasks, onAction }) {
  const getNextStep = () => {
    if (!selectedProperty) {
      return {
        title: 'Add Your Property',
        description: 'Start by adding your property address. Takes 30 seconds.',
        action: 'Add Property',
        actionKey: 'add-property',
        color: 'blue'
      };
    }
    
    const baselineCompletion = selectedProperty.baseline_completion || 0;
    
    if (baselineCompletion < 100) {
      return {
        title: 'Complete Your Baseline',
        description: `You're ${baselineCompletion}% done. Document your remaining systems to unlock ACT phase.`,
        action: 'Continue Baseline',
        actionKey: 'continue-baseline',
        color: 'blue'
      };
    }
    
    const urgentTasks = tasks?.filter(t => 
      (t.priority === 'High' || t.cascade_risk_score >= 7) && 
      t.status !== 'Completed'
    ).length || 0;
    
    if (urgentTasks > 0) {
      return {
        title: 'You Have Urgent Tasks',
        description: `${urgentTasks} urgent item(s) need attention to prevent cascade failures.`,
        action: 'View Urgent Tasks',
        actionKey: 'view-urgent',
        color: 'red'
      };
    }
    
    const unscheduledTasks = tasks?.filter(t => 
      !t.scheduled_date && 
      t.status !== 'Completed'
    ).length || 0;
    
    if (unscheduledTasks >= 3) {
      return {
        title: 'Schedule Your Tasks',
        description: `You have ${unscheduledTasks} tasks waiting to be scheduled.`,
        action: 'Open Calendar',
        actionKey: 'open-schedule',
        color: 'orange'
      };
    }
    
    const tasksToday = tasks?.filter(t => {
      if (!t.scheduled_date) return false;
      const today = new Date().toDateString();
      const taskDate = new Date(t.scheduled_date).toDateString();
      return today === taskDate && t.status !== 'Completed';
    }).length || 0;
    
    if (tasksToday > 0) {
      return {
        title: 'Tasks Due Today',
        description: `${tasksToday} task(s) scheduled for today. Time to execute!`,
        action: 'View Today\'s Tasks',
        actionKey: 'execute-today',
        color: 'green'
      };
    }
    
    return {
      title: 'Looking Good!',
      description: 'Your property is under control. Check back for seasonal reminders or explore upgrades.',
      action: 'Explore Upgrades',
      actionKey: 'explore-upgrades',
      color: 'purple'
    };
  };

  const nextStep = getNextStep();

  const colorClasses = {
    blue: 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50',
    red: 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50',
    orange: 'border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50',
    green: 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50',
    purple: 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50'
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <Card className={`border-2 shadow-lg ${colorClasses[nextStep.color]}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
          <Target className="w-5 h-5" />
          👉 Next Step
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold text-lg mb-2">{nextStep.title}</h3>
        <p className="text-sm text-gray-700 mb-4">{nextStep.description}</p>
        <Button 
          onClick={() => onAction(nextStep.actionKey)}
          className={buttonClasses[nextStep.color]}
          style={{ minHeight: '48px' }}
        >
          {nextStep.action}
        </Button>
      </CardContent>
    </Card>
  );
}