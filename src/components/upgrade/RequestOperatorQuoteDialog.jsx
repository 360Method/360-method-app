import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';

export default function RequestOperatorQuoteDialog({ 
  project, 
  property,
  operatorName,
  serviceArea,
  isOpen, 
  onClose 
}) {
  const queryClient = useQueryClient();
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [success, setSuccess] = useState(false);

  const requestMutation = useMutation({
    mutationFn: async () => {
      // Update project with quote request
      await base44.entities.Upgrade.update(project.id, {
        operator_quote_requested: true,
        operator_quote_requested_at: new Date().toISOString(),
        operator_quote_details: additionalDetails
      });

      // TODO: Send email notification to operator
      console.log('✅ Operator quote requested for project:', project.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade', project.id] });
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAdditionalDetails('');
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Error requesting quote:', error);
      alert('Failed to request quote. Please try again.');
    }
  });

  const handleSubmit = () => {
    requestMutation.mutate();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quote Requested!
            </h3>
            <p className="text-gray-600">
              {operatorName} will contact you within 24 hours to schedule an assessment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request {operatorName} Quote</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Service Area Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-900">
                <strong>{operatorName}</strong> serves {serviceArea}
              </p>
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Project Summary</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Property:</strong> {property?.address || 'N/A'}</p>
              {property?.zip_code && (
                <p><strong>Zip Code:</strong> {property.zip_code}</p>
              )}
              <p><strong>Project:</strong> {project.title}</p>
              <p><strong>Category:</strong> {project.category}</p>
              <p><strong>Estimated Investment:</strong> ${project.investment_required?.toLocaleString() || '0'}</p>
              {project.milestones && project.milestones.length > 0 && (
                <p><strong>Milestones:</strong> {project.milestones.length} steps</p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <Textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any specific requirements, timeline constraints, material preferences, or questions for the operator..."
              rows={4}
              className="resize-none"
              style={{ minHeight: '120px' }}
            />
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              📋 What Happens Next:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>{operatorName} will review your project details</li>
              <li>You'll be contacted within 24 hours</li>
              <li>Schedule on-site assessment (if needed)</li>
              <li>Receive detailed quote with member discount</li>
              <li>Review and approve to schedule work</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={requestMutation.isPending}
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={requestMutation.isPending}
              style={{ minHeight: '48px', backgroundColor: 'var(--primary)' }}
            >
              {requestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                `Request Quote`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}