
import React from "react";
import { Inspection, MaintenanceTask, storage } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, AlertTriangle, Lightbulb, Info, Clock, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Inline enrichment function
function enrichTaskWithBaselineData(task, system) {
  if (!system) return task;

  const currentYear = new Date().getFullYear();
  const systemAge = system.installation_year ? currentYear - system.installation_year : null;
  const isOld = systemAge && systemAge >= 10;

  return {
    ...task,
    enrichedData: {
      brand: system.brand_model,
      installed: system.installation_year,
      age: systemAge,
      lastService: system.last_service_date,
      filterSize: system.key_components?.filter_size,
      isOld,
      ageWarning: isOld ? `Your ${system.system_type} is ${systemAge} years old. Proper maintenance is increasingly critical.` : null
    }
  };
}

export default function InspectionDialog({ open, onClose, inspection, propertyId, baselineSystems }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState({
    checklist_items: []
  });
  const [uploading, setUploading] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState({});

  React.useEffect(() => {
    if (inspection) {
      // Enrich checklist items with baseline data
      const enrichedItems = (inspection.checklist_items || []).map(item => {
        const system = baselineSystems?.find(s => s.id === item.systemId);
        if (system) {
          const enriched = enrichTaskWithBaselineData(item, system);
          return { ...item, ...enriched };
        }
        return item;
      });

      setFormData({
        season: inspection.season,
        year: inspection.year,
        checklist_items: enrichedItems
      });
    }
  }, [inspection, baselineSystems]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const completedCount = data.checklist_items.filter(item => item.completed).length;
      const completionPercentage = data.checklist_items.length > 0 
        ? Math.round((completedCount / data.checklist_items.length) * 100)
        : 0;
      const issuesFound = data.checklist_items.filter(item => 
        item.condition_rating === 'Poor' || item.condition_rating === 'Urgent'
      ).length;
      
      const status = completionPercentage === 100 ? 'Completed' : 
                     completionPercentage > 0 ? 'In Progress' : 'Not Started';

      const inspectionData = {
        ...data,
        property_id: propertyId,
        completion_percentage: completionPercentage,
        issues_found: issuesFound,
        status,
        inspection_date: status === 'Completed' ? new Date().toISOString().split('T')[0] : null
      };

      if (inspection?.id) {
        return Inspection.update(inspection.id, inspectionData);
      } else {
        return Inspection.create(inspectionData);
      }
    },
    onSuccess: async (savedInspection) => {
      // Create maintenance tasks for issues found
      const issueItems = formData.checklist_items.filter(item => 
        item.condition_rating === 'Poor' || item.condition_rating === 'Urgent'
      );

      for (const item of issueItems) {
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

        const systemType = item.systemType || "General";
        const costs = costEstimates[systemType] || { current: 200, delayed: 2000 };
        const riskScore = cascadeRiskScores[systemType] || 5;

        await MaintenanceTask.create({
          property_id: propertyId,
          title: `${item.item_name}${item.enrichedData?.brand ? ` (${item.enrichedData.brand})` : ''}`,
          description: item.notes || `Issue found during ${inspection.season} inspection. Condition: ${item.condition_rating}`,
          system_type: systemType,
          priority: item.condition_rating === 'Urgent' ? 'High' : 'Medium',
          status: 'Identified',
          cascade_risk_score: riskScore,
          current_fix_cost: costs.current,
          delayed_fix_cost: costs.delayed,
          urgency_timeline: item.condition_rating === 'Urgent' ? 'Immediate' : '30 days',
          has_cascade_alert: riskScore >= 7,
          photo_urls: item.photo_urls || []
        });
      }

      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      onClose();
    },
  });

  const handleCheckItem = (index, checked) => {
    const newItems = [...formData.checklist_items];
    newItems[index].completed = checked;
    setFormData({ ...formData, checklist_items: newItems });
  };

  const handleConditionChange = (index, condition) => {
    const newItems = [...formData.checklist_items];
    newItems[index].condition_rating = condition;
    setFormData({ ...formData, checklist_items: newItems });
  };

  const handleNotesChange = (index, notes) => {
    const newItems = [...formData.checklist_items];
    newItems[index].notes = notes;
    setFormData({ ...formData, checklist_items: newItems });
  };

  const handleFileUpload = async (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => storage.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      const newItems = [...formData.checklist_items];
      newItems[index].photo_urls = [...(newItems[index].photo_urls || []), ...urls];
      setFormData({ ...formData, checklist_items: newItems });
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  const removePhoto = (itemIndex, photoIndex) => {
    const newItems = [...formData.checklist_items];
    newItems[itemIndex].photo_urls = newItems[itemIndex].photo_urls.filter((_, i) => i !== photoIndex);
    setFormData({ ...formData, checklist_items: newItems });
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const conditionColors = {
    Good: "text-green-600",
    Fair: "text-yellow-600",
    Poor: "text-orange-600",
    Urgent: "text-red-600"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inspection?.season} {inspection?.year} Inspection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {formData.checklist_items.map((item, index) => {
            const isExpanded = expandedItems[index];
            const enrichedData = item.enrichedData || {};
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => handleCheckItem(index, checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.item_name}
                        </h4>
                        {enrichedData.brand && (
                          <p className="text-sm text-gray-600">{enrichedData.brand}</p>
                        )}
                        {enrichedData.age && (
                          <p className="text-xs text-gray-500">
                            Installed {enrichedData.installed} ({enrichedData.age} years old)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.duration && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.duration} min
                          </Badge>
                        )}
                        {item.points && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {item.points} PP
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(index)}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Show baseline-specific details */}
                    {enrichedData.filterSize && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong>Filter Size:</strong> {enrichedData.filterSize}
                        {enrichedData.lastService && (
                          <span className="ml-3">
                            <strong>Last Changed:</strong> {new Date(enrichedData.lastService).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {enrichedData.isOld && enrichedData.ageWarning && (
                      <div className="mt-2 p-3 bg-orange-50 border-2 border-orange-300 rounded">
                        <p className="text-sm text-orange-900 font-medium flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {enrichedData.ageWarning}
                        </p>
                      </div>
                    )}

                    {/* Expanded view with educational content */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {item.why && (
                          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-yellow-900 mb-1">⚠️ Why This Matters:</h5>
                                <p className="text-sm text-gray-800 leading-relaxed">{item.why}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {item.howTo && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-blue-900 mb-1">📝 What To Do:</h5>
                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{item.howTo}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Condition</label>
                        <Select 
                          value={item.condition_rating} 
                          onValueChange={(value) => handleConditionChange(index, value)}
                        >
                          <SelectTrigger className={conditionColors[item.condition_rating]}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(item.condition_rating === 'Poor' || item.condition_rating === 'Urgent') && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-orange-800">
                          This issue will be added to your ACT → Priority Queue for immediate attention
                        </p>
                      </div>
                    )}

                    <Textarea
                      value={item.notes || ''}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      placeholder="Add notes or observations..."
                      className="mt-3"
                      rows={2}
                    />

                    <div className="mt-3">
                      <label className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors text-sm">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(index, e)}
                          className="hidden"
                          disabled={uploading}
                        />
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Add Photos'}
                      </label>
                    </div>

                    {item.photo_urls && item.photo_urls.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {item.photo_urls.map((url, photoIndex) => (
                          <div key={photoIndex} className="relative group">
                            <img src={url} alt="" className="w-16 h-16 object-cover rounded border" />
                            <button
                              type="button"
                              onClick={() => removePhoto(index, photoIndex)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending} style={{ backgroundColor: 'var(--primary)' }}>
            {saveMutation.isPending ? 'Saving...' : 'Save Inspection'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
