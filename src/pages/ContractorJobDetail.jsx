import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { ContractorJob } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  MapPin,
  Clock,
  DollarSign,
  Camera,
  CheckCircle,
  X,
  MessageCircle,
  ExternalLink,
  Play,
  ChevronLeft,
  Navigation,
  Phone,
  ClipboardList,
  ShoppingCart,
  Image,
  Video,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Check,
  RefreshCw,
  Download,
  Search,
  Youtube,
  BookOpen,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const TABS = [
  { id: 'scope', label: 'Scope', icon: ClipboardList },
  { id: 'materials', label: 'Materials', icon: ShoppingCart },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'resources', label: 'Resources', icon: Video },
  { id: 'notes', label: 'Notes', icon: FileText },
];

export default function ContractorJobDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const jobId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('scope');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isGeneratingScope, setIsGeneratingScope] = useState(false);
  const [isGeneratingMaterials, setIsGeneratingMaterials] = useState(false);
  const [scopeEditing, setScopeEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');

  // Fetch job data from database
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['contractor-job-detail', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_jobs')
        .select(`
          *,
          work_order:work_orders (
            id,
            title,
            description,
            priority,
            scheduled_date,
            scheduled_time,
            estimated_cost,
            estimated_hours,
            notes,
            checklist,
            property:properties (
              street_address,
              city,
              state,
              zip_code,
              user_id
            ),
            operator:operators (
              company_name,
              business_phone
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
      queryClient.invalidateQueries(['contractor-job-detail', jobId]);
    }
  });

  // Transform database data to component format
  const job = jobData ? {
    id: jobData.id,
    title: jobData.work_order?.title || 'Untitled Job',
    property_address: jobData.work_order?.property?.street_address || 'Address not set',
    city: jobData.work_order?.property?.city || '',
    state: jobData.work_order?.property?.state || '',
    zip: jobData.work_order?.property?.zip_code || '',
    operator_name: jobData.work_order?.operator?.company_name || 'Unknown Operator',
    operator_phone: jobData.work_order?.operator?.business_phone || '',
    owner_name: 'Property Owner',
    owner_phone: '',
    priority: jobData.work_order?.priority || 'medium',
    status: jobData.status,
    due_date: jobData.work_order?.scheduled_date || '',
    due_time: jobData.work_order?.scheduled_time || 'TBD',
    estimated_budget: jobData.work_order?.estimated_cost || 0,
    estimated_duration: jobData.work_order?.estimated_hours ? `${jobData.work_order.estimated_hours} hours` : '2-3 hours',
    description: jobData.work_order?.description || '',
    operator_notes: jobData.work_order?.notes || '',
    access_instructions: '',
    inspection_photos: [],
    scope: {
      problem_description: jobData.work_order?.description || 'No description provided',
      work_plan: jobData.checklist?.map(item => item.item || item) || [
        'Review job requirements',
        'Assess the situation on-site',
        'Complete the assigned work',
        'Document with photos',
        'Clean up work area'
      ],
      ai_generated: false,
      approved: jobData.status !== 'assigned'
    },
    materials: jobData.materials_used || [],
    photos: {
      before: [],
      during: [],
      after: []
    },
    notes: jobData.notes
      ? jobData.notes.split('\n\n').map((note, idx) => {
          const match = note.match(/^\[(.+?)\] (.+)$/s);
          return {
            id: idx + 1,
            text: match ? match[2] : note,
            timestamp: match ? match[1] : jobData.created_at,
            type: 'general'
          };
        })
      : [],
    saved_resources: []
  } : null;

  const totalMaterialsCost = job?.materials?.reduce((sum, m) => sum + ((m.quantity || 0) * (m.unit_cost || 0)), 0) || 0;

  const handleAccept = async () => {
    try {
      await updateJobMutation.mutateAsync({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });
      toast.success('Job accepted!');
    } catch (error) {
      toast.error('Failed to accept job');
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await updateJobMutation.mutateAsync({
        status: 'declined',
        declined_at: new Date().toISOString(),
        decline_reason: declineReason
      });
      toast.info('Job declined. Operator has been notified.');
      setShowDeclineDialog(false);
      navigate(createPageUrl('ContractorDashboard'));
    } catch (error) {
      toast.error('Failed to decline job');
    }
  };

  const handleStartJob = () => {
    navigate(`${createPageUrl('ContractorJobActive')}?id=${job?.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading job details...</p>
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

  const generateAIScope = async () => {
    setIsGeneratingScope(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingScope(false);
    toast.success('Scope of work generated!');
  };

  const generateAIMaterials = async () => {
    setIsGeneratingMaterials(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGeneratingMaterials(false);
    toast.success('Material list updated!');
  };

  const approveScope = async () => {
    try {
      await updateJobMutation.mutateAsync({
        checklist: job.scope.work_plan.map((item, idx) => ({
          id: idx + 1,
          item: item,
          completed: false
        }))
      });
      toast.success('Scope approved!');
    } catch (error) {
      toast.error('Failed to approve scope');
    }
  };

  const toggleMaterialPurchased = async (materialId) => {
    const updatedMaterials = job.materials.map(m =>
      m.id === materialId ? { ...m, purchased: !m.purchased } : m
    );
    try {
      await updateJobMutation.mutateAsync({
        materials_used: updatedMaterials
      });
    } catch (error) {
      toast.error('Failed to update material');
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    const existingNotes = jobData?.notes || '';
    const timestamp = new Date().toLocaleString();
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n[${timestamp}] ${newNote}`
      : `[${timestamp}] ${newNote}`;

    try {
      await updateJobMutation.mutateAsync({
        notes: updatedNotes
      });
      setNewNote('');
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const openNavigation = () => {
    const address = encodeURIComponent(`${job.property_address}, ${job.city}, ${job.state} ${job.zip}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  // Mock resources
  const suggestedResources = [
    { id: 1, title: 'How to Install Gutter Brackets', type: 'video', source: 'YouTube', duration: '8:45' },
    { id: 2, title: 'Gutter Slope Calculator', type: 'tool', source: 'GutterPro' },
    { id: 3, title: 'Residential Gutter Code Requirements', type: 'guide', source: 'Building Code' },
    { id: 4, title: 'Sealing Gutter Joints Properly', type: 'video', source: 'YouTube', duration: '5:20' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ContractorLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                {job.property_address}, {job.city}
              </div>
            </div>
            <Badge className={getPriorityColor(job.priority)}>
              {job.priority}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={openNavigation}>
              <Navigation className="w-4 h-4" />
              Navigate
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1">
              <Phone className="w-4 h-4" />
              Call Owner
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        </div>

        {/* Job Info Banner */}
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-blue-700">
                <Clock className="w-4 h-4" />
                Due {new Date(job.due_date).toLocaleDateString()} at {job.due_time}
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <DollarSign className="w-4 h-4" />
                ${job.estimated_budget}
              </span>
            </div>
            <span className="text-blue-600 font-medium">{job.estimated_duration}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-4 pb-32">
          {/* SCOPE TAB */}
          {activeTab === 'scope' && (
            <>
              {/* Problem Description */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Problem Assessment</h3>
                  {job.scope.ai_generated && (
                    <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{job.scope.problem_description}</p>
              </Card>

              {/* Work Plan */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Work Plan</h3>
                  <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
                <ol className="space-y-2">
                  {job.scope.work_plan.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              {/* AI Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={generateAIScope}
                  disabled={isGeneratingScope}
                >
                  {isGeneratingScope ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Regenerate with AI
                </Button>
                {!job.scope.approved && (
                  <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={approveScope}>
                    <Check className="w-4 h-4" />
                    Approve Scope
                  </Button>
                )}
              </div>

              {job.scope.approved && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Scope approved and ready to execute</span>
                </div>
              )}

              {/* Operator Notes */}
              {job.operator_notes && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Operator Notes</span>
                  </div>
                  <p className="text-blue-800">{job.operator_notes}</p>
                </Card>
              )}

              {/* Access Instructions */}
              {job.access_instructions && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Access Instructions</span>
                  </div>
                  <p className="text-yellow-800">{job.access_instructions}</p>
                </Card>
              )}
            </>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Material List</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Estimated Total</div>
                    <div className="text-lg font-bold text-gray-900">${totalMaterialsCost.toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {job.materials.map(material => (
                    <div
                      key={material.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        material.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleMaterialPurchased(material.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          material.purchased
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {material.purchased && <Check className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${material.purchased ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                          {material.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Qty: {material.quantity} × ${material.unit_cost.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        ${(material.quantity * material.unit_cost).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Material
                </Button>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={generateAIMaterials}
                  disabled={isGeneratingMaterials}
                >
                  {isGeneratingMaterials ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  AI Suggest More
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Export List
                </Button>
              </div>
            </>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <>
              {/* Before Photos */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Before Photos</h3>
                  <Badge variant="outline">{job.photos.before.length} taken</Badge>
                </div>
                {job.photos.before.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {job.photos.before.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Before ${idx}`} className="w-full h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No before photos yet</p>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-3 gap-2">
                  <Camera className="w-4 h-4" />
                  Take Before Photo
                </Button>
              </Card>

              {/* Inspection Photos from Operator */}
              {job.inspection_photos?.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Operator Inspection Photos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {job.inspection_photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Inspection ${idx}`} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                </Card>
              )}

              {/* Photo Checklist */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Photo Checklist</h3>
                <div className="space-y-2">
                  {[
                    { id: 'before', label: 'Before photos', required: true, completed: job.photos.before.length > 0 },
                    { id: 'problem', label: 'Problem close-up', required: true, completed: false },
                    { id: 'serial', label: 'Model/Serial number', required: false, completed: false },
                    { id: 'during', label: 'Work in progress', required: false, completed: job.photos.during.length > 0 },
                    { id: 'after', label: 'After photos', required: true, completed: job.photos.after.length > 0 },
                  ].map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                      }`}>
                        {item.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span className={item.completed ? 'text-gray-500' : 'text-gray-900'}>
                        {item.label}
                      </span>
                      {item.required && !item.completed && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for help..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Suggested Resources</h3>
                <div className="space-y-3">
                  {suggestedResources.map(resource => (
                    <div key={resource.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        resource.type === 'video' ? 'bg-red-100 text-red-600' :
                        resource.type === 'tool' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {resource.type === 'video' ? <Youtube className="w-5 h-5" /> :
                         resource.type === 'tool' ? <ExternalLink className="w-5 h-5" /> :
                         <BookOpen className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{resource.title}</div>
                        <div className="text-sm text-gray-500">
                          {resource.source}
                          {resource.duration && ` • ${resource.duration}`}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Button variant="outline" className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Ask AI for Help
              </Button>
            </>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <>
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Add Note</h3>
                <Textarea
                  placeholder="Add a note about this job..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button className="w-full mt-3 gap-2" onClick={addNote} disabled={!newNote.trim()}>
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              </Card>

              <div className="space-y-3">
                {job.notes.map(note => (
                  <Card key={note.id} className="p-4">
                    <p className="text-gray-900 mb-2">{note.text}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(note.timestamp).toLocaleString()}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fixed Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 md:left-56 bg-white border-t border-gray-200 p-4 z-40">
          {job.status === 'new' && (
            <div className="flex gap-2">
              <Button onClick={handleAccept} className="flex-1 gap-2">
                <CheckCircle className="w-5 h-5" />
                Accept Job
              </Button>
              <Button
                onClick={() => setShowDeclineDialog(true)}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          {job.status === 'accepted' && (
            <Button onClick={handleStartJob} size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700">
              <Play className="w-5 h-5" />
              Start Job Timer
            </Button>
          )}
        </div>
      </div>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for declining this job.
            </p>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining..."
              rows={4}
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
    </ContractorLayout>
  );
}
