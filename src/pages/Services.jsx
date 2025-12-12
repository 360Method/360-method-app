import React from "react";
import { Property, auth } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Home, Building2, MapPin, Star, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Services() {
  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', authUser?.id],
    queryFn: () => Property.list('-created_at', authUser?.id),
    enabled: !!authUser?.id
  });

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');
  const operatorName = user?.operator_name;

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4" style={{ backgroundColor: '#1B365D' }}>
            PROFESSIONAL SERVICES
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            360° Method Services
          </h1>
          <p className="text-gray-600 text-lg">
            From DIY software to full professional management
          </p>
        </div>

        {/* Current Status */}
        {isServiceMember && operatorName ? (
          <Card className="border-2 border-green-300 bg-green-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                    Active Service Member
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Your properties are being managed by: <strong>{operatorName}</strong>
                  </p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Button
                      variant="outline"
                      style={{ minHeight: '48px' }}
                      onClick={() => alert('Coming soon: Contact operator')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Contact Your Operator
                    </Button>
                    <Button
                      variant="outline"
                      style={{ minHeight: '48px' }}
                      onClick={() => alert('Coming soon: Service dashboard')}
                    >
                      View Service Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                    Not Currently a Service Member
                  </h3>
                  <p className="text-gray-700 mb-3">
                    You're managing your properties yourself. Want professional help?
                  </p>
                  <p className="text-sm text-gray-600">
                    See our service options below to get expert assistance with maintenance and management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* HomeCare */}
          <Card className="border-2 mobile-card" style={{ borderColor: '#1B365D' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1B365D' }}>
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '22px' }}>
                    HomeCare
                  </h3>
                  <p className="text-sm text-gray-600">For your primary residence</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                Professional maintenance service for homeowners who want to protect their biggest investment without the hassle.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>4 seasonal diagnostic visits per year</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>6-16 hours of included labor</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>24/7 concierge support system</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>90-Day Safer Home Guarantee</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl text-gray-600">FROM</span>
                  <span className="text-3xl font-bold" style={{ color: '#1B365D' }}>$124</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500">Billed annually • Includes Pro software</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="font-bold"
                  style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("HomeCare")}>
                    Learn More About HomeCare
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("FindOperator")}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Operator Near Me
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PropertyCare */}
          <Card className="border-2 mobile-card" style={{ borderColor: '#FF6B35' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6B35' }}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#FF6B35', fontSize: '22px' }}>
                    PropertyCare
                  </h3>
                  <p className="text-sm text-gray-600">For rental properties</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                Professional management for investors and landlords. Priced per door with volume discounts for portfolios.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>4 seasonal diagnostics per door</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Tenant coordination & turnovers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Portfolio analytics & reporting</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Volume discounts (10-20% off)</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl text-gray-600">FROM</span>
                  <span className="text-3xl font-bold" style={{ color: '#FF6B35' }}>$124</span>
                  <span className="text-gray-600">/door/month</span>
                </div>
                <p className="text-xs text-gray-500">Billed annually • 5+ doors get discount</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="font-bold"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("PropertyCare")}>
                    Calculate PropertyCare Pricing
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("FindOperator")}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Operator for Portfolio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Professional Service */}
        <Card className="border-2 border-gray-300 mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-6 text-center" style={{ color: '#1B365D', fontSize: '24px' }}>
              Why Choose Professional Service?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Prevent Disasters
                </h4>
                <p className="text-sm text-gray-700">
                  Catch small issues before they become $15K emergencies. Members prevent $2-4K/year in disasters.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Save Time
                </h4>
                <p className="text-sm text-gray-700">
                  No more coordinating contractors or worrying about maintenance. We handle everything for you.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Protect Your Investment
                </h4>
                <p className="text-sm text-gray-700">
                  Maintain your property value and avoid costly neglect. Get peace of mind knowing experts are watching.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials / Social Proof */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold mb-6 text-center" style={{ color: '#1B365D', fontSize: '24px' }}>
              What Service Members Say
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  "Best decision I made. They caught a small roof leak that would've cost me thousands. 
                  Now I sleep easy knowing my home is being watched by professionals."
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  — Sarah M., HomeCare Essential Member
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  "As a landlord with 8 doors, PropertyCare has been a game-changer. Maintenance costs down 30%, 
                  tenant satisfaction up. Worth every penny."
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  — James K., PropertyCare Premium Member
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}