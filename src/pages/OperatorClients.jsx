import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Home, Calendar, TrendingUp, ChevronRight } from 'lucide-react';

export default function OperatorClients() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock clients
  const clients = [
    {
      id: '1',
      owner_name: 'Sarah Johnson',
      property_address: '123 Oak Street, Portland, OR 97201',
      health_score: 92,
      next_service: '2025-12-01',
      last_activity: '2025-11-15',
      package: 'Premium HomeCare'
    },
    {
      id: '2',
      owner_name: 'Mike Peterson',
      property_address: '456 Elm Avenue, Portland, OR 97202',
      health_score: 85,
      next_service: '2025-11-28',
      last_activity: '2025-11-20',
      package: 'Essential PropertyCare'
    },
    {
      id: '3',
      owner_name: 'Lisa Chen',
      property_address: '789 Pine Road, Portland, OR 97203',
      health_score: 78,
      next_service: '2025-12-05',
      last_activity: '2025-11-18',
      package: 'Premium HomeCare'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 75) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const filteredClients = clients.filter(c =>
    c.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.property_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Clients</h1>
          <p className="text-gray-600">{clients.length} active properties</p>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Client List */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {client.owner_name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="w-4 h-4" />
                    {client.property_address}
                  </div>
                </div>
                <Badge className={getScoreColor(client.health_score)}>
                  {client.health_score}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium text-gray-900">{client.package}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Next Service:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(client.next_service).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="text-gray-500">
                    {new Date(client.last_activity).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2">
                View Property
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}