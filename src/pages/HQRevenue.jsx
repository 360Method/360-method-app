import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, functions } from '@/api/supabaseClient';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  PieChart,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQRevenue() {
  const [timeRange, setTimeRange] = useState('30d');

  // Calculate date ranges based on timeRange
  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    const previousStart = new Date();
    const previousEnd = new Date();

    switch (range) {
      case '7d':
        start.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        previousStart.setDate(now.getDate() - 60);
        previousEnd.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        previousStart.setDate(now.getDate() - 180);
        previousEnd.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        previousStart.setFullYear(now.getFullYear() - 2);
        previousEnd.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
        previousStart.setDate(now.getDate() - 60);
        previousEnd.setDate(now.getDate() - 30);
    }
    return { start, previousStart, previousEnd, now };
  };

  // Fetch revenue metrics from real data
  const { data: metrics = {}, isLoading, refetch } = useQuery({
    queryKey: ['hq-revenue', timeRange],
    queryFn: async () => {
      const { start, previousStart, previousEnd, now } = getDateRange(timeRange);

      // Get current period transactions
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'succeeded')
        .gte('created_at', start.toISOString())
        .lte('created_at', now.toISOString());

      // Get previous period transactions
      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'succeeded')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      // Get refunds
      const { data: refunds } = await supabase
        .from('transactions')
        .select('*')
        .in('status', ['refunded', 'partially_refunded'])
        .gte('created_at', start.toISOString());

      // Get active subscriptions
      const { count: activeSubscribers } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get subscribers count from previous period (approximate)
      const { count: previousSubscribers } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('created_at', previousEnd.toISOString());

      // Calculate totals (amounts are in cents)
      const totalRevenue = (currentTransactions || []).reduce((sum, t) => sum + (t.amount_total || 0), 0) / 100;
      const previousRevenue = (previousTransactions || []).reduce((sum, t) => sum + (t.amount_total || 0), 0) / 100;

      const subscriptionRevenue = (currentTransactions || [])
        .filter(t => t.type === 'subscription')
        .reduce((sum, t) => sum + (t.amount_total || 0), 0) / 100;

      const transactionRevenue = (currentTransactions || [])
        .filter(t => t.type !== 'subscription')
        .reduce((sum, t) => sum + (t.amount_total || 0), 0) / 100;

      const refundAmount = (refunds || []).reduce((sum, t) => sum + (t.refund_amount || 0), 0) / 100;

      const avgRevenuePerUser = activeSubscribers > 0 ? totalRevenue / activeSubscribers : 0;

      return {
        totalRevenue,
        previousRevenue,
        subscriptionRevenue,
        transactionRevenue,
        activeSubscribers: activeSubscribers || 0,
        previousSubscribers: previousSubscribers || 0,
        avgRevenuePerUser,
        transactions: (currentTransactions || []).length,
        refunds: (refunds || []).length,
        refundAmount
      };
    }
  });

  // Fetch recent transactions from real data
  const { data: transactions = [] } = useQuery({
    queryKey: ['hq-transactions'],
    queryFn: async () => {
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount_total,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get user emails for display
      const userIds = [...new Set((recentTransactions || []).map(t => t.user_id).filter(Boolean))];
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds.length > 0 ? userIds : ['']);

      const userMap = (users || []).reduce((acc, u) => ({ ...acc, [u.id]: u.email }), {});

      return (recentTransactions || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: (t.amount_total || 0) / 100,
        user: userMap[t.user_id] || 'Unknown',
        date: t.created_at,
        status: t.status === 'succeeded' ? 'completed' : t.status
      }));
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const revenueChange = calculateChange(metrics.totalRevenue, metrics.previousRevenue);
  const subscriberChange = calculateChange(metrics.activeSubscribers, metrics.previousSubscribers);

  const exportRevenue = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total Revenue', formatCurrency(metrics.totalRevenue)],
      ['Subscription Revenue', formatCurrency(metrics.subscriptionRevenue)],
      ['Transaction Revenue', formatCurrency(metrics.transactionRevenue)],
      ['Active Subscribers', metrics.activeSubscribers],
      ['Avg Revenue Per User', formatCurrency(metrics.avgRevenuePerUser)],
      ['Total Transactions', metrics.transactions],
      ['Refunds', metrics.refunds],
      ['Refund Amount', formatCurrency(metrics.refundAmount)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Revenue report exported');
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Revenue & Analytics</h1>
            <p className="text-gray-600">Financial overview and platform metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportRevenue} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              {revenueChange > 0 ? (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {revenueChange}%
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  {Math.abs(revenueChange)}%
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-xs text-gray-600">Total Revenue</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              {subscriberChange > 0 ? (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {subscriberChange}%
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  {Math.abs(subscriberChange)}%
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.activeSubscribers}</div>
            <div className="text-xs text-gray-600">Active Subscribers</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.transactions}</div>
            <div className="text-xs text-gray-600">Transactions</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.avgRevenuePerUser)}</div>
            <div className="text-xs text-gray-600">Avg Revenue/User</div>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Subscriptions</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(metrics.subscriptionRevenue)}</span>
                  <p className="text-xs text-gray-500">
                    {((metrics.subscriptionRevenue / metrics.totalRevenue) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">One-time Payments</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(metrics.transactionRevenue)}</span>
                  <p className="text-xs text-gray-500">
                    {((metrics.transactionRevenue / metrics.totalRevenue) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Refunds</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-red-600">-{formatCurrency(metrics.refundAmount)}</span>
                  <p className="text-xs text-gray-500">{metrics.refunds} refunds</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">{metrics.transactions}</div>
                <div className="text-xs text-gray-600">Total Transactions</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <PieChart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">{metrics.activeSubscribers}</div>
                <div className="text-xs text-gray-600">Subscribers</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalRevenue / (metrics.activeSubscribers || 1))}
                </div>
                <div className="text-xs text-gray-600">LTV Estimate</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalRevenue / 30)}
                </div>
                <div className="text-xs text-gray-600">Daily Average</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{tx.user}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{tx.type}</Badge>
                    </td>
                    <td className={`py-3 px-4 text-sm font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(tx.date)}</td>
                    <td className="py-3 px-4">
                      <Badge className={
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'refunded' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </HQLayout>
  );
}
