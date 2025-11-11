import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Download, Trash2, Plus, DollarSign, Calendar, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const DOCUMENT_TYPES = [
  { value: 'quote', label: 'Quote/Estimate', icon: DollarSign, color: 'bg-blue-100 text-blue-800' },
  { value: 'contract', label: 'Contract', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  { value: 'invoice', label: 'Invoice', icon: DollarSign, color: 'bg-green-100 text-green-800' },
  { value: 'permit', label: 'Permit', icon: FileText, color: 'bg-orange-100 text-orange-800' },
  { value: 'warranty', label: 'Warranty', icon: FileText, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'Other Document', icon: FileText, color: 'bg-gray-100 text-gray-800' }
];

export default function UpgradeDocuments({ project, onUpdate }) {
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [newDoc, setNewDoc] = React.useState({
    name: '',
    type: 'quote',
    contractor_name: '',
    amount: '',
    uploaded_date: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  const documents = project.quote_documents || [];

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedDocs) => {
      return await base44.entities.Upgrade.update(project.id, {
        quote_documents: updatedDocs
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      if (onUpdate) onUpdate();
    }
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileUrl = await uploadFileMutation.mutateAsync(file);
      setNewDoc({ ...newDoc, url: fileUrl, name: newDoc.name || file.name });
    } catch (error) {
      alert('Failed to upload file. Please try again.');
    }
    setUploading(false);
  };

  const handleAddDocument = async () => {
    if (!newDoc.url || !newDoc.name) {
      alert('Please upload a file and provide a name');
      return;
    }

    const documentToAdd = {
      ...newDoc,
      amount: parseFloat(newDoc.amount) || 0,
      uploaded_date: newDoc.uploaded_date || new Date().toISOString().split('T')[0]
    };

    const updatedDocs = [...documents, documentToAdd];
    await updateProjectMutation.mutateAsync(updatedDocs);
    
    setShowAddDialog(false);
    setNewDoc({
      name: '',
      type: 'quote',
      contractor_name: '',
      amount: '',
      uploaded_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteDocument = async (index) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter((_, i) => i !== index);
      await updateProjectMutation.mutateAsync(updatedDocs);
    }
  };

  const getDocumentTypeInfo = (type) => {
    return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[5];
  };

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc, index) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push({ ...doc, index });
    return acc;
  }, {});

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
            <FileText className="w-5 h-5" />
            Documents & Estimates
          </CardTitle>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            style={{ backgroundColor: '#3B82F6', minHeight: '40px' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No documents uploaded yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Save quotes, contracts, permits, and other project documents here
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              style={{ backgroundColor: '#3B82F6', minHeight: '48px' }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(documentsByType).map(([type, docs]) => {
              const typeInfo = getDocumentTypeInfo(type);
              const Icon = typeInfo.icon;
              
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold" style={{ color: '#1B365D' }}>
                      {typeInfo.label}s ({docs.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc.index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {doc.name}
                            </p>
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            {doc.contractor_name && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{doc.contractor_name}</span>
                              </div>
                            )}
                            {doc.amount > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${doc.amount.toLocaleString()}</span>
                              </div>
                            )}
                            {doc.uploaded_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(doc.uploaded_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            style={{ minHeight: '40px' }}
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            style={{ minHeight: '40px' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add Document Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label>Upload File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                PDF, Word, or Image files accepted
              </p>
            </div>

            {/* Document Name */}
            <div>
              <Label>Document Name *</Label>
              <Input
                value={newDoc.name}
                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                placeholder="e.g., John's Contracting - Kitchen Quote"
              />
            </div>

            {/* Document Type */}
            <div>
              <Label>Document Type *</Label>
              <Select
                value={newDoc.type}
                onValueChange={(value) => setNewDoc({ ...newDoc, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contractor Name */}
            <div>
              <Label>Contractor/Company Name</Label>
              <Input
                value={newDoc.contractor_name}
                onChange={(e) => setNewDoc({ ...newDoc, contractor_name: e.target.value })}
                placeholder="e.g., ABC Construction"
              />
            </div>

            {/* Amount */}
            <div>
              <Label>Amount (if applicable)</Label>
              <Input
                type="number"
                value={newDoc.amount}
                onChange={(e) => setNewDoc({ ...newDoc, amount: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newDoc.uploaded_date}
                onChange={(e) => setNewDoc({ ...newDoc, uploaded_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={!newDoc.url || !newDoc.name || updateProjectMutation.isPending}
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              {updateProjectMutation.isPending ? 'Saving...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}