import React from "react";
import { Badge } from "@/components/ui/badge";
import { Compass, Flag, Star, Crown, Home } from "lucide-react";
import { getTierConfig } from "../shared/TierCalculator";

export default function TierBadge({ tier, size = "default", showIcon = true, className = "" }) {
  const config = getTierConfig(tier);
  
  const icons = {
    free: Compass,
    homeowner_plus: Home,
    good: Flag,
    better: Star,
    best: Crown
  };

  const Icon = icons[tier] || Compass;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  return (
    <Badge
      className={`${sizeClasses[size]} text-white inline-flex items-center gap-1.5 ${className}`}
      style={{ backgroundColor: config.color }}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      <span className="font-semibold">{config.displayName}</span>
    </Badge>
  );
}