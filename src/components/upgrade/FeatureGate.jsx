import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Brain, Sparkles, TrendingUp, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FeatureGate({ 
  requiredTier = 'good',
  featureName = "This feature",
  why = "Unlock advanced capabilities",
  children 
}) {
  const tierInfo = {
    good: {
      name: 'Pro',
      color: '#28A745',
      icon: Sparkles,
      example: 'AI cascade risk alerts that prevent $10K+ disasters'
    },
    better: {
      name: 'Premium',
      color: '#8B5CF6',
      icon: TrendingUp,
      example: 'AI portfolio comparison across all your properties'
    },
    best: {
      name: 'Enterprise',
      color: '#F59E0B',
      icon: Crown,
      example: 'Custom AI reports and multi-user team collaboration'
    }
  };

  const tier = tierInfo[requiredTier];
  const Icon = tier.icon;

  return (
    <Card className="border-2 shadow-lg" style={{ borderColor: tier.color, backgroundColor: `${tier.color}15` }}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: tier.color }}
          >
            <Lock className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg" style={{ color: '#1B365D' }}>
                {featureName}
              </h3>
              <Badge className="text-white" style={{ backgroundColor: tier.color }}>
                {tier.name}+
              </Badge>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {why}
            </p>

            <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-1">
                🎯 Why This Makes You Better:
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {tier.example}. The 360° Method's AI doesn't just give you data - it teaches you to think like a property professional.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                asChild
                className="gap-2 font-semibold"
                style={{ backgroundColor: tier.color, minHeight: '48px' }}
              >
                <Link to={createPageUrl("Pricing")}>
                  <Icon className="w-4 h-4" />
                  Upgrade to {tier.name}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="gap-2"
                style={{ minHeight: '48px' }}
              >
                <Link to={createPageUrl("Pricing")}>
                  Compare Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}