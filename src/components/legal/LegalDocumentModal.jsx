import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import SignatureCapture from './SignatureCapture';
import {
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LegalDocumentModal({
  document,
  isOpen,
  onClose,
  onAccept,
  acceptedDuring = 'prompt',
  requiresScroll = true,
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const contentRef = useRef(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(!requiresScroll);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [signature, setSignature] = useState(null);

  // Accept document mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('document_acceptances')
        .insert({
          user_id: user.id,
          document_id: document.id,
          ip_address: null, // Could capture via API
          user_agent: navigator.userAgent,
          signature_data: signature?.data || null,
          signature_typed: signature?.typed || null,
          accepted_during: acceptedDuring,
          metadata: {
            document_version: document.version,
            document_type: document.document_type,
          },
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-acceptances'] });
      onAccept?.();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to record acceptance:', error);
      alert('Failed to record your acceptance. Please try again.');
    },
  });

  const handleScroll = (e) => {
    if (!requiresScroll) return;

    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Check if scrolled near bottom (within 50px)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setHasScrolledToBottom(true);
    }
  };

  const canAccept = hasScrolledToBottom && hasAgreed && (!document.requires_signature || signature);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {document.title}
          </DialogTitle>
          <DialogDescription>
            Version {document.version} | Effective {new Date(document.effective_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {/* Document Summary */}
        {document.summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
            <p className="text-sm text-blue-900">
              <strong>Summary:</strong> {document.summary}
            </p>
          </div>
        )}

        {/* Document Content */}
        <ScrollArea
          ref={contentRef}
          className="flex-1 border rounded-lg p-4 bg-gray-50"
          style={{ maxHeight: '40vh' }}
          onScrollCapture={handleScroll}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{document.content}</ReactMarkdown>
          </div>
        </ScrollArea>

        {/* Scroll Indicator */}
        {requiresScroll && !hasScrolledToBottom && (
          <div className="flex items-center justify-center gap-2 py-2 text-amber-600 text-sm">
            <ChevronDown className="w-4 h-4 animate-bounce" />
            <span>Please scroll to read the entire document</span>
          </div>
        )}

        {/* Signature Section */}
        {document.requires_signature && hasScrolledToBottom && (
          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Your Signature (Required)
            </p>
            <SignatureCapture
              onSignatureChange={setSignature}
              width={500}
              height={120}
            />
          </div>
        )}

        {/* Agreement Checkbox */}
        {hasScrolledToBottom && (
          <div className="flex items-start gap-3 py-3">
            <Checkbox
              id="agree"
              checked={hasAgreed}
              onCheckedChange={setHasAgreed}
            />
            <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer">
              I have read, understood, and agree to the {document.title}
              {document.requires_signature && ' and confirm my signature above'}
            </label>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Decline
          </Button>
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={!canAccept || acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                I Accept
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
