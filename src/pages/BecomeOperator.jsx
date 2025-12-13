import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { isOperatorsSite } from '@/lib/domain';
import {
  Building,
  ArrowRight,
  Clock,
  Mail
} from 'lucide-react';

export default function BecomeOperator() {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, isClerkAvailable } = useAuth();

  // On operators site, we skip auth check entirely (no Clerk)
  const onOperatorsSite = isOperatorsSite();

  // Only redirect to OperatorDashboard when on app domain (where Clerk is available)
  useEffect(() => {
    if (onOperatorsSite || !isClerkAvailable) return;

    // If already an operator on app domain, redirect to dashboard
    if (isAuthenticated && hasRole && hasRole('operator')) {
      navigate('/OperatorDashboard');
    }
  }, [isAuthenticated, hasRole, navigate, onOperatorsSite, isClerkAvailable]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/Welcome" className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png"
              alt="360° Method"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <span className="font-bold text-gray-900">360° Method</span>
              <Badge className="ml-2 bg-orange-100 text-orange-700">For Operators</Badge>
            </div>
          </Link>
          <Link to="/Welcome">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="w-8 h-8 text-orange-600" />
            </div>

            <Badge className="mb-4 bg-yellow-100 text-yellow-700">
              <Clock className="w-3 h-3 mr-1 inline" />
              Coming Soon
            </Badge>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Become a 360° Method Operator
            </h1>

            <p className="text-gray-600 mb-6">
              We're currently in private beta and not accepting new operator applications.
              The operator program will open to the public soon.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-gray-900 mb-3">What operators will get:</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Access to property owner leads in your area</li>
                <li>• Full CRM with client management & invoicing</li>
                <li>• Contractor network management tools</li>
                <li>• 360° Method certification & training</li>
                <li>• Marketplace listing & marketing support</li>
              </ul>
            </div>

            <div className="space-y-3">
              <a href="mailto:support@360degreemethod.com?subject=Operator Interest">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us About Becoming an Operator
                </Button>
              </a>

              <Link to="/Welcome">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Explore as a Homeowner
                </Button>
              </Link>
            </div>
          </Card>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already an operator? <Link to="/Login" className="text-orange-600 hover:underline">Sign in here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
