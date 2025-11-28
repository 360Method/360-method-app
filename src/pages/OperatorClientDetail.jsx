import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import OperatorLayout from '@/components/operator/OperatorLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft,
  Home,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  ClipboardList,
  Wrench,
  DollarSign,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Plus,
  ChevronRight,
  Thermometer,
  Droplets,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function OperatorClientDetail() {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock client data - replace with real query
  const client = {
    id: clientId || '1',
    owner: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      since: '2024-03-15',
      avatar: null
    },
    property: {
      address: '123 Oak Street',
      city: 'Long Beach',
      state: 'CA',
      zip: '90804',
      type: 'Single Family',
      yearBuilt: 1985,
      sqft: 2400,
      bedrooms: 4,
      bathrooms: 2.5
    },
    healthScore: 72,
    previousScore: 65,
    baselineCompletion: 85,
    servicePlan: 'Premium Care',
    nextService: '2024-12-15',
    lastInspection: '2024-11-01',
    status: 'active'
  };

  // Mock systems data - the 360° Method baseline
  const systems = [
    { id: 1, name: 'HVAC', condition: 'Good', age: 8, lifespan: 15, score: 75, lastServiced: '2024-06-15', icon: Thermometer },
    { id: 2, name: 'Roof', condition: 'Fair', age: 22, lifespan: 25, score: 55, lastServiced: '2024-01-10', icon: Home },
    { id: 3, name: 'Plumbing', condition: 'Good', age: 12, lifespan: 50, score: 82, lastServiced: '2024-08-20', icon: Droplets },
    { id: 4, name: 'Electrical', condition: 'Excellent', age: 5, lifespan: 40, score: 95, lastServiced: '2024-04-05', icon: Zap },
    { id: 5, name: 'Foundation', condition: 'Good', age: 39, lifespan: 100, score: 78, lastServiced: '2024-02-28', icon: Shield },
  ];

  // Mock tasks
  const tasks = [
    { id: 1, title: 'Replace HVAC filter', priority: 'Medium', dueDate: '2024-12-10', status: 'pending', category: 'Preventive' },
    { id: 2, title: 'Inspect roof for storm damage', priority: 'High', dueDate: '2024-12-05', status: 'pending', category: 'Safety' },
    { id: 3, title: 'Clean gutters', priority: 'Medium', dueDate: '2024-12-20', status: 'scheduled', category: 'Seasonal' },
    { id: 4, title: 'Water heater flush', priority: 'Low', dueDate: '2025-01-15', status: 'pending', category: 'Preventive' },
  ];

  // Mock invoices
  const invoices = [
    { id: 'INV-001', date: '2024-11-01', amount: 450, status: 'paid', description: 'Quarterly Inspection' },
    { id: 'INV-002', date: '2024-08-01', amount: 1250, status: 'paid', description: 'HVAC Maintenance + Filter' },
    { id: 'INV-003', date: '2024-05-15', amount: 350, status: 'paid', description: 'Quarterly Inspection' },
  ];

  // Mock activity
  const activity = [
    { id: 1, type: 'inspection', message: 'Quarterly inspection completed', date: '2024-11-01', icon: ClipboardList },
    { id: 2, type: 'payment', message: 'Invoice INV-001 paid', date: '2024-11-03', icon: DollarSign },
    { id: 3, type: 'message', message: 'Client messaged about roof concerns', date: '2024-10-28', icon: MessageSquare },
    { id: 4, type: 'workorder', message: 'HVAC filter replacement scheduled', date: '2024-10-15', icon: Wrench },
  ];

  const getConditionColor = (condition) => {
    const colors = {
      'Excellent': 'text-green-600 bg-green-100',
      'Good': 'text-blue-600 bg-blue-100',
      'Fair': 'text-yellow-600 bg-yellow-100',
      'Poor': 'text-orange-600 bg-orange-100',
      'Critical': 'text-red-600 bg-red-100',
    };
    return colors[condition] || colors['Good'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700',
    };
    return colors[priority] || colors['Medium'];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2"
            onClick={() => window.location.href = createPageUrl('OperatorClients')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.property.address}</h1>
                <p className="text-gray-600">{client.property.city}, {client.property.state} {client.property.zip}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-green-100 text-green-700">Active Client</Badge>
                  <Badge variant="outline">{client.servicePlan}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.location.href = createPageUrl('OperatorMessages')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button onClick={() => window.location.href = createPageUrl('OperatorInspection')}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Start Inspection
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Property
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Create Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Service
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Health Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(client.healthScore)}`}>
                    {client.healthScore}
                  </span>
                  <div className="flex items-center text-green-600 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{client.healthScore - client.previousScore}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                  <circle
                    cx="24" cy="24" r="20"
                    stroke={client.healthScore >= 70 ? '#22C55E' : client.healthScore >= 50 ? '#EAB308' : '#EF4444'}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${client.healthScore * 1.26} 126`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Baseline Complete</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">{client.baselineCompletion}%</span>
            </div>
            <Progress value={client.baselineCompletion} className="mt-2 h-2" />
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Next Service</p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-bold text-gray-900">
                {new Date(client.nextService).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Open Tasks</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status !== 'completed').length}
              </span>
              <Badge className={getPriorityColor('High')}>
                {tasks.filter(t => t.priority === 'High').length} urgent
              </Badge>
            </div>
          </Card>
        </div>

        {/* Owner Info Card */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{client.owner.name}</h3>
                <p className="text-sm text-gray-600">Property Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {client.owner.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {client.owner.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Client since {new Date(client.owner.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">360° Overview</TabsTrigger>
            <TabsTrigger value="systems">Systems Baseline</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & Work Orders</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Systems Summary */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Systems Overview</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('systems')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {systems.slice(0, 4).map((system) => {
                    const Icon = system.icon;
                    return (
                      <div key={system.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getConditionColor(system.condition)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{system.name}</span>
                            <Badge className={getConditionColor(system.condition)}>{system.condition}</Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">Age: {system.age} yrs / {system.lifespan} yr lifespan</span>
                            <span className={`text-sm font-medium ${getScoreColor(system.score)}`}>{system.score}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Priority Tasks */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Priority Tasks</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('tasks')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {tasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'High' ? 'bg-red-500' :
                        task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{task.category}</Badge>
                          <span className="text-xs text-gray-500">
                            Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activity.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{item.message}</p>
                          <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Property Details */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Property Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Property Type</p>
                    <p className="font-medium text-gray-900">{client.property.type}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Year Built</p>
                    <p className="font-medium text-gray-900">{client.property.yearBuilt}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Square Footage</p>
                    <p className="font-medium text-gray-900">{client.property.sqft.toLocaleString()} sqft</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Bed / Bath</p>
                    <p className="font-medium text-gray-900">{client.property.bedrooms} bd / {client.property.bathrooms} ba</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Systems Baseline (360° Method)</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add System
                </Button>
              </div>
              <div className="space-y-4">
                {systems.map((system) => {
                  const Icon = system.icon;
                  const lifeRemaining = ((system.lifespan - system.age) / system.lifespan) * 100;
                  return (
                    <div key={system.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getConditionColor(system.condition)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{system.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getConditionColor(system.condition)}>{system.condition}</Badge>
                              <span className={`text-lg font-bold ${getScoreColor(system.score)}`}>{system.score}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Age</p>
                              <p className="font-medium">{system.age} years</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Expected Lifespan</p>
                              <p className="font-medium">{system.lifespan} years</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Life Remaining</p>
                              <p className="font-medium">{Math.max(0, system.lifespan - system.age)} years</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Serviced</p>
                              <p className="font-medium">{new Date(system.lastServiced).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Lifecycle Progress</span>
                              <span className="text-gray-700">{Math.round(100 - lifeRemaining)}% used</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  lifeRemaining > 50 ? 'bg-green-500' :
                                  lifeRemaining > 25 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${100 - lifeRemaining}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Tasks & Work Orders</h3>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Wrench className="w-4 h-4 mr-2" />
                    Create Work Order
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className={`w-4 h-4 rounded-full ${
                      task.priority === 'High' ? 'bg-red-500' :
                      task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <Badge variant="outline">{task.category}</Badge>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <Badge variant="outline" className="capitalize">{task.status}</Badge>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-6">Service History</h3>
              <div className="space-y-4">
                {activity.concat(activity).map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.message}</p>
                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="sm">Details</Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Invoices & Payments</h3>
                <Button onClick={() => window.location.href = createPageUrl('OperatorInvoiceCreate')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Invoice</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.id}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-600">{invoice.description}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">${invoice.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
}
