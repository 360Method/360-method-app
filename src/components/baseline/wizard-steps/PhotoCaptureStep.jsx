import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PhotoCaptureStep({ 
  photos = [], 
  onUpload, 
  onRemove, 
  uploading = false,
  onScan,
  scanning = false,
  systemType
}) {
  return (
    <div className="space-y-6">
      {/* Smart Scan CTA */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900">AI Smart Scan</h3>
              <p className="text-xs text-purple-800">We'll extract all the details</p>
            </div>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onScan}
              className="hidden"
              disabled={scanning}
            />
            <Button
              type="button"
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              disabled={scanning}
              asChild
              style={{ minHeight: '56px', fontSize: '16px' }}
            >
              <span>
                {scanning ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    AI Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    📸 Scan Data Plate
                  </>
                )}
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Manual Photo Upload */}
      <div>
        <p className="text-sm text-gray-600 mb-3 text-center">Or take regular photos:</p>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={onUpload}
          className="hidden"
          id="photo-upload"
          disabled={uploading}
        />
        <label htmlFor="photo-upload">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-2 border-gray-300"
            disabled={uploading}
            asChild
            style={{ minHeight: '56px', fontSize: '16px' }}
          >
            <span>
              {uploading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Add Photos
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">
            {photos.length} photo{photos.length > 1 ? 's' : ''} added
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-square">
                <img 
                  src={url} 
                  alt={`Photo ${idx + 1}`} 
                  className="w-full h-full object-cover rounded-lg border-2 border-white shadow-md" 
                />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md"
                  style={{ minHeight: '32px', minWidth: '32px' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Camera className="w-16 h-16 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No photos yet</p>
        </div>
      )}
    </div>
  );
}