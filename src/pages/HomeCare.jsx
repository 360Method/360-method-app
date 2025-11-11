import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Clock, Users, Star, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HomeCare() {
  const tiers = [
    {
      name: "Essential",
      price: 124,
      annual: 1490,
      color: "#28A745",
      popular: false,
      features: [
        "4 seasonal diagnostic visits",
        "Home Health Check™ included ($499 value)",
        "6 hours of included labor per year",
        "24/7 concierge system",
        "Dashboard + photo documentation",
        "Annual Home Health Report™",
        "HomeOwner Essentials Pack™",
        "5% discount on contractor coordination",
        "90-Day Safer Home Guarantee",
        "Full Command Center Pro access"
      ],
      bestFor: "Budget-conscious homeowners"
    },
    {
      name: "Premium",
      price: 183,
      annual: 2190,
      color: "#FF6B35",
      popular: true,
      features: [
        "Everything in Essential, PLUS:",
        "12 hours of included labor per year (double)",
        "Priority 24/7 concierge",
        "Enhanced photo documentation",
        "Quarterly reports + Annual report",
        "10% discount on contractor coordination",
        "Priority scheduling",
        "On-Time Promise"
      ],
      bestFor: "Most homeowners"
    },
    {
      name: "Elite",
      price: 233,
      annual: 2790,
      color: "#1B365D",
      popular: false,
      features: [
        "Everything in Premium, PLUS:",
        "16 hours of included labor per year",
        "VIP 24/7 concierge (response within 24hrs)",
        "Premium photo documentation (before/after)",
        "Seasonal + Quarterly + Annual reports",
        "15% discount on contractor coordination",
        "Dedicated technician (same person every visit)",
        "Annual preventive service coordination (HVAC OR water heater)",
        "Strategic planning session",
        "Triple Guarantee (Safety, On-Time, Satisfaction)"
      ],
      bestFor: "Premium homes, high-value properties"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Hero */}
        <div className="mb-8 text-center">
          <Badge className="mb-4" style={{ backgroundColor: '#1B365D' }}>
            PROFESSIONAL SERVICE
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            HomeCare Service
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Professional maintenance for your primary residence
          </p>
          <p className="text-sm text-gray-500">
            All plans include 360° Command Center Pro ($8/month value) • Annual billing
          </p>
        </div>

        {/* How It Works */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              🏠 How HomeCare Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Sign Up
                </h4>
                <p className="text-sm text-gray-700">
                  Choose your plan and get matched with a local 360° Operator
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Initial Assessment
                </h4>
                <p className="text-sm text-gray-700">
                  Complete Home Health Check™ - we document all systems
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Ongoing Care
                </h4>
                <p className="text-sm text-gray-700">
                  Quarterly visits, included labor, 24/7 support - we handle everything
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`border-2 mobile-card ${tier.popular ? 'shadow-xl' : ''}`}
              style={{ borderColor: tier.color }}
            >
              <CardContent className="p-6">
                {tier.popular && (
                  <Badge className="mb-4" style={{ backgroundColor: tier.color }}>
                    ⭐ MOST POPULAR
                  </Badge>
                )}
                
                <h3 className="font-bold mb-2" style={{ color: tier.color, fontSize: '24px' }}>
                  {tier.name}
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: tier.color }}>
                      ${tier.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Billed annually at ${tier.annual.toLocaleString()}/year
                  </p>
                </div>

                <div className="mb-6 space-y-2">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600">PERFECT FOR:</p>
                  <p className="text-sm text-gray-900">{tier.bestFor}</p>
                </div>

                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: tier.color, minHeight: '48px' }}
                >
                  <Link to={createPageUrl("FindOperator") + `?tier=${tier.name.toLowerCase()}`}>
                    Find Operator Near You
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-green-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    Peace of Mind Guaranteed
                  </h3>
                  <p className="text-sm text-gray-700">
                    90-Day Safer Home Guarantee on all plans. If we miss something critical in our diagnostics, we fix it free.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    Save Time & Money
                  </h3>
                  <p className="text-sm text-gray-700">
                    Average members save 2-4 hours/month on home maintenance and prevent $2,000-4,000/year in disasters.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    Local, Trusted Operators
                  </h3>
                  <p className="text-sm text-gray-700">
                    All 360° Operators are vetted, insured, and trained in the 360° Method framework.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B35' }}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    Included Pro Software
                  </h3>
                  <p className="text-sm text-gray-700">
                    Full access to 360° Command Center Pro ($8/month value). Track everything between visits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-2 mb-8" style={{ borderColor: '#1B365D', backgroundColor: '#1B365D10' }}>
          <CardContent className="p-8 text-center">
            <Home className="w-16 h-16 mx-auto mb-4" style={{ color: '#1B365D' }} />
            <h2 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '28px' }}>
              Ready to Stop Worrying About Home Maintenance?
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Find a 360° Operator in your area and get started with professional HomeCare service.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                asChild
                className="font-bold"
                style={{ backgroundColor: '#1B365D', minHeight: '56px' }}
              >
                <Link to={createPageUrl("FindOperator")}>
                  Find Operator Near You →
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                style={{ minHeight: '56px' }}
              >
                <Link to={createPageUrl("PropertyCare")}>
                  Looking for PropertyCare? (Rentals)
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}