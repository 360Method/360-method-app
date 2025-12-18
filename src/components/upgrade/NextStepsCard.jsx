import React, { useState, useEffect } from 'react';
import {
  Building2, Share2, FileText, Hammer,
  MapPin, AlertCircle, CheckCircle2, Sparkles, RefreshCw, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { integrations, Upgrade } from '@/api/supabaseClient';
import { isServiceAvailable, extractZipFromAddress } from '../shared/serviceAreas';
import RequestOperatorQuoteDialog from './RequestOperatorQuoteDialog';
import ShareProjectDialog from './ShareProjectDialog';
import ExportProjectDialog from './ExportProjectDialog';
import NotifyWhenAvailableDialog from './NotifyWhenAvailableDialog';

export default function NextStepsCard({ project, property, onNavigateToMilestones, onUpdate }) {
  const [showOperatorDialog, setShowOperatorDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // Get property zip code
  const propertyZip = property?.zip_code || extractZipFromAddress(property?.address);

  // Check if 360° Operator serves this property's zip code
  const serviceCheck = isServiceAvailable(propertyZip);
  const operatorAvailable = serviceCheck.available;
  const operatorName = serviceCheck.operatorName || '360° Operator';
  const serviceArea = serviceCheck.areaName || '';

  // Check if user has already requested operator quote
  const operatorQuoteRequested = project.operator_quote_requested;

  // Parse existing AI recommendation from ai_guidance field
  useEffect(() => {
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
      if (guidance?.next_step_recommendation) {
        setRecommendation(guidance.next_step_recommendation);
      }
    }
  }, [project.ai_guidance]);

  // Generate AI recommendation
  const generateRecommendation = async () => {
    setIsGeneratingRecommendation(true);

    try {
      const result = await integrations.InvokeLLM({
        prompt: `You are an expert home improvement advisor helping a homeowner decide how to proceed with their upgrade project.

PROJECT DETAILS:
- Title: ${project.title}
- Category: ${project.category}
- Budget: $${project.investment_required?.toLocaleString() || 'TBD'}
- Description: ${project.description || 'No description'}
- Current Status: ${project.status}
- Milestones: ${project.milestones?.length || 0} total, ${project.milestones?.filter(m => m.status === 'Completed').length || 0} completed

PROPERTY:
- Type: ${property?.property_type || 'Unknown'}
- Location ZIP: ${propertyZip || 'Unknown'}

AVAILABLE OPTIONS:
1. Hire a Professional (360° Operator available: ${operatorAvailable ? 'Yes' : 'No'})
2. Get Multiple Contractor Quotes
3. DIY with Milestone Tracking

Based on project complexity, budget, and category, provide:
1. Your recommended approach (one of: "professional", "contractor_quotes", or "diy")
2. A brief reason why (2-3 sentences)
3. Key considerations for this project (3 bullet points)
4. Estimated DIY difficulty (1-10, where 10 is most difficult)

Be practical and consider: permit requirements, safety concerns, specialized skills needed, and potential cost savings.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_approach: { type: "string", enum: ["professional", "contractor_quotes", "diy"] },
            reason: { type: "string" },
            considerations: { type: "array", items: { type: "string" } },
            diy_difficulty: { type: "number" }
          }
        }
      });

      if (!result || !result.recommended_approach) {
        throw new Error('Invalid AI response');
      }

      const recommendationWithTimestamp = {
        ...result,
        generated_at: new Date().toISOString()
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

      // Save next_step_recommendation inside ai_guidance field
      await Upgrade.update(project.id, {
        ai_guidance: {
          ...existingGuidance,
          next_step_recommendation: recommendationWithTimestamp
        }
      });

      setRecommendation(recommendationWithTimestamp);
      console.log('✅ Smart recommendation generated');
      onUpdate?.();

    } catch (error) {
      console.error('❌ Failed to generate recommendation:', error);
      alert('Failed to generate recommendation. Please try again.');
    } finally {
      setIsGeneratingRecommendation(false);
    }
  };

  // Get display info for recommended approach
  const getRecommendationDisplay = (approach) => {
    switch (approach) {
      case 'professional':
        return { label: 'Hire a Professional', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'contractor_quotes':
        return { label: 'Get Multiple Quotes', icon: Share2, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'diy':
        return { label: 'DIY Project', icon: Hammer, color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { label: 'Unknown', icon: Lightbulb, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🎯</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Next Steps</h3>
        </div>

        {/* AI Recommendation Section */}
        {recommendation ? (
          <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900 text-sm">AI Recommendation</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={generateRecommendation}
                disabled={isGeneratingRecommendation}
                className="text-xs"
                style={{ minHeight: '32px' }}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isGeneratingRecommendation ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {(() => {
              const display = getRecommendationDisplay(recommendation.recommended_approach);
              const Icon = display.icon;
              return (
                <>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${display.bg} mb-3`}>
                    <Icon className={`w-5 h-5 ${display.color}`} />
                    <span className={`font-bold ${display.color}`}>{display.label}</span>
                    {recommendation.diy_difficulty && (
                      <span className="ml-auto text-xs text-gray-600">
                        DIY Difficulty: {recommendation.diy_difficulty}/10
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{recommendation.reason}</p>

                  {recommendation.considerations?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600">Key Considerations:</p>
                      <ul className="space-y-1">
                        {recommendation.considerations.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-indigo-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-4 mb-4 text-center">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Get a personalized recommendation</p>
            <Button
              size="sm"
              onClick={generateRecommendation}
              disabled={isGeneratingRecommendation}
              className="bg-indigo-600 hover:bg-indigo-700"
              style={{ minHeight: '40px' }}
            >
              {isGeneratingRecommendation ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Project...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Recommendation
                </>
              )}
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-700 mb-4">
          Ready to get started? Choose how you want to proceed:
        </p>

        <div className="space-y-3">
          {/* OPTION 1: 360° Operator - ONLY IF AVAILABLE IN ZIP CODE */}
          {operatorAvailable ? (
            <button
              onClick={() => setShowOperatorDialog(true)}
              className="w-full bg-white border-2 border-blue-300 rounded-xl p-4 hover:bg-blue-50 transition-all text-left"
              style={{ minHeight: '80px' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      Request {operatorName} Quote
                    </p>
                    {operatorQuoteRequested && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {operatorQuoteRequested 
                      ? 'Quote requested - we\'ll contact you within 24 hours'
                      : 'Professional 360° service with member discount pricing'
                    }
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>Serving {serviceArea}</span>
                  </div>
                </div>
              </div>
            </button>
          ) : (
            /* NO OPERATOR AVAILABLE - Show Expanding Soon Message */
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 mb-1 text-sm sm:text-base">
                    360° Operator Coming Soon
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800 mb-2">
                    Professional service isn't available in your area yet, but we're expanding!
                  </p>
                  {propertyZip && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>Not yet serving zip code {propertyZip}</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setShowNotifyDialog(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white mb-2"
                    style={{ minHeight: '40px' }}
                  >
                    Notify Me When Available
                  </Button>
                  <p className="text-xs text-amber-700">
                    💡 Meanwhile, you can share with local contractors below
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 2: Share with Contractors (ALWAYS AVAILABLE) */}
          <button
            onClick={() => setShowShareDialog(true)}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                  Share with Contractors
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Email project details to get multiple quotes
                </p>
              </div>
            </div>
          </button>

          {/* OPTION 3: Export/Print (ALWAYS AVAILABLE) */}
          <button
            onClick={() => setShowExportDialog(true)}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                  Export Project Details
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Download PDF, print, or save for permits
                </p>
              </div>
            </div>
          </button>

          {/* OPTION 4: DIY (ALWAYS AVAILABLE) */}
          <button
            onClick={onNavigateToMilestones}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Hammer className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                  DIY - Manage It Yourself
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Follow step-by-step milestones and track progress
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Dialogs */}
      {operatorAvailable && (
        <RequestOperatorQuoteDialog
          project={project}
          property={property}
          operatorName={operatorName}
          serviceArea={serviceArea}
          isOpen={showOperatorDialog}
          onClose={() => setShowOperatorDialog(false)}
        />
      )}

      <NotifyWhenAvailableDialog
        zipCode={propertyZip}
        isOpen={showNotifyDialog}
        onClose={() => setShowNotifyDialog(false)}
      />

      <ShareProjectDialog
        project={project}
        property={property}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />

      <ExportProjectDialog
        project={project}
        property={property}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </>
  );
}