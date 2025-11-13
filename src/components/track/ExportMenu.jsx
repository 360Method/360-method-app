import React from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function ExportMenu({ 
  timelineItems, 
  metrics, 
  systems, 
  property,
  aiInsights 
}) {

  // Generate CSV for timeline
  const exportCSV = () => {
    if (timelineItems.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Type', 'Title', 'Category', 'Cost', 'Hours', 'Status', 'Notes'];
    
    const rows = timelineItems.map(item => {
      const task = item.data;
      return [
        format(item.date, 'yyyy-MM-dd'),
        item.type,
        item.title,
        item.category,
        item.cost || 0,
        task.actual_hours || 0,
        task.status || 'Completed',
        task.completion_notes || task.resolution_notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${property?.address || 'property'}-timeline-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate Excel-formatted CSV (with summary sheet data)
  const exportExcel = () => {
    if (!metrics) {
      alert('No metrics to export');
      return;
    }

    const summaryHeaders = ['Metric', 'Value'];
    const summaryRows = [
      ['Total Saved', `$${metrics.totalSavings.toLocaleString()}`],
      ['ROI Percentage', `${metrics.roi}%`],
      ['Total Spent', `$${metrics.totalSpent.toLocaleString()}`],
      ['Total Hours', `${metrics.totalHours.toFixed(1)}`],
      ['Tasks Completed', metrics.tasksCompleted],
      ['Disasters Prevented', metrics.disastersPrevented],
      ['Would Have Cost', `$${metrics.wouldHaveCost.toLocaleString()}`],
      ['DIY Tasks', metrics.diyTasks],
      ['DIY Savings', `$${metrics.diySavings.toLocaleString()}`],
      ['Inspection Fixes', metrics.inspectionFixes],
      ['Inspection Savings', `$${metrics.inspectionSavings.toLocaleString()}`],
      ['Effective Rate', `$${metrics.effectiveRate}/hr`],
      ['', ''], // Empty row
      ['Date Exported', format(new Date(), 'yyyy-MM-dd HH:mm')]
    ];

    const timelineHeaders = ['Date', 'Type', 'Title', 'Category', 'Cost', 'Hours', 'Execution Method', 'Notes'];
    const timelineRows = timelineItems.map(item => {
      const task = item.data;
      return [
        format(item.date, 'yyyy-MM-dd'),
        item.type,
        item.title,
        item.category,
        item.cost || 0,
        task.actual_hours || 0,
        task.execution_method || '',
        task.completion_notes || task.resolution_notes || ''
      ];
    });

    const csvContent = [
      '=== PROPERTY MAINTENANCE REPORT ===',
      `Property: ${property?.address || 'Unknown'}`,
      `Generated: ${format(new Date(), 'MMMM d, yyyy')}`,
      '',
      '=== SUMMARY METRICS ===',
      summaryHeaders.join(','),
      ...summaryRows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '',
      '=== TIMELINE DETAILS ===',
      timelineHeaders.join(','),
      ...timelineRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${property?.address || 'property'}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate PDF (using print-friendly HTML)
  const exportPDF = () => {
    if (!metrics) {
      alert('No data to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Property Maintenance Report - ${property?.address || 'Property'}</title>
  <style>
    @media print {
      @page {
        margin: 0.5in;
        size: letter;
      }
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #10b981;
    }
    
    .header h1 {
      color: #1B365D;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    
    .header .property-info {
      font-size: 18px;
      color: #6b7280;
      margin: 5px 0;
    }
    
    .header .date {
      font-size: 14px;
      color: #9ca3af;
    }
    
    .hero-metric {
      background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
      border: 3px solid #10b981;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .hero-metric .big-number {
      font-size: 48px;
      font-weight: bold;
      color: #15803d;
      margin: 10px 0;
    }
    
    .hero-metric .label {
      font-size: 20px;
      color: #16a34a;
      font-weight: 600;
    }
    
    .hero-metric .roi {
      display: inline-block;
      background: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      color: #15803d;
      margin-top: 10px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      border: 2px solid;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    
    .metric-card.disasters {
      background: #fef2f2;
      border-color: #fecaca;
    }
    
    .metric-card.tasks {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    
    .metric-card.spent {
      background: #faf5ff;
      border-color: #e9d5ff;
    }
    
    .metric-card.time {
      background: #fff7ed;
      border-color: #fed7aa;
    }
    
    .metric-card .number {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .metric-card .label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .metric-card .sublabel {
      font-size: 11px;
      margin-top: 5px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #1B365D;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .timeline-item {
      border-left: 3px solid #3b82f6;
      padding-left: 15px;
      margin-bottom: 20px;
    }
    
    .timeline-item .date {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
    }
    
    .timeline-item .title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 5px 0;
    }
    
    .timeline-item .details {
      font-size: 13px;
      color: #4b5563;
    }
    
    .timeline-item .cost {
      font-size: 14px;
      font-weight: bold;
      color: #059669;
      margin-top: 5px;
    }
    
    .top-wins {
      background: #fffbeb;
      border: 2px solid #fcd34d;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .top-wins .win-item {
      display: flex;
      justify-content: space-between;
      align-items: start;
      padding: 12px;
      margin-bottom: 10px;
      background: white;
      border-radius: 6px;
      border: 1px solid #fde68a;
    }
    
    .top-wins .win-rank {
      background: #f59e0b;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
      margin-right: 12px;
    }
    
    .top-wins .win-savings {
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 13px;
      white-space: nowrap;
    }
    
    .ai-insights {
      background: #faf5ff;
      border: 2px solid #e9d5ff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .ai-insights .insight-section {
      margin-bottom: 15px;
    }
    
    .ai-insights h3 {
      font-size: 16px;
      font-weight: bold;
      color: #7c3aed;
      margin-bottom: 10px;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print to PDF</button>
  
  <div class="header">
    <h1>🏆 Property Maintenance Report</h1>
    <div class="property-info">${property?.address || 'Property'}</div>
    <div class="date">Generated on ${format(new Date(), 'MMMM d, yyyy')}</div>
  </div>

  ${metrics ? `
  <div class="hero-metric">
    <div class="label">Total Saved This Year</div>
    <div class="big-number">$${metrics.totalSavings.toLocaleString()}</div>
    <div class="roi">↑ ${metrics.roi}% ROI</div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card disasters">
      <div class="label">Disasters Prevented</div>
      <div class="number" style="color: #dc2626;">${metrics.disastersPrevented}</div>
      <div class="sublabel" style="color: #ef4444;">Would've cost $${metrics.wouldHaveCost.toLocaleString()}</div>
    </div>
    
    <div class="metric-card tasks">
      <div class="label">Tasks Completed</div>
      <div class="number" style="color: #2563eb;">${metrics.tasksCompleted}</div>
      <div class="sublabel" style="color: #3b82f6;">${metrics.inspectionFixes} fixed immediately</div>
    </div>
    
    <div class="metric-card spent">
      <div class="label">Spent on Maintenance</div>
      <div class="number" style="color: #7c3aed;">$${metrics.totalSpent.toLocaleString()}</div>
      <div class="sublabel" style="color: #a855f7;">${metrics.diyTasks} DIY saved $${metrics.diySavings.toLocaleString()}</div>
    </div>
    
    <div class="metric-card time">
      <div class="label">Time Invested</div>
      <div class="number" style="color: #ea580c;">${metrics.totalHours.toFixed(1)}h</div>
      <div class="sublabel" style="color: #f97316;">$${metrics.effectiveRate}/hr effective rate</div>
    </div>
  </div>
  ` : ''}

  ${timelineItems.length > 0 ? `
  <div class="section page-break">
    <h2 class="section-title">📅 Maintenance Timeline</h2>
    ${timelineItems.slice(0, 20).map(item => `
      <div class="timeline-item">
        <div class="date">${format(item.date, 'MMM d, yyyy')}</div>
        <div class="title">${item.title}</div>
        <div class="details">${item.category} • ${item.type}</div>
        ${item.cost > 0 ? `<div class="cost">Cost: $${item.cost.toLocaleString()}</div>` : ''}
        ${item.data.resolution_notes ? `<div class="details">${item.data.resolution_notes}</div>` : ''}
      </div>
    `).join('')}
    ${timelineItems.length > 20 ? `<p style="text-align: center; color: #6b7280; margin-top: 20px;">... and ${timelineItems.length - 20} more events (see full export for complete list)</p>` : ''}
  </div>
  ` : ''}

  ${aiInsights ? `
  <div class="ai-insights page-break">
    <h2 class="section-title">🤖 AI-Powered Insights</h2>
    
    ${aiInsights.overall_assessment ? `
    <div class="insight-section">
      <h3>Overall Assessment</h3>
      <p>${aiInsights.overall_assessment}</p>
    </div>
    ` : ''}
    
    ${aiInsights.top_risks?.length > 0 ? `
    <div class="insight-section">
      <h3>⚠️ Top Risks</h3>
      ${aiInsights.top_risks.map(risk => `
        <div style="margin-bottom: 12px; padding: 10px; background: white; border-left: 4px solid ${risk.risk_level === 'HIGH' ? '#ef4444' : risk.risk_level === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}; border-radius: 4px;">
          <strong>${risk.system}</strong> - ${risk.risk_level} RISK<br/>
          <span style="font-size: 13px;">${risk.reason}</span><br/>
          <span style="font-size: 13px;"><strong>Action:</strong> ${risk.action}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${aiInsights.spending_forecast ? `
    <div class="insight-section">
      <h3>💰 Spending Forecast</h3>
      <p><strong>Next 12 Months:</strong> $${aiInsights.spending_forecast.next_12_months_estimate?.toLocaleString()}</p>
      <p><strong>Monthly Average:</strong> $${aiInsights.spending_forecast.monthly_average_forecast?.toLocaleString()}</p>
      <p>${aiInsights.spending_forecast.explanation}</p>
    </div>
    ` : ''}
    
    ${aiInsights.cost_optimization?.length > 0 ? `
    <div class="insight-section">
      <h3>💡 Cost Optimization Tips</h3>
      <ul>
        ${aiInsights.cost_optimization.map(tip => `
          <li><strong>${tip.tip}</strong> - Save: ${tip.potential_savings}</li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>Generated by 360° Method Property Maintenance Platform</p>
    <p>Report Date: ${format(new Date(), 'MMMM d, yyyy • h:mm a')}</p>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-trigger print dialog after content loads
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          style={{ minHeight: '44px' }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
          <File className="w-4 h-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}