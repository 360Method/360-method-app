import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { integrations } from '@/api/supabaseClient';

export default function ShareProjectDialog({ project, property, isOpen, onClose }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate shareable link (for future implementation)
  const shareableLink = `${window.location.origin}${window.location.pathname}?id=${project.id}`;

  const handleEmailShare = async () => {
    if (!emails.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    setLoading(true);

    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
      
      console.log('📧 Sharing project with:', emailList);

      // Build email body
      const emailBody = `
Project: ${project.title}
Category: ${project.category}
Property: ${property?.address || 'N/A'}
Budget: $${project.investment_required?.toLocaleString() || '0'}

${project.description ? `Description:\n${project.description}\n\n` : ''}

${message ? `Message from property owner:\n"${message}"\n\n` : ''}

Milestones (${project.milestones?.length || 0} steps):
${project.milestones?.map((m, i) => `${i + 1}. ${m.title}`).join('\n') || 'No milestones defined'}

View full project details: ${shareableLink}
      `.trim();

      // Send emails using Supabase integration
      for (const email of emailList) {
        await integrations.SendEmail({
          to: email,
          subject: `Project Quote Request: ${project.title}`,
          body: emailBody
        });
      }

      console.log('✅ Emails sent successfully');
      alert(`Project shared with ${emailList.length} contractor(s)!`);
      
      setTimeout(() => {
        onClose();
        setEmails('');
        setMessage('');
      }, 500);

    } catch (error) {
      console.error('❌ Error sharing project:', error);
      alert('Failed to share project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setLinkCopied(true);
    
    setTimeout(() => setLinkCopied(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Project with Contractors</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Project Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
            <p className="text-sm text-gray-600">{project.category}</p>
            <p className="text-sm text-gray-900 mt-1">
              Est. Budget: ${project.investment_required?.toLocaleString() || '0'}
            </p>
            {project.milestones && (
              <p className="text-sm text-gray-600 mt-1">
                {project.milestones.length} milestones defined
              </p>
            )}
          </div>

          {/* Email Share */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              📧 Email to Contractors
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Addresses (comma-separated)
                </label>
                <Input
                  type="text"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="contractor1@example.com, contractor2@example.com"
                  style={{ minHeight: '48px' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple emails with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Contractors (Optional)
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi, I'm interested in getting a quote for this project. Please review the details and let me know if you're available. Thanks!"
                  rows={3}
                  className="resize-none"
                  style={{ minHeight: '100px' }}
                />
              </div>

              <Button
                onClick={handleEmailShare}
                disabled={loading || !emails.trim()}
                className="w-full"
                style={{ minHeight: '48px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Project Details
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Or Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              🔗 Share Link
            </h4>

            <div className="flex gap-2">
              <Input
                type="text"
                value={shareableLink}
                readOnly
                className="flex-1 bg-gray-50"
                style={{ minHeight: '48px' }}
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-shrink-0"
                style={{ minHeight: '48px' }}
              >
                {linkCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can view project details (read-only)
            </p>
          </div>

          {/* What's Shared */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              📋 What Contractors Will See:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Project title and description</li>
              <li>• Property location</li>
              <li>• Scope and milestones</li>
              <li>• Budget estimate</li>
              <li>• Project timeline/status</li>
              <li>• Uploaded files (quotes, plans, photos)</li>
            </ul>
            <p className="text-xs text-blue-700 mt-2">
              ℹ️ Personal information is never shared
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}