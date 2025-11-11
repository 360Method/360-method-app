import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FeatureGate({ 
  feature, 
  requiredTier = 'pro',
  children,
  showUpgradeCard = true 
}) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const currentTier = user?.subscription_tier || 'free';
  
  // Tier hierarchy: free < pro < service
  const tierLevel = {
    'free': 0,
    'pro': 1,
    'homecare_essential': 2,
    'homecare_premium': 2,
    'homecare_elite': 2,
    'propertycare_essential': 2,
    'propertycare_premium': 2,
    'propertycare_elite': 2
  };

  const requiredLevel = tierLevel[requiredTier] || 1;
  const currentLevel = tierLevel[currentTier] || 0;
  const hasAccess = currentLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradeCard) {
    return null;
  }

  const featureNames = {
    cascade_alerts: {
      name: 'Cascade Risk Alerts',
      description: 'See which small issues could become expensive disasters',
      benefit: 'Prevent $2,000-4,000 in unexpected repairs per year'
    },
    portfolio_analytics: {
      name: 'Portfolio Analytics',
      description: 'Track performance across multiple properties',
      benefit: 'Understand your total investment health at a glance'
    },
    contractor_marketplace: {
      name: 'Contractor Marketplace',
      description: 'Get quotes and compare trusted contractors',
      benefit: 'Save 15-25% on contractor costs with competitive bidding'
    },
    advanced_reporting: {
      name: 'Advanced Reporting',
      description: 'Export detailed reports and documentation',
      benefit: 'Perfect for taxes, insurance claims, and property sales'
    },
    priority_support: {
      name: 'Priority Support',
      description: 'Get faster responses and dedicated help',
      benefit: 'Email support with 24hr response time guarantee'
    }
  };

  const featureInfo = featureNames[feature] || {
    name: 'Premium Feature',
    description: 'This feature requires a paid subscription',
    benefit: 'Unlock advanced capabilities for your properties'
  };

  return (
    <Card className="border-2 border-orange-300 bg-orange-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
          {featureInfo.name}
        </h3>
        
        <p className="text-gray-700 mb-3">
          {featureInfo.description}
        </p>
        
        <div className="bg-white rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 mb-1">
            <strong>Benefit:</strong>
          </p>
          <p className="text-sm text-gray-900">
            {featureInfo.benefit}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {requiredTier === 'pro' && (
            <>
              <Button
                asChild
                className="flex-1 font-bold"
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              >
                <Link to={createPageUrl("Upgrade")}>
                  Upgrade to Pro - $8/month
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                <Link to={createPageUrl("HomeCare")}>
                  <Crown className="w-4 h-4 mr-2" />
                  Or Get HomeCare
                </Link>
              </Button>
            </>
          )}
          
          {requiredTier !== 'pro' && (
            <Button
              asChild
              className="flex-1 font-bold"
              style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
            >
              <Link to={createPageUrl("HomeCare")}>
                <Crown className="w-4 h-4 mr-2" />
                Get HomeCare Service
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}