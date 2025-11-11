import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles } from "lucide-react";

export default function TierBadge({ tier }) {
  if (!tier || tier === 'free') return null;

  const tierConfig = {
    pro: {
      label: 'PRO',
      color: '#28A745',
      icon: Sparkles
    },
    homecare_essential: {
      label: 'HomeCare Essential',
      color: '#1B365D',
      icon: Crown
    },
    homecare_premium: {
      label: 'HomeCare Premium',
      color: '#FF6B35',
      icon: Crown
    },
    homecare_elite: {
      label: 'HomeCare Elite',
      color: '#8B5CF6',
      icon: Crown
    },
    propertycare_essential: {
      label: 'PropertyCare Essential',
      color: '#1B365D',
      icon: Crown
    },
    propertycare_premium: {
      label: 'PropertyCare Premium',
      color: '#FF6B35',
      icon: Crown
    },
    propertycare_elite: {
      label: 'PropertyCare Elite',
      color: '#8B5CF6',
      icon: Crown
    }
  };

  const config = tierConfig[tier];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge 
      className="font-semibold"
      style={{ backgroundColor: config.color }}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}