import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, Edit2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorReportBuilder() {
  const [editMode, setEditMode] = useState(false);
  const [report, setReport] = useState({
    property_address: '123 Oak Street',
    client_name: 'Sarah Johnson',
    inspection_date: new Date().toISOString(),
    summary: 'Overall property condition is good with minor maintenance items identified. All critical systems are functioning properly.',
    findings: [
      {
        area: 'Exterior - Roof',
        items: [
          { name: 'Shingles', condition: 'Good', notes: 'No visible damage', photos: [] },
          { name: 'Gutters', condition: 'Monitor', notes: 'Minor debris, recommend cleaning', photos: [] }
        ]
      },
      {
        area: 'Systems - HVAC',
        items: [
          { name: 'Filter', condition: 'Repair Needed', notes: 'Filter needs replacement', photos: [] },
          { name: 'Thermostat', condition: 'Good', notes: 'Functioning properly', photos: [] }
        ]
      }
    ],
    recommendations: [
      { priority: 'High', item: 'Replace HVAC filter', cost: 50, notes: 'Should be done within 1 week' },
      { priority: 'Medium', item: 'Clean gutters', cost: 150, notes: 'Before next rainy season' }
    ],
    health_score: 87
  });

  const handleSendReport = () => {
    toast.success('Report sent to client successfully');
  };

  const getConditionColor = (condition) => {
    switch(condition) {
      case 'Good': return 'bg-green-100 text-green-700';
      case 'Monitor': return 'bg-yellow-100 text-yellow-700';
      case 'Repair Needed': return 'bg-orange-100 text-orange-700';
      case 'Urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspection Report</h1>
            <p className="text-gray-600">
              {report.property_address} • {new Date(report.inspection_date).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            <Edit2 className="w-4 h-4 mr-2" />
            {editMode ? 'Done Editing' : 'Edit Report'}
          </Button>
        </div>

        {/* Executive Summary */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Executive Summary</h2>
            <Badge className="bg-blue-100 text-blue-700 text-lg px-4 py-2">
              Score: {report.health_score}
            </Badge>
          </div>
          {editMode ? (
            <textarea
              value={report.summary}
              onChange={(e) => setReport({ ...report, summary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows="3"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{report.summary}</p>
          )}
        </Card>

        {/* Findings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Inspection Findings</h2>
          <div className="space-y-6">
            {report.findings.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="font-semibold text-gray-900 mb-3">{section.area}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <Badge className={getConditionColor(item.condition)}>
                            {item.condition}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-3">
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} Priority
                    </Badge>
                    <span className="font-semibold text-gray-900">{rec.item}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.notes}</p>
                  <div className="text-sm font-semibold text-gray-900">
                    Est. Cost: ${rec.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button onClick={handleSendReport} className="flex-1 gap-2">
            <Send className="w-4 h-4" />
            Send to Client
          </Button>
        </div>
      </div>
    </div>
  );
}