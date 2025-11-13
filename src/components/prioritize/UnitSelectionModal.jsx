import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Loader2, CheckCircle2 } from "lucide-react";

export default function UnitSelectionModal({ 
  open, 
  onClose, 
  template, 
  property, 
  onConfirm, 
  isCreating 
}) {
  const [selectedUnits, setSelectedUnits] = React.useState([]);
  
  // Get units from property
  const units = property?.units || [];
  const hasDefinedUnits = units.length > 0;
  
  // Fallback unit options if property.units is empty
  const fallbackUnits = property?.door_count > 1 
    ? Array.from({ length: property.door_count }, (_, i) => ({
        unit_id: `Unit ${i + 1}`,
        nickname: `Unit ${i + 1}`
      }))
    : [];
  
  const unitOptions = hasDefinedUnits ? units : fallbackUnits;
  
  // Add "Common Area" option
  const allOptions = [
    { unit_id: 'common_area', nickname: 'Common Area', isCommonArea: true },
    ...unitOptions
  ];

  const handleToggleUnit = (unitId) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUnits.length === allOptions.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(allOptions.map(u => u.unit_id || u.nickname));
    }
  };

  const handleSubmit = () => {
    if (selectedUnits.length === 0) {
      alert('Please select at least one unit');
      return;
    }
    onConfirm(selectedUnits);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isCreating && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Select Units for Task
          </DialogTitle>
          <DialogDescription>
            Choose which units need: <strong>{template?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900 font-semibold mb-1">
              📋 Per-Unit Task
            </p>
            <p className="text-xs text-blue-800">
              This task applies to individual units. Select all units that need this work done.
              A separate task will be created for each unit you select.
            </p>
          </div>

          {/* Select All Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
            <Checkbox
              id="select-all"
              checked={selectedUnits.length === allOptions.length}
              onCheckedChange={handleSelectAll}
            />
            <label 
              htmlFor="select-all" 
              className="text-sm font-bold text-gray-900 cursor-pointer flex-1"
            >
              Select All ({allOptions.length} options)
            </label>
          </div>

          {/* Unit Checkboxes */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allOptions.map((unit) => {
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
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {unit.isCommonArea ? (
                        <span className="text-sm font-semibold text-gray-700">
                          🏢 {unit.nickname}
                        </span>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-gray-900">
                            {unit.nickname || unitId}
                          </span>
                          {unit.bedrooms && (
                            <span className="text-xs text-gray-500">
                              • {unit.bedrooms}bd
                            </span>
                          )}
                          {unit.occupancy_status && (
                            <span className="text-xs text-gray-500">
                              • {unit.occupancy_status}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {selectedUnits.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>{selectedUnits.length} task{selectedUnits.length > 1 ? 's' : ''}</strong> will be created
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
                Add {selectedUnits.length > 0 ? `${selectedUnits.length} ` : ''}Task{selectedUnits.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}