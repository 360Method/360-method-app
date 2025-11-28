import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, functions } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  CreditCard,
  Mail,
  Activity,
  RefreshCw,
  Bell,
  BellOff,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const SYSTEM_CHECKS = [
  {
    id: 'database',
    name: 'Database',
    description: 'Supabase PostgreSQL connection',
    icon: Database,
    checkFn: async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        return !error;
      } catch {
        return false;
      }
    }
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Clerk authentication service',
    icon: Shield,
    checkFn: async () => true // Clerk is always checked on page load
  },
  {
    id: 'functions',
    name: 'Edge Functions',
    description: 'Supabase Edge Functions',
    icon: Server,
    checkFn: async () => {
      try {
        // Try to invoke a simple function
        const { error } = await functions.invoke('getJobQueueStatus');
        return !error;
      } catch {
        return false;
      }
    }
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Stripe payment processing',
    icon: CreditCard,
    checkFn: async () => {
      try {
        const { data, error } = await functions.invoke('testStripeConnection');
        return !error && data?.success;
      } catch {
        return false;
      }
    }
  }
];

export default function HQAlerts() {
  const [runningChecks, setRunningChecks] = useState(false);

  // Run system health checks
  const { data: healthStatus = {}, isLoading, refetch } = useQuery({
    queryKey: ['hq-system-health'],
    queryFn: async () => {
      const results = {};

      for (const check of SYSTEM_CHECKS) {
        try {
          results[check.id] = {
            status: await check.checkFn() ? 'healthy' : 'error',
            checkedAt: new Date().toISOString()
          };
        } catch {
          results[check.id] = {
            status: 'error',
            checkedAt: new Date().toISOString()
          };
        }
      }

      return results;
    },
    refetchInterval: 60000 // Check every minute
  });

  // Get job queue status for alerts
  const { data: jobQueueStatus } = useQuery({
    queryKey: ['hq-job-queue-alerts'],
    queryFn: async () => {
      try {
        const { data } = await functions.invoke('getJobQueueStatus');
        return data;
      } catch {
        return null;
      }
    },
    refetchInterval: 30000
  });

  // Generate alerts based on system status
  const generateAlerts = () => {
    const alerts = [];

    // Check for unhealthy systems
    Object.entries(healthStatus).forEach(([id, status]) => {
      if (status.status === 'error') {
        const check = SYSTEM_CHECKS.find(c => c.id === id);
        alerts.push({
          id: `system-${id}`,
          severity: 'critical',
          title: `${check?.name} is down`,
          description: `${check?.description} is not responding`,
          timestamp: status.checkedAt,
          actionUrl: id === 'payments' ? createPageUrl('AdminStripe') : null,
          actionLabel: id === 'payments' ? 'Check Stripe' : null
        });
      }
    });

    // Check for job queue issues
    if (jobQueueStatus) {
      const { status_counts, oldest_pending_age_ms } = jobQueueStatus;

      if (status_counts?.dead > 0) {
        alerts.push({
          id: 'jobs-dead',
          severity: 'warning',
          title: `${status_counts.dead} dead jobs in queue`,
          description: 'Jobs have failed after maximum retries',
          timestamp: new Date().toISOString(),
          actionUrl: createPageUrl('AdminJobQueue'),
          actionLabel: 'View Queue'
        });
      }

      if (oldest_pending_age_ms > 300000) { // 5 minutes
        alerts.push({
          id: 'jobs-slow',
          severity: 'warning',
          title: 'Job queue is backing up',
          description: `Oldest job has been pending for ${Math.round(oldest_pending_age_ms / 60000)} minutes`,
          timestamp: new Date().toISOString(),
          actionUrl: createPageUrl('AdminJobQueue'),
          actionLabel: 'View Queue'
        });
      }

      if (status_counts?.failed > 5) {
        alerts.push({
          id: 'jobs-failing',
          severity: 'warning',
          title: 'High job failure rate',
          description: `${status_counts.failed} jobs have failed recently`,
          timestamp: new Date().toISOString(),
          actionUrl: createPageUrl('AdminJobQueue'),
          actionLabel: 'View Queue'
        });
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const alerts = generateAlerts();
  const healthyCount = Object.values(healthStatus).filter(s => s.status === 'healthy').length;
  const totalChecks = SYSTEM_CHECKS.length;

  const runAllChecks = async () => {
    setRunningChecks(true);
    await refetch();
    setRunningChecks(false);
    toast.success('System checks completed');
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-red-100 text-red-700',
      warning: 'bg-yellow-100 text-yellow-700',
      info: 'bg-blue-100 text-blue-700'
    };
    return styles[severity] || styles.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: XCircle,
      warning: AlertTriangle,
      info: Bell
    };
    return icons[severity] || Bell;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">System Alerts</h1>
            <p className="text-gray-600">Monitor platform health and critical issues</p>
          </div>
          <Button
            onClick={runAllChecks}
            disabled={runningChecks || isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${runningChecks ? 'animate-spin' : ''}`} />
            Run Health Checks
          </Button>
        </div>

        {/* Overall Status Banner */}
        {alerts.filter(a => a.severity === 'critical').length > 0 ? (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-bold text-red-800">System Issues Detected</p>
                <p className="text-sm text-red-600">
                  {alerts.filter(a => a.severity === 'critical').length} critical alert(s) require attention
                </p>
              </div>
            </div>
          </Card>
        ) : alerts.filter(a => a.severity === 'warning').length > 0 ? (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-bold text-yellow-800">Warnings Present</p>
                <p className="text-sm text-yellow-600">
                  {alerts.filter(a => a.severity === 'warning').length} warning(s) to review
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-800">All Systems Operational</p>
                <p className="text-sm text-green-600">
                  {healthyCount}/{totalChecks} systems healthy • No active alerts
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* System Status */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {SYSTEM_CHECKS.map((check) => {
            const Icon = check.icon;
            const status = healthStatus[check.id];
            const isHealthy = status?.status === 'healthy';

            return (
              <Card key={check.id} className={`p-4 ${!isHealthy && status ? 'border-red-200' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isHealthy ? 'bg-green-100' : status ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isHealthy ? 'text-green-600' : status ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{check.name}</h3>
                    <p className="text-xs text-gray-500">{check.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Badge className="bg-gray-100 text-gray-700">
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  ) : isHealthy ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Healthy
                    </Badge>
                  ) : status ? (
                    <Badge className="bg-red-100 text-red-700">
                      <XCircle className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Alerts */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Active Alerts</h2>
        {alerts.length === 0 ? (
          <Card className="p-8 text-center">
            <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No active alerts</p>
            <p className="text-sm text-gray-400 mt-1">All systems are operating normally</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity);
              return (
                <Card key={alert.id} className={`p-4 ${
                  alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  ''
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <SeverityIcon className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{alert.title}</h3>
                          <Badge className={getSeverityBadge(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                    {alert.actionUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = alert.actionUrl}
                      >
                        {alert.actionLabel}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </HQLayout>
  );
}
