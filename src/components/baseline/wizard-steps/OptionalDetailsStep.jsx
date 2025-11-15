import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function OptionalDetailsStep({ 
  formData, 
  onChange 
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between"
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
              <p className="font-semibold text-gray-900">
                Add extra details (optional)
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {expanded ? 'Hide' : 'Show'}
            </p>
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              <div>
                <Label>Brand / Model</Label>
                <Input
                  value={formData.brand_model || ''}
                  onChange={(e) => onChange({ brand_model: e.target.value })}
                  placeholder="e.g., Carrier 58MVC"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div>
                <Label>Location / Nickname</Label>
                <Input
                  value={formData.nickname || ''}
                  onChange={(e) => onChange({ nickname: e.target.value })}
                  placeholder="e.g., Main floor, Basement"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div>
                <Label>Warranty Info</Label>
                <Input
                  value={formData.warranty_info || ''}
                  onChange={(e) => onChange({ warranty_info: e.target.value })}
                  placeholder="Warranty expiration or details"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.condition_notes || ''}
                  onChange={(e) => onChange({ condition_notes: e.target.value })}
                  placeholder="Any known issues or things to watch?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Last Service Date</Label>
                <Input
                  type="date"
                  value={formData.last_service_date || ''}
                  onChange={(e) => onChange({ last_service_date: e.target.value })}
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!expanded && (
        <p className="text-xs text-center text-gray-500">
          You can always add these details later
        </p>
      )}
    </div>
  );
}