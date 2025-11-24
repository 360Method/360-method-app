import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, FileText, Send, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorInvoiceCreate() {
  const [selectedClient, setSelectedClient] = useState(null);

  const { data: myOperator } = useQuery({
    queryKey: ['myOperator'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const operators = await base44.entities.Operator.filter({ created_by: user.email });
      return operators[0] || null;
    }
  });
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentDueDate, setPaymentDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState('Due upon receipt');

  const clients = [
    { id: '1', name: 'Sarah Johnson', property: '123 Oak St' },
    { id: '2', name: 'Mike Peterson', property: '456 Elm Ave' },
    { id: '3', name: 'Lisa Chen', property: '789 Pine Rd' }
  ];

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSend = () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }
    if (lineItems.some(item => !item.description || item.rate === 0)) {
      toast.error('Please fill in all line items');
      return;
    }
    toast.success('Invoice sent successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
          <p className="text-gray-600">Generate and send an invoice to your client</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Client *
            </label>
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const client = clients.find(c => c.id === e.target.value);
                setSelectedClient(client);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.property}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Line Items</h3>
              <Button variant="outline" size="sm" onClick={addLineItem} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <div className="w-24 flex items-center justify-end px-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-900">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                  {lineItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3 max-w-md ml-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tax Rate (%):</span>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold text-gray-900">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg border-t pt-3">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button onClick={handleSend} className="flex-1 gap-2">
            <Send className="w-4 h-4" />
            Send Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}