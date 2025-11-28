import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SystemBaseline, MaintenanceTask, PreservationRecommendation, PortfolioEquity } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building2, 
  AlertTriangle, 
  ArrowRight,
  MoreVertical,
  DollarSign,
  Activity,
  Award
} from "lucide-react";
import ScoreBadge from "@/components/score/ScoreBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function EnhancedPropertyCard({ property, onEdit, onDelete, demoData = null }) {
  const isPrimary = property.property_use_type === 'primary';
  const isDemo = property.is_demo || demoData;

  // Fetch related data - skip queries in demo mode
  const { data: systems = [] } = useQuery({
    queryKey: ['systems-count', property.id],
    queryFn: () => SystemBaseline.filter({ property_id: property.id }),
    enabled: !isDemo,
    initialData: isDemo && demoData ? (demoData.systems?.filter(s => s.property_id === property.id) || []) : []
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-count', property.id],
    queryFn: () => MaintenanceTask.filter({ property_id: property.id, status: 'Identified' }),
    enabled: !isDemo,
    initialData: isDemo && demoData ? (demoData.tasks?.filter(t => t.property_id === property.id && t.status === 'Identified') || []) : []
  });

  const { data: preserveRecs = [] } = useQuery({
    queryKey: ['preserve-count', property.id],
    queryFn: () => PreservationRecommendation.filter({ property_id: property.id, status: 'PENDING' }),
    enabled: !isDemo,
    initialData: isDemo && demoData ? (demoData.preserveSchedules?.[0]?.interventions?.filter(i => i.status === 'Recommended') || []) : []
  });

  const { data: equity } = useQuery({
    queryKey: ['equity-snapshot', property.id],
    queryFn: () => PortfolioEquity.filter({ property_id: property.id }),
    enabled: !isDemo,
    initialData: isDemo && property.current_value ? [{
      current_market_value: property.current_value,
      equity_dollars: property.equity || (property.current_value - (property.mortgage_balance || 0)),
      equity_percentage: property.equity_percentage || ((property.current_value - (property.mortgage_balance || 0)) / property.current_value * 100)
    }] : []
  });

  const equityData = equity?.[0];

  const urgentTasks = tasks.filter(t => t.priority === 'High' || t.cascade_risk_score >= 8);
  const urgentPreserve = preserveRecs.filter(r => r.priority === 'URGENT');

  const getHealthColor = () => {
    const score = property.health_score || 0;
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getHealthLabel = () => {
    const score = property.health_score || 0;
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <Card className="border-2 border-gray-200 hover:border-purple-300 transition-all hover:shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isPrimary ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {isPrimary ? (
                <Home className="w-6 h-6 text-blue-600" />
              ) : (
                <Building2 className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight break-words">
                {property.address}
              </p>
              <p className="text-xs text-gray-600 mt-1">{property.city}, {property.state}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{property.property_type}</Badge>
                {property.year_built && (
                  <Badge variant="outline" className="text-xs">Built {property.year_built}</Badge>
                )}
                {property.door_count > 1 && (
                  <Badge className="bg-orange-600 text-white text-xs">{property.door_count} doors</Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>✏️ Edit Basic Details</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Properties') + `?complete=${property.id}`}>
                  💰 Edit Financial Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Baseline') + `?property=${property.id}`}>
                  📊 View Systems (AWARE)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Prioritize') + `?property=${property.id}`}>
                  ✅ View Tasks (ACT)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Upgrade') + `?property=${property.id}`}>
                  🔧 View Upgrades (ADVANCE)
                </Link>
              </DropdownMenuItem>
              {property.totalScore && (
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('PropertyScore') + `?property=${property.id}`}>
                    ⭐ 360° Score Breakdown
                  </Link>
                </DropdownMenuItem>
              )}
              {equityData && (
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Scale') + `?property=${property.id}`}>
                    💰 View Portfolio CFO (SCALE)
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                🗑️ Delete Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* 360° Score Badge (if available) */}
        {property.totalScore && (
          <div 
            className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-all"
            onClick={() => window.location.href = createPageUrl('PropertyScore') + `?property=${property.id}`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">360° Score</span>
            </div>
            <ScoreBadge 
              score={property.totalScore}
              certificationLevel={property.certificationLevel}
              size="sm"
            />
          </div>
        )}
        
        {/* Health Score */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Health Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{property.health_score || 0}</span>
            <Badge className={`${getHealthColor()} text-white text-xs`}>
              {getHealthLabel()}
            </Badge>
          </div>
        </div>

        {/* Quick Equity (if SCALE data exists) */}
        {equityData && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-900">Quick Equity</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-600">Value</p>
                <p className="font-bold text-green-700">${(equityData.current_market_value / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Equity</p>
                <p className="font-bold text-green-700">
                  ${(equityData.equity_dollars / 1000).toFixed(0)}K ({equityData.equity_percentage?.toFixed(0)}%)
                </p>
              </div>
            </div>
            <Link to={createPageUrl('Scale') + `?property=${property.id}`}>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                View Full Portfolio CFO (SCALE) →
              </Button>
            </Link>
          </div>
        )}

        {/* 360° Method Progress (3×3 Structure) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              🎯 360° Method Progress
              <span className="text-gray-500">(3×3)</span>
            </p>
          </div>
          
          <div className="space-y-2">
            {/* AWARE Phase */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-700 font-semibold">AWARE</span>
                <span className="text-xs font-semibold text-gray-900">{property.baseline_completion || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${property.baseline_completion || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Baseline • Inspect • Track</p>
            </div>

            {/* ACT Phase */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-orange-700 font-semibold">ACT</span>
                <span className="text-xs font-semibold text-gray-900">{tasks.length} active</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? '33%' : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Prioritize • Schedule • Execute</p>
            </div>

            {/* ADVANCE Phase */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-green-700 font-semibold">ADVANCE</span>
                <span className="text-xs font-semibold text-gray-900">{preserveRecs.length} opportunities</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: preserveRecs.length > 0 ? '25%' : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Preserve • Upgrade • SCALE</p>
            </div>
          </div>
        </div>

        {/* Attention Needed */}
        {(urgentTasks.length > 0 || urgentPreserve.length > 0) && (
          <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-red-900">⚠️ Attention Needed</p>
            </div>
            <ul className="space-y-1">
              {urgentTasks.slice(0, 2).map((task) => (
                <li key={task.id} className="text-xs text-red-800">• {task.title}</li>
              ))}
              {urgentPreserve.slice(0, 2).map((rec) => (
                <li key={rec.id} className="text-xs text-red-800">• {rec.title}</li>
              ))}
              {(urgentTasks.length + urgentPreserve.length) > 2 && (
                <li className="text-xs text-red-700 font-semibold">
                  +{urgentTasks.length + urgentPreserve.length - 2} more urgent items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-gray-600">Systems</p>
            <p className="font-bold text-gray-900">{systems.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Tasks</p>
            <p className="font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Baseline</p>
            <p className="font-bold text-gray-900">{property.baseline_completion || 0}%</p>
          </div>
        </div>

        {/* Incomplete Financial Profile Warning */}
        {!property.financial_profile_complete && property.baseline_completion >= 42 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-900 mb-2">
              ⚠️ Incomplete Financial Profile
            </p>
            <p className="text-xs text-yellow-800 mb-3">
              Add financial data to unlock equity, ROI, and portfolio CFO features
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Debug: financial_profile_complete = {String(property.financial_profile_complete)}
            </p>
            <Link to={createPageUrl('Properties') + `?complete=${property.id}`}>
              <Button 
                size="sm" 
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                style={{ minHeight: '40px' }}
              >
                Complete Financial Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Primary CTA */}
        <Link to={createPageUrl('Baseline') + `?property=${property.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" style={{ minHeight: '44px' }}>
            {property.baseline_completion < 80 ? 'Continue Setup' : 'View Details'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

      </CardContent>
    </Card>
  );
}