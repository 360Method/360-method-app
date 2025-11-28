import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Star, Phone, Mail, Clock, CheckCircle2, AlertCircle, Home, Building2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/api/supabaseClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const URGENCY_STYLES = {
  overdue: {
    border: 'border-red-400',
    bg: 'bg-gradient-to-br from-red-50 to-orange-50',
    badge: 'bg-red-600 text-white',
    icon: 'text-red-600'
  },
  today: {
    border: 'border-blue-400',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    badge: 'bg-blue-600 text-white',
    icon: 'text-blue-600'
  }
};

export default function OperatorTaskCard({ task, urgency = 'today', properties = [] }) {
  const queryClient = useQueryClient();
  const styles = URGENCY_STYLES[urgency];
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(task.contractor_rating || 0);
  
  const property = properties.find(p => p.id === task.property_id);
  
  const completeTaskMutation = useMutation({
    mutationFn: async (data) => {
      return await MaintenanceTask.update(task.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    }
  });
  
  const handleMarkComplete = () => {
    if (rating === 0) {
      alert('Please rate the service first');
      return;
    }
    
    completeTaskMutation.mutate({
      status: 'Completed',
      completion_date: new Date().toISOString(),
      contractor_rating: rating
    });
    
    setShowRating(false);
  };
  
  return (
    <Card className={`border-2 ${styles.border} ${styles.bg} transition-all hover:shadow-lg`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg md:text-xl mb-2 break-words">{task.title}</h3>
            
            {/* Property Badge */}
            {property && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs mb-2">
                <Home className="w-3 h-3" />
                <span className="truncate max-w-[150px]">
                  {property.address || property.street_address || 'Property'}
                </span>
              </div>
            )}
            
            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 mt-2">
              {urgency === 'overdue' && (
                <Badge className={`${styles.badge} animate-pulse gap-1`}>
                  <AlertCircle className="w-3 h-3" />
                  OVERDUE
                </Badge>
              )}
              {urgency === 'today' && (
                <Badge className={styles.badge}>
                  <Clock className="w-3 h-3 mr-1" />
                  DUE TODAY
                </Badge>
              )}
              
              <Badge className="bg-blue-600 text-white gap-1">
                <Star className="w-3 h-3" />
                360° Operator
              </Badge>
              
              {task.unit_tag && (
                <Badge className="bg-purple-600 text-white text-xs gap-1">
                  <Building2 className="w-3 h-3" />
                  {task.unit_tag}
                </Badge>
              )}
              
              {task.system_type && (
                <Badge variant="outline" className="text-xs">
                  {task.system_type}
                </Badge>
              )}
            </div>
          </div>
          
          <div className={`flex-shrink-0 p-3 rounded-lg bg-blue-100 ${styles.icon}`}>
            <Star className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          
          {task.description && (
            <p className="text-sm text-gray-700 line-clamp-2">{task.description}</p>
          )}
          
          {/* Status Info Box */}
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
            
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">Scheduled:</span>
              <span className="text-sm">
                {format(parseISO(task.scheduled_date), 'EEEE, MMM d, yyyy')}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-900">
                  Status: Request Submitted
                </span>
              </div>
              <p className="text-xs text-blue-800 ml-4 leading-relaxed">
                A 360° Operator will contact you within 24 hours to confirm scheduling details.
              </p>
            </div>
            
            {task.operator_cost && (
              <div className="text-sm text-blue-900 mt-2">
                <span className="font-semibold">Estimated Cost:</span> ${task.operator_cost}
                <span className="text-xs text-blue-700 ml-1">(No service call fee)</span>
              </div>
            )}
            
            {task.estimated_hours && (
              <div className="text-sm text-blue-900 mt-1">
                <span className="font-semibold">Estimated Time:</span> {task.estimated_hours} hours
              </div>
            )}
          </div>
          
          {/* Contact Options */}
          {(task.contractor_phone || task.contractor_email) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Contact Operator:</p>
              <div className="flex gap-2 flex-wrap">
                {task.contractor_phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `tel:${task.contractor_phone}`}
                    className="flex-1 min-w-[120px] gap-2 border-2"
                    style={{ minHeight: '44px' }}
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                )}
                
                {task.contractor_email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${task.contractor_email}`}
                    className="flex-1 min-w-[120px] gap-2 border-2"
                    style={{ minHeight: '44px' }}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="pt-3 border-t border-blue-200 space-y-2">
            
            {!showRating ? (
              <>
                <Button
                  onClick={() => setShowRating(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Service Complete
                </Button>
                
                <p className="text-xs text-center text-gray-600">
                  Need to reschedule? Contact operator directly or update in Schedule phase.
                </p>
              </>
            ) : (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  Rate the operator service:
                </label>
                
                <div className="flex gap-2 justify-center mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-4xl transition-all hover:scale-110"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600 mb-3">
                    {rating === 5 && '🎉 Excellent service!'}
                    {rating === 4 && '👍 Great work!'}
                    {rating === 3 && '✓ Good service'}
                    {rating === 2 && '😐 Could be better'}
                    {rating === 1 && '😞 Needs improvement'}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowRating(false)}
                    variant="outline"
                    className="flex-1"
                    style={{ minHeight: '48px' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMarkComplete}
                    disabled={rating === 0 || completeTaskMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    style={{ minHeight: '48px' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete & Rate
                  </Button>
                </div>
              </div>
            )}
            
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}

// TODO: When ServiceRequest entity exists, replace status section with:
// - Real-time operator location/ETA
// - Operator name and photo
// - Service status updates (Confirmed → En Route → In Progress → Complete)
// - Cost breakdown when work is complete
// - Invoice/receipt download link