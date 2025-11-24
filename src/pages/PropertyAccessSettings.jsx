import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import PropertyAccessManager from '../components/properties/PropertyAccessManager';
import { ArrowLeft } from 'lucide-react';

export default function PropertyAccessSettings() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('propertyId');

  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => base44.entities.Property.filter({ id: propertyId }).then(p => p[0]),
    enabled: !!propertyId
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myAccess } = useQuery({
    queryKey: ['myPropertyAccess', propertyId, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const access = await base44.entities.PropertyAccess.filter({
        property_id: propertyId,
        user_email: user.email,
        status: 'active'
      });
      return access[0] || null;
    },
    enabled: !!propertyId && !!user?.email
  });

  if (!property || !myAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Access Settings
          </h1>
          <p className="text-gray-600">{property.address}</p>
        </div>

        <PropertyAccessManager 
          property={property}
          currentUserRole={myAccess.role}
        />
      </div>
    </div>
  );
}