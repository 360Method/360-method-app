import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Clock,
  DollarSign,
  Camera,
  CheckCircle,
  X,
  MessageCircle,
  ExternalLink,
  Upload,
  Play
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function ContractorJobDetail() {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [completionData, setCompletionData] = useState({
    notes: '',
    photos: [],
    actual_time: ''
  });

  // Mock job data
  const job = {
    id: '1',
    title: 'Gutter Repair',
    property_address: '123 Oak Street, Portland, OR 97201',
    operator_name: 'Handy Pioneers',
    operator_contact: 'marcin@handypioneers.com',
    priority: 'High',
    status: 'new',
    due_date: '2025-11-30',
    estimated_budget: 350,
    estimated_duration: '2-3 hours',
    description: 'Repair sagging gutters on north side of house. Multiple sections need reattachment. Some downspout brackets also loose.',
    operator_notes: 'Owner will be home after 2pm. Park in driveway. Ladder available in garage if needed.',
    access_instructions: 'Key in lockbox (code 1234)',
    inspection_photos: [
      'https://via.placeholder.com/400x300/e0e0e0/666?text=Gutter+Photo+1',
      'https://via.placeholder.com/400x300/e0e0e0/666?text=Gutter+Photo+2'
    ]
  };

  const handleAccept = () => {
    toast.success('Job accepted! You can now start work.');
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    toast.info('Job declined. Operator has been notified.');
    setShowDeclineDialog(false);
  };

  const handleStart = () => {
    toast.success('Job started! Timer is running.');
  };

  const handleComplete = () => {
    if (!completionData.notes.trim() || completionData.photos.length === 0) {
      toast.error('Please add completion notes and at least one photo');
      return;
    }
    toast.success('Job marked complete! Operator has been notified.');
    setShowCompleteDialog(false);
  };

  const openNavigation = () => {
    const address = encodeURIComponent(job.property_address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
        <div className="flex items-center gap-2">
          <Badge className={`${
            job.priority === 'High' ? 'bg-red-500' :
            job.priority === 'Medium' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}>
            {job.priority} Priority
          </Badge>
          <Badge className="bg-gray-200 text-gray-700">
            {job.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Property Info */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-3">Property Location</h2>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2 flex-1">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{job.property_address}</div>
                {job.access_instructions && (
                  <div className="text-sm text-gray-600 mt-1">
                    Access: {job.access_instructions}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            onClick={openNavigation}
            variant="outline" 
            className="w-full gap-2"
            size="lg"
          >
            <ExternalLink className="w-5 h-5" />
            Open in Maps
          </Button>
        </Card>

        {/* Operator Info */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-3">Assigned By</h2>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900">{job.operator_name}</div>
              <div className="text-sm text-gray-600">{job.operator_contact}</div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        </Card>

        {/* Job Details */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-3">Job Details</h2>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(job.due_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estimated Duration:</span>
              <span className="font-medium text-gray-900">{job.estimated_duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Approved Budget:</span>
              <span className="font-bold text-gray-900 text-lg">
                ${job.estimated_budget}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="font-semibold text-gray-900 mb-2">Description:</div>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {job.operator_notes && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="font-semibold text-gray-900 mb-2">Operator Notes:</div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-900">{job.operator_notes}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Inspection Photos */}
        {job.inspection_photos?.length > 0 && (
          <Card className="p-5">
            <h2 className="font-bold text-gray-900 mb-3">Inspection Photos</h2>
            <div className="grid grid-cols-2 gap-3">
              {job.inspection_photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Inspection ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {job.status === 'new' && (
          <div className="space-y-3">
            <Button onClick={handleAccept} size="lg" className="w-full gap-2">
              <CheckCircle className="w-5 h-5" />
              Accept Job
            </Button>
            <Button 
              onClick={() => setShowDeclineDialog(true)}
              variant="outline" 
              size="lg" 
              className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-5 h-5" />
              Decline Job
            </Button>
          </div>
        )}

        {job.status === 'accepted' && (
          <Button onClick={handleStart} size="lg" className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            <Play className="w-5 h-5" />
            Start Job
          </Button>
        )}

        {job.status === 'in_progress' && (
          <Button 
            onClick={() => setShowCompleteDialog(true)}
            size="lg" 
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Job
          </Button>
        )}
      </div>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for declining this job. The operator will be notified.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows="4"
            />
            <div className="flex gap-2">
              <Button onClick={handleDecline} variant="destructive" className="flex-1">
                Confirm Decline
              </Button>
              <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Completion Photos *
              </label>
              <Button variant="outline" className="w-full gap-2" size="lg">
                <Camera className="w-5 h-5" />
                Take Photos
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                {completionData.photos.length} photo(s) added
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Performed *
              </label>
              <textarea
                value={completionData.notes}
                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                placeholder="Describe what you did..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Actual Time Spent (hours)
              </label>
              <Input
                type="number"
                step="0.5"
                value={completionData.actual_time}
                onChange={(e) => setCompletionData({ ...completionData, actual_time: e.target.value })}
                placeholder="2.5"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                Submit Completion
              </Button>
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}