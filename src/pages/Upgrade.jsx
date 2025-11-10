import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Filter } from "lucide-react";
import UpgradeCard from "../components/upgrade/UpgradeCard";
import UpgradeDialog from "../components/upgrade/UpgradeDialog";

const CATEGORIES = ["Energy Efficiency", "Safety", "Comfort", "Property Value", "Rental Appeal"];

export default function Upgrade() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingUpgrade, setEditingUpgrade] = React.useState(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
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

  // Filter upgrades
  let filteredUpgrades = upgrades;
  if (filterCategory !== 'all') {
    filteredUpgrades = filteredUpgrades.filter(u => u.category === filterCategory);
  }

  // Sort by ROI (shortest payback first)
  const sortedUpgrades = [...filteredUpgrades].sort((a, b) => 
    (a.roi_timeline_months || 999) - (b.roi_timeline_months || 999)
  );

  const identifiedUpgrades = upgrades.filter(u => u.status === 'Identified').length;
  const completedUpgrades = upgrades.filter(u => u.status === 'Completed').length;
  const totalInvestment = upgrades
    .filter(u => u.status === 'Completed')
    .reduce((sum, u) => sum + (u.actual_cost || 0), 0);

  const handleAddUpgrade = () => {
    setEditingUpgrade(null);
    setShowDialog(true);
  };

  const handleEditUpgrade = (upgrade) => {
    setEditingUpgrade(upgrade);
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ADVANCE → Upgrade</h1>
            <p className="text-gray-600 mt-1">Strategic improvement opportunities with ROI analysis</p>
          </div>
          {selectedProperty && (
            <Button onClick={handleAddUpgrade} className="gap-2" style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="w-4 h-4" />
              Add Upgrade
            </Button>
          )}
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">{identifiedUpgrades}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedUpgrades}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Invested</p>
                    <p className="text-2xl font-bold text-gray-900">${totalInvestment.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                Showing {sortedUpgrades.length} upgrade{sortedUpgrades.length !== 1 ? 's' : ''} 
                (sorted by ROI)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrades List */}
        {sortedUpgrades.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {sortedUpgrades.map(upgrade => (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                onEdit={() => handleEditUpgrade(upgrade)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Upgrades Yet</h3>
              <p className="text-gray-600 mb-6">
                Start tracking strategic improvements to enhance your property value
              </p>
              <Button onClick={handleAddUpgrade} className="gap-2" style={{ backgroundColor: 'var(--primary)' }}>
                <Plus className="w-4 h-4" />
                Add Your First Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        <UpgradeDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingUpgrade(null);
          }}
          propertyId={selectedProperty}
          editingUpgrade={editingUpgrade}
        />
      </div>
    </div>
  );
}