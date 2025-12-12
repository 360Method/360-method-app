import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createPageUrl } from "@/utils";

export default function PrerequisitePopup({
  isOpen,
  onClose,
  message,
  requiredStep,
  progress = 0,
  threshold = 66
}) {
  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((progress / threshold) * 100));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Get More Value</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {message}
          </p>

          {/* Progress indicator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your Progress</span>
              <span className="text-sm font-bold text-orange-600">
                {Math.round(progress)}% / {threshold}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {progress >= threshold
                ? "You've met the requirements!"
                : `${Math.round(threshold - progress)}% more to unlock full features`
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Link to={createPageUrl(requiredStep)}>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                style={{ minHeight: '48px' }}
              >
                Go to {requiredStep}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Continue Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
