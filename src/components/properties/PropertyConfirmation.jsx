
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Edit, Home } from "lucide-react";

export default function PropertyConfirmation({ data, onEdit, onConfirm, isCreating }) {
  // Debug: Log the data being confirmed
  React.useEffect(() => {
    console.log('PropertyConfirmation - Received data:', data);
  }, [data]);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getPropertyUseLabel = (type) => {
    const labels = {
      'primary': 'Primary Residence',
      'primary_with_rental': 'Primary with Rental',
      'rental_unfurnished': 'Rental - Unfurnished',
      'rental_furnished': 'Rental - Furnished',
      'vacation_rental': 'Vacation Rental'
    };
    return labels[type] || type;
  };

  const hasRentalConfig = data.property_use_type !== 'primary';
  const config = data.rental_config || {};

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-green-600 text-white">Step {hasRentalConfig ? '5 of 5' : '4 of 4'}</Badge>
          <span className="text-sm text-gray-600">Review & confirm</span>
        </div>
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
          Confirm Property Details
        </h2>
        <p className="text-gray-600 mb-4" style={{ fontSize: '16px' }}>
          Review your information before saving
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#28A745' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#28A745' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#28A745' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#28A745' }} />
          {hasRentalConfig && <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#28A745' }} />}
        </div>
      </div>

      {/* Property Summary */}
      <Card className="border-3 border-green-300 bg-green-50 mb-6 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-2xl mb-2" style={{ color: '#1B365D' }}>
                {data.street_address}
                {data.unit_number && ` #${data.unit_number}`}
              </h3>
              <p className="text-gray-700 text-lg">
                {data.city}, {data.state} {data.zip_code}
              </p>
              {data.county && (
                <p className="text-gray-600 text-sm">
                  {data.county} County • {data.climate_zone}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Property Use</p>
              <p className="font-bold text-lg" style={{ color: '#1B365D' }}>
                {getPropertyUseLabel(data.property_use_type)}
              </p>
            </div>
            {data.property_type && (
              <div>
                <p className="text-sm text-gray-600">Structure Type</p>
                <p className="font-bold text-lg" style={{ color: '#1B365D' }}>
                  {data.property_type}
                </p>
              </div>
            )}
            {data.year_built && (
              <div>
                <p className="text-sm text-gray-600">Year Built</p>
                <p className="font-bold text-lg" style={{ color: '#1B365D' }}>
                  {data.year_built}
                </p>
              </div>
            )}
            {data.square_footage && (
              <div>
                <p className="text-sm text-gray-600">Square Footage</p>
                <p className="font-bold text-lg" style={{ color: '#1B365D' }}>
                  {data.square_footage.toLocaleString()} sq ft
                </p>
              </div>
            )}
            {data.bedrooms !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Bedrooms</p>
                <p className="font-bold text-lg" style={{ color: '#1B365D' }}>
                  {data.bedrooms === 0 ? 'Studio' : data.bedrooms}
                </p>
              </div>
            )}
            {data.bathrooms && (
              <div>
                <p className="text-sm text-gray-600">Bathrooms</p>
                <p className="font-bold text-lg" style={{ color: '#1B365D' }}>
                  {data.bathrooms}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rental Details */}
      {hasRentalConfig && (
        <Card className="border-2 border-blue-300 mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              🏘️ Rental Details
            </h3>

            <div className="space-y-3">
              {data.property_use_type === 'primary_with_rental' && (
                <>
                  {config.rental_type && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Rental Type:</span>
                      <span className="font-semibold">
                        {config.rental_type === 'adu' ? 'ADU / Guest house' :
                         config.rental_type === 'other' ? config.rental_type_other || 'Other' :
                         config.rental_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  )}
                  {config.number_of_rental_units && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Number of Units:</span>
                      <span className="font-semibold">{config.number_of_rental_units}</span>
                    </div>
                  )}
                  {config.rental_square_footage && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Rental Square Footage:</span>
                      <span className="font-semibold">{config.rental_square_footage} sq ft</span>
                    </div>
                  )}
                </>
              )}

              {config.is_furnished && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Furnishing:</span>
                  <Badge className="bg-orange-600 text-white">
                    {config.furnishing_level?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Badge>
                </div>
              )}

              {config.rental_duration && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Rental Duration:</span>
                  <span className="font-semibold">
                    {config.rental_duration === 'short_term' ? 'Short-term' :
                     config.rental_duration === 'medium_term' ? 'Medium-term' :
                     'Long-term'}
                  </span>
                </div>
              )}

              {config.annual_turnovers && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Annual Turnovers:</span>
                  <span className="font-semibold">~{config.annual_turnovers} per year</span>
                </div>
              )}

              {data.property_use_type === 'vacation_rental' && config.bookings_per_year && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Bookings per Year:</span>
                  <span className="font-semibold">~{config.bookings_per_year}</span>
                </div>
              )}

              {config.platforms && config.platforms.length > 0 && (
                <div className="py-2 border-b">
                  <span className="text-gray-600 block mb-2">Platforms:</span>
                  <div className="flex flex-wrap gap-2">
                    {config.platforms.map((platform) => (
                      <Badge key={platform} variant="outline">
                        {platform === 'airbnb' ? 'Airbnb' :
                         platform === 'vrbo' ? 'VRBO' :
                         platform === 'booking_com' ? 'Booking.com' :
                         platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {config.management_type && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Management:</span>
                  <span className="font-semibold">
                    {config.management_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={onEdit}
          variant="outline"
          className="flex-1 gap-2"
          style={{ minHeight: '56px' }}
        >
          <Edit className="w-5 h-5" />
          Edit Details
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isCreating}
          className="flex-1 gap-2"
          style={{ backgroundColor: '#28A745', minHeight: '56px' }}
        >
          {isCreating ? (
            'Creating Property...'
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Save Property & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
