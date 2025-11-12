import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, HomeIcon, Building2, Palmtree, Sofa } from "lucide-react";

const PROPERTY_TYPES = [
  {
    id: 'primary',
    icon: '🏠',
    title: 'PRIMARY RESIDENCE',
    subtitle: 'I live here full-time',
    color: 'blue'
  },
  {
    id: 'primary_with_rental',
    icon: '🏠🏘️',
    title: 'PRIMARY WITH RENTAL',
    subtitle: 'I live here + rent out part',
    description: '(Room, ADU, basement, etc.)',
    color: 'purple'
  },
  {
    id: 'rental_unfurnished',
    icon: '🏘️',
    title: 'RENTAL - UNFURNISHED',
    subtitle: 'Investment property, tenant brings',
    description: 'their own furniture',
    color: 'green'
  },
  {
    id: 'rental_furnished',
    icon: '🛋️',
    title: 'RENTAL - FURNISHED',
    subtitle: 'Investment property, I provide',
    description: 'all furniture & housewares',
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

export default function PropertyTypeSelector({ onSelect, onCancel }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
          Add Your Property
        </h2>
        <p className="text-gray-600 mb-4" style={{ fontSize: '18px' }}>
          What type of property is this?
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {PROPERTY_TYPES.map((type) => (
          <Card
            key={type.id}
            className={`border-3 ${colorClasses[type.color].border} ${colorClasses[type.color].hoverBorder} transition-all hover:shadow-xl cursor-pointer group`}
            onClick={() => onSelect(type.id)}
          >
            <CardContent className={`p-6 ${colorClasses[type.color].bg}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-5xl">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#1B365D' }}>
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-700">
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

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          style={{ minHeight: '48px' }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}