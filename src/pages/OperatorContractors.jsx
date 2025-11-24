import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Users,
  CheckCircle,
  Star,
  Clock,
  Wrench,
  Mail
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function OperatorContractors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContractor, setNewContractor] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    trade: ''
  });

  const contractors = [
    {
      id: '1',
      company_name: 'ABC HVAC Services',
      contact_name: 'John Smith',
      email: 'john@abchvac.com',
      phone: '555-0123',
      trade: 'HVAC',
      jobs_completed: 24,
      avg_completion_time: 2.5,
      rating: 4.8,
      status: 'active'
    },
    {
      id: '2',
      company_name: 'QuickFix Plumbing',
      contact_name: 'Sarah Martinez',
      email: 'sarah@quickfix.com',
      phone: '555-0456',
      trade: 'Plumbing',
      jobs_completed: 18,
      avg_completion_time: 1.8,
      rating: 4.9,
      status: 'active'
    },
    {
      id: '3',
      company_name: 'Elite Roofing Co',
      contact_name: 'Mike Johnson',
      email: 'mike@eliteroofing.com',
      phone: '555-0789',
      trade: 'Roofing',
      jobs_completed: 12,
      avg_completion_time: 3.2,
      rating: 4.7,
      status: 'active'
    }
  ];

  const handleAddContractor = () => {
    if (!newContractor.company_name || !newContractor.email) {
      toast.error('Company name and email are required');
      return;
    }
    toast.success('Invitation sent to contractor');
    setShowAddDialog(false);
    setNewContractor({ company_name: '', contact_name: '', email: '', phone: '', trade: '' });
  };

  const filteredContractors = contractors.filter(c =>
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.trade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contractors</h1>
            <p className="text-gray-600">{contractors.length} in your network</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contractor
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Contractor Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContractors.map(contractor => (
            <Card key={contractor.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {contractor.company_name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {contractor.contact_name}
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {contractor.trade}
                  </Badge>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {contractor.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  {contractor.jobs_completed} jobs completed
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  Avg: {contractor.avg_completion_time} days
                </div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{contractor.rating}</span>
                  <span className="text-gray-600">rating</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Contractor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contractor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                value={newContractor.company_name}
                onChange={(e) => setNewContractor({ ...newContractor, company_name: e.target.value })}
                placeholder="Company LLC"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Name
              </label>
              <Input
                value={newContractor.contact_name}
                onChange={(e) => setNewContractor({ ...newContractor, contact_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={newContractor.email}
                onChange={(e) => setNewContractor({ ...newContractor, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={newContractor.phone}
                onChange={(e) => setNewContractor({ ...newContractor, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trade Specialty
              </label>
              <select
                value={newContractor.trade}
                onChange={(e) => setNewContractor({ ...newContractor, trade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select trade...</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Roofing">Roofing</option>
                <option value="General">General Contracting</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddContractor} className="flex-1">
                Send Invitation
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}