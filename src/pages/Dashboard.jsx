import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Clock,
  DollarSign,
  Calendar,
  Target,
  Activity,
  Flame,
  Award,
  ArrowUpRight,
  Bell,
  Wrench,
  BookOpen,
  Users,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import PhaseProgressCard from "../components/dashboard/PhaseProgressCard";
import UpgradePrompt from "../components/upgrade/UpgradePrompt";
import TierBadge from "../components/upgrade/TierBadge";
import SeasonalTaskSuggestions from "../components/schedule/SeasonalTaskSuggestions";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update time every minute for "good morning" greeting
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allSystems = [] } = useQuery({
    queryKey: ['allSystemBaselines'],
    queryFn: () => base44.entities.SystemBaseline.list(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['allMaintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date'),
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['allInspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date'),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  const currentTier = user?.subscription_tier || 'free';
  const propertyLimit = user?.property_limit || 1;
  const isFreeTier = currentTier === 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');
  const canAddProperty = properties.length < propertyLimit;

  // Calculate metrics
  const avgHealthScore = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)
    : 0;

  const avgBaselineCompletion = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.baseline_completion || 0), 0) / properties.length)
    : 0;

  const highPriorityTasks = allTasks.filter(t => 
    (t.priority === 'High' || t.cascade_risk_score >= 7) && 
    t.status !== 'Completed'
  );

  const scheduledTasks = allTasks.filter(t => 
    t.status === 'Scheduled' && t.scheduled_date
  );

  const completedTasksThisMonth = allTasks.filter(t => {
    if (!t.completion_date) return false;
    const completionDate = new Date(t.completion_date);
    const now = new Date();
    return completionDate.getMonth() === now.getMonth() && 
           completionDate.getFullYear() === now.getFullYear() &&
           t.status === 'Completed';
  }).length;

  const totalSpent = properties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalPrevented = properties.reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);

  const upcomingTasks = scheduledTasks
    .map(t => ({
      ...t,
      daysUntil: t.scheduled_date ? Math.ceil((new Date(t.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }))
    .filter(t => t.daysUntil !== null && t.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  const recentActivity = [
    ...allTasks.filter(t => t.created_date).slice(0, 5).map(t => ({
      type: 'task',
      title: t.title,
      date: t.created_date,
      icon: CheckCircle2,
      color: 'blue'
    })),
    ...allInspections.filter(i => i.created_date).slice(0, 3).map(i => ({
      type: 'inspection',
      title: `${i.season} ${i.year} Inspection`,
      date: i.created_date,
      icon: ClipboardCheck,
      color: 'green'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Smart recommendations
  const recommendations = [];
  
  if (avgBaselineCompletion < 66) {
    recommendations.push({
      title: "Complete Your Baseline",
      description: `You're ${avgBaselineCompletion}% done. Finishing your baseline unlocks powerful features.`,
      action: "Continue",
      url: createPageUrl("Baseline"),
      icon: Target,
      priority: "high"
    });
  }

  if (highPriorityTasks.length > 0) {
    recommendations.push({
      title: `${highPriorityTasks.length} High Priority ${highPriorityTasks.length === 1 ? 'Task' : 'Tasks'}`,
      description: "These issues could lead to expensive cascade failures if ignored.",
      action: "Review",
      url: createPageUrl("Prioritize"),
      icon: Flame,
      priority: "urgent"
    });
  }

  const lastInspection = allInspections.length > 0 ? allInspections[0] : null;
  const monthsSinceInspection = lastInspection?.inspection_date 
    ? Math.floor((new Date() - new Date(lastInspection.inspection_date)) / (1000 * 60 * 60 * 24 * 30))
    : 999;

  if (monthsSinceInspection >= 3 && avgBaselineCompletion >= 66) {
    recommendations.push({
      title: "Time for Seasonal Inspection",
      description: lastInspection 
        ? `Last inspection was ${monthsSinceInceInspection} months ago. Stay ahead of issues.`
        : "Start your first quarterly property inspection to catch issues early.",
      action: "Inspect",
      url: createPageUrl("Inspect"),
      icon: ClipboardCheck,
      priority: "medium"
    });
  }

  if (allSystems.length >= 5 && !isFreeTier && avgBaselineCompletion >= 66) {
    recommendations.push({
      title: "Generate AI Maintenance Plan",
      description: "Get a personalized 12-month maintenance roadmap based on your systems.",
      action: "Generate",
      url: createPageUrl("Schedule"),
      icon: Sparkles,
      priority: "low"
    });
  }

  // Greeting based on time of day
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Show upgrade prompt if free tier with 1 property and high baseline completion
  React.useEffect(() => {
    if (isFreeTier && properties.length === 1 && avgBaselineCompletion >= 66 && !showUpgradePrompt) {
      const timer = setTimeout(() => setShowUpgradePrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFreeTier, properties.length, avgBaselineCompletion]);

  const handleRestartOnboarding = async () => {
    try {
      await updateUserMutation.mutateAsync({
        onboarding_completed: false,
        onboarding_skipped: false
      });
      await queryClient.invalidateQueries({ queryKey: ['current-user'] });
      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      console.error("Failed to restart onboarding:", error);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          {/* Welcome Header with Tier Badge */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '28px' }}>
                {greeting}, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600">Welcome to your 360° Method Command Center</p>
            </div>
            <TierBadge tier={currentTier} />
          </div>

          {/* Onboarding Prompt if not completed */}
          {!user?.onboarding_completed && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 mb-6 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900 mb-2 text-lg">
                      🎉 Get Started with Guided Setup
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Our 5-minute onboarding will help you add your property, choose your documentation path, and get the most value from the 360° Method.
                    </p>
                    <Button
                      onClick={handleRestartOnboarding}
                      disabled={updateUserMutation.isPending}
                      className="gap-2"
                      style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                    >
                      {updateUserMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Start Guided Setup
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Free Tier Notice */}
          {isFreeTier && (
            <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      You're on the Free Tier
                    </p>
                    <p className="text-sm text-blue-700 mb-3">
                      Limited to 1 property. Upgrade to Pro for 3 properties or get unlimited with HomeCare/PropertyCare service.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-100"
                    >
                      <Link to={createPageUrl("Pricing")}>
                        View Plans & Pricing
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Home className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>Add Your First Property</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start protecting your investment by documenting your property. Our guided wizard makes it easy.
              </p>
              <Button
                asChild
                className="w-full md:w-auto shadow-lg"
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <Link to={createPageUrl("Properties")}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Property
                </Link>
              </Button>
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-xs text-gray-600">Prevent disasters</p>
                </div>
                <div>
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600">Increase value</p>
                </div>
                <div>
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs text-gray-600">Save money</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // For single property, get the first property for seasonal suggestions
  const primaryProperty = properties[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        {/* Hero Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
                {greeting}, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>
                {properties.length === 1 
                  ? `Managing ${primaryProperty?.address || 'your property'}`
                  : `Managing ${properties.length} properties`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TierBadge tier={currentTier} />
              {canAddProperty && (
                <Button
                  asChild
                  size="sm"
                  className="shadow-lg"
                  style={{ backgroundColor: '#FF6B35', minHeight: '40px' }}
                >
                  <Link to={createPageUrl("Properties")}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Add Property</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Onboarding Restart Card - Only show if user skipped */}
        {user?.onboarding_skipped && (
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 mb-1">
                    Complete Your Guided Setup
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You previously skipped onboarding. Take 5 minutes to get personalized recommendations.
                  </p>
                  <Button
                    onClick={handleRestartOnboarding}
                    disabled={updateUserMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-purple-600 text-purple-600 hover:bg-purple-100"
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resume Setup
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Recommendations - Top Priority */}
        {recommendations.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {recommendations.slice(0, 2).map((rec, idx) => (
              <Card 
                key={idx}
                className={`border-2 shadow-lg ${
                  rec.priority === 'urgent' ? 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50' :
                  rec.priority === 'high' ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50' :
                  rec.priority === 'medium' ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50' :
                  'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                      rec.priority === 'urgent' ? 'bg-gradient-to-br from-red-600 to-red-700' :
                      rec.priority === 'high' ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                      rec.priority === 'medium' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                      'bg-gradient-to-br from-purple-600 to-purple-700'
                    }`}>
                      <rec.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-1" style={{ color: '#1B365D' }}>
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {rec.description}
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className={`gap-2 ${
                          rec.priority === 'urgent' ? 'bg-red-600 hover:bg-red-700' :
                          rec.priority === 'high' ? 'bg-orange-600 hover:bg-orange-700' :
                          rec.priority === 'medium' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        <Link to={rec.url}>
                          {rec.action}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-600 text-white text-xs">
                  {isFreeTier ? `${properties.length}/${propertyLimit}` : properties.length}
                </Badge>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>
                {properties.length}
              </p>
              <p className="text-xs text-gray-600">
                {properties.length === 1 ? 'Property' : 'Properties'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                {highPriorityTasks.length > 0 && (
                  <Badge className="bg-red-600 text-white text-xs animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>
                {highPriorityTasks.length}
              </p>
              <p className="text-xs text-gray-600">Priority Tasks</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold mb-1 text-green-700">
                ${(totalPrevented / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-600">Prevented</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-600 text-white text-xs">
                  {completedTasksThisMonth}
                </Badge>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>
                {avgHealthScore}
              </p>
              <p className="text-xs text-gray-600">Health Score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    <Calendar className="w-5 h-5" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        task.daysUntil === 0 ? 'bg-red-600' :
                        task.daysUntil <= 3 ? 'bg-orange-600' :
                        'bg-blue-600'
                      }`}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-600">
                          {task.daysUntil === 0 ? 'Today' :
                           task.daysUntil === 1 ? 'Tomorrow' :
                           `In ${task.daysUntil} days`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link to={createPageUrl("Schedule")}>
                      View All Scheduled Tasks
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Phase Progress */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                  <Target className="w-5 h-5" />
                  360° Method Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PhaseProgressCard
                  phase="AWARE"
                  icon={Eye}
                  color="#3B82F6"
                  progress={avgBaselineCompletion}
                  description="Document systems and inspect property"
                  action="Continue"
                  actionUrl={createPageUrl("Baseline")}
                  compact={true}
                />
                
                <PhaseProgressCard
                  phase="ACT"
                  icon={Zap}
                  color="#FF6B35"
                  progress={highPriorityTasks.length > 0 ? 50 : 100}
                  description="Prioritize and schedule maintenance"
                  action="View Tasks"
                  actionUrl={createPageUrl("Prioritize")}
                  compact={true}
                />
                
                <PhaseProgressCard
                  phase="ADVANCE"
                  icon={TrendingUp}
                  color="#28A745"
                  progress={totalPrevented > 0 ? 75 : 0}
                  description="Preserve value and scale"
                  action="View Progress"
                  actionUrl={createPageUrl("Preserve")}
                  compact={true}
                />
              </CardContent>
            </Card>

            {/* Seasonal Suggestions */}
            {primaryProperty && (
              <SeasonalTaskSuggestions 
                propertyId={primaryProperty.id}
                property={primaryProperty}
                compact={true}
              />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Health Score Gauge */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                  <Activity className="w-4 h-4" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HealthScoreGauge score={avgHealthScore} />
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Baseline</span>
                    <span className="font-bold">{avgBaselineCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                      style={{ width: `${avgBaselineCompletion}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <activity.icon className={`w-4 h-4 ${
                            activity.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                  <Sparkles className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Link to={createPageUrl("Inspect")}>
                    <ClipboardCheck className="w-4 h-4" />
                    Start Inspection
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Link to={createPageUrl("Services")}>
                    <Wrench className="w-4 h-4" />
                    Request Service
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Link to={createPageUrl("Resources")}>
                    <BookOpen className="w-4 h-4" />
                    Browse Resources
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Service Member Badge */}
            {isServiceMember && user?.operator_name && (
              <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900 mb-1 text-sm">
                        Service Member
                      </p>
                      <p className="text-xs text-gray-700 mb-2">
                        Operator: <strong>{user.operator_name}</strong>
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full border-green-600 text-green-600 hover:bg-green-100"
                      >
                        <Link to={createPageUrl("Services")}>
                          Manage Service
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Property Limit Warning */}
        {!canAddProperty && (
          <Card className="border-2 border-orange-300 bg-orange-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900 mb-1">
                    Property Limit Reached
                  </p>
                  <p className="text-sm text-orange-700 mb-2">
                    You have {properties.length} of {propertyLimit} properties. Upgrade to add more.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Link to={createPageUrl("Pricing")}>
                      View Plans & Pricing
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contextual Upgrade Prompt */}
        {showUpgradePrompt && isFreeTier && (
          <div className="mb-6">
            <UpgradePrompt
              context="cascade_alerts"
              onDismiss={() => setShowUpgradePrompt(false)}
            />
          </div>
        )}

        {/* Free Tier CTA */}
        {isFreeTier && !showUpgradePrompt && avgBaselineCompletion >= 33 && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                Ready for More?
              </h3>
              <p className="text-gray-700 mb-4">
                Unlock advanced features, add more properties, or get professional help.
              </p>
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="shadow-lg"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Pricing")}>
                    <Award className="w-4 h-4 mr-2" />
                    View Plans & Pricing
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("HomeCare")}>
                    <Users className="w-4 h-4 mr-2" />
                    Explore HomeCare
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}