import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Edit,
  Loader2,
  RefreshCw,
  Shield,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'tos', label: 'Terms of Service' },
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'service_agreement', label: 'Service Agreement' },
  { value: 'liability_waiver', label: 'Liability Waiver' },
  { value: 'operator_agreement', label: 'Operator Agreement' },
  { value: 'contractor_agreement', label: 'Contractor Agreement' },
];

export default function HQLegal() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newDocument, setNewDocument] = useState({
    document_type: 'tos',
    version: '',
    title: '',
    content: '',
    summary: '',
    requires_signature: false,
    is_active: false,
  });

  // Fetch documents
  const { data: documents = [], isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('document_type')
        .order('effective_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch acceptance stats
  const { data: stats = {} } = useQuery({
    queryKey: ['legal-stats'],
    queryFn: async () => {
      const [acceptances, users] = await Promise.all([
        supabase.from('document_acceptances').select('document_id', { count: 'exact', head: false }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      // Count acceptances per document
      const acceptanceCounts = {};
      acceptances.data?.forEach(a => {
        acceptanceCounts[a.document_id] = (acceptanceCounts[a.document_id] || 0) + 1;
      });

      return {
        totalUsers: users.count || 0,
        acceptanceCounts,
        totalAcceptances: acceptances.data?.length || 0,
      };
    }
  });

  // Fetch recent acceptances
  const { data: recentAcceptances = [] } = useQuery({
    queryKey: ['recent-acceptances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_acceptances')
        .select(`
          *,
          users:user_id(email, first_name, last_name),
          legal_documents:document_id(title, document_type, version)
        `)
        .order('accepted_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  // Create document mutation
  const createDocMutation = useMutation({
    mutationFn: async (docData) => {
      // If setting as active, deactivate other versions of same type
      if (docData.is_active) {
        await supabase
          .from('legal_documents')
          .update({ is_active: false })
          .eq('document_type', docData.document_type);
      }

      const { data, error } = await supabase
        .from('legal_documents')
        .insert(docData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Document created');
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
      setShowCreateDialog(false);
      setNewDocument({
        document_type: 'tos',
        version: '',
        title: '',
        content: '',
        summary: '',
        requires_signature: false,
        is_active: false,
      });
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    }
  });

  // Activate document mutation
  const activateMutation = useMutation({
    mutationFn: async (doc) => {
      // Deactivate other versions
      await supabase
        .from('legal_documents')
        .update({ is_active: false })
        .eq('document_type', doc.document_type);

      // Activate this one
      const { error } = await supabase
        .from('legal_documents')
        .update({ is_active: true, effective_at: new Date().toISOString() })
        .eq('id', doc.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Document activated');
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
    }
  });

  const getDocTypeLabel = (type) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const viewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowViewDialog(true);
  };

  const exportAcceptances = async () => {
    const { data, error } = await supabase
      .from('document_acceptances')
      .select(`
        accepted_at,
        ip_address,
        user_agent,
        accepted_during,
        signature_typed,
        users:user_id(email, first_name, last_name),
        legal_documents:document_id(title, document_type, version)
      `)
      .order('accepted_at', { ascending: false });

    if (error) {
      toast.error('Failed to export');
      return;
    }

    // Convert to CSV
    const csv = [
      ['Email', 'Name', 'Document', 'Type', 'Version', 'Accepted At', 'Method', 'Signature'].join(','),
      ...data.map(a => [
        a.users?.email || '',
        `${a.users?.first_name || ''} ${a.users?.last_name || ''}`.trim(),
        a.legal_documents?.title || '',
        a.legal_documents?.document_type || '',
        a.legal_documents?.version || '',
        a.accepted_at,
        a.accepted_during || '',
        a.signature_typed || 'N/A',
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-acceptances-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Exported successfully');
  };

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) acc[doc.document_type] = [];
    acc[doc.document_type].push(doc);
    return acc;
  }, {});

  return (
    <HQLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              Legal Documents
            </h1>
            <p className="text-gray-600 mt-1">
              Manage terms of service, privacy policies, and document acceptances
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportAcceptances}>
              <Download className="w-4 h-4 mr-2" />
              Export Acceptances
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents.filter(d => d.is_active).length}</p>
                  <p className="text-sm text-gray-600">Active Docs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAcceptances || 0}</p>
                  <p className="text-sm text-gray-600">Total Acceptances</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents.length}</p>
                  <p className="text-sm text-gray-600">All Versions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents by Type */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Document Library</CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetchDocs()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No documents created yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(documentsByType).map(([type, docs]) => (
                  <div key={type}>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {getDocTypeLabel(type)}
                      <Badge variant="outline" className="ml-2">{docs.length} version(s)</Badge>
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Signature Required</TableHead>
                            <TableHead>Acceptances</TableHead>
                            <TableHead>Effective</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {docs.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-mono">{doc.version}</TableCell>
                              <TableCell>{doc.title}</TableCell>
                              <TableCell>
                                {doc.is_active ? (
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                ) : (
                                  <Badge variant="outline">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {doc.requires_signature ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {stats.acceptanceCounts?.[doc.id] || 0}
                              </TableCell>
                              <TableCell className="text-gray-500 text-sm">
                                {new Date(doc.effective_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewDocument(doc)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  {!doc.is_active && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => activateMutation.mutate(doc)}
                                      disabled={activateMutation.isPending}
                                    >
                                      Activate
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Acceptances */}
        {recentAcceptances.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Acceptances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Accepted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAcceptances.slice(0, 10).map((acceptance) => (
                      <TableRow key={acceptance.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {acceptance.users?.first_name} {acceptance.users?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{acceptance.users?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{acceptance.legal_documents?.title}</p>
                            <p className="text-sm text-gray-500">v{acceptance.legal_documents?.version}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{acceptance.accepted_during}</Badge>
                          {acceptance.signature_typed && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              Signed: "{acceptance.signature_typed}"
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(acceptance.accepted_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Document Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Legal Document</DialogTitle>
              <DialogDescription>
                Create a new legal document or version
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <Select
                    value={newDocument.document_type}
                    onValueChange={(v) => setNewDocument(prev => ({ ...prev, document_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version *
                  </label>
                  <Input
                    value={newDocument.version}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 1.0, 2.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={newDocument.title}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Terms of Service"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <Textarea
                  value={newDocument.summary}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary shown to users"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Markdown) *
                </label>
                <Textarea
                  value={newDocument.content}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="# Document Title&#10;&#10;Your document content here..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="requires_signature"
                    checked={newDocument.requires_signature}
                    onCheckedChange={(v) => setNewDocument(prev => ({ ...prev, requires_signature: v }))}
                  />
                  <label htmlFor="requires_signature" className="text-sm cursor-pointer">
                    Requires signature
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={newDocument.is_active}
                    onCheckedChange={(v) => setNewDocument(prev => ({ ...prev, is_active: v }))}
                  />
                  <label htmlFor="is_active" className="text-sm cursor-pointer">
                    Set as active version
                  </label>
                </div>
              </div>

              {newDocument.is_active && (
                <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Setting this as active will deactivate any existing active version of this document type.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createDocMutation.mutate(newDocument)}
                disabled={createDocMutation.isPending || !newDocument.title || !newDocument.version || !newDocument.content}
              >
                {createDocMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.title}</DialogTitle>
              <DialogDescription>
                Version {selectedDocument?.version} | {selectedDocument?.is_active ? 'Active' : 'Inactive'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedDocument?.summary && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800"><strong>Summary:</strong> {selectedDocument.summary}</p>
                </div>
              )}
              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {selectedDocument?.content}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
