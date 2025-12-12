import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  Receipt,
  FileCheck,
  FileSignature,
  Shield,
  Image,
  X,
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';

// Document type configuration
const DOCUMENT_TYPES = {
  estimate: {
    label: 'Estimate',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Quotes from contractors'
  },
  receipt: {
    label: 'Receipt',
    icon: Receipt,
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Proof of purchase'
  },
  contract: {
    label: 'Contract',
    icon: FileSignature,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Signed agreements'
  },
  warranty: {
    label: 'Warranty',
    icon: Shield,
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    description: 'Product warranties'
  },
  permit: {
    label: 'Permit',
    icon: FileCheck,
    color: 'bg-red-100 text-red-700 border-red-300',
    description: 'Building permits'
  },
  photo: {
    label: 'Photo',
    icon: Image,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    description: 'Before/after photos'
  }
};

/**
 * ProjectDocuments - Document management for upgrade projects
 *
 * Stores documents in Supabase storage and tracks metadata in project record
 */
export default function ProjectDocuments({
  projectId,
  documents = [],
  onDocumentsChange,
  readOnly = false,
  className = ''
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedType, setSelectedType] = useState('receipt');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Handle file selection
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      const newDocs = [];

      for (const file of files) {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('upgrade-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('upgrade-documents')
          .getPublicUrl(fileName);

        // Create document metadata
        newDocs.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          type: selectedType,
          name: file.name,
          url: urlData.publicUrl,
          storagePath: fileName,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      // Update documents list
      const updatedDocs = [...documents, ...newDocs];
      onDocumentsChange?.(updatedDocs);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;

    try {
      // Delete from storage
      if (doc.storagePath) {
        await supabase.storage
          .from('upgrade-documents')
          .remove([doc.storagePath]);
      }

      // Update documents list
      const updatedDocs = documents.filter(d => d.id !== doc.id);
      onDocumentsChange?.(updatedDocs);

    } catch (error) {
      console.error('Delete error:', error);
      setUploadError('Failed to delete document. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Group documents by type
  const groupedDocs = documents.reduce((acc, doc) => {
    const type = doc.type || 'receipt';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <div className={className}>
      {/* Upload Section */}
      {!readOnly && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Label className="font-semibold">Document Type:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DOCUMENT_TYPES).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedType(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selectedType === key
                        ? config.color + ' ring-2 ring-offset-1 ring-blue-400'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, images, Word, Excel (max 10MB)
                  </p>
                </>
              )}
            </label>
          </div>

          {uploadError && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No documents yet</p>
          <p className="text-sm">Upload receipts, estimates, contracts, and more</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(DOCUMENT_TYPES).map(([type, config]) => {
            const docs = groupedDocs[type];
            if (!docs || docs.length === 0) return null;

            const Icon = config.icon;

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">{config.label}s</h4>
                  <Badge variant="outline" className="text-xs">
                    {docs.length}
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {docs.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      config={config}
                      onDelete={readOnly ? null : () => handleDelete(doc)}
                      onPreview={() => setPreviewDoc(doc)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreview
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

/**
 * DocumentRow - Single document display
 */
function DocumentRow({ doc, config, onDelete, onPreview }) {
  const Icon = config.icon;
  const isImage = doc.mimeType?.startsWith('image/');
  const isPDF = doc.mimeType === 'application/pdf';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
      {/* Thumbnail or Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
        {isImage && doc.url ? (
          <img
            src={doc.url}
            alt={doc.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {doc.size && <span>{formatFileSize(doc.size)}</span>}
          {doc.uploadedAt && (
            <>
              <span>•</span>
              <span>{formatDate(doc.uploadedAt)}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(isImage || isPDF) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
        <a
          href={doc.url}
          download={doc.name}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
        </a>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * DocumentPreview - Full-screen document preview
 */
function DocumentPreview({ doc, onClose }) {
  const isImage = doc.mimeType?.startsWith('image/');
  const isPDF = doc.mimeType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
          <div className="flex items-center gap-2">
            <a
              href={doc.url}
              download={doc.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {isImage && (
            <img
              src={doc.url}
              alt={doc.name}
              className="w-full h-auto"
            />
          )}
          {isPDF && (
            <iframe
              src={doc.url}
              className="w-full h-[80vh]"
              title={doc.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * DocumentsSummary - Compact summary for project cards
 */
export function DocumentsSummary({ documents = [], className = '' }) {
  if (documents.length === 0) return null;

  const typeCount = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FileText className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-600">
        {documents.length} document{documents.length !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-1">
        {Object.entries(typeCount).slice(0, 3).map(([type, count]) => {
          const config = DOCUMENT_TYPES[type];
          if (!config) return null;
          return (
            <Badge key={type} variant="outline" className="text-xs">
              {count} {config.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
