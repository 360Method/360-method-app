import { jsPDF } from 'jspdf';

/**
 * Generates a downloadable PDF checklist from guide checklist data
 *
 * @param {Object} checklistData - The checklist data from resource_guides.checklist_data
 * @param {string} checklistData.title - The checklist title
 * @param {Array} checklistData.sections - Array of sections with name and items
 * @param {string} guideTitle - The parent guide title for reference
 */
export function generateChecklistPDF(checklistData, guideTitle = '') {
  if (!checklistData || !checklistData.sections) {
    console.error('Invalid checklist data provided');
    return null;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Colors
  const primaryColor = [59, 130, 246]; // Blue-500
  const textColor = [31, 41, 55]; // Gray-800
  const mutedColor = [107, 114, 128]; // Gray-500
  const checkboxColor = [209, 213, 219]; // Gray-300

  // Helper function to add new page if needed
  const checkPageBreak = (neededSpace = 20) => {
    if (yPosition + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to draw checkbox
  const drawCheckbox = (x, y, size = 4) => {
    doc.setDrawColor(...checkboxColor);
    doc.setLineWidth(0.3);
    doc.rect(x, y, size, size);
  };

  // ============================================
  // HEADER
  // ============================================

  // Brand header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 12, 'F');

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('360° METHOD', margin, 8);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Proactive Home Care', pageWidth - margin, 8, { align: 'right' });

  yPosition = 22;

  // ============================================
  // TITLE
  // ============================================

  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');

  // Handle long titles with word wrap
  const titleLines = doc.splitTextToSize(checklistData.title, contentWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += (titleLines.length * 8) + 2;

  // Subtitle with guide reference
  if (guideTitle) {
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    const subtitleText = `From: ${guideTitle}`;
    doc.text(subtitleText, margin, yPosition);
    yPosition += 6;
  }

  // Date line
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  const dateText = `Date: ____________________    Property: ____________________`;
  doc.text(dateText, margin, yPosition);
  yPosition += 10;

  // Separator line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // ============================================
  // SECTIONS & ITEMS
  // ============================================

  checklistData.sections.forEach((section, sectionIndex) => {
    // Check if we need a new page for section header + at least 2 items
    checkPageBreak(30);

    // Section header
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.rect(margin, yPosition - 4, contentWidth, 8, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.name.toUpperCase(), margin + 2, yPosition);
    yPosition += 8;

    // Section items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    section.items.forEach((item, itemIndex) => {
      checkPageBreak(8);

      // Draw checkbox
      drawCheckbox(margin, yPosition - 3);

      // Item text with word wrap
      const itemLines = doc.splitTextToSize(item, contentWidth - 10);
      doc.text(itemLines, margin + 7, yPosition);

      yPosition += (itemLines.length * 5) + 3;
    });

    // Space between sections
    yPosition += 5;
  });

  // ============================================
  // NOTES SECTION
  // ============================================

  checkPageBreak(40);

  yPosition += 5;
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPosition - 4, contentWidth, 8, 'F');

  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTES', margin + 2, yPosition);
  yPosition += 10;

  // Note lines
  doc.setDrawColor(...checkboxColor);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 5; i++) {
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 7;
  }

  // ============================================
  // FOOTER
  // ============================================

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer separator
    doc.setDrawColor(...checkboxColor);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    // Disclaimer
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'This checklist is for educational purposes. Consult licensed professionals for repairs or safety concerns.';
    doc.text(disclaimer, margin, pageHeight - 13);

    // Page number
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 13, { align: 'right' });

    // Website
    doc.setTextColor(...primaryColor);
    doc.text('360method.com', pageWidth / 2, pageHeight - 13, { align: 'center' });
  }

  return doc;
}

/**
 * Generates and triggers download of the checklist PDF
 *
 * @param {Object} checklistData - The checklist data from resource_guides.checklist_data
 * @param {string} guideTitle - The parent guide title for reference
 * @param {string} filename - Optional custom filename (without .pdf extension)
 */
export function downloadChecklist(checklistData, guideTitle = '', filename = null) {
  const doc = generateChecklistPDF(checklistData, guideTitle);

  if (!doc) {
    console.error('Failed to generate PDF');
    return false;
  }

  // Generate filename from checklist title if not provided
  const pdfFilename = filename
    ? `${filename}.pdf`
    : `${checklistData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;

  doc.save(pdfFilename);
  return true;
}

/**
 * Generates a Blob URL for the checklist PDF (for preview/embed)
 *
 * @param {Object} checklistData - The checklist data from resource_guides.checklist_data
 * @param {string} guideTitle - The parent guide title for reference
 * @returns {string|null} Blob URL or null if generation failed
 */
export function getChecklistBlobUrl(checklistData, guideTitle = '') {
  const doc = generateChecklistPDF(checklistData, guideTitle);

  if (!doc) {
    return null;
  }

  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
