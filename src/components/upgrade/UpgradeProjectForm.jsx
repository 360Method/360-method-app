
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, TrendingUp, DollarSign, Calendar, ArrowLeft, ArrowRight, Sparkles, Shield, FileText } from "lucide-react";
import UpgradeDocuments from "./UpgradeDocuments";

export default function UpgradeProjectForm({ properties, project, templateId, memberDiscount = 0, onComplete, onCancel }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [projectData, setProjectData] = React.useState(
    project || {
      property_id: "",
      title: "",
      category: "Energy Efficiency",
      description: "",
      current_state: "",
      upgraded_state: "",
      investment_required: 0,
      annual_savings: 0,
      roi_timeline_months: 0,
      property_value_impact: 0,
      priority_score: 5,
      status: "Identified",
      planned_date: "",
    }
  );

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');

  // Fetch template if templateId provided
  const { data: template } = useQuery({
    queryKey: ['upgrade-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const templates = await base44.entities.UpgradeTemplate.list();
      return templates.find(t => t.id === templateId);
    },
    enabled: !!templateId && !project,
  });

  // Pre-fill form with template data
  React.useEffect(() => {
    if (template && !project) {
      const avgCost = (template.average_cost_min + template.average_cost_max) / 2;
      setProjectData({
        property_id: properties[0]?.id || "",
        title: template.title,
        category: template.category === "High ROI Renovations" ? "Property Value" 
          : template.category === "Rental Income Boosters" ? "Rental Appeal"
          : template.category === "Energy Efficiency" ? "Energy Efficiency"
          : "Property Value",
        description: template.why_it_works?.join('. ') || "",
        current_state: "Planning upgrade based on template",
        upgraded_state: template.whats_included?.join('. ') || "",
        investment_required: avgCost,
        annual_savings: template.annual_savings || 0,
        roi_timeline_months: template.payback_timeline?.includes('year') 
          ? parseInt(template.payback_timeline) * 12 
          : template.payback_timeline?.includes('month')
          ? parseInt(template.payback_timeline)
          : 24,
        property_value_impact: template.typical_value_added || avgCost * (template.average_roi_percent / 100),
        priority_score: template.average_roi_percent >= 80 ? 8 : 6,
        status: "Planned",
        planned_date: "",
      });
    }
  }, [template, project, properties]);

  const saveProjectMutation = useMutation({
    mutationFn: async (data) => {
      if (project) {
        return await base44.entities.Upgrade.update(project.id, data);
      } else {
        return await base44.entities.Upgrade.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      setCurrentStep(3);
    },
  });

  // Trigger ROI calculation when moving to step 2
  React.useEffect(() => {
    if (currentStep === 2 && projectData.investment_required > 0) {
      calculateROI();
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      saveProjectMutation.mutate(projectData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateROI = () => {
    const investment = projectData.investment_required || 0;

    // Auto-calculate if not manually set
    if (!projectData.property_value_impact || projectData.property_value_impact === 0) {
      // Estimate based on category
      let estimatedROI = 0.70; // Default 70%
      if (projectData.category === "Energy Efficiency") estimatedROI = 0.65;
      if (projectData.category === "Property Value") estimatedROI = 0.85;
      if (projectData.category === "Curb Appeal") estimatedROI = 0.75;
      
      setProjectData(prev => ({
        ...prev,
        property_value_impact: Math.round(investment * estimatedROI)
      }));
    }
  };

  // Calculations for ROI display
  const investment = projectData.investment_required;
  const equityGained = projectData.property_value_impact || 0;
  const netEquity = equityGained - investment;
  const roiPercent = investment > 0 
    ? Math.round((equityGained / investment) * 100)
    : 0;

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

  // Step 4: Documents Management (only for existing projects)
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
          onUpdate={() => {
            // Optionally refresh or callback
          }}
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
      <div>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          {template && (
            <Badge style={{ backgroundColor: '#3B82F6' }}>
              FROM TEMPLATE
            </Badge>
          )}
          <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '24px' }}>
            {project ? 'Edit Upgrade Project' : template ? `Create: ${template.title}` : 'Create Custom Upgrade Project'}
          </h1>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Project Details</span>
          <span>ROI Calculator</span>
        </div>
      </div>

      {/* Step 1: Project Details */}
      {currentStep === 1 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle style={{ color: '#1B365D' }}>
              Step 1: Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Selection */}
            <div>
              <Label>Property *</Label>
              <Select
                value={projectData.property_id}
                onValueChange={(value) => setProjectData({ ...projectData, property_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property..." />
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

            {/* Project Name */}
            <div>
              <Label>Project Name *</Label>
              <Input
                value={projectData.title}
                onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                placeholder="e.g., Kitchen Remodel, HVAC Upgrade"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
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

            {/* Description */}
            <div>
              <Label>Project Description *</Label>
              <Textarea
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="What work will be done? What's the goal?"
                rows={4}
              />
            </div>

            {/* Current State */}
            <div>
              <Label>Current State</Label>
              <Textarea
                value={projectData.current_state}
                onChange={(e) => setProjectData({ ...projectData, current_state: e.target.value })}
                placeholder="Describe the current condition..."
                rows={2}
              />
            </div>

            {/* After Upgrade */}
            <div>
              <Label>After Upgrade</Label>
              <Textarea
                value={projectData.upgraded_state}
                onChange={(e) => setProjectData({ ...projectData, upgraded_state: e.target.value })}
                placeholder="Describe what it will be like after..."
                rows={2}
              />
            </div>

            {/* Investment Required */}
            <div>
              <Label>Estimated Investment *</Label>
              <Input
                type="number"
                value={projectData.investment_required}
                onChange={(e) => setProjectData({ ...projectData, investment_required: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Annual Savings */}
            <div>
              <Label>Annual Savings (Energy/Operational)</Label>
              <Input
                type="number"
                value={projectData.annual_savings}
                onChange={(e) => setProjectData({ ...projectData, annual_savings: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-gray-600 mt-1">
                For energy efficiency projects - estimated annual utility savings
              </p>
            </div>

            {/* Status */}
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
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Planned Date */}
            {(projectData.status === 'Planned' || projectData.status === 'In Progress') && (
              <div>
                <Label>Planned Start Date</Label>
                <Input
                  type="date"
                  value={projectData.planned_date}
                  onChange={(e) => setProjectData({ ...projectData, planned_date: e.target.value })}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={onCancel}
                variant="outline"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!projectData.property_id || !projectData.title || !projectData.investment_required}
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
          <Card className="border-2 border-green-300">
            <CardHeader>
              <CardTitle style={{ color: '#1B365D' }}>
                Step 2: ROI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Member Benefits Banner (if service member) */}
              {isServiceMember && memberDiscount > 0 && (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-purple-900 mb-2">
                        🌟 Member Benefit: Premium Contractor Network
                      </p>
                      <p className="text-sm text-purple-800 mb-2">
                        As a service member, you get access to our vetted contractor network with negotiated rates.
                      </p>
                      <div className="text-sm text-purple-900">
                        <p className="font-semibold">Your benefits on this project:</p>
                        <p>• Pre-negotiated pricing (typically {memberDiscount * 100}% below market)</p>
                        <p>• Free project coordination & oversight</p>
                        <p>• Quality guarantee backed by your operator</p>
                        <p>• No bidding hassle - we handle everything</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Non-Member Upsell */}
              {!isServiceMember && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 mb-2">
                        💡 Save Big with HomeCare/PropertyCare Service
                      </p>
                      <p className="text-sm text-blue-800 mb-3">
                        Members save 5-15% on all upgrades through our contractor network plus get free project management.
                      </p>
                      <div className="text-sm text-blue-900 mb-3">
                        <p className="font-semibold">On this ${investment.toLocaleString()} project, you could save:</p>
                        <p>• Essential Members: ~${Math.round(investment * 0.05).toLocaleString()}</p>
                        <p>• Premium Members: ~${Math.round(investment * 0.10).toLocaleString()}</p>
                        <p>• Elite Members: ~${Math.round(investment * 0.15).toLocaleString()}</p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        style={{ backgroundColor: '#3B82F6', minHeight: '40px' }}
                      >
                        <a href="/services" target="_blank">
                          Learn About Service Plans →
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Value Impact */}
              <div>
                <Label>Expected Property Value Increase</Label>
                <Input
                  type="number"
                  value={projectData.property_value_impact}
                  onChange={(e) => setProjectData({ ...projectData, property_value_impact: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Estimated increase in property value from this upgrade
                </p>
              </div>

              {/* Equity Analysis */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                  📈 Equity Analysis
                </h3>
                <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Your Investment:</span>
                    <span className="font-semibold">${investment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Value Added:</span>
                    <span className="font-semibold text-green-700">+${equityGained.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2">
                    <span className="font-semibold">Net Equity Gain:</span>
                    <span className={`font-bold text-lg ${netEquity >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {netEquity >= 0 ? '+' : ''}${Math.round(netEquity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ROI:</span>
                    <span className="font-bold text-green-700">{roiPercent}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 You invest ${investment.toLocaleString()} but gain ${equityGained.toLocaleString()} in property value = 
                  {netEquity >= 0 ? ` only $${Math.round(netEquity).toLocaleString()} true cost` : ` negative cost (pays for itself!)`}
                </p>
              </div>

              {/* Energy Savings */}
              {projectData.annual_savings > 0 && (
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                    ⚡ Energy Savings Bonus
                  </h3>
                  <div className="space-y-2 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm">Annual Savings:</span>
                      <span className="font-semibold">${projectData.annual_savings.toLocaleString()}/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">10-Year Savings:</span>
                      <span className="font-semibold text-green-700">${(projectData.annual_savings * 10).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Payback Period:</span>
                      <span className="font-semibold">
                        {Math.round(investment / projectData.annual_savings)} years
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This project pays for itself through energy savings alone!
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  style={{ minHeight: '48px' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={saveProjectMutation.isPending}
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  {saveProjectMutation.isPending ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
