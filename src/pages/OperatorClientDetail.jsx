import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, OperatorClient } from '@/api/supabaseClient';
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
  Star,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// System type to icon mapping
const SYSTEM_ICONS = {
  hvac: Thermometer,
  roof: Home,
  plumbing: Droplets,
  electrical: Zap,
  foundation: Shield,
  default: Home
};

export default function OperatorClientDetail() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch client data from operator_clients table
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['operator-client', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const data = await OperatorClient.get(clientId);
      return data;
    },
    enabled: !!clientId
  });

  // Fetch property data if client has a linked property
  const { data: property } = useQuery({
    queryKey: ['client-property', client?.property_id],
    queryFn: async () => {
      if (!client?.property_id) return null;
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', client.property_id)
        .single();
      return data;
    },
    enabled: !!client?.property_id
  });

  // Fetch systems baseline for the property
  const { data: systems = [] } = useQuery({
    queryKey: ['client-systems', client?.property_id],
    queryFn: async () => {
      if (!client?.property_id) return [];
      const { data } = await supabase
        .from('system_baselines')
        .select('*')
        .eq('property_id', client.property_id)
        .order('system_type');
      return data || [];
    },
    enabled: !!client?.property_id
  });

  // Fetch work orders for this client
  const { data: workOrders = [] } = useQuery({
    queryKey: ['client-work-orders', clientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!clientId
  });

  // Fetch invoices for this client
  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices', clientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!clientId
  });

  // Build tasks from work orders
  const tasks = workOrders.map(wo => ({
    id: wo.id,
    title: wo.title || wo.description,
    priority: wo.priority || 'Medium',
    dueDate: wo.scheduled_date || wo.due_date,
    status: wo.status,
    category: wo.category || 'Service'
  }));

  // Build activity from work orders and invoices
  const activity = [
    ...workOrders.slice(0, 3).map(wo => ({
      id: `wo-${wo.id}`,
      type: 'workorder',
      message: `Work order: ${wo.title || wo.description}`,
      date: wo.created_at,
      icon: Wrench
    })),
    ...invoices.slice(0, 3).map(inv => ({
      id: `inv-${inv.id}`,
      type: 'payment',
      message: `Invoice ${inv.invoice_number || inv.id.slice(0,8)} - $${inv.amount || inv.total || 0}`,
      date: inv.created_at,
      icon: DollarSign
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Loading state
  if (clientLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  // Not found state
  if (!client) {
    return (
      <OperatorLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The client you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = createPageUrl('OperatorClients')}>
            Back to Clients
          </Button>
        </div>
      </OperatorLayout>
    );
  }

  // Build display data from real client record
  const displayClient = {
    id: client.id,
    owner: {
      name: client.contact_name || 'Unknown',
      email: client.contact_email || '',
      phone: client.contact_phone || '',
      since: client.created_at,
      avatar: null
    },
    property: {
      address: client.property_address || property?.street_address || '',
      city: client.property_city || property?.city || '',
      state: client.property_state || property?.state || '',
      zip: client.property_zip || property?.zip_code || '',
      type: property?.property_type || 'Single Family',
      yearBuilt: property?.year_built || null,
      sqft: property?.square_footage || null,
      bedrooms: property?.bedrooms || null,
      bathrooms: property?.bathrooms || null
    },
    healthScore: property?.health_score || 75,
    previousScore: 70,
    baselineCompletion: systems.length > 0 ? Math.min(100, systems.length * 20) : 0,
    servicePlan: client.service_tier || 'On Demand',
    nextService: client.next_service_date,
    lastInspection: client.last_inspection_date,
    status: client.status || 'active'
  };

  // Map systems to display format
  const displaySystems = systems.map(sys => ({
    id: sys.id,
    name: sys.system_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
    condition: sys.condition || 'Good',
    age: sys.age_years || (sys.install_date ? Math.floor((Date.now() - new Date(sys.install_date)) / (365.25 * 24 * 60 * 60 * 1000)) : null),
    lifespan: sys.expected_lifespan || 20,
    score: sys.condition_score || 75,
    lastServiced: sys.last_serviced_date || sys.updated_at,
    icon: SYSTEM_ICONS[sys.system_type?.toLowerCase()] || SYSTEM_ICONS.default
  }));

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
                <h1 className="text-2xl font-bold text-gray-900">{displayClient.property.address}</h1>
                <p className="text-gray-600">{displayClient.property.city}, {displayClient.property.state} {displayClient.property.zip}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-green-100 text-green-700">Active Client</Badge>
                  <Badge variant="outline">{displayClient.servicePlan}</Badge>
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
                  <span className={`text-2xl font-bold ${getScoreColor(displayClient.healthScore)}`}>
                    {displayClient.healthScore}
                  </span>
                  <div className="flex items-center text-green-600 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{displayClient.healthScore - displayClient.previousScore}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                  <circle
                    cx="24" cy="24" r="20"
                    stroke={displayClient.healthScore >= 70 ? '#22C55E' : displayClient.healthScore >= 50 ? '#EAB308' : '#EF4444'}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${displayClient.healthScore * 1.26} 126`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Baseline Complete</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">{displayClient.baselineCompletion}%</span>
            </div>
            <Progress value={displayClient.baselineCompletion} className="mt-2 h-2" />
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Next Service</p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-bold text-gray-900">
                {displayClient.nextService ? new Date(displayClient.nextService).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not scheduled'}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{displayClient.owner.name}</h3>
                <p className="text-sm text-gray-600">Property Owner</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {displayClient.owner.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {displayClient.owner.email}
                </div>
              )}
              {displayClient.owner.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {displayClient.owner.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Client since {new Date(displayClient.owner.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                  {displaySystems.length > 0 ? displaySystems.slice(0, 4).map((system) => {
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
                            <span className="text-xs text-gray-500">Age: {system.age || 'N/A'} yrs / {system.lifespan} yr lifespan</span>
                            <span className={`text-sm font-medium ${getScoreColor(system.score)}`}>{system.score}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-gray-500 text-center py-4">No systems documented yet</p>
                  )}
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
                    <p className="font-medium text-gray-900">{displayClient.property.type || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Year Built</p>
                    <p className="font-medium text-gray-900">{displayClient.property.yearBuilt || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Square Footage</p>
                    <p className="font-medium text-gray-900">{displayClient.property.sqft ? `${displayClient.property.sqft.toLocaleString()} sqft` : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Bed / Bath</p>
                    <p className="font-medium text-gray-900">{displayClient.property.bedrooms || '-'} bd / {displayClient.property.bathrooms || '-'} ba</p>
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
                {displaySystems.length > 0 ? displaySystems.map((system) => {
                  const Icon = system.icon;
                  const lifeRemaining = system.age ? ((system.lifespan - system.age) / system.lifespan) * 100 : 50;
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
                              <p className="font-medium">{system.age || 'N/A'} years</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Expected Lifespan</p>
                              <p className="font-medium">{system.lifespan} years</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Life Remaining</p>
                              <p className="font-medium">{system.age ? Math.max(0, system.lifespan - system.age) : 'N/A'} years</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Serviced</p>
                              <p className="font-medium">{system.lastServiced ? new Date(system.lastServiced).toLocaleDateString() : 'N/A'}</p>
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
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No systems have been documented for this property yet.</p>
                  </div>
                )}
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
