import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle, ArrowRight } from "lucide-react";

export default function InspectionCompletionScreen({ task, inspection, onViewChecklist, onNextTask }) {
  const completedCount = inspection.checklist_items.filter(item => item.completed).length;
  const totalTasks = inspection.checklist_items.length;
  const completionPercentage = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="border-none shadow-lg max-w-2xl w-full">
        <CardContent className="p-12 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center gap-4 text-6xl">
            <span>🎉</span>
            <CheckCircle className="w-16 h-16" style={{ color: '#28A745' }} />
            <span>🎉</span>
          </div>

          {/* Task Complete Message */}
          <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>
            Task Complete!
          </h1>

          {/* Points Earned */}
          <div className="py-6">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full" style={{ backgroundColor: '#FFF5F2' }}>
              <Trophy className="w-8 h-8" style={{ color: '#FF6B35' }} />
              <span className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
                You earned {task.points} PP!
              </span>
            </div>
          </div>

          {/* Task Name */}
          <p className="text-xl text-gray-700">
            {task.item_name}
          </p>

          <hr className="border-gray-200" />

          {/* Progress Update */}
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-lg font-semibold mb-2" style={{ color: '#1B365D' }}>
              {inspection.season} Checklist: {completedCount}/{totalTasks} complete ({completionPercentage}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: '#28A745'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={onViewChecklist}
              className="w-full h-12 text-lg font-semibold"
              style={{ backgroundColor: '#1B365D' }}
            >
              View Checklist
            </Button>
            <Button
              onClick={onNextTask}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2"
            >
              Next Task
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}