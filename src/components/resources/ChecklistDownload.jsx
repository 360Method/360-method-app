import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadChecklist } from '@/utils/generateChecklist';

/**
 * Checklist download button component
 *
 * @param {Object} checklistData - The checklist data from resource_guides.checklist_data
 * @param {string} guideTitle - The parent guide title
 * @param {string} variant - Button variant (default, outline, ghost)
 * @param {string} size - Button size (default, sm, lg)
 */
export function ChecklistDownload({
  checklistData,
  guideTitle,
  variant = 'default',
  size = 'default',
  className = ''
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!checklistData) return;

    setIsGenerating(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const success = downloadChecklist(checklistData, guideTitle);
      if (!success) {
        console.error('Failed to generate checklist');
      }
    } catch (error) {
      console.error('Error downloading checklist:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!checklistData) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Checklist (PDF)
        </>
      )}
    </Button>
  );
}

/**
 * Inline checklist download card
 */
export function ChecklistDownloadCard({ checklistData, guideTitle }) {
  if (!checklistData) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{checklistData.title}</p>
          <p className="text-sm text-muted-foreground">
            Printable PDF with {checklistData.sections?.length || 0} sections
          </p>
        </div>
      </div>

      <ChecklistDownload
        checklistData={checklistData}
        guideTitle={guideTitle}
        variant="default"
        size="sm"
      />
    </div>
  );
}

export default ChecklistDownload;
