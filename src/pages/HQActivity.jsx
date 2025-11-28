import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Users,
  Building2,
  Wrench,
  DollarSign,
  Mail,
  Shield,
  Calendar,
  RefreshCw,
  Filter,
  Clock
} from 'lucide-react';

export default function HQActivity() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch activity feed
  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['hq-activity', typeFilter, timeRange],
    queryFn: async () => {
      const now = new Date();
      let cutoff = new Date();

      switch (timeRange) {
        case '1h': cutoff.setHours(now.getHours() - 1); break;
        case '24h': cutoff.setHours(now.getHours() - 24); break;
        case '7d': cutoff.setDate(now.getDate() - 7); break;
        case '30d': cutoff.setDate(now.getDate() - 30); break;
      }

      const activities = [];

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .gte('created_at', cutoff.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      recentUsers?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_signup',
          icon: Users,
          color: 'blue',
          title: 'New user signed up',
          description: user.full_name || user.email,
          timestamp: user.created_at,
          metadata: { email: user.email }
        });
      });

      // Get recent properties
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('id, street_address, city, state, created_at')
        .gte('created_at', cutoff.toISOString())
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(50);

      recentProperties?.forEach(prop => {
        activities.push({
          id: `prop-${prop.id}`,
          type: 'property_added',
          icon: Building2,
          color: 'green',
          title: 'Property added',
          description: `${prop.street_address}, ${prop.city}, ${prop.state}`,
          timestamp: prop.created_at
        });
      });

      // Get recent operators
      const { data: recentOperators } = await supabase
        .from('operators')
        .select('id, business_name, created_at')
        .gte('created_at', cutoff.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      recentOperators?.forEach(op => {
        activities.push({
          id: `op-${op.id}`,
          type: 'operator_joined',
          icon: Wrench,
          color: 'purple',
          title: 'Operator joined',
          description: op.business_name,
          timestamp: op.created_at
        });
      });

      // Sort by timestamp
      const sorted = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Filter by type if needed
      if (typeFilter !== 'all') {
        return sorted.filter(a => a.type === typeFilter);
      }

      return sorted;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  const getTypeBadge = (type) => {
    const types = {
      user_signup: { label: 'User', color: 'bg-blue-100 text-blue-700' },
      property_added: { label: 'Property', color: 'bg-green-100 text-green-700' },
      operator_joined: { label: 'Operator', color: 'bg-purple-100 text-purple-700' },
      payment_received: { label: 'Payment', color: 'bg-yellow-100 text-yellow-700' },
      support_ticket: { label: 'Support', color: 'bg-red-100 text-red-700' }
    };
    return types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  };

  const activityCounts = {
    total: activities.length,
    users: activities.filter(a => a.type === 'user_signup').length,
    properties: activities.filter(a => a.type === 'property_added').length,
    operators: activities.filter(a => a.type === 'operator_joined').length
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Activity Feed</h1>
            <p className="text-gray-600">Real-time platform activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activityCounts.total}</div>
                <div className="text-xs text-gray-600">Total Events</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activityCounts.users}</div>
                <div className="text-xs text-gray-600">New Users</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activityCounts.properties}</div>
                <div className="text-xs text-gray-600">Properties</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activityCounts.operators}</div>
                <div className="text-xs text-gray-600">Operators</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="user_signup">User Signups</SelectItem>
                <SelectItem value="property_added">Properties</SelectItem>
                <SelectItem value="operator_joined">Operators</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Activity List */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <Card className="p-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No activity in this time range</p>
          </Card>
        ) : (
          <Card className="divide-y divide-gray-100">
            {activities.map((activity) => {
              const Icon = activity.icon;
              const typeBadge = getTypeBadge(activity.type);
              return (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses(activity.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{activity.title}</span>
                        <Badge className={typeBadge.color}>{typeBadge.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      {activity.metadata?.email && (
                        <p className="text-xs text-gray-500 mt-1">{activity.metadata.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </HQLayout>
  );
}
