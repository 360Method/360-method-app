import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PhotoCaptureStep({
  photos = [],
  onUpload,
  onRemove,
  uploading = false,
  onScan,
  scanning = false,
  systemType,
  photoTips = []
}) {
  return (
    <div className="space-y-4">
      {/* Photo Guide - What to Photograph */}
      {photoTips.length > 0 && (
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-gray-600" />
              📸 What to photograph:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {photoTips.map((tip, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-2 rounded">
              💡 <strong>Tip:</strong> Any photo works! Our AI can identify your equipment from the whole unit, a logo, or data plate. Take multiple photos for best results!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Smart Scan CTA - Primary Action */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">✨ AI Smart Scan (Easiest!)</h3>
              <p className="text-xs text-green-800">Take 1-3 photos - we'll identify everything</p>
            </div>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={onScan}
              className="hidden"
              disabled={scanning}
            />
            <Button
              type="button"
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              disabled={scanning}
              asChild
              style={{ minHeight: '56px', fontSize: '16px' }}
            >
              <span>
                {scanning ? (
                  <>
                    <span className="animate-spin">🔍</span>
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    📸 Take Photo & Auto-Fill
                  </>
                )}
              </span>
            </Button>
          </label>
          <p className="text-xs text-center text-green-700 mt-2">
            Works with ANY photo - data plate, whole unit, or brand logo!
          </p>
        </CardContent>
      </Card>

      {/* Manual Photo Upload - Secondary */}
      <div>
        <p className="text-sm text-gray-500 mb-2 text-center">Or just add photos without scanning:</p>
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
            style={{ minHeight: '48px' }}
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
                  Add Photos (No Scan)
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
            ✅ {photos.length} photo{photos.length > 1 ? 's' : ''} added
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-green-300 shadow-md"
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
        <div className="text-center py-4 text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No photos yet - tap the green button above!</p>
        </div>
      )}
    </div>
  );
}