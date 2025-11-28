import React, { useState } from "react";
import { SystemBaseline, storage, integrations } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MobileWizardFlow from "./MobileWizardFlow";
import PhotoCaptureStep from "./wizard-steps/PhotoCaptureStep";
import ConditionStep from "./wizard-steps/ConditionStep";
import AgeStep from "./wizard-steps/AgeStep";
import OptionalDetailsStep from "./wizard-steps/OptionalDetailsStep";
import { useDraftSave } from "./useDraftSave";

export default function SystemFormDialogMobile({ 
  open, 
  onClose, 
  propertyId, 
  editingSystem,
  allowsMultiple 
}) {
  const [formData, setFormData] = useState({
    system_type: editingSystem?.system_type || "",
    installation_year: editingSystem?.installation_year || "",
    condition: editingSystem?.condition || "Good",
    brand_model: editingSystem?.brand_model || "",
    nickname: editingSystem?.nickname || "",
    condition_notes: editingSystem?.condition_notes || "",
    last_service_date: editingSystem?.last_service_date || "",
    warranty_info: editingSystem?.warranty_info || "",
    photo_urls: editingSystem?.photo_urls || []
  });
  
  const [photos, setPhotos] = useState(editingSystem?.photo_urls || []);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [aiExtractedYear, setAiExtractedYear] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const draftKey = `baseline-draft-${propertyId}-${formData.system_type}`;
  const { clearDraft } = useDraftSave(draftKey, formData, isDirty);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const submitData = {
        ...data,
        property_id: propertyId,
        installation_year: parseInt(data.installation_year) || null,
        photo_urls: photos,
        is_required: editingSystem?.is_required || false
      };

      if (editingSystem?.id) {
        return SystemBaseline.update(editingSystem.id, submitData);
      } else {
        return SystemBaseline.create(submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
      clearDraft();
      setIsDirty(false);
      toast.success(`${formData.system_type} saved! +10 PropertyIQ Points`, { 
        icon: '🎉', 
        duration: 3000 
      });
      onClose();
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error('Failed to save. Please try again.', { duration: 3000 });
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadToast = toast.loading('Uploading...', { icon: '📸' });

    try {
      const uploadPromises = files.map(file =>
        storage.uploadFile(file)
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setPhotos(prev => [...prev, ...urls]);
      setIsDirty(true);
      
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} added!`, {
        id: uploadToast,
        icon: '✅',
        duration: 2000
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.', {
        id: uploadToast,
        duration: 3000
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSmartScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const scanToast = toast.loading('AI scanning data plate...', { icon: '🤖' });

    try {
      const { file_url } = await storage.uploadFile(file);

      const result = await integrations.InvokeLLM({
        prompt: `Extract information from this ${formData.system_type} photo. Look for model plates, serial numbers, installation dates, and any visible brand/model information. Return ONLY data you can clearly see.`,
        file_urls: file_url,
        response_json_schema: {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            year: { type: "string" },
            notes: { type: "string" }
          }
        }
      });

      if (result) {
        const updates = {};
        if (result.brand || result.model) {
          updates.brand_model = [result.brand, result.model].filter(Boolean).join(' ');
        }
        if (result.year) {
          const yearMatch = result.year.match(/20\d{2}|19\d{2}/);
          if (yearMatch) {
            updates.installation_year = yearMatch[0];
            setAiExtractedYear(yearMatch[0]);
          }
        }

        setFormData(prev => ({ ...prev, ...updates }));
        setPhotos(prev => [...prev, file_url]);
        setIsDirty(true);

        toast.success('Data extracted! Review and adjust as needed.', {
          id: scanToast,
          icon: '✨',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Scan failed. Enter manually or try another photo.', {
        id: scanToast,
        duration: 3000
      });
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
    toast.info('Photo removed', { duration: 1500 });
  };

  const steps = [
    {
      id: 'photo',
      title: 'Add a Photo (Optional)',
      subtitle: 'AI can extract details from data plates',
      component: (
        <PhotoCaptureStep
          photos={photos}
          onUpload={handlePhotoUpload}
          onRemove={handleRemovePhoto}
          uploading={uploading}
          onScan={handleSmartScan}
          scanning={scanning}
          systemType={formData.system_type}
        />
      )
    },
    {
      id: 'condition',
      title: "What's its condition?",
      subtitle: 'Be honest - this helps planning',
      component: (
        <ConditionStep
          value={formData.condition}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, condition: val }));
            setIsDirty(true);
          }}
        />
      )
    },
    {
      id: 'age',
      title: 'How old is it?',
      subtitle: 'Critical for planning replacement',
      component: (
        <AgeStep
          value={formData.installation_year}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, installation_year: val }));
            setIsDirty(true);
          }}
          aiExtractedYear={aiExtractedYear}
          systemType={formData.system_type}
        />
      )
    },
    {
      id: 'details',
      title: 'Extra Details',
      subtitle: 'Add more info if you want',
      component: (
        <OptionalDetailsStep
          formData={formData}
          onChange={(updates) => {
            setFormData(prev => ({ ...prev, ...updates }));
            setIsDirty(true);
          }}
        />
      )
    }
  ];

  if (!open) return null;

  return (
    <MobileWizardFlow
      steps={steps}
      onComplete={() => saveMutation.mutate(formData)}
      onCancel={onClose}
      allowSkip={['photo', 'details']}
      showProgress={true}
    />
  );
}