import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Phone, Calendar, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TaskExecutionCard({ task, propertyId }) {
  const [showComplete, setShowComplete] = React.useState(false);
  const [showServiceRequest, setShowServiceRequest] = React.useState(false);
  const [completionData, setCompletionData] = React.useState({
    actual_cost: "",
    completion_notes: ""
  });
  const [serviceData, setServiceData] = React.useState({
    description: task.description || "",
    urgency: "Medium",
    preferred_contact_time: ""
  });

  const queryClient = useQueryClient();

  const completeTaskMutation = useMutation({
    mutationFn: () => base44.entities.MaintenanceTask.update(task.id, {
      status: 'Completed',
      completion_date: new Date().toISOString().split('T')[0],
      actual_cost: parseFloat(completionData.actual_cost) || 0,
      completion_notes: completionData.completion_notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setShowComplete(false);
    },
  });

  const createServiceRequestMutation = useMutation({
    mutationFn: () => base44.entities.ServiceRequest.create({
      property_id: propertyId,
      task_id: task.id,
      service_type: task.system_type,
      description: serviceData.description,
      urgency: serviceData.urgency,
      preferred_contact_time: serviceData.preferred_contact_time,
      status: 'Submitted'
    }),
    onSuccess: async () => {
      await base44.entities.MaintenanceTask.update(task.id, {
        execution_type: 'Professional',
        status: 'In Progress'
      });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      setShowServiceRequest(false);
    },
  });

  return (
    <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{task.system_type}</Badge>
                {task.scheduled_date && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.scheduled_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
            <Badge className={
              task.priority === 'High' ? 'bg-red-100 text-red-800' :
              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }>
              {task.priority}
            </Badge>
          </div>

          {task.current_fix_cost && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Estimated Cost: ${task.current_fix_cost.toLocaleString()}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Dialog open={showComplete} onOpenChange={setShowComplete}>
              <DialogTrigger asChild>
                <Button className="gap-2 flex-1" style={{ backgroundColor: 'var(--accent)' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete (DIY)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Task: {task.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Actual Cost ($)
                    </label>
                    <Input
                      type="number"
                      value={completionData.actual_cost}
                      onChange={(e) => setCompletionData({ ...completionData, actual_cost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Completion Notes
                    </label>
                    <Textarea
                      value={completionData.completion_notes}
                      onChange={(e) => setCompletionData({ ...completionData, completion_notes: e.target.value })}
                      placeholder="What did you do? Any observations?"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowComplete(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => completeTaskMutation.mutate()}
                      disabled={completeTaskMutation.isPending}
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {completeTaskMutation.isPending ? 'Saving...' : 'Complete Task'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showServiceRequest} onOpenChange={setShowServiceRequest}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 flex-1">
                  <Phone className="w-4 h-4" />
                  Request Professional Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Professional Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">
                      Your service request will be sent to Handy Pioneers. They'll contact you to schedule the work.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Issue Description
                    </label>
                    <Textarea
                      value={serviceData.description}
                      onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                      placeholder="Describe what needs to be done..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Preferred Contact Time
                    </label>
                    <Input
                      value={serviceData.preferred_contact_time}
                      onChange={(e) => setServiceData({ ...serviceData, preferred_contact_time: e.target.value })}
                      placeholder="e.g., Weekday mornings, after 5pm"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowServiceRequest(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createServiceRequestMutation.mutate()}
                      disabled={createServiceRequestMutation.isPending}
                      style={{ backgroundColor: 'var(--secondary)' }}
                    >
                      {createServiceRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}