import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { X, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PhotoGallery({ tasks, isLoading }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  // Get tasks with photos
  const tasksWithPhotos = useMemo(() => {
    return tasks.filter(task => 
      (task.photo_urls && task.photo_urls.length > 0) ||
      (task.completion_photos && task.completion_photos.length > 0) ||
      task.resolution_photo_url
    );
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading photos...</p>
      </div>
    );
  }

  if (tasksWithPhotos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Photos Yet
          </h3>
          <p className="text-gray-600">
            Add photos to your completed tasks to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Photo count */}
      <div className="text-sm text-gray-600">
        {tasksWithPhotos.length} tasks with photos
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tasksWithPhotos.map(task => {
          const beforePhoto = task.photo_urls?.[0];
          const afterPhoto = task.completion_photos?.[0] || task.resolution_photo_url;
          
          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-purple-400 transition"
            >
              {/* Before photo (default) */}
              {beforePhoto && (
                <img 
                  src={beforePhoto}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-0"
                />
              )}
              
              {/* After photo (on hover) */}
              {afterPhoto && (
                <img 
                  src={afterPhoto}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity group-hover:opacity-100"
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold truncate">
                    {task.title}
                  </p>
                  <p className="text-white/80 text-xs">
                    {format(parseISO(task.completion_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {/* Before/After badge */}
              {beforePhoto && afterPhoto && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Before/After
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg pr-6">
                {selectedTask.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge>{selectedTask.system_type || 'General'}</Badge>
                {selectedTask.execution_method && (
                  <Badge variant="outline">{selectedTask.execution_method}</Badge>
                )}
                {selectedTask.resolved_during_inspection && (
                  <Badge className="bg-green-600 text-white">Inspection Fix</Badge>
                )}
              </div>

              {/* Before Photos */}
              {selectedTask.photo_urls && selectedTask.photo_urls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Before</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTask.photo_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Before ${idx + 1}`}
                        onClick={() => setViewingPhoto(url)}
                        className="w-full aspect-square object-cover rounded border cursor-pointer hover:opacity-90 transition"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* After Photos */}
              {(selectedTask.completion_photos?.length > 0 || selectedTask.resolution_photo_url) && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">After</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTask.resolution_photo_url && (
                      <img
                        src={selectedTask.resolution_photo_url}
                        alt="After"
                        onClick={() => setViewingPhoto(selectedTask.resolution_photo_url)}
                        className="w-full aspect-square object-cover rounded border cursor-pointer hover:opacity-90 transition"
                      />
                    )}
                    {selectedTask.completion_photos?.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`After ${idx + 1}`}
                        onClick={() => setViewingPhoto(url)}
                        className="w-full aspect-square object-cover rounded border cursor-pointer hover:opacity-90 transition"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Task Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Cost</h4>
                  <p className="text-lg font-bold text-gray-900">
                    ${selectedTask.actual_cost?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Time</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedTask.actual_hours?.toFixed(1) || '0'}h
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedTask.resolution_notes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">What Was Done</h4>
                  <p className="text-sm text-gray-700">{selectedTask.resolution_notes}</p>
                </div>
              )}

              {selectedTask.completion_notes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Completion Notes</h4>
                  <p className="text-sm text-gray-700">{selectedTask.completion_notes}</p>
                </div>
              )}

            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Fullscreen Photo Viewer */}
      {viewingPhoto && (
        <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
          <DialogContent className="max-w-screen-lg p-0 bg-black">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-6 h-6" />
              </Button>
              <img
                src={viewingPhoto}
                alt="Full size"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}