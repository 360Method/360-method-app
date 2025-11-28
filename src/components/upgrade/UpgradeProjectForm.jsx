import React from "react";
import { auth, Upgrade, UpgradeTemplate } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, TrendingUp, DollarSign, Calendar, ArrowLeft, ArrowRight, Sparkles, Shield, FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UpgradeDocuments from "./UpgradeDocuments";
import { calculateMemberDiscount, getAllTierDiscounts, formatDiscountExplanation } from "../shared/MemberDiscountCalculator";

export default function UpgradeProjectForm({ properties, project, templateId, memberDiscount = 0, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [projectData, setProjectData] = React.useState({
    property_id: properties[0]?.id || '',
    title: '',
    category: 'Property Value',
    description: '',
    current_state: '',
    upgraded_state: '',
    investment_required: '',
    annual_savings: '',
    property_value_impact: '',
    status: 'Planned',
    planned_date: '',
    ...project
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => auth.me(),
  });

  const { data: template } = useQuery({
    queryKey: ['upgrade-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const templates = await UpgradeTemplate.list();
      return templates.find(t => t.id === templateId);
    },
    enabled: !!templateId,
  });

  // Pre-fill from template
  React.useEffect(() => {
    if (template && !project) {
      const avgCost = (template.average_cost_min + template.average_cost_max) / 2;
      const templateCategory = template.category === 'High ROI Renovations' ? 'Property Value'
        : template.category === 'Energy Efficiency' ? 'Energy Efficiency'
        : template.category === 'Rental Income Boosters' ? 'Rental Appeal'
        : template.category === 'Preventive Replacements' ? 'Safety'
        : template.category === 'Curb Appeal' ? 'Property Value'
        : 'Property Value';

      setProjectData({
        ...projectData,
        title: template.title,
        category: templateCategory,
        description: template.whats_included?.join('\n• ') || '',
        investment_required: avgCost,
        annual_savings: template.annual_savings || 0,
        property_value_impact: template.typical_value_added || Math.round(avgCost * (template.average_roi_percent / 100))
      });
    }
  }, [template]);

  const projectMutation = useMutation({
    mutationFn: async (data) => {
      if (project) {
        return await Upgrade.update(project.id, data);
      } else {
        return await Upgrade.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      setCurrentStep(3);
    }
  });

  const handleNextToROI = () => {
    if (!projectData.title || !projectData.property_id) {
      alert('Please fill in required fields (Property and Title)');
      return;
    }
    setCurrentStep(2);
  };

  const handleSaveProject = async () => {
    const dataToSave = {
      ...projectData,
      investment_required: parseFloat(projectData.investment_required) || 0,
      annual_savings: parseFloat(projectData.annual_savings) || 0,
      property_value_impact: parseFloat(projectData.property_value_impact) || 0,
    };
    await projectMutation.mutateAsync(dataToSave);
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    if (currentStep === 4) setCurrentStep(3);
  };

  // Calculate ROI metrics
  const investment = parseFloat(projectData.investment_required) || 0;
  const valueImpact = parseFloat(projectData.property_value_impact) || 0;
  const annualSavings = parseFloat(projectData.annual_savings) || 0;
  
  // Auto-calculate value impact based on category if not set
  let estimatedValueImpact = valueImpact;
  if (!valueImpact && investment > 0) {
    const categoryMultipliers = {
      'Energy Efficiency': 0.60,
      'Property Value': 0.75,
      'Rental Appeal': 0.70,
      'Safety': 0.55,
      'Comfort': 0.50
    };
    estimatedValueImpact = Math.round(investment * (categoryMultipliers[projectData.category] || 0.65));
  }

  const netEquityGain = estimatedValueImpact - investment;
  const roiPercent = investment > 0 ? (estimatedValueImpact / investment * 100) : 0;

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');

  // Calculate member discount using new structure
  const discountInfo = isServiceMember 
    ? calculateMemberDiscount(investment, currentTier)
    : null;
  const memberSavings = discountInfo?.actualSavings || 0;
  const trueCost = investment - memberSavings;

  // Success screen
  if (currentStep === 3) {
    return (
      <Card className="border-2 border-green-300 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
            {project ? '✓ Project Updated!' : '✓ Project Created!'}
          </h2>
          <p className="text-gray-700 mb-6">
            {template 
              ? `Your "${projectData.title}" project has been added to your upgrade tracker.`
              : 'Your custom upgrade project has been saved.'
            }
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={onComplete}
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              View All Projects
            </Button>
            {project && (
              <Button
                onClick={() => setCurrentStep(4)}
                variant="outline"
                style={{ minHeight: '48px' }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Manage Documents & Quotes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 4: Documents Management
  if (currentStep === 4 && project) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setCurrentStep(3)}
          variant="ghost"
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <UpgradeDocuments 
          project={project} 
          onUpdate={() => {}}
        />

        <div className="flex justify-center">
          <Button
            onClick={onComplete}
            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '24px' }}>
          {project ? 'Edit Project' : template ? `New Project: ${template.title}` : 'New Custom Project'}
        </h2>
        <Button
          variant="ghost"
          onClick={onCancel}
          style={{ minHeight: '44px' }}
        >
          Cancel
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          1
        </div>
        <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          2
        </div>
      </div>

      {/* Step 1: Project Details */}
      {currentStep === 1 && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle style={{ color: '#1B365D' }}>Step 1: Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Property *</Label>
              <Select
                value={projectData.property_id}
                onValueChange={(value) => setProjectData({ ...projectData, property_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Project Name *</Label>
              <Input
                value={projectData.title}
                onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                placeholder="e.g., Kitchen Remodel"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={projectData.category}
                onValueChange={(value) => setProjectData({ ...projectData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Energy Efficiency">Energy Efficiency</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Comfort">Comfort</SelectItem>
                  <SelectItem value="Property Value">Property Value</SelectItem>
                  <SelectItem value="Rental Appeal">Rental Appeal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Describe the project scope and details..."
                rows={4}
              />
            </div>

            <div>
              <Label>Estimated Investment Required *</Label>
              <Input
                type="number"
                value={projectData.investment_required}
                onChange={(e) => setProjectData({ ...projectData, investment_required: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-gray-600 mt-1">
                Total professional installation cost (get quotes for accurate pricing)
              </p>
            </div>

            {projectData.category === 'Energy Efficiency' && (
              <div>
                <Label>Annual Energy Savings</Label>
                <Input
                  type="number"
                  value={projectData.annual_savings}
                  onChange={(e) => setProjectData({ ...projectData, annual_savings: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Estimated yearly savings on energy bills
                </p>
              </div>
            )}

            <div>
              <Label>Status</Label>
              <Select
                value={projectData.status}
                onValueChange={(value) => setProjectData({ ...projectData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Identified">Identified</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {projectData.status !== 'Identified' && (
              <div>
                <Label>Planned Date</Label>
                <Input
                  type="date"
                  value={projectData.planned_date}
                  onChange={(e) => setProjectData({ ...projectData, planned_date: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
                style={{ minHeight: '48px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextToROI}
                style={{ backgroundColor: '#3B82F6', minHeight: '48px' }}
              >
                Next: Calculate ROI
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: ROI Calculator */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>

          {/* Member Benefits or Upsell */}
          {isServiceMember && discountInfo ? (
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <Badge className="mb-2" style={{ backgroundColor: '#8B5CF6' }}>
                      YOUR MEMBER BENEFIT
                    </Badge>
                    <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                      Premium Contractor Network Access
                    </h3>
                    <p className="text-gray-800 mb-3">
                      Your {currentTier.includes('essential') ? 'Essential' : currentTier.includes('premium') ? 'Premium' : 'Elite'} membership 
                      gives you pre-negotiated pricing on this project.
                    </p>
                    <div className="bg-white rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Your Discount</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {discountInfo.percent}%
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDiscountExplanation(discountInfo, investment, currentTier)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Your Savings</p>
                          <p className="text-2xl font-bold text-green-700">
                            ${memberSavings.toLocaleString()}
                          </p>
                          {discountInfo.isCapped && (
                            <p className="text-xs text-gray-600">
                              (Maximum savings reached)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-purple-200 pt-3">
                        <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                          Additional Benefits:
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Free project coordination & management</li>
                          <li>• Quality guarantee from your operator</li>
                          <li>• No bidding, vetting, or oversight hassle</li>
                          <li>• Priority scheduling</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                      💰 Save Thousands with Service Membership
                    </h3>
                    <p className="text-gray-800 mb-3">
                      Get access to our vetted contractor network with tiered discount pricing.
                    </p>
                    {investment > 0 && (
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                          Potential Savings on This ${investment.toLocaleString()} Project:
                        </p>
                        {(() => {
                          const allDiscounts = getAllTierDiscounts(investment);
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                                  Essential ({allDiscounts.essential.percent}% discount):
                                </span>
                                <strong className="text-green-700">
                                  ${allDiscounts.essential.actualSavings.toLocaleString()}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                                  Premium ({allDiscounts.premium.percent}% discount):
                                </span>
                                <strong className="text-green-700">
                                  ${allDiscounts.premium.actualSavings.toLocaleString()}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                                  Elite ({allDiscounts.elite.percent}% discount):
                                </span>
                                <strong className="text-green-700">
                                  ${allDiscounts.elite.actualSavings.toLocaleString()}
                                </strong>
                              </div>
                            </div>
                          );
                        })()}
                        <p className="text-xs text-gray-600 mt-3 flex items-start gap-1">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Discounts vary by project size with maximum savings caps to ensure quality.</span>
                        </p>
                      </div>
                    )}
                    <Button
                      asChild
                      size="sm"
                      style={{ backgroundColor: '#28A745', minHeight: '44px' }}
                    >
                      <Link to={createPageUrl("Pricing")}>
                        View Plans & Pricing →
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equity Analysis */}
          <Card className="border-2 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                <TrendingUp className="w-5 h-5 text-green-600" />
                Equity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600 mb-1">Investment</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                    ${investment.toLocaleString()}
                  </p>
                  {isServiceMember && memberSavings > 0 && (
                    <p className="text-sm text-green-700 mt-1">
                      Member cost: ${trueCost.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600 mb-1">Equity Gained</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${estimatedValueImpact.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Property value increase
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-gray-600 mb-1">Net Equity</p>
                  <p className="text-2xl font-bold" style={{ color: netEquityGain >= 0 ? '#28A745' : '#DC3545' }}>
                    {netEquityGain >= 0 ? '+' : ''}${netEquityGain.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {roiPercent.toFixed(0)}% ROI
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label>Adjust Expected Property Value Increase (Optional)</Label>
                <Input
                  type="number"
                  value={projectData.property_value_impact || estimatedValueImpact}
                  onChange={(e) => setProjectData({ ...projectData, property_value_impact: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Default calculated based on project category. Adjust if you have specific market data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Energy Savings (if applicable) */}
          {annualSavings > 0 && (
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  💡 Energy Savings Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${annualSavings.toLocaleString()}/year
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">5-Year Savings</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${(annualSavings * 5).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  Energy efficiency upgrades pay for themselves over time through reduced utility bills.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={projectMutation.isPending}
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              {projectMutation.isPending ? 'Saving...' : project ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}