import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Upload, X, CheckCircle2 } from "lucide-react";

export default function AddToCartDialog({ open, onClose, prefilledData = {} }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = React.useState({
    title: prefilledData.title || "",
    description: prefilledData.description || "",
    system_type: prefilledData.system_type || "",
    priority: prefilledData.priority || "Medium",
    customer_notes: prefilledData.customer_notes || "",
    preferred_timeline: prefilledData.preferred_timeline || "",
    photo_urls: prefilledData.photo_urls || []
  });

  const [photos, setPhotos] = React.useState(prefilledData.photo_urls || []);
  const [uploading, setUploading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setFormData({
        title: prefilledData.title || "",
        description: prefilledData.description || "",
        system_type: prefilledData.system_type || "",
        priority: prefilledData.priority || "Medium",
        customer_notes: prefilledData.customer_notes || "",
        preferred_timeline: prefilledData.preferred_timeline || "",
        photo_urls: prefilledData.photo_urls || []
      });
      setPhotos(prefilledData.photo_urls || []);
      setSuccess(false);
    }
  }, [open, prefilledData]);

  const addToCartMutation = useMutation({
    mutationFn: async (cartItem) => {
      return base44.entities.CartItem.create(cartItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...newUrls]);
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...newUrls]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cartItem = {
      property_id: prefilledData.property_id,
      source_type: prefilledData.source_type || 'custom',
      source_id: prefilledData.source_id || null,
      title: formData.title,
      description: formData.description,
      system_type: formData.system_type,
      priority: formData.priority,
      photo_urls: formData.photo_urls,
      estimated_hours: prefilledData.estimated_hours,
      estimated_cost_min: prefilledData.estimated_cost_min,
      estimated_cost_max: prefilledData.estimated_cost_max,
      customer_notes: formData.customer_notes,
      preferred_timeline: formData.preferred_timeline,
      status: 'in_cart'
    };

    addToCartMutation.mutate(cartItem);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/75" />
        <DialogContent className="max-w-md bg-white" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Added to Cart!</h3>
            <p className="text-gray-600">Item has been added to your service cart</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/75" />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
        <DialogHeader style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1B365D', backgroundColor: 'transparent' }}>
            <ShoppingCart className="w-6 h-6" />
            Add to Service Cart
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
          {/* Pre-filled Info Badge */}
          {prefilledData.source_type && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-blue-600 text-white">
                  {prefilledData.source_type === 'task' ? '📋 From Priority Queue' :
                   prefilledData.source_type === 'ai_suggestion' ? '🤖 AI Suggestion' :
                   prefilledData.source_type === 'upgrade' ? '⬆️ Upgrade Project' :
                   prefilledData.source_type === 'inspection_issue' ? '🔍 Inspection Issue' :
                   '✏️ Custom Request'}
                </Badge>
                {prefilledData.priority && (
                  <Badge className={
                    prefilledData.priority === 'Emergency' || prefilledData.priority === 'High' 
                      ? 'bg-red-600 text-white' 
                      : prefilledData.priority === 'Medium'
                      ? 'bg-orange-600 text-white'
                      : 'bg-blue-600 text-white'
                  }>
                    {prefilledData.priority} Priority
                  </Badge>
                )}
                {prefilledData.system_type && (
                  <Badge variant="outline">
                    {prefilledData.system_type}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label>Service Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., HVAC Tune-Up, Gutter Cleaning"
              required
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what needs to be done..."
              rows={4}
              required
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '96px' }}
            />
          </div>

          {/* System Type */}
          <div>
            <Label>System Type</Label>
            <Select
              value={formData.system_type}
              onValueChange={(value) => setFormData({ ...formData, system_type: value })}
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue placeholder="Select system type..." />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="HVAC System">HVAC System</SelectItem>
                <SelectItem value="Plumbing System">Plumbing System</SelectItem>
                <SelectItem value="Electrical System">Electrical System</SelectItem>
                <SelectItem value="Roof System">Roof System</SelectItem>
                <SelectItem value="Foundation & Structure">Foundation & Structure</SelectItem>
                <SelectItem value="Gutters & Downspouts">Gutters & Downspouts</SelectItem>
                <SelectItem value="Exterior Siding & Envelope">Exterior</SelectItem>
                <SelectItem value="Windows & Doors">Windows & Doors</SelectItem>
                <SelectItem value="Appliances">Appliances</SelectItem>
                <SelectItem value="Landscaping & Grading">Landscaping</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label>Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="Emergency">🚨 Emergency - Fix ASAP</SelectItem>
                <SelectItem value="High">⚠️ High - Within 1 week</SelectItem>
                <SelectItem value="Medium">📋 Medium - Within 2-4 weeks</SelectItem>
                <SelectItem value="Low">📝 Low - When convenient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Timeline */}
          <div>
            <Label>When do you want this done?</Label>
            <Select
              value={formData.preferred_timeline}
              onValueChange={(value) => setFormData({ ...formData, preferred_timeline: value })}
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue placeholder="Select timeline..." />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="ASAP - This is urgent">ASAP - This is urgent</SelectItem>
                <SelectItem value="Within 1 week">Within 1 week</SelectItem>
                <SelectItem value="Within 2-4 weeks">Within 2-4 weeks</SelectItem>
                <SelectItem value="Within 1-2 months">Within 1-2 months</SelectItem>
                <SelectItem value="Flexible - When you have availability">Flexible - When available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photos */}
          <div>
            <Label>Add Photos (Recommended)</Label>
            <div className="flex items-center gap-3 mb-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="gap-2"
                  style={{ minHeight: '48px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.currentTarget.previousElementSibling.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                </Button>
              </label>
              <p className="text-xs text-gray-600">
                More photos = more accurate estimate
              </p>
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={url} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm" 
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                      style={{ minHeight: '24px', minWidth: '24px' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <Label>Additional Notes for Operator</Label>
            <Textarea
              value={formData.customer_notes}
              onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
              placeholder="Access instructions, special requirements, preferred materials, etc."
              rows={3}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '72px' }}
            />
            <p className="text-xs text-gray-600 mt-1">
              💡 The more details you provide, the more accurate the estimate will be
            </p>
          </div>

          {/* Cost Estimate Preview (if available) */}
          {(prefilledData.estimated_cost_min || prefilledData.estimated_cost_max) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">💰 Estimated Cost Range</h4>
              <p className="text-2xl font-bold text-green-700">
                ${prefilledData.estimated_cost_min?.toLocaleString() || '?'} - ${prefilledData.estimated_cost_max?.toLocaleString() || '?'}
              </p>
              {prefilledData.estimated_hours && (
                <p className="text-sm text-gray-700 mt-1">
                  ⏱️ Estimated Time: {prefilledData.estimated_hours.toFixed(1)} hours
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                ⚠️ Preliminary estimate. Final pricing after operator review.
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#1B365D', color: '#1B365D', minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addToCartMutation.isPending || !formData.title || !formData.description}
              className="flex-1 gap-2"
              style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', minHeight: '48px' }}
            >
              <ShoppingCart className="w-4 h-4" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}