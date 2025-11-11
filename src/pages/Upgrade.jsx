import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, TrendingUp, DollarSign, Calendar, CheckCircle2, Clock, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UpgradeProjectCard from "../components/upgrade/UpgradeProjectCard";
import UpgradeProjectForm from "../components/upgrade/UpgradeProjectForm";

export default function Upgrade() {
  const queryClient = useQueryClient();
  const [showNewProjectForm, setShowNewProjectForm] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState(null);

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

  const completedProjects = allUpgrades.filter(u => 
    u.status === 'Completed'
  );

  const totalInvestment = completedProjects.reduce((sum, p) => 
    sum + (p.actual_cost || p.investment_required || 0), 0
  );

  const totalEquityGained = completedProjects.reduce((sum, p) => 
    sum + (p.property_value_impact || 0), 0
  );

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');

  const memberDiscount = currentTier.includes('essential') ? 0.05 
    : currentTier.includes('premium') ? 0.10 
    : currentTier.includes('elite') ? 0.15 
    : 0;

  const handleFormComplete = () => {
    setShowNewProjectForm(false);
    setEditingProject(null);
  };

  if (showNewProjectForm || editingProject) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <UpgradeProjectForm
            properties={properties}
            project={editingProject}
            memberDiscount={memberDiscount}
            onComplete={handleFormComplete}
            onCancel={handleFormComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-green-600" />
            <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
              Strategic Upgrades
            </h1>
          </div>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            Transform your property, track ROI, and build equity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {activeProjects.length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {completedProjects.length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700">
                ${(totalInvestment / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-gray-600">Invested</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-700">
                ${(totalEquityGained / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-gray-600">Equity Gained</p>
            </CardContent>
          </Card>
        </div>

        {/* Member Discount Banner */}
        {isServiceMember && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge style={{ backgroundColor: '#28A745' }} className="flex-shrink-0">
                  MEMBER BENEFIT
                </Badge>
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    {memberDiscount * 100}% Contractor Discount
                  </p>
                  <p className="text-sm text-green-700">
                    Get {memberDiscount * 100}% off contractor coordination fees on all upgrade projects through your operator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Project Button */}
        <Card className="border-2 border-blue-300 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                  Start a New Upgrade Project
                </h3>
                <p className="text-gray-700 mb-4">
                  Track renovations, remodels, and strategic improvements with ROI calculations
                </p>
                <Button
                  onClick={() => setShowNewProjectForm(true)}
                  className="font-bold"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Upgrade Project
                </Button>
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
                <UpgradeProjectCard
                  key={project.id}
                  project={project}
                  properties={properties}
                  memberDiscount={memberDiscount}
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
            
            {/* Equity Summary */}
            <Card className="border-2 border-green-300 bg-green-50 mb-4">
              <CardContent className="p-6">
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
                      +${(totalEquityGained - totalInvestment).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {completedProjects.map((project) => (
                <UpgradeProjectCard
                  key={project.id}
                  project={project}
                  properties={properties}
                  memberDiscount={memberDiscount}
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
              <p className="text-gray-600 mb-6">
                Start tracking strategic improvements to build equity and increase property value
              </p>
              <Button
                onClick={() => setShowNewProjectForm(true)}
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Your First Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Request Work CTA for Service Members */}
        {isServiceMember && user?.operator_name && (
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                    Need Help with an Upgrade?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Get expert help from {user.operator_name} with your {memberDiscount * 100}% member discount
                  </p>
                  <Button
                    asChild
                    style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("Services")}>
                      Request Quote from Operator
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