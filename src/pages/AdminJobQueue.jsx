import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { functions } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Play,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminJobQueue() {
  const queryClient = useQueryClient();

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['jobQueueStatus'],
    queryFn: async () => {
      const { data } = await functions.invoke('getJobQueueStatus');
      return data;
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const runWorkerMutation = useMutation({
    mutationFn: () => functions.invoke('runJobWorker', { batch_size: 20 }),
    onSuccess: (result) => {
      toast.success(`Processed ${result.data.processed_count} jobs`);
      queryClient.invalidateQueries({ queryKey: ['jobQueueStatus'] });
    }
  });

  const retryDeadMutation = useMutation({
    mutationFn: (job_ids = null) => functions.invoke('retryDeadJobs', { job_ids }),
    onSuccess: (result) => {
      toast.success(`Retried ${result.data.retried_count} jobs`);
      queryClient.invalidateQueries({ queryKey: ['jobQueueStatus'] });
    }
  });

  const statusCounts = statusData?.status_counts || {};
  const queueCounts = statusData?.pending_by_queue || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-orange-100 text-orange-700';
      case 'dead': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Queue Admin</h1>
        <p className="text-gray-600">Monitor and manage background job processing</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button 
          onClick={() => runWorkerMutation.mutate()}
          disabled={runWorkerMutation.isPending}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Process Jobs Now
        </Button>
        <Button 
          onClick={() => retryDeadMutation.mutate()}
          disabled={retryDeadMutation.isPending}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Dead Jobs
        </Button>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['jobQueueStatus'] })}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading queue status...</p>
        </div>
      ) : (
        <>
          {/* Status Overview */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.pending || 0}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">Processing</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.processing || 0}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Completed</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.completed || 0}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Failed</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.failed || 0}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Dead</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.dead || 0}
              </div>
            </Card>
          </div>

          {/* Queue Breakdown */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending by Queue</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(queueCounts).map(([queue, count]) => (
                <div key={queue} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{queue}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
            {Object.keys(queueCounts).length === 0 && (
              <p className="text-gray-500 text-sm">No pending jobs in any queue</p>
            )}
          </Card>

          {/* Recent Failures */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Failures</h2>
            {statusData?.recent_failures && statusData.recent_failures.length > 0 ? (
              <div className="space-y-3">
                {statusData.recent_failures.map((job) => (
                  <div key={job.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{job.job_type}</span>
                        <Badge className={`ml-2 ${getStatusColor(job.status)}`}>
                          {job.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {job.attempts} attempts
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">{job.error}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Failed: {new Date(job.failed_at).toLocaleString()}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => retryDeadMutation.mutate([job.id])}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent failures</p>
            )}
          </Card>

          {/* Oldest Pending */}
          {statusData?.oldest_pending_age_ms && (
            <Card className="p-6 mt-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Oldest Pending Job</p>
                  <p className="text-sm text-gray-600">
                    Waiting for {Math.round(statusData.oldest_pending_age_ms / 60000)} minutes
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}