import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles, Crown, Home, Building2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { checkServiceAvailability } from "../shared/ServiceAreaChecker";

export default function ZipCodeDetector({ onComplete, initialZip = "" }) {
  const [zipCode, setZipCode] = React.useState(initialZip);
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const handleCheck = async () => {
    if (zipCode.length !== 5) {
      setResult({ error: true, message: "Please enter a valid 5-digit ZIP code" });
      return;
    }

    setChecking(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const availability = checkServiceAvailability(zipCode);
    setResult(availability);
    setChecking(false);
    
    if (onComplete) {
      onComplete(zipCode, availability);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className="space-y-6">
      {/* ZIP Input Card */}
      <Card className="border-2 border-blue-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              Let's See What's Available in Your Area
            </h3>
          </div>
          
          <p className="text-gray-700 mb-4">
            Enter your ZIP code to discover available services and pricing in your region.
          </p>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onKeyPress={handleKeyPress}
                placeholder="98660"
                maxLength="5"
                style={{ minHeight: '48px' }}
                className="text-center text-lg font-semibold"
              />
            </div>
            <Button
              onClick={handleCheck}
              disabled={checking || zipCode.length !== 5}
              className="font-bold"
              style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
            >
              {checking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && !result.error && (
        <div className="space-y-4">
          {/* Service Available */}
          {result.available && (
            <>
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '20px' }}>
                        ✓ Great News!
                      </h3>
                      <p className="text-gray-900 font-semibold mb-2">
                        Professional 360° services are available in your area!
                      </p>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>📍 <strong>ZIP:</strong> {zipCode} ({result.area})</p>
                        <p>🏢 <strong>Certified Operator:</strong> {result.operator}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mb-4">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '22px' }}>
                  Choose Your Path:
                </h3>
              </div>
            </>
          )}

          {/* Coming Soon */}
          {result.comingSoon && (
            <>
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '20px' }}>
                        Thanks for your interest!
                      </h3>
                      <p className="text-gray-900 font-semibold mb-2">
                        📍 ZIP: {zipCode} ({result.area})
                      </p>
                      <p className="text-gray-700">
                        Professional 360° services aren't available in your area yet.
                        {result.launchDate && result.launchDate !== 'TBD' && (
                          <span className="font-semibold"> Expected launch: {result.launchDate}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mb-4">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '22px' }}>
                  What You Can Do Now:
                </h3>
              </div>
            </>
          )}

          {/* No Service Area Defined */}
          {!result.available && !result.comingSoon && (
            <>
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                        Software Available Nationwide
                      </h3>
                      <p className="text-gray-700 mb-3">
                        📍 ZIP: {zipCode}
                      </p>
                      <p className="text-gray-700">
                        While professional services aren't available yet in your area, 
                        360° Command Center software works nationwide!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Command Center Option - Always Available */}
          <Card className="border-2 border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                    360° Command Center
                  </h3>
                  <p className="text-sm text-gray-600">DIY Software</p>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>✓ Available nationwide</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>✓ Full DIY toolkit</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>✓ Property management</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>✓ Maintenance tracking</span>
                </li>
              </ul>

              <div className="mb-4">
                <span className="text-2xl font-bold" style={{ color: '#28A745' }}>FREE</span>
                <span className="text-gray-600 ml-2">or $8/month Pro</span>
                <p className="text-xs text-gray-500 mt-1">Up to 3 properties + $2/door for additional</p>
              </div>

              <Button
                asChild
                className="w-full font-bold"
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              >
                <Link to={createPageUrl("Properties")}>
                  Start Free
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* HomeCare Option */}
          {result.available && result.services?.homeCare?.available && (
            <Card className="border-2" style={{ borderColor: '#1B365D' }}>
              <CardContent className="p-6">
                <Badge className="mb-3" style={{ backgroundColor: '#FF6B35' }}>
                  ⭐ PROFESSIONAL SERVICE
                </Badge>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1B365D' }}>
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                      HomeCare Service
                    </h3>
                    <p className="text-sm text-gray-600">Professional Service + Software</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4 text-sm">
                  <li>• 4 seasonal diagnostic visits</li>
                  <li>• 6-16 hours included labor/year</li>
                  <li>• 24/7 concierge system</li>
                  <li>• 90-Day Safer Home Guarantee</li>
                  <li>• Full software access included</li>
                </ul>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">FROM</span>
                    <span className="text-2xl font-bold" style={{ color: '#1B365D' }}>$124</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Essential • Premium • Elite tiers available</p>
                </div>

                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full font-bold"
                    style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
                  >
                    <Link to={createPageUrl("HomeCare")}>
                      Get Free Assessment
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-gray-600">
                    Operator: {result.operator}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PropertyCare Option */}
          {result.available && result.services?.propertyCare?.available && (
            <Card className="border-2 border-orange-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B35' }}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#FF6B35', fontSize: '20px' }}>
                      PropertyCare Service
                    </h3>
                    <p className="text-sm text-gray-600">For Rental Properties</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4 text-sm">
                  <li>• Per-door pricing</li>
                  <li>• Volume discounts (10-20% off)</li>
                  <li>• Tenant coordination</li>
                  <li>• Portfolio analytics</li>
                </ul>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">FROM</span>
                    <span className="text-2xl font-bold" style={{ color: '#FF6B35' }}>$124</span>
                    <span className="text-gray-600">/door/month</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">5+ doors get volume discounts</p>
                </div>

                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("PropertyCare")}>
                    Calculate My Investment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Waitlist CTA for Coming Soon Areas */}
          {result.comingSoon && result.waitlistActive && (
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardContent className="p-6 text-center">
                <Crown className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                  🔔 Join the Waitlist
                </h3>
                <p className="text-gray-700 mb-4">
                  Want professional service in {result.area}?
                </p>
                <Button
                  asChild
                  className="font-bold"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Waitlist") + `?zip=${zipCode}&area=${result.area}`}>
                    Join Waitlist for {result.area}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-700">
              {result.message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}