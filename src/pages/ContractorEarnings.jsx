import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
  ];

  // Mock earnings data
  const earningsData = {
    week: {
      total: 1280,
      pending: 530,
      paid: 750,
      jobs: 6,
      hours: 18.5,
      avgPerJob: 213,
      change: 12
    },
    month: {
      total: 4850,
      pending: 1200,
      paid: 3650,
      jobs: 24,
      hours: 72,
      avgPerJob: 202,
      change: 8
    },
    year: {
      total: 48200,
      pending: 1200,
      paid: 47000,
      jobs: 245,
      hours: 735,
      avgPerJob: 197,
      change: 15
    }
  };

  const currentEarnings = earningsData[selectedPeriod];

  const recentPayments = [
    {
      id: '1',
      job_title: 'Exterior Paint Touch-up',
      property: '555 Cedar Lane',
      date: 'Dec 1, 2024',
      amount: 450,
      status: 'paid',
      operator: 'Handy Pioneers'
    },
    {
      id: '2',
      job_title: 'Toilet Repair',
      property: '777 Birch Blvd',
      date: 'Nov 30, 2024',
      amount: 150,
      status: 'paid',
      operator: 'Handy Pioneers'
    },
    {
      id: '3',
      job_title: 'HVAC Filter Service',
      property: '123 Oak Street',
      date: 'Nov 28, 2024',
      amount: 120,
      status: 'paid',
      operator: 'Handy Pioneers'
    },
    {
      id: '4',
      job_title: 'Gutter Repair',
      property: '456 Elm Avenue',
      date: 'Nov 27, 2024',
      amount: 350,
      status: 'pending',
      operator: 'Handy Pioneers'
    },
    {
      id: '5',
      job_title: 'Kitchen Faucet Replacement',
      property: '789 Pine Road',
      date: 'Nov 26, 2024',
      amount: 180,
      status: 'pending',
      operator: 'Handy Pioneers'
    }
  ];

  const topOperators = [
    { name: 'Handy Pioneers', jobs: 18, earnings: 3200, rating: 4.9 },
    { name: 'Portland Property Care', jobs: 4, earnings: 850, rating: 4.8 },
    { name: 'Metro Home Services', jobs: 2, earnings: 420, rating: 5.0 }
  ];

  const weeklyBreakdown = [
    { day: 'Mon', earnings: 350, jobs: 2 },
    { day: 'Tue', earnings: 180, jobs: 1 },
    { day: 'Wed', earnings: 0, jobs: 0 },
    { day: 'Thu', earnings: 420, jobs: 2 },
    { day: 'Fri', earnings: 330, jobs: 1 },
    { day: 'Sat', earnings: 0, jobs: 0 },
    { day: 'Sun', earnings: 0, jobs: 0 }
  ];

  const maxEarnings = Math.max(...weeklyBreakdown.map(d => d.earnings), 1);

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
