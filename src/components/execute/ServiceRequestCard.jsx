import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";

const STATUS_COLORS = {
  Submitted: "bg-blue-100 text-blue-800",
  Scheduled: "bg-purple-100 text-purple-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-100 text-gray-800"
};

const URGENCY_COLORS = {
  Emergency: "bg-red-100 text-red-800 border-red-200",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function ServiceRequestCard({ request }) {
  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{request.service_type}</h3>
              <p className="text-sm text-gray-600 mt-1">{request.description}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={STATUS_COLORS[request.status]}>
                {request.status}
              </Badge>
              <Badge className={`${URGENCY_COLORS[request.urgency]} border`}>
                {request.urgency}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Submitted: {new Date(request.created_date).toLocaleDateString()}</span>
            </div>
            {request.scheduled_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {request.preferred_contact_time && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Preferred Contact:</span> {request.preferred_contact_time}
            </div>
          )}

          {request.status === 'Submitted' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Handy Pioneers will contact you within 24 hours to schedule this service.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}