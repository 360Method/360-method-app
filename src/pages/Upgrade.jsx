import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Pause,
  Activity
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UpgradeProjectCard from "../components/upgrade/UpgradeProjectCard";
import UpgradeDialog from "../components/upgrade/UpgradeDialog";
import StepNavigation from "../components/navigation/StepNavigation";
import ServiceAvailabilityBanner from "../components/shared/ServiceAvailabilityBanner";
import { shouldShowMemberBenefits, isServiceAvailableForProperty } from "@/components/shared/serviceAreas";

export default function Upgrade() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const showNewForm = searchParams.get('new') === 'true';
  const templateIdFromUrl = searchParams.get('template');
  const propertyIdFromUrl = searchParams.get('property');

  const [showNewProjectForm, setShowNewProjectForm] = React.useState(showNewForm);
  const [editingProject, setEditingProject] = React.useState(null);
  const [templateId, setTemplateId] = React.useState(templateIdFromUrl);
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || null);
  const [whyExpanded, setWhyExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('browse');
  const [statusFilter, setStatusFilter] = React.useState('all');

  React.useEffect(() => {
    if (showNewForm && templateIdFromUrl) {
      setShowNewProjectForm(true);
      setTemplateId(templateIdFromUrl);
    }
  }, [showNewForm, templateIdFromUrl]);

  const { data: properties = [], refetch: refetchProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUpgrades = [], refetch: refetchUpgrades, isLoading: upgradesLoading } = useQuery({
    queryKey: ['upgrades', selectedProperty],
    queryFn: async () => {
      console.log('📊 Fetching upgrades...');
      console.log('Selected property:', selectedProperty);
      
      let upgrades;
      if (selectedProperty) {
        console.log('🔍 Filtering by property_id:', selectedProperty);
        upgrades = await base44.entities.Upgrade.filter({ property_id: selectedProperty }, '-created_date');
      } else {
        console.log('📋 Fetching all upgrades');
        upgrades = await base44.entities.Upgrade.list('-created_date');
      }
      
      console.log('✅ Fetched upgrades:', upgrades);
      console.log('Count:', upgrades?.length || 0);
      
      // Log status breakdown for debugging
      if (upgrades && upgrades.length > 0) {
        const statusCounts = upgrades.reduce((acc, u) => {
          acc[u.status] = (acc[u.status] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Status breakdown:', statusCounts);
      }
      
      return upgrades || [];
    },
    enabled: !!selectedProperty || properties.length === 0,
  });

  React.useEffect(() => {
    console.log('🔄 Upgrades data updated:', allUpgrades);
  }, [allUpgrades]);

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      console.log('🏠 Auto-selecting first property:', properties[0].id);
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Get current property object
  const currentProperty = properties.find(p => p.id === selectedProperty);

  // Filter projects by status
  const inProgressProjects = allUpgrades.filter(u => u.status === 'In Progress');
  const plannedProjects = allUpgrades.filter(u => u.status === 'Planned');
  const identifiedProjects = allUpgrades.filter(u => u.status === 'Identified');
  const completedProjects = allUpgrades.filter(u => u.status === 'Completed');
  const deferredProjects = allUpgrades.filter(u => u.status === 'Deferred');

  // Active = In Progress + Planned
  const activeProjects = [...inProgressProjects, ...plannedProjects];

  // Apply status filter for display
  const filteredProjects = statusFilter === 'all' 
    ? allUpgrades 
    : allUpgrades.filter(u => {
        if (statusFilter === 'active') return u.status === 'In Progress' || u.status === 'Planned';
        if (statusFilter === 'completed') return u.status === 'Completed';
        if (statusFilter === 'identified') return u.status === 'Identified';
        if (statusFilter === 'deferred') return u.status === 'Deferred';
        return true;
      });

  const totalInvestment = completedProjects.reduce((sum, p) =>
    sum + (p.actual_cost || p.investment_required || 0), 0
  );

  const totalEquityGained = completedProjects.reduce((sum, p) =>
    sum + (p.property_value_impact || 0), 0
  );

  const netEquityGrowth = totalEquityGained - totalInvestment;

  const currentTier = user?.subscription_tier || 'free';
  
  // Check service availability for CURRENT PROPERTY
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={8} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Upgrade
          </h1>
          <p className="text-gray-600 text-lg">
            Strategic improvements that pay for themselves
          </p>
        </div>

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
                {/* Debug Refresh Button */}
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger 
              value="browse" 
              className="flex items-center gap-2 py-3"
              style={{ minHeight: '56px' }}
            >
              <Search className="w-5 h-5" />
              <span>Browse Ideas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="flex items-center gap-2 py-3"
              style={{ minHeight: '56px' }}
            >
              <Trophy className="w-5 h-5" />
              <span>Your Projects ({allUpgrades.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BROWSE IDEAS */}
          <TabsContent value="browse" className="mt-6 space-y-6">
            
            {/* Member Discount Banner - ONLY if service available */}
            {showMemberPricing && (
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge style={{ backgroundColor: '#8B5CF6' }} className="flex-shrink-0">
                      MEMBER BENEFIT
                    </Badge>
                    <div>
                      <p className="font-semibold text-purple-900 mb-1">
                        💰 {displayMemberDiscountPercentage * 100}% Discount on ALL Upgrades
                      </p>
                      <p className="text-sm text-purple-700 mb-2">
                        Save thousands through your operator's pre-negotiated contractor network.
                      </p>
                      <div className="text-sm text-purple-800">
                        <p>• $25K kitchen → Save ${(25000 * displayMemberDiscountPercentage).toLocaleString()}</p>
                        <p>• $45K addition → Save ${(45000 * displayMemberDiscountPercentage).toLocaleString()}</p>
                        <p>• $8K HVAC → Save ${(8000 * displayMemberDiscountPercentage).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Explore Templates CTA */}
            <Card className="border-2 border-blue-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                      💡 Get Inspired by Proven Upgrades
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Browse 15+ high-ROI improvements with real numbers, beautiful examples, and {showMemberPricing ? 'automatic member savings calculations' : 'detailed cost breakdowns'}
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Button
                        asChild
                        className="font-bold"
                        style={{ backgroundColor: '#3B82F6', minHeight: '48px' }}
                      >
                        <Link to={createPageUrl("ExploreTemplates") + `?property=${selectedProperty || ''}`}>
                          <Trophy className="w-5 h-5 mr-2" />
                          Browse All Ideas
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        style={{ minHeight: '48px' }}
                      >
                        <Link to={createPageUrl("ExploreTemplates") + `?category=High ROI Renovations&property=${selectedProperty || ''}`}>
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Highest ROI
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        style={{ minHeight: '48px' }}
                      >
                        <Link to={createPageUrl("ExploreTemplates") + `?category=Energy Efficiency&property=${selectedProperty || ''}`}>
                          <Zap className="w-5 h-5 mr-2" />
                          Energy Savings
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Custom Project */}
            <Card className="border-2 border-green-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                      Start a Custom Project
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Track your own renovation idea with automatic ROI calculation {showMemberPricing ? 'and member discount pricing' : ''}
                    </p>
                    <Button
                      onClick={() => setShowNewProjectForm(true)}
                      className="font-bold"
                      style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Custom Project
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* TAB 2: YOUR PROJECTS */}
          <TabsContent value="projects" className="mt-6 space-y-6">
            
            {/* Loading State */}
            {upgradesLoading && (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading your projects...</p>
              </div>
            )}

            {!upgradesLoading && allUpgrades.length > 0 && (
              <>
                {/* Project Summary Stats */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-semibold text-blue-900">In Progress</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{inProgressProjects.length}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <p className="text-xs font-semibold text-orange-900">Planned</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{plannedProjects.length}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <LightbulbIcon className="w-4 h-4 text-yellow-600" />
                          <p className="text-xs font-semibold text-yellow-900">Identified</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">{identifiedProjects.length}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-semibold text-green-900">Completed</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{completedProjects.length}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Pause className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-semibold text-gray-900">Deferred</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-700">{deferredProjects.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    All ({allUpgrades.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('active')}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Active ({activeProjects.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'identified' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('identified')}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    <LightbulbIcon className="w-4 h-4 mr-1" />
                    Identified ({identifiedProjects.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('completed')}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Completed ({completedProjects.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'deferred' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('deferred')}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Deferred ({deferredProjects.length})
                  </Button>
                </div>
              </>
            )}

            {/* Wealth Impact Summary */}
            {!upgradesLoading && completedProjects.length > 0 && (
              <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                    <Trophy className="w-6 h-6 text-green-600" />
                    Your Upgrade Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Total Invested</p>
                      <p className="text-2xl font-bold text-blue-700">
                        ${totalInvestment.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Value Added</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${totalEquityGained.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Net Wealth Gain</p>
                      <p className="text-2xl font-bold text-green-700">
                        +${netEquityGrowth.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Lifetime ROI</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {totalInvestment > 0 ? Math.round((totalEquityGained / totalInvestment) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects List */}
            {!upgradesLoading && filteredProjects.length > 0 && (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <UpgradeProjectCard
                    key={project.id}
                    project={project}
                    properties={properties}
                    memberDiscount={memberDiscountTier}
                    onEdit={() => setEditingProject(project)}
                  />
                ))}
              </div>
            )}

            {/* Empty State - No Projects */}
            {!upgradesLoading && allUpgrades.length === 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <LightbulbIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-gray-600 mb-2">
                    Start building equity and increasing property value
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Browse inspiring upgrade ideas with proven ROI data
                  </p>
                  <div className="flex flex-col md:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setActiveTab('browse')}
                      style={{ backgroundColor: '#3B82F6', minHeight: '48px' }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Explore Upgrade Ideas
                    </Button>
                    <Button
                      onClick={() => setShowNewProjectForm(true)}
                      variant="outline"
                      style={{ minHeight: '48px' }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Custom Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State - Filtered */}
            {!upgradesLoading && allUpgrades.length > 0 && filteredProjects.length === 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Projects Match Filter</h3>
                  <p className="text-gray-600 mb-4">
                    No projects with status: {statusFilter}
                  </p>
                  <Button
                    onClick={() => setStatusFilter('all')}
                    variant="outline"
                    style={{ minHeight: '48px' }}
                  >
                    Show All Projects
                  </Button>
                </CardContent>
              </Card>
            )}

          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}