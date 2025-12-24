import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Inspection, MaintenanceTask } from '@/api/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AreaSelectionGrid from './AreaSelectionGrid';
import QuickAreaCheck from './QuickAreaCheck';
import QuickCheckComplete from './QuickCheckComplete';
import { INSPECTION_AREAS, calculateTotalTime } from '../shared/inspectionAreas';
import { useGamification } from '@/lib/GamificationContext';

/**
 * QuickSpotCheck - Fast targeted inspection of selected areas
 *
 * Flow: Area Selection → Quick Checks → Done
 * No formal report generated - just logs findings and creates tasks
 */
export default function QuickSpotCheck({ property, onComplete, onCancel }) {
  // Flow state: 'select' | 'check' | 'complete'
  const [step, setStep] = useState('select');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [results, setResults] = useState({}); // { areaId: { checkpoints: [], issues: [] } }
  const [inspectionId, setInspectionId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();
  const { awardXP } = useGamification();

  // Create inspection record
  const createInspectionMutation = useMutation({
    mutationFn: async (data) => {
      return Inspection.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  // Update inspection
  const updateInspectionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return Inspection.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  // Create task from issue
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return MaintenanceTask.create(taskData);
    },
  });

  const handleStartCheck = async () => {
    if (selectedAreas.length === 0) return;

    setIsCreating(true);
    try {
      // Create inspection record
      const inspection = await createInspectionMutation.mutateAsync({
        property_id: property.id,
        inspection_type: 'Area-Based',
        status: 'In Progress',
        route_mode: 'area_based',
        notes: `Quick Spot Check - ${selectedAreas.length} areas`,
        checklist_items: []
      });

      setInspectionId(inspection.id);
      setStep('check');

      // Award XP for starting
      awardXP('start_inspection', {
        entityType: 'inspection',
        entityId: inspection.id,
        type: 'quick'
      }).catch(console.error);

    } catch (error) {
      console.error('Failed to create inspection:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAreaComplete = async (areaId, areaResults) => {
    // Store results
    const updatedResults = {
      ...results,
      [areaId]: areaResults
    };
    setResults(updatedResults);

    // Save to database
    const allCheckpoints = Object.values(updatedResults).flatMap(r => r.checkpoints || []);
    try {
      await updateInspectionMutation.mutateAsync({
        id: inspectionId,
        data: {
          checklist_items: allCheckpoints,
          completion_percent: Math.round(((currentAreaIndex + 1) / selectedAreas.length) * 100)
        }
      });
    } catch (err) {
      console.error('Failed to update inspection:', err);
      throw err;
    }

    // Award XP for completing area
    const area = INSPECTION_AREAS.find(a => a.id === areaId);
    awardXP('complete_room', {
      entityType: 'inspection_area',
      entityId: inspectionId,
      areaId: areaId,
      areaName: area?.name
    }).catch(console.error);

    // Move to next area or complete
    if (currentAreaIndex < selectedAreas.length - 1) {
      setCurrentAreaIndex(currentAreaIndex + 1);
    } else {
      await finishInspection(updatedResults);
    }
  };

  const finishInspection = async (finalResults) => {
    try {
      // Collect all issues
      const allIssues = Object.entries(finalResults).flatMap(([areaId, data]) =>
        (data.issues || []).map(issue => ({
          ...issue,
          area_id: areaId,
          areaName: INSPECTION_AREAS.find(a => a.id === areaId)?.name
        }))
      );

      console.log('finishInspection: Issues to create tickets for:', allIssues.length, allIssues);

      // Create tickets for issues
      for (const issue of allIssues) {
        try {
          const photoNote = issue.photos?.length ? `\n\nPhotos attached: ${issue.photos.length}` : '';
          const ticketData = {
            property_id: property.id,
            title: issue.checkpointQuestion || 'Issue found during spot check',
            description: `Quick spot check issue in ${issue.areaName}.\n\n${issue.note || ''}${photoNote}`,
            system_type: 'General',
            priority: issue.severity === 'Urgent' ? 'High' : issue.severity === 'Flag' ? 'Medium' : 'Low',
            status: 'Identified',
            source: 'INSPECTION'
          };
          console.log('Creating ticket:', ticketData);
          await createTaskMutation.mutateAsync(ticketData);
          console.log('Ticket created successfully');
        } catch (err) {
          console.error('Failed to create ticket for issue:', issue, err);
        }
      }

      // Mark inspection complete
      const now = new Date();
      const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
      const currentSeason = seasons[Math.floor(now.getMonth() / 3)];

      await updateInspectionMutation.mutateAsync({
        id: inspectionId,
        data: {
          status: 'Completed',
          completion_percent: 100,
          issues_count: allIssues.length,
          inspection_date: now.toISOString(),
          completion_date: now.toISOString(),
          season: currentSeason,
          year: now.getFullYear()
        }
      });

      // Award completion XP
      awardXP('complete_inspection', {
        entityType: 'inspection',
        entityId: inspectionId,
        issuesFound: allIssues.length,
        type: 'quick'
      }).catch(console.error);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });

      setStep('complete');
    } catch (err) {
      console.error('finishInspection failed:', err);
      throw err;
    }
  };

  const handleBack = () => {
    if (step === 'check' && currentAreaIndex > 0) {
      setCurrentAreaIndex(currentAreaIndex - 1);
    } else if (step === 'check') {
      setStep('select');
    } else {
      onCancel();
    }
  };

  // Calculate totals for completion screen
  const getTotals = () => {
    const issuesFound = Object.values(results).reduce(
      (sum, r) => sum + (r.issues?.length || 0), 0
    );
    const areasChecked = selectedAreas.length;
    return { issuesFound, areasChecked };
  };

  // Render based on current step
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-2xl mx-auto p-4">
          {/* Header */}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mb-4 -ml-2"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quick Spot Check
            </h1>
            <p className="text-gray-600">
              Select the areas you want to quickly inspect (1-5 areas)
            </p>
          </div>

          {/* Area Selection Grid */}
          <AreaSelectionGrid
            selectedAreas={selectedAreas}
            onSelectionChange={setSelectedAreas}
            maxSelections={5}
          />

          {/* Summary and Start Button */}
          {selectedAreas.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    {selectedAreas.length} area{selectedAreas.length > 1 ? 's' : ''} selected
                  </span>
                  <span className="text-sm text-gray-600">
                    ~{calculateTotalTime(selectedAreas, 'quick')} min
                  </span>
                </div>
                <Button
                  onClick={handleStartCheck}
                  disabled={isCreating}
                  className="w-full"
                  style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                >
                  {isCreating ? 'Starting...' : 'Start Quick Check'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'check') {
    const currentArea = INSPECTION_AREAS.find(a => a.id === selectedAreas[currentAreaIndex]);

    return (
      <QuickAreaCheck
        area={currentArea}
        areaIndex={currentAreaIndex}
        totalAreas={selectedAreas.length}
        existingResults={results[currentArea.id]}
        onComplete={(areaResults) => handleAreaComplete(currentArea.id, areaResults)}
        onBack={handleBack}
      />
    );
  }

  if (step === 'complete') {
    const totals = getTotals();

    return (
      <QuickCheckComplete
        areasChecked={totals.areasChecked}
        issuesFound={totals.issuesFound}
        results={results}
        onDone={onComplete}
        onCheckAnother={() => {
          setStep('select');
          setSelectedAreas([]);
          setCurrentAreaIndex(0);
          setResults({});
          setInspectionId(null);
        }}
      />
    );
  }

  return null;
}
