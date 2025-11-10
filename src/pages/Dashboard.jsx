import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Zap, 
  TrendingUp, 
  Home, 
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Award
} from "lucide-react";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import PhaseProgressCard from "../components/dashboard/PhaseProgressCard";

export default function Dashboard() {
  const [user, setUser] = React.useState(null);

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date'),
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date'),
  });

  const { data: allUpgrades = [] } = useQuery({
    queryKey: ['upgrades'],
    queryFn: () => base44.entities.Upgrade.list('-created_date'),
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Calculate aggregate metrics
  const averageHealthScore = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)
    : 0;

  const totalMaintenanceSpent = properties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalDisastersPrevented = properties.reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);

  const highPriorityTasks = allTasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;
  const upcomingThisWeek = allTasks.filter(t => {
    if (!t.scheduled_date || t.status === 'Completed') return false;
    const scheduledDate = new Date(t.scheduled_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return scheduledDate >= today && scheduledDate <= weekFromNow;
  }).length;

  const avgBaselineCompletion = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.baseline_completion || 0), 0) / properties.length)
    : 0;

  const nextInspectionDue = allInspections.find(i => i.status !== 'Completed');
  const pendingServiceRequests = 0; // Would query ServiceRequest entity

  const roiPositiveUpgrades = allUpgrades.filter(u => u.status === 'Identified').length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">Let's keep your properties in great shape</p>
          </div>
          <Link to={createPageUrl("Properties")}>
            <Button className="gap-2" style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Overall Health Score */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">Portfolio Health Score</h2>
                  <p className="text-blue-100">Average across {properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
                </div>
                <HealthScoreGauge score={averageHealthScore} size="large" />
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-gray-900">${totalMaintenanceSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Maintenance Spent</p>
                </div>
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-gray-900">${totalDisastersPrevented.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Disasters Prevented</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-gray-900">{allTasks.filter(t => t.status === 'Completed').length}</p>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-gray-900">{avgBaselineCompletion}%</p>
                  <p className="text-sm text-gray-600">Baseline Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Three Phase Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <PhaseProgressCard
            phase="AWARE"
            icon={Eye}
            color="blue"
            metrics={[
              { label: "Baseline Completion", value: `${avgBaselineCompletion}%`, progress: avgBaselineCompletion },
              { label: "Next Inspection", value: nextInspectionDue ? "Upcoming" : "None Due" },
              { label: "Issues Found", value: allTasks.filter(t => t.status === 'Identified').length }
            ]}
            action={{
              label: avgBaselineCompletion < 80 ? "Continue Baseline" : "Start Inspection",
              url: avgBaselineCompletion < 80 ? createPageUrl("Baseline") : createPageUrl("Inspect")
            }}
          />

          <PhaseProgressCard
            phase="ACT"
            icon={Zap}
            color="orange"
            metrics={[
              { label: "High Priority Items", value: highPriorityTasks, urgent: highPriorityTasks > 0 },
              { label: "Scheduled This Week", value: upcomingThisWeek },
              { label: "Pending Requests", value: pendingServiceRequests }
            ]}
            action={{
              label: "View Priority Queue",
              url: createPageUrl("Prioritize")
            }}
          />

          <PhaseProgressCard
            phase="ADVANCE"
            icon={TrendingUp}
            color="green"
            metrics={[
              { label: "Savings to Date", value: `$${totalDisastersPrevented.toLocaleString()}` },
              { label: "Next Replacement", value: "Check Systems" },
              { label: "ROI Opportunities", value: roiPositiveUpgrades }
            ]}
            action={{
              label: "View Opportunities",
              url: createPageUrl("Upgrade")
            }}
          />
        </div>

        {/* Properties List */}
        {properties.length > 0 ? (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Your Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property) => (
                  <Link 
                    key={property.id} 
                    to={createPageUrl("Baseline") + `?property=${property.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{property.address}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{property.property_type}</Badge>
                          <Badge variant="outline">{property.square_footage?.toLocaleString()} sq ft</Badge>
                          <Badge variant="outline">{property.occupancy_status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <HealthScoreGauge score={property.health_score || 0} size="small" />
                          <p className="text-xs text-gray-600 mt-1">Health Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Baseline</p>
                          <Progress value={property.baseline_completion || 0} className="w-24 mt-1" />
                          <p className="text-xs text-gray-500 mt-1">{property.baseline_completion || 0}%</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">Add your first property to start your journey to proactive home maintenance</p>
              <Link to={createPageUrl("Properties")}>
                <Button className="gap-2" style={{ backgroundColor: 'var(--primary)' }}>
                  <Plus className="w-4 h-4" />
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}