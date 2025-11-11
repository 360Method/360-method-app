import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UpgradePrompt({ context = "general", onDismiss }) {
  const prompts = {
    property_limit: {
      icon: Lock,
      color: "#FF6B35",
      title: "Property Limit Reached",
      message: "You've reached the 1 property limit on the Free tier.",
      features: [
        "Add up to 3 properties",
        "Portfolio dashboard",
        "Cross-property analytics"
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
        "Cascade risk scoring",
        "Cost projections",
        "Priority recommendations"
      ],
      cta: "Upgrade to Pro - $8/month",
      ctaUrl: createPageUrl("Pricing")
    },
    contractor_marketplace: {
      icon: Users,
      color: "#28A745",
      title: "Find Trusted Contractors",
      message: "Get quotes and compare contractors in your area.",
      features: [
        "Contractor marketplace",
        "Request & compare quotes",
        "Track contractor work"
      ],
      cta: "Upgrade to Pro - $8/month",
      ctaUrl: createPageUrl("Pricing")
    },
    homecare: {
      icon: Sparkles,
      color: "#1B365D",
      title: "Need Help Managing All This?",
      message: "HomeCare members get professional help with everything.",
      features: [
        "4 seasonal diagnostics/year",
        "6-16 hours included labor",
        "24/7 concierge support",
        "Keep all Pro features"
      ],
      cta: "Explore HomeCare - From $124/month",
      ctaUrl: createPageUrl("HomeCare")
    }
  };

  const prompt = prompts[context] || prompts.general;
  const Icon = prompt.icon || Sparkles;

  return (
    <Card className="border-2 mobile-card" style={{ borderColor: prompt.color, backgroundColor: `${prompt.color}10` }}>
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