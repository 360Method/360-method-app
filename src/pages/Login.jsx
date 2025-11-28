import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/Welcome">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png"
            alt="360° Method Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">360° Method</h1>
        <p className="text-gray-600 mt-1">Property care made simple</p>
      </div>

      <SignIn
        routing="path"
        path="/Login"
        signUpUrl="/Signup"
        afterSignInUrl="/Properties"
        fallbackRedirectUrl="/Properties"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
            socialButtonsBlockButton: "min-h-[44px]",
            formButtonPrimary: "bg-orange-500 hover:bg-orange-600"
          }
        }}
      />

      {/* Back to home link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/Welcome" className="hover:text-gray-700">
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
