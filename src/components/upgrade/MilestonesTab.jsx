import React, { useState, useRef } from 'react';
import { Upgrade, integrations, supabase } from '@/api/supabaseClient';
import { useGamification } from '@/lib/GamificationContext';

// Helper to decode HTML entities in milestone data
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle2, Circle, Clock, Camera, MessageSquare,
  Edit, Trash2, ChevronDown, ChevronUp, Plus,
  AlertCircle, Sparkles, Loader2, RefreshCw, Image as ImageIcon, X
} from 'lucide-react';

/**
 * Generate AI-powered milestones for a project (regeneration)
 */
async function regenerateAIMilestones(project, additionalContext = '') {
  const prompt = `You are an expert home improvement project planner. Generate a detailed, actionable project plan with milestones for a homeowner.

PROJECT DETAILS:
- Title: ${project.title}
- Category: ${project.category}
- Budget: $${project.investment_required?.toLocaleString() || 'TBD'}
${project.description ? `- Description: ${project.description}` : ''}
${project.current_state ? `- Current State: ${project.current_state}` : ''}
${project.upgraded_state ? `- Target State: ${project.upgraded_state}` : ''}

${additionalContext ? `ADDITIONAL CONTEXT FROM USER:\n${additionalContext}\n` : ''}

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
              title: { type: "string", description: "Clear milestone name" },
              description: { type: "string", description: "What needs to be done" },
              ai_guidance: { type: "string", description: "Expert tip or common pitfall" },
              typical_duration_days: { type: "number", description: "Realistic estimate in days" },
              photo_prompts: {
                type: "array",
                items: { type: "string" },
                description: "What photos to capture"
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

  // Transform AI response into milestone format
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

export default function MilestonesTab({ project, onUpdate }) {
  const { awardXP } = useGamification();
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [regenerateContext, setRegenerateContext] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState('');
  const [isAnalyzingRisks, setIsAnalyzingRisks] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState(null);

  // Track if we've awarded XP for completing this project
  const hasAwardedCompleteXPRef = useRef(false);

  // Parse existing risk analysis from project's ai_guidance field
  React.useEffect(() => {
    if (project.ai_guidance) {
      let guidance = project.ai_guidance;
      if (typeof guidance === 'string') {
        try {
          guidance = JSON.parse(guidance);
        } catch (e) {
          console.error('Failed to parse ai_guidance:', e);
          return;
        }
      }
      // Extract risk_analysis from ai_guidance if it exists
      if (guidance.risk_analysis) {
        setRiskAnalysis(guidance.risk_analysis);
      }
    }
  }, [project.ai_guidance]);

  // AI Risk Analysis function
  const analyzeRisks = async () => {
    if (!project.milestones || project.milestones.length === 0) {
      alert('Add milestones first before analyzing risks.');
      return;
    }

    setIsAnalyzingRisks(true);

    try {
      const milestonesText = project.milestones.map((m, i) =>
        `${i + 1}. ${m.title} (Status: ${m.status}, Duration: ${m.typical_duration_days || 'unknown'} days)`
      ).join('\n');

      const result = await integrations.InvokeLLM({
        prompt: `You are an expert project manager analyzing a home improvement project for risks and optimization.

PROJECT: ${project.title}
CATEGORY: ${project.category}
BUDGET: $${project.investment_required?.toLocaleString() || 'TBD'}

MILESTONES:
${milestonesText}

Analyze these milestones and provide:
1. Dependency warnings (which milestones depend on others being complete first)
2. Sequencing issues (are they in the right order?)
3. Risk alerts (what could go wrong at each critical milestone)
4. Timeline risks (seasonal issues, contractor availability, etc.)
5. An optimized sequence recommendation if current order isn't ideal
6. A risk score from 1-10 (10 = highest risk)

Be specific about WHICH milestones have issues.`,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number" },
            risk_summary: { type: "string" },
            dependency_warnings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  milestone_index: { type: "number" },
                  depends_on: { type: "number" },
                  warning: { type: "string" }
                }
              }
            },
            sequencing_issues: { type: "array", items: { type: "string" } },
            critical_risks: { type: "array", items: { type: "string" } },
            timeline_risks: { type: "array", items: { type: "string" } },
            optimization_suggestion: { type: "string" }
          }
        }
      });

      if (!result || !result.risk_summary) {
        throw new Error('Invalid AI response');
      }

      const analysisWithTimestamp = {
        ...result,
        analyzed_at: new Date().toISOString()
      };

      // Parse existing ai_guidance to preserve other data
      let existingGuidance = {};
      if (project.ai_guidance) {
        if (typeof project.ai_guidance === 'string') {
          try {
            existingGuidance = JSON.parse(project.ai_guidance);
          } catch (e) {
            existingGuidance = {};
          }
        } else {
          existingGuidance = project.ai_guidance;
        }
      }

      // Save to database inside ai_guidance field
      await Upgrade.update(project.id, {
        ai_guidance: {
          ...existingGuidance,
          risk_analysis: analysisWithTimestamp
        }
      });

      setRiskAnalysis(analysisWithTimestamp);
      console.log('✅ Risk analysis complete');

    } catch (error) {
      console.error('❌ Risk analysis failed:', error);
      alert('Failed to analyze risks. Please try again.');
    } finally {
      setIsAnalyzingRisks(false);
    }
  };

  const handleRegenerateMilestones = async () => {
    // Warn user if there are completed milestones
    const completedCount = project.milestones?.filter(m => m.status === 'Completed').length || 0;
    if (completedCount > 0) {
      const confirmed = window.confirm(
        `Warning: You have ${completedCount} completed milestone(s). Regenerating will replace ALL existing milestones and you'll lose progress tracking. Continue?`
      );
      if (!confirmed) return;
    }

    setIsRegenerating(true);
    setRegenerateError('');

    try {
      console.log('🤖 Regenerating milestones with AI...');

      const aiResult = await regenerateAIMilestones(project, regenerateContext);

      if (!aiResult.milestones || aiResult.milestones.length === 0) {
        throw new Error('AI did not generate any milestones');
      }

      // Update project with new milestones
      await Upgrade.update(project.id, {
        milestones: aiResult.milestones,
        ai_guidance: {
          generated_at: new Date().toISOString(),
          project_tips: aiResult.project_tips || [],
          source: 'ai-regenerated',
          context_provided: !!regenerateContext
        }
      });

      console.log(`✅ Regenerated ${aiResult.milestones.length} milestones`);

      setShowRegenerateDialog(false);
      setRegenerateContext('');
      onUpdate();

    } catch (error) {
      console.error('❌ Failed to regenerate milestones:', error);
      setRegenerateError(error.message || 'Failed to generate new milestones. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      const updatedMilestones = project.milestones.map(m =>
        m.id === milestoneId
          ? {
              ...m,
              status: newStatus,
              completed_date: newStatus === 'Completed' ? new Date().toISOString() : null
            }
          : m
      );

      // Calculate progress for display (not stored in DB)
      const completedCount = updatedMilestones.filter(m => m.status === 'Completed').length;
      const progressPercent = Math.round((completedCount / updatedMilestones.length) * 100);

      // Update project status if all milestones complete
      const newProjectStatus = progressPercent === 100 ? 'Completed' :
                               progressPercent > 0 ? 'In Progress' :
                               project.status;

      // Only update columns that exist in the database schema
      await Upgrade.update(project.id, {
        milestones: updatedMilestones,
        status: newProjectStatus
      });

      console.log('Milestone updated:', milestoneId, '->', newStatus);
      console.log('Progress:', progressPercent + '%');

      // ========================================
      // GAMIFICATION: Award XP when upgrade project is completed
      // ========================================
      if (newProjectStatus === 'Completed' && project.status !== 'Completed' && !hasAwardedCompleteXPRef.current) {
        hasAwardedCompleteXPRef.current = true;
        try {
          await awardXP('complete_upgrade', {
            entityType: 'upgrade',
            entityId: project.id,
            projectTitle: project.title,
            category: project.category
          });
        } catch (err) {
          console.error('Error awarding XP for upgrade completion:', err);
          // Don't block the user flow
        }
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to update milestone:', error);
      alert('Failed to update milestone. Please try again.');
    }
  };

  const handleAddMilestone = () => {
    setShowAddForm(true);
  };

  return (
    <div className="space-y-4">

      {/* AI Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setShowRegenerateDialog(true)}
          variant="outline"
          className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
          style={{ minHeight: '48px' }}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Regenerate Milestones with AI
        </Button>
        <Button
          onClick={analyzeRisks}
          variant="outline"
          disabled={isAnalyzingRisks || !project.milestones?.length}
          className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
          style={{ minHeight: '48px' }}
        >
          {isAnalyzingRisks ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Risks...
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Analyze Risks & Dependencies
            </>
          )}
        </Button>
      </div>

      {/* AI Risk Analysis Results */}
      {riskAnalysis && (
        <div className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-gray-900">AI Risk Analysis</h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              riskAnalysis.risk_score <= 3 ? 'bg-green-100 text-green-700' :
              riskAnalysis.risk_score <= 6 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Risk Score: {riskAnalysis.risk_score}/10
            </div>
          </div>

          {/* Risk Summary */}
          <p className="text-sm text-gray-700">{riskAnalysis.risk_summary}</p>

          {/* Dependency Warnings */}
          {riskAnalysis.dependency_warnings?.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-2">⚠️ Dependency Warnings</p>
              <ul className="space-y-1">
                {riskAnalysis.dependency_warnings.map((dep, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-amber-500">→</span>
                    {dep.warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sequencing Issues */}
          {riskAnalysis.sequencing_issues?.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-semibold text-orange-800 mb-2">🔄 Sequencing Issues</p>
              <ul className="space-y-1">
                {riskAnalysis.sequencing_issues.map((issue, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Risks */}
          {riskAnalysis.critical_risks?.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="text-xs font-semibold text-red-800 mb-2">🚨 Critical Risks</p>
              <ul className="space-y-1">
                {riskAnalysis.critical_risks.map((risk, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-red-500">!</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline Risks */}
          {riskAnalysis.timeline_risks?.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-semibold text-purple-800 mb-2">📅 Timeline Risks</p>
              <ul className="space-y-1">
                {riskAnalysis.timeline_risks.map((risk, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500">⏱</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optimization Suggestion */}
          {riskAnalysis.optimization_suggestion && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-800 mb-1">💡 Optimization Suggestion</p>
              <p className="text-xs text-gray-700">{riskAnalysis.optimization_suggestion}</p>
            </div>
          )}

          {/* Timestamp */}
          {riskAnalysis.analyzed_at && (
            <p className="text-xs text-gray-400 text-right">
              Last analyzed: {new Date(riskAnalysis.analyzed_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Regenerate Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Regenerate Milestones with AI
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-700">
              AI will create a new set of personalized milestones based on your project details.
              This will <strong>replace all existing milestones</strong>.
            </p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <Textarea
                value={regenerateContext}
                onChange={(e) => setRegenerateContext(e.target.value)}
                placeholder="Add any additional details to help AI create better milestones. For example: I'm doing this myself (DIY), I have a contractor starting next week, I need to finish before winter, etc."
                rows={5}
                style={{ minHeight: '140px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                The more context you provide, the more tailored your milestones will be.
              </p>
            </div>

            {regenerateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{regenerateError}</p>
                </div>
              </div>
            )}

            {project.milestones?.some(m => m.status === 'Completed') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    You have completed milestones. Regenerating will reset all progress.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowRegenerateDialog(false)}
                variant="outline"
                disabled={isRegenerating}
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegenerateMilestones}
                disabled={isRegenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                style={{ minHeight: '48px' }}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate New Milestones
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* No Milestones Warning */}
      {(!project.milestones || project.milestones.length === 0) && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">No Milestones Yet</p>
              <p className="text-sm text-yellow-800">
                Click "Regenerate Milestones with AI" above to get personalized project steps,
                or add your own custom milestones below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Milestone List */}
      {project.milestones?.map((milestone, index) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          index={index}
          isExpanded={expandedMilestone === milestone.id}
          onToggleExpand={() => setExpandedMilestone(
            expandedMilestone === milestone.id ? null : milestone.id
          )}
          onStatusChange={handleStatusChange}
          project={project}
          onUpdate={onUpdate}
        />
      ))}

      {/* Add Custom Milestone */}
      {showAddForm ? (
        <AddMilestoneForm
          project={project}
          onSave={() => {
            setShowAddForm(false);
            onUpdate();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button
          onClick={handleAddMilestone}
          variant="outline"
          className="w-full"
          style={{ minHeight: '48px' }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Custom Milestone
        </Button>
      )}
    </div>
  );
}

// Milestone Card Component (Mobile-First)
function MilestoneCard({
  milestone,
  index,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  project,
  onUpdate
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editData, setEditData] = useState({
    title: milestone.title,
    description: milestone.description || '',
    notes: milestone.notes || ''
  });
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingPhoto(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file size (5MB max for photos)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Photo ${file.name} is too large. Maximum size is 5MB.`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `milestones/${project.id}/${milestone.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase storage using upgrade-documents bucket
        const { data, error } = await supabase.storage
          .from('upgrade-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('upgrade-documents')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Update milestone with new photos
      const updatedMilestones = project.milestones.map(m =>
        m.id === milestone.id
          ? { ...m, photos: [...(m.photos || []), ...uploadedUrls] }
          : m
      );

      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log(`✅ Added ${uploadedUrls.length} photo(s) to milestone:`, milestone.id);
      onUpdate();

    } catch (error) {
      console.error('❌ Failed to upload photo:', error);
      alert(error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (photoIndex) => {
    if (!window.confirm('Remove this photo?')) return;

    try {
      const updatedPhotos = milestone.photos.filter((_, i) => i !== photoIndex);
      const updatedMilestones = project.milestones.map(m =>
        m.id === milestone.id ? { ...m, photos: updatedPhotos } : m
      );

      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log('✅ Photo removed from milestone:', milestone.id);
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to remove photo:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };
  
  const statusBg = {
    'Completed': 'bg-green-50 border-green-300',
    'In Progress': 'bg-yellow-50 border-yellow-300',
    'Not Started': 'bg-white border-gray-200',
    'Skipped': 'bg-gray-50 border-gray-300'
  }[milestone.status] || 'bg-white border-gray-200';

  const statusIcon = {
    'Completed': <CheckCircle2 className="w-6 h-6 text-green-600" />,
    'In Progress': <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />,
    'Not Started': <Circle className="w-6 h-6 text-gray-400" />,
    'Skipped': <Circle className="w-6 h-6 text-gray-300" />
  }[milestone.status];

  const handleSaveEdit = async () => {
    try {
      const updatedMilestones = project.milestones.map(m =>
        m.id === milestone.id ? { ...m, ...editData } : m
      );

      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log('✅ Milestone edited:', milestone.id);
      setShowEditForm(false);
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to edit milestone:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete milestone "${milestone.title}"?`)) return;

    try {
      const updatedMilestones = project.milestones.filter(m => m.id !== milestone.id);

      // Only update milestones column (progress is calculated on the fly)
      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log('Milestone deleted:', milestone.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      alert('Failed to delete milestone. Please try again.');
    }
  };

  if (showEditForm) {
    return (
      <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
        <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
          Edit Milestone
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Title *
            </label>
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              style={{ minHeight: '48px' }}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              style={{ minHeight: '80px' }}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              style={{ minHeight: '80px' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveEdit}
              className="flex-1"
              style={{ minHeight: '44px' }}
            >
              Save Changes
            </Button>
            <Button
              onClick={() => setShowEditForm(false)}
              variant="outline"
              className="flex-1"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-xl p-4 ${statusBg}`}>
      {/* Header - Always Visible */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {statusIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">
              {index + 1}. {decodeHtmlEntities(milestone.title)}
            </h4>
            <button
              onClick={onToggleExpand}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              style={{ minHeight: '32px', minWidth: '32px' }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            {milestone.status === 'Completed' && milestone.completed_date && (
              <span className="text-green-700">
                ✓ Completed {new Date(milestone.completed_date).toLocaleDateString()}
              </span>
            )}
            {milestone.status === 'In Progress' && (
              <span className="text-yellow-700">🔨 In Progress</span>
            )}
            {milestone.status === 'Not Started' && (
              <span className="text-gray-500">Not Started</span>
            )}
            {milestone.status === 'Skipped' && (
              <span className="text-gray-400">Skipped</span>
            )}
          </p>

          {/* Quick Actions - Mobile Friendly */}
          {!isExpanded && (
            <div className="flex flex-wrap gap-2">
              {milestone.status === 'Not Started' && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(milestone.id, 'In Progress')}
                  style={{ minHeight: '36px' }}
                >
                  Start
                </Button>
              )}
              {milestone.status === 'In Progress' && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(milestone.id, 'Completed')}
                  className="bg-green-600 hover:bg-green-700"
                  style={{ minHeight: '36px' }}
                >
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 pl-0 sm:pl-9">
          {/* Description */}
          {milestone.description && (
            <div>
              <p className="text-sm text-gray-700">{decodeHtmlEntities(milestone.description)}</p>
            </div>
          )}

          {/* AI Guidance */}
          {milestone.ai_guidance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    AI Guidance
                  </p>
                  <p className="text-xs text-blue-800">{decodeHtmlEntities(milestone.ai_guidance)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">
                📸 Photos {milestone.photos?.length > 0 && `(${milestone.photos.length})`}
              </p>
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  style={{ minHeight: '32px' }}
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-3 h-3 mr-1" />
                      Add Photos
                    </>
                  )}
                </Button>
              </label>
            </div>

            {/* Photo Prompts from AI */}
            {milestone.photo_prompts && milestone.photo_prompts.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2">
                <p className="text-xs text-gray-600 mb-1">📷 Suggested photos to capture:</p>
                <ul className="text-xs text-gray-700 list-disc list-inside space-y-0.5">
                  {milestone.photo_prompts.map((prompt, i) => (
                    <li key={i}>{prompt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Photo Grid with Remove Option */}
            {milestone.photos && milestone.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {milestone.photos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={photo}
                      alt={`Milestone photo ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ minHeight: '24px', minWidth: '24px' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">No photos yet</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {milestone.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">📝 Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{milestone.notes}</p>
            </div>
          )}

          {/* Duration */}
          {milestone.typical_duration_days && (
            <div className="text-xs text-gray-600">
              ⏱️ Typical duration: {milestone.typical_duration_days} day{milestone.typical_duration_days !== 1 ? 's' : ''}
            </div>
          )}

          {/* Actions - Mobile First */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {milestone.status !== 'Completed' && (
              <>
                {milestone.status === 'Not Started' && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(milestone.id, 'In Progress')}
                    style={{ minHeight: '44px' }}
                  >
                    Start This Milestone
                  </Button>
                )}
                {milestone.status === 'In Progress' && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(milestone.id, 'Completed')}
                    className="bg-green-600 hover:bg-green-700"
                    style={{ minHeight: '44px' }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                )}
              </>
            )}
            {milestone.status === 'Completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(milestone.id, 'In Progress')}
                style={{ minHeight: '44px' }}
              >
                Reopen
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditForm(true)}
              style={{ minHeight: '44px' }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
              style={{ minHeight: '44px' }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Milestone Form
function AddMilestoneForm({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ai_guidance: '',
    typical_duration_days: 1
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    try {
      const newMilestone = {
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        order: project.milestones?.length || 0,
        status: 'Not Started',
        completed_date: null,
        photos: [],
        notes: ''
      };

      const updatedMilestones = [...(project.milestones || []), newMilestone];

      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log('✅ Milestone added:', newMilestone.title);
      onSave();
    } catch (error) {
      console.error('❌ Failed to add milestone:', error);
      alert('Failed to add milestone. Please try again.');
    }
  };

  return (
    <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
      <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
        Add Custom Milestone
      </h4>

      <div className="space-y-3">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Get 3 contractor quotes"
            style={{ minHeight: '48px' }}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What needs to be done in this milestone?"
            rows={3}
            style={{ minHeight: '100px' }}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Estimated Duration (days)
          </label>
          <Input
            type="number"
            value={formData.typical_duration_days}
            onChange={(e) => setFormData(prev => ({ ...prev, typical_duration_days: parseInt(e.target.value) || 1 }))}
            min="1"
            style={{ minHeight: '48px' }}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className="flex-1"
            style={{ minHeight: '44px' }}
          >
            Add Milestone
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}