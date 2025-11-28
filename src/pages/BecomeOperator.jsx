import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import {
  Building,
  CheckCircle,
  ArrowRight,
  Users,
  DollarSign,
  Award,
  Wrench,
  BarChart3,
  Shield,
  Clock,
  Star,
  Zap,
  Calendar,
  FileText,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export default function BecomeOperator() {
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuth();

  // If already an operator, redirect
  if (isAuthenticated && hasRole && hasRole('operator')) {
    navigate('/OperatorDashboard');
    return null;
  }

  const benefits = [
    {
      icon: Users,
      title: 'Access Property Owners',
      description: 'Connect with homeowners actively seeking quality service providers in your area'
    },
    {
      icon: DollarSign,
      title: 'Grow Your Revenue',
      description: 'Operators earn $50K-$200K+ annually with recurring maintenance contracts'
    },
    {
      icon: BarChart3,
      title: 'CRM & Business Tools',
      description: 'Client management, scheduling, invoicing, and job tracking all in one place'
    },
    {
      icon: Wrench,
      title: 'Contractor Network',
      description: 'Build and manage your team of certified contractors for job fulfillment'
    },
    {
      icon: Shield,
      title: '360° Method Certification',
      description: 'Stand out with official certification and training in property care excellence'
    },
    {
      icon: TrendingUp,
      title: 'Marketing Support',
      description: 'Get listed in our marketplace and receive qualified leads in your service area'
    }
  ];

  const certificationSteps = [
    {
      step: 1,
      title: 'Apply',
      description: 'Complete your application with business details and service area',
      time: '10 min'
    },
    {
      step: 2,
      title: 'Payment',
      description: 'Pay certification fee ($299 one-time or $29/month)',
      time: '2 min'
    },
    {
      step: 3,
      title: 'Training',
      description: 'Complete the 360° Method operator training modules',
      time: '2-3 hours'
    },
    {
      step: 4,
      title: 'Certification',
      description: 'Pass the certification assessment and get your badge',
      time: '30 min'
    }
  ];

  const testimonials = [
    {
      name: 'Mike Rodriguez',
      company: 'Premier Property Care',
      location: 'Austin, TX',
      quote: 'Went from solo handyman to managing 3 contractors and 85 properties in 18 months.',
      revenue: '$180K/year',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      company: 'HomeGuard Services',
      location: 'Portland, OR',
      quote: 'The CRM tools alone saved me 10 hours a week. Now I focus on growth, not paperwork.',
      revenue: '$120K/year',
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/OperatorApplication');
    } else {
      navigate('/Login?redirect_url=/OperatorApplication');
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={handleGetStarted} className="bg-orange-500 hover:bg-orange-600">
                Apply Now
              </Button>
            ) : (
              <>
                <Link to="/Login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Button onClick={handleGetStarted} className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-700 text-sm px-4 py-1">
            Now Accepting Operators in Select Markets
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Build a Property Service Business<br />
            <span className="text-orange-600">That Scales</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join the 360° Method operator network. Get certified, access our CRM tools,
            connect with property owners, and grow a recurring revenue business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6 gap-2"
            >
              <Building className="w-5 h-5" />
              Start Your Application
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            $299 one-time certification fee or $29/month
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">500+</div>
              <div className="text-gray-400 text-sm">Active Operators</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">$2.4M</div>
              <div className="text-gray-400 text-sm">Monthly Transactions</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">15K+</div>
              <div className="text-gray-400 text-sm">Properties Managed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">4.9</div>
              <div className="text-gray-400 text-sm">Avg Operator Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The 360° Method platform gives you tools, training, and leads to build
              a successful property service business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certification Process */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Certified in 4 Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              Our streamlined process gets you up and running quickly
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {certificationSteps.map((step, idx) => (
              <Card key={idx} className="p-6 text-center relative">
                {idx < certificationSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {step.description}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {step.time}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Operators Love 360° Method
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company} • {testimonial.location}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {testimonial.revenue}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Choose the plan that works for you
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 bg-white text-gray-900">
              <div className="text-sm text-gray-500 mb-2">One-Time</div>
              <div className="text-4xl font-bold mb-2">$299</div>
              <div className="text-gray-600 mb-4">Lifetime certification</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Full platform access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  360° Method certification
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Marketplace listing
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No monthly fees
                </li>
              </ul>
              <Button
                onClick={handleGetStarted}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Get Started
              </Button>
            </Card>
            <Card className="p-6 bg-white text-gray-900 border-2 border-orange-300">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">
                Popular
              </Badge>
              <div className="text-sm text-gray-500 mb-2">Monthly</div>
              <div className="text-4xl font-bold mb-2">$29<span className="text-lg font-normal">/mo</span></div>
              <div className="text-gray-600 mb-4">Cancel anytime</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Full platform access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  360° Method certification
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Marketplace listing
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <Button
                onClick={handleGetStarted}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Start Free Trial
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Build Your Property Service Empire?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join 500+ operators who are growing their businesses with 360° Method
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6 gap-2"
          >
            <Building className="w-5 h-5" />
            Start Your Application
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png"
              alt="360° Method"
              className="w-8 h-8 rounded"
            />
            <span className="text-gray-600">© 2024 360° Method. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/Welcome" className="hover:text-gray-700">Home</Link>
            <Link to="/Pricing" className="hover:text-gray-700">Pricing</Link>
            <Link to="/Resources" className="hover:text-gray-700">Resources</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
