import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useDraftSave(key, formData, isDirty) {
  const [hasDraft, setHasDraft] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(key);
    if (draft) {
      setHasDraft(true);
    }
  }, [key]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isDirty) return;

    const interval = setInterval(() => {
      localStorage.setItem(key, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));
      toast.success('Draft saved', { duration: 1500 });
    }, 30000);

    return () => clearInterval(interval);
  }, [key, formData, isDirty]);

  const restoreDraft = () => {
    const draft = localStorage.getItem(key);
    if (draft) {
      const parsed = JSON.parse(draft);
      setHasDraft(false);
      return parsed.data;
    }
    return null;
  };

  const clearDraft = () => {
    localStorage.removeItem(key);
    setHasDraft(false);
  };

  const getDraftTimestamp = () => {
    const draft = localStorage.getItem(key);
    if (draft) {
      const parsed = JSON.parse(draft);
      return new Date(parsed.timestamp);
    }
    return null;
  };

  return { hasDraft, restoreDraft, clearDraft, getDraftTimestamp };
}