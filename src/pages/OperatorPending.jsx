import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/AuthContext';
import {
  Building,
  CheckCircle,
  Clock,
  BookOpen,
  CreditCard,
  FileText,
  Award,
  ArrowRight,
  Play,
  ChevronRight,
  Shield,
  Mail,
  Phone,
  HelpCircle,
  Loader2
} from 'lucide-react';

export default function OperatorPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, getActiveRoleProfile } = useAuth();

  // Check URL params for status
  const statusParam = searchParams.get('status');

  // Mock operator profile data - in real app, get from user metadata
  const operatorProfile = {
    company_name: 'Your Company',
    application_submitted: true,
    payment_completed: true,
    training_completed: false,
    training_progress: 35, // percentage
    certified: statusParam === 'certified',
    certification_pending: false
  };

  // Determine current step
  const getCurrentStep = () => {
    if (!operatorProfile.application_submitted) return 1;
    if (!operatorProfile.payment_completed) return 2;
    if (!operatorProfile.training_completed) return 3;
    if (!operatorProfile.certified) return 4;
    return 5; // All done
  };

  const currentStep = getCurrentStep();

  const steps = [
    {
      id: 1,
      title: 'Application Submitted',
      description: 'Your application has been received',
      icon: FileText,
      status: operatorProfile.application_submitted ? 'complete' : 'pending'
    },
    {
      id: 2,
      title: 'Payment Completed',
      description: 'Certification fee processed',
      icon: CreditCard,
      status: operatorProfile.payment_completed ? 'complete' : 'pending'
    },
    {
      id: 3,
      title: 'Complete Training',
      description: '6 modules, ~2 hours total',
      icon: BookOpen,
      status: operatorProfile.training_completed ? 'complete' : currentStep === 3 ? 'current' : 'pending'
    },
    {
      id: 4,
      title: 'Certification',
      description: 'Earn your 360° Method badge',
      icon: Award,
      status: operatorProfile.certified ? 'complete' : currentStep === 4 ? 'current' : 'pending'
    }
  ];

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/Login?redirect_url=/OperatorPending');
    return null;
  }

  // If fully certified, show success state
  if (operatorProfile.certified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <Badge className="mb-4 bg-green-100 text-green-700">Certified</Badge>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're a Certified 360° Method Operator!
          </h1>
          <p className="text-gray-600 mb-8">
            Congratulations! You now have full access to the Operator Portal.
            Start managing clients and growing your business.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/OperatorDashboard')}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            Go to Operator Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Operator Setup</h1>
              <p className="text-xs text-gray-500">Complete your certification</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/Welcome')}>
            Exit
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Setup Progress</h2>
            <Badge className="bg-orange-100 text-orange-700">
              Step {currentStep} of 4
            </Badge>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                const isComplete = step.status === 'complete';
                const isCurrent = step.status === 'current';

                return (
                  <div key={step.id} className="flex flex-col items-center w-1/4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isComplete ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-medium ${
                        isComplete ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Current Step Content */}
        {currentStep === 3 && (
          <Card className="p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Complete Your Training
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn the 360° Method and how to use the Operator Portal effectively.
                  The training takes approximately 2-3 hours and includes a final certification exam.
                </p>

                {/* Training Progress */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Training Progress</span>
                    <span className="text-sm font-medium text-orange-600">
                      {operatorProfile.training_progress}%
                    </span>
                  </div>
                  <Progress value={operatorProfile.training_progress} className="h-2" />
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>~{Math.round((100 - operatorProfile.training_progress) * 1.2)} minutes remaining</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate('/OperatorTraining')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Training
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/OperatorTraining')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Training Modules</div>
                <div className="text-sm text-gray-500">View all course content</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Help & Support</div>
                <div className="text-sm text-gray-500">Get assistance</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What's Included in Your Certification</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Full Platform Access</div>
                <div className="text-sm text-gray-500">CRM, scheduling, invoicing tools</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Marketplace Listing</div>
                <div className="text-sm text-gray-500">Get found by property owners</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Certification Badge</div>
                <div className="text-sm text-gray-500">Official 360° Method operator</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Contractor Management</div>
                <div className="text-sm text-gray-500">Build your service team</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-2">Need help with your certification?</p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:support@360method.com" className="text-sm text-orange-600 hover:underline flex items-center gap-1">
              <Mail className="w-4 h-4" />
              support@360method.com
            </a>
            <span className="text-gray-300">|</span>
            <a href="tel:1-800-360-METHOD" className="text-sm text-orange-600 hover:underline flex items-center gap-1">
              <Phone className="w-4 h-4" />
              1-800-360-METHOD
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
