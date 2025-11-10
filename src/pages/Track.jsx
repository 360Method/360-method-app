import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Calendar, Download, Filter } from "lucide-react";
import TimelineItem from "../components/track/TimelineItem";
import CostSummary from "../components/track/CostSummary";

export default function Track() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [filterType, setFilterType] = React.useState('all');
  const [filterDate, setFilterDate] = React.useState('all');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: systems = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Inspection.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ['upgrades', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Upgrade.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Build timeline items
  const timelineItems = [];

  // Add completed tasks
  tasks.filter(t => t.status === 'Completed' && t.completion_date).forEach(task => {
    timelineItems.push({
      type: 'task',
      date: new Date(task.completion_date),
      title: task.title,
      category: task.system_type,
      cost: task.actual_cost,
      data: task
    });
  });

  // Add system installations
  systems.forEach(system => {
    if (system.installation_year) {
      timelineItems.push({
        type: 'system',
        date: new Date(system.installation_year, 0, 1),
        title: `${system.system_type} Installed`,
        category: system.system_type,
        data: system
      });
    }
  });

  // Add inspections
  inspections.filter(i => i.status === 'Completed').forEach(inspection => {
    timelineItems.push({
      type: 'inspection',
      date: new Date(inspection.inspection_date),
      title: `${inspection.season} Inspection`,
      category: 'General',
      data: inspection
    });
  });

  // Add completed upgrades
  upgrades.filter(u => u.status === 'Completed' && u.completion_date).forEach(upgrade => {
    timelineItems.push({
      type: 'upgrade',
      date: new Date(upgrade.completion_date),
      title: upgrade.title,
      category: upgrade.category,
      cost: upgrade.actual_cost,
      data: upgrade
    });
  });

  // Sort by date descending
  timelineItems.sort((a, b) => b.date - a.date);

  // Apply filters
  let filteredItems = timelineItems;
  
  if (filterType !== 'all') {
    filteredItems = filteredItems.filter(item => item.type === filterType);
  }

  if (filterDate !== 'all') {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (filterDate === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (filterDate === '6months') {
      cutoffDate.setMonth(now.getMonth() - 6);
    } else if (filterDate === '1year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    filteredItems = filteredItems.filter(item => item.date >= cutoffDate);
  }

  const totalCost = timelineItems
    .filter(item => item.cost)
    .reduce((sum, item) => sum + item.cost, 0);

  const currentProperty = properties.find(p => p.id === selectedProperty);

  const exportReport = () => {
    const reportData = filteredItems.map(item => ({
      Date: item.date.toLocaleDateString(),
      Type: item.type,
      Title: item.title,
      Category: item.category,
      Cost: item.cost ? `$${item.cost.toFixed(2)}` : '-'
    }));

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProperty?.address || 'property'}-history.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AWARE → Track</h1>
            <p className="text-gray-600 mt-1">Complete timeline of your property maintenance</p>
          </div>
          <Button onClick={exportReport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <CostSummary
            title="Total Maintenance Spent"
            amount={totalCost}
            icon={DollarSign}
            color="blue"
          />
          <CostSummary
            title="Total Timeline Events"
            amount={timelineItems.length}
            icon={Activity}
            color="purple"
            isCount
          />
          <CostSummary
            title="Disasters Prevented"
            amount={currentProperty?.estimated_disasters_prevented || 0}
            icon={Calendar}
            color="green"
          />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Timeline
              </CardTitle>
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="inspection">Inspections</SelectItem>
                    <SelectItem value="upgrade">Upgrades</SelectItem>
                    <SelectItem value="system">Systems</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <TimelineItem key={index} item={item} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No timeline events found. Start documenting your maintenance!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}