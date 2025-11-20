import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lightbulb as LightbulbIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Plus,
  ChevronRight,
  ChevronDown,
  Calendar,
  Trophy,
  Search,
  RefreshCw,
  PauseCircle,
  Info
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UpgradeProjectCard from "../components/upgrade/UpgradeProjectCard";
import UpgradeDialog from "../components/upgrade/UpgradeDialog";
import StepNavigation from "../components/navigation/StepNavigation";
import ServiceAvailabilityBanner from "../components/shared/ServiceAvailabilityBanner";
import MyProjectsTab from "../components/upgrade/MyProjectsTab";
import BrowseIdeasTab from "../components/upgrade/BrowseIdeasTab";
import { shouldShowMemberBenefits, isServiceAvailableForProperty } from "@/components/shared/serviceAreas";
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';

export default function Upgrade() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const showNewForm = searchParams.get('new') === 'true';
  const templateIdFromUrl = searchParams.get('template');
  const propertyIdFromUrl = searchParams.get('property');
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();

  React.useEffect(() => {
    if (demoMode) markStepVisited(8);
  }, [demoMode, markStepVisited]);

  const [showNewProjectForm, setShowNewProjectForm] = React.useState(showNewForm);
  const [editingProject, setEditingProject] = React.useState(null);
  const [templateId, setTemplateId] = React.useState(templateIdFromUrl);
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || null);
  const [whyExpanded, setWhyExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('projects');
  const [showDeferred, setShowDeferred] = React.useState(false);

  React.useEffect(() => {
    if (showNewForm && templateIdFromUrl) {
      setShowNewProjectForm(true);
      setTemplateId(templateIdFromUrl);
    }
  }, [showNewForm, templateIdFromUrl]);

  const { data: properties = [], refetch: refetchProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => {
      if (demoMode) {
        return isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
      }
      return base44.entities.Property.list();
    }
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['upgradeTemplates'],
    queryFn: () => base44.entities.UpgradeTemplate.list(),
    enabled: !demoMode
  });

  const { data: realUpgrades = [], refetch: refetchUpgrades, isLoading: upgradesLoading } = useQuery({
    queryKey: ['upgrades', selectedProperty],
    queryFn: async () => {
      if (demoMode) {
        if (isInvestor) {
          // Filter investor demo upgrades by property or show all
          if (!selectedProperty) return demoData?.upgrades || [];
          return demoData?.upgrades?.filter(u => u.property_id === selectedProperty) || [];
        }
        return demoData?.upgradeProjects || demoData?.upgrades || [];
      }
      
      let upgrades;
      if (selectedProperty) {
        upgrades = await base44.entities.Upgrade.filter({ property_id: selectedProperty }, '-created_date');
      } else {
        upgrades = await base44.entities.Upgrade.list('-created_date');
      }
      return upgrades || [];
    },
    enabled: !!selectedProperty || properties.length === 0,
  });

  const allUpgrades = realUpgrades;

  console.log('=== UPGRADE STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Upgrades:', allUpgrades);
  console.log('Upgrades count:', allUpgrades?.length);

  const canEdit = !demoMode;

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      console.log('🏠 Auto-selecting first property:', properties[0].id);
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Get current property object
  const currentProperty = properties.find(p => p.id === selectedProperty);

  // Filter projects by status
  const activeProjects = allUpgrades.filter(u =>
    ['Identified', 'Planned', 'In Progress', 'Researching', 'Wishlist'].includes(u.status)
  );

  const completedProjects = allUpgrades.filter(u =>
    u.status === 'Completed'
  );

  const deferredProjects = allUpgrades.filter(u =>
    u.status === 'Deferred'
  );

  // CRITICAL FIX: Only count visible projects (active + completed, NOT deferred)
  const visibleProjectCount = activeProjects.length + completedProjects.length;

  const totalInvestment = completedProjects.reduce((sum, p) =>
    sum + (p.actual_cost || p.investment_required || 0), 0
  );

  const totalEquityGained = completedProjects.reduce((sum, p) =>
    sum + (p.property_value_impact || p.property_value_increase || 0), 0
  );

  const netEquityGrowth = totalEquityGained - totalInvestment;

  const currentTier = user?.subscription_tier || 'free';
  
  const showMemberPricing = shouldShowMemberBenefits(user, currentProperty);
  const memberDiscountTier = showMemberPricing ? currentTier : 0;
  const displayMemberDiscountPercentage = currentTier.includes('essential') ? 0.05
    : currentTier.includes('premium') ? 0.10
    : currentTier.includes('elite') ? 0.15
    : 0;

  const handleFormComplete = () => {
    console.log('✅ Form completed callback triggered');
    console.log('Switching to projects tab and refetching data');
    
    setShowNewProjectForm(false);
    setEditingProject(null);
    setTemplateId(null);
    
    // Clear URL params
    window.history.replaceState({}, '', createPageUrl("Upgrade"));
    
    // CRITICAL: Force refetch of upgrades
    refetchUpgrades();
    
    // Switch to "Your Projects" tab
    setActiveTab('projects');
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetchUpgrades();
    refetchProperties();
  };

  if (showNewProjectForm || editingProject) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-6 md:pt-8">
          <UpgradeDialog
            properties={properties}
            project={editingProject}
            templateId={templateId}
            memberDiscount={memberDiscountTier}
            onComplete={handleFormComplete}
            onCancel={handleFormComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={8} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> 4 upgrade projects (energy efficiency + quality of life). Read-only example.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-green-600 text-white text-sm px-3 py-1">
              Phase III - ADVANCE
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 8 of 9
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Upgrade
            </h1>
            <DemoInfoTooltip 
              title="Step 8: Upgrade"
              content="Plan improvements that increase value or reduce costs. Track budget, milestones, ROI. Includes energy upgrades AND quality-of-life projects."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Strategic improvements that increase value or reduce costs
          </p>
        </div>

        {/* NEW: Step Education Card */}
        <StepEducationCard 
          {...STEP_EDUCATION.upgrade}
          defaultExpanded={false}
          className="mb-6"
        />

        {/* Service Availability Banner */}
        <ServiceAvailabilityBanner user={user} property={currentProperty} className="mb-6" />

        {/* Why This Step Matters */}
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <LightbulbIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Why Upgrade Matters</h3>
                <p className="text-sm text-green-800">
                  Upgrade transforms maintenance from a cost center into an investment strategy. Build wealth through improvements that increase property value, reduce costs, or boost rental income.
                </p>
              </div>
              {whyExpanded ? (
                <ChevronDown className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </button>
          </CardHeader>
          {whyExpanded && (
            <CardContent className="pt-0">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">🎯 In the 360° Method Framework:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Upgrade is Step 8 in ADVANCE. While Preserve protects your current investment, Upgrade grows it. This step uses your property baseline and market data to recommend improvements with proven ROI.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">💡 Strategic Categories:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• <strong>High ROI:</strong> Kitchen/bath upgrades returning 100%+ at sale</li>
                    <li>• <strong>Energy Efficiency:</strong> Reduce costs, increase comfort</li>
                    <li>• <strong>Rental Boosters:</strong> Increase rent potential 10-30%</li>
                    <li>• <strong>Curb Appeal:</strong> Fast sales and higher offers</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded p-3 border-l-4 border-green-600">
                  <p className="text-xs text-green-900">
                    <strong>ROI Focus:</strong> Target upgrades with 70%+ ROI at resale or 2-3 year payback on energy savings. Track results to validate your strategy.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Property</label>
                  <Select value={selectedProperty || ''} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!demoMode && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleManualRefresh}
                    disabled={upgradesLoading}
                    title="Refresh data"
                    style={{ minHeight: '48px', minWidth: '48px' }}
                  >
                    <RefreshCw className={`w-5 h-5 ${upgradesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed Interface for All Modes */}
        {selectedProperty && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger 
                value="projects" 
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Trophy className="w-5 h-5" />
                <span>My Projects ({allUpgrades.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="browse" 
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <LightbulbIcon className="w-5 h-5" />
                <span>Browse Ideas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
              <MyProjectsTab projects={allUpgrades} demoMode={demoMode} />
            </TabsContent>

            <TabsContent value="browse" className="mt-6">
              <BrowseIdeasTab />
            </TabsContent>
          </Tabs>
        )}

      </div>
    </div>
  );
}