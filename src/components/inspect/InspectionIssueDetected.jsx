import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Wrench, ArrowLeft } from "lucide-react";

export default function InspectionIssueDetected({ task, inspection, propertyId, onScheduleService, onHandleMyself, onBack }) {
  const cascadeExamples = {
    "Gutters & Downspouts": "Damaged gutters → Water overflow → Foundation damage → $15,000+ repair",
    "Plumbing System": "Small leak → Water damage → Mold growth → Structural damage → $10,000+ remediation",
    "Roof System": "Missing shingles → Water intrusion → Rotted decking → Interior damage → $20,000+ disaster",
    "HVAC System": "Minor issue → System failure → No heating/cooling → Emergency replacement at 3X cost → $8,000+",
    "Electrical System": "Faulty wiring → Fire hazard → Property damage → Potential total loss → $50,000+"
  };

  const cascadeExample = cascadeExamples[task.systemType] || "Small problem → Larger problem → Major damage → Expensive repair";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="border-2 shadow-lg max-w-2xl w-full" style={{ borderColor: '#FF6B35' }}>
        <CardContent className="p-12 text-center space-y-6">
          {/* Alert Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF5F2' }}>
              <AlertTriangle className="w-12 h-12" style={{ color: '#FF6B35' }} />
            </div>
          </div>

          {/* Issue Detected Message */}
          <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>
            ⚠️ Issue Detected
          </h1>

          <p className="text-xl text-gray-700">
            You marked <strong>{task.item_name}</strong> as "{task.condition_rating}" condition
          </p>

          <hr className="border-gray-200" />

          {/* Cascade Risk */}
          <Card className="border-2" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 text-left">
                <TrendingDown className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#FF6B35' }} />
                <div>
                  <h2 className="text-xl font-bold mb-3" style={{ color: '#1B365D' }}>💥 CASCADE RISK:</h2>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    {cascadeExample}
                  </p>
                  <p className="text-sm text-gray-700">
                    This task has been added to your <strong>Priority Queue in ACT phase</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <hr className="border-gray-200" />

          {/* Recommended Action */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1B365D' }}>
              RECOMMENDED ACTION:
            </h2>

            <div className="space-y-3">
              <Button
                onClick={onScheduleService}
                className="w-full h-14 text-lg font-bold flex items-center justify-center gap-2"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Wrench className="w-5 h-5" />
                Schedule Professional Service
              </Button>

              <Button
                onClick={onHandleMyself}
                variant="outline"
                className="w-full h-12"
              >
                I'll Handle This Myself
              </Button>

              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Checklist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}