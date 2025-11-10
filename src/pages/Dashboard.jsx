import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Eye,
  ClipboardCheck,
  Zap,
  Plus,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import PhaseProgressCard from "../components/dashboard/PhaseProgressCard";

export default function Dashboard() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: allSystems = [] } = useQuery({
    queryKey: ['allSystemBaselines'],
    queryFn: () => base44.entities.SystemBaseline.list(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['allMaintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list(),
  });

  const avgHealthScore = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)
    : 0;

  const avgBaselineCompletion = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.baseline_completion || 0), 0) / properties.length)
    : 0;

  const highPriorityTasks = allTasks.filter(t => 
    (t.priority === 'High' || t.cascade_risk_score >= 7) && 
    t.status !== 'Completed'
  ).length;

  const scheduledTasks = allTasks.filter(t => 
    t.status === 'Scheduled' && t.scheduled_date
  ).length;

  const totalSpent = properties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalPrevented = properties.reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <h1 className="font-bold mb-6" style={{ color: '#1B365D', fontSize: '28px' }}>
            Welcome to 360° Method
          </h1>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Add Your First Property</h3>
              <p className="text-gray-600 mb-6">
                Start protecting your investment by documenting your property
              </p>
              <Button
                asChild
                className="w-full md:w-auto"
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <Link to={createPageUrl("Properties")}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
            Dashboard
          </h1>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            Your property portfolio at a glance
          </p>
        </div>

        {/* Today's Mission Card */}
        <Card className="border-none shadow-md mb-6" style={{ backgroundColor: '#FFF5F2' }}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
              🎯 Today's Mission
            </h3>
            <p className="text-gray-800 mb-3" style={{ fontSize: '16px', lineHeight: '1.5' }}>
              Complete seasonal inspection for your property
            </p>
            <Button
              asChild
              className="w-full"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              <Link to={createPageUrl("Inspect")}>
                Start Inspection
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Key Metrics - Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Home className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {properties.length}
              </p>
              <p className="text-sm text-gray-600">Properties</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {highPriorityTasks}
              </p>
              <p className="text-sm text-gray-600">Priority</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-700">
                ${(totalPrevented / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-gray-600">Prevented</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {scheduledTasks}
              </p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Health Score - Full width on mobile */}
        <Card className="border-none shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle style={{ color: '#1B365D', fontSize: '18px' }}>
              Portfolio Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthScoreGauge score={avgHealthScore} />
          </CardContent>
        </Card>

        {/* Baseline Progress */}
        <Card className="border-none shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle style={{ color: '#1B365D', fontSize: '18px' }}>
              Baseline Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span className="font-bold">{avgBaselineCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ 
                    width: `${avgBaselineCompletion}%`,
                    backgroundColor: '#28A745'
                  }}
                />
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full mt-3"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("Baseline")}>
                Continue Baseline
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Phase Progress Cards - Stack on mobile */}
        <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0 mb-6">
          <PhaseProgressCard
            phase="AWARE"
            icon={Eye}
            color="#3B82F6"
            progress={avgBaselineCompletion}
            description="Document systems and inspect property"
            action="Continue"
            actionUrl={createPageUrl("Baseline")}
          />
          
          <PhaseProgressCard
            phase="ACT"
            icon={Zap}
            color="#FF6B35"
            progress={highPriorityTasks > 0 ? 50 : 100}
            description="Prioritize and schedule maintenance"
            action="View Tasks"
            actionUrl={createPageUrl("Prioritize")}
          />
          
          <PhaseProgressCard
            phase="ADVANCE"
            icon={TrendingUp}
            color="#28A745"
            progress={totalPrevented > 0 ? 75 : 0}
            description="Preserve value and scale"
            action="View Progress"
            actionUrl={createPageUrl("Preserve")}
          />
        </div>

        {/* High Priority Alert - Mobile optimized */}
        {highPriorityTasks > 0 && (
          <Card className="border-2 mobile-card" style={{ borderColor: '#DC3545', backgroundColor: '#FFF5F5' }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-600 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    {highPriorityTasks} High Priority Task{highPriorityTasks > 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-800 mb-3" style={{ fontSize: '16px', lineHeight: '1.5' }}>
                    These tasks need attention to prevent expensive problems
                  </p>
                  <Button
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#DC3545', minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("Prioritize")}>
                      View Priority Queue
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}