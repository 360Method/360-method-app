import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InspectionDialog({ open, onClose, inspection, propertyId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState({
    checklist_items: []
  });
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (inspection) {
      setFormData({
        season: inspection.season,
        year: inspection.year,
        checklist_items: inspection.checklist_items || []
      });
    }
  }, [inspection]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const completedCount = data.checklist_items.filter(item => item.completed).length;
      const completionPercentage = Math.round((completedCount / data.checklist_items.length) * 100);
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
        return base44.entities.Inspection.update(inspection.id, inspectionData);
      } else {
        return base44.entities.Inspection.create(inspectionData);
      }
    },
    onSuccess: async (savedInspection) => {
      // Create maintenance tasks for issues found
      const issueItems = formData.checklist_items.filter(item => 
        item.condition_rating === 'Poor' || item.condition_rating === 'Urgent'
      );

      for (const item of issueItems) {
        await base44.entities.MaintenanceTask.create({
          property_id: propertyId,
          title: item.item_name,
          description: item.notes || `Issue found during ${inspection.season} inspection`,
          priority: item.condition_rating === 'Urgent' ? 'High' : 'Medium',
          status: 'Identified',
          cascade_risk_score: item.condition_rating === 'Urgent' ? 8 : 5,
          photo_urls: item.photo_urls
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
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
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
          {formData.checklist_items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => handleCheckItem(index, checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                    {item.item_name}
                  </h4>
                  
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
                        This issue will be added to your priority queue
                      </p>
                    </div>
                  )}

                  <Textarea
                    value={item.notes}
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
          ))}
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