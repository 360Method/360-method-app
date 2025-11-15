import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info } from 'lucide-react';

export default function EmptyState({
  icon,
  title,
  subtitle,
  description,
  prerequisites,
  stats = [],
  primaryAction,
  secondaryAction,
  helpText,
  className = ''
}) {
  return (
    <Card className={`border-2 border-gray-200 ${className}`}>
      <CardContent className="p-8 md:p-12 text-center">
        {/* Icon */}
        <div className="mb-4">
          {icon}
        </div>

        {/* Step Context */}
        {subtitle && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {subtitle}
            </Badge>
          </div>
        )}

        {/* Title & Description */}
        <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1B365D' }}>
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          {description}
        </p>

        {/* Prerequisites Warning */}
        {prerequisites && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 text-left">
                {prerequisites}
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="bg-blue-600 hover:bg-blue-700"
              style={{ minHeight: '48px' }}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>

        {/* Help Text */}
        {helpText && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-sm text-blue-900">
              {helpText}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}