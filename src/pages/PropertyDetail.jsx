import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Property, SystemBaseline, MaintenanceTask } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home, MapPin, Calendar, Ruler, BedDouble, Bath, ArrowLeft,
  CheckCircle, AlertTriangle, Clock, ChevronRight, Loader2,
  Clipboard, Search, ListTodo, CalendarCheck, Wrench, Shield,
  TrendingUp, BarChart3
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { useDemo } from "@/components/shared/DemoContext";

const STEPS = [
  { name: 'Baseline', icon: Clipboard, page: 'Baseline', description: 'Document your home systems' },
  { name: 'Inspect', icon: Search, page: 'Inspect', description: 'Regular walkthrough inspections' },
  { name: 'Track', icon: ListTodo, page: 'Track', description: 'Maintenance history & log' },
  { name: 'Prioritize', icon: AlertTriangle, page: 'Prioritize', description: 'AI-ranked task priorities' },
  { name: 'Schedule', icon: CalendarCheck, page: 'Schedule', description: 'Plan your maintenance' },
  { name: 'Execute', icon: Wrench, page: 'Execute', description: 'Complete the work' },
  { name: 'Preserve', icon: Shield, page: 'Preserve', description: 'Preventive maintenance' },
  { name: 'Upgrade', icon: TrendingUp, page: 'Upgrade', description: 'Strategic improvements' },
  { name: 'Scale', icon: BarChart3, page: 'Scale', description: 'Portfolio & wealth tracking' },
];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { demoMode, demoData } = useDemo();

  // Fetch property
  const { data: property, isLoading } = useQuery({
    queryKey: ['property-detail', id],
    queryFn: async () => {
      if (demoMode && demoData?.property) {
        return demoData.property;
      }
      return await Property.get(id);
    },
    enabled: !!id || demoMode
  });

  // Fetch systems for this property
  const { data: systems = [] } = useQuery({
    queryKey: ['property-systems', id],
    queryFn: async () => {
      if (demoMode && demoData?.systems) {
        return demoData.systems;
      }
      return await SystemBaseline.filter({ property_id: id }, '-created_at');
    },
    enabled: !!id || demoMode
  });

  // Fetch tasks for this property
  const { data: tasks = [] } = useQuery({
    queryKey: ['property-tasks', id],
    queryFn: async () => {
      if (demoMode && demoData?.maintenanceTasks) {
        return demoData.maintenanceTasks;
      }
      return await MaintenanceTask.filter({ property_id: id }, '-created_at');
    },
    enabled: !!id || demoMode
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-lg mx-auto mt-12 p-8 text-center">
          <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(createPageUrl('Properties'))}>
            Back to Properties
          </Button>
        </Card>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const healthScore = property.health_score || 0;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Properties'))}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Button>

        {/* Property Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{property.address || 'My Property'}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="w-4 h-4" />
                  <span>{property.city}, {property.state} {property.zip_code}</span>
                </div>
              </div>
              <div className={`${getHealthBg(healthScore)} rounded-xl p-4 text-center`}>
                <div className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}
                </div>
                <div className="text-xs text-gray-600">Health Score</div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Property Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="font-bold text-gray-900">{property.property_type || 'N/A'}</div>
                <div className="text-xs text-gray-500">Type</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="font-bold text-gray-900">{property.year_built || 'N/A'}</div>
                <div className="text-xs text-gray-500">Year Built</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Ruler className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="font-bold text-gray-900">
                  {property.square_footage ? property.square_footage.toLocaleString() : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Sq Ft</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-center gap-2 mb-1">
                  <BedDouble className="w-5 h-5 text-gray-400" />
                  <Bath className="w-5 h-5 text-gray-400" />
                </div>
                <div className="font-bold text-gray-900">
                  {property.bedrooms || 0} / {property.bathrooms || 0}
                </div>
                <div className="text-xs text-gray-500">Bed / Bath</div>
              </div>
            </div>

            {/* Baseline Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Baseline Completion</span>
                <span className="text-sm text-gray-600">{property.baseline_completion || 0}%</span>
              </div>
              <Progress value={property.baseline_completion || 0} className="h-2" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{systems.length}</div>
                <div className="text-xs text-blue-600">Systems Documented</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{pendingTasks}</div>
                <div className="text-xs text-orange-600">Pending Tasks</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{completedTasks}</div>
                <div className="text-xs text-green-600">Completed Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 360° Method Steps */}
        <Card>
          <CardHeader>
            <CardTitle>360° Method Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.name}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(createPageUrl(step.page, { property_id: id }))}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        idx < 3 ? 'bg-blue-100 text-blue-600' :
                        idx < 6 ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {idx + 1}. {step.name}
                        </div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
