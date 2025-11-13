import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingDown } from "lucide-react";

export default function CompletionCelebration({ task, savings, onClose }) {
  
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
      
      {/* Animated confetti-like particles (CSS only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md mx-4 text-center relative z-10 animate-in zoom-in duration-500">
        <div className="text-6xl md:text-7xl mb-4 animate-bounce">🎉</div>
        
        <div className="mb-2">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
            Task Complete!
          </h2>
        </div>
        
        <p className="text-gray-700 mb-4 text-lg font-semibold">
          {task.title}
        </p>
        
        {savings > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 font-semibold">You saved</p>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-green-600 mb-1">
              ${Math.round(savings)}
            </p>
            <p className="text-xs text-green-700">by doing it yourself!</p>
          </div>
        )}
        
        <Button
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 font-semibold w-full"
          style={{ minHeight: '48px' }}
        >
          Continue
        </Button>
        
        <p className="text-xs text-gray-500 mt-3">
          Task archived to Track with completion details
        </p>
      </div>
      
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}