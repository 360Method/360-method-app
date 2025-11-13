import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Users, CheckSquare, Loader2 } from "lucide-react";

export default function TaskCreationIntentModal({ 
  open, 
  onClose, 
  template, 
  property, 
  onCreateBuildingWide,
  onCreatePerUnit,
  onChooseUnits,
  isCreating
}) {
  const [selectedIntent, setSelectedIntent] = React.useState("building_wide");
  
  const unitCount = property?.door_count || property?.units?.length || 0;
  
  const handleContinue = () => {
    if (selectedIntent === "building_wide") {
      onCreateBuildingWide();
    } else if (selectedIntent === "per_unit") {
      onCreatePerUnit();
    } else if (selectedIntent === "choose_units") {
      onChooseUnits();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isCreating && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-6 h-6 text-blue-600" />
            Add Seasonal Task
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <p className="font-semibold text-gray-900">Template: {template?.title}</p>
            <p className="text-sm text-gray-600">Property: {property?.address} ({unitCount} units)</p>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-bold text-gray-900 mb-4">HOW SHOULD WE ADD THIS?</h3>
          
          <div className="space-y-3">
            {/* Option 1: Building Wide */}
            <button
              type="button"
              onClick={() => setSelectedIntent("building_wide")}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedIntent === "building_wide"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  selectedIntent === "building_wide"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}>
                  {selectedIntent === "building_wide" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">Create ONE task for entire property</p>
                  <p className="text-sm text-gray-600 mb-2">
                    → You'll handle all units in one work session<br />
                    → Creates 1 task covering all units
                  </p>
                  <p className="text-xs text-blue-700 font-semibold">
                    📋 Result: 1 task tagged "All Units ({unitCount})"
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Per Unit */}
            <button
              type="button"
              onClick={() => setSelectedIntent("per_unit")}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedIntent === "per_unit"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  selectedIntent === "per_unit"
                    ? "border-purple-600 bg-purple-600"
                    : "border-gray-300"
                }`}>
                  {selectedIntent === "per_unit" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">Create SEPARATE task for each unit</p>
                  <p className="text-sm text-gray-600 mb-2">
                    → Track completion per unit independently<br />
                    → Creates {unitCount} tasks (one per unit)
                  </p>
                  <p className="text-xs text-purple-700 font-semibold">
                    📋 Result: {unitCount} linked tasks (can view as group)
                  </p>
                </div>
              </div>
            </button>

            {/* Option 3: Choose Units */}
            <button
              type="button"
              onClick={() => setSelectedIntent("choose_units")}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedIntent === "choose_units"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  selectedIntent === "choose_units"
                    ? "border-green-600 bg-green-600"
                    : "border-gray-300"
                }`}>
                  {selectedIntent === "choose_units" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">Let me choose specific units</p>
                  <p className="text-sm text-gray-600 mb-2">
                    → Only certain units need this now<br />
                    → Opens unit selector
                  </p>
                  <p className="text-xs text-green-700 font-semibold">
                    📋 Result: Tasks for selected units only
                  </p>
                </div>
              </div>
            </button>
          </div>
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
            onClick={handleContinue}
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '48px' }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>Continue</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}