import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default" // 'default', 'destructive', 'warning'
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!open) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          bg: 'bg-red-50',
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          icon: <AlertCircle className="w-8 h-8 text-orange-600" />,
          button: 'bg-orange-600 hover:bg-orange-700 text-white'
        };
      default:
        return {
          bg: 'bg-blue-50',
          icon: <Info className="w-8 h-8 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/75"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        style={{ zIndex: 101 }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`${styles.bg} rounded-full p-2 flex-shrink-0`}>
            {styles.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isLoading}
            style={{ minHeight: '44px' }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={styles.button}
            style={{ minHeight: '44px' }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}