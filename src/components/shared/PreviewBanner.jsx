import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, ArrowRight } from "lucide-react";

export default function PreviewBanner({ onAddProperty }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-lg">You're viewing a demo property</p>
            <p className="text-sm text-blue-100">Ready to protect YOUR home?</p>
          </div>
        </div>
        <Button
          onClick={onAddProperty}
          size="lg"
          className="bg-white text-blue-600 hover:bg-blue-50 gap-2 whitespace-nowrap"
        >
          Add My Property (30 seconds)
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}