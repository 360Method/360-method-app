import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Operator } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import OperatorLayout from '@/components/operator/OperatorLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import {
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Loader2,
  FileText
} from 'lucide-react';

const STATUS_CONFIG = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  'sent': { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Eye },
  'viewed': { label: 'Viewed', color: 'bg-purple-100 text-purple-700', icon: Eye },
  'paid': { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'overdue': { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

export default function OperatorInvoices() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch operator profile
  const { data: myOperator } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const operators = await Operator.filter({ user_id: user?.id });
      return operators[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch invoices from database
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['operator-invoices', myOperator?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          operator_clients(contact_name)
        `)
        .eq('operator_id', myOperator.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected format
      return (data || []).map(inv => ({
        id: inv.invoice_number || `INV-${inv.id.slice(0, 8).toUpperCase()}`,
        raw_id: inv.id,
        client_name: inv.operator_clients?.contact_name || inv.client_name || 'Unknown Client',
        amount: inv.amount || inv.total || 0,
        date_sent: inv.sent_at || inv.created_at,
        status: inv.status || 'draft',
        payment_date: inv.paid_at || null
      }));
    },
    enabled: !!myOperator?.id
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalUnpaid = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'draft')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Loading state
  if (isLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">
              ${totalUnpaid.toLocaleString()} unpaid
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => window.location.href = createPageUrl('OperatorInvoiceCreate')}>
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              {Object.keys(STATUS_CONFIG).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {STATUS_CONFIG[status].label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Invoice List */}
        <div className="space-y-3">
          {filteredInvoices.map(invoice => {
            const config = STATUS_CONFIG[invoice.status];
            const StatusIcon = config.icon;

            return (
              <Card key={invoice.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{invoice.id}</div>
                        <div className="text-sm text-gray-600">{invoice.client_name}</div>
                      </div>
                      <Badge className={config.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        {invoice.date_sent ? (
                          <>Sent {new Date(invoice.date_sent).toLocaleDateString()}</>
                        ) : (
                          'Not sent yet'
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </div>
                    </div>
                    {invoice.payment_date && (
                      <div className="text-xs text-green-600 mt-1">
                        Paid {new Date(invoice.payment_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {invoices.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-500 mb-4">Create your first invoice to start billing clients</p>
            <Button
              className="gap-2"
              onClick={() => window.location.href = createPageUrl('OperatorInvoiceCreate')}
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </Card>
        )}
      </div>
    </OperatorLayout>
  );
}