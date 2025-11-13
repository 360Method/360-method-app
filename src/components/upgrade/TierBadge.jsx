import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, TrendingUp, Crown } from "lucide-react";

export default function TierBadge({ tier, size = "default" }) {
  const tierConfig = {
    free: {
      label: "Free",
      bg: "#6B7280",
      icon: Sparkles
    },
    good: {
      label: "Pro",
      bg: "#28A745",
      icon: Zap
    },
    better: {
      label: "Premium",
      bg: "#8B5CF6",
      icon: TrendingUp
    },
    best: {
      label: "Enterprise",
      bg: "#F59E0B",
      icon: Crown
    },
    // Legacy support
    pro: {
      label: "Pro",
      bg: "#28A745",
      icon: Zap
    },
    premium: {
      label: "Premium",
      bg: "#8B5CF6",
      icon: TrendingUp
    },
    enterprise: {
      label: "Enterprise",
      bg: "#F59E0B",
      icon: Crown
    },
    homecare_essential: {
      label: "HomeCare Essential",
      bg: "#1B365D",
      icon: Crown
    },
    homecare_premium: {
      label: "HomeCare Premium",
      bg: "#1B365D",
      icon: Crown
    },
    homecare_elite: {
      label: "HomeCare Elite",
      bg: "#1B365D",
      icon: Crown
    }
  };

  const config = tierConfig[tier] || tierConfig.free;
  const Icon = config.icon;
  
  // Don't render for free tier
  if (tier === 'free') return null;

  const sizeClasses = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <Badge 
      className={`text-white gap-1.5 ${sizeClasses}`}
      style={{ backgroundColor: config.bg }}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </Badge>
  );
}