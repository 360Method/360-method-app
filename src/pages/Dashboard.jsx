import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
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
  Calendar,
  Target,
  Activity,
  Flame,
  Award,
  ArrowUpRight,
  Wrench,
  BookOpen,
  Users,
  Building2,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TierBadge from "../components/upgrade/TierBadge";
import SeasonalTaskSuggestions from "../components/schedule/SeasonalTaskSuggestions";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import { useDemo } from "../components/shared/DemoContext";
import PreviewBanner from "../components/shared/PreviewBanner";
import QuickPropertyAdd from "../components/properties/QuickPropertyAdd";
import NextStepCard from "../components/dashboard/NextStepCard";
import MethodProgressWidget from "../components/dashboard/MethodProgressWidget";
import DemoInfoTooltip from "../components/demo/DemoInfoTooltip";
import InvestorDashboard from '../components/dashboard/InvestorDashboard';
import HomeownerDashboard from '../components/dashboard/HomeownerDashboard';

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { demoMode, demoData, enterDemoMode, isInvestor, isHomeowner } = useDemo();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [selectedPropertyFilter, setSelectedPropertyFilter] = React.useState('all');
  const [showAddTaskDialog, setShowAddTaskDialog] = React.useState(false);
  const [showQuickPropertyAdd, setShowQuickPropertyAdd] = React.useState(false);
  const [methodExpanded, setMethodExpanded] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: realProperties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    },
    enabled: !demoMode,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const properties = (demoMode && realProperties.length === 0)
    ? (isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []))
    : realProperties;

  console.log('=== DASHBOARD STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Real properties:', realProperties);
  console.log('Properties (final):', properties);
  console.log('Should show demo option:', !demoMode && realProperties.length === 0);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const filteredProperty = selectedPropertyFilter === 'all' ? null :
    properties.find(p => p.id === selectedPropertyFilter);

  const isShowingAllProperties = selectedPropertyFilter === 'all';
  const displayProperties = isShowingAllProperties ? properties : (filteredProperty ? [filteredProperty] : []);

  const activePropertyIds = properties.map(p => p.id);

  const { data: allSystems = [] } = useQuery({
    queryKey: ['allSystemBaselines', selectedPropertyFilter, demoMode],
    queryFn: async () => {
      if (demoMode && realProperties.length === 0) {
        return demoData?.systems || [];
      }

      if (selectedPropertyFilter === 'all') {
        const allSystemsList = await base44.entities.SystemBaseline.list();
        return allSystemsList.filter(s => activePropertyIds.includes(s.property_id));
      } else {
        return base44.entities.SystemBaseline.filter({ property_id: selectedPropertyFilter });
      }
    },
    enabled: !demoMode || (demoMode && realProperties.length === 0),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['allMaintenanceTasks', selectedPropertyFilter, demoMode],
    queryFn: async () => {
      if (demoMode && realProperties.length === 0) {
        return demoData?.tasks || [];
      }

      if (selectedPropertyFilter === 'all') {
        const allTasksList = await base44.entities.MaintenanceTask.list('-created_date');
        return allTasksList.filter(t => activePropertyIds.includes(t.property_id));
      } else {
        return base44.entities.MaintenanceTask.filter({ property_id: selectedPropertyFilter }, '-created_date');
      }
    },
    enabled: !demoMode || (demoMode && realProperties.length === 0),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['allInspections', selectedPropertyFilter, demoMode],
    queryFn: async () => {
      if (demoMode && realProperties.length === 0) {
        return demoData?.inspections || [];
      }

      if (selectedPropertyFilter === 'all') {
        const allInspectionsList = await base44.entities.Inspection.list('-created_date');
        return allInspectionsList.filter(i => activePropertyIds.includes(i.property_id));
      } else {
        return base44.entities.Inspection.filter({ property_id: selectedPropertyFilter }, '-created_date');
      }
    },
    enabled: !demoMode || (demoMode && realProperties.length === 0),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    }
  });

  const currentTier = user?.tier || 'free';
  const propertyLimit = user?.property_limit || 1;
  const isFreeTier = currentTier === 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');
  const canAddProperty = properties.length < propertyLimit;

  const avgHealthScore = displayProperties.length > 0 ?
    Math.round(displayProperties.reduce((sum, p) => sum + (p.health_score || 0), 0) / displayProperties.length) :
    0;

  const avgBaselineCompletion = displayProperties.length > 0 ?
    Math.round(displayProperties.reduce((sum, p) => sum + (p.baseline_completion || 0), 0) / displayProperties.length) :
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

  const totalSpent = displayProperties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalPrevented = displayProperties.reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);

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

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

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

  const handleQuickPropertySuccess = (propertyId) => {
    setShowQuickPropertyAdd(false);
    navigate(`/baseline?propertyId=${propertyId}&welcome=true`);
  };

  const handleNextStepAction = (actionKey) => {
    switch (actionKey) {
      case 'add-property':
        setShowQuickPropertyAdd(true);
        break;
      case 'continue-baseline':
        navigate(createPageUrl("Baseline") + (filteredProperty ? `?property=${filteredProperty.id}` : ''));
        break;
      case 'view-urgent':
        navigate(createPageUrl("Prioritize") + (filteredProperty ? `?property=${filteredProperty.id}` : ''));
        break;
      case 'open-schedule':
        navigate(createPageUrl("Schedule") + (filteredProperty ? `?property=${filteredProperty.id}` : ''));
        break;
      case 'execute-today':
        navigate(createPageUrl("Execute") + (filteredProperty ? `?property=${filteredProperty.id}` : ''));
        break;
      case 'explore-upgrades':
        navigate(createPageUrl("Upgrade") + (filteredProperty ? `?property=${filteredProperty.id}` : ''));
        break;
      default:
        console.warn(`Unknown actionKey: ${actionKey}`);
    }
  };

  const showDemoOption = !demoMode && realProperties.length === 0;

  const getCompletedSteps = () => {
    const completed = [];
    if (avgBaselineCompletion >= 66) completed.push(1);
    if (allInspections.length > 0) completed.push(2);
    if (totalSpent > 0) completed.push(3);
    if (allTasks.length > 0) completed.push(4);
    if (scheduledTasks.length > 0) completed.push(5);
    if (completedTasksThisMonth > 0) completed.push(6);
    if (totalPrevented > 0) completed.push(7);
    if (properties.length > 1) completed.push(9);
    return completed;
  };

  // Route to investor dashboard if in investor demo mode
  if (isInvestor && demoMode) {
    return <InvestorDashboard data={demoData} />;
  }

  // Route to homeowner dashboard if in homeowner demo mode
  if (isHomeowner && demoMode && properties.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              {properties[0]?.address || 'Your Property'} Dashboard
            </p>
          </div>
          <HomeownerDashboard
            property={properties[0]}
            systems={allSystems}
            tasks={allTasks}
            inspections={allInspections}
          />
        </div>
      </div>
    );
  }

  if (properties.length === 0 && !demoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="mobile-container md::max-w-5xl md:mx-auto pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '28px' }}>
                {greeting}, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600">
                Welcome to your 360° Method Command Center
              </p>
            </div>
            <TierBadge tier={currentTier} />
          </div>

          {showDemoOption && (
            <Card className="border-2 border-blue-400 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  New here? Explore our demo property first
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  See a fully documented property with 16 systems, prioritized tasks,
                  and maintenance schedule. No commitment required.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    Demo Property: 2847 Maple Grove Ln, Vancouver WA
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-blue-600 font-semibold">16 Systems</p>
                      <p className="text-blue-700">Fully documented</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-semibold">8 Tasks</p>
                      <p className="text-blue-700">1 urgent, 3 high</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-semibold">Health: 78/100</p>
                      <p className="text-blue-700">$7.2K saved</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      console.log('User clicked Explore Demo');
                      enterDemoMode();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    style={{ minHeight: '48px' }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Explore Demo Property
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowQuickPropertyAdd(true)}
                    className="flex-1"
                    style={{ minHeight: '48px' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add My Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-blue-300 bg-white mb-6 shadow-xl">
            <CardHeader>
              <CardTitle style={{ color: '#1B365D', fontSize: '24px' }}>
                Welcome to Your Property Command Center
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Prevent disasters. Build wealth. Sleep soundly.
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                The 360° Method helps you prevent small $50 problems from becoming $5,000 disasters.
                Most homeowners save <strong>$27,000-$72,000</strong> over 10-15 years through systematic maintenance.
              </p>

              <Button
                size="lg"
                className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowQuickPropertyAdd(true)}
                style={{ minHeight: '56px', fontSize: '16px' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add My Property to Get Started
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() => setMethodExpanded(!methodExpanded)}
                style={{ minHeight: '44px' }}
              >
                {methodExpanded ? (
                  <>
                    <ChevronDown className="w-4 h-4 rotate-180" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Learn More About the 360° Method
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {methodExpanded && (
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
          )}

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

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Prefer to add your property manually?
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Link to={createPageUrl("Properties")}>
                <Plus className="w-4 h-4" />
                Add Property Manually
              </Link>
            </Button>
          </div>

          <QuickPropertyAdd
            open={showQuickPropertyAdd}
            onClose={() => setShowQuickPropertyAdd(false)}
            onSuccess={handleQuickPropertySuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        {/* Hero Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
                  {greeting}, {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <DemoInfoTooltip
                  title="Your Command Center"
                  content="Your command center shows property health, upcoming tasks, and savings from prevention. Navigate using the sidebar to explore each of the 9 steps."
                />
              </div>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>
                {demoMode ? 'Exploring demo property' : (
                  isShowingAllProperties ?
                    `Managing ${displayProperties.length} ${displayProperties.length === 1 ? 'property' : 'properties'}` :
                    `Viewing: ${filteredProperty?.address || filteredProperty?.street_address || 'Property'}`
                )}
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

        {properties.length > 1 && (
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
        )}

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

        <div className="mb-6">
          <NextStepCard
            selectedProperty={filteredProperty || (isShowingAllProperties && properties.length === 1 ? properties[0] : null)}
            tasks={allTasks}
            onAction={handleNextStepAction}
          />
        </div>

        <MethodProgressWidget
          completedSteps={getCompletedSteps()}
          properties={properties}
          selectedProperty={filteredProperty || (isShowingAllProperties && properties.length === 1 ? properties[0] : null)}
          isShowingAllProperties={isShowingAllProperties}
          systems={allSystems}
          tasks={allTasks}
          inspections={allInspections}
          avgBaselineCompletion={avgBaselineCompletion}
          allInspectionsCount={allInspections.length}
          totalSpent={totalSpent}
          allTasksCount={allTasks.length}
          scheduledTasksCount={scheduledTasks.length}
          completedTasksThisMonthCount={completedTasksThisMonth}
          totalPrevented={totalPrevented}
        />

        <div className="space-y-4 mb-6">
          <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                <Zap className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() => setShowAddTaskDialog(true)}
                  disabled={isShowingAllProperties && properties.length > 1}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Inspect") + (!isShowingAllProperties && filteredProperty ? `?property=${filteredProperty.id}` : '')}>
                    <ClipboardCheck className="w-4 h-4" />
                    Inspect
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Resources")}>
                    <BookOpen className="w-4 h-4" />
                    Resources
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Services")}>
                    <Wrench className="w-4 h-4" />
                    Get Help
                  </Link>
                </Button>
              </div>
              {isShowingAllProperties && properties.length > 1 && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                  Select a specific property above to add tasks.
                </p>
              )}
            </CardContent>
          </Card>

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
                        {new Date(task.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </Link>
                )}
              </CardContent>
            </Card>
          }

          <div className="grid md:grid-cols-2 gap-4">
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
          </div>

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

          {filteredProperty &&
            <SeasonalTaskSuggestions
              propertyId={filteredProperty.id}
              property={filteredProperty}
              compact={true} />

          }

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
                    className="bg-orange-600 hover:bg-orange-700">

                    <Link to={createPageUrl("Pricing")}>
                      View Plans & Pricing
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showAddTaskDialog && (
        <ManualTaskForm
          propertyId={filteredProperty?.id || (isShowingAllProperties && properties.length === 1 ? properties[0].id : null)}
          onComplete={() => setShowAddTaskDialog(false)}
          onCancel={() => setShowAddTaskDialog(false)}
          open={showAddTaskDialog}
        />
      )}
    </div>
  );
}