
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb as LightbulbIcon, // Renamed Lightbulb to LightbulbIcon to avoid conflict
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Zap,
  Home,
  BookOpen,
  Video,
  Calculator,
  Search,
  Filter,
  Plus,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UpgradeCard from "../components/upgrade/UpgradeCard";
import UpgradeDialog from "../components/upgrade/UpgradeDialog";
import StepNavigation from "../components/navigation/StepNavigation";

export default function Upgrade() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showNewForm = searchParams.get('new') === 'true';
  const templateIdFromUrl = searchParams.get('template');
  const propertyIdFromUrl = searchParams.get('property');

  const [showNewProjectForm, setShowNewProjectForm] = React.useState(showNewForm);
  const [editingProject, setEditingProject] = React.useState(null);
  const [templateId, setTemplateId] = React.useState(templateIdFromUrl);

  // New states for filters and educational section
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || null);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUpgrade, setSelectedUpgrade] = React.useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);
  const [whyExpanded, setWhyExpanded] = React.useState(false);

  // If URL has template param, show form automatically
  React.useEffect(() => {
    if (showNewForm && templateIdFromUrl) {
      setShowNewProjectForm(true);
      setTemplateId(templateIdFromUrl);
    }
  }, [showNewForm, templateIdFromUrl]);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUpgrades = [] } = useQuery({
    queryKey: ['upgrades', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Upgrade.filter({ property_id: selectedProperty }, '-created_date')
      : base44.entities.Upgrade.list('-created_date'),
    enabled: !!selectedProperty || properties.length === 0,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  const activeProjects = allUpgrades.filter(u =>
    u.status === 'Planned' || u.status === 'In Progress'
  );

  const plannedProjects = allUpgrades.filter(u => u.status === 'Planned');
  const inProgressProjects = allUpgrades.filter(u => u.status === 'In Progress');

  const completedProjects = allUpgrades.filter(u =>
    u.status === 'Completed'
  );

  const totalInvestment = completedProjects.reduce((sum, p) =>
    sum + (p.actual_cost || p.investment_required || 0), 0
  );

  const totalEquityGained = completedProjects.reduce((sum, p) =>
    sum + (p.property_value_impact || 0), 0
  );

  const netEquityGrowth = totalEquityGained - totalInvestment;

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');

  // Pass tier name instead of simple percentage for new discount structure
  const memberDiscountTier = isServiceMember ? currentTier : 0;

  // This old calculation is no longer needed since we are passing the tier name
  // const memberDiscount = currentTier.includes('essential') ? 0.05
  //   : currentTier.includes('premium') ? 0.10
  //   : currentTier.includes('elite') ? 0.15
  //   : 0;

  const handleFormComplete = () => {
    setShowNewProjectForm(false);
    setEditingProject(null);
    setTemplateId(null);
    // Clean up URL
    window.history.replaceState({}, '', createPageUrl("Upgrade"));
  };

  if (showNewProjectForm || editingProject) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-6 md:pt-8">
          <UpgradeDialog // Renamed from UpgradeProjectForm
            properties={properties}
            project={editingProject}
            templateId={templateId}
            memberDiscount={memberDiscountTier} // Updated here
            onComplete={handleFormComplete}
            onCancel={handleFormComplete}
          />
        </div>
      </div>
    );
  }

  // Determine the actual percentage for display purposes in the banner, if needed.
  // This is separate from the value passed to components, which is the tier name.
  const displayMemberDiscountPercentage = currentTier.includes('essential') ? 0.05
    : currentTier.includes('premium') ? 0.10
    : currentTier.includes('elite') ? 0.15
    : 0;

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
            Strategic improvements that increase property value and ROI
          </p>
        </div>

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg mb-6">
            <CardContent className="p-4 md:p-6">
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
            </CardContent>
          </Card>
        )}

        {/* Why This Step Matters - Educational Card */}
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
                  Upgrade transforms maintenance from a cost center into an investment strategy. It helps you identify improvements that increase property value, reduce operating costs, and enhance rental appeal.
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
                    Upgrade is Step 8 in ADVANCE. While Preserve protects your current investment, Upgrade grows it. This step uses your property baseline and market data to recommend improvements with proven ROI - from energy efficiency to curb appeal to rental income boosters.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">💡 Strategic Upgrade Categories:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• <strong>Energy Efficiency:</strong> Reduce ongoing costs (insulation, HVAC, windows)</li>
                    <li>• <strong>Rental Income Boosters:</strong> Increase rent potential (kitchen, bath upgrades)</li>
                    <li>• <strong>Property Value:</strong> High-ROI improvements (curb appeal, flooring)</li>
                    <li>• <strong>Preventive Replacements:</strong> Upgrade aging systems before they fail</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded p-3 border-l-4 border-green-600">
                  <p className="text-xs text-green-900">
                    <strong>ROI Focus:</strong> Target upgrades with 70%+ ROI on resale or 2-3 year payback periods on energy savings. Track results to validate your strategy.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Dashboard Summary */}
        {allUpgrades.length > 0 && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardHeader className="pb-3">
              <CardTitle style={{ color: '#1B365D', fontSize: '20px' }}>
                📊 Your Upgrade Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                      {activeProjects.length}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">Active</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                      {plannedProjects.length}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">Planned</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                      {completedProjects.length}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">Completed</p>
                </div>
              </div>

              {completedProjects.length > 0 && (
                <div className="border-t border-green-300 pt-4 grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Total Invested</p>
                    <p className="text-xl font-bold text-blue-700">
                      ${totalInvestment.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Equity Gained</p>
                    <p className="text-xl font-bold text-green-700">
                      ${totalEquityGained.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Net Equity Growth</p>
                    <p className="text-xl font-bold" style={{ color: netEquityGrowth >= 0 ? '#28A745' : '#DC3545' }}>
                      {netEquityGrowth >= 0 ? '+' : ''}${netEquityGrowth.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Member Discount Banner */}
        {isServiceMember && (
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
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
                    Save thousands on contractor coordination fees through your operator.
                  </p>
                  <div className="text-sm text-purple-800">
                    <p>• $25K kitchen remodel → Save ${(25000 * displayMemberDiscountPercentage).toLocaleString()}</p>
                    <p>• $45K addition → Save ${(45000 * displayMemberDiscountPercentage).toLocaleString()}</p>
                    <p>• $8K HVAC upgrade → Save ${(8000 * displayMemberDiscountPercentage).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explore Ideas - Primary CTA */}
        <Card className="border-2 border-blue-300 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                  💡 Explore Upgrade Ideas
                </h3>
                <p className="text-gray-700 mb-4">
                  Get inspired by 48+ high-ROI improvements with real numbers, success stories, and member savings
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    asChild
                    className="font-bold"
                    style={{ backgroundColor: '#3B82F6', minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("ExploreTemplates")}>
                      <Award className="w-5 h-5 mr-2" />
                      Browse Popular Upgrades
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    style={{ minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("ExploreTemplates") + "?featured=true"}>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Highest ROI Projects
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    style={{ minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("ExploreTemplates") + "?category=Energy Efficiency"}>
                      <Zap className="w-5 h-5 mr-2" />
                      Energy Savings
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start New Project */}
        <Card className="border-2 border-green-300 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                  Start a New Project
                </h3>
                <p className="text-gray-700 mb-4">
                  Track renovations, calculate ROI, and manage your property improvements
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    asChild
                    className="font-bold"
                    style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("ExploreTemplates")}>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Use Pre-Built Template
                    </Link>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              🚧 Active Projects
            </h2>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <UpgradeCard // Renamed from UpgradeProjectCard
                  key={project.id}
                  project={project}
                  properties={properties}
                  memberDiscount={memberDiscountTier} // Updated here
                  onEdit={() => setEditingProject(project)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              ✅ Completed Projects
            </h2>

            {/* Lifetime Equity Summary */}
            <Card className="border-2 border-green-300 bg-green-50 mb-4">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-center" style={{ color: '#1B365D' }}>
                  📈 Lifetime Equity Summary
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                    <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>
                      ${totalInvestment.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Equity Gained</p>
                    <p className="text-3xl font-bold text-green-700">
                      ${totalEquityGained.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Net Equity</p>
                    <p className="text-3xl font-bold text-green-700">
                      +${netEquityGrowth.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 mt-4">
                  💡 You've increased your property value by ${totalEquityGained.toLocaleString()} while only spending ${totalInvestment.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {completedProjects.map((project) => (
                <UpgradeCard // Renamed from UpgradeProjectCard
                  key={project.id}
                  project={project}
                  properties={properties}
                  memberDiscount={memberDiscountTier} // Updated here
                  onEdit={() => setEditingProject(project)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allUpgrades.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <LightbulbIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Upgrade Projects Yet</h3>
              <p className="text-gray-600 mb-2">
                Start building equity and increasing property value
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Browse 48+ inspiring project templates with real ROI data
              </p>
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                  asChild
                  style={{ backgroundColor: '#3B82F6', minHeight: '56px' }}
                >
                  <Link to={createPageUrl("ExploreTemplates")}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explore Upgrade Templates
                  </Link>
                </Button>
                <Button
                  onClick={() => setShowNewProjectForm(true)}
                  variant="outline"
                  style={{ minHeight: '56px' }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Custom Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
