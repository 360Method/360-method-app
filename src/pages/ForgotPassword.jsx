import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Clerk handles password reset within its SignIn component
// Redirect users to the login page
export default function ForgotPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/Login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}
