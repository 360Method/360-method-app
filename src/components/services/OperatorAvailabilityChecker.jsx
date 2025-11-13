import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, Clock, Phone, Mail, Globe, AlertCircle } from "lucide-react";
import { checkServiceAvailability } from "../shared/ServiceAreaChecker";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OperatorAvailabilityChecker({ zipCode, propertyAddress }) {
  const [availability, setAvailability] = React.useState(null);
  const [isChecking, setIsChecking] = React.useState(false);

  React.useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      setIsChecking(true);
      const result = checkServiceAvailability(zipCode);
      setAvailability(result);
      setIsChecking(false);
    }
  }, [zipCode]);

  if (isChecking) {
    return (
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Checking operator availability...</p>
        </CardContent>
      </Card>
    );
  }

  if (!availability) {
    return null;
  }

  // Operator available in area
  if (availability.available) {
    return (
      <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            360° Operators Serve Your Area!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  {availability.operator}
                </h3>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className="bg-green-600 text-white">
                    ⭐ Certified 360° Provider
                  </Badge>
                  <Badge variant="outline" className="text-green-700 border-green-400">
                    {availability.area}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Serving: {availability.cities.slice(0, 3).join(', ')}
                  {availability.cities.length > 3 && ` +${availability.cities.length - 3} more`}
                </p>
              </div>
            </div>

            {availability.contact && (
              <div className="grid md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-green-200">
                {availability.contact.phone && (
                  <a 
                    href={`tel:${availability.contact.phone}`}
                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900"
                  >
                    <Phone className="w-4 h-4" />
                    {availability.contact.phone}
                  </a>
                )}
                {availability.contact.email && (
                  <a 
                    href={`mailto:${availability.contact.email}`}
                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900"
                  >
                    <Mail className="w-4 h-4" />
                    {availability.contact.email}
                  </a>
                )}
                {availability.contact.website && (
                  <a 
                    href={`https://${availability.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900"
                  >
                    <Globe className="w-4 h-4" />
                    {availability.contact.website}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 gap-2"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              <Link to={createPageUrl("Services") + `?operator=${availability.operatorId}`}>
                Request Quote
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 gap-2 border-2 border-green-400"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("HomeCare")}>
                View Service Plans
              </Link>
            </Button>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>💡 Already a HomeCare member?</strong> Log in to your service portal to request work or view your membership details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Coming soon in area
  if (availability.comingSoon) {
    return (
      <Card className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Clock className="w-6 h-6 text-orange-600" />
            Service Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              📍 {availability.area}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Coverage area:</strong> {availability.cities.join(', ')}
              </p>
              {availability.launchDate && (
                <p className="text-sm text-gray-700">
                  <strong>Expected launch:</strong> {availability.launchDate}
                </p>
              )}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-800 mb-3">
              We're actively recruiting certified operators in your area. Be the first to know when service becomes available!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {availability.waitlistActive && (
                <Button
                  asChild
                  className="flex-1 gap-2"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Waitlist") + `?area=${availability.areaId}&zip=${zipCode}`}>
                    Join Waitlist
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="flex-1 gap-2 border-2 border-orange-400"
                style={{ minHeight: '48px' }}
              >
                <Link to={createPageUrl("FindOperator") + "?type=become"}>
                  Become an Operator
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Good news:</strong> You can still use the 360° Command Center software nationwide! Service operators are only needed for professional labor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not available in area
  return (
    <Card className="border-2 border-gray-400 bg-gray-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <AlertCircle className="w-6 h-6 text-gray-600" />
          Service Not Available Yet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
          <p className="text-gray-700 mb-2">
            {propertyAddress ? (
              <>Professional services aren't available for <strong>{propertyAddress}</strong> yet.</>
            ) : (
              <>We don't have certified operators in your area (ZIP: {zipCode}) yet.</>
            )}
          </p>
          <p className="text-sm text-gray-600">
            We're expanding nationwide. The nearest service area is currently <strong>Clark County, WA</strong>.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            asChild
            className="gap-2"
            style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
          >
            <Link to={createPageUrl("Waitlist") + `?zip=${zipCode}`}>
              Join Waitlist
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2 border-2 border-gray-400"
            style={{ minHeight: '48px' }}
          >
            <Link to={createPageUrl("FindOperator") + "?type=become"}>
              Become an Operator
            </Link>
          </Button>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2">
            ✅ Software Available Nationwide
          </p>
          <p className="text-xs text-gray-700">
            You can still use the full 360° Command Center software for DIY maintenance tracking, prioritization, and planning!
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-3 w-full gap-2"
            style={{ minHeight: '44px' }}
          >
            <Link to={createPageUrl("Dashboard")}>
              Continue Managing DIY
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}