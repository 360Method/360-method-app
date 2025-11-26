import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStripeDebug() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTest, setActiveTest] = useState(null);

  const runTest = async (testName, functionName) => {
    setActiveTest(testName);
    setLoading(true);
    
    try {
      const { data } = await base44.functions.invoke(functionName, {});
      
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data }
      }));
      
      if (data.success) {
        toast.success(`${testName} passed!`);
      } else {
        toast.error(`${testName} failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
      toast.error(`${testName} error: ${error.message}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const StatusIcon = ({ success }) => {
    if (success === null) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    return success ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Payment Debug Console</h1>
        <p className="text-gray-600">Diagnose and fix payment infrastructure issues</p>
      </div>

      {/* Phase 1: Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phase 1: Stripe Connection Test</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Verify Stripe API key and basic connectivity</p>
            </div>
            <Button
              onClick={() => runTest('connection', 'testStripeConnection')}
              disabled={loading && activeTest === 'connection'}
              className="gap-2"
            >
              {loading && activeTest === 'connection' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Test
            </Button>
          </div>
        </CardHeader>
        {testResults?.connection && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusIcon success={testResults.connection.data?.results?.api_key_valid} />
                <span>API Key Valid</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon success={testResults.connection.data?.results?.account_accessible} />
                <span>Account Accessible</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon success={testResults.connection.data?.results?.products_accessible} />
                <span>Products Accessible ({testResults.connection.data?.results?.product_count || 0} products)</span>
              </div>
              {testResults.connection.data?.results?.errors?.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">Errors:</p>
                  {testResults.connection.data.results.errors.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-700 mb-1">
                      <strong>{err.test}:</strong> {err.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 2: Product Setup */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phase 2: Product Catalog Setup</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Create HomeCare and PropertyCare products</p>
            </div>
            <Button
              onClick={() => runTest('products', 'setupStripeProducts')}
              disabled={loading && activeTest === 'products'}
              className="gap-2"
            >
              {loading && activeTest === 'products' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Setup Products
            </Button>
          </div>
        </CardHeader>
        {testResults?.products && (
          <CardContent>
            {testResults.products.data?.results?.products_created && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Products Created:</p>
                {testResults.products.data.results.products_created.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{product.name}</span>
                    <Badge variant="outline" className="text-xs">{product.id}</Badge>
                  </div>
                ))}
              </div>
            )}
            {testResults.products.data?.results?.prices_created && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Prices Created:</p>
                {testResults.products.data.results.prices_created.map((price, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{price.name}</span>
                    <Badge variant="outline" className="text-xs">${price.amount}/mo</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Phase 3: Payment Flow Test */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phase 3: Payment Flow Test</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Test customer creation and payment processing</p>
            </div>
            <Button
              onClick={() => runTest('payment', 'testPaymentFlow')}
              disabled={loading && activeTest === 'payment'}
              className="gap-2"
            >
              {loading && activeTest === 'payment' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Test Payment
            </Button>
          </div>
        </CardHeader>
        {testResults?.payment && (
          <CardContent>
            {testResults.payment.data?.testResults && (
              <div className="space-y-2">
                {Object.entries(testResults.payment.data.testResults).map(([step, result]) => (
                  <div key={step} className="flex items-center gap-2">
                    <StatusIcon success={result.status === 'success'} />
                    <span className="capitalize">{step.replace(/_/g, ' ')}</span>
                    {result.status === 'failed' && (
                      <Badge variant="destructive" className="text-xs">{result.error}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Run Connection Test to verify Stripe API access</li>
            <li>If connection passes, run Product Setup to create HomeCare/PropertyCare products</li>
            <li>Run Payment Flow Test to verify end-to-end payment processing</li>
            <li>Configure webhooks in Stripe Dashboard (see functions/handleStripeWebhook)</li>
            <li>Test operator onboarding and payouts separately</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}