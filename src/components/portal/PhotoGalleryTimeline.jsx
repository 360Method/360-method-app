import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Calendar,
  Grid,
  List as ListIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PhotoGalleryTimeline({ photos, onSelectPhoto, onComparePhotos }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState([]);
  const [filterRoom, setFilterRoom] = useState('all');

  const rooms = [...new Set(photos.map(p => p.room))].filter(Boolean);

  const filteredPhotos = filterRoom === 'all' 
    ? photos 
    : photos.filter(p => p.room === filterRoom);

  const photosByDate = filteredPhotos.reduce((acc, photo) => {
    const date = new Date(photo.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(photo);
    return acc;
  }, {});

  const handlePhotoClick = (photo) => {
    if (compareMode) {
      if (comparePhotos.find(p => p.id === photo.id)) {
        setComparePhotos(comparePhotos.filter(p => p.id !== photo.id));
      } else if (comparePhotos.length < 2) {
        setComparePhotos([...comparePhotos, photo]);
      }
    } else {
      setSelectedPhoto(photo);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setComparePhotos([]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filterRoom === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRoom('all')}
          >
            All ({photos.length})
          </Button>
          {rooms.map(room => (
            <Button
              key={room}
              variant={filterRoom === room ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRoom(room)}
            >
              {room} ({photos.filter(p => p.room === room).length})
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleCompareMode}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            Compare {comparePhotos.length > 0 && `(${comparePhotos.length})`}
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Compare Mode Banner */}
      {compareMode && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 text-blue-600" />
              <ChevronRight className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Select 2 photos to compare
              </span>
              {comparePhotos.length === 2 && (
                <Button
                  size="sm"
                  onClick={() => onComparePhotos(comparePhotos)}
                  className="ml-2"
                >
                  View Comparison
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompareMode}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() => handlePhotoClick(photo)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                compareMode && comparePhotos.find(p => p.id === photo.id)
                  ? 'ring-4 ring-blue-500'
                  : ''
              }`}
            >
              <img
                src={photo.url}
                alt={photo.description || 'Property photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-white text-sm font-medium line-clamp-1">
                    {photo.room}
                  </div>
                  <div className="text-white text-xs opacity-90">
                    {new Date(photo.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {compareMode && comparePhotos.find(p => p.id === photo.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {comparePhotos.findIndex(p => p.id === photo.id) + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {Object.entries(photosByDate).map(([date, datePhotos]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className="font-semibold text-gray-900">{date}</div>
                <Badge variant="outline">{datePhotos.length} photos</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {datePhotos.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                      compareMode && comparePhotos.find(p => p.id === photo.id)
                        ? 'ring-4 ring-blue-500'
                        : ''
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.description || 'Property photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                      <div className="text-white text-xs font-medium truncate">
                        {photo.room}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPhotos.length === 0 && (
        <Card className="p-12 text-center">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div className="font-semibold text-gray-900 mb-2">
            No Photos Yet
          </div>
          <div className="text-sm text-gray-600">
            Capture photos during inspections to build your property timeline
          </div>
        </Card>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.room}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description}
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(selectedPhoto.date).toLocaleDateString()}
                  </span>
                </div>
                {selectedPhoto.inspection_id && (
                  <div>
                    <span className="text-gray-600">Source:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      Inspection
                    </span>
                  </div>
                )}
              </div>
              {selectedPhoto.description && (
                <div className="text-sm text-gray-700">
                  {selectedPhoto.description}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(selectedPhoto.url, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}