import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Camera, 
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

const CONDITION_OPTIONS = [
  { value: 'Good', color: 'bg-green-500', textColor: 'text-green-700', label: 'Good' },
  { value: 'Flag', color: 'bg-yellow-500', textColor: 'text-yellow-700', label: 'Flag' },
  { value: 'Urgent', color: 'bg-red-500', textColor: 'text-red-700', label: 'Urgent' }
];

export default function InspectionChecklistModule({ 
  checklist, 
  onUpdateItem, 
  onCapturePhoto,
  onComplete 
}) {
  const [expandedRooms, setExpandedRooms] = useState({});

  const toggleRoom = (roomName) => {
    setExpandedRooms(prev => ({ ...prev, [roomName]: !prev[roomName] }));
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
    <div className="space-y-4">
      {/* Progress Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-gray-900">Inspection Progress</div>
            <div className="text-sm text-gray-600">
              {stats.completed} of {stats.total} items completed
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(stats.percentage)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </Card>

      {/* Room Checklists */}
      {checklist.map((room, roomIndex) => {
        const isExpanded = expandedRooms[room.name];
        const roomCompleted = room.items.filter(item => item.condition).length;
        const roomTotal = room.items.length;
        const roomPercentage = roomTotal > 0 ? (roomCompleted / roomTotal) * 100 : 0;

        return (
          <Card key={roomIndex}>
            <button
              onClick={() => toggleRoom(room.name)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{room.name}</div>
                  <div className="text-sm text-gray-600">
                    {roomCompleted}/{roomTotal} items
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-600">
                  {Math.round(roomPercentage)}%
                </div>
                {roomPercentage === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : roomPercentage > 0 ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 relative">
                    <div 
                      className="absolute inset-0 bg-blue-500 rounded-full origin-center"
                      style={{ 
                        clipPath: `polygon(50% 50%, 50% 0%, ${roomPercentage > 50 ? '100%' : '50%'} 0%, ${
                          roomPercentage > 50 ? '100%' : 50 + (roomPercentage * 0.5)
                        }% ${roomPercentage > 50 ? (roomPercentage - 50) * 2 : 0}%, 50% 50%)`
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-200">
                {room.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="space-y-3">
                      {/* Item Name */}
                      <div className="font-medium text-gray-900">{item.name}</div>

                      {/* Condition Selector */}
                      <div className="flex gap-2">
                        {CONDITION_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            onClick={() => onUpdateItem(roomIndex, itemIndex, { condition: option.value })}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                              item.condition === option.value
                                ? `${option.color} border-transparent text-white`
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="text-sm font-medium">{option.label}</div>
                          </button>
                        ))}
                      </div>

                      {/* Notes Field */}
                      {item.condition && item.condition !== 'Good' && (
                        <textarea
                          placeholder="Add notes about this issue..."
                          value={item.notes || ''}
                          onChange={(e) => onUpdateItem(roomIndex, itemIndex, { notes: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none resize-none"
                          rows="2"
                        />
                      )}

                      {/* Photo Button */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCapturePhoto(roomIndex, itemIndex)}
                          className="gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          {item.photos?.length > 0 ? `${item.photos.length} Photos` : 'Add Photo'}
                        </Button>
                        {item.condition === 'Urgent' && (
                          <Badge className="bg-red-100 text-red-700 gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Requires Attention
                          </Badge>
                        )}
                        {item.condition === 'Flag' && (
                          <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Monitor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Complete Button */}
      {stats.percentage === 100 && (
        <Button
          onClick={onComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
          size="lg"
        >
          <CheckCircle className="w-5 h-5" />
          Complete Inspection
        </Button>
      )}
    </div>
  );
}