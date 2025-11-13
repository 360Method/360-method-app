import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Building, Loader2, CheckCircle2 } from "lucide-react";

export default function DualUnitSelectionModal({ 
  open, 
  onClose, 
  template, 
  property, 
  onConfirm, 
  isCreating 
}) {
  const [selection, setSelection] = React.useState('both');
  
  const units = property?.units || [];
  const unit1 = units[0] || { unit_id: 'main', nickname: 'Main House' };
  const unit2 = units[1] || { unit_id: 'adu', nickname: 'ADU/Suite' };
  
  const taskCount = selection === 'both' ? 2 : 1;

  const handleConfirm = () => {
    onConfirm(selection);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isCreating && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Where Does This Apply?
          </DialogTitle>
          <DialogDescription>
            Task: <strong>{template?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            {/* Option 1: Unit 1 only */}
            <button
              type="button"
              onClick={() => setSelection('unit1')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selection === 'unit1'
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  selection === 'unit1'
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}>
                  {selection === 'unit1' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{unit1.nickname || 'Main House'} only</p>
                  <p className="text-xs text-gray-600">Creates 1 task</p>
                </div>
              </div>
            </button>

            {/* Option 2: Unit 2 only */}
            <button
              type="button"
              onClick={() => setSelection('unit2')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selection === 'unit2'
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  selection === 'unit2'
                    ? "border-purple-600 bg-purple-600"
                    : "border-gray-300"
                }`}>
                  {selection === 'unit2' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{unit2.nickname || 'ADU/Suite'} only</p>
                  <p className="text-xs text-gray-600">Creates 1 task</p>
                </div>
              </div>
            </button>

            {/* Option 3: Both */}
            <button
              type="button"
              onClick={() => setSelection('both')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selection === 'both'
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  selection === 'both'
                    ? "border-green-600 bg-green-600"
                    : "border-gray-300"
                }`}>
                  {selection === 'both' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">Both locations</p>
                  <p className="text-xs text-gray-600">Creates 2 tasks</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
            className="flex-1"
            style={{ minHeight: '48px' }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '48px' }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create {taskCount} Task{taskCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}