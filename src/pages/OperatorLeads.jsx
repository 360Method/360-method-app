import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Home, MapPin, Clock, CheckCircle, X, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function OperatorLeads() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [acceptData, setAcceptData] = useState({ startDate: '', message: '' });

  const queryClient = useQueryClient();

  // Mock leads data - replace with actual ServiceRequest entity query
  const leads = [
    {
      id: '1',
      owner_name: 'Jennifer Davis',
      property_address: '321 Maple Dr, Portland, OR 97201',
      requested_package: 'Premium HomeCare',
      date_received: new Date().toISOString(),
      notes: 'Looking for quarterly inspections and preventive maintenance',
      property_details: { bedrooms: 3, bathrooms: 2, sqft: 1800, year_built: 2005 }
    },
    {
      id: '2',
      owner_name: 'Robert Wilson',
      property_address: '654 Cedar Ln, Portland, OR 97202',
      requested_package: 'Essential PropertyCare',
      date_received: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Investment property, need regular maintenance',
      property_details: { bedrooms: 2, bathrooms: 1, sqft: 1200, year_built: 1995 }
    }
  ];

  const handleAcceptLead = () => {
    if (!acceptData.startDate) {
      toast.error('Please select a start date');
      return;
    }
    
    // Create client and link property
    toast.success('Lead accepted! Client has been added to your list.');
    setSelectedLead(null);
    setAcceptData({ startDate: '', message: '' });
  };

  const handleDeclineLead = (leadId, reason) => {
    toast.info('Lead declined');
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Requests</h1>
          <p className="text-gray-600">New leads from the marketplace</p>
        </div>

        {leads.length === 0 ? (
          <Card className="p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="font-semibold text-gray-900 mb-2">
              No Pending Leads
            </div>
            <div className="text-sm text-gray-600">
              New service requests will appear here
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads.map(lead => (
              <Card key={lead.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {lead.owner_name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{lead.property_address}</span>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        {lead.requested_package}
                      </Badge>
                    </div>

                    {lead.notes && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-700">"{lead.notes}"</div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Clock className="w-3 h-3" />
                      Received {new Date(lead.date_received).toLocaleDateString()}
                    </div>

                    {lead.property_details && (
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span>{lead.property_details.bedrooms} bed</span>
                        <span>{lead.property_details.bathrooms} bath</span>
                        <span>{lead.property_details.sqft} sqft</span>
                        <span>Built {lead.property_details.year_built}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedLead(lead)}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Lead
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeclineLead(lead.id, 'Not available')}
                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accept Lead Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Accept Service Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-gray-900 mb-1">{selectedLead.owner_name}</div>
                <div className="text-sm text-gray-600">{selectedLead.property_address}</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Proposed Start Date *
                </label>
                <Input
                  type="date"
                  value={acceptData.startDate}
                  onChange={(e) => setAcceptData({ ...acceptData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Welcome Message (Optional)
                </label>
                <textarea
                  value={acceptData.message}
                  onChange={(e) => setAcceptData({ ...acceptData, message: e.target.value })}
                  placeholder="Introduce yourself and let the client know what to expect..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  rows="4"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAcceptLead} className="flex-1">
                  Confirm & Accept
                </Button>
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}