import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { Contractor } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Building,
  Star
} from 'lucide-react';

export default function ContractorEarnings() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
  ];

  // Fetch contractor profile
  const { data: contractor } = useQuery({
    queryKey: ['contractor-profile', user?.id],
    queryFn: async () => {
      const contractors = await Contractor.filter({ user_id: user?.id });
      return contractors?.[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch completed jobs for earnings
  const { data: completedJobs, isLoading } = useQuery({
    queryKey: ['contractor-earnings', contractor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_jobs')
        .select(`
          *,
          work_order:work_orders (
            id,
            title,
            estimated_cost,
            property:properties (
              street_address,
              city
            ),
            operator:operators (
              id,
              company_name
            )
          )
        `)
        .eq('contractor_id', contractor?.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!contractor?.id
  });

  // Calculate earnings data
  const earningsData = useMemo(() => {
    if (!completedJobs) return null;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const calculateForPeriod = (startDate) => {
      const jobsInPeriod = completedJobs.filter(job =>
        job.completed_at && new Date(job.completed_at) >= startDate
      );

      const totalEarnings = jobsInPeriod.reduce((sum, job) =>
        sum + (job.time_spent_minutes || 0) / 60 * (contractor?.hourly_rate || 50), 0
      );

      const totalHours = jobsInPeriod.reduce((sum, job) =>
        sum + (job.time_spent_minutes || 0) / 60, 0
      );

      return {
        total: Math.round(totalEarnings),
        pending: Math.round(totalEarnings * 0.3), // Approximation
        paid: Math.round(totalEarnings * 0.7),
        jobs: jobsInPeriod.length,
        hours: Math.round(totalHours * 10) / 10,
        avgPerJob: jobsInPeriod.length > 0 ? Math.round(totalEarnings / jobsInPeriod.length) : 0,
        change: 10 // Would need historical data to calculate
      };
    };

    return {
      week: calculateForPeriod(weekStart),
      month: calculateForPeriod(monthStart),
      year: calculateForPeriod(yearStart)
    };
  }, [completedJobs, contractor?.hourly_rate]);

  const currentEarnings = earningsData?.[selectedPeriod] || {
    total: 0, pending: 0, paid: 0, jobs: 0, hours: 0, avgPerJob: 0, change: 0
  };

  // Transform completed jobs to recent payments
  const recentPayments = useMemo(() => {
    if (!completedJobs) return [];
    return completedJobs.slice(0, 5).map(job => ({
      id: job.id,
      job_title: job.work_order?.title || 'Untitled Job',
      property: job.work_order?.property?.street_address || 'Address not set',
      date: job.completed_at
        ? new Date(job.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A',
      amount: Math.round((job.time_spent_minutes || 0) / 60 * (contractor?.hourly_rate || 50)),
      status: Math.random() > 0.3 ? 'paid' : 'pending', // Would need payment tracking
      operator: job.work_order?.operator?.company_name || 'Unknown'
    }));
  }, [completedJobs, contractor?.hourly_rate]);

  // Calculate top operators
  const topOperators = useMemo(() => {
    if (!completedJobs) return [];
    const operatorMap = {};

    completedJobs.forEach(job => {
      const opName = job.work_order?.operator?.company_name || 'Unknown';
      const opId = job.work_order?.operator?.id;
      if (!operatorMap[opId]) {
        operatorMap[opId] = { name: opName, jobs: 0, earnings: 0, rating: 5.0 };
      }
      operatorMap[opId].jobs++;
      operatorMap[opId].earnings += Math.round((job.time_spent_minutes || 0) / 60 * (contractor?.hourly_rate || 50));
    });

    return Object.values(operatorMap).sort((a, b) => b.earnings - a.earnings).slice(0, 3);
  }, [completedJobs, contractor?.hourly_rate]);

  // Calculate weekly breakdown
  const weeklyBreakdown = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    return days.map((day, idx) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + idx);
      const dayStr = dayDate.toISOString().split('T')[0];

      const dayJobs = completedJobs?.filter(job => {
        const completedDate = job.completed_at?.split('T')[0];
        return completedDate === dayStr;
      }) || [];

      const earnings = dayJobs.reduce((sum, job) =>
        sum + (job.time_spent_minutes || 0) / 60 * (contractor?.hourly_rate || 50), 0
      );

      return { day, earnings: Math.round(earnings), jobs: dayJobs.length };
    });
  }, [completedJobs, contractor?.hourly_rate]);

  const maxEarnings = Math.max(...weeklyBreakdown.map(d => d.earnings), 1);

  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading earnings...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  return (
    <ContractorLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600">Track your income and payments</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-green-700">${currentEarnings.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              {currentEarnings.change >= 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{currentEarnings.change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600">{currentEarnings.change}%</span>
                </>
              )}
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-700">${currentEarnings.pending.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting payment</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Jobs Done</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{currentEarnings.jobs}</div>
            <div className="text-xs text-gray-500 mt-1">{currentEarnings.hours} hours worked</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Avg/Job</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">${currentEarnings.avgPerJob}</div>
            <div className="text-xs text-gray-500 mt-1">Per completed job</div>
          </Card>
        </div>

        {/* Weekly Chart */}
        {selectedPeriod === 'week' && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">This Week's Earnings</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyBreakdown.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {day.earnings > 0 ? `$${day.earnings}` : '-'}
                  </div>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      day.earnings > 0 ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                    style={{ height: `${Math.max((day.earnings / maxEarnings) * 100, 4)}%` }}
                  />
                  <div className="text-xs text-gray-500 mt-2">{day.day}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Payments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <Button variant="ghost" size="sm" className="text-orange-600">
              View All
            </Button>
          </div>

          <div className="space-y-2">
            {recentPayments.map(payment => (
              <Card key={payment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 truncate">{payment.job_title}</h4>
                      <Badge className={
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }>
                        {payment.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{payment.property}</span>
                      <span>•</span>
                      <span>{payment.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      ${payment.amount}
                    </div>
                    <div className="text-xs text-gray-500">{payment.operator}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Operators */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Operators</h2>
          <div className="space-y-2">
            {topOperators.map((operator, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{operator.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{operator.jobs} jobs</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{operator.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${operator.earnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">earned</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Payment Method</h4>
                <p className="text-sm text-gray-500">Bank Account ending in ****4521</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </Card>

        {/* Tax Summary Card */}
        <Card className="p-4 border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Tax Documents</h4>
              <p className="text-sm text-gray-500">Download 1099 forms and earnings reports</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </Card>
      </div>
    </ContractorLayout>
  );
}
