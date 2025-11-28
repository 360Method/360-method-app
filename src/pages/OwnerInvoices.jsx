import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auth, ServicePackage } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import InvoicePaymentDialog from '../components/payments/InvoicePaymentDialog';
import { createPageUrl } from '@/utils';

const STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', color: 'bg-red-100 text-red-700', icon: Clock },
  pending: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: Clock }
};

export default function OwnerInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me()
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['ownerInvoices'],
    queryFn: async () => {
      const allInvoices = await ServicePackage.list('-created_date');
      return allInvoices.filter(inv => inv.payment_status);
    }
  });

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.payment_status === filterStatus);

  const unpaidCount = invoices.filter(inv => inv.payment_status === 'unpaid').length;
  const totalPaid = invoices
    .filter(inv => inv.payment_status === 'paid')
    .reduce((sum, inv) => sum + (inv.paid_amount / 100 || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.location.href = createPageUrl('Properties')} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Invoices</h1>
          <p className="text-gray-600">View and pay your service invoices</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{unpaidCount}</div>
                <div className="text-sm text-gray-600">Unpaid Invoices</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'unpaid' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('unpaid')}
            size="sm"
          >
            Unpaid
          </Button>
          <Button
            variant={filterStatus === 'paid' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('paid')}
            size="sm"
          >
            Paid
          </Button>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="text-gray-600">Loading invoices...</div>
          </Card>
        ) : filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices</h3>
            <p className="text-gray-600">You don't have any invoices yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map(invoice => {
              const statusConfig = STATUS_CONFIG[invoice.payment_status] || STATUS_CONFIG.unpaid;
              const StatusIcon = statusConfig.icon;
              const amount = (invoice.actual_cost || invoice.final_cost_max || invoice.total_estimated_cost_max);

              return (
                <Card key={invoice.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{invoice.package_name}</h3>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(invoice.created_date).toLocaleDateString()}
                      </div>
                      {invoice.payment_due_date && (
                        <div className="text-sm text-gray-600">
                          Due: {new Date(invoice.payment_due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        ${amount.toFixed(2)}
                      </div>
                      {invoice.payment_status === 'unpaid' && (
                        <Button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pay Now
                        </Button>
                      )}
                      {invoice.payment_status === 'paid' && (
                        <Button variant="outline" size="sm">
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoicePaymentDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}