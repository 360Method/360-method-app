import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  FileText, Image as ImageIcon, Upload, Trash2, 
  Eye, File, Download, AlertCircle
} from 'lucide-react';

export default function FilesTab({ project, onUpdate }) {
  const [uploading, setUploading] = useState(false);

  const files = project.quote_documents || [];

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;

    setUploading(true);

    try {
      console.log('📤 Uploading', uploadedFiles.length, 'file(s)...');

      // Upload files to Base44
      const filePromises = uploadedFiles.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url,
          type: getFileType(file.name),
          uploaded_date: new Date().toISOString().split('T')[0],
          amount: 0
        };
      });

      const newFiles = await Promise.all(filePromises);
      console.log('✅ Files uploaded:', newFiles);

      // Update project with new files
      await base44.entities.Upgrade.update(project.id, {
        quote_documents: [...files, ...newFiles]
      });

      console.log('✅ Project updated with new files');
      alert(`${uploadedFiles.length} file(s) uploaded successfully`);
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to upload files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileIndex) => {
    if (!confirm('Delete this file?')) return;

    try {
      const updatedFiles = files.filter((_, i) => i !== fileIndex);
      
      await base44.entities.Upgrade.update(project.id, {
        quote_documents: updatedFiles
      });

      console.log('✅ File deleted');
      onUpdate();
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet';
    return 'other';
  };

  const getFileIcon = (file) => {
    const type = file.type || getFileType(file.name);
    
    if (type === 'image') return <ImageIcon className="w-8 h-8 text-blue-600" />;
    if (type === 'pdf') return <FileText className="w-8 h-8 text-red-600" />;
    if (type === 'document') return <FileText className="w-8 h-8 text-blue-600" />;
    if (type === 'spreadsheet') return <FileText className="w-8 h-8 text-green-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const isImage = (file) => {
    const type = file.type || getFileType(file.name);
    return type === 'image' || file.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="block">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {uploading ? 'Uploading...' : 'Upload Files'}
          </p>
          <p className="text-xs text-gray-500">
            Quotes, photos, plans, receipts, warranties
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Images, PDFs, Word, Excel
          </p>
        </div>
      </label>

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">No files yet</p>
          <p className="text-xs text-gray-500">
            Upload documents, photos, and other project files
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {file.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {file.type && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {file.type}
                      </span>
                    )}
                    {file.uploaded_date && (
                      <span className="text-xs text-gray-500">
                        {new Date(file.uploaded_date).toLocaleDateString()}
                      </span>
                    )}
                    {file.amount > 0 && (
                      <span className="text-xs text-green-700 font-semibold">
                        ${file.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {file.contractor_name && (
                    <p className="text-xs text-gray-600 mt-1">
                      From: {file.contractor_name}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(file.url, '_blank')}
                    className="p-0"
                    style={{ minHeight: '36px', minWidth: '36px' }}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteFile(index)}
                    className="p-0 text-red-600 hover:text-red-700"
                    style={{ minHeight: '36px', minWidth: '36px' }}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preview for images */}
              {isImage(file) && (
                <div className="mt-3">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Info */}
      {files.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">
                💡 Tip
              </p>
              <p className="text-xs text-blue-800">
                Keep all project documents in one place: quotes, contracts, receipts, warranties, 
                before/after photos. Makes handoff easy if you sell or switch to a property manager.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}