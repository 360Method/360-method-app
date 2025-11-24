import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InspectionChecklistModule from '../components/portal/InspectionChecklistModule';
import { 
  Camera, 
  Mic, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  Grid,
  Save,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const INSPECTION_CHECKLIST = [
  {
    name: 'Exterior - Roof',
    items: [
      { name: 'Shingles/Tiles Condition', condition: null, notes: '', photos: [] },
      { name: 'Flashing & Vents', condition: null, notes: '', photos: [] },
      { name: 'Gutters & Downspouts', condition: null, notes: '', photos: [] },
      { name: 'Chimney (if applicable)', condition: null, notes: '', photos: [] }
    ]
  },
  {
    name: 'Exterior - Siding & Foundation',
    items: [
      { name: 'Siding Condition', condition: null, notes: '', photos: [] },
      { name: 'Foundation Cracks', condition: null, notes: '', photos: [] },
      { name: 'Window Caulking', condition: null, notes: '', photos: [] },
      { name: 'Door Seals', condition: null, notes: '', photos: [] }
    ]
  },
  {
    name: 'Interior - Kitchen',
    items: [
      { name: 'Plumbing Fixtures', condition: null, notes: '', photos: [] },
      { name: 'Appliances', condition: null, notes: '', photos: [] },
      { name: 'Ventilation', condition: null, notes: '', photos: [] },
      { name: 'Cabinetry', condition: null, notes: '', photos: [] }
    ]
  },
  {
    name: 'Interior - Bathrooms',
    items: [
      { name: 'Toilet Function', condition: null, notes: '', photos: [] },
      { name: 'Sink & Faucets', condition: null, notes: '', photos: [] },
      { name: 'Shower/Tub', condition: null, notes: '', photos: [] },
      { name: 'Tile & Grout', condition: null, notes: '', photos: [] }
    ]
  },
  {
    name: 'Systems - HVAC',
    items: [
      { name: 'Filter Condition', condition: null, notes: '', photos: [] },
      { name: 'Thermostat Function', condition: null, notes: '', photos: [] },
      { name: 'Air Flow', condition: null, notes: '', photos: [] },
      { name: 'Unusual Sounds', condition: null, notes: '', photos: [] }
    ]
  }
];

export default function OperatorInspection() {
  const [checklist, setChecklist] = useState(INSPECTION_CHECKLIST);
  const [showItemJump, setShowItemJump] = useState(false);

  // Mock property data
  const property = {
    address: '123 Oak Street',
    client_name: 'Sarah Johnson',
    inspection_type: 'Quarterly Inspection'
  };

  const handleUpdateItem = (roomIndex, itemIndex, updates) => {
    setChecklist(prev => {
      const newChecklist = [...prev];
      newChecklist[roomIndex].items[itemIndex] = {
        ...newChecklist[roomIndex].items[itemIndex],
        ...updates
      };
      return newChecklist;
    });
  };

  const handleCapturePhoto = (roomIndex, itemIndex) => {
    // In production, open camera
    toast.info('Camera functionality would open here');
  };

  const handleComplete = () => {
    toast.success('Inspection completed! Generating report...');
    // Navigate to report builder
  };

  const handleSaveProgress = () => {
    toast.success('Progress saved');
  };

  const getCompletionStats = () => {
    const total = checklist.reduce((sum, room) => sum + room.items.length, 0);
    const completed = checklist.reduce((sum, room) => 
      sum + room.items.filter(item => item.condition).length, 0
    );
    return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const stats = getCompletionStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="font-bold text-gray-900">{property.address}</div>
              <div className="text-sm text-gray-600">{property.client_name}</div>
              <div className="text-xs text-gray-500">{property.inspection_type}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.percentage)}%
              </div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Content */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <InspectionChecklistModule
          checklist={checklist}
          onUpdateItem={handleUpdateItem}
          onCapturePhoto={handleCapturePhoto}
          onComplete={handleComplete}
        />
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveProgress}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Progress
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowItemJump(!showItemJump)}
              className="gap-2"
            >
              <Grid className="w-4 h-4" />
              Jump to Item
            </Button>
            {stats.percentage === 100 && (
              <Button
                onClick={handleComplete}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                Generate Report
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Item Jump Grid */}
      {showItemJump && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Jump to Item</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowItemJump(false)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-4">
              {checklist.map((room, roomIdx) => (
                <div key={roomIdx}>
                  <div className="font-semibold text-gray-900 mb-2">{room.name}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {room.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          document.getElementById(`room-${roomIdx}`)?.scrollIntoView({ behavior: 'smooth' });
                          setShowItemJump(false);
                        }}
                        className={`p-3 rounded-lg text-left text-sm transition-colors ${
                          item.condition
                            ? 'bg-green-50 border-2 border-green-500 text-green-900'
                            : 'bg-gray-100 border-2 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="font-medium line-clamp-2">{item.name}</div>
                        {item.condition && (
                          <div className="text-xs mt-1">{item.condition}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}