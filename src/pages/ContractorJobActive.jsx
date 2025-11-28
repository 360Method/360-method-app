import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/utils';
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
  const jobId = searchParams.get('id') || '1';

  // Timer state
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');

  // Job data
  const [job, setJob] = useState({
    id: jobId,
    title: 'Gutter Repair',
    property_address: '123 Oak Street, Portland',
    scope: {
      work_plan: [
        { step: 'Inspect all gutters and identify all problem areas', completed: true },
        { step: 'Remove debris from gutters to assess full damage', completed: true },
        { step: 'Reattach loose gutter sections using new brackets', completed: false },
        { step: 'Replace damaged gutter hangers (estimate 6)', completed: false },
        { step: 'Secure loose downspout brackets', completed: false },
        { step: 'Seal any gaps with gutter sealant', completed: false },
        { step: 'Test water flow with garden hose', completed: false },
        { step: 'Clean up work area', completed: false }
      ]
    },
    photos: {
      before: [
        { id: 1, url: 'https://via.placeholder.com/100x100/e0e0e0/666?text=Before+1', label: 'Before - Front' }
      ],
      during: [],
      after: []
    },
    work_log: [
      { id: 1, text: 'Started job, assessed damage', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, text: 'Removed old brackets, cleared debris', timestamp: new Date(Date.now() - 1800000).toISOString() },
    ]
  });

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

  // Photo checklist
  const photoChecklist = [
    { id: 'before', label: 'Before photos', completed: job.photos.before.length > 0, count: job.photos.before.length },
    { id: 'during', label: 'Work in progress', completed: job.photos.during.length > 0, count: job.photos.during.length },
    { id: 'problem', label: 'Problem close-up', completed: false, count: 0 },
    { id: 'after', label: 'After photos', completed: job.photos.after.length > 0, count: job.photos.after.length },
  ];

  // Suggested resources
  const suggestedResources = [
    { id: 1, title: 'How to Install Gutter Brackets', type: 'video', duration: '8:45' },
    { id: 2, title: 'Gutter Slope Calculator', type: 'tool' },
    { id: 3, title: 'Sealing Gutter Joints', type: 'video', duration: '5:20' },
  ];

  const toggleStep = (index) => {
    const newWorkPlan = [...job.scope.work_plan];
    newWorkPlan[index].completed = !newWorkPlan[index].completed;
    setJob({ ...job, scope: { ...job.scope, work_plan: newWorkPlan } });
  };

  const handlePause = () => {
    if (!pauseReason.trim()) {
      toast.error('Please provide a reason for pausing');
      return;
    }
    setIsRunning(false);
    setShowPauseDialog(false);
    toast.info('Timer paused');
    // Add to work log
    setJob({
      ...job,
      work_log: [
        ...job.work_log,
        { id: Date.now(), text: `Paused: ${pauseReason}`, timestamp: new Date().toISOString() }
      ]
    });
    setPauseReason('');
  };

  const handleResume = () => {
    setIsRunning(true);
    toast.success('Timer resumed');
    setJob({
      ...job,
      work_log: [
        ...job.work_log,
        { id: Date.now(), text: 'Resumed work', timestamp: new Date().toISOString() }
      ]
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setJob({
      ...job,
      work_log: [
        ...job.work_log,
        { id: Date.now(), text: newNote, timestamp: new Date().toISOString() }
      ]
    });
    setNewNote('');
    setShowAddNoteDialog(false);
    toast.success('Note added');
  };

  const handleCompleteJob = () => {
    navigate(`${createPageUrl('ContractorJobComplete')}?id=${job.id}&time=${elapsedSeconds}`);
  };

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
              {photoChecklist.map(item => (
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
