import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, TrendingUp, Users, FileText, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UpgradePrompt({ context = "general", onDismiss, currentDoors = 0 }) {
  const prompts = {
    property_limit: {
      icon: Lock,
      color: "#FF6B35",
      title: "Property Limit Reached",
      message: currentDoors > 25 
        ? `You have ${currentDoors} doors - upgrade to Premium or Enterprise.`
        : currentDoors > 3
        ? `You have ${currentDoors} doors across your properties.`
        : "You've reached your tier's property or door limit.",
      features: currentDoors > 25 
        ? [
          "Premium: Up to 100 doors ($50 base + $3/door)",
          "Enterprise: Unlimited doors ($299 flat)",
          "Multi-user accounts (Enterprise only)"
        ]
        : [
          "Pro: Up to 25 doors ($8 base + $2/door)",
          "Premium: Up to 100 doors ($50 base)",
          "Enterprise: Unlimited ($299 flat)"
        ],
      cta: "View Plans & Pricing",
      ctaUrl: createPageUrl("Pricing")
    },
    cascade_alerts: {
      icon: TrendingUp,
      color: "#DC3545",
      title: "Unlock Cascade Risk Alerts",
      message: "See which small issues could become expensive disasters.",
      features: [
        "AI cascade risk scoring",
        "Cost impact projections",
        "Priority recommendations"
      ],
      cta: "Upgrade to Pro - Starting $8/month",
      ctaUrl: createPageUrl("Pricing")
    },
    export_reports: {
      icon: FileText,
      color: "#8B5CF6",
      title: "Export Reports (Pro+)",
      message: "Export detailed PDF reports of your maintenance history.",
      features: [
        "Professional PDF reports",
        "Portfolio analytics",
        "Historical cost tracking"
      ],
      cta: "Upgrade to Pro - Starting $8/month",
      ctaUrl: createPageUrl("Pricing")
    },
    share_access: {
      icon: Share2,
      color: "#8B5CF6",
      title: "Share Access (Premium+)",
      message: "Invite team members or property managers to collaborate.",
      features: [
        "Share with multiple users",
        "Role-based permissions",
        "Activity tracking"
      ],
      cta: "Upgrade to Premium - Starting $50/month",
      ctaUrl: createPageUrl("Pricing")
    },
    portfolio_comparison: {
      icon: TrendingUp,
      color: "#8B5CF6",
      title: "Portfolio Comparison (Premium+)",
      message: "Compare performance across all your properties.",
      features: [
        "Cross-property analytics",
        "Budget forecasting tools",
        "Investment ROI tracking"
      ],
      cta: "Upgrade to Premium - Starting $50/month",
      ctaUrl: createPageUrl("Pricing")
    }
  };

  const prompt = prompts[context] || prompts.property_limit;
  const Icon = prompt.icon || Sparkles;

  return (
    <Card className="border-2 mobile-card shadow-lg" style={{ borderColor: prompt.color, backgroundColor: `${prompt.color}10` }}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: prompt.color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
              {prompt.title}
            </h3>
            <p className="text-gray-700 mb-3" style={{ fontSize: '14px' }}>
              {prompt.message}
            </p>
            
            <ul className="space-y-1 mb-4">
              {prompt.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                  <span style={{ color: prompt.color }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="flex gap-3">
              <Button
                asChild
                className="font-semibold"
                style={{ backgroundColor: prompt.color, minHeight: '48px' }}
              >
                <Link to={prompt.ctaUrl}>{prompt.cta}</Link>
              </Button>
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  style={{ minHeight: '48px' }}
                >
                  Not Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}