import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { ContractorJob } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  Clock,
  Camera,
  CheckCircle,
  Pause,
  Play,
  MapPin,
  Plus,
  Check,
  ChevronLeft,
  AlertCircle,
  Video,
  Search,
  Youtube,
  BookOpen,
  ExternalLink,
  Sparkles,
  FileText,
  Phone,
  MessageCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function ContractorJobActive() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const jobId = searchParams.get('id');

  // Timer state
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');

  // Fetch job data from database
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['contractor-job-active', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_jobs')
        .select(`
          *,
          work_order:work_orders (
            id,
            title,
            description,
            checklist,
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
      queryClient.invalidateQueries(['contractor-job-active', jobId]);
    }
  });

  // Initialize elapsed time from database
  useEffect(() => {
    if (jobData?.started_at) {
      const startTime = new Date(jobData.started_at).getTime();
      const pausedTime = (jobData.break_minutes || 0) * 60 * 1000;
      const currentElapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
      setElapsedSeconds(Math.max(0, currentElapsed));
    }
    if (jobData?.status === 'paused') {
      setIsRunning(false);
    }
  }, [jobData]);

  // Start job if not started yet
  useEffect(() => {
    if (jobData && !jobData.started_at && jobData.status === 'accepted') {
      updateJobMutation.mutate({
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
    }
  }, [jobData]);

  // Transform database data to component format
  const job = jobData ? {
    id: jobData.id,
    title: jobData.work_order?.title || 'Untitled Job',
    property_address: `${jobData.work_order?.property?.street_address || ''}, ${jobData.work_order?.property?.city || ''}`,
    scope: {
      work_plan: jobData.checklist?.map(item => ({
        step: item.item || item,
        completed: item.completed || false
      })) || [
        { step: 'Review job requirements', completed: false },
        { step: 'Complete the assigned work', completed: false },
        { step: 'Document with photos', completed: false },
        { step: 'Clean up work area', completed: false }
      ]
    },
    photos: {
      before: [],
      during: [],
      after: []
    },
    work_log: jobData.notes
      ? jobData.notes.split('\n').filter(l => l.trim()).map((line, idx) => {
          const match = line.match(/^\[(.+?)\] (.+)$/);
          return {
            id: idx + 1,
            text: match ? match[2] : line,
            timestamp: match ? match[1] : new Date().toISOString()
          };
        })
      : []
  } : null;

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Photo checklist (defined after null checks in render)
  const getPhotoChecklist = () => {
    if (!job) return [];
    return [
      { id: 'before', label: 'Before photos', completed: job.photos.before.length > 0, count: job.photos.before.length },
      { id: 'during', label: 'Work in progress', completed: job.photos.during.length > 0, count: job.photos.during.length },
      { id: 'problem', label: 'Problem close-up', completed: false, count: 0 },
      { id: 'after', label: 'After photos', completed: job.photos.after.length > 0, count: job.photos.after.length },
    ];
  };

  // Suggested resources
  const suggestedResources = [
    { id: 1, title: 'How to Install Gutter Brackets', type: 'video', duration: '8:45' },
    { id: 2, title: 'Gutter Slope Calculator', type: 'tool' },
    { id: 3, title: 'Sealing Gutter Joints', type: 'video', duration: '5:20' },
  ];

  const toggleStep = async (index) => {
    const currentChecklist = jobData?.checklist || job.scope.work_plan.map((s, i) => ({
      id: i + 1,
      item: s.step,
      completed: s.completed
    }));
    const newChecklist = currentChecklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    try {
      await updateJobMutation.mutateAsync({
        checklist: newChecklist
      });
    } catch (error) {
      toast.error('Failed to update checklist');
    }
  };

  const appendToNotes = async (text) => {
    const existingNotes = jobData?.notes || '';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedNotes = existingNotes
      ? `${existingNotes}\n[${timestamp}] ${text}`
      : `[${timestamp}] ${text}`;
    await updateJobMutation.mutateAsync({ notes: updatedNotes });
  };

  const handlePause = async () => {
    if (!pauseReason.trim()) {
      toast.error('Please provide a reason for pausing');
      return;
    }
    try {
      await updateJobMutation.mutateAsync({
        status: 'paused',
        break_minutes: (jobData?.break_minutes || 0) // Will be updated when resumed
      });
      await appendToNotes(`Paused: ${pauseReason}`);
      setIsRunning(false);
      setShowPauseDialog(false);
      toast.info('Timer paused');
      setPauseReason('');
    } catch (error) {
      toast.error('Failed to pause job');
    }
  };

  const handleResume = async () => {
    try {
      await updateJobMutation.mutateAsync({
        status: 'in_progress'
      });
      await appendToNotes('Resumed work');
      setIsRunning(true);
      toast.success('Timer resumed');
    } catch (error) {
      toast.error('Failed to resume job');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await appendToNotes(newNote);
      setNewNote('');
      setShowAddNoteDialog(false);
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleCompleteJob = () => {
    navigate(`${createPageUrl('ContractorJobComplete')}?id=${job?.id}&time=${elapsedSeconds}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading job...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  // Not found state
  if (!job) {
    return (
      <ContractorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Job not found</p>
            <Button className="mt-4" onClick={() => navigate(createPageUrl('ContractorDashboard'))}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  const completedSteps = job.scope.work_plan.filter(s => s.completed).length;
  const totalSteps = job.scope.work_plan.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <ContractorLayout activeJob={{ id: job.id, timer: formatTime(elapsedSeconds) }}>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Active Job Header */}
        <div className={`p-4 ${isRunning ? 'bg-green-600' : 'bg-yellow-500'} text-white`}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="p-1">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <Badge className={`${isRunning ? 'bg-green-700' : 'bg-yellow-600'} text-white`}>
              {isRunning ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>

          <h1 className="text-xl font-bold mb-1">{job.title}</h1>
          <div className="flex items-center gap-1 text-white/80 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            {job.property_address}
          </div>

          {/* Timer */}
          <div className="text-center py-4">
            <div className="text-5xl font-mono font-bold tracking-wider">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-sm text-white/80 mt-1">Time Elapsed</div>
          </div>

          {/* Timer Controls */}
          <div className="flex gap-2">
            {isRunning ? (
              <Button
                onClick={() => setShowPauseDialog(true)}
                variant="secondary"
                className="flex-1 gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Pause className="w-5 h-5" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                variant="secondary"
                className="flex-1 gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Play className="w-5 h-5" />
                Resume
              </Button>
            )}
            <Button
              onClick={handleCompleteJob}
              className="flex-1 gap-2 bg-white text-green-700 hover:bg-white/90"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Job
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Progress */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Work Progress</h3>
              <span className="text-sm text-gray-500">{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {job.scope.work_plan.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    step.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {step.completed && <Check className="w-4 h-4" />}
                  </div>
                  <span className={step.completed ? 'text-green-700 line-through' : 'text-gray-900'}>
                    {step.step}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Photo Capture */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
              <Button variant="outline" size="sm" className="gap-1">
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
            </div>

            <div className="space-y-2">
              {getPhotoChecklist().map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.completed ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {item.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span className={item.completed ? 'text-green-700' : 'text-gray-900'}>
                      {item.label}
                    </span>
                  </div>
                  {item.count > 0 && (
                    <Badge variant="secondary">{item.count} taken</Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Recent photos preview */}
            {job.photos.before.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">Recent Photos</div>
                <div className="flex gap-2 overflow-x-auto">
                  {[...job.photos.before, ...job.photos.during].map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.url}
                      alt={photo.label}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Work Log */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Work Log</h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setShowAddNoteDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </div>

            <div className="space-y-3">
              {job.work_log.slice().reverse().map(entry => (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{entry.text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Resources */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <Button variant="ghost" size="sm" className="gap-1 text-orange-600">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            <div className="space-y-2">
              {suggestedResources.map(resource => (
                <div
                  key={resource.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    resource.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {resource.type === 'video' ? <Youtube className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                    {resource.duration && (
                      <div className="text-xs text-gray-500">{resource.duration}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-3 gap-2">
              <Sparkles className="w-4 h-4" />
              Ask AI for Help
            </Button>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              Call Operator
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Why are you pausing?</p>
            <div className="space-y-2">
              {['Lunch break', 'Waiting for materials', 'Weather delay', 'Other'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setPauseReason(reason)}
                  className={`w-full p-3 rounded-lg border text-left ${
                    pauseReason === reason
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {pauseReason === 'Other' && (
              <Textarea
                placeholder="Please specify..."
                value={pauseReason === 'Other' ? '' : pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <Button onClick={handlePause} className="flex-1">
                Confirm Pause
              </Button>
              <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Work Log Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What did you just complete?"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} className="flex-1" disabled={!newNote.trim()}>
                Add Entry
              </Button>
              <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ContractorLayout>
  );
}
