import React from "react";
import { Operator } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Phone, Mail, ExternalLink, CheckCircle2 } from "lucide-react";
import OperatorContactDialog from "../components/services/OperatorContactDialog";

export default function FindOperator() {
  const [zipCode, setZipCode] = React.useState("");
  const [searchTriggered, setSearchTriggered] = React.useState(false);
  const [selectedOperator, setSelectedOperator] = React.useState(null);
  const [serviceTier, setServiceTier] = React.useState(null);

  const { data: operators = [] } = useQuery({
    queryKey: ['operators'],
    queryFn: () => Operator.list(),
    enabled: searchTriggered,
  });

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const filteredOperators = zipCode
    ? operators.filter(op => op.service_areas?.some(area => area.includes(zipCode)))
    : operators;

  const handleContactOperator = (operator, tier = 'premium') => {
    setSelectedOperator(operator);
    setServiceTier(tier);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4" style={{ backgroundColor: '#1B365D' }}>
            FIND AN OPERATOR
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            Find a 360° Operator Near You
          </h1>
          <p className="text-gray-600 text-lg">
            Local professionals trained in the 360° Method
          </p>
        </div>

        {/* Search */}
        <Card className="border-2 border-blue-300 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6" style={{ color: '#1B365D' }} />
              <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                Enter Your Location
              </h3>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="font-semibold mb-2 block">ZIP Code</Label>
                <Input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="98660"
                  maxLength="5"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="font-bold"
                  style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No operators placeholder */}
        {searchTriggered && filteredOperators.length === 0 && (
          <Card className="border-2 border-orange-300 bg-orange-50 mb-8">
            <CardContent className="p-8 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-orange-600" />
              <h3 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '24px' }}>
                No Operators Yet in Your Area
              </h3>
              <p className="text-gray-700 mb-6 max-w-xl mx-auto">
                We're expanding! The 360° Method is currently available in select markets. 
                Want to bring it to your area?
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button
                  className="font-bold"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                  onClick={() => alert('Coming soon: Notification functionality')}
                >
                  Notify Me When Available
                </Button>
                <Button
                  variant="outline"
                  style={{ minHeight: '48px' }}
                  onClick={() => alert('Coming soon: Become operator inquiry')}
                >
                  Interested in Becoming an Operator?
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operator Results */}
        {filteredOperators.map((operator) => (
          <Card key={operator.id} className="border-2 mobile-card mb-6" style={{ borderColor: '#1B365D' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">
                    {operator.company_name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: '#1B365D', fontSize: '22px' }}>
                    {operator.company_name}
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{operator.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-sm text-gray-600">({operator.review_count || 0} reviews)</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                      Verified Operator
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {operator.service_types?.includes('homecare') && (
                      <Badge style={{ backgroundColor: '#28A745' }}>HomeCare</Badge>
                    )}
                    {operator.service_types?.includes('propertycare') && (
                      <Badge style={{ backgroundColor: '#FF6B35' }}>PropertyCare</Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                {operator.description || 'Professional 360° Method operator serving your area.'}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Service Areas: {operator.service_areas?.join(', ') || 'Multiple areas'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a href={`tel:${operator.phone}`} className="text-blue-600 hover:underline">
                    {operator.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${operator.email}`} className="text-blue-600 hover:underline">
                    {operator.email}
                  </a>
                </div>
                {operator.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <a href={operator.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {operator.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                    {operator.active_customers || 0}
                  </p>
                  <p className="text-xs text-gray-600">Active Customers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: '#28A745' }}>
                    {operator.rating?.toFixed(1) || '5.0'}★
                  </p>
                  <p className="text-xs text-gray-600">Average Rating</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: operator.accepting_new_clients ? '#28A745' : '#DC3545' }}>
                    {operator.accepting_new_clients ? 'YES' : 'FULL'}
                  </p>
                  <p className="text-xs text-gray-600">Accepting New</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  className="flex-1 font-bold"
                  style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
                  onClick={() => handleContactOperator(operator)}
                  disabled={!operator.accepting_new_clients}
                >
                  Request Service
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                  onClick={() => alert('Coming soon: Detailed operator profile')}
                >
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Info Card */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              What is a 360° Operator?
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>360° Operators</strong> are local service companies trained and certified in 
                the 360° Method framework. They provide HomeCare and PropertyCare services in their markets.
              </p>
              <p>
                <strong>All operators are:</strong>
              </p>
              <ul className="ml-6 space-y-1">
                <li>• Licensed and insured</li>
                <li>• Trained in the 360° Method diagnostic framework</li>
                <li>• Background-checked and vetted</li>
                <li>• Committed to the 360° service standards</li>
                <li>• Rated by customers like you</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operator Contact Dialog */}
      {selectedOperator && (
        <OperatorContactDialog
          operator={selectedOperator}
          serviceTier={serviceTier}
          onClose={() => {
            setSelectedOperator(null);
            setServiceTier(null);
          }}
        />
      )}
    </div>
  );
}