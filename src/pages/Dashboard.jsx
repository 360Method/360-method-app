import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Eye, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Shield,
  Target,
  Flame
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import PhaseProgressCard from "../components/dashboard/PhaseProgressCard";

export default function Dashboard() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: allSystems = [] } = useQuery({
    queryKey: ['allSystems'],
    queryFn: async () => {
      if (!properties || properties.length === 0) return [];
      const systemPromises = properties.map(p => 
        base44.entities.SystemBaseline.filter({ property_id: p.id })
      );
      const results = await Promise.all(systemPromises);
      return results.flat();
    },
    enabled: !!properties && properties.length > 0,
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!properties || properties.length === 0) return [];
      const taskPromises = properties.map(p => 
        base44.entities.MaintenanceTask.filter({ property_id: p.id })
      );
      const results = await Promise.all(taskPromises);
      return results.flat();
    },
    enabled: !!properties && properties.length > 0,
  });

  const avgHealthScore = properties && properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)
    : 0;

  const avgBaselineCompletion = properties && properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.baseline_completion || 0), 0) / properties.length)
    : 0;

  const activeTasks = (allTasks || []).filter(t => t.status !== 'Completed');
  const highPriorityTasks = activeTasks.filter(t => t.priority === 'High');
  const scheduledTasks = (allTasks || []).filter(t => t.status === 'Scheduled' || t.status === 'In Progress');

  const totalSpent = (properties || []).reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalPrevented = (properties || []).reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);

  // Today's Mission - Check Smoke Detector Batteries
  const todaysMission = {
    title: "Check Smoke Detector Batteries",
    why: "60% of fire deaths occur in homes with non-functional detectors. Takes 2 minutes, could save your life. Test monthly to ensure protection.",
    points: 50,
    icon: Flame
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Your property portfolio at a glance</p>
        </div>

        {!properties || properties.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Welcome to 360° Method</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first property to begin documenting and protecting your investment
              </p>
              <Link to={createPageUrl('Properties')}>
                <Button style={{ backgroundColor: 'var(--primary)' }}>
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Today's Mission */}
            <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <todaysMission.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      TODAY'S MISSION: {todaysMission.title}
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-gray-800 flex items-start gap-2">
                        <span className="text-yellow-600">⚡</span>
                        <span><strong>Why Now:</strong> {todaysMission.why}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button style={{ backgroundColor: 'var(--accent)' }}>
                        Start Mission
                      </Button>
                      <Badge className="bg-orange-600 text-white">
                        Complete for {todaysMission.points} PP bonus!
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-gray-900">{highPriorityTasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prevented</p>
                      <p className="text-2xl font-bold text-gray-900">${totalPrevented.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Scheduled</p>
                      <p className="text-2xl font-bold text-gray-900">{scheduledTasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Score & Baseline */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Portfolio Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 py-6">
                  <HealthScoreGauge score={avgHealthScore} size="large" />
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Average across {properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
                    <p className="text-sm text-gray-500">
                      {avgHealthScore >= 80 ? '✅ Excellent - Keep up the great work!' :
                       avgHealthScore >= 60 ? '⚠️ Good - Some attention needed' :
                       '🔴 Needs attention - Address high priority items'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Baseline Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="text-center mb-6">
                    <p className="text-5xl font-bold text-gray-900 mb-2">{avgBaselineCompletion}%</p>
                    <p className="text-gray-600">Average Completion</p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Systems Documented:</strong> {allSystems.length}
                      </p>
                    </div>
                    {avgBaselineCompletion < 80 && (
                      <Link to={createPageUrl('Baseline')}>
                        <Button variant="outline" className="w-full">
                          Continue Documentation
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phase Progress */}
            <div className="grid md:grid-cols-3 gap-6">
              <PhaseProgressCard
                phase="AWARE"
                icon={Eye}
                color="blue"
                progress={avgBaselineCompletion}
                description="Know what you have"
                linkText="Go to Baseline"
                linkUrl={createPageUrl('Baseline')}
              />

              <PhaseProgressCard
                phase="ACT"
                icon={Zap}
                color="orange"
                progress={scheduledTasks.length > 0 ? 60 : 30}
                description="Prevent disasters"
                linkText="View Priority Queue"
                linkUrl={createPageUrl('Prioritize')}
              />

              <PhaseProgressCard
                phase="ADVANCE"
                icon={TrendingUp}
                color="green"
                progress={totalPrevented > 0 ? 45 : 10}
                description="Maximize value"
                linkText="Plan Upgrades"
                linkUrl={createPageUrl('Upgrade')}
              />
            </div>

            {/* High Priority Alert */}
            {highPriorityTasks.length > 0 && (
              <Card className="border-2 border-red-200 bg-red-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-900 mb-2">
                        {highPriorityTasks.length} High Priority {highPriorityTasks.length === 1 ? 'Task' : 'Tasks'} Need Attention
                      </h3>
                      <p className="text-gray-700 mb-4">
                        These tasks have high cascade risk. Small problems now can become expensive disasters if ignored.
                      </p>
                      <Link to={createPageUrl('Prioritize')}>
                        <Button variant="destructive">
                          Review Priority Queue
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}