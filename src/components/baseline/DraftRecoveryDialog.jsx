import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function DraftRecoveryDialog({ open, onRestore, onDiscard, timestamp }) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onDiscard()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            Resume Where You Left Off?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Draft Found</p>
              <p className="text-xs text-blue-700">
                Last saved {format(timestamp, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            We found an unsaved draft from your last session. Would you like to continue where you left off?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onRestore}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '48px' }}
          >
            <RotateCcw className="w-4 h-4" />
            Resume Draft
          </Button>
          <Button
            onClick={onDiscard}
            variant="outline"
            className="w-full gap-2"
            style={{ minHeight: '48px' }}
          >
            <Trash2 className="w-4 h-4" />
            Start Fresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}