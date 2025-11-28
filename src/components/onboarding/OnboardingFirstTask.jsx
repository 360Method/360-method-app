import React, { useState } from "react";
import { auth } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  Zap
} from "lucide-react";

export default function OnboardingFirstTask({ onComplete, data }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const queryClient = useQueryClient();

  // Get the top priority system from insights
  const topPriority = data?.insights?.[0];
  const property = data?.property;
  const homeAge = data?.propertyData?.year_built
    ? new Date().getFullYear() - data.propertyData.year_built
    : null;

  const updateUserMutation = useMutation({
    mutationFn: (userData) => auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const handleStartDocumenting = async () => {
    setIsCompleting(true);

    // Mark onboarding as complete
    await updateUserMutation.mutateAsync({
      onboarding_completed: true,
      onboarding_skipped: false,
      onboarding_completed_date: new Date().toISOString()
    });

    // Navigate to baseline with the property and first system suggestion
    onComplete({
      destination: 'baseline',
      property,
      suggestedSystem: topPriority?.system
    });
  };

  const handleExploreDashboard = async () => {
    setIsCompleting(true);

    // Mark onboarding as complete
    await updateUserMutation.mutateAsync({
      onboarding_completed: true,
      onboarding_skipped: false,
      onboarding_completed_date: new Date().toISOString()
    });

    onComplete({
      destination: 'dashboard',
      property
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Success Header */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />

        <CardContent className="p-8 md:p-10 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            You're All Set!
          </h1>

          <p className="text-xl text-green-100 mb-4">
            Your property is ready for the 360° Method
          </p>

          {property && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{property.formatted_address || property.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What's Next - Recommended Action */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-orange-500 text-white">Recommended Next Step</Badge>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Document Your {topPriority?.system || 'First System'}
              </h3>
              <p className="text-slate-600 mb-3">
                {topPriority ? (
                  <>
                    Based on your {homeAge}-year-old home, your <strong>{topPriority.system}</strong> is the most important
                    system to document first. {topPriority.message}
                  </>
                ) : (
                  <>
                    Take a quick photo of your major systems (HVAC, water heater, etc.) so we can track their age
                    and help you plan ahead.
                  </>
                )}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  5 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Quick photo + basic info
                </span>
              </div>

              <Button
                onClick={handleStartDocumenting}
                disabled={isCompleting}
                className="w-full sm:w-auto gap-2"
                style={{
                  backgroundColor: '#f97316',
                  minHeight: '48px'
                }}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start Documenting {topPriority?.system || 'Now'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative - Explore Dashboard */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">
                Or Explore Your Dashboard
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Look around first and come back to documenting when you're ready.
                We'll remind you of what needs attention.
              </p>
              <Button
                onClick={handleExploreDashboard}
                disabled={isCompleting}
                variant="outline"
                className="gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Pro Tip: Data Plates Are Gold</h4>
              <p className="text-sm text-blue-800">
                When documenting systems, look for the data plate (usually a metal sticker) with the model number,
                serial number, and manufacture date. One photo of this tells us everything we need to know about
                your system's age and specifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
