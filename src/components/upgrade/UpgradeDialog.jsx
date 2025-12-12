import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { UpgradeTemplate, Upgrade, integrations } from '@/api/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGamification } from '@/lib/GamificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronDown, ChevronUp, Calculator, Sparkles,
  AlertCircle, Info, DollarSign, TrendingUp,
  Home, Hammer, Building2, HardHat, CheckCircle2,
  FileText, Loader2
} from 'lucide-react';
import { getMilestonesForUpgrade } from './upgradeMilestones';
import AICostDisclaimer from '../shared/AICostDisclaimer';
import AICostEstimator from './AICostEstimator';
import ProjectDocuments from './ProjectDocuments';

/**
 * Generate AI-powered milestones for a project
 */
async function generateAIMilestones(projectData) {
  const { title, category, description, current_state, upgraded_state, investment_required } = projectData;

  const prompt = `You are an expert home improvement project planner. Generate a detailed, actionable project plan with milestones for a homeowner.

PROJECT DETAILS:
- Title: ${title}
- Category: ${category}
- Budget: $${investment_required?.toLocaleString() || 'TBD'}
${description ? `- Description: ${description}` : ''}
${current_state ? `- Current State: ${current_state}` : ''}
${upgraded_state ? `- Target State: ${upgraded_state}` : ''}

Generate 4-8 milestones that guide the homeowner through this project from start to finish. Each milestone should be:
1. Specific and actionable
2. In logical order
3. Include expert tips to avoid common mistakes
4. Suggest what photos to capture for documentation

Consider phases like:
- Research & Planning
- Budgeting & Quotes
- Material Selection & Procurement
- Preparation Work
- Main Work Phases (break down if complex)
- Quality Inspection
- Cleanup & Documentation`;

  const result = await integrations.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        milestones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Clear milestone name (e.g., 'Get 3 Contractor Quotes')" },
              description: { type: "string", description: "What needs to be done in detail" },
              ai_guidance: { type: "string", description: "Expert tip or common pitfall to avoid" },
              typical_duration_days: { type: "number", description: "Realistic estimate in days" },
              photo_prompts: {
                type: "array",
                items: { type: "string" },
                description: "What photos to capture at this stage"
              }
            }
          }
        },
        project_tips: {
          type: "array",
          items: { type: "string" },
          description: "3-5 overall tips for this type of project"
        }
      }
    }
  });

  // Transform AI response into milestone format expected by the database
  const milestones = result.milestones?.map((m, index) => ({
    id: `milestone_${Date.now()}_${index}`,
    title: m.title,
    description: m.description,
    order: index,
    status: 'Not Started',
    completed_date: null,
    photos: [],
    notes: '',
    ai_guidance: m.ai_guidance,
    typical_duration_days: m.typical_duration_days,
    photo_prompts: m.photo_prompts || []
  })) || [];

  return {
    milestones,
    project_tips: result.project_tips || []
  };
}

