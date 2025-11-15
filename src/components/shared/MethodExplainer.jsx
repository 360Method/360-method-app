import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ArrowRight, Eye, Zap, TrendingUp } from 'lucide-react';

export default function MethodExplainer({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">The 360° Method Explained</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Problem */}
          <div>
            <h3 className="font-semibold text-lg mb-2">The Problem</h3>
            <p className="text-gray-700">
              Most homeowners are reactive. A $50 clogged gutter becomes $500 foundation damage, 
              then a $5,000 basement flood. This is called a <strong>cascade failure</strong>.
            </p>
          </div>
          
          {/* Solution */}
          <div>
            <h3 className="font-semibold text-lg mb-2">The Solution</h3>
            <p className="text-gray-700 mb-4">
              The 360° Method is a systematic approach to prevent disasters and build wealth:
            </p>
            
            <div className="space-y-4">
              {/* Phase 1 */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-lg">AWARE: Know Your Property</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-13">
                  <li><strong>1. Baseline:</strong> Document what you own</li>
                  <li><strong>2. Inspect:</strong> Check seasonally for issues</li>
                  <li><strong>3. Track:</strong> Record maintenance history</li>
                </ul>
              </div>
              
              {/* Phase 2 */}
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-lg">ACT: Fix Problems</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-13">
                  <li><strong>4. Prioritize:</strong> What to fix first</li>
                  <li><strong>5. Schedule:</strong> When to fix it</li>
                  <li><strong>6. Execute:</strong> Complete the work</li>
                </ul>
              </div>
              
              {/* Phase 3 */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-lg">ADVANCE: Build Value</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-13">
                  <li><strong>7. Preserve:</strong> Extend system life</li>
                  <li><strong>8. Upgrade:</strong> Strategic improvements</li>
                  <li><strong>9. Scale:</strong> Portfolio growth</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
            <h3 className="font-semibold text-lg mb-2">The Results</h3>
            <ul className="text-gray-700 space-y-1">
              <li>✅ Save $27,000-$72,000 over 10-15 years</li>
              <li>✅ Catch problems when they're $50, not $5,000</li>
              <li>✅ Build home equity systematically</li>
              <li>✅ Sleep soundly (no surprise disasters)</li>
            </ul>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full"
            size="lg"
          >
            Got it! Let's start <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}