import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListOrdered, AlertTriangle, DollarSign, Clock, TrendingUp } from "lucide-react";
import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  Routine: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function Prioritize() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [filterPriority, setFilterPriority] = React.useState('all');

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

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Filter identified tasks (not completed)
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  // Sort by cascade risk and priority
  const sortedTasks = [...activeTasks].sort((a, b) => {
    if (b.cascade_risk_score !== a.cascade_risk_score) {
      return (b.cascade_risk_score || 0) - (a.cascade_risk_score || 0);
    }
    const priorityOrder = { High: 3, Medium: 2, Low: 1, Routine: 0 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Apply filter
  let filteredTasks = sortedTasks;
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
  }

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const handlePriorityChange = (taskId, newPriority) => {
    updateTaskMutation.mutate({ id: taskId, data: { priority: newPriority } });
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  // Calculate stats
  const highPriorityCount = activeTasks.filter(t => t.priority === 'High').length;
  const cascadeRiskCount = activeTasks.filter(t => t.has_cascade_alert).length;
  const totalPotentialCost = activeTasks.reduce((sum, t) => sum + (t.delayed_fix_cost || 0), 0);
  const totalCurrentCost = activeTasks.reduce((sum, t) => sum + (t.current_fix_cost || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ACT → Prioritize</h1>
            <p className="text-gray-600 mt-1">Smart priority queue with cascade risk analysis</p>
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
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Filter Priority</label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Routine">Routine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{highPriorityCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cascade Risks</p>
                  <p className="text-2xl font-bold text-gray-900">{cascadeRiskCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fix Now Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${totalCurrentCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">If Delayed</p>
                  <p className="text-2xl font-bold text-gray-900">${totalPotentialCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Queue */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5" />
              Priority Queue ({filteredTasks.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task, index) => (
                  <PriorityTaskCard
                    key={task.id}
                    task={task}
                    rank={index + 1}
                    onPriorityChange={handlePriorityChange}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ListOrdered className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Tasks in Queue</h3>
                <p>Great work! You're staying on top of your maintenance.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}