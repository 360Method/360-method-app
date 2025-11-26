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

      {/* Webhook Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Phase 4: Webhook Configuration</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Configure Stripe webhooks to receive payment events</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-semibold text-amber-900 mb-2">Manual Step Required:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                <li>Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" className="underline">Stripe Dashboard → Webhooks</a></li>
                <li>Click "Add endpoint"</li>
                <li>Enter your webhook URL: <code className="bg-white px-2 py-1 rounded">{window.location.origin}/functions/handleStripeWebhook</code></li>
                <li>Select events: <code>payment_intent.succeeded</code>, <code>payment_intent.payment_failed</code>, <code>account.updated</code></li>
                <li>Copy the webhook signing secret and verify it matches STRIPE_WEBHOOK_SECRET</li>
              </ol>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Webhook URL:</strong> <code className="bg-white px-2 py-1 rounded ml-2">{window.location.origin}/functions/handleStripeWebhook</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Diagnosis */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Diagnosis</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Run comprehensive check of all payment infrastructure</p>
            </div>
            <Button
              onClick={() => runTest('diagnosis', 'diagnoseStripe')}
              disabled={loading && activeTest === 'diagnosis'}
              variant="outline"
              className="gap-2"
            >
              {loading && activeTest === 'diagnosis' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Diagnosis
            </Button>
          </div>
        </CardHeader>
        {testResults?.diagnosis && (
          <CardContent>
            {testResults.diagnosis.data?.diagnosis?.missing_infrastructure && (
              <div className="space-y-2 mb-4">
                <p className="font-semibold text-gray-900">Issues Found:</p>
                {testResults.diagnosis.data.diagnosis.missing_infrastructure.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{issue}</span>
                  </div>
                ))}
              </div>
            )}
            {testResults.diagnosis.data?.diagnosis?.recommendations && (
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Recommendations:</p>
                {testResults.diagnosis.data.diagnosis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
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
          <h3 className="font-semibold text-blue-900 mb-3">🚀 Quick Start Guide:</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>Step 1:</strong> Run "Quick Diagnosis" to see what's missing
            </div>
            <div>
              <strong>Step 2:</strong> Run "Connection Test" to verify Stripe API
            </div>
            <div>
              <strong>Step 3:</strong> Run "Setup Products" to create HomeCare/PropertyCare catalog
            </div>
            <div>
              <strong>Step 4:</strong> Run "Test Payment" to verify end-to-end flow
            </div>
            <div>
              <strong>Step 5:</strong> Configure webhooks in Stripe Dashboard (see Phase 4 above)
            </div>
            <div className="pt-2 mt-2 border-t border-blue-200">
              <strong>Note:</strong> Operator payouts require separate onboarding via createOperatorConnectAccount function
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}