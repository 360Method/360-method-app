import React from "react";
import { Inspection, MaintenanceTask, SystemBaseline, storage } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Clock, Trophy, Lightbulb, Info } from "lucide-react";

export default function InspectionTaskDetailView({ task, inspection, propertyId, baselineSystems, onBack, onComplete }) {
  const queryClient = useQueryClient();
  const [selectedCondition, setSelectedCondition] = React.useState(task.condition_rating || 'Good');
  const [notes, setNotes] = React.useState(task.notes || '');
  const [photos, setPhotos] = React.useState(task.photo_urls || []);
  const [uploading, setUploading] = React.useState(false);

  const system = baselineSystems.find(s => s.id === task.systemId);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updatedTasks = inspection.checklist_items.map(item => 
        item.item_name === task.item_name
          ? { ...item, completed: true, condition_rating: selectedCondition, notes, photo_urls: photos }
          : item
      );

      const completedCount = updatedTasks.filter(item => item.completed).length;
      const completionPercentage = Math.round((completedCount / updatedTasks.length) * 100);
      const issuesFound = updatedTasks.filter(item => 
        item.condition_rating === 'Poor' || item.condition_rating === 'Urgent'
      ).length;

      await Inspection.update(inspection.id, {
        checklist_items: updatedTasks,
        completion_percentage: completionPercentage,
        issues_found: issuesFound,
        status: completionPercentage === 100 ? 'Completed' : 'In Progress'
      });

      // If issue detected, create maintenance task
      if (selectedCondition === 'Poor' || selectedCondition === 'Urgent') {
        const cascadeRiskScores = {
          "Plumbing System": 9,
          "Roof System": 8,
          "HVAC System": 7,
          "Gutters & Downspouts": 8,
          "Electrical System": 9
        };

        const costEstimates = {
          "Plumbing System": { current: 300, delayed: 8000 },
          "Roof System": { current: 500, delayed: 20000 },
          "HVAC System": { current: 400, delayed: 8000 },
          "Gutters & Downspouts": { current: 150, delayed: 15000 },
          "Electrical System": { current: 500, delayed: 5000 }
        };

        const systemType = task.systemType || "General";
        const costs = costEstimates[systemType] || { current: 200, delayed: 2000 };
        const riskScore = cascadeRiskScores[systemType] || 5;

        await MaintenanceTask.create({
          property_id: propertyId,
          title: `${task.item_name}${system?.brand_model ? ` (${system.brand_model})` : ''}`,
          description: notes || `Issue found during ${inspection.season} inspection. Condition: ${selectedCondition}`,
          system_type: systemType,
          priority: selectedCondition === 'Urgent' ? 'High' : 'Medium',
          status: 'Identified',
          cascade_risk_score: riskScore,
          current_fix_cost: costs.current,
          delayed_fix_cost: costs.delayed,
          urgency_timeline: selectedCondition === 'Urgent' ? 'Immediate' : '30 days',
          has_cascade_alert: riskScore >= 7,
          photo_urls: photos
        });
      }

      return { ...task, completed: true, condition_rating: selectedCondition, notes, photo_urls: photos };
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      onComplete(updatedTask);
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => storage.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Urgent'];
  const conditionColors = {
    'Excellent': '#28A745',
    'Good': '#28A745',
    'Fair': '#FFC107',
    'Poor': '#FF6B35',
    'Urgent': '#DC3545'
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Checklist
        </Button>

        <div className="space-y-6">
          {/* Task Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
              {task.item_name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.duration} min
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {task.points} PP
              </Badge>
              {task.priority && (
                <Badge style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                  ⚠️ {task.priority}
                </Badge>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* System Info */}
          {system && (
            <Card className="border-2" style={{ borderColor: '#1B365D', backgroundColor: '#F8F9FA' }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#1B365D' }}>YOUR SYSTEM INFO:</h2>
                <ul className="space-y-2 text-gray-700">
                  {system.brand_model && <li><strong>•</strong> Brand/Model: {system.brand_model}</li>}
                  {system.installation_year && <li><strong>•</strong> Installed: {system.installation_year}</li>}
                  {system.key_components?.filter_size && <li><strong>•</strong> Filter size: {system.key_components.filter_size}</li>}
                  {system.last_service_date && (
                    <li><strong>•</strong> Last serviced: {new Date(system.last_service_date).toLocaleDateString()}</li>
                  )}
                  {system.condition && <li><strong>•</strong> Current condition: {system.condition}</li>}
                </ul>
              </CardContent>
            </Card>
          )}

          <hr className="border-gray-200" />

          {/* Why This Matters */}
          <Card className="border-2" style={{ borderColor: '#FFC107', backgroundColor: '#FFFBF0' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 flex-shrink-0" style={{ color: '#FFC107' }} />
                <div>
                  <h2 className="text-xl font-bold mb-3" style={{ color: '#1B365D' }}>⚠️ WHY THIS MATTERS:</h2>
                  <p className="text-gray-800 leading-relaxed">{task.why}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <hr className="border-gray-200" />

          {/* How To Do It */}
          <Card className="border-2" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 flex-shrink-0" style={{ color: '#28A745' }} />
                <div>
                  <h2 className="text-xl font-bold mb-3" style={{ color: '#1B365D' }}>📋 HOW TO DO IT:</h2>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">{task.howTo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <hr className="border-gray-200" />

          {/* Completion Form */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#1B365D' }}>COMPLETION:</h2>

              {/* Condition Rating */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">Condition Rating:</label>
                <div className="flex flex-wrap gap-3">
                  {conditions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => setSelectedCondition(condition)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        selectedCondition === condition
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={selectedCondition === condition ? { backgroundColor: conditionColors[condition] } : {}}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Completed */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Date Completed:</label>
                <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">📷 Add Photos ({photos.length} photos)</label>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Upload className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-600">{uploading ? 'Uploading...' : 'Click to upload photos'}</span>
                </label>
                {photos.length > 0 && (
                  <div className="flex gap-3 flex-wrap mt-4">
                    {photos.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">Notes (optional):</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any observations, issues found, or additional details..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <hr className="border-gray-200" />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full h-14 text-lg font-bold"
              style={{ backgroundColor: '#28A745' }}
            >
              {saveMutation.isPending ? 'Saving...' : `✓ Mark Complete - Earn ${task.points} PP`}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={onBack}
            >
              Need Professional Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}