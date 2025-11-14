import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Clock,
  DollarSign,
  Wrench,
  AlertTriangle,
  Building2,
  Edit,
  Save,
  X,
  Upload,
  Printer,
  Mail,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Sparkles,
  BookOpen,
  HardHat,
  Star,
  ArrowLeft,
  PlayCircle
} from "lucide-react";
import { format, startOfDay } from "date-fns";

export default function TaskDetailModal({ 
  task, 
  property, 
  open, 
  onClose,
  onComplete,
  onSchedule,
  onBackToPrioritize,
  context = 'prioritize' // 'prioritize', 'schedule', or 'execute'
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showEstimateRequest, setShowEstimateRequest] = useState(false);
  const [estimateType, setEstimateType] = useState('');
  
  const [editedTask, setEditedTask] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    system_type: task?.system_type || 'General',
    execution_method: task?.execution_method || '',
    scheduled_date: task?.scheduled_date || '',
    current_fix_cost: task?.current_fix_cost || 0,
    diy_cost: task?.diy_cost || 0,
    contractor_cost: task?.contractor_cost || 0,
    operator_cost: task?.operator_cost || 0,
    estimated_hours: task?.estimated_hours || 0,
    diy_time_hours: task?.diy_time_hours || 0,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
      setIsEditing(false);
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const currentPhotos = task.photo_urls || [];
      return base44.entities.MaintenanceTask.update(task.id, {
        photo_urls: [...currentPhotos, file_url]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setUploadingPhoto(false);
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, fileName }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const currentFiles = task.receipt_files || [];
      return base44.entities.MaintenanceTask.update(task.id, {
        receipt_files: [...currentFiles, { name: fileName, url: file_url, uploaded_date: new Date().toISOString() }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setUploadingFile(false);
    }
  });

  const handleSave = () => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: editedTask
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(true);
      uploadFileMutation.mutate({ file, fileName: file.name });
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${task.title} - Work Order</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1B365D; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; }
          </style>
        </head>
        <body>
          <h1>🔧 Work Order: ${task.title}</h1>
          <div class="section">
            <span class="label">Property:</span>
            <span class="value">${property?.address || property?.street_address || 'N/A'}</span>
          </div>
          <div class="section">
            <span class="label">Priority:</span>
            <span class="value">${task.priority}</span>
          </div>
          <div class="section">
            <span class="label">System:</span>
            <span class="value">${task.system_type}</span>
          </div>
          ${task.scheduled_date ? `
            <div class="section">
              <span class="label">Scheduled:</span>
              <span class="value">${format(new Date(task.scheduled_date), 'MMMM d, yyyy')}</span>
            </div>
          ` : ''}
          <div class="section">
            <span class="label">Description:</span>
            <p>${task.description || 'N/A'}</p>
          </div>
          ${task.ai_sow ? `
            <div class="section">
              <span class="label">Scope of Work:</span>
              <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${task.ai_sow}</pre>
            </div>
          ` : ''}
          ${task.ai_tools_needed?.length ? `
            <div class="section">
              <span class="label">Tools Needed:</span>
              <ul>${task.ai_tools_needed.map(tool => `<li>${tool}</li>`).join('')}</ul>
            </div>
          ` : ''}
          ${task.ai_materials_needed?.length ? `
            <div class="section">
              <span class="label">Materials Needed:</span>
              <ul>${task.ai_materials_needed.map(mat => `<li>${mat}</li>`).join('')}</ul>
            </div>
          ` : ''}
          <div class="section">
            <span class="label">Estimated Time:</span>
            <span class="value">${task.estimated_hours || task.diy_time_hours || 'TBD'} hours</span>
          </div>
          <div class="section">
            <span class="label">Estimated Cost:</span>
            <span class="value">$${task.current_fix_cost || task.diy_cost || task.contractor_cost || 'TBD'}</span>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEmail = async () => {
    const user = await base44.auth.me();
    const emailBody = `
Work Order: ${task.title}

Property: ${property?.address || property?.street_address || 'N/A'}
Priority: ${task.priority}
System: ${task.system_type}
${task.scheduled_date ? `Scheduled: ${format(new Date(task.scheduled_date), 'MMMM d, yyyy')}\n` : ''}

Description:
${task.description || 'N/A'}

${task.ai_sow ? `Scope of Work:\n${task.ai_sow}\n` : ''}

${task.ai_tools_needed?.length ? `Tools Needed:\n${task.ai_tools_needed.join(', ')}\n` : ''}

${task.ai_materials_needed?.length ? `Materials Needed:\n${task.ai_materials_needed.join(', ')}\n` : ''}

Estimated Time: ${task.estimated_hours || task.diy_time_hours || 'TBD'} hours
Estimated Cost: $${task.current_fix_cost || task.diy_cost || task.contractor_cost || 'TBD'}
    `;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Work Order: ${task.title}`,
      body: emailBody
    });

    alert('Work order sent to ' + user.email);
  };

  const handleRequestEstimate = (type) => {
    setEstimateType(type);
    setShowEstimateRequest(true);
  };

  if (!task) return null;

  const isMultiUnit = property && property.door_count > 1;
  const hasCascadeAlert = task.cascade_risk_score >= 7;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Wrench className="w-6 h-6 text-yellow-600" />
              {isEditing ? 'Edit Task' : 'Task Details'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* TASK HEADER */}
          <div className="space-y-3">
            {isEditing ? (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Task Title *</label>
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                  className="text-lg font-semibold"
                  style={{ minHeight: '48px' }}
                />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {property && (
                <Badge variant="outline" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  {property.address || property.street_address}
                </Badge>
              )}
              {isMultiUnit && task.unit_tag && (
                <Badge className="bg-purple-600 text-white gap-1">
                  <Building2 className="w-3 h-3" />
                  {task.unit_tag}
                </Badge>
              )}
              <Badge className={
                task.priority === 'High' ? 'bg-red-600 text-white' :
                task.priority === 'Medium' ? 'bg-yellow-600 text-white' :
                task.priority === 'Low' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
              }>
                {task.priority}
              </Badge>
              {task.execution_method && (
                <Badge className="bg-blue-600 text-white">
                  {task.execution_method === 'DIY' && '🔧 DIY'}
                  {task.execution_method === 'Contractor' && '👷 Contractor'}
                  {task.execution_method === '360_Operator' && '⭐ Operator'}
                </Badge>
              )}
              {hasCascadeAlert && (
                <Badge className="bg-red-600 text-white gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  High Risk
                </Badge>
              )}
            </div>
          </div>

          {/* EDITABLE FIELDS */}
          {isEditing && (
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Priority</label>
                <Select value={editedTask.priority} onValueChange={(val) => setEditedTask({...editedTask, priority: val})}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">🔥 High - Urgent</SelectItem>
                    <SelectItem value="Medium">⚡ Medium - Important</SelectItem>
                    <SelectItem value="Low">💡 Low - Can Wait</SelectItem>
                    <SelectItem value="Routine">🔄 Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">System Type</label>
                <Select value={editedTask.system_type} onValueChange={(val) => setEditedTask({...editedTask, system_type: val})}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Roof">Roof</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Gutters">Gutters</SelectItem>
                    <SelectItem value="Exterior">Exterior</SelectItem>
                    <SelectItem value="Windows/Doors">Windows/Doors</SelectItem>
                    <SelectItem value="Appliances">Appliances</SelectItem>
                    <SelectItem value="Landscaping">Landscaping</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Execution Method</label>
                <Select value={editedTask.execution_method} onValueChange={(val) => setEditedTask({...editedTask, execution_method: val})}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Choose method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIY">🔧 DIY</SelectItem>
                    <SelectItem value="Contractor">👷 Contractor</SelectItem>
                    <SelectItem value="360_Operator">⭐ 360° Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Scheduled Date</label>
                <Input
                  type="date"
                  value={editedTask.scheduled_date ? format(startOfDay(new Date(editedTask.scheduled_date)), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEditedTask({...editedTask, scheduled_date: e.target.value})}
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                <Textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  style={{ minHeight: '44px' }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateTaskMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  style={{ minHeight: '44px' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          {!isEditing && task.description && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-800 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* COST & TIME ESTIMATES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {task.diy_cost > 0 && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-center">
                <Wrench className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-green-700 mb-1">DIY Cost</div>
                <div className="text-xl font-bold text-green-700">${task.diy_cost}</div>
              </div>
            )}
            {task.contractor_cost > 0 && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-center">
                <HardHat className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <div className="text-xs text-gray-700 mb-1">Pro Cost</div>
                <div className="text-xl font-bold text-gray-700">${task.contractor_cost}</div>
              </div>
            )}
            {task.operator_cost > 0 && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-center">
                <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-blue-700 mb-1">Operator</div>
                <div className="text-xl font-bold text-blue-700">${task.operator_cost}</div>
              </div>
            )}
            {(task.estimated_hours || task.diy_time_hours) > 0 && (
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-xs text-purple-700 mb-1">Time Est.</div>
                <div className="text-xl font-bold text-purple-700">{task.estimated_hours || task.diy_time_hours}h</div>
              </div>
            )}
          </div>

          {/* CASCADE RISK ALERT */}
          {hasCascadeAlert && task.cascade_risk_reason && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">⚠️ High Cascade Risk</h3>
                  <p className="text-sm text-red-800 leading-relaxed">{task.cascade_risk_reason}</p>
                  {task.delayed_fix_cost > 0 && (
                    <div className="mt-2 bg-red-100 rounded p-2">
                      <p className="text-sm font-semibold text-red-900">
                        Could escalate to ${task.delayed_fix_cost.toLocaleString()} if delayed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI SCOPE OF WORK */}
          {task.ai_sow && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">AI-Generated Scope of Work</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {task.ai_sow}
                </pre>
              </div>
            </div>
          )}

          {/* TOOLS & MATERIALS */}
          <div className="grid md:grid-cols-2 gap-4">
            {task.ai_tools_needed && task.ai_tools_needed.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-amber-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tools Needed
                </h3>
                <div className="space-y-2">
                  {task.ai_tools_needed.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.ai_materials_needed && task.ai_materials_needed.length > 0 && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-green-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Materials Needed
                </h3>
                <div className="space-y-2">
                  {task.ai_materials_needed.map((material, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {material}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* VIDEO TUTORIALS */}
          {task.ai_video_tutorials && task.ai_video_tutorials.length > 0 && (
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-purple-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                📺 Video Tutorials
              </h3>
              <div className="space-y-2">
                {task.ai_video_tutorials.map((video, idx) => (
                  <a
                    key={idx}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    → {video.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* PHOTOS */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Photos {task.photo_urls?.length ? `(${task.photo_urls.length})` : ''}
              </h3>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  asChild
                >
                  <span className="gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            {task.photo_urls && task.photo_urls.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {task.photo_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Task photo ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No photos yet</p>
            )}
          </div>

          {/* FILES & RECEIPTS */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Files & Receipts {task.receipt_files?.length ? `(${task.receipt_files.length})` : ''}
              </h3>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingFile}
                  asChild
                >
                  <span className="gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingFile ? 'Uploading...' : 'Upload File'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {task.receipt_files && task.receipt_files.length > 0 ? (
              <div className="space-y-2">
                {task.receipt_files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No files uploaded yet</p>
            )}
          </div>

          {/* REQUEST ESTIMATE */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-orange-900 mb-3">Need Professional Help?</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                onClick={() => handleRequestEstimate('operator')}
                style={{ minHeight: '48px' }}
              >
                <Star className="w-4 h-4" />
                Request 360° Operator Quote
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-gray-600 text-gray-700 hover:bg-gray-50"
                onClick={() => handleRequestEstimate('contractor')}
                style={{ minHeight: '48px' }}
              >
                <HardHat className="w-4 h-4" />
                Request Local Contractor
              </Button>
            </div>
          </div>

          {/* CONTEXT-SPECIFIC ACTIONS */}
          <div className="pt-4 border-t-2 border-gray-200">
            <div className="flex flex-wrap gap-3">
              {context === 'prioritize' && onSchedule && (
                <Button
                  onClick={() => onSchedule(task)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Send className="w-4 h-4" />
                  Send to Schedule
                </Button>
              )}

              {context === 'schedule' && onBackToPrioritize && (
                <Button
                  onClick={() => {
                    onBackToPrioritize(task);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-700 hover:bg-red-50 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Prioritize
                </Button>
              )}

              {context === 'execute' && onComplete && task.scheduled_date && (
                <Button
                  onClick={() => {
                    onComplete(task);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}

              {task.scheduled_date && context !== 'execute' && (
                <Button
                  variant="outline"
                  className="flex-1 border-green-600 text-green-700 hover:bg-green-50 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Go to Execute
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* ESTIMATE REQUEST DIALOG */}
      {showEstimateRequest && (
        <Dialog open={showEstimateRequest} onOpenChange={setShowEstimateRequest}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Request {estimateType === 'operator' ? '360° Operator' : 'Contractor'} Estimate
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Task:</strong> {task.title}
                </p>
                <p className="text-sm text-blue-900">
                  <strong>Property:</strong> {property?.address || property?.street_address}
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="text-sm text-yellow-900">
                  {estimateType === 'operator' 
                    ? 'A 360° Method operator will contact you within 24 hours with a detailed quote.'
                    : 'We\'ll connect you with local contractors who can provide quotes for this work.'
                  }
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowEstimateRequest(false)}
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { 
                        execution_method: estimateType === 'operator' ? '360_Operator' : 'Contractor',
                        status: 'Scheduled'
                      }
                    });
                    setShowEstimateRequest(false);
                    alert('Request submitted successfully!');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  style={{ minHeight: '48px' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}