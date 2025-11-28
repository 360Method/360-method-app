import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Home,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Filter,
  Grid,
  List,
  UserPlus,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import OperatorLayout from '@/components/operator/OperatorLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function OperatorClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock clients with enhanced data
  const clients = [
    {
      id: '1',
      owner_name: 'Sarah Johnson',
      owner_email: 'sarah.johnson@email.com',
      owner_phone: '(503) 555-0123',
      property_address: '123 Oak Street',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      health_score: 92,
      health_trend: 'up',
      previous_score: 88,
      next_service: '2025-12-01',
      last_activity: '2025-11-15',
      package: 'Premium HomeCare',
      open_tasks: 2,
      overdue_tasks: 0,
      baseline_complete: 100,
      years_as_client: 2
    },
    {
      id: '2',
      owner_name: 'Mike Peterson',
      owner_email: 'mike.p@email.com',
      owner_phone: '(503) 555-0456',
      property_address: '456 Elm Avenue',
      city: 'Portland',
      state: 'OR',
      zip: '97202',
      health_score: 85,
      health_trend: 'stable',
      previous_score: 85,
      next_service: '2025-11-28',
      last_activity: '2025-11-20',
      package: 'Essential PropertyCare',
      open_tasks: 5,
      overdue_tasks: 1,
      baseline_complete: 85,
      years_as_client: 1
    },
    {
      id: '3',
      owner_name: 'Lisa Chen',
      owner_email: 'lisa.chen@email.com',
      owner_phone: '(503) 555-0789',
      property_address: '789 Pine Road',
      city: 'Portland',
      state: 'OR',
      zip: '97203',
      health_score: 78,
      health_trend: 'down',
      previous_score: 82,
      next_service: '2025-12-05',
      last_activity: '2025-11-18',
      package: 'Premium HomeCare',
      open_tasks: 8,
      overdue_tasks: 3,
      baseline_complete: 70,
      years_as_client: 3
    },
    {
      id: '4',
      owner_name: 'David Williams',
      owner_email: 'd.williams@email.com',
      owner_phone: '(503) 555-0321',
      property_address: '321 Cedar Lane',
      city: 'Portland',
      state: 'OR',
      zip: '97204',
      health_score: 65,
      health_trend: 'down',
      previous_score: 72,
      next_service: '2025-11-25',
      last_activity: '2025-11-10',
      package: 'Basic Care',
      open_tasks: 12,
      overdue_tasks: 5,
      baseline_complete: 45,
      years_as_client: 0.5
    },
    {
      id: '5',
      owner_name: 'Emily Rodriguez',
      owner_email: 'emily.r@email.com',
      owner_phone: '(503) 555-0654',
      property_address: '654 Maple Drive',
      city: 'Portland',
      state: 'OR',
      zip: '97205',
      health_score: 95,
      health_trend: 'up',
      previous_score: 91,
      next_service: '2025-12-10',
      last_activity: '2025-11-22',
      package: 'Premium HomeCare',
      open_tasks: 1,
      overdue_tasks: 0,
      baseline_complete: 100,
      years_as_client: 4
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 75) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getScoreRingColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Filter clients
  let filteredClients = clients.filter(c =>
    c.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply health filter
  if (healthFilter !== 'all') {
    filteredClients = filteredClients.filter(c => {
      if (healthFilter === 'excellent') return c.health_score >= 90;
      if (healthFilter === 'good') return c.health_score >= 75 && c.health_score < 90;
      if (healthFilter === 'fair') return c.health_score >= 60 && c.health_score < 75;
      if (healthFilter === 'critical') return c.health_score < 60;
      return true;
    });
  }

  // Sort clients
  filteredClients.sort((a, b) => {
    if (sortBy === 'name') return a.owner_name.localeCompare(b.owner_name);
    if (sortBy === 'score-high') return b.health_score - a.health_score;
    if (sortBy === 'score-low') return a.health_score - b.health_score;
    if (sortBy === 'next-service') return new Date(a.next_service) - new Date(b.next_service);
    if (sortBy === 'overdue') return b.overdue_tasks - a.overdue_tasks;
    return 0;
  });

  // Stats
  const stats = {
    total: clients.length,
    excellent: clients.filter(c => c.health_score >= 90).length,
    needsAttention: clients.filter(c => c.health_score < 75).length,
    overdueTasks: clients.reduce((sum, c) => sum + c.overdue_tasks, 0)
  };

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
            <p className="text-gray-600">{stats.total} properties in your portfolio</p>
          </div>
          <Link to={createPageUrl('OperatorAddClient')}>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4" />
              Add New Client
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Clients</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Excellent Health</div>
            <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Needs Attention</div>
            <div className="text-2xl font-bold text-orange-600">{stats.needsAttention}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Overdue Tasks</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, address, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Health Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health</SelectItem>
                  <SelectItem value="excellent">Excellent (90+)</SelectItem>
                  <SelectItem value="good">Good (75-89)</SelectItem>
                  <SelectItem value="fair">Fair (60-74)</SelectItem>
                  <SelectItem value="critical">Critical (&lt;60)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="score-high">Score High-Low</SelectItem>
                  <SelectItem value="score-low">Score Low-High</SelectItem>
                  <SelectItem value="next-service">Next Service</SelectItem>
                  <SelectItem value="overdue">Most Overdue</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Client List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClients.map(client => (
              <Link key={client.id} to={`${createPageUrl('OperatorClientDetail')}?id=${client.id}`}>
                <Card className="p-5 hover:shadow-lg transition-all hover:border-blue-200 cursor-pointer h-full">
                  {/* Header with score */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {client.owner_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{client.property_address}, {client.city}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center ml-3">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${
                        client.health_score >= 90 ? 'border-green-500' :
                        client.health_score >= 75 ? 'border-yellow-500' :
                        client.health_score >= 60 ? 'border-orange-500' : 'border-red-500'
                      }`}>
                        <span className="text-lg font-bold">{client.health_score}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(client.health_trend)}
                        <span className={`text-xs ${
                          client.health_trend === 'up' ? 'text-green-600' :
                          client.health_trend === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {client.health_trend === 'up' ? `+${client.health_score - client.previous_score}` :
                           client.health_trend === 'down' ? `${client.health_score - client.previous_score}` : '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-lg font-semibold text-gray-900">{client.open_tasks}</div>
                      <div className="text-xs text-gray-500">Open Tasks</div>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${client.overdue_tasks > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className={`text-lg font-semibold ${client.overdue_tasks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {client.overdue_tasks}
                      </div>
                      <div className="text-xs text-gray-500">Overdue</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-lg font-semibold text-gray-900">{client.baseline_complete}%</div>
                      <div className="text-xs text-gray-500">Baseline</div>
                    </div>
                  </div>

                  {/* Package & Service Date */}
                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                    <Badge variant="secondary" className="text-xs">
                      {client.package}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(client.next_service).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Health</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tasks</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Package</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Service</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{client.owner_name}</div>
                          <div className="text-sm text-gray-500">{client.owner_email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{client.property_address}</div>
                        <div className="text-sm text-gray-500">{client.city}, {client.state} {client.zip}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Badge className={getScoreColor(client.health_score)}>
                            {client.health_score}
                          </Badge>
                          {getTrendIcon(client.health_trend)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-900">{client.open_tasks} open</span>
                          {client.overdue_tasks > 0 && (
                            <Badge className="bg-red-100 text-red-700">
                              {client.overdue_tasks} overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="secondary" className="text-xs">
                          {client.package}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(client.next_service).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`${createPageUrl('OperatorClientDetail')}?id=${client.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Phone className="w-4 h-4 mr-2" />
                                Call Client
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Service
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredClients.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setHealthFilter('all'); }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </OperatorLayout>
  );
}
