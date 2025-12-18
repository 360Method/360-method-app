import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { ContractorJob } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  CheckCircle,
  Camera,
  Clock,
  DollarSign,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Edit,
  Send,
  AlertCircle,
  FileText,
  Image,
  Calendar,
  Wrench,
  ChevronLeft,
  Star
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function ContractorJobComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const jobId = searchParams.get('id');
  const elapsedTime = parseInt(searchParams.get('time') || '0');

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch job data from database
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['contractor-job-complete', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_jobs')
        .select(`
          *,
          work_order:work_orders (
            id,
            title,
            description,
            estimated_cost,
            property:properties (
              street_address,
              city,
              state
            )
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (updates) => {
      return await ContractorJob.update(jobId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractor-job-complete', jobId]);
    }
  });

  // Transform job data
  const job = jobData ? {
    id: jobData.id,
    title: jobData.work_order?.title || 'Untitled Job',
    property_address: `${jobData.work_order?.property?.street_address || ''}, ${jobData.work_order?.property?.city || ''}`,
    owner_name: 'Property Owner',
    estimated_budget: jobData.work_order?.estimated_cost || 0
  } : {
    id: jobId,
    title: 'Loading...',
    property_address: '',
    owner_name: '',
    estimated_budget: 0
  };

  // Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Job completion data
  const [completionData, setCompletionData] = useState({
    summary: 'Replaced 6 gutter hanger brackets on the north side of the house. Reattached 3 sagging gutter sections and secured 2 loose downspout brackets. Sealed all joints with waterproof gutter sealant. Tested water flow with garden hose - gutters now draining properly with correct slope.',
    materials_used: [
      { name: 'Gutter Hanger Brackets', quantity: 6, cost: 24.00 },
      { name: 'Gutter Sealant', quantity: 1, cost: 8.00 },
      { name: 'Stainless Steel Screws 2"', quantity: 1, cost: 6.00 },
      { name: 'Downspout Brackets', quantity: 2, cost: 10.00 },
    ],
    photos: {
      before: [
        { id: 1, url: 'https://via.placeholder.com/200x150/e0e0e0/666?text=Before+1' },
        { id: 2, url: 'https://via.placeholder.com/200x150/e0e0e0/666?text=Before+2' },
      ],
      after: [
        { id: 1, url: 'https://via.placeholder.com/200x150/e0e0e0/666?text=After+1' },
        { id: 2, url: 'https://via.placeholder.com/200x150/e0e0e0/666?text=After+2' },
        { id: 3, url: 'https://via.placeholder.com/200x150/e0e0e0/666?text=After+3' },
      ]
    },
    recommendations: [
      { id: 1, task: 'Schedule gutter cleaning', frequency: 'Every 6 months', priority: 'recommended' },
      { id: 2, task: 'Consider gutter guards installation', frequency: 'One-time', priority: 'optional' },
      { id: 3, task: 'Check downspout extensions before rainy season', frequency: 'Annually', priority: 'recommended' },
    ],
    next_service_date: '',
    additional_notes: '',
    ai_summary_generated: true
  });

  const totalMaterialsCost = completionData.materials_used.reduce((sum, m) => sum + m.cost, 0);

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingSummary(false);
    toast.success('Summary improved with AI!');
  };

  const generateAIRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCompletionData({
      ...completionData,
      recommendations: [
        ...completionData.recommendations,
        { id: Date.now(), task: 'Inspect fascia board for water damage', frequency: 'Next visit', priority: 'recommended' }
      ]
    });
    setIsGeneratingRecommendations(false);
    toast.success('New recommendation added!');
  };

  const removeRecommendation = (id) => {
    setCompletionData({
      ...completionData,
      recommendations: completionData.recommendations.filter(r => r.id !== id)
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Update contractor job with completion data
      await updateJobMutation.mutateAsync({
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent_minutes: Math.floor(elapsedTime / 60),
        completion_summary: completionData.summary,
        materials_used: completionData.materials_used,
        recommendations: completionData.recommendations,
        notes: completionData.additional_notes
      });

      // Update work order status if exists
      if (jobData?.work_order_id) {
        await supabase
          .from('work_orders')
          .update({
            status: 'pending_review',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobData.work_order_id);
      }

      setShowSubmitDialog(false);
      toast.success('Job completed! Submitted for operator review.');
      navigate(createPageUrl('ContractorDashboard'));
    } catch (error) {
      console.error('Failed to submit job:', error);
      toast.error('Failed to submit job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = completionData.summary.trim() && completionData.photos.after.length > 0;

  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading job completion...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  return (
    <ContractorLayout>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="bg-green-600 text-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Complete Job</span>
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold mb-1">{job.title}</h1>
          <p className="text-white/80 text-sm">{job.property_address}</p>

          {/* Stats */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/80" />
              <div>
                <div className="text-lg font-bold">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-white/60">Time Spent</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/80" />
              <div>
                <div className="text-lg font-bold">${job.estimated_budget}</div>
                <div className="text-xs text-white/60">Job Value</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-white/80" />
              <div>
                <div className="text-lg font-bold">{completionData.photos.after.length}</div>
                <div className="text-xs text-white/60">After Photos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Completion Photos */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Completion Photos</h3>
              <Badge variant={completionData.photos.after.length >= 2 ? 'default' : 'destructive'}>
                {completionData.photos.after.length} photos
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {completionData.photos.after.map((photo, idx) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={`After ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">Add Photo</span>
              </button>
            </div>

            {completionData.photos.after.length < 2 && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                At least 2 completion photos are recommended
              </div>
            )}
          </Card>

          {/* Work Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Work Summary</h3>
              {completionData.ai_summary_generated && (
                <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </Badge>
              )}
            </div>

            <Textarea
              value={completionData.summary}
              onChange={(e) => setCompletionData({ ...completionData, summary: e.target.value })}
              rows={5}
              className="mb-3"
              placeholder="Describe the work you performed..."
            />

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={generateAISummary}
              disabled={isGeneratingSummary}
            >
              {isGeneratingSummary ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Improve with AI
            </Button>
          </Card>

          {/* Materials Used */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Materials Used</h3>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-bold text-gray-900">${totalMaterialsCost.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {completionData.materials_used.map((material, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{material.name}</div>
                    <div className="text-sm text-gray-500">Qty: {material.quantity}</div>
                  </div>
                  <div className="font-medium text-gray-900">${material.cost.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Material
            </Button>
          </Card>

          {/* Recommendations for Owner */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Recommendations</h3>
                <p className="text-xs text-gray-500">These will be shared with the homeowner</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {completionData.recommendations.map(rec => (
                <div key={rec.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{rec.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {rec.frequency}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${rec.priority === 'recommended' ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRecommendation(rec.id)}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={generateAIRecommendations}
              disabled={isGeneratingRecommendations}
            >
              {isGeneratingRecommendations ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              AI Suggest More
            </Button>
          </Card>

          {/* Next Service Date */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Suggested Next Service</h3>
            <Input
              type="date"
              value={completionData.next_service_date}
              onChange={(e) => setCompletionData({ ...completionData, next_service_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-2">
              This date will be added to the property's maintenance schedule
            </p>
          </Card>

          {/* Additional Notes */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
            <Textarea
              value={completionData.additional_notes}
              onChange={(e) => setCompletionData({ ...completionData, additional_notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes for the operator (won't be shared with owner)..."
            />
          </Card>
        </div>

        {/* Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:left-56 bg-white border-t border-gray-200 p-4 z-40">
          <Button
            onClick={() => setShowSubmitDialog(true)}
            size="lg"
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            disabled={!canSubmit}
          >
            <Send className="w-5 h-5" />
            Submit for Review
          </Button>
          {!canSubmit && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Add a summary and at least 1 completion photo to submit
            </p>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Job Completion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Job</span>
                <span className="font-medium">{job.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-medium">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Materials</span>
                <span className="font-medium">${totalMaterialsCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Photos</span>
                <span className="font-medium">{completionData.photos.after.length} completion photos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recommendations</span>
                <span className="font-medium">{completionData.recommendations.length} items</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2 text-blue-700">
                <FileText className="w-4 h-4 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">What happens next?</p>
                  <p className="text-blue-600">The operator will review your submission. Once approved, a summary will be shared with the homeowner and added to the property's service history.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Submit
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ContractorLayout>
  );
}
