import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ZipCodeDetector from "../components/onboarding/ZipCodeDetector";

export default function Welcome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState('welcome'); // 'welcome', 'zip', 'complete'

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  // If user already has properties, redirect to dashboard
  React.useEffect(() => {
    if (properties.length > 0) {
      navigate(createPageUrl('Dashboard'));
    }
  }, [properties, navigate]);

  // If user already has ZIP, skip to complete
  React.useEffect(() => {
    if (user?.location_zip && step === 'welcome') {
      setStep('complete');
    }
  }, [user]);

  const handleZipComplete = async (zipCode, availability) => {
    // Save ZIP to user profile
    await updateUserMutation.mutateAsync({ location_zip: zipCode });
    setStep('complete');
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B365D 0%, #2A4A7F 100%)' }}>
                <Home className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '32px' }}>
                Welcome to 360° Method!
              </h1>
              
              <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
                Your home maintenance command center. Whether you DIY or work with a professional, 
                this is your operating system for protecting your biggest investment.
              </p>

              <Button
                onClick={() => setStep('zip')}
                className="font-bold"
                style={{ backgroundColor: '#1B365D', minHeight: '56px', fontSize: '18px' }}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'zip') {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <div className="text-center mb-6">
            <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
              Get Started
            </h1>
            <p className="text-gray-600">
              First, let's see what services are available in your area
            </p>
          </div>

          <ZipCodeDetector
            onComplete={handleZipComplete}
            initialZip={user?.location_zip || ''}
          />
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 mx-auto mb-6 flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '28px' }}>
                You're All Set!
              </h1>
              
              <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
                Ready to add your first property and start protecting your investment?
              </p>

              <Button
                asChild
                className="font-bold"
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <a href={createPageUrl('Properties')}>
                  Add Your First Property
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}