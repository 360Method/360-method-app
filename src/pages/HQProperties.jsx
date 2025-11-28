import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  Eye,
  Home,
  Users,
  RefreshCw,
  Download,
  TrendingUp,
  DollarSign,
  Thermometer
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQProperties() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetail, setShowPropertyDetail] = useState(false);

  // Fetch properties
  const { data: properties = [], isLoading, refetch } = useQuery({
    queryKey: ['hq-properties', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*, profiles(full_name, email)')
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (typeFilter !== 'all') {
        query = query.eq('property_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Get property stats
  const { data: stats = {} } = useQuery({
    queryKey: ['hq-property-stats'],
    queryFn: async () => {
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_draft', false);

      const { data: typeBreakdown } = await supabase
        .from('properties')
        .select('property_type')
        .eq('is_draft', false);

      const typeCounts = {};
      typeBreakdown?.forEach(p => {
        const type = p.property_type || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      return {
        total: totalProperties || 0,
        typeCounts
      };
    }
  });

  // Filter properties by search
  const filteredProperties = properties.filter(prop => {
    const matchesSearch =
      !searchQuery ||
      prop.street_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.zip_code?.includes(searchQuery);
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      single_family: 'Single Family',
      condo: 'Condo',
      townhouse: 'Townhouse',
      multi_family: 'Multi-Family',
      apartment: 'Apartment'
    };
    return types[type] || type || 'Unknown';
  };

  const getPropertyTypeBadge = (type) => {
    const colors = {
      single_family: 'bg-blue-100 text-blue-700',
      condo: 'bg-purple-100 text-purple-700',
      townhouse: 'bg-green-100 text-green-700',
      multi_family: 'bg-orange-100 text-orange-700',
      apartment: 'bg-yellow-100 text-yellow-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const exportProperties = () => {
    const csv = [
      ['Address', 'City', 'State', 'ZIP', 'Type', 'Year Built', 'Sq Ft', 'Owner', 'Added'],
      ...filteredProperties.map(p => [
        p.street_address || '',
        p.city || '',
        p.state || '',
        p.zip_code || '',
        getPropertyTypeLabel(p.property_type),
        p.year_built || '',
        p.square_footage || '',
        p.profiles?.full_name || p.profiles?.email || '',
        formatDate(p.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Properties exported successfully');
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Properties Overview</h1>
            <p className="text-gray-600">View all properties on the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportProperties} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
                <div className="text-xs text-gray-600">Total Properties</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.typeCounts?.single_family || 0}
                </div>
                <div className="text-xs text-gray-600">Single Family</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.typeCounts?.condo || 0}
                </div>
                <div className="text-xs text-gray-600">Condos</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(stats.typeCounts?.townhouse || 0) + (stats.typeCounts?.multi_family || 0)}
                </div>
                <div className="text-xs text-gray-600">Multi-Unit</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by address, city, or ZIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="multi_family">Multi-Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Properties Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Property</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Owner</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Details</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Added</th>
                    <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {property.street_address}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.city}, {property.state} {property.zip_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getPropertyTypeBadge(property.property_type)}>
                          {getPropertyTypeLabel(property.property_type)}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 truncate max-w-[150px]">
                            {property.profiles?.full_name || property.profiles?.email || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {property.year_built && <span>Built {property.year_built}</span>}
                          {property.square_footage && <span> • {property.square_footage.toLocaleString()} sqft</span>}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatDate(property.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowPropertyDetail(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Property Detail Dialog */}
        <Dialog open={showPropertyDetail} onOpenChange={setShowPropertyDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Property Details</DialogTitle>
            </DialogHeader>
            {selectedProperty && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedProperty.street_address}</h3>
                    <p className="text-gray-600">{selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}</p>
                    <Badge className={getPropertyTypeBadge(selectedProperty.property_type)}>
                      {getPropertyTypeLabel(selectedProperty.property_type)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Year Built</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProperty.year_built || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Square Footage</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedProperty.square_footage?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Bedrooms</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProperty.bedrooms || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProperty.bathrooms || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Owner</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedProperty.profiles?.full_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedProperty.profiles?.email}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Property ID</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{selectedProperty.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Baseline Progress</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedProperty.baseline_completion || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Health Score</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedProperty.health_score || '--'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
