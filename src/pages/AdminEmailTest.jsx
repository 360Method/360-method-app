import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminEmailTest() {
  const [sending, setSending] = useState({});
  const [results, setResults] = useState({});

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const emailTests = [
    {
      id: 'service_package_submitted',
      name: 'Service Package Submitted',
      description: 'Operator receives new service request',
      icon: '📋'
    },
    {
      id: 'service_package_quoted',
      name: 'Service Package Quoted',
      description: 'Homeowner receives quote from operator',
      icon: '💰'
    },
    {
      id: 'service_package_approved',
      name: 'Service Package Approved',
      description: 'Operator notified that quote was approved',
      icon: '✅'
    },
    {
      id: 'payment_succeeded',
      name: 'Payment Succeeded',
      description: 'Homeowner receives payment confirmation',
      icon: '💳'
    },
    {
      id: 'payment_failed',
      name: 'Payment Failed',
      description: 'Homeowner notified of payment issue',
      icon: '❌'
    },
    {
      id: 'inspection_due',
      name: 'Inspection Due',
      description: 'Homeowner reminded of seasonal inspection',
      icon: '🔍'
    }
  ];

  const sendTestEmail = async (eventType) => {
    setSending(prev => ({ ...prev, [eventType]: true }));
    
    try {
      const { data } = await base44.functions.invoke('testEmailTemplate', {
        event_type: eventType
      });

      setResults(prev => ({ ...prev, [eventType]: { success: true, data } }));
      toast.success(`Test email sent to ${user?.email}`);
    } catch (error) {
      setResults(prev => ({ ...prev, [eventType]: { success: false, error: error.message } }));
      toast.error(`Failed to send: ${error.message}`);
    } finally {
      setSending(prev => ({ ...prev, [eventType]: false }));
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Template Testing</h1>
          <p className="text-gray-600">
            Test emails will be sent to: <strong>{user.email}</strong>
          </p>
        </div>

        <div className="grid gap-4">
          {emailTests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{test.icon}</span>
                  <div>
                    <div className="text-lg font-semibold">{test.name}</div>
                    <div className="text-sm text-gray-500 font-normal">{test.description}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => sendTestEmail(test.id)}
                    disabled={sending[test.id]}
                    className="gap-2"
                  >
                    {sending[test.id] ? (
                      <>
                        <Mail className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>

                  {results[test.id] && (
                    <div className="flex items-center gap-2">
                      {results[test.id].success ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Sent successfully</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-red-600">
                            {results[test.id].error}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Template Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>All templates include:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>360° Method logo and branding</li>
                <li>Primary CTA button</li>
                <li>Mobile-responsive design</li>
                <li>Unsubscribe link</li>
                <li>Single-column layout</li>
              </ul>
              
              <p className="mt-4"><strong>Test data includes:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Realistic customer/property data</li>
                <li>Accurate pricing ($850-$1250 range)</li>
                <li>Future dates for scheduling</li>
                <li>Sample operator notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}