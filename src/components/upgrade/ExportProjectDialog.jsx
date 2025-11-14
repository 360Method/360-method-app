import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer, Mail } from 'lucide-react';

export default function ExportProjectDialog({ project, property, isOpen, onClose }) {
  const [exporting, setExporting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const handleExportPDF = () => {
    setExporting(true);
    
    try {
      // Generate printable HTML version
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${project.title} - Project Details</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1 { color: #1B365D; margin-bottom: 10px; }
    h2 { color: #1B365D; margin-top: 30px; border-bottom: 2px solid #1B365D; padding-bottom: 5px; }
    .section { margin-bottom: 30px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { margin-bottom: 10px; }
    .label { font-weight: bold; color: #666; }
    .milestone { border-left: 3px solid #ddd; padding-left: 15px; margin-bottom: 15px; }
    .milestone.completed { border-color: #28A745; }
    .milestone.in-progress { border-color: #FF6B35; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px; }
    .badge-status { background: #E3F2FD; color: #1976D2; }
    .badge-category { background: #F3E5F5; color: #7B1FA2; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #1B365D; color: white; border: none; border-radius: 5px; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <h1>${project.title}</h1>
  <div style="margin-bottom: 20px;">
    <span class="badge badge-category">${project.category}</span>
    <span class="badge badge-status">${project.status}</span>
  </div>

  <div class="section">
    <h2>Property Information</h2>
    <div class="info-item">
      <span class="label">Address:</span> ${property?.address || 'N/A'}
    </div>
    ${property?.zip_code ? `<div class="info-item"><span class="label">Zip Code:</span> ${property.zip_code}</div>` : ''}
  </div>

  <div class="section">
    <h2>Project Overview</h2>
    ${project.description ? `<p>${project.description}</p>` : '<p>No description provided</p>'}
  </div>

  <div class="section">
    <h2>Financial Summary</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">Investment Required:</span><br>
        $${project.investment_required?.toLocaleString() || '0'}
      </div>
      <div class="info-item">
        <span class="label">Expected Value Increase:</span><br>
        $${project.property_value_impact?.toLocaleString() || '0'}
      </div>
      <div class="info-item">
        <span class="label">Net Equity Gain:</span><br>
        $${((project.property_value_impact || 0) - (project.investment_required || 0)).toLocaleString()}
      </div>
      <div class="info-item">
        <span class="label">ROI:</span><br>
        ${project.investment_required > 0 ? Math.round((project.property_value_impact / project.investment_required) * 100) : 0}%
      </div>
    </div>
    ${project.annual_savings > 0 ? `
      <div class="info-item" style="margin-top: 15px; padding: 10px; background: #E8F5E9; border-radius: 5px;">
        <span class="label">Annual Savings:</span> $${project.annual_savings.toLocaleString()}/year
      </div>
    ` : ''}
  </div>

  ${project.milestones && project.milestones.length > 0 ? `
  <div class="section">
    <h2>Project Milestones</h2>
    <p style="color: #666; margin-bottom: 15px;">
      Progress: ${project.milestones.filter(m => m.status === 'Completed').length} / ${project.milestones.length} completed
    </p>
    ${project.milestones.map((m, i) => `
      <div class="milestone ${m.status === 'Completed' ? 'completed' : m.status === 'In Progress' ? 'in-progress' : ''}">
        <div style="font-weight: bold; margin-bottom: 5px;">
          ${m.status === 'Completed' ? '✓' : m.status === 'In Progress' ? '🔨' : '○'} 
          ${i + 1}. ${m.title}
        </div>
        ${m.description ? `<p style="margin: 5px 0; color: #666;">${m.description}</p>` : ''}
        <div style="font-size: 12px; color: #999;">Status: ${m.status}</div>
        ${m.completed_date ? `<div style="font-size: 12px; color: #28A745;">Completed: ${new Date(m.completed_date).toLocaleDateString()}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${project.current_state || project.upgraded_state ? `
  <div class="section">
    <h2>Before & After</h2>
    ${project.current_state ? `
      <div class="info-item">
        <span class="label">Current State:</span><br>
        ${project.current_state}
      </div>
    ` : ''}
    ${project.upgraded_state ? `
      <div class="info-item">
        <span class="label">Target State:</span><br>
        ${project.upgraded_state}
      </div>
    ` : ''}
  </div>
  ` : ''}

  ${project.notes ? `
  <div class="section">
    <h2>Additional Notes</h2>
    <p>${project.notes}</p>
  </div>
  ` : ''}

  <div class="section" style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 12px;">
    Generated from 360° Method • ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      console.log('✅ Export window opened');
      onClose();

    } catch (error) {
      console.error('❌ Error exporting:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleEmailToSelf = async () => {
    if (!user?.email) {
      alert('Unable to send email - user email not found');
      return;
    }

    setExporting(true);

    try {
      const emailBody = `
Your upgrade project details:

Project: ${project.title}
Category: ${project.category}
Property: ${property?.address || 'N/A'}
Budget: $${project.investment_required?.toLocaleString() || '0'}

${project.description || ''}

View full details: ${shareableLink}
      `.trim();

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Your Project: ${project.title}`,
        body: emailBody
      });

      console.log('✅ Email sent to self');
      alert('Project details sent to your email!');
      onClose();

    } catch (error) {
      console.error('❌ Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Project Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Export as PDF / Print */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">Print / Save as PDF</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Complete project details with milestones
                </p>
              </div>
              <Printer className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </button>

          {/* Email to Self */}
          <button
            onClick={handleEmailToSelf}
            disabled={exporting}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">Email to Myself</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Send summary to {user?.email || 'your email'}
                </p>
              </div>
            </div>
          </button>

          {/* What's Included */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📋 Export Includes:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Project summary and description</li>
              <li>✓ Budget and financial details</li>
              <li>✓ Complete milestone list with guidance</li>
              <li>✓ Property information</li>
              <li>✓ Timeline and status</li>
              <li>✓ Before/after descriptions</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}