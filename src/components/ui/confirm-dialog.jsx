import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive" // "destructive" or "default"
}) {
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      console.error('ConfirmDialog: onConfirm prop is required but was not provided');
      onClose();
      return;
    }

    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/75" />
      <DialogContent className="max-w-md bg-white" style={{ backgroundColor: '#FFFFFF' }}>
        <DialogHeader style={{ backgroundColor: '#FFFFFF' }}>
          <DialogTitle className="flex items-center gap-3" style={{ color: '#1B365D' }}>
            {variant === "destructive" && (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={confirming}
            className="flex-1"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#CCCCCC', 
              color: '#333333',
              minHeight: '48px' 
            }}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1"
            style={{ 
              backgroundColor: variant === "destructive" ? '#DC3545' : '#28A745',
              color: '#FFFFFF',
              minHeight: '48px' 
            }}
          >
            {confirming ? 'Processing...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}