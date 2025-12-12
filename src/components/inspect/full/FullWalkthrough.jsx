import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Inspection, MaintenanceTask, SystemBaseline } from '@/api/supabaseClient';
import { ArrowLeft, Volume2, VolumeX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GuidedAreaStep from './GuidedAreaStep';
import WalkthroughComplete from './WalkthroughComplete';
import { AudioToggle, useAudioPreference } from './AudioGuidance';
import { getOrderedAreasForWalkthrough, INSPECTION_ZONES } from '../shared/inspectionAreas';
import { AUDIO_GUIDANCE } from '../shared/audioGuidanceText';
import { useGamification } from '@/lib/GamificationContext';
import { useAuth } from '@/lib/AuthContext';
import { notifyInspectionCompleted } from '@/api/triggerNotification';
import { format } from 'date-fns';

/**
 * FullWalkthrough - Comprehensive guided property inspection
 *
 * Flow: Ready Screen → Guided Area Steps (1 at a time) → Complete → Report
 * Features voice guidance, photo examples, generates formal report
 */
export default function FullWalkthrough({ property, onComplete, onCancel, onViewReport }) {
  // Flow state: 'ready' | 'walkthrough' | 'complete'
  const [step, setStep] = useState('ready');
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [results, setResults] = useState({}); // { areaId: { checkpoints: [], issues: [] } }
  const [completedAreas, setCompletedAreas] = useState([]);
  const [inspectionId, setInspectionId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // Audio preference
  const { audioEnabled, toggleAudio } = useAudioPreference();

  // Get ordered areas
  const orderedAreas = getOrderedAreasForWalkthrough();

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { awardXP, checkAchievement, hasAchievement } = useGamification();

  // Mutations
  const createInspectionMutation = useMutation({
    mutationFn: (data) => Inspection.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspections'] }),
  });

  const updateInspectionMutation = useMutation({
    mutationFn: ({ id, data }) => Inspection.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspections'] }),
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => MaintenanceTask.create(taskData),
  });

  const updateSystemMutation = useMutation({
    mutationFn: ({ systemId, updates }) => SystemBaseline.update(systemId, updates),
  });

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const season = getCurrentSeason();
      const year = new Date().getFullYear();

      const inspection = await createInspectionMutation.mutateAsync({
        property_id: property.id,
        inspection_type: 'Full',
        status: 'In Progress',
        route_mode: 'physical',
        notes: `${season} ${year}`,
        checklist_items: []
      });

      setInspectionId(inspection.id);
      setStep('walkthrough');

      // Award XP
      awardXP('start_inspection', {
        entityType: 'inspection',
        entityId: inspection.id,
        type: 'full',
        season
      }).catch(console.error);

    } catch (error) {
      console.error('Failed to start inspection:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleAreaComplete = async (areaId, areaResults) => {
    // Store results
    const updatedResults = { ...results, [areaId]: areaResults };
    setResults(updatedResults);

    // Track completed areas
    const newCompletedAreas = [...completedAreas, areaId];
    setCompletedAreas(newCompletedAreas);

    // Save to database
    const allCheckpoints = Object.values(updatedResults).flatMap(r => r.checkpoints || []);
    const allIssues = Object.values(updatedResults).flatMap(r => r.issues || []);

    await updateInspectionMutation.mutateAsync({
      id: inspectionId,
      data: {
        checklist_items: allCheckpoints,
        issues_found: allIssues.length,
        completion_percentage: Math.round((newCompletedAreas.length / orderedAreas.length) * 100)
      }
    });

    // Award XP for completing area
    const area = orderedAreas.find(a => a.id === areaId);
    awardXP('complete_room', {
      entityType: 'inspection_area',
      entityId: `${inspectionId}-${areaId}`,
      areaName: area?.name
    }).catch(console.error);

    // Award XP for finding issues
    const issuesInArea = areaResults.issues?.length || 0;
    for (let i = 0; i < issuesInArea; i++) {
      awardXP('find_issue', {
        entityType: 'inspection_issue',
        inspectionId
      }).catch(console.error);
    }

    // Move to next area or complete
    if (currentAreaIndex < orderedAreas.length - 1) {
      setCurrentAreaIndex(currentAreaIndex + 1);
    } else {
      await finishInspection(updatedResults);
    }
  };

  const handleSkipArea = () => {
    if (currentAreaIndex < orderedAreas.length - 1) {
      setCurrentAreaIndex(currentAreaIndex + 1);
    } else {
      finishInspection(results);
    }
  };

  const finishInspection = async (finalResults) => {
    const allCheckpoints = Object.values(finalResults).flatMap(r => r.checkpoints || []);
    const allIssues = Object.values(finalResults).flatMap(r => r.issues || []);

    // Create tasks for issues that aren't quick fixes
    for (const issue of allIssues) {
      const area = orderedAreas.find(a => a.id === issue.area_id);

      await createTaskMutation.mutateAsync({
        property_id: property.id,
        title: issue.item_name || issue.description?.substring(0, 50) || 'Issue from inspection',
        description: `Found during full walkthrough inspection in ${area?.name || 'unknown area'}.\n\n${issue.description || issue.note || ''}`,
        system_type: area?.systemTypes?.[0] || 'General',
        priority: issue.severity === 'Urgent' ? 'High' : issue.severity === 'Flag' ? 'Medium' : 'Low',
        status: 'Identified',
        photo_urls: issue.photo_urls || issue.photos || [],
        has_cascade_alert: issue.severity === 'Urgent'
      });
    }

    // Mark inspection complete
    await updateInspectionMutation.mutateAsync({
      id: inspectionId,
      data: {
        status: 'Completed',
        completion_percentage: 100,
        issues_found: allIssues.length,
        checklist_items: allCheckpoints,
        inspection_date: format(new Date(), 'yyyy-MM-dd')
      }
    });

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });

    // Send notification
    if (user?.id) {
      notifyInspectionCompleted({
        inspectionId,
        propertyId: property.id,
        userId: user.id,
        issueCount: allIssues.length,
        healthScore: null
      });
    }

    // Award completion XP
    try {
      await awardXP('complete_inspection', {
        entityType: 'inspection',
        entityId: inspectionId,
        issuesFound: allIssues.length,
        type: 'full'
      });

      if (!hasAchievement('first_inspection')) {
        await checkAchievement('first_inspection');
      }

      if (allIssues.length >= 10 && !hasAchievement('eagle_eye')) {
        await checkAchievement('eagle_eye');
      }
    } catch (err) {
      console.error('Error awarding XP:', err);
    }

    setStep('complete');
  };

  const handleBack = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(currentAreaIndex - 1);
    } else {
      // Confirm exit - would lose progress
      if (confirm('Are you sure? Your progress will be saved.')) {
        onCancel();
      }
    }
  };

  // Calculate totals
  const getTotals = () => {
    const issuesFound = Object.values(results).reduce(
      (sum, r) => sum + (r.issues?.length || 0), 0
    );
    const areasChecked = completedAreas.length;
    const urgentCount = Object.values(results).reduce(
      (sum, r) => sum + (r.issues?.filter(i => i.severity === 'Urgent').length || 0), 0
    );
    const flagCount = Object.values(results).reduce(
      (sum, r) => sum + (r.issues?.filter(i => i.severity === 'Flag').length || 0), 0
    );
    return { issuesFound, areasChecked, urgentCount, flagCount };
  };

  // Ready screen
  if (step === 'ready') {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white pt-12 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="mb-6 -ml-2 text-white hover:bg-white/10"
              style={{ minHeight: '44px' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Home className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Full Property Walkthrough
              </h1>
              <p className="text-blue-100">
                Comprehensive inspection of all {orderedAreas.length} areas
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">
          {/* Info card */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{orderedAreas.length}</p>
                  <p className="text-sm text-gray-500">Areas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{INSPECTION_ZONES.length}</p>
                  <p className="text-sm text-gray-500">Zones</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">30-45</p>
                  <p className="text-sm text-gray-500">Minutes</p>
                </div>
              </div>

              {/* Audio toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Voice Guidance</p>
                  <p className="text-sm text-gray-500">
                    {audioEnabled ? 'Instructions will be spoken aloud' : 'Instructions shown as text only'}
                  </p>
                </div>
                <AudioToggle enabled={audioEnabled} onToggle={toggleAudio} />
              </div>
            </CardContent>
          </Card>

          {/* What to expect */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">What to Expect</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>One question at a time, simple yes/no answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Photo examples show what to look for</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Voice guidance walks you through each step</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Progress saved automatically - pause anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Full report generated when complete</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Zone overview */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Inspection Route</h3>
              <div className="space-y-2">
                {INSPECTION_ZONES.map((zone, idx) => (
                  <div key={zone.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {zone.emoji} {zone.name}
                      </p>
                      <p className="text-xs text-gray-500">{zone.estimatedTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start button */}
          <Button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full gap-2"
            style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
          >
            {isStarting ? 'Starting...' : 'Begin Walkthrough'}
          </Button>
        </div>
      </div>
    );
  }

  // Walkthrough step
  if (step === 'walkthrough') {
    const currentArea = orderedAreas[currentAreaIndex];

    return (
      <GuidedAreaStep
        area={currentArea}
        areaIndex={currentAreaIndex}
        totalAreas={orderedAreas.length}
        completedAreas={completedAreas}
        existingResults={results[currentArea.id]}
        audioEnabled={audioEnabled}
        onComplete={(areaResults) => handleAreaComplete(currentArea.id, areaResults)}
        onBack={handleBack}
        onSkipArea={handleSkipArea}
      />
    );
  }

  // Complete step
  if (step === 'complete') {
    const totals = getTotals();

    return (
      <WalkthroughComplete
        areasChecked={totals.areasChecked}
        totalAreas={orderedAreas.length}
        issuesFound={totals.issuesFound}
        urgentCount={totals.urgentCount}
        flagCount={totals.flagCount}
        results={results}
        inspectionId={inspectionId}
        onViewReport={() => onViewReport?.(inspectionId)}
        onDone={onComplete}
      />
    );
  }

  return null;
}
