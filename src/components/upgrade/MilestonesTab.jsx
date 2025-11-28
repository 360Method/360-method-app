import React, { useState } from 'react';
import { Upgrade } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, Circle, Clock, Camera, MessageSquare, 
  Edit, Trash2, ChevronDown, ChevronUp, Plus,
  AlertCircle
} from 'lucide-react';

export default function MilestonesTab({ project, onUpdate }) {
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      const updatedMilestones = project.milestones.map(m => 
        m.id === milestoneId 
          ? { 
              ...m, 
              status: newStatus,
              completed_date: newStatus === 'Completed' ? new Date().toISOString() : null
            }
          : m
      );

      // Calculate progress
      const completedCount = updatedMilestones.filter(m => m.status === 'Completed').length;
      const progressPercent = Math.round((completedCount / updatedMilestones.length) * 100);
      
      // Find next incomplete milestone
      const nextIncomplete = updatedMilestones.find(m => m.status !== 'Completed');
      const currentMilestone = nextIncomplete ? nextIncomplete.title : 'All Complete';

      // Update project status if all milestones complete
      const newProjectStatus = progressPercent === 100 ? 'Completed' : 
                               progressPercent > 0 ? 'In Progress' : 
                               project.status;

      await Upgrade.update(project.id, {
        milestones: updatedMilestones,
        progress_percentage: progressPercent,
        current_milestone: currentMilestone,
        status: newProjectStatus
      });

      console.log('✅ Milestone updated:', milestoneId, '→', newStatus);
      console.log('Progress:', progressPercent + '%');
      
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to update milestone:', error);
      alert('Failed to update milestone. Please try again.');
    }
  };

  const handleAddMilestone = () => {
    setShowAddForm(true);
  };

  return (
    <div className="space-y-4">
      
      {/* No Milestones Warning */}
      {(!project.milestones || project.milestones.length === 0) && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">No Milestones Yet</p>
              <p className="text-sm text-yellow-800">
                Add milestones to break your project into manageable steps and track progress.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Milestone List */}
      {project.milestones?.map((milestone, index) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          index={index}
          isExpanded={expandedMilestone === milestone.id}
          onToggleExpand={() => setExpandedMilestone(
            expandedMilestone === milestone.id ? null : milestone.id
          )}
          onStatusChange={handleStatusChange}
          project={project}
          onUpdate={onUpdate}
        />
      ))}

      {/* Add Custom Milestone */}
      {showAddForm ? (
        <AddMilestoneForm
          project={project}
          onSave={() => {
            setShowAddForm(false);
            onUpdate();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button
          onClick={handleAddMilestone}
          variant="outline"
          className="w-full"
          style={{ minHeight: '48px' }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Custom Milestone
        </Button>
      )}
    </div>
  );
}

// Milestone Card Component (Mobile-First)
function MilestoneCard({ 
  milestone, 
  index, 
  isExpanded, 
  onToggleExpand, 
  onStatusChange,
  project,
  onUpdate
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    title: milestone.title,
    description: milestone.description || '',
    notes: milestone.notes || ''
  });
  
  const statusBg = {
    'Completed': 'bg-green-50 border-green-300',
    'In Progress': 'bg-yellow-50 border-yellow-300',
    'Not Started': 'bg-white border-gray-200',
    'Skipped': 'bg-gray-50 border-gray-300'
  }[milestone.status] || 'bg-white border-gray-200';

  const statusIcon = {
    'Completed': <CheckCircle2 className="w-6 h-6 text-green-600" />,
    'In Progress': <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />,
    'Not Started': <Circle className="w-6 h-6 text-gray-400" />,
    'Skipped': <Circle className="w-6 h-6 text-gray-300" />
  }[milestone.status];

  const handleSaveEdit = async () => {
    try {
      const updatedMilestones = project.milestones.map(m =>
        m.id === milestone.id ? { ...m, ...editData } : m
      );

      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log('✅ Milestone edited:', milestone.id);
      setShowEditForm(false);
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to edit milestone:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete milestone "${milestone.title}"?`)) return;

    try {
      const updatedMilestones = project.milestones.filter(m => m.id !== milestone.id);
      
      // Recalculate progress
      const completedCount = updatedMilestones.filter(m => m.status === 'Completed').length;
      const progressPercent = updatedMilestones.length > 0 
        ? Math.round((completedCount / updatedMilestones.length) * 100) 
        : 0;

      await Upgrade.update(project.id, {
        milestones: updatedMilestones,
        progress_percentage: progressPercent
      });

      console.log('✅ Milestone deleted:', milestone.id);
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to delete milestone:', error);
      alert('Failed to delete milestone. Please try again.');
    }
  };

  if (showEditForm) {
    return (
      <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
        <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
          Edit Milestone
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Title *
            </label>
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              style={{ minHeight: '48px' }}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              style={{ minHeight: '80px' }}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              style={{ minHeight: '80px' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveEdit}
              className="flex-1"
              style={{ minHeight: '44px' }}
            >
              Save Changes
            </Button>
            <Button
              onClick={() => setShowEditForm(false)}
              variant="outline"
              className="flex-1"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-xl p-4 ${statusBg}`}>
      {/* Header - Always Visible */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {statusIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">
              {index + 1}. {milestone.title}
            </h4>
            <button
              onClick={onToggleExpand}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              style={{ minHeight: '32px', minWidth: '32px' }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            {milestone.status === 'Completed' && milestone.completed_date && (
              <span className="text-green-700">
                ✓ Completed {new Date(milestone.completed_date).toLocaleDateString()}
              </span>
            )}
            {milestone.status === 'In Progress' && (
              <span className="text-yellow-700">🔨 In Progress</span>
            )}
            {milestone.status === 'Not Started' && (
              <span className="text-gray-500">Not Started</span>
            )}
            {milestone.status === 'Skipped' && (
              <span className="text-gray-400">Skipped</span>
            )}
          </p>

          {/* Quick Actions - Mobile Friendly */}
          {!isExpanded && (
            <div className="flex flex-wrap gap-2">
              {milestone.status === 'Not Started' && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(milestone.id, 'In Progress')}
                  style={{ minHeight: '36px' }}
                >
                  Start
                </Button>
              )}
              {milestone.status === 'In Progress' && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(milestone.id, 'Completed')}
                  className="bg-green-600 hover:bg-green-700"
                  style={{ minHeight: '36px' }}
                >
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 pl-0 sm:pl-9">
          {/* Description */}
          {milestone.description && (
            <div>
              <p className="text-sm text-gray-700">{milestone.description}</p>
            </div>
          )}

          {/* AI Guidance */}
          {milestone.ai_guidance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    💡 AI Guidance
                  </p>
                  <p className="text-xs text-blue-800">{milestone.ai_guidance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Photos */}
          {milestone.photos && milestone.photos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                📸 Photos ({milestone.photos.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {milestone.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Milestone ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {milestone.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">📝 Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{milestone.notes}</p>
            </div>
          )}

          {/* Duration */}
          {milestone.typical_duration_days && (
            <div className="text-xs text-gray-600">
              ⏱️ Typical duration: {milestone.typical_duration_days} day{milestone.typical_duration_days !== 1 ? 's' : ''}
            </div>
          )}

          {/* Actions - Mobile First */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {milestone.status !== 'Completed' && (
              <>
                {milestone.status === 'Not Started' && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(milestone.id, 'In Progress')}
                    style={{ minHeight: '44px' }}
                  >
                    Start This Milestone
                  </Button>
                )}
                {milestone.status === 'In Progress' && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(milestone.id, 'Completed')}
                    className="bg-green-600 hover:bg-green-700"
                    style={{ minHeight: '44px' }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                )}
              </>
            )}
            {milestone.status === 'Completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(milestone.id, 'In Progress')}
                style={{ minHeight: '44px' }}
              >
                Reopen
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditForm(true)}
              style={{ minHeight: '44px' }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
              style={{ minHeight: '44px' }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Milestone Form
function AddMilestoneForm({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ai_guidance: '',
    typical_duration_days: 1
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    try {
      const newMilestone = {
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        order: project.milestones?.length || 0,
        status: 'Not Started',
        completed_date: null,
        photos: [],
        notes: ''
      };

      const updatedMilestones = [...(project.milestones || []), newMilestone];

      await Upgrade.update(project.id, {
        milestones: updatedMilestones
      });

      console.log('✅ Milestone added:', newMilestone.title);
      onSave();
    } catch (error) {
      console.error('❌ Failed to add milestone:', error);
      alert('Failed to add milestone. Please try again.');
    }
  };

  return (
    <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
      <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
        Add Custom Milestone
      </h4>

      <div className="space-y-3">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Get 3 contractor quotes"
            style={{ minHeight: '48px' }}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What needs to be done in this milestone?"
            rows={3}
            style={{ minHeight: '100px' }}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Estimated Duration (days)
          </label>
          <Input
            type="number"
            value={formData.typical_duration_days}
            onChange={(e) => setFormData(prev => ({ ...prev, typical_duration_days: parseInt(e.target.value) || 1 }))}
            min="1"
            style={{ minHeight: '48px' }}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className="flex-1"
            style={{ minHeight: '44px' }}
          >
            Add Milestone
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}