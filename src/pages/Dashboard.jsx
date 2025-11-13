
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MapPin,
  Building2 } from
"lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import PhaseProgressCard from "../components/dashboard/PhaseProgressCard";
import UpgradePrompt from "../components/upgrade/UpgradePrompt";
import TierBadge from "../components/upgrade/TierBadge";
import SeasonalTaskSuggestions from "../components/schedule/SeasonalTaskSuggestions";
import MiniCalendar from "../components/dashboard/MiniCalendar";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [selectedPropertyFilter, setSelectedPropertyFilter] = React.useState('all');

  // Update time every minute for "good morning" greeting
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    }
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Determine which property to show based on filter
  const filteredProperty = selectedPropertyFilter === 'all' ? null : 
    properties.find(p => p.id === selectedPropertyFilter);
  
  const isShowingAllProperties = selectedPropertyFilter === 'all';
  const displayedProperties = isShowingAllProperties ? properties : (filteredProperty ? [filteredProperty] : []);

  // Fetch data based on selected property filter
  const { data: allSystems = [] } = useQuery({
    queryKey: ['allSystemBaselines', selectedPropertyFilter],
    queryFn: () => {
      if (selectedPropertyFilter === 'all') {
        return base44.entities.SystemBaseline.list();
      } else {
        return base44.entities.SystemBaseline.filter({ property_id: selectedPropertyFilter });
      }
    },
    enabled: displayedProperties.length > 0
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['allMaintenanceTasks', selectedPropertyFilter],
    queryFn: () => {
      if (selectedPropertyFilter === 'all') {
        return base44.entities.MaintenanceTask.list('-created_date');
      } else {
        return base44.entities.MaintenanceTask.filter({ property_id: selectedPropertyFilter }, '-created_date');
      }
    },
    enabled: displayedProperties.length > 0
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['allInspections', selectedPropertyFilter],
    queryFn: () => {
      if (selectedPropertyFilter === 'all') {
        return base44.entities.Inspection.list('-created_date');
      } else {
        return base44.entities.Inspection.filter({ property_id: selectedPropertyFilter }, '-created_date');
      }
    },
    enabled: displayedProperties.length > 0
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    }
  });

  const currentTier = user?.subscription_tier || 'free';
  const propertyLimit = user?.property_limit || 1;
  const isFreeTier = currentTier === 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');
  const canAddProperty = properties.length < propertyLimit;

  // Calculate metrics based on displayed properties
  const avgHealthScore = displayedProperties.length > 0 ?
  Math.round(displayedProperties.reduce((sum, p) => sum + (p.health_score || 0), 0) / displayedProperties.length) :
  0;

  const avgBaselineCompletion = displayedProperties.length > 0 ?
  Math.round(displayedProperties.reduce((sum, p) => sum + (p.baseline_completion || 0), 0) / displayedProperties.length) :
  0;

  const highPriorityTasks = allTasks.filter((t) =>
  (t.priority === 'High' || t.cascade_risk_score >= 7) &&
  t.status !== 'Completed'
  );

  const scheduledTasks = allTasks.filter((t) =>
  t.status === 'Scheduled' && t.scheduled_date
  );

  const completedTasksThisMonth = allTasks.filter((t) => {
    if (!t.completion_date) return false;
    const completionDate = new Date(t.completion_date);
    const now = new Date();
    return completionDate.getMonth() === now.getMonth() &&
    completionDate.getFullYear() === now.getFullYear() &&
    t.status === 'Completed';
  }).length;

  const totalSpent = displayedProperties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalPrevented = displayedProperties.reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);

  const upcomingTasks = scheduledTasks.
  map((t) => ({
    ...t,
    daysUntil: t.scheduled_date ? Math.ceil((new Date(t.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
  })).
  filter((t) => t.daysUntil !== null && t.daysUntil >= 0).
  sort((a, b) => a.daysUntil - b.daysUntil).
  slice(0, 3);

  const recentActivity = [
  ...allTasks.filter((t) => t.created_date).slice(0, 5).map((t) => ({
    type: 'task',
    title: t.title,
    date: t.created_date,
    icon: CheckCircle2,
    color: 'blue'
  })),
  ...allInspections.filter((i) => i.created_date).slice(0, 3).map((i) => ({
    type: 'inspection',
    title: `${i.season} ${i.year} Inspection`,
    date: i.created_date,
    icon: ClipboardCheck,
    color: 'green'
  }))].
  sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

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
  const monthsSinceInspection = lastInspection?.inspection_date ?
  Math.floor((new Date() - new Date(lastInspection.inspection_date)) / (1000 * 60 * 60 * 24 * 30)) :
  999;

  if (monthsSinceInspection >= 3 && avgBaselineCompletion >= 66) {
    recommendations.push({
      title: "Time for Seasonal Inspection",
      description: lastInspection ?
      `Last inspection was ${monthsSinceInspection} months ago. Stay ahead of issues.` :
      "Start your first quarterly property inspection to catch issues early.",
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
        <div className="mobile-container md:max-w-5xl md:mx-auto pt-8">
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

          {/* Quick Start Onboarding Guide - PROMINENT */}
          <Card className="border-4 border-purple-400 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 mb-6 shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 mb-2 text-xl md:text-2xl">
                    🚀 Start Your 5-Minute Quick Setup
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                    Our guided onboarding helps you add your first property, understand how the 360° Method works, 
                    and choose the best documentation path for your needs. You'll be protecting your investment in minutes!
                  </p>

                  {/* Value Props */}
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-sm text-gray-900">Protect Your Asset</p>
                      </div>
                      <p className="text-xs text-gray-600">Prevent $25K-50K+ in disasters through proactive maintenance</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-sm text-gray-900">Increase Value</p>
                      </div>
                      <p className="text-xs text-gray-600">Documentation adds $8K-15K to resale value</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-600" />
                        <p className="font-semibold text-sm">Plan Ahead</p>
                      </div>
                      <p className="text-xs text-gray-600">Budget 2-5 years ahead with lifecycle forecasting</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleRestartOnboarding}
                    disabled={updateUserMutation.isPending}
                    className="gap-2 text-lg font-bold shadow-lg w-full md:w-auto"
                    style={{ backgroundColor: '#8B5CF6', minHeight: '56px' }}>

                    {updateUserMutation.isPending ?
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Starting...
                      </> :

                    <>
                        <Sparkles className="w-5 h-5" />
                        Start Guided Setup Now
                      </>
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The 360° Method Framework - Educational */}
          <Card className="border-2 border-blue-300 bg-white mb-6 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl md:text-3xl" style={{ color: '#1B365D' }}>
                Understanding the 360° Method
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                A proven framework for property owners and investors to protect, maintain, and grow their assets
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phase I - AWARE */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-2 text-xl">
                      Phase I: AWARE
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Know what you have.</strong> Document every system, inspect regularly, and track all maintenance. 
                      This creates your property's "digital twin" and baseline knowledge.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📝</span>
                          <p className="font-semibold text-sm">1. Baseline</p>
                        </div>
                        <p className="text-xs text-gray-600">Document all your home's main parts</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🔍</span>
                          <p className="font-semibold text-sm">2. Inspect</p>
                        </div>
                        <p className="text-xs text-gray-600">Find tiny problems early</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📊</span>
                          <p className="font-semibold text-sm">3. Track</p>
                        </div>
                        <p className="text-xs text-gray-600">Keep notes of everything you do</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase II - ACT */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-300">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-900 mb-2 text-xl">
                      Phase II: ACT
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Make smart decisions.</strong> Prioritize what matters most, schedule work strategically, 
                      and execute maintenance before small issues become expensive disasters.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🎯</span>
                          <p className="font-semibold text-sm">4. Prioritize</p>
                        </div>
                        <p className="text-xs text-gray-600">Focus on urgent fixes first & ROI</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📅</span>
                          <p className="font-semibold text-sm">5. Schedule</p>
                        </div>
                        <p className="text-xs text-gray-600">Plan when tasks and repairs will be done</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">✅</span>
                          <p className="font-semibold text-sm">6. Execute</p>
                        </div>
                        <p className="text-xs text-gray-600">DIY or hire pros</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase III - ADVANCE */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900 mb-2 text-xl">
                      Phase III: ADVANCE
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Build long-term value.</strong> Forecast future expenses, invest in strategic upgrades, 
                      and scale your operations across multiple properties for maximum ROI.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🛡️</span>
                          <p className="font-semibold text-sm">7. Preserve</p>
                        </div>
                        <p className="text-xs text-gray-600">Plan for future needs and costs</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💡</span>
                          <p className="font-semibold text-sm">8. Upgrade</p>
                        </div>
                        <p className="text-xs text-gray-600">Make smart improvements to your home</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🏢</span>
                          <p className="font-semibold text-sm">9. Scale</p>
                        </div>
                        <p className="text-xs text-gray-600">Evaluate performance and make big decisions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Bottom Line */}
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-purple-900 mb-1">The Result:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Prevent $25K-50K+ in disasters</strong> • <strong>Add $8K-15K to resale value</strong> • 
                      <strong> Budget 2-5 years ahead</strong> • <strong>Save 30%+ on maintenance costs</strong>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Free Tier Notice */}
          {isFreeTier &&
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
                    className="border-blue-600 text-blue-600 hover:bg-blue-100">

                      <Link to={createPageUrl("Pricing")}>
                        View Plans & Pricing
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          }
          
          {/* Manual Property Add Option - Bottom of Page */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Prefer to add your property manually?
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2">
              <Link to={createPageUrl("Properties")}>
                <Plus className="w-4 h-4" />
                Add Property Manually
              </Link>
            </Button>
          </div>
        </div>
      </div>);

  }

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
                {isShowingAllProperties ?
                `Managing ${displayedProperties.length} ${displayedProperties.length === 1 ? 'property' : 'properties'}` :
                `Viewing: ${filteredProperty?.address || filteredProperty?.street_address || 'Property'}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TierBadge tier={currentTier} />
              {canAddProperty &&
              <Button
                asChild
                size="sm"
                className="shadow-lg"
                style={{ backgroundColor: '#FF6B35', minHeight: '40px' }}>

                  <Link to={createPageUrl("Properties")}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Add Property</span>
                  </Link>
                </Button>
              }
            </div>
          </div>
        </div>

        {/* Property Selector - Prominent for Multi-Property Users */}
        {properties.length > 1 &&
        <Card className="mb-6 border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <Label className="text-base font-bold text-indigo-900">View Property:</Label>
                </div>
                <Select value={selectedPropertyFilter} onValueChange={setSelectedPropertyFilter}>
                  <SelectTrigger className="flex-1 md:w-96 bg-white" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">All Properties ({properties.length})</span>
                      </div>
                    </SelectItem>
                    {properties.map(prop => {
                      const doorCount = prop.door_count || 1;
                      const doorLabel = doorCount > 1 ? ` • ${doorCount} units` : '';
                      return (
                        <SelectItem key={prop.id} value={prop.id}>
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span>{prop.address || prop.street_address || 'Unnamed Property'}</span>
                            {doorCount > 1 && (
                              <Badge className="bg-purple-600 text-white text-xs ml-2">
                                {doorCount} units
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {!isShowingAllProperties && (
                  <Button
                    onClick={() => setSelectedPropertyFilter('all')}
                    variant="outline"
                    size="sm"
                    className="gap-1">
                    <Building2 className="w-4 h-4" />
                    View All
                  </Button>
                )}
              </div>
              {!isShowingAllProperties && filteredProperty && filteredProperty.door_count > 1 && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-900">
                    <strong>Multi-Unit Property:</strong> This property has {filteredProperty.door_count} units. 
                    All metrics and costs reflect the entire property.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        }

        {/* Onboarding Restart Card - Only show if user skipped */}
        {user?.onboarding_skipped &&
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
                  className="gap-2 border-purple-600 text-purple-600 hover:bg-purple-100">

                    {updateUserMutation.isPending ?
                  <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Starting...
                      </> :

                  <>
                        <RefreshCw className="w-4 h-4" />
                        Resume Setup
                      </>
                  }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        }

        {/* Smart Recommendations - Top Priority */}
        {recommendations.length > 0 &&
        <div className="grid md:grid-cols-2 gap-4 mb-6">
            {recommendations.slice(0, 2).map((rec, idx) =>
          <Card
            key={idx}
            className={`border-2 shadow-lg ${
            rec.priority === 'urgent' ? 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50' :
            rec.priority === 'high' ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50' :
            rec.priority === 'medium' ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50' :
            'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'}`
            }>

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                rec.priority === 'urgent' ? 'bg-gradient-to-br from-red-600 to-red-700' :
                rec.priority === 'high' ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                rec.priority === 'medium' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                'bg-gradient-to-br from-purple-600 to-purple-700'}`
                }>
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
                    'bg-purple-600 hover:bg-purple-700'}`
                    }>

                        <Link to={rec.url + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
                          {rec.action}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
          </div>
        }

        {/* Key Metrics Dashboard - All Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Link to={createPageUrl("Properties")}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <Badge className="bg-blue-600 text-white text-xs">
                    {isShowingAllProperties ? 
                      (isFreeTier ? `${properties.length}/${propertyLimit}` : properties.length) :
                      '1'
                    }
                  </Badge>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>
                  {displayedProperties.length}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  {displayedProperties.length === 1 ? 'Property' : 'Properties'}
                  <ChevronRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Prioritize") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-red-100 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  {highPriorityTasks.length > 0 &&
                  <Badge className="bg-red-600 text-white text-xs animate-pulse">
                      Urgent
                    </Badge>
                  }
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>
                  {highPriorityTasks.length}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  Priority Tasks
                  <ChevronRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Preserve") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-green-50 to-emerald-100 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold mb-1 text-green-700">
                  ${(totalPrevented / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  Prevented
                  <ChevronRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Track") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <Badge className="bg-purple-600 text-white text-xs">
                    {completedTasksThisMonth}
                  </Badge>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>
                  {avgHealthScore}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  Health Score
                  <ChevronRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 360° Method Progress - Unified */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 mb-6 shadow-md">
          <CardHeader className="pb-3">
            <button
              onClick={() => {
                const whyElement = document.getElementById('method-why-section');
                if (whyElement) {
                  whyElement.style.display = whyElement.style.display === 'none' ? 'block' : 'none';
                }
              }}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity">

              <Target className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <CardTitle style={{ color: '#1B365D', fontSize: '18px', marginBottom: '4px' }}>
                  Your 360° Method Progress
                </CardTitle>
                <p className="text-xs text-indigo-700 font-normal">
                  {isShowingAllProperties ?
                  `Tracking across all ${displayedProperties.length} properties` :
                  `Tracking for ${filteredProperty?.address || 'this property'}`
                  } • Click to learn why this matters
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-600 flex-shrink-0 transform transition-transform" id="method-chevron" />
            </button>
          </CardHeader>

          {/* Why This Matters - Expandable */}
          <div id="method-why-section" style={{ display: 'none' }}>
            <CardContent className="pt-0 pb-4">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-2 text-sm">💡 Why the 360° Method Matters:</h4>
                <p className="text-xs text-gray-700 leading-relaxed mb-3">
                  Most homeowners react to problems—they replace systems when they fail during peak season at emergency pricing. 
                  The 360° Method flips this: <strong>you stay ahead of issues, plan replacements on your timeline, and save 30%+ on maintenance costs.</strong>
                </p>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">🔵 AWARE: Know What You Have</p>
                    <p className="text-gray-600">Document systems, inspect regularly, track all maintenance</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">🟠 ACT: Make Smart Decisions</p>
                    <p className="text-gray-600">Prioritize by risk, schedule strategically, execute before disaster</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 mb-1">🟢 ADVANCE: Build Value</p>
                    <p className="text-gray-600">Forecast expenses, invest in upgrades, scale your portfolio</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <CardContent className="pt-0">
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              {/* Phase I - AWARE */}
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-blue-900 text-sm">I. AWARE</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3">Know what you have</p>
                <div className="space-y-2 mb-3">
                  <Link to={createPageUrl("Baseline") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-blue-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${avgBaselineCompletion >= 66 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {avgBaselineCompletion >= 66 ? '✓' : '1'}
                    </span>
                    <span className={avgBaselineCompletion >= 66 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Baseline</span>
                    {avgBaselineCompletion < 100 && avgBaselineCompletion > 0 &&
                    <span className="text-[10px] text-gray-500 ml-auto">{avgBaselineCompletion}%</span>
                    }
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                  <Link to={createPageUrl("Inspect") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-blue-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${allInspections.length > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {allInspections.length > 0 ? '✓' : '2'}
                    </span>
                    <span className={allInspections.length > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Inspect</span>
                    {allInspections.length > 0 &&
                    <span className="text-[10px] text-gray-500 ml-auto">{allInspections.length}</span>
                    }
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                  <Link to={createPageUrl("Track") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-blue-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${totalSpent > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {totalSpent > 0 ? '✓' : '3'}
                    </span>
                    <span className={totalSpent > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Track</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-blue-600 text-blue-600 hover:bg-blue-50">

                  <Link to={createPageUrl("Baseline") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
                    Take Action
                  </Link>
                </Button>
              </div>

              {/* Phase II - ACT */}
              <div className="bg-white p-4 rounded-lg border-2 border-orange-300 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-orange-900 text-sm">II. ACT</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3">Make smart decisions</p>
                <div className="space-y-2 mb-3">
                  <Link to={createPageUrl("Prioritize") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-orange-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${allTasks.length > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {allTasks.length > 0 ? '✓' : '4'}
                    </span>
                    <span className={allTasks.length > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Prioritize</span>
                    {allTasks.length > 0 &&
                    <span className="text-[10px] text-gray-500 ml-auto">{allTasks.length}</span>
                    }
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                  <Link to={createPageUrl("Schedule") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-orange-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${scheduledTasks.length > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {scheduledTasks.length > 0 ? '✓' : '5'}
                    </span>
                    <span className={scheduledTasks.length > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Schedule</span>
                    {scheduledTasks.length > 0 &&
                    <span className="text-[10px] text-gray-500 ml-auto">{scheduledTasks.length}</span>
                    }
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                  <Link to={createPageUrl("Execute") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-orange-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${completedTasksThisMonth > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {completedTasksThisMonth > 0 ? '✓' : '6'}
                    </span>
                    <span className={completedTasksThisMonth > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Execute</span>
                    {completedTasksThisMonth > 0 &&
                    <span className="text-[10px] text-gray-500 ml-auto">{completedTasksThisMonth}</span>
                    }
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-orange-600 text-orange-600 hover:bg-orange-50">

                  <Link to={createPageUrl("Prioritize") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
                    Take Action
                  </Link>
                </Button>
              </div>

              {/* Phase III - ADVANCE */}
              <div className="bg-white p-4 rounded-lg border-2 border-green-300 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-green-900 text-sm">III. ADVANCE</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3">Build long-term value</p>
                <div className="space-y-2 mb-3">
                  <Link to={createPageUrl("Preserve") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-green-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${totalPrevented > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {totalPrevented > 0 ? '✓' : '7'}
                    </span>
                    <span className={totalPrevented > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Preserve</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                  <Link to={createPageUrl("Upgrade") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')} className="flex items-center gap-2 text-xs hover:bg-green-50 p-1 rounded transition-colors">
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      8
                    </span>
                    <span className="text-gray-600">Upgrade</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                  <Link to={createPageUrl("Scale")} className="flex items-center gap-2 text-xs hover:bg-green-50 p-1 rounded transition-colors">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${properties.length > 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {properties.length > 1 ? '✓' : '9'}
                    </span>
                    <span className={properties.length > 1 ? 'text-green-700 font-semibold' : 'text-gray-600'}>Scale</span>
                    {properties.length > 1 &&
                    <span className="text-[10px] text-gray-500 ml-auto">{properties.length}</span>
                    }
                    <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-green-600 text-green-600 hover:bg-green-50">

                  <Link to={createPageUrl("Preserve") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
                    Take Action
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Overall Progress Summary */}
            <div className="p-4 bg-white rounded-lg border-2 border-indigo-300 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Overall Method Progress:</span>
                <span className="font-bold text-indigo-600">
                  {[
                  avgBaselineCompletion >= 66,
                  allInspections.length > 0,
                  totalSpent > 0,
                  allTasks.length > 0,
                  scheduledTasks.length > 0,
                  completedTasksThisMonth > 0,
                  totalPrevented > 0,
                  false, // Upgrade step
                  properties.length > 1].
                  filter(Boolean).length} of 9 steps
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-orange-500 to-green-500 transition-all"
                  style={{
                    width: `${[
                    avgBaselineCompletion >= 66,
                    allInspections.length > 0,
                    totalSpent > 0,
                    allTasks.length > 0,
                    scheduledTasks.length > 0,
                    completedTasksThisMonth > 0,
                    totalPrevented > 0,
                    false,
                    properties.length > 1].
                    filter(Boolean).length / 9 * 100}%`
                  }} />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid - Compact & Mobile-First */}
        <div className="space-y-4 mb-6">
          {/* Upcoming Tasks - Compact */}
          {upcomingTasks.length > 0 &&
          <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                    <Calendar className="w-4 h-4" />
                    Upcoming Tasks
                  </CardTitle>
                  <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs">

                    <Link to={createPageUrl("Schedule")}>
                      View All
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingTasks.slice(0, 3).map((task) =>
              <Link
                key={task.id}
                to={createPageUrl("Execute") + `?property=${task.property_id}`}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-blue-50 hover:border-blue-300 border border-transparent transition-all">

                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                task.daysUntil === 0 ? 'bg-red-600' :
                task.daysUntil <= 3 ? 'bg-orange-600' :
                'bg-blue-600'}`
                }>
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.daysUntil === 0 ? 'Today' :
                    task.daysUntil === 1 ? 'Tomorrow' :
                    `In ${task.daysUntil} days`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </Link>
              )}
              </CardContent>
            </Card>
          }

          {/* Two-Column Layout for Desktop */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Health Score & Baseline */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                  <Activity className="w-4 h-4" />
                  Property Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Health Score</p>
                    <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>{avgHealthScore}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Baseline</p>
                    <p className="text-3xl font-bold text-blue-600">{avgBaselineCompletion}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${avgBaselineCompletion}%` }} />

                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                  <Sparkles className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2">

                  <Link to={createPageUrl("Inspect") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
                    <ClipboardCheck className="w-4 h-4" />
                    Start Inspection
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2">

                  <Link to={createPageUrl("Services")}>
                    <Wrench className="w-4 h-4" />
                    Request Service
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity - Compact */}
          {recentActivity.length > 0 &&
          <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                  <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs">

                    <Link to={createPageUrl("Track")}>
                      View All
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((activity, idx) =>
                <Link
                  key={idx}
                  to={createPageUrl(activity.type === 'inspection' ? 'Inspect' : 'Track') + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors group">

                      <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                  activity.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-green-100 group-hover:bg-green-200'}`
                  }>
                        <activity.icon className={`w-4 h-4 ${
                    activity.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`
                    } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </Link>
                )}
                </div>
              </CardContent>
            </Card>
          }

          {/* Seasonal Suggestions - Compact */}
          {filteredProperty &&
          <SeasonalTaskSuggestions
            propertyId={filteredProperty.id}
            property={filteredProperty}
            compact={true} />

          }

          {/* Service Member Badge */}
          {isServiceMember && user?.operator_name &&
          <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 text-sm">Service Member</p>
                    <p className="text-xs text-gray-700">Operator: <strong>{user.operator_name}</strong></p>
                  </div>
                  <Button
                  asChild
                  variant="outline"
                  size="sm">

                    <Link to={createPageUrl("Services")}>Manage</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          }
        </div>

        {/* Property Limit Warning */}
        {!canAddProperty &&
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
                  className="bg-orange-600 hover:bg-orange-700">

                    <Link to={createPageUrl("Pricing")}>
                      View Plans & Pricing
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        }

        {/* Contextual Upgrade Prompt */}
        {showUpgradePrompt && isFreeTier &&
        <div className="mb-6">
            <UpgradePrompt
            context="cascade_alerts"
            onDismiss={() => setShowUpgradePrompt(false)} />

          </div>
        }

        {/* Free Tier CTA */}
        {isFreeTier && !showUpgradePrompt && avgBaselineCompletion >= 33 &&
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
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}>

                  <Link to={createPageUrl("Pricing")}>
                    <Award className="w-4 h-4 mr-2" />
                    View Plans & Pricing
                  </Link>
                </Button>
                <Button
                asChild
                variant="outline"
                style={{ minHeight: '48px' }}>

                  <Link to={createPageUrl("HomeCare")}>
                    <Users className="w-4 h-4 mr-2" />
                    Explore HomeCare
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        }
      </div>
    </div>);

}
