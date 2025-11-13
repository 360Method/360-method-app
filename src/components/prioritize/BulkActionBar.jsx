import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  X, 
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BulkActionBar({ 
  selectedCount, 
  onScheduleAll,
  onCompleteAll,
  onDeleteAll,
  onChangePriority,
  onClearSelection
}) {
  if (selectedCount === 0) return null;

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4"
      style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        pointerEvents: 'none'
      }}
    >
      <div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-4"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge className="bg-white text-blue-600 text-base px-3 py-1">
              ✓ {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={onScheduleAll}
              className="gap-2 bg-white text-blue-600 hover:bg-blue-50"
              style={{ minHeight: '40px' }}
            >
              <Calendar className="w-4 h-4" />
              Schedule All
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onCompleteAll}
              className="gap-2 bg-white text-green-600 hover:bg-green-50"
              style={{ minHeight: '40px' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete All
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 bg-white text-gray-900 hover:bg-gray-50"
                  style={{ minHeight: '40px' }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Priority
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onChangePriority('High')}>
                  🔥 High Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePriority('Medium')}>
                  ⚡ Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePriority('Low')}>
                  💡 Low Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePriority('Routine')}>
                  🔄 Routine
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="secondary"
              size="sm"
              onClick={onDeleteAll}
              className="gap-2 bg-white text-red-600 hover:bg-red-50"
              style={{ minHeight: '40px' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}