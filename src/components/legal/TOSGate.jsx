import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import LegalDocumentModal from './LegalDocumentModal';
import { Loader2 } from 'lucide-react';

/**
 * TOSGate - A wrapper component that checks if user has accepted required legal documents
 *
 * Usage:
 * <TOSGate requiredDocuments={['tos', 'privacy_policy']}>
 *   <YourProtectedContent />
 * </TOSGate>
 */
export default function TOSGate({
  children,
  requiredDocuments = ['tos'],
  acceptedDuring = 'prompt',
  fallback = null,
}) {
  const { user, isLoadingAuth } = useAuth();
  const [currentDocIndex, setCurrentDocIndex] = useState(0);

  // Fetch active documents that need acceptance
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['active-legal-documents', requiredDocuments],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .in('document_type', requiredDocuments)
        .eq('is_active', true)
        .order('document_type');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user's acceptances
  const { data: acceptances = [], isLoading: acceptancesLoading, refetch: refetchAcceptances } = useQuery({
    queryKey: ['user-acceptances', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_acceptances')
        .select('document_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Loading state
  if (isLoadingAuth || docsLoading || acceptancesLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // If no user, render children (let auth handle it)
  if (!user?.id) {
    return children;
  }

  // Find documents that haven't been accepted
  const acceptedDocIds = new Set(acceptances.map(a => a.document_id));
  const unacceptedDocs = documents.filter(doc => !acceptedDocIds.has(doc.id));

  // If all documents accepted, render children
  if (unacceptedDocs.length === 0) {
    return children;
  }

  // Show document modal for current unaccepted document
  const currentDoc = unacceptedDocs[currentDocIndex];

  const handleAccept = () => {
    refetchAcceptances();
    if (currentDocIndex < unacceptedDocs.length - 1) {
      setCurrentDocIndex(prev => prev + 1);
    }
  };

  const handleDecline = () => {
    // Could redirect to logout or show warning
    console.log('User declined document:', currentDoc?.document_type);
  };

  return (
    <>
      {currentDoc && (
        <LegalDocumentModal
          document={currentDoc}
          isOpen={true}
          onClose={handleDecline}
          onAccept={handleAccept}
          acceptedDuring={acceptedDuring}
        />
      )}
      {/* Show children in background (blurred/disabled) */}
      <div className="pointer-events-none opacity-30">
        {children}
      </div>
    </>
  );
}
