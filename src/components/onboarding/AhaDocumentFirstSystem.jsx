import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@/api/supabaseClient';
import { useAhaMoments, AHA_MOMENTS } from './AhaMomentManager';
import { AhaMomentModal, AhaMomentCard } from './AhaMomentPrompt';
import { Camera, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * Aha #2: "I can track this"
 *
 * Triggers after onboarding when user lands on Dashboard for the first time.
 * Prompts them to document their first system.
 *
 * Flow:
 * 1. User completes onboarding (Aha #1)
 * 2. User lands on Dashboard
 * 3. This prompt appears: "Let's document your first system"
 * 4. Click "Document My HVAC" → Navigate to Baseline
 * 5. Complete documenting → Aha #2 completed
 */

// Systems to suggest based on priority/importance
const SUGGESTED_SYSTEMS = [
  { id: 'hvac', name: 'HVAC System', icon: '❄️', description: 'Heating & cooling - often the most expensive to replace' },
  { id: 'water_heater', name: 'Water Heater', icon: '🔥', description: 'Essential daily comfort - usually has a visible age plate' },
  { id: 'roof', name: 'Roof', icon: '🏠', description: 'Protects everything - critical to track' },
  { id: 'electrical', name: 'Electrical Panel', icon: '⚡', description: 'Safety first - know what you have' },
];

export function AhaDocumentFirstSystemModal({ suggestedSystem }) {
  const navigate = useNavigate();
  const {
    activePrompt,
    completeMoment,
    dismissPrompt,
    isMomentCompleted,
    AHA_MOMENTS,
  } = useAhaMoments();

  const isOpen = activePrompt === AHA_MOMENTS.CAN_TRACK;
  const system = suggestedSystem || SUGGESTED_SYSTEMS[0];

  const handleDocument = () => {
    // Navigate to Baseline with suggested system
    navigate(`${createPageUrl('Baseline')}?suggestedSystem=${system.id}&fromAha=true`);
    dismissPrompt(AHA_MOMENTS.CAN_TRACK); // Close modal, will complete when they actually document
  };

  const handleDismiss = () => {
    dismissPrompt(AHA_MOMENTS.CAN_TRACK);
  };

  if (isMomentCompleted(AHA_MOMENTS.CAN_TRACK)) {
    return null;
  }

  return (
    <AhaMomentModal
      open={isOpen}
      onClose={handleDismiss}
      onPrimaryAction={handleDocument}
      onSecondaryAction={handleDismiss}
      icon={Camera}
      iconBgColor="bg-orange-500"
      title="Let's Document Your First System"
      description="Great! Your property is set up. Now let's track what's actually in your home - it takes just 2 minutes."
      primaryLabel={`Document My ${system.name}`}
      secondaryLabel="Maybe Later"
    >
      {/* System suggestion */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{system.icon}</span>
          <div>
            <h4 className="font-semibold text-slate-900">{system.name}</h4>
            <p className="text-sm text-slate-600">{system.description}</p>
          </div>
        </div>
      </div>

      {/* Why this matters */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-orange-500" />
          <span>Takes about 2 minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Wrench className="w-4 h-4 text-orange-500" />
          <span>Just a photo + basic info</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-orange-500" />
          <span>Unlocks personalized maintenance tips</span>
        </div>
      </div>
    </AhaMomentModal>
  );
}

export function AhaDocumentFirstSystemCard({ variant = 'default', className = '' }) {
  const navigate = useNavigate();
  const {
    dismissPrompt,
    isMomentCompleted,
    isPromptDismissed,
    AHA_MOMENTS,
  } = useAhaMoments();

  const system = SUGGESTED_SYSTEMS[0];

  // Don't show if completed or dismissed
  if (isMomentCompleted(AHA_MOMENTS.CAN_TRACK) || isPromptDismissed(AHA_MOMENTS.CAN_TRACK)) {
    return null;
  }

  const handleDocument = () => {
    navigate(`${createPageUrl('Baseline')}?suggestedSystem=${system.id}&fromAha=true`);
  };

  const handleDismiss = () => {
    dismissPrompt(AHA_MOMENTS.CAN_TRACK);
  };

  return (
    <AhaMomentCard
      icon={Camera}
      iconBgColor="bg-orange-500"
      title="Document Your First System"
      description={`Start with your ${system.name} - it takes just 2 minutes and unlocks personalized insights.`}
      primaryLabel="Get Started"
      onPrimaryAction={handleDocument}
      onDismiss={handleDismiss}
      variant={variant}
      className={className}
    />
  );
}

/**
 * Hook to trigger the Aha #2 prompt at the right time
 */
export function useAhaDocumentFirstSystem() {
  const {
    triggerPrompt,
    isMomentCompleted,
    AHA_MOMENTS,
  } = useAhaMoments();

  // Fetch user's systems to check if they've documented any
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => Property.list(),
  });

  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Don't trigger if already completed or already triggered this session
    if (isMomentCompleted(AHA_MOMENTS.CAN_TRACK) || hasTriggered) {
      return;
    }

    // Only trigger if user has properties but hasn't documented systems yet
    // This would need to check system_baselines table in production
    if (properties && properties.length > 0) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        const triggered = triggerPrompt(AHA_MOMENTS.CAN_TRACK);
        if (triggered) {
          setHasTriggered(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [properties, isMomentCompleted, triggerPrompt, hasTriggered, AHA_MOMENTS]);

  return { hasTriggered };
}

export default AhaDocumentFirstSystemModal;
