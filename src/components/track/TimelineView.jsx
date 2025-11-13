import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TYPE_BADGES = {
  task: { label: 'Task', color: 'bg-blue-100 text-blue-800' },
  inspection: { label: 'Inspection', color: 'bg-purple-100 text-purple-800' },
  upgrade: { label: 'Upgrade', color: 'bg-green-100 text-green-800' },
  system: { label: 'System', color: 'bg-gray-100 text-gray-800' }
};

export default function TimelineView({ timelineItems, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  // Get unique types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(timelineItems.map(t => t.type));
    return ['all', ...Array.from(types)];
  }, [timelineItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = [...timelineItems];

    if (typeFilter !== 'all') {
      items = items.filter(t => t.type === typeFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(t =>
        t.title?.toLowerCase().includes(search) ||
        t.data.description?.toLowerCase().includes(search) ||
        t.data.completion_notes?.toLowerCase().includes(search) ||
        t.data.resolution_notes?.toLowerCase().includes(search)
      );
    }

    return items;
  }, [timelineItems, typeFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ minHeight: '48px' }}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger style={{ minHeight: '48px' }}>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {availableTypes.filter(t => t !== 'all').map(type => (
              <SelectItem key={type} value={type}>
                {TYPE_BADGES[type]?.label || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredItems.length} of {timelineItems.length} events
      </div>

      {/* Timeline */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events found matching your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => (
            <Card 
              key={`${item.type}-${item.data.id || idx}`}
              className="cursor-pointer hover:shadow-md transition"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <Badge variant="outline" className={`text-xs ${TYPE_BADGES[item.type]?.color || ''}`}>
                        {TYPE_BADGES[item.type]?.label || item.type}
                      </Badge>
                      {item.data.resolved_during_inspection && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Inspection Fix
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <span>{format(item.date, 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                      {item.data.execution_method && (
                        <>
                          <span>•</span>
                          <span>{item.data.execution_method}</span>
                        </>
                      )}
                    </div>

                    {item.data.resolution_notes && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.data.resolution_notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {item.cost > 0 && (
                        <span className="text-sm font-semibold text-gray-900">
                          ${item.cost.toLocaleString()}
                        </span>
                      )}
                      {item.data.actual_hours > 0 && (
                        <span className="text-sm text-gray-600">
                          {item.data.actual_hours.toFixed(1)}h
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg pr-6">
                {selectedItem.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={TYPE_BADGES[selectedItem.type]?.color}>
                  {TYPE_BADGES[selectedItem.type]?.label}
                </Badge>
                {selectedItem.data.system_type && (
                  <Badge variant="outline">{selectedItem.data.system_type}</Badge>
                )}
                {selectedItem.data.execution_method && (
                  <Badge variant="outline">{selectedItem.data.execution_method}</Badge>
                )}
                {selectedItem.data.resolved_during_inspection && (
                  <Badge className="bg-green-600 text-white">Inspection Fix</Badge>
                )}
              </div>

              {/* Description */}
              {selectedItem.data.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Description</h4>
                  <p className="text-sm text-gray-700">{selectedItem.data.description}</p>
                </div>
              )}

              {/* Resolution notes */}
              {selectedItem.data.resolution_notes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">What Was Done</h4>
                  <p className="text-sm text-gray-700">{selectedItem.data.resolution_notes}</p>
                </div>
              )}

              {/* Completion notes */}
              {selectedItem.data.completion_notes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Completion Notes</h4>
                  <p className="text-sm text-gray-700">{selectedItem.data.completion_notes}</p>
                </div>
              )}

              {/* Cost & Time */}
              {selectedItem.type === 'task' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Cost</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      ${selectedItem.data.actual_cost?.toLocaleString() || '0'}
                    </p>
                    {selectedItem.data.diy_cost && (
                      <p className="text-xs text-gray-600">
                        Est: ${selectedItem.data.diy_cost}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Time</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedItem.data.actual_hours?.toFixed(1) || '0'}h
                    </p>
                    {selectedItem.data.resolution_time_minutes && (
                      <p className="text-xs text-gray-600">
                        {selectedItem.data.resolution_time_minutes} minutes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Completion date */}
              {(selectedItem.data.completion_date || selectedItem.data.inspection_date) && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Completed On</h4>
                  <p className="text-sm text-gray-700">
                    {format(
                      new Date(selectedItem.data.completion_date || selectedItem.data.inspection_date), 
                      'EEEE, MMMM d, yyyy'
                    )}
                  </p>
                </div>
              )}

              {/* Photos */}
              {(selectedItem.data.photo_urls?.length > 0 || 
                selectedItem.data.completion_photos?.length > 0 ||
                selectedItem.data.resolution_photo_url) && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Photos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.data.photo_urls?.map((url, idx) => (
                      <div key={idx}>
                        <p className="text-xs text-gray-600 mb-1">Before</p>
                        <img 
                          src={url} 
                          alt="Before"
                          className="w-full aspect-square object-cover rounded border"
                        />
                      </div>
                    ))}
                    {selectedItem.data.resolution_photo_url && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">After</p>
                        <img 
                          src={selectedItem.data.resolution_photo_url}
                          alt="After"
                          className="w-full aspect-square object-cover rounded border"
                        />
                      </div>
                    )}
                    {selectedItem.data.completion_photos?.map((url, idx) => (
                      <div key={idx}>
                        <p className="text-xs text-gray-600 mb-1">After</p>
                        <img 
                          src={url}
                          alt="After"
                          className="w-full aspect-square object-cover rounded border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}