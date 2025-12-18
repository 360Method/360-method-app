import React, { useState } from 'react';
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
  FileText,
  Download,
  Calendar,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';

const REPORT_TYPES = [
  {
    id: 'users',
    title: 'User Report',
    description: 'All users with signup dates, roles, and property counts',
    icon: Users,
    color: 'blue',
    formats: ['csv', 'pdf']
  },
  {
    id: 'properties',
    title: 'Property Report',
    description: 'All properties with details, owners, and health scores',
    icon: Building2,
    color: 'green',
    formats: ['csv', 'pdf']
  },
  {
    id: 'operators',
    title: 'Operator Report',
    description: 'All operators with verification status and client counts',
    icon: TrendingUp,
    color: 'purple',
    formats: ['csv', 'pdf']
  },
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Revenue breakdown by period, type, and user segment',
    icon: DollarSign,
    color: 'yellow',
    formats: ['csv', 'pdf', 'xlsx']
  },
  {
    id: 'growth',
    title: 'Growth Metrics',
    description: 'User acquisition, retention, and engagement metrics',
    icon: BarChart3,
    color: 'indigo',
    formats: ['pdf']
  },
  {
    id: 'usage',
    title: 'Platform Usage',
    description: 'Feature usage, page views, and user journey analytics',
    icon: PieChart,
    color: 'pink',
    formats: ['pdf']
  }
];

const SCHEDULED_REPORTS = [
  {
    id: 1,
    name: 'Weekly User Summary',
    type: 'users',
    frequency: 'Weekly',
    nextRun: 'Monday 9:00 AM',
    recipients: ['admin@360method.com']
  },
  {
    id: 2,
    name: 'Monthly Revenue Report',
    type: 'revenue',
    frequency: 'Monthly',
    nextRun: '1st of month',
    recipients: ['admin@360method.com', 'finance@360method.com']
  }
];

export default function HQReports() {
  const [dateRange, setDateRange] = useState('30d');
  const [generating, setGenerating] = useState(null);

  // Helper to convert data to CSV
  const convertToCSV = (data, columns) => {
    if (!data || data.length === 0) return '';
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        const value = c.accessor(row);
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  // Helper to download file
  const downloadFile = (content, filename, mimeType = 'text/csv') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get date filter
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7d': return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d': return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d': return new Date(now.setDate(now.getDate() - 90)).toISOString();
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default: return null; // all time
    }
  };

  const generateReport = async (reportId, format) => {
    setGenerating(reportId);

    try {
      let data = [];
      let columns = [];
      const dateFilter = getDateFilter();

      switch (reportId) {
        case 'users': {
          let query = supabase.from('users').select('*').order('created_at', { ascending: false });
          if (dateFilter) query = query.gte('created_at', dateFilter);
          const { data: users, error } = await query;
          if (error) throw error;
          data = users || [];
          columns = [
            { label: 'ID', accessor: r => r.id },
            { label: 'Email', accessor: r => r.email },
            { label: 'Full Name', accessor: r => r.full_name },
            { label: 'Role', accessor: r => r.role },
            { label: 'Tier', accessor: r => r.subscription_tier },
            { label: 'Created At', accessor: r => r.created_at }
          ];
          break;
        }
        case 'properties': {
          let query = supabase.from('properties').select('*, users(email, full_name)').order('created_at', { ascending: false });
          if (dateFilter) query = query.gte('created_at', dateFilter);
          const { data: properties, error } = await query;
          if (error) throw error;
          data = properties || [];
          columns = [
            { label: 'ID', accessor: r => r.id },
            { label: 'Address', accessor: r => r.address },
            { label: 'City', accessor: r => r.city },
            { label: 'State', accessor: r => r.state },
            { label: 'ZIP', accessor: r => r.zip_code },
            { label: 'Type', accessor: r => r.property_type },
            { label: 'Health Score', accessor: r => r.health_score },
            { label: 'Owner Email', accessor: r => r.users?.email },
            { label: 'Created At', accessor: r => r.created_at }
          ];
          break;
        }
        case 'operators': {
          let query = supabase.from('operators').select('*, users(email, full_name)').order('created_at', { ascending: false });
          if (dateFilter) query = query.gte('created_at', dateFilter);
          const { data: operators, error } = await query;
          if (error) throw error;
          data = operators || [];
          columns = [
            { label: 'ID', accessor: r => r.id },
            { label: 'Company Name', accessor: r => r.company_name },
            { label: 'Contact Email', accessor: r => r.contact_email },
            { label: 'Status', accessor: r => r.verification_status },
            { label: 'Service Areas', accessor: r => (r.service_areas || []).join('; ') },
            { label: 'Owner', accessor: r => r.users?.full_name },
            { label: 'Created At', accessor: r => r.created_at }
          ];
          break;
        }
        case 'revenue': {
          let query = supabase.from('subscription_payments').select('*').order('created_at', { ascending: false });
          if (dateFilter) query = query.gte('created_at', dateFilter);
          const { data: payments, error } = await query;
          if (error) throw error;
          data = payments || [];
          columns = [
            { label: 'ID', accessor: r => r.id },
            { label: 'User ID', accessor: r => r.user_id },
            { label: 'Amount', accessor: r => r.amount },
            { label: 'Currency', accessor: r => r.currency },
            { label: 'Status', accessor: r => r.status },
            { label: 'Created At', accessor: r => r.created_at }
          ];
          break;
        }
        default:
          toast.error('Report type not implemented yet');
          setGenerating(null);
          return;
      }

      if (data.length === 0) {
        toast.info('No data found for this report');
        setGenerating(null);
        return;
      }

      if (format === 'csv') {
        const csv = convertToCSV(data, columns);
        const filename = `${reportId}_report_${new Date().toISOString().split('T')[0]}.csv`;
        downloadFile(csv, filename, 'text/csv');
        toast.success(`Downloaded ${data.length} records as CSV`);
      } else {
        toast.info(`${format.toUpperCase()} export requires additional setup. CSV is recommended.`);
      }

    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and download platform reports</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Available Reports */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Report</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            const isGenerating = generating === report.id;

            return (
              <Card key={report.id} className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(report.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.formats.map((format) => (
                    <Button
                      key={format}
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                      onClick={() => generateReport(report.id, format)}
                      className="gap-1"
                    >
                      {isGenerating ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Scheduled Reports */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Scheduled Reports</h2>
        <Card className="mb-8">
          {SCHEDULED_REPORTS.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No scheduled reports</p>
              <Button variant="outline" className="mt-4">
                Schedule a Report
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {SCHEDULED_REPORTS.map((report) => (
                <div key={report.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="outline">{report.frequency}</Badge>
                        <span>Next: {report.nextRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Reports */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Reports</h2>
        <Card>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Monthly Revenue Report</h4>
                  <p className="text-sm text-gray-500">Generated Nov 1, 2024 at 9:00 AM</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Weekly User Summary</h4>
                  <p className="text-sm text-gray-500">Generated Oct 28, 2024 at 9:00 AM</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Property Export</h4>
                  <p className="text-sm text-gray-500">Generated Oct 25, 2024 at 2:15 PM</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </HQLayout>
  );
}
