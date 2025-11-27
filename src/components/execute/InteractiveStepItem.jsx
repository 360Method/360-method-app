import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronDown, ChevronUp, Camera, Upload, Loader2, Edit2, Trash2,
  CheckCircle2, Clock, ChevronUpIcon, ChevronDownIcon
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function InteractiveStepItem({
  step,
  stepIndex,
  isCompleted,
  completion,
  onToggle,
  onPhotoUpload,
  onNotesChange,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  uploadingPhotos
}) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState(step);
  const [localNotes, setLocalNotes] = useState(completion?.notes || '');

  const handleSaveEdit = () => {
    if (onEdit && editedText.trim()) {
      onEdit(stepIndex, editedText);
      setEditMode(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    if (onPhotoUpload) {
      await onPhotoUpload(stepIndex, e.target.files);
    }
  };

  const handleNotesBlur = () => {
    if (onNotesChange && localNotes !== (completion?.notes || '')) {
      onNotesChange(stepIndex, localNotes);
    }
  };

  const stepPhotos = completion?.photos || [];

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className={`
        border-2 rounded-lg transition-all
        ${isCompleted ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
      `}>
        {/* Step Header */}
        <div className="p-3 flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggle}
            className="mt-1 flex-shrink-0"
          />
          
          <CollapsibleTrigger className="flex-1 text-left min-w-0">
            {editMode ? (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  <span className="font-semibold">{stepIndex + 1}.</span> {step}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {stepPhotos.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Camera className="w-3 h-3 mr-1" />
                      {stepPhotos.length}
                    </Badge>
                  )}
                  {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </div>
            )}
          </CollapsibleTrigger>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {canMoveUp && (
              <button
                onClick={() => onMoveUp(stepIndex)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Move up"
              >
                <ChevronUpIcon className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {canMoveDown && (
              <button
                onClick={() => onMoveDown(stepIndex)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Move down"
              >
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <button
              onClick={() => setEditMode(true)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onDelete && onDelete(stepIndex)}
              className="p-1 hover:bg-red-100 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t border-gray-200 pt-3">
            {/* Photos */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Photos:
              </label>
              {stepPhotos.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {stepPhotos.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Step ${stepIndex + 1} photo ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border-2 border-gray-300 cursor-pointer hover:opacity-80"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`step-photo-${stepIndex}`).click()}
                disabled={uploadingPhotos}
                className="gap-2 text-xs"
              >
                {uploadingPhotos ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    Add Photo
                  </>
                )}
              </Button>
              <input
                id={`step-photo-${stepIndex}`}
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Notes:
              </label>
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes about this step..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>

            {/* Completion Info */}
            {isCompleted && completion && (
              <div className="bg-green-100 rounded p-2 text-xs text-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Completed: {new Date(completion.completedAt).toLocaleString()}
                  </span>
                  {completion.timeSpentSeconds && (
                    <span className="ml-auto">
                      ({Math.floor(completion.timeSpentSeconds / 60)} min)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}