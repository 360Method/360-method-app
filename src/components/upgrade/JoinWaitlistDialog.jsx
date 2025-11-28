import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Waitlist } from '@/api/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';

export default function JoinWaitlistDialog({ zipCode, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);

  const waitlistMutation = useMutation({
    mutationFn: async () => {
      await Waitlist.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        zip_code: zipCode,
        property_type: 'homecare',
        service_tier: 'undecided',
        status: 'pending',
        source: 'upgrade_project'
      });
      
      console.log('✅ Added to waitlist:', email, 'for zip', zipCode);
    },
    onSuccess: () => {
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Error joining waitlist:', error);
      alert('Failed to join waitlist. Please try again.');
    }
  });

  const handleSubmit = () => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter your name');
      return;
    }

    waitlistMutation.mutate();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              You're on the Waitlist!
            </h3>
            <p className="text-gray-600">
              We'll notify you as soon as 360° Operator service becomes available in your area.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Join Waitlist for Your Area</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Zip Code Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-blue-900">
                Zip Code: {zipCode || 'Not provided'}
              </p>
            </div>
            <p className="text-sm text-blue-800">
              Professional 360° Operator service isn't available in your area yet, 
              but we're actively expanding to new markets.
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ minHeight: '48px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll notify you when service becomes available
            </p>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* What You'll Get */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              When We Expand to Your Area:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Professional 360° Method implementation</li>
              <li>✓ Member discount pricing (5-15% off)</li>
              <li>✓ Priority scheduling</li>
              <li>✓ Proactive maintenance service</li>
              <li>✓ Local certified operator</li>
            </ul>
          </div>

          {/* Meanwhile */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-900">
              <strong>💡 Meanwhile:</strong> You can still use this app to track 
              maintenance DIY-style and share projects with local contractors.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={waitlistMutation.isPending}
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={waitlistMutation.isPending || !email.trim() || !firstName.trim() || !lastName.trim()}
              style={{ minHeight: '48px', backgroundColor: 'var(--primary)' }}
            >
              {waitlistMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Waitlist'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}