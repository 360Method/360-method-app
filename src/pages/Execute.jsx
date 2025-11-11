import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Wrench, Phone } from "lucide-react";
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

  const pendingRequests = serviceRequests.filter(r => 
    r.status === 'Submitted' || r.status === 'Scheduled' || r.status === 'In Progress'
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ACT → Execute</h1>
            <p className="text-gray-600 mt-1">Complete tasks with DIY guides or professional service</p>
          </div>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
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
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Scheduled Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledTasks.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledTasks.map(task => (
                      <TaskExecutionCard
                        key={task.id}
                        task={task}
                        propertyId={selectedProperty}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Scheduled Tasks</h3>
                    <p>You're all caught up! Check the Schedule page to plan ahead.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Professional Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
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