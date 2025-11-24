import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import HealthScoreGauge from './HealthScoreGauge';

export default function PortfolioOverview({ properties, onSelectProperty }) {
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  const getPortfolioStats = () => {
    if (properties.length === 0) return { avgScore: 0, totalCost: 0, needsAttention: 0 };
    
    const avgScore = properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length;
    const totalCost = properties.reduce((sum, p) => sum + (p.monthly_cost || 0), 0);
    const needsAttention = properties.filter(p => (p.health_score || 0) < 75).length;

    return { avgScore: Math.round(avgScore), totalCost, needsAttention };
  };

  const sortProperties = () => {
    return [...properties].sort((a, b) => {
      let aVal, bVal;
      switch(sortBy) {
        case 'score':
          aVal = a.health_score || 0;
          bVal = b.health_score || 0;
          break;
        case 'cost':
          aVal = a.monthly_cost || 0;
          bVal = b.monthly_cost || 0;
          break;
        case 'activity':
          aVal = new Date(a.last_inspection_date || 0).getTime();
          bVal = new Date(b.last_inspection_date || 0).getTime();
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const stats = getPortfolioStats();
  const sortedProperties = sortProperties();

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgScore}</div>
              <div className="text-sm text-gray-500">Avg Health Score</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Monthly Cost</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.needsAttention}</div>
              <div className="text-sm text-gray-500">Need Attention</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={sortBy === 'score' ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleSort('score')}
          className="gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          Score
        </Button>
        <Button
          variant={sortBy === 'cost' ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleSort('cost')}
          className="gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          Cost
        </Button>
        <Button
          variant={sortBy === 'activity' ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleSort('activity')}
          className="gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          Last Activity
        </Button>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedProperties.map(property => (
          <Card 
            key={property.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectProperty(property)}
          >
            <div className="space-y-4">
              {/* Property Image */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {property.photo_url ? (
                  <img 
                    src={property.photo_url} 
                    alt={property.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Health Score Badge */}
                <div className="absolute top-2 right-2">
                  <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                    (property.health_score || 0) >= 75 ? 'bg-green-500 text-white' :
                    (property.health_score || 0) >= 60 ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {property.health_score || 0}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <div className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {property.address}
                </div>
                <div className="text-sm text-gray-600">
                  {property.city}, {property.state} {property.zip_code}
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Last Inspection
                </div>
                <div className="font-medium text-gray-900">
                  {property.last_inspection_date 
                    ? new Date(property.last_inspection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Never'
                  }
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Monthly Cost
                </div>
                <div className="font-medium text-gray-900">
                  ${(property.monthly_cost || 0).toLocaleString()}
                </div>
              </div>

              {/* View Details Button */}
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProperty(property);
                }}
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card className="p-12 text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div className="font-semibold text-gray-900 mb-2">
            No Properties Yet
          </div>
          <div className="text-sm text-gray-600">
            Add your first property to get started with portfolio management
          </div>
        </Card>
      )}
    </div>
  );
}