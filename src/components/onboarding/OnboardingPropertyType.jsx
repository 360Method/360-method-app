import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default function OnboardingPropertyType({ onNext, onBack, data }) {
  const userType = data?.userType || 'homeowner';
  const userTypeLabel = userType === 'homeowner' ? 'Homeowner' : 'Property Investor';

  // Property types for homeowners
  const homeownerTypes = [
    {
      id: 'primary',
      icon: '🏠',
      title: 'PRIMARY RESIDENCE',
      subtitle: 'I live here full-time',
      description: 'No rental income',
      color: 'blue'
    },
    {
      id: 'primary_with_rental',
      icon: '🏠🏘️',
      title: 'PRIMARY + RENTAL',
      subtitle: 'I live here AND rent out part',
      description: '(Room, ADU, basement, etc.)',
      color: 'purple'
    }
  ];

  // Property types for investors
  const investorTypes = [
    {
      id: 'rental_unfurnished',
      icon: '🏘️',
      title: 'LONG-TERM RENTAL',
      subtitle: 'Traditional rental property',
      description: 'Unfurnished, tenant brings furniture',
      color: 'green'
    },
    {
      id: 'rental_furnished',
      icon: '🛋️',
      title: 'FURNISHED RENTAL',
      subtitle: 'Medium-term rental',
      description: 'Fully/partially furnished, I provide furniture',
      color: 'orange'
    },
    {
      id: 'vacation_rental',
      icon: '🏖️',
      title: 'VACATION RENTAL',
      subtitle: 'Short-term rental (Airbnb/VRBO)',
      description: 'High turnover, fully furnished',
      color: 'teal'
    }
  ];

  const colorClasses = {
    blue: {
      border: 'border-blue-300',
      hoverBorder: 'hover:border-blue-500',
      bg: 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    purple: {
      border: 'border-purple-300',
      hoverBorder: 'hover:border-purple-500',
      bg: 'bg-purple-50',
      button: 'bg-purple-600 hover:bg-purple-700'
    },
    green: {
      border: 'border-green-300',
      hoverBorder: 'hover:border-green-500',
      bg: 'bg-green-50',
      button: 'bg-green-600 hover:bg-green-700'
    },
    orange: {
      border: 'border-orange-300',
      hoverBorder: 'hover:border-orange-500',
      bg: 'bg-orange-50',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    teal: {
      border: 'border-teal-300',
      hoverBorder: 'hover:border-teal-500',
      bg: 'bg-teal-50',
      button: 'bg-teal-600 hover:bg-teal-700'
    }
  };

  const propertyTypes = userType === 'homeowner' ? homeownerTypes : investorTypes;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-600 text-white">
              {userTypeLabel}
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-center" style={{ color: '#1B365D' }}>
            What type of property is this?
          </CardTitle>
          <p className="text-center text-gray-600 text-lg mt-2">
            {userType === 'homeowner' 
              ? 'Choose how you use your home'
              : 'Select your rental property type'}
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {propertyTypes.map((type) => (
          <Card
            key={type.id}
            className={`border-3 ${colorClasses[type.color].border} ${colorClasses[type.color].hoverBorder} transition-all hover:shadow-xl cursor-pointer group`}
            onClick={() => onNext({ property_use_type: type.id })}
          >
            <CardContent className={`p-6 ${colorClasses[type.color].bg}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-5xl">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#1B365D' }}>
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-700 font-medium">
                      {type.subtitle}
                    </p>
                    {type.description && (
                      <p className="text-sm text-gray-600 italic">
                        {type.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  className={`${colorClasses[type.color].button} text-white shadow-lg group-hover:scale-105 transition-transform`}
                  style={{ minHeight: '48px' }}
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2"
          style={{ minHeight: '48px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </div>
  );
}