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
  variant = "destructive" // "destructive", "warning", or "default"
}) {
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = async () => {
    if (!onConfirm || typeof onConfirm !== 'function') {
      console.error('ConfirmDialog: onConfirm prop is required and must be a function');
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
      return;
    }

    setConfirming(true);
    try {
      await onConfirm();
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('ConfirmDialog action failed:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case "destructive":
        return { bg: "bg-red-100", icon: "text-red-600", button: "#DC3545" };
      case "warning":
        return { bg: "bg-orange-100", icon: "text-orange-600", button: "#FF6B35" };
      default:
        return { bg: "bg-blue-100", icon: "text-blue-600", button: "#28A745" };
    }
  };

  const colors = getVariantColor();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/75" />
      <DialogContent className="max-w-md bg-white" style={{ backgroundColor: '#FFFFFF' }}>
        <DialogHeader style={{ backgroundColor: '#FFFFFF' }}>
          <DialogTitle className="flex items-center gap-3" style={{ color: '#1B365D' }}>
            <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
            </div>
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
            onClick={handleClose}
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
            disabled={confirming || !onConfirm}
            className="flex-1"
            style={{ 
              backgroundColor: colors.button,
              color: '#FFFFFF',
              minHeight: '48px',
              opacity: !onConfirm ? 0.5 : 1
            }}
          >
            {confirming ? 'Processing...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}