import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Calendar, AlertCircle, Wrench } from "lucide-react";
import ServiceRequestDialog from "../components/services/ServiceRequestDialog";

export default function Services() {
  const [showRequestDialog, setShowRequestDialog] = React.useState(false);

  const { data: serviceRequests = [], isLoading } = useQuery({
    queryKey: ['serviceRequests'],
    queryFn: () => base44.entities.ServiceRequest.list('-created_date'),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const pendingRequests = serviceRequests.filter(r => r.status === 'Submitted');
  const scheduledRequests = serviceRequests.filter(r => r.status === 'Scheduled');
  const inProgressRequests = serviceRequests.filter(r => r.status === 'In Progress');
  const completedRequests = serviceRequests.filter(r => r.status === 'Completed');

  const getPropertyAddress = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.address || 'Unknown Property';
  };

  const statusIcons = {
    'Submitted': <Clock className="w-4 h-4" />,
    'Scheduled': <Calendar className="w-4 h-4" />,
    'In Progress': <Wrench className="w-4 h-4" />,
    'Completed': <CheckCircle className="w-4 h-4" />,
    'Cancelled': <XCircle className="w-4 h-4" />
  };

  const statusColors = {
    'Submitted': 'bg-blue-100 text-blue-800',
    'Scheduled': 'bg-purple-100 text-purple-800',
    'In Progress': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  };

  const urgencyColors = {
    'Emergency': 'bg-red-100 text-red-800 border-red-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Low': 'bg-green-100 text-green-800 border-green-300'
  };

  const renderServiceRequest = (request) => (
    <Card key={request.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold" style={{ color: '#1B365D' }}>
                  Request #{request.id.slice(0, 8)} - {request.service_type}
                </h3>
                <Badge className={statusColors[request.status]}>
                  {statusIcons[request.status]}
                  <span className="ml-1">{request.status}</span>
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Property:</strong> {getPropertyAddress(request.property_id)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Submitted:</strong> {new Date(request.created_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              {request.scheduled_date && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Scheduled:</strong> {new Date(request.scheduled_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
              <Badge className={`${urgencyColors[request.urgency]} border`}>
                Priority: {request.urgency}
              </Badge>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <p className="text-sm text-gray-700">
              <strong>Description:</strong>
            </p>
            <p className="text-sm text-gray-600 mt-1">{request.description}</p>
          </div>

          {request.preferred_contact_time && (
            <p className="text-sm text-gray-600">
              <strong>Timeline:</strong> {request.preferred_contact_time}
            </p>
          )}

          {request.status === 'Completed' && (
            <div className="border-t pt-3">
              {request.completion_date && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Completed:</strong> {new Date(request.completion_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
              {request.final_cost && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Cost:</strong> ${request.final_cost}
                </p>
              )}
              {request.completion_notes && (
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {request.completion_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Professional Services
            </h1>
            <p className="text-xl text-gray-600">
              Let Handy Pioneers handle the work for you
            </p>
          </div>
          <Button
            onClick={() => setShowRequestDialog(true)}
            className="h-14 px-8 text-lg font-bold"
            style={{ backgroundColor: '#28A745' }}
          >
            Request Service
          </Button>
        </div>

        {/* Service Offerings */}
        <Card className="border-2" style={{ borderColor: '#1B365D', backgroundColor: '#F0F4F8' }}>
          <CardHeader>
            <CardTitle style={{ color: '#1B365D' }}>How We Help You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* One-Time Services */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1B365D' }}>ONE-TIME SERVICES:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-3xl mb-2">📋</div>
                    <h4 className="font-bold mb-2">Professional Baseline Assessment</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete property documentation and priority report
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Time: 2-3 hours | Cost: $299
                    </p>
                    <Button
                      onClick={() => setShowRequestDialog(true)}
                      variant="outline"
                      className="w-full"
                    >
                      Schedule Baseline
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-3xl mb-2">🔍</div>
                    <h4 className="font-bold mb-2">Seasonal Inspection</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Quarterly walkthrough with issue identification
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Time: 60-90 min | Cost: $149
                    </p>
                    <Button
                      onClick={() => setShowRequestDialog(true)}
                      variant="outline"
                      className="w-full"
                    >
                      Schedule Inspection
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-3xl mb-2">🔧</div>
                    <h4 className="font-bold mb-2">Task-Based Repairs</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Fix specific issues from your Priority Queue
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Pricing: Varies by task
                    </p>
                    <Button
                      onClick={() => setShowRequestDialog(true)}
                      variant="outline"
                      className="w-full"
                    >
                      Request Repair
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Membership Programs */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1B365D' }}>MEMBERSHIP PROGRAMS:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2" style={{ borderColor: '#28A745' }}>
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">🏠</div>
                    <h4 className="font-bold text-xl mb-2">HomeCare Membership</h4>
                    <p className="text-2xl font-bold mb-4" style={{ color: '#28A745' }}>$1,490/year</p>
                    <p className="text-sm text-gray-600 mb-4">Perfect for homeowners who want systematic care</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">✓ 4 seasonal inspections per year</p>
                      <p className="text-sm">✓ Priority scheduling (no 2-week waits)</p>
                      <p className="text-sm">✓ 10% discount on all repairs</p>
                      <p className="text-sm">✓ Quarterly maintenance included</p>
                      <p className="text-sm">✓ Emergency support line</p>
                    </div>
                    <Button className="w-full" style={{ backgroundColor: '#28A745' }}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: '#FF6B35' }}>
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">🏢</div>
                    <h4 className="font-bold text-xl mb-2">PropertyCare Membership</h4>
                    <p className="text-2xl font-bold mb-4" style={{ color: '#FF6B35' }}>Starting at $2,190/year</p>
                    <p className="text-sm text-gray-600 mb-4">For real estate investors managing rental properties</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">✓ Everything in HomeCare plus:</p>
                      <p className="text-sm">✓ Multi-property portfolio management</p>
                      <p className="text-sm">✓ Tenant coordination and access scheduling</p>
                      <p className="text-sm">✓ Detailed reporting for accounting</p>
                      <p className="text-sm">✓ Annual property health reports</p>
                    </div>
                    <Button className="w-full" style={{ backgroundColor: '#FF6B35' }}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <hr className="border-gray-200" />

        {/* Service Requests */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B365D' }}>YOUR SERVICE REQUESTS:</h2>

          {serviceRequests.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">No Service Requests Yet</h3>
                <p className="text-gray-600 mb-6">Request your first service to get started</p>
                <Button
                  onClick={() => setShowRequestDialog(true)}
                  style={{ backgroundColor: '#28A745' }}
                >
                  Request Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Pending & In Progress */}
              {(pendingRequests.length > 0 || inProgressRequests.length > 0 || scheduledRequests.length > 0) && (
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1B365D' }}>ACTIVE REQUESTS:</h3>
                  <div className="space-y-4">
                    {pendingRequests.map(renderServiceRequest)}
                    {scheduledRequests.map(renderServiceRequest)}
                    {inProgressRequests.map(renderServiceRequest)}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedRequests.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1B365D' }}>COMPLETED:</h3>
                  <div className="space-y-4">
                    {completedRequests.map(renderServiceRequest)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ServiceRequestDialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
      />
    </div>
  );
}