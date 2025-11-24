import React, { useState } from 'react';
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
  Download
} from 'lucide-react';

const STATUS_CONFIG = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  'sent': { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Eye },
  'viewed': { label: 'Viewed', color: 'bg-purple-100 text-purple-700', icon: Eye },
  'paid': { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'overdue': { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

export default function OperatorInvoices() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const invoices = [
    {
      id: 'INV-001',
      client_name: 'Sarah Johnson',
      amount: 450,
      date_sent: '2025-11-15',
      status: 'paid',
      payment_date: '2025-11-20'
    },
    {
      id: 'INV-002',
      client_name: 'Mike Peterson',
      amount: 320,
      date_sent: '2025-11-18',
      status: 'viewed',
      payment_date: null
    },
    {
      id: 'INV-003',
      client_name: 'Lisa Chen',
      amount: 680,
      date_sent: '2025-11-10',
      status: 'overdue',
      payment_date: null
    },
    {
      id: 'INV-004',
      client_name: 'Robert Wilson',
      amount: 250,
      date_sent: null,
      status: 'draft',
      payment_date: null
    }
  ];

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalUnpaid = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'draft')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
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
      </div>
    </div>
  );
}