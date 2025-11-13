import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, CheckCircle2, Users, Home, X as XIcon } from "lucide-react";

export default function EnhancedUnitSelectionModal({ 
  open, 
  onClose, 
  template, 
  property, 
  onConfirm, 
  isCreating 
}) {
  const [selectedUnits, setSelectedUnits] = React.useState([]);
  
  const units = property?.units || [];
  const hasDefinedUnits = units.length > 0;
  
  const fallbackUnits = property?.door_count > 1 
    ? Array.from({ length: property.door_count }, (_, i) => ({
        unit_id: `Unit ${i + 1}`,
        nickname: `Unit ${i + 1}`,
        occupancy_status: 'Unknown'
      }))
    : [];
  
  const allUnits = hasDefinedUnits ? units : fallbackUnits;
  
  // Get unique floors if available
  const floors = [...new Set(allUnits.map(u => u.floor).filter(Boolean))].sort();
  const hasFloors = floors.length > 0;

  const handleToggleUnit = (unitId) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUnits.length === allUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(allUnits.map(u => u.unit_id || u.nickname));
    }
  };

  const handleSelectOccupied = () => {
    const occupiedUnits = allUnits
      .filter(u => u.occupancy_status === 'Tenant-Occupied' || u.occupancy_status === 'Owner-Occupied')
      .map(u => u.unit_id || u.nickname);
    setSelectedUnits(occupiedUnits);
  };

  const handleSelectVacant = () => {
    const vacantUnits = allUnits
      .filter(u => u.occupancy_status === 'Vacant')
      .map(u => u.unit_id || u.nickname);
    setSelectedUnits(vacantUnits);
  };

  const handleSelectByFloor = (floor) => {
    const floorUnits = allUnits
      .filter(u => u.floor === floor)
      .map(u => u.unit_id || u.nickname);
    setSelectedUnits(prev => {
      const allFloorSelected = floorUnits.every(id => prev.includes(id));
      if (allFloorSelected) {
        return prev.filter(id => !floorUnits.includes(id));
      } else {
        return [...new Set([...prev, ...floorUnits])];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedUnits.length === 0) {
      alert('Please select at least one unit');
      return;
    }
    onConfirm(selectedUnits);
  };

  // Group units by floor if available
  const groupedUnits = hasFloors
    ? floors.reduce((acc, floor) => {
        acc[floor] = allUnits.filter(u => u.floor === floor);
        return acc;
      }, {})
    : { 'All': allUnits };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isCreating && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Select Units for Task
          </DialogTitle>
          <DialogDescription>
            Choose which units need: <strong>{template?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900 font-semibold mb-1">
              📋 Per-Unit Task
            </p>
            <p className="text-xs text-blue-800">
              Select units that need this work. A separate task will be created for each unit you select.
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {selectedUnits.length === allUnits.length ? 'Deselect All' : 'All Units'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectOccupied}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Occupied Only
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectVacant}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Vacant Only
            </Button>

            {hasFloors && floors.map(floor => (
              <Button
                key={floor}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectByFloor(floor)}
                className="gap-2"
              >
                Floor {floor}
              </Button>
            ))}
          </div>

          {/* Unit List */}
          <div className="space-y-4">
            {Object.entries(groupedUnits).map(([groupName, groupUnits]) => (
              <div key={groupName}>
                {hasFloors && (
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">
                    Floor {groupName}
                  </h3>
                )}
                <div className="space-y-2">
                  {groupUnits.map((unit) => {
                    const unitId = unit.unit_id || unit.nickname;
                    const isSelected = selectedUnits.includes(unitId);
                    
                    return (
                      <div
                        key={unitId}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-400' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          id={unitId}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleUnit(unitId)}
                        />
                        <label 
                          htmlFor={unitId} 
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {unit.nickname || unitId}
                            </span>
                            {unit.bedrooms && (
                              <span className="text-xs text-gray-500">
                                • {unit.bedrooms}BR
                              </span>
                            )}
                            {unit.bathrooms && (
                              <span className="text-xs text-gray-500">
                                • {unit.bathrooms}BA
                              </span>
                            )}
                          </div>
                          {unit.occupancy_status && (
                            <Badge 
                              className={
                                unit.occupancy_status.includes('Occupied')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {unit.occupancy_status}
                            </Badge>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {selectedUnits.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm text-green-900 font-semibold">
                ✅ {selectedUnits.length} task{selectedUnits.length > 1 ? 's' : ''} will be created
                (one for each selected unit)
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
            className="flex-1"
            style={{ minHeight: '48px' }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating || selectedUnits.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '48px' }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Tasks...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create {selectedUnits.length} Task{selectedUnits.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}