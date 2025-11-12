
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Lightbulb, TrendingUp, DollarSign, Calendar, CheckCircle2, Clock, Sparkles, Award, Zap, Home, BookOpen, Video, Calculator, Search, Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UpgradeCard from "../components/upgrade/UpgradeCard";
import UpgradeDialog from "../components/upgrade/UpgradeDialog";

export default function Upgrade() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showNewForm = searchParams.get('new') === 'true';
  const templateIdFromUrl = searchParams.get('template');

  const [showNewProjectForm, setShowNewProjectForm] = React.useState(showNewForm);
  const [editingProject, setEditingProject] = React.useState(null);
  const [templateId, setTemplateId] = React.useState(templateIdFromUrl);

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
    queryKey: ['upgrades'],
    queryFn: () => base44.entities.Upgrade.list('-created_date'),
  });

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
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
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

        {/* Why Strategic Upgrades Matter - Educational Section */}
        {allUpgrades.length === 0 && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                <TrendingUp className="w-6 h-6 text-green-600" />
                Why Strategic Upgrades Matter
              </h3>
              <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Most homeowners wait until something breaks. Smart homeowners invest strategically.
                Replace before failure = avoid disasters + maximize ROI.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2 text-red-600">❌ Reactive Thinking</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 20-year-old water heater floods basement = $6,500 emergency</li>
                    <li>• Old HVAC dies in heatwave = 3X emergency replacement cost</li>
                    <li>• Worn roof leaks = $30K interior damage + mold</li>
                    <li>• No planning = always at mercy of failures</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2 text-green-600">✅ Strategic Upgrades</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Replace at 12 years = $1,400 planned + avoid flood</li>
                    <li>• Upgrade to energy-efficient = $800/yr savings</li>
                    <li>• Proactive roof = $12K planned vs. $42K emergency</li>
                    <li>• Budget = control + maximum property value</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-green-300 pt-4">
                <p className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                  📚 Learn More:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("ResourceGuides") + "?category=ADVANCE Phase"}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Strategic Upgrade Planning
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("VideoTutorials") + "?category=ADVANCE Phase"}>
                      <Video className="w-4 h-4 mr-2" />
                      ROI Analysis Guide (18 min)
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("ROICalculators")}>
                      <Calculator className="w-4 h-4 mr-2" />
                      Upgrade ROI Calculators
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div classNameName="text-sm text-purple-800">
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
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
