import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Grid3x3,
  List,
  Map,
  Search,
  Plus,
  ChevronDown
} from "lucide-react";
import EnhancedPropertyCard from "./EnhancedPropertyCard";

export default function PropertyDashboard({ 
  properties, 
  onAddProperty, 
  onQuickAdd,
  onEditProperty,
  onDeleteProperty 
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUseType, setFilterUseType] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalDoors = properties.reduce((sum, p) => sum + (p.door_count || 1), 0);
    const avgHealthScore = properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)
      : 0;
    const totalValue = properties.reduce((sum, p) => sum + (p.current_value || 0), 0);
    const completedProperties = properties.filter(p => p.baseline_completion >= 80).length;

    return {
      totalProperties: properties.length,
      totalDoors,
      avgHealthScore,
      totalValue,
      completedProperties
    };
  }, [properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by use type
    if (filterUseType !== 'all') {
      filtered = filtered.filter(p => p.property_use_type === filterUseType);
    }

    // Filter by health
    if (filterHealth === 'critical') {
      filtered = filtered.filter(p => p.health_score < 40);
    } else if (filterHealth === 'needs-attention') {
      filtered = filtered.filter(p => p.health_score >= 40 && p.health_score < 70);
    } else if (filterHealth === 'good') {
      filtered = filtered.filter(p => p.health_score >= 70 && p.health_score < 85);
    } else if (filterHealth === 'excellent') {
      filtered = filtered.filter(p => p.health_score >= 85);
    }

    // Sort
    if (sortBy === 'health-low') {
      filtered.sort((a, b) => (a.health_score || 0) - (b.health_score || 0));
    } else if (sortBy === 'health-high') {
      filtered.sort((a, b) => (b.health_score || 0) - (a.health_score || 0));
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.address || '').localeCompare(b.address || ''));
    } else if (sortBy === 'value') {
      filtered.sort((a, b) => (b.current_value || 0) - (a.current_value || 0));
    } else if (sortBy === 'doors') {
      filtered.sort((a, b) => (b.door_count || 0) - (a.door_count || 0));
    } else {
      filtered.sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));
    }

    return filtered;
  }, [properties, searchQuery, filterUseType, filterHealth, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Portfolio Overview */}
      {properties.length > 0 && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-lg" style={{ color: '#1B365D' }}>Portfolio Overview</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Properties</p>
                <p className="text-2xl font-bold text-blue-700">{portfolioMetrics.totalProperties}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Doors</p>
                <p className="text-2xl font-bold text-green-700">{portfolioMetrics.totalDoors}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Avg Health</p>
                <p className="text-2xl font-bold text-purple-700">{portfolioMetrics.avgHealthScore}</p>
              </div>
              {portfolioMetrics.totalValue > 0 && (
                <div className="text-center p-3 bg-white rounded-lg border">
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    ${(portfolioMetrics.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
              )}
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-700">
                  {portfolioMetrics.completedProperties}/{portfolioMetrics.totalProperties}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ minHeight: '48px' }}
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex gap-2 border rounded-lg p-1 bg-white">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden md:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">List</span>
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="gap-2"
          >
            <Map className="w-4 h-4" />
            <span className="hidden md:inline">Map</span>
          </Button>
        </div>

        {/* Add Property Button */}
        <Button
          onClick={onQuickAdd}
          className="bg-green-600 hover:bg-green-700 gap-2"
          style={{ minHeight: '48px' }}
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterUseType} onValueChange={setFilterUseType}>
          <SelectTrigger className="w-40" style={{ minHeight: '40px' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="primary">Primary Only</SelectItem>
            <SelectItem value="rental_unfurnished">Rentals Only</SelectItem>
            <SelectItem value="primary_with_rental">Mixed Use</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterHealth} onValueChange={setFilterHealth}>
          <SelectTrigger className="w-44" style={{ minHeight: '40px' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health Levels</SelectItem>
            <SelectItem value="critical">🔴 Critical (&lt;40)</SelectItem>
            <SelectItem value="needs-attention">🟠 Needs Attention (40-69)</SelectItem>
            <SelectItem value="good">🟡 Good (70-84)</SelectItem>
            <SelectItem value="excellent">🟢 Excellent (85+)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48" style={{ minHeight: '40px' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Updated</SelectItem>
            <SelectItem value="health-low">Health: Low to High</SelectItem>
            <SelectItem value="health-high">Health: High to Low</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="value">Value: High to Low</SelectItem>
            <SelectItem value="doors">Doors: Most First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {searchQuery || filterUseType !== 'all' || filterHealth !== 'all' ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredProperties.length} of {properties.length} properties
          </Badge>
          {(searchQuery || filterUseType !== 'all' || filterHealth !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterUseType('all');
                setFilterHealth('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : null}

      {/* Property Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <EnhancedPropertyCard
              key={property.id}
              property={property}
              onEdit={() => onEditProperty(property.id)}
              onDelete={() => onDeleteProperty(property.id)}
            />
          ))}
        </div>
      )}

      {/* Property List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Property</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">Health</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">Doors</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{property.address}</p>
                        <p className="text-xs text-gray-600">{property.city}, {property.state}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {property.property_type}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            property.health_score >= 85 ? 'bg-green-600' :
                            property.health_score >= 70 ? 'bg-yellow-600' :
                            property.health_score >= 40 ? 'bg-orange-600' :
                            'bg-red-600'
                          }`} />
                          <span className="font-semibold">{property.health_score || 0}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold">{property.door_count || 1}</span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProperty(property.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold mb-2">Map View Coming Soon</p>
                <p className="text-sm text-gray-500">Geographic visualization of your portfolio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && properties.length > 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilterUseType('all');
                setFilterHealth('all');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}