import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator, ArrowLeft, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";

export default function UpgradeProjectForm({ properties, project, memberDiscount, onComplete, onCancel }) {
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1); // 1: Details, 2: ROI Calculator, 3: Confirmation
  const [formData, setFormData] = React.useState(project || {
    property_id: properties[0]?.id || '',
    title: '',
    category: 'Property Value',
    description: '',
    current_state: '',
    upgraded_state: '',
    investment_required: 0,
    annual_savings: 0,
    roi_timeline_months: 0,
    property_value_impact: 0,
    priority_score: 5,
    status: 'Planned',
    planned_date: ''
  });

  const [roiData, setRoiData] = React.useState({
    coordinationFee: 0,
    memberSavings: 0,
    netCost: 0,
    equityGained: 0,
    netEquity: 0,
    roiPercent: 0
  });

  const saveProjectMutation = useMutation({
    mutationFn: (data) => {
      if (project?.id) {
        return base44.entities.Upgrade.update(project.id, data);
      } else {
        return base44.entities.Upgrade.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      setStep(3);
    },
  });

  // Calculate ROI when moving to step 2
  React.useEffect(() => {
    if (step === 2 && formData.investment_required > 0) {
      calculateROI();
    }
  }, [step]);

  const calculateROI = () => {
    const investment = parseFloat(formData.investment_required) || 0;
    const valueImpact = parseFloat(formData.property_value_impact) || 0;
    
    // Estimate coordination fee (typically 10% of project cost)
    const coordinationFee = investment * 0.10;
    const memberSavings = coordinationFee * memberDiscount;
    const netCost = investment - memberSavings;
    
    const equityGained = valueImpact;
    const netEquity = equityGained - netCost;
    const roiPercent = investment > 0 ? ((equityGained / investment) * 100) : 0;

    setRoiData({
      coordinationFee,
      memberSavings,
      netCost,
      equityGained,
      netEquity,
      roiPercent
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      saveProjectMutation.mutate(formData);
    }
  };

  const categories = [
    { value: 'Energy Efficiency', emoji: '⚡', description: 'Lower operating costs' },
    { value: 'Safety', emoji: '🛡️', description: 'Protect occupants' },
    { value: 'Comfort', emoji: '🏠', description: 'Improve livability' },
    { value: 'Property Value', emoji: '💎', description: 'Increase resale value' },
    { value: 'Rental Appeal', emoji: '📈', description: 'Attract better tenants' }
  ];

  if (step === 3) {
    return (
      <Card className="border-2 border-green-300 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '24px' }}>
            {project ? 'Project Updated!' : 'Project Created!'}
          </h2>
          <p className="text-gray-700 mb-6">
            Your upgrade project "{formData.title}" has been saved and is being tracked.
          </p>
          <Button
            onClick={onComplete}
            className="font-bold"
            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
          >
            Back to Upgrades
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <div className="flex-1 h-1 bg-gray-300">
                <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Project Details</span>
              <span>ROI Calculator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Project Details */}
      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle style={{ color: '#1B365D' }}>
                {project ? 'Edit Upgrade Project' : 'New Upgrade Project'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Selection */}
              <div>
                <Label className="font-semibold">Property *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  required
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Title */}
              <div>
                <Label className="font-semibold">Project Name *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Kitchen Remodel, HVAC Replacement, etc."
                  required
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>

              {/* Category */}
              <div>
                <Label className="font-semibold">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <div>
                            <div>{cat.value}</div>
                            <div className="text-xs text-gray-500">{cat.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label className="font-semibold">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this upgrade project..."
                  className="mt-2 h-24"
                />
              </div>

              {/* Current State */}
              <div>
                <Label className="font-semibold">Current State</Label>
                <Textarea
                  value={formData.current_state}
                  onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                  placeholder="What's the current condition?"
                  className="mt-2 h-20"
                />
              </div>

              {/* Upgraded State */}
              <div>
                <Label className="font-semibold">After Upgrade</Label>
                <Textarea
                  value={formData.upgraded_state}
                  onChange={(e) => setFormData({ ...formData, upgraded_state: e.target.value })}
                  placeholder="What will it be like after the upgrade?"
                  className="mt-2 h-20"
                />
              </div>

              {/* Estimated Cost */}
              <div>
                <Label className="font-semibold">Estimated Investment *</Label>
                <Input
                  type="number"
                  value={formData.investment_required}
                  onChange={(e) => setFormData({ ...formData, investment_required: parseFloat(e.target.value) || 0 })}
                  placeholder="25000"
                  required
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
                <p className="text-xs text-gray-500 mt-1">Total project cost estimate</p>
              </div>

              {/* Expected Value Impact */}
              <div>
                <Label className="font-semibold">Expected Value Added *</Label>
                <Input
                  type="number"
                  value={formData.property_value_impact}
                  onChange={(e) => setFormData({ ...formData, property_value_impact: parseFloat(e.target.value) || 0 })}
                  placeholder="21250"
                  required
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
                <p className="text-xs text-gray-500 mt-1">Estimated increase in property value</p>
              </div>

              {/* Energy Savings (if applicable) */}
              {formData.category === 'Energy Efficiency' && (
                <>
                  <div>
                    <Label className="font-semibold">Annual Energy Savings</Label>
                    <Input
                      type="number"
                      value={formData.annual_savings}
                      onChange={(e) => setFormData({ ...formData, annual_savings: parseFloat(e.target.value) || 0 })}
                      placeholder="480"
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Estimated annual savings in dollars</p>
                  </div>

                  <div>
                    <Label className="font-semibold">Payback Period (months)</Label>
                    <Input
                      type="number"
                      value={formData.roi_timeline_months}
                      onChange={(e) => setFormData({ ...formData, roi_timeline_months: parseFloat(e.target.value) || 0 })}
                      placeholder="60"
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                </>
              )}

              {/* Planned Date */}
              <div>
                <Label className="font-semibold">Planned Start Date</Label>
                <Input
                  type="date"
                  value={formData.planned_date}
                  onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>

              {/* Priority */}
              <div>
                <Label className="font-semibold">Priority (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority_score}
                  onChange={(e) => setFormData({ ...formData, priority_score: parseInt(e.target.value) || 5 })}
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>

              {/* Status */}
              <div>
                <Label className="font-semibold">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
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

              <Button
                type="submit"
                className="w-full font-bold"
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate ROI →
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Step 2: ROI Calculator */}
      {step === 2 && (
        <div>
          <Card className="border-2 border-green-300 mb-6">
            <CardHeader>
              <CardTitle style={{ color: '#1B365D' }}>
                ROI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cost Projection */}
              <div>
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  Cost Projection
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Estimated Total Cost:</span>
                    <span className="font-bold">${formData.investment_required.toLocaleString()}</span>
                  </div>
                  
                  {memberDiscount > 0 && (
                    <>
                      <div className="flex justify-between text-green-700">
                        <span>Your Member Discount ({(memberDiscount * 100).toFixed(0)}%):</span>
                        <span className="font-bold">-${roiData.memberSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Estimated Cost After Discount:</span>
                        <span className="font-bold text-blue-700">${roiData.netCost.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Value Impact */}
              <div className="pt-4 border-t">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  Value Impact
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Estimated Value Added:</span>
                    <span className="font-bold text-green-700">${roiData.equityGained.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">ROI Percentage:</span>
                    <span className="font-bold" style={{ color: roiData.roiPercent >= 75 ? '#28A745' : '#FF6B35' }}>
                      {roiData.roiPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Equity Analysis */}
              <div className="pt-4 border-t">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  Equity Analysis
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span>Investment:</span>
                      <span className="font-semibold">${roiData.netCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value Added:</span>
                      <span className="font-semibold text-green-700">${roiData.equityGained.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="font-bold">Net Equity:</span>
                      <span className={`font-bold ${roiData.netEquity >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {roiData.netEquity >= 0 ? '+' : ''}${roiData.netEquity.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-900">
                    {roiData.netEquity >= 0 
                      ? `While you're spending $${roiData.netCost.toLocaleString()}, you're gaining $${roiData.equityGained.toLocaleString()} in equity - making the true cost only $${Math.abs(roiData.netEquity).toLocaleString()}.`
                      : `This project creates positive equity! You invest $${roiData.netCost.toLocaleString()} and gain $${roiData.equityGained.toLocaleString()} in value.`
                    }
                  </p>
                </div>
              </div>

              {/* Energy Savings (if applicable) */}
              {formData.category === 'Energy Efficiency' && formData.annual_savings > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-bold mb-3 text-green-700">
                    Energy Savings
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Annual Savings:</span>
                      <span className="font-bold text-green-700">${formData.annual_savings.toLocaleString()}/year</span>
                    </div>
                    {formData.roi_timeline_months > 0 && (
                      <div className="flex justify-between">
                        <span>Payback Period:</span>
                        <span className="font-bold">
                          {formData.roi_timeline_months < 12 
                            ? `${formData.roi_timeline_months} months` 
                            : `${(formData.roi_timeline_months / 12).toFixed(1)} years`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
              style={{ minHeight: '56px' }}
            >
              ← Edit Details
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveProjectMutation.isPending}
              className="flex-1 font-bold"
              style={{ backgroundColor: '#28A745', minHeight: '56px' }}
            >
              {saveProjectMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Save Project
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}