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
  RefreshCw
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
    queryFn: () => base44.entities.MaintenanceTask.list(),
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
  const isProTier = currentTier === 'pro';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');
  const canAddProperty = properties.length < propertyLimit;

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
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          {/* Welcome Header with Tier Badge */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px' }}>
              Welcome to 360° Method
            </h1>
            <TierBadge tier={currentTier} />
          </div>

          {/* Onboarding Prompt if not completed */}
          {!user?.onboarding_completed && (
            <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
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

  // For single property, get the first property for seasonal suggestions
  const primaryProperty = properties[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header with Tier Badge and Add Property */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <TierBadge tier={currentTier} />
              <Button
                asChild
                size="sm"
                style={{ backgroundColor: '#FF6B35', minHeight: '40px' }}
              >
                <Link to={createPageUrl("Properties")}>
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Add Property</span>
                </Link>
              </Button>
            </div>
          </div>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            Your property portfolio at a glance
          </p>
        </div>

        {/* Onboarding Restart Card - Only show if user skipped or wants to revisit */}
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
                    You previously skipped onboarding. Take 5 minutes to complete the guided setup and get personalized recommendations.
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
                        Resume Guided Setup
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Service Member Status */}
        {isServiceMember && user?.operator_name && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-1">
                    ✨ Service Member
                  </p>
                  <p className="text-sm text-green-700">
                    Your operator: <strong>{user.operator_name}</strong>
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-600"
                >
                  <Link to={createPageUrl("Services")}>
                    Manage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seasonal Task Suggestions - Compact version for dashboard */}
        {primaryProperty && (
          <SeasonalTaskSuggestions 
            propertyId={primaryProperty.id}
            property={primaryProperty}
            compact={true}
          />
        )}

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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Home className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {properties.length}
              </p>
              <p className="text-sm text-gray-600">
                {isFreeTier ? `of ${propertyLimit}` : 'Properties'}
              </p>
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

        {/* Health Score */}
        <Card className="border-none shadow-sm mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle style={{ color: '#1B365D', fontSize: '18px' }}>
                Portfolio Health Score
              </CardTitle>
              {isFreeTier && (
                <Badge variant="outline" className="text-xs">
                  Limited on Free
                </Badge>
              )}
            </div>
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

        {/* Phase Progress Cards */}
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

        {/* High Priority Alert */}
        {highPriorityTasks > 0 && (
          <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#DC3545', backgroundColor: '#FFF5F5' }}>
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

        {/* Free Tier CTA at bottom */}
        {isFreeTier && !showUpgradePrompt && avgBaselineCompletion >= 33 && (
          <Card className="border-2 border-purple-300 bg-purple-50">
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
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Pricing")}>
                    View Plans & Pricing
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("HomeCare")}>
                    Explore HomeCare Service
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