import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OnboardingSkipDialog({ open, onClose, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Skip Onboarding?</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              <p>
                Are you sure you want to skip the guided setup? You'll miss out on:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>Personalized experience</strong> tailored to your goals</li>
                <li><strong>Quick property setup</strong> with operator matching</li>
                <li><strong>Clear guidance</strong> on your first steps</li>
                <li><strong>Time savings</strong> from our proven workflow</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                💡 Don't worry - you can always restart the onboarding from Settings if you change your mind.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Onboarding</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Skip for Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}