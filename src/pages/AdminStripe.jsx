import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStripe() {
  const { data: diagnostics, isLoading } = useQuery({
    queryKey: ['stripeDiagnostics'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('diagnoseStripe');
      return data.diagnostics;
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Running Stripe diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Integration Status</h1>
        <p className="text-gray-600">Diagnostic information and configuration status</p>
      </div>

      {/* Configuration Status */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            {diagnostics?.api_key_configured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">API Key</p>
              <p className="text-sm text-gray-600">
                {diagnostics?.api_key_type || 'Not configured'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            {diagnostics?.webhook_secret_configured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">Webhook Secret</p>
              <p className="text-sm text-gray-600">
                {diagnostics?.webhook_secret_configured ? 'Configured' : 'Not set'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            {diagnostics?.account_info?.charges_enabled ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">Account Status</p>
              <p className="text-sm text-gray-600">
                {diagnostics?.account_info?.charges_enabled ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Info */}
      {diagnostics?.account_info && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account ID</p>
              <p className="font-mono text-sm text-gray-900">{diagnostics.account_info.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="text-sm text-gray-900">{diagnostics.account_info.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Currency</p>
              <p className="text-sm text-gray-900">{diagnostics.account_info.default_currency?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-sm text-gray-900">{diagnostics.account_info.email || 'N/A'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Products */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <Badge>{diagnostics?.products?.length || 0} products</Badge>
        </div>
        {diagnostics?.products && diagnostics.products.length > 0 ? (
          <div className="space-y-2">
            {diagnostics.products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600 font-mono">{product.id}</p>
                </div>
                <Badge className={product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {product.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No products found in Stripe</p>
        )}
      </Card>

      {/* Prices */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Prices</h2>
          <Badge>{diagnostics?.prices?.length || 0} prices</Badge>
        </div>
        {diagnostics?.prices && diagnostics.prices.length > 0 ? (
          <div className="space-y-2">
            {diagnostics.prices.map((price) => (
              <div key={price.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    ${(price.unit_amount / 100).toFixed(2)} {price.currency?.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600 font-mono">{price.id}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{price.type}</Badge>
                  <Badge className={price.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {price.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No prices found in Stripe</p>
        )}
      </Card>

      {/* Errors */}
      {diagnostics?.errors && diagnostics.errors.length > 0 && (
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Errors Detected</h2>
          <div className="space-y-2">
            {diagnostics.errors.map((error, idx) => (
              <div key={idx} className="p-3 bg-white border border-red-200 rounded-lg">
                <p className="font-medium text-red-900">{error.type}</p>
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Recommendations
          </h2>
          <ul className="space-y-2">
            {diagnostics.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-yellow-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}