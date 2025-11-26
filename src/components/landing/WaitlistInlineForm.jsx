import React, { useState } from 'react';
import { CheckCircle, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function WaitlistInlineForm({ source = 'homepage_offer' }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (email) => {
      await base44.entities.Waitlist.create({
        email,
        source,
        first_name: '',
        last_name: '',
        phone: '',
        zip_code: '',
        property_type: 'homecare',
        notes: '',
        marketing_consent: true,
        consent_timestamp: new Date().toISOString(),
        consent_ip: 'web_form'
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      submitMutation.mutate(email);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          You're On the List! 🎉
        </h3>
        <p className="text-green-800 mb-4">
          Check your inbox for your first framework lesson.
        </p>
        <p className="text-sm text-green-700">
          We'll notify you when the 360° Asset Command Center launches.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-5 py-4 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-lg"
          style={{ minHeight: '56px' }}
        />
        <button 
          type="submit"
          disabled={submitMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg whitespace-nowrap transition-colors shadow-lg shadow-orange-500/25 disabled:opacity-50"
          style={{ minHeight: '56px' }}
        >
          {submitMutation.isPending ? 'Joining...' : 'Join Waitlist'}
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Lock className="w-4 h-4" />
        <span>No spam. Unsubscribe anytime. Your data is safe.</span>
      </div>
    </form>
  );
}