import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

export default function DemoConversionModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Like What You See?
          </h3>
          <p className="text-gray-600 mb-6">
            Create a free account to track your own property. 
            Everything you see in demo is available on the free tier.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div>
              <div className="font-bold text-2xl text-blue-600">30s</div>
              <div className="text-gray-600">Setup time</div>
            </div>
            <div>
              <div className="font-bold text-2xl text-green-600">$0</div>
              <div className="text-gray-600">Free forever</div>
            </div>
            <div>
              <div className="font-bold text-2xl text-purple-600">9</div>
              <div className="text-gray-600">Full method</div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/Login')}
            className="w-full bg-orange-500 hover:bg-orange-600 mb-3 gap-2"
            style={{ minHeight: '48px' }}
          >
            <Sparkles className="w-4 h-4" />
            Start Free Today
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Continue in Demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}