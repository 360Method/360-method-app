import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Wrench, Phone, Calendar, ArrowLeft, AlertCircle, Lightbulb, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TaskExecutionCard from "../components/execute/TaskExecutionCard";
import ServiceRequestCard from "../components/execute/ServiceRequestCard";

export default function Execute() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');

  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: serviceRequests = [] } = useQuery({
    queryKey: ['serviceRequests', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.ServiceRequest.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  const scheduledTasks = tasks.filter(t => 
    t.status === 'Scheduled' || t.status === 'In Progress'
  );

  const readyToExecute = scheduledTasks.filter(t => {
    if (!t.scheduled_date) return false;
    const taskDate = new Date(t.scheduled_date);
    const today = new Date();
    return taskDate <= today;
  });

  const upcomingTasks = scheduledTasks.filter(t => {
    if (!t.scheduled_date) return false;
    const taskDate = new Date(t.scheduled_date);
    const today = new Date();
    return taskDate > today;
  });

  const pendingRequests = serviceRequests.filter(r => 
    r.status === 'Submitted' || r.status === 'Scheduled' || r.status === 'In Progress'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1B365D' }}>
                ACT → Execute
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Complete tasks & track progress
              </p>
            </div>
          </div>
        </div>

        {/* Why Execution Matters */}
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl" style={{ color: '#1B365D' }}>
              <Lightbulb className="w-6 h-6 text-green-600" />
              Why Timely Execution Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed">
              <strong>Planning is worthless without action.</strong> Tasks on your calendar only protect your home when you 
              actually complete them. Each delay increases risk and cost.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-orange-900">Every Day Counts</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Overdue maintenance accelerates damage. That "1 week delay" can trigger cascade failures.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Track Completion</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Mark tasks complete to build your property health history and prove maintenance for buyers.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">Build Momentum</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Completing tasks builds confidence and prevents future emergencies. Stay ahead of problems.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-900 mb-2">
                ✅ Execution Best Practices:
              </p>
              <ul className="text-xs md:text-sm text-gray-800 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">1.</span>
                  <span><strong>Start with highest priority</strong> - tackle cascade risks first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">2.</span>
                  <span><strong>Document completion</strong> - photos + notes = proof for insurance/sale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">3.</span>
                  <span><strong>Track actual costs</strong> - helps budget future maintenance</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Navigation - Back to Schedule if no ready tasks */}
        {readyToExecute.length === 0 && scheduledTasks.length === 0 && (
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">No Tasks Ready for Execution</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    You need to prioritize and schedule tasks before you can execute them.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      asChild
                      className="gap-2"
                      style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                    >
                      <Link to={createPageUrl("Prioritize") + `?property=${selectedProperty}`}>
                        <ArrowLeft className="w-4 h-4" />
                        Go to Prioritize
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="gap-2 border-2 border-blue-400"
                      style={{ minHeight: '48px' }}
                    >
                      <Link to={createPageUrl("Schedule") + `?property=${selectedProperty}`}>
                        <Calendar className="w-4 h-4" />
                        Go to Schedule
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {scheduledTasks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="border-2 border-green-300 bg-green-50 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{readyToExecute.length}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Due Now</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 bg-blue-50 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{upcomingTasks.length}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Upcoming</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-300 bg-purple-50 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Wrench className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{scheduledTasks.filter(t => t.status === 'In Progress').length}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">In Progress</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-300 bg-orange-50 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Phone className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-700">{pendingRequests.length}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Service Requests</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tasks" className="gap-2">
              <Wrench className="w-4 h-4" />
              My Tasks ({scheduledTasks.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Phone className="w-4 h-4" />
              Service Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <Card className="border-2 border-gray-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-green-600" />
                  <span style={{ color: '#1B365D' }}>Scheduled Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {scheduledTasks.length > 0 ? (
                  <div className="space-y-4">
                    {/* Due Now Section */}
                    {readyToExecute.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-px flex-1 bg-red-300" />
                          <Badge className="bg-red-600 text-white">
                            🔥 Due Now ({readyToExecute.length})
                          </Badge>
                          <div className="h-px flex-1 bg-red-300" />
                        </div>
                        {readyToExecute.map(task => (
                          <TaskExecutionCard
                            key={task.id}
                            task={task}
                            propertyId={selectedProperty}
                          />
                        ))}
                      </div>
                    )}

                    {/* Upcoming Section */}
                    {upcomingTasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 mt-6">
                          <div className="h-px flex-1 bg-blue-300" />
                          <Badge className="bg-blue-600 text-white">
                            📅 Upcoming ({upcomingTasks.length})
                          </Badge>
                          <div className="h-px flex-1 bg-blue-300" />
                        </div>
                        {upcomingTasks.map(task => (
                          <TaskExecutionCard
                            key={task.id}
                            task={task}
                            propertyId={selectedProperty}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Scheduled Tasks</h3>
                    <p className="mb-4">You're all caught up! Check the Schedule page to plan ahead.</p>
                    <Button
                      asChild
                      variant="outline"
                      className="gap-2"
                      style={{ minHeight: '48px' }}
                    >
                      <Link to={createPageUrl("Schedule") + `?property=${selectedProperty}`}>
                        <Calendar className="w-4 h-4" />
                        Go to Schedule
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <Card className="border-2 border-gray-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span style={{ color: '#1B365D' }}>Professional Service Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {pendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Active Service Requests</h3>
                    <p>Need professional help? Request service from any task.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}