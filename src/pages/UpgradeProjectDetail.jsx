import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  CheckCircle2, Circle, Clock, AlertTriangle, Camera, 
  TrendingUp, DollarSign, Calendar, Edit, Trash2,
  MessageSquare, Lightbulb, ArrowLeft, Trophy,
  FileText, Image as ImageIcon, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MilestonesView from '../components/upgrade/MilestonesView';
import BudgetTrackingView from '../components/upgrade/BudgetTrackingView';
import PhotoTimelineView from '../components/upgrade/PhotoTimelineView';
import AIGuidanceView from '../components/upgrade/AIGuidanceView';

export default function UpgradeProjectDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('progress');

  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['upgrade', projectId],
    queryFn: async () => {
      const upgrades = await base44.entities.Upgrade.list();
      return upgrades.find(u => u.id === projectId);
    },
    enabled: !!projectId,
  });

  const { data: property } = useQuery({
    queryKey: ['property', project?.property_id],
    queryFn: async () => {
      if (!project?.property_id) return null;
      const properties = await base44.entities.Property.list();
      return properties.find(p => p.id === project.property_id);
    },
    enabled: !!project?.property_id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Upgrade.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      navigate(createPageUrl('Upgrade'));
    },
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project?.title}"? This cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['upgrade', projectId] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">This upgrade project doesn't exist or was deleted.</p>
          <Button onClick={() => navigate(createPageUrl('Upgrade'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upgrades
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    'Identified': 'bg-gray-100 text-gray-800',
    'Planned': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Deferred': 'bg-gray-100 text-gray-600'
  };

  const categoryColors = {
    'High ROI Renovations': 'bg-green-100 text-green-800',
    'Energy Efficiency': 'bg-blue-100 text-blue-800',
    'Rental Income Boosters': 'bg-purple-100 text-purple-800',
    'Preventive Replacements': 'bg-red-100 text-red-800',
    'Curb Appeal': 'bg-orange-100 text-orange-800',
    'Interior Updates': 'bg-pink-100 text-pink-800',
    'Safety': 'bg-red-100 text-red-800',
    'Comfort': 'bg-blue-100 text-blue-800',
    'Property Value': 'bg-purple-100 text-purple-800',
    'Rental Appeal': 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Upgrade'))}
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upgrades
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={categoryColors[project.category]}>
                  {project.category}
                </Badge>
                <Badge className={statusColors[project.status]}>
                  {project.status}
                </Badge>
                {property && (
                  <Badge variant="outline" className="text-xs">
                    📍 {property.address}
                  </Badge>
                )}
                {project.project_manager && (
                  <Badge variant="outline">
                    {project.project_manager === 'Operator' ? '🏢 Operator Managed' : 
                     project.project_manager === 'Contractor' ? '👷 Contractor' : '🔨 DIY'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(createPageUrl('Upgrade') + `?new=true&edit=${projectId}`)}
                style={{ minHeight: '44px' }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                style={{ minHeight: '44px' }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Overview Card */}
        <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-blue-600" />
                Project Progress
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {project.progress_percentage || 0}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={project.progress_percentage || 0} className="h-3 mb-4" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Milestones</p>
                <p className="font-semibold text-gray-900">
                  {project.milestones?.filter(m => m.status === 'Completed').length || 0} / {project.milestones?.length || 0}
                </p>
              </div>
              {project.current_milestone && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Current Step</p>
                  <p className="font-semibold text-blue-700">{project.current_milestone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p className="font-semibold text-gray-900">{project.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-600">Investment</p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                ${(project.final_investment || project.investment_required || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-600">Value Added</p>
              </div>
              <p className="text-xl font-bold text-green-700">
                ${(project.final_value_added || project.property_value_impact || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-600">ROI</p>
              </div>
              <p className="text-xl font-bold text-purple-700">
                {project.final_roi_percent || 
                 (project.property_value_impact && project.investment_required 
                   ? Math.round((project.property_value_impact / project.investment_required) * 100) 
                   : 0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-600">Net Gain</p>
              </div>
              <p className="text-xl font-bold text-green-700">
                +${(project.equity_increase || 
                    ((project.property_value_impact || 0) - (project.investment_required || 0))).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="ai-guide" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">AI Guide</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <MilestonesView project={project} onUpdate={handleRefresh} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTrackingView project={project} onUpdate={handleRefresh} />
          </TabsContent>

          <TabsContent value="photos">
            <PhotoTimelineView project={project} onUpdate={handleRefresh} />
          </TabsContent>

          <TabsContent value="ai-guide">
            <AIGuidanceView project={project} onUpdate={handleRefresh} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}