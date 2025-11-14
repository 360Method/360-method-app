import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerBox() {
  return (
    <Card className="border-2 border-yellow-300 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ IMPORTANT DISCLAIMER</h4>
            <p className="text-sm text-yellow-900 mb-3">
              This analysis uses AI and market data to provide strategic guidance. It is <strong>NOT financial, tax, or legal advice</strong>.
            </p>
            <p className="text-sm text-yellow-900 mb-2">You should consult with:</p>
            <ul className="text-sm text-yellow-900 space-y-1 ml-4">
              <li>• <strong>CPA</strong> for tax implications</li>
              <li>• <strong>Financial advisor</strong> for investment strategy</li>
              <li>• <strong>Real estate attorney</strong> for legal matters</li>
              <li>• <strong>Licensed appraiser</strong> for accurate property valuations</li>
            </ul>
            <p className="text-xs text-yellow-800 mt-3">
              The AI cannot account for your complete financial picture, goals, or personal circumstances. All projections are estimates based on assumptions that may not hold true. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}