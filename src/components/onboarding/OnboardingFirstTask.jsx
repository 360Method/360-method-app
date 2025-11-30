import React, { useState } from "react";
import { auth } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  Zap,
  Shield,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  BarChart3
} from "lucide-react";

/**
 * OnboardingFirstTask - Step 3 (Final step)
 *
 * Shows personalized first action based on:
 * - User intent survey (fear, goal, trigger)
 * - Property insights (systems at risk)
 *
 * Different paths for different motivations:
 * - Had emergency → "Let's prevent this from happening again"
 * - Fear-specific → "Let's check your [feared system]"
 * - Investor goal → "Set up your portfolio view"
 * - Prepare to sell → "Boost your marketability score"
 * - Just bought → "Welcome! Let's document while it's fresh"
 */

export default function OnboardingFirstTask({ onComplete, data }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const queryClient = useQueryClient();

  // Extract data
  const property = data?.property;
  const insights = data?.insights || [];
  const intent = data?.intent || {};
  const homeAge = data?.propertyData?.year_built
    ? new Date().getFullYear() - data.propertyData.year_built
    : null;

  // Get personalized action based on intent
  const personalizedAction = getPersonalizedFirstAction(intent, insights, property, homeAge);

  const updateUserMutation = useMutation({
    mutationFn: (userData) => auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const handlePrimaryAction = async () => {
    setIsCompleting(true);

    try {
      await updateUserMutation.mutateAsync({
        onboarding_completed: true
      });
    } catch (err) {
      console.log('Could not update user onboarding status:', err);
    }

    onComplete({
      destination: personalizedAction.destination,
      property,
      suggestedSystem: personalizedAction.system
    });
  };

  const handleSecondaryAction = async () => {
    setIsCompleting(true);

    try {
      await updateUserMutation.mutateAsync({
        onboarding_completed: true
      });
    } catch (err) {
      console.log('Could not update user onboarding status:', err);
    }

    onComplete({
      destination: 'dashboard',
      property
    });
  };

  // Get appropriate icon for the action
  const ActionIcon = personalizedAction.icon || Camera;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Success Header - Personalized */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />

        <CardContent className="p-8 md:p-10 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {personalizedAction.successTitle || "You're All Set!"}
          </h1>

          <p className="text-xl text-green-100 mb-4">
            {personalizedAction.successSubtitle || "Your property is ready for the 360° Method"}
          </p>

          {property && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{property.formatted_address || property.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalized Primary Action */}
      <Card className={`border-2 ${personalizedAction.borderColor || 'border-orange-200'} ${personalizedAction.bgColor || 'bg-gradient-to-r from-orange-50 to-amber-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={`${personalizedAction.badgeColor || 'bg-orange-500'} text-white`}>
              {personalizedAction.badgeText || 'Recommended Next Step'}
            </Badge>
            {personalizedAction.urgency === 'critical' && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Priority
              </Badge>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${personalizedAction.iconBg || 'bg-orange-500'} flex items-center justify-center flex-shrink-0`}>
              <ActionIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {personalizedAction.headline}
              </h3>
              <p className="text-slate-600 mb-3">
                {personalizedAction.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {personalizedAction.timeEstimate || '5 minutes'}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {personalizedAction.effort || 'Quick setup'}
                </span>
              </div>

              <Button
                onClick={handlePrimaryAction}
                disabled={isCompleting}
                className="w-full sm:w-auto gap-2"
                style={{
                  backgroundColor: personalizedAction.buttonColor || '#f97316',
                  minHeight: '48px'
                }}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {personalizedAction.ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Action */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">
                {personalizedAction.alternativeTitle || 'Or Explore Your Dashboard'}
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                {personalizedAction.alternativeDescription || "Look around first and come back when you're ready."}
              </p>
              <Button
                onClick={handleSecondaryAction}
                disabled={isCompleting}
                variant="outline"
                className="gap-2"
              >
                {personalizedAction.alternativeCta || 'Go to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tip - Contextual */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                {personalizedAction.tipTitle || 'Pro Tip: Data Plates Are Gold'}
              </h4>
              <p className="text-sm text-blue-800">
                {personalizedAction.tipText ||
                  "When documenting systems, look for the data plate (usually a metal sticker) with the model number, serial number, and manufacture date. One photo of this tells us everything we need to know."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Get personalized first action based on user intent and property data
 */
function getPersonalizedFirstAction(intent, insights, property, homeAge) {
  const { fear, goal, trigger } = intent || {};

  // Get top priority system from insights
  const topPrioritySystem = insights.find(i => i.status === 'verify')?.system ||
                            insights[0]?.system ||
                            'HVAC System';

  // ===============================
  // TRIGGER-BASED PERSONALIZATION
  // ===============================

  // Had emergency - highest urgency
  if (trigger === 'had_emergency') {
    return {
      headline: "Let's Make Sure This Doesn't Happen Again",
      description: "Document your critical systems now so you'll never be caught off-guard. We'll help you spot warning signs early.",
      ctaText: "Protect My Home",
      destination: 'baseline',
      system: topPrioritySystem,
      icon: Shield,
      urgency: 'critical',
      badgeText: 'Your Priority',
      badgeColor: 'bg-red-500',
      borderColor: 'border-red-200',
      bgColor: 'bg-gradient-to-r from-red-50 to-orange-50',
      iconBg: 'bg-red-500',
      buttonColor: '#ef4444',
      timeEstimate: '10 minutes',
      effort: 'Critical systems first',
      successTitle: "Let's Prevent Future Emergencies",
      successSubtitle: "You're taking control of your home's health",
      tipTitle: 'Learn From This',
      tipText: "Start with the system that caused your emergency. Document its age, condition, and any service history. This creates your baseline for monitoring."
    };
  }

  // Just bought - new homeowner excitement
  if (trigger === 'just_bought') {
    return {
      headline: "Welcome to Your New Home!",
      description: "The perfect time to document everything while it's fresh. Sellers often leave behind system info and receipts - let's capture it all.",
      ctaText: "Document My Home",
      destination: 'baseline',
      system: topPrioritySystem,
      icon: Home,
      urgency: 'high',
      badgeText: 'Perfect Timing',
      badgeColor: 'bg-green-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
      iconBg: 'bg-green-500',
      buttonColor: '#22c55e',
      timeEstimate: '15 minutes',
      effort: 'Complete walkthrough',
      successTitle: "Congratulations on Your New Home!",
      successSubtitle: "Let's get you set up for success",
      alternativeTitle: 'Or Take It Slow',
      alternativeDescription: "Unpack first, we'll be here when you're ready.",
      tipTitle: 'Check Your Closing Documents',
      tipText: "Your closing paperwork often includes home warranty info, appliance ages, and recent repairs. Grab those receipts now while they're easy to find!"
    };
  }

  // ===============================
  // GOAL-BASED PERSONALIZATION
  // ===============================

  // Investor path
  if (goal === 'build_wealth') {
    return {
      headline: "Set Up Your Investment Property",
      description: "Get this property documented and you'll unlock portfolio tracking, ROI calculations, and multi-property comparisons.",
      ctaText: "Start Tracking ROI",
      destination: 'baseline',
      system: topPrioritySystem,
      icon: TrendingUp,
      urgency: 'medium',
      badgeText: 'Investor Setup',
      badgeColor: 'bg-purple-500',
      borderColor: 'border-purple-200',
      bgColor: 'bg-gradient-to-r from-purple-50 to-indigo-50',
      iconBg: 'bg-purple-500',
      buttonColor: '#9333ea',
      timeEstimate: '10 minutes',
      effort: 'Investment basics',
      successTitle: "Your First Property is Ready!",
      successSubtitle: "Portfolio tracking unlocked",
      alternativeTitle: 'View Investor Dashboard',
      alternativeDescription: "See your portfolio overview and add more properties later.",
      alternativeCta: 'Go to Portfolio',
      tipTitle: 'Think Like an Investor',
      tipText: "Track maintenance costs per property to calculate true ROI. The 360° Method helps you see which properties are cash cows vs. money pits."
    };
  }

  // Preparing to sell
  if (goal === 'prepare_sell') {
    return {
      headline: "Boost Your Home's Marketability",
      description: "Documented, well-maintained homes sell faster and for more. Let's build your property's health record.",
      ctaText: "Maximize My Value",
      destination: 'baseline',
      system: topPrioritySystem,
      icon: BarChart3,
      urgency: 'medium',
      badgeText: 'Seller Advantage',
      badgeColor: 'bg-blue-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-500',
      buttonColor: '#3b82f6',
      timeEstimate: '15 minutes',
      effort: 'Full documentation',
      successTitle: "Preparing for a Great Sale!",
      successSubtitle: "Documentation builds buyer confidence",
      tipTitle: 'What Buyers Want to See',
      tipText: "Buyers pay more for homes with documented maintenance history. A 360° certified home shows you've been a responsible owner - that's worth thousands."
    };
  }

  // Save money focus
  if (goal === 'save_money') {
    return {
      headline: "Start Saving on Home Repairs",
      description: `Your ${homeAge || ''}-year-old home likely has systems approaching end-of-life. Let's find the small fixes before they become expensive emergencies.`,
      ctaText: "Find Savings Now",
      destination: 'baseline',
      system: topPrioritySystem,
      icon: DollarSign,
      urgency: 'medium',
      badgeText: 'Money Saver',
      badgeColor: 'bg-green-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
      iconBg: 'bg-green-500',
      buttonColor: '#22c55e',
      timeEstimate: '10 minutes',
      effort: 'High-impact systems',
      successTitle: "Start Saving Money!",
      successSubtitle: "The $50 fix beats the $5,000 emergency",
      tipTitle: 'The Math is Simple',
      tipText: "Average homeowners face $10K+ in emergency repairs. Catching issues early costs 90% less. Just documenting your systems is the first step to huge savings."
    };
  }

  // ===============================
  // FEAR-BASED PERSONALIZATION
  // ===============================

  // HVAC fear + HVAC in insights
  if (fear === 'hvac_failure') {
    const hvacSystem = insights.find(i =>
      (i.system || '').toLowerCase().includes('hvac') ||
      (i.system || '').toLowerCase().includes('furnace') ||
      (i.system || '').toLowerCase().includes('air conditioner')
    );

    return {
      headline: "Let's Check Your HVAC System",
      description: hvacSystem
        ? `Your ${hvacSystem.system} is ${hvacSystem.estimatedAge || homeAge}+ years old. Let's document it so you're never caught in a heatwave or freeze without warning.`
        : "HVAC failures are the #1 emergency repair. Let's make sure yours is tracked and healthy.",
      ctaText: "Document My HVAC",
      destination: 'baseline',
      system: hvacSystem?.system || 'HVAC System',
      icon: Shield,
      urgency: 'high',
      badgeText: 'Your Concern',
      badgeColor: 'bg-orange-500',
      borderColor: 'border-orange-200',
      bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
      iconBg: 'bg-orange-500',
      buttonColor: '#f97316',
      timeEstimate: '5 minutes',
      effort: 'One system focus',
      successTitle: "Let's Tackle Your HVAC First",
      successSubtitle: "Addressing what matters most to you",
      tipTitle: 'HVAC Quick Check',
      tipText: "Find the data plate on your furnace or AC unit - it's usually on the side panel. The serial number often encodes the manufacture date. We'll decode it for you!"
    };
  }

  // Roof fear + roof in insights
  if (fear === 'roof_leak') {
    const roofSystem = insights.find(i =>
      (i.system || '').toLowerCase().includes('roof')
    );

    return {
      headline: "Let's Check Your Roof",
      description: roofSystem
        ? `Your roof is ${roofSystem.estimatedAge || homeAge}+ years old. A small leak can cause $30K+ in damage. Let's make sure you're protected.`
        : "Roof leaks are sneaky and destructive. Let's document yours and catch problems early.",
      ctaText: "Document My Roof",
      destination: 'baseline',
      system: roofSystem?.system || 'Roof System',
      icon: Shield,
      urgency: 'high',
      badgeText: 'Your Concern',
      badgeColor: 'bg-orange-500',
      borderColor: 'border-orange-200',
      bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
      iconBg: 'bg-orange-500',
      buttonColor: '#f97316',
      timeEstimate: '5 minutes',
      effort: 'One system focus',
      successTitle: "Let's Tackle Your Roof First",
      successSubtitle: "Addressing what matters most to you",
      tipTitle: 'Roof Warning Signs',
      tipText: "Look for: missing shingles, dark spots, granules in gutters, light in attic, or water stains on ceilings. Document these when you take photos!"
    };
  }

  // ===============================
  // DEFAULT - TOP PRIORITY SYSTEM
  // ===============================

  return {
    headline: `Document Your ${topPrioritySystem?.replace(' System', '') || 'First System'}`,
    description: homeAge
      ? `Based on your ${homeAge}-year-old home, your ${topPrioritySystem || 'systems'} should be documented first. A quick photo and basic info is all we need.`
      : "Take a quick photo of your major systems so we can track their age and help you plan ahead.",
    ctaText: `Start With ${topPrioritySystem?.replace(' System', '') || 'Documenting'}`,
    destination: 'baseline',
    system: topPrioritySystem,
    icon: Camera,
    urgency: 'medium',
    badgeText: 'Recommended Next Step',
    badgeColor: 'bg-orange-500',
    borderColor: 'border-orange-200',
    bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
    iconBg: 'bg-orange-500',
    buttonColor: '#f97316',
    timeEstimate: '5 minutes',
    effort: 'Quick photo + basic info',
    successTitle: "You're All Set!",
    successSubtitle: "Your property is ready for the 360° Method",
    tipTitle: 'Pro Tip: Data Plates Are Gold',
    tipText: "When documenting systems, look for the data plate (usually a metal sticker) with the model number, serial number, and manufacture date. One photo tells us everything!"
  };
}