export default function UpgradeDialog({
  properties,
  project = null,
  templateId = null,
  memberDiscount,
  onComplete,
  onCancel
}) {
  const queryClient = useQueryClient();
  const { awardXP } = useGamification();

  // Track if we've already awarded XP for this project creation
  const hasAwardedXPRef = useRef(false);

  // UI State
  const [showFinancials, setShowFinancials] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch template if templateId provided
  const { data: template } = useQuery({
    queryKey: ['upgradeTemplate', templateId],
    queryFn: async () => {
      const templates = await UpgradeTemplate.list();
      return templates.find(t => t.id === templateId);
    },
    enabled: !!templateId && !project,
  });

  // Form Data - categories and status must match database constraints
  const [formData, setFormData] = useState({
    property_id: properties?.[0]?.id || '',
    title: '',
    category: 'Property Value',
    status: 'Planned',
    project_manager: 'DIY', // UI-only field, not stored in DB
    description: '',
    investment_required: 0,
    annual_savings: 0,
    property_value_impact: 0,
    current_state: '',
    upgraded_state: '',
    notes: '', // UI-only field, stored in description
    documents: []
  });

  // Pre-fill from template
  useEffect(() => {
    if (template && !project) {
      console.log('📋 Pre-filling from template:', template);
      const avgCost = (template.average_cost_min + template.average_cost_max) / 2;

      setFormData(prev => ({
        ...prev,
        title: template.title || '',
        category: template.category || 'High ROI Renovations',
        description: template.why_it_works?.join(' ') || '',
        investment_required: avgCost,
        property_value_impact: template.typical_value_added || 0,
        annual_savings: template.annual_savings || 0,
        status: 'Planned'
      }));

      // Auto-open financials if from template
      setShowFinancials(true);
    }
  }, [template, project]);

  // Pre-fill from existing project
  useEffect(() => {
    if (project) {
      console.log('✏️ Pre-filling from existing project:', project);
      setFormData({
        property_id: project.property_id,
        title: project.title || '',
        category: project.category || 'Property Value',
        status: project.status || 'Planned',
        project_manager: 'DIY', // UI-only field
        description: project.description || '',
        investment_required: project.investment_required || 0,
        annual_savings: project.annual_savings || 0,
        property_value_impact: project.property_value_impact || 0,
        current_state: project.current_state || '',
        upgraded_state: project.upgraded_state || '',
        notes: '', // UI-only field
        documents: project.document_urls || [] // Map from DB column name
      });
      // Auto-expand documents section if project has documents
      if (project.document_urls?.length > 0) {
        setShowDocuments(true);
      }
    }
  }, [project]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAIEstimate = (estimate) => {
    console.log('✨ Applying AI estimate to form:', estimate);

    setFormData(prev => ({
      ...prev,
      investment_required: estimate.cost_average || 0,
      property_value_impact: estimate.value_impact || 0,
      annual_savings: 0 // User can adjust if needed
    }));
  };

  const calculateROI = () => {
    const investment = parseFloat(formData.investment_required) || 0;
    const valueImpact = parseFloat(formData.property_value_impact) || 0;

    if (investment === 0) return { roi: 0, netGain: 0, payback: 'N/A' };

    const netGain = valueImpact - investment;
    const roi = ((valueImpact / investment) * 100).toFixed(1);

    const annualSavings = parseFloat(formData.annual_savings) || 0;
    const payback = annualSavings > 0 ? (investment / annualSavings).toFixed(1) : 'N/A';

    return { roi, netGain, payback };
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🚀 Starting project save...');
      console.log('Input data:', data);

      // Build submitData with ONLY columns that exist in the database schema
      // Schema columns: id, property_id, title, category, description, current_state, upgraded_state,
      // investment_required, annual_savings, property_value_impact, status, planned_date, completion_date,
      // photo_urls, document_urls, milestones, ai_guidance, created_at, updated_at
      const submitData = {
        property_id: data.property_id,
        title: data.title,
        category: data.category,
        description: data.description || '',
        current_state: data.current_state || '',
        upgraded_state: data.upgraded_state || '',
        investment_required: parseFloat(data.investment_required) || 0,
        annual_savings: parseFloat(data.annual_savings) || 0,
        property_value_impact: parseFloat(data.property_value_impact) || 0,
        status: data.status || 'Planned',
        // Store documents in document_urls (the actual DB column)
        document_urls: data.documents || [],
      };

      // CRITICAL: Auto-generate milestones for ALL new projects
      if (!project?.id) {
        console.log('✨ Auto-generating milestones for new project');
        console.log('Project title:', submitData.title);
        console.log('Project category:', submitData.category);

        let milestones = [];
        let aiGuidance = null;

        // Try AI generation first if description is provided
        if (submitData.description || submitData.current_state || submitData.upgraded_state) {
          try {
            console.log('🤖 Attempting AI milestone generation...');
            setIsGeneratingMilestones(true);

            const aiResult = await generateAIMilestones({
              title: submitData.title,
              category: submitData.category,
              description: submitData.description,
              current_state: submitData.current_state,
              upgraded_state: submitData.upgraded_state,
              investment_required: submitData.investment_required
            });

            if (aiResult.milestones && aiResult.milestones.length > 0) {
              milestones = aiResult.milestones;
              aiGuidance = {
                generated_at: new Date().toISOString(),
                project_tips: aiResult.project_tips || [],
                source: 'ai'
              };
              console.log(`✅ AI generated ${milestones.length} milestones with expert guidance`);
            }
          } catch (aiError) {
            console.warn('⚠️ AI milestone generation failed, falling back to templates:', aiError.message);
          } finally {
            setIsGeneratingMilestones(false);
          }
        }

        // Fall back to template-based generation if AI didn't work
        if (milestones.length === 0) {
          try {
            console.log('📋 Using template-based milestone generation...');
            milestones = getMilestonesForUpgrade(
              submitData.title,
              submitData.category
            );

            console.log(`✅ Generated ${milestones.length} milestones from templates`);
            console.log('Milestone titles:', milestones.map(m => m.title));

            if (milestones.length === 0) {
              console.warn('⚠️ No milestones generated! Using fallback...');
              // Absolute fallback - should never happen but just in case
              milestones = [{
                id: `milestone_${Date.now()}`,
                title: 'Project Planning',
                description: 'Plan and prepare for this project',
                order: 0,
                status: 'Not Started',
                completed_date: null,
                photos: [],
                notes: ''
              }];
            }

          } catch (milestoneError) {
            console.error('❌ Milestone generation failed:', milestoneError);
            // Even if generation fails, provide a basic milestone
            milestones = [{
              id: `milestone_${Date.now()}`,
              title: 'Project Planning',
              description: 'Plan and prepare for this project',
              order: 0,
              status: 'Not Started',
              completed_date: null,
              photos: [],
              notes: ''
            }];
          }
        }

        submitData.milestones = milestones;
        if (aiGuidance) {
          submitData.ai_guidance = aiGuidance;
        }
      }

      console.log('💾 Calling Upgrade.' + (project?.id ? 'update' : 'create'));
      console.log('Final submit data:', submitData);
      console.log('Milestones to save:', submitData.milestones?.length || 0);

      let result;
      if (project?.id) {
        result = await Upgrade.update(project.id, submitData);
        console.log('✅ Project updated:', result);
      } else {
        result = await Upgrade.create(submitData);
        console.log('✅ Project created:', result);
        console.log('New project ID:', result.id);
        console.log('Milestones in saved project:', result.milestones?.length || 0);
      }

      return result;
    },
    onSuccess: async (result) => {
      console.log('🎉 Save mutation successful!');
      console.log('Result:', result);
      console.log('Milestones saved:', result.milestones?.length || 0);

      // CRITICAL: Invalidate all upgrade queries to force reload
      console.log('🔄 Invalidating React Query cache...');
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      queryClient.invalidateQueries({ queryKey: ['upgrade'] });

      // ========================================
      // GAMIFICATION: Award XP for planning upgrade
      // Only for NEW projects, not edits
      // ========================================
      if (!project?.id && !hasAwardedXPRef.current) {
        hasAwardedXPRef.current = true;
        try {
          await awardXP('plan_upgrade', {
            entityType: 'upgrade',
            entityId: result.id,
            projectTitle: result.title,
            category: result.category
          });
        } catch (err) {
          console.error('Error awarding XP for planning upgrade:', err);
          // Don't block the user flow
        }
      }

      console.log('✅ Queries invalidated, showing success modal');
      setShowSuccess(true);

      setTimeout(() => {
        console.log('➡️ Closing modals and calling onComplete');
        setShowSuccess(false);
        onComplete?.();
      }, 1500);
    },
    onError: (err) => {
      console.error('❌ ERROR saving upgrade project:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(err.message || 'Failed to save project. Please try again.');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📝 Form submitted');
    console.log('Current form data:', formData);

    // Validation
    if (!formData.title.trim()) {
      console.warn('⚠️ Validation failed: Title is required');
      setError('Project title is required');
      return;
    }
    if (!formData.property_id) {
      console.warn('⚠️ Validation failed: Property not selected');
      setError('Please select a property');
      return;
    }

    console.log('✅ Validation passed, proceeding with save');
    setIsSubmitting(true);
    setError('');
    saveMutation.mutate(formData);
  };

  const { roi, netGain, payback } = calculateROI();

  if (showSuccess) {
    return (
      <Dialog open={true} onOpenChange={onComplete}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {project ? 'Project Updated!' : 'Project Created!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {project
                ? 'Your changes have been saved.'
                : `Your "${formData.title}" project is ready with guided milestones.`}
            </p>
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
              style={{ minHeight: '48px' }}
            >
              View Your Projects
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Categories must match database constraint in upgrades table
  // To add more, run migration: supabase/migrations/024_upgrade_category_expansion.sql
  const CATEGORIES = [
    "Property Value",
    "Energy Efficiency",
    "Rental Appeal",
    "Safety",
    "Comfort"
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {project ? 'Edit Upgrade Project' : 'New Upgrade Project'}
          </DialogTitle>
          {template && !project && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Creating from Template
                  </p>
                  <p className="text-xs text-blue-700">
                    {template.title} • Expected ROI: {template.average_roi_percent}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Includes step-by-step milestones with expert guidance
                  </p>
                </div>
              </div>
            </div>
          )}
          {!template && !project && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    AI-Powered Project Planning
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Add a description to get personalized milestones with expert guidance.
                    Otherwise, we'll use smart templates based on your project type.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">

          {/* ============================================ */}
          {/* SECTION 1: PROJECT BASICS (Always Visible) */}
          {/* ============================================ */}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Project Basics
            </h3>

            {/* Property Selector */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Property</span>
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => handleChange('property_id', value)}
              >
                <SelectTrigger style={{ minHeight: '48px' }}>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      🏠 {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Which property is this upgrade for?
              </p>
            </div>

            {/* Project Title */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Project Title</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Kitchen Refresh, HVAC Replacement"
                className="text-lg"
                required
                style={{ minHeight: '48px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Give your project a clear, memorable name
              </p>
            </div>

            {/* Category & Status - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold mb-2 block">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold mb-2 block">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">📋 Planned</SelectItem>
                    <SelectItem value="In Progress">🔨 In Progress</SelectItem>
                    <SelectItem value="Completed">✅ Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Manager */}
            <div>
              <Label className="font-semibold mb-2 block">Who's Managing This?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'DIY', icon: Hammer, label: 'DIY', desc: 'Self-Managed' },
                  { value: 'Operator', icon: Building2, label: '360° Operator', desc: 'Professional' },
                  { value: 'Contractor', icon: HardHat, label: 'Contractor', desc: 'Third Party' },
                  { value: 'TBD', icon: AlertCircle, label: 'TBD', desc: 'Decide Later' }
                ].map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('project_manager', value)}
                    className={`flex flex-col items-start p-4 border-2 rounded-lg transition-all ${
                      formData.project_manager === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ minHeight: '90px' }}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${
                      formData.project_manager === value ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <p className="text-sm font-semibold text-left">{label}</p>
                    <p className="text-xs text-gray-600 text-left">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="font-semibold mb-2 block">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What will this upgrade accomplish? Why are you doing it?"
                rows={3}
                className="resize-none"
                style={{ minHeight: '100px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Brief overview of what this project will achieve
              </p>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 2: FINANCIAL DETAILS (Collapsible) */}
          {/* ============================================ */}

          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowFinancials(!showFinancials)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ minHeight: '56px' }}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Financial Details
                </h3>
                {(formData.investment_required > 0 || formData.property_value_impact > 0) && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ROI: {roi}%
                  </span>
                )}
              </div>
              {showFinancials ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showFinancials && (
              <div className="mt-4 space-y-6 pl-7">

                {/* AI Cost Estimator */}
                {!project && (
                  <>
                    <AICostEstimator
                      propertyAddress={properties?.find(p => p.id === formData.property_id)?.address}
                      projectTitle={formData.title}
                      onEstimateGenerated={handleAIEstimate}
                    />

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or enter manually</span>
                      </div>
                    </div>
                  </>
                )}

                <AICostDisclaimer variant="compact" />

                {/* Investment Required */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Total Investment Required
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.investment_required}
                      onChange={(e) => handleChange('investment_required', e.target.value)}
                      className="pl-10 text-lg"
                      min="0"
                      step="100"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Materials + Labor + Permits + Other costs
                  </p>
                </div>

                {/* Property Value Impact */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Expected Property Value Increase
                  </Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.property_value_impact}
                      onChange={(e) => handleChange('property_value_impact', e.target.value)}
                      className="pl-10 text-lg"
                      min="0"
                      step="100"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    How much will this add to your home's value?
                  </p>
                </div>

                {/* Annual Savings */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Annual Savings (Optional)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.annual_savings}
                      onChange={(e) => handleChange('annual_savings', e.target.value)}
                      className="pl-10"
                      min="0"
                      step="50"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Energy savings, maintenance reduction, etc. (per year)
                  </p>
                </div>

                {/* ROI Calculator Display */}
                {(formData.investment_required > 0 || formData.property_value_impact > 0) && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-green-900">Project Economics</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-green-700 mb-1">ROI</p>
                        <p className="text-2xl font-bold text-green-900">{roi}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 mb-1">Net Gain</p>
                        <p className={`text-2xl font-bold ${
                          netGain >= 0 ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {netGain >= 0 ? '+' : ''}${netGain.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 mb-1">Payback</p>
                        <p className="text-2xl font-bold text-green-900">
                          {payback === 'N/A' ? 'N/A' : `${payback}y`}
                        </p>
                      </div>
                    </div>

                    {netGain < 0 && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                          This project has negative ROI. Consider if quality of life,
                          energy savings, or other non-financial benefits justify the investment.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* SECTION 3: DOCUMENTS (Collapsed)           */}
          {/* ============================================ */}

          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowDocuments(!showDocuments)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ minHeight: '56px' }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Documents
                </h3>
                {formData.documents?.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                    {formData.documents.length} file{formData.documents.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {showDocuments ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showDocuments && (
              <div className="mt-4 pl-7">
                <p className="text-sm text-gray-600 mb-4">
                  Upload receipts, estimates, contracts, warranties, and photos for this project.
                </p>
                <ProjectDocuments
                  projectId={project?.id || 'new'}
                  documents={formData.documents || []}
                  onDocumentsChange={(docs) => handleChange('documents', docs)}
                />
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* SECTION 4: ADVANCED OPTIONS (Collapsed)    */}
          {/* ============================================ */}

          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ minHeight: '56px' }}
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Advanced Options
                </h3>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-7">
                {/* Current State */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Current State (Before)
                  </Label>
                  <Textarea
                    value={formData.current_state}
                    onChange={(e) => handleChange('current_state', e.target.value)}
                    placeholder="Describe the current condition (e.g., 'Dated oak cabinets, worn laminate countertops, poor lighting')"
                    rows={2}
                    className="resize-none"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                {/* After Upgrade */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    After Upgrade (Target)
                  </Label>
                  <Textarea
                    value={formData.upgraded_state}
                    onChange={(e) => handleChange('upgraded_state', e.target.value)}
                    placeholder="Describe the desired outcome (e.g., 'White shaker cabinets, quartz countertops, modern pendant lighting')"
                    rows={2}
                    className="resize-none"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Additional Notes
                  </Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Timeline constraints, special requirements, contractor preferences, etc."
                    rows={3}
                    className="resize-none"
                    style={{ minHeight: '100px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isGeneratingMilestones || !formData.title || !formData.property_id}
              className="flex-1"
              style={{ minHeight: '48px', backgroundColor: 'var(--primary)' }}
            >
              {isGeneratingMilestones ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Milestones...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : project ? 'Save Changes' : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}