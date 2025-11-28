import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Operator } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PortalMarketplace() {
  const [zipCode, setZipCode] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [filterService, setFilterService] = useState('all');

  const { data: operators = [] } = useQuery({
    queryKey: ['operators', zipCode],
    queryFn: async () => {
      if (!zipCode) return [];
      const ops = await Operator.list();
      return ops.filter(op =>
        op.service_areas?.includes(zipCode) && op.accepting_new_clients
      );
    },
    enabled: zipCode.length === 5
  });

  const handleRequestService = (operator) => {
    setSelectedOperator(operator);
  };

  const filteredOperators = filterService === 'all'
    ? operators
    : operators.filter(op => op.service_types?.includes(filterService));

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Professional Help
          </h1>
          <p className="text-gray-600">
            Connect with certified 360° Method Operators in your area
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Your Zip Code
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter zip code (e.g., 98661)"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="pl-10"
                  maxLength={5}
                />
              </div>
            </div>

            {zipCode.length === 5 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filterService === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterService('all')}
                >
                  All Services
                </Button>
                <Button
                  variant={filterService === 'homecare' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterService('homecare')}
                >
                  HomeCare
                </Button>
                <Button
                  variant={filterService === 'propertycare' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterService('propertycare')}
                >
                  PropertyCare
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {zipCode.length < 5 ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="font-semibold text-gray-900 mb-2">
              Search for Operators
            </div>
            <div className="text-sm text-gray-600">
              Enter your zip code to find certified operators in your area
            </div>
          </Card>
        ) : filteredOperators.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="font-semibold text-gray-900 mb-2">
              No Operators Available
            </div>
            <div className="text-sm text-gray-600 mb-4">
              We don't have operators in {zipCode} yet. Join our waitlist to be notified when service becomes available.
            </div>
            <Button>
              Join Waitlist
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOperators.map(operator => (
              <Card key={operator.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Operator Logo/Image */}
                  <div className="flex-shrink-0">
                    {operator.logo_url ? (
                      <img
                        src={operator.logo_url}
                        alt={operator.company_name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {operator.company_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Operator Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {operator.company_name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {operator.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-semibold text-gray-900">
                                {operator.rating.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({operator.review_count} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Certified
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {operator.description || 'Professional property maintenance services'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {operator.service_types?.map(service => (
                        <Badge key={service} variant="outline" className="capitalize">
                          {service}
                        </Badge>
                      ))}
                      {operator.available_tiers?.map(tier => (
                        <Badge key={tier} className="bg-blue-100 text-blue-700 capitalize">
                          {tier}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Serves {operator.service_areas?.length || 0} zip codes
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        From ${operator.starting_price || '99'}/mo
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRequestService(operator)}
                      className="gap-2"
                    >
                      Request Service
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Operator Detail Modal */}
      {selectedOperator && (
        <Dialog open={!!selectedOperator} onOpenChange={() => setSelectedOperator(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedOperator.company_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">
                  {selectedOperator.description || 'Professional property maintenance services'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOperator.service_types?.map(service => (
                    <Badge key={service} className="capitalize">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Available Tiers</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOperator.available_tiers?.map(tier => (
                    <Badge key={tier} className="bg-blue-100 text-blue-700 capitalize">
                      {tier}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedOperator.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedOperator.email}</span>
                  </div>
                  {selectedOperator.website && (
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <a
                        href={selectedOperator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 font-medium text-blue-600 hover:underline"
                      >
                        {selectedOperator.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 gap-2">
                  Request Service
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setSelectedOperator(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}