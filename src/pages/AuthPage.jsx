import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle, 
  ArrowRight, Home, Mail, Lock
} from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  
  // Determine initial mode
  const initialMode = urlParams.get('mode') || 
    (location.pathname.includes('login') ? 'login' : 'signup');
  
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const redirectTo = urlParams.get('redirect') || createPageUrl('Dashboard');
  
  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          handlePostAuthRedirect(user);
        }
      } catch (e) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);
  
  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const doPasswordsMatch = password === confirmPassword;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup') {
      if (!isPasswordValid) {
        setError('Password does not meet requirements.');
        return;
      }
      if (!doPasswordsMatch) {
        setError('Passwords do not match.');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Use Base44's native auth - this will redirect to Base44's auth pages
      if (mode === 'signup') {
        base44.auth.redirectToSignup(redirectTo);
      } else {
        base44.auth.redirectToLogin(redirectTo);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handlePostAuthRedirect = (user) => {
    if (!user.onboarding_completed) {
      navigate(createPageUrl('Onboarding'), { replace: true });
      return;
    }
    
    const userType = determineUserType(user);
    const dashboardRoute = getDashboardRoute(userType);
    navigate(dashboardRoute, { replace: true });
  };
  
  const determineUserType = (user) => {
    if (user.role === 'admin') return 'admin';
    if (user.is_operator || user.operator_id) return 'operator';
    if (user.is_contractor || user.contractor_id) return 'contractor';
    if (user.property_use_type === 'rental' || user.is_investor) return 'investor';
    return 'homeowner';
  };
  
  const getDashboardRoute = (userType) => {
    const routes = {
      admin: createPageUrl('AdminDashboard'),
      operator: createPageUrl('OperatorDashboard'),
      contractor: createPageUrl('ContractorDashboard'),
      investor: createPageUrl('DashboardInvestor'),
      homeowner: createPageUrl('Dashboard')
    };
    return routes[userType] || createPageUrl('Dashboard');
  };
  
  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="min-h-screen flex">
      
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          
          {/* Logo & Back to Home */}
          <div className="flex items-center justify-between mb-8">
            <a href="/" className="flex items-center gap-3 group">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
                alt="360° Method" 
                className="h-10 w-10 rounded-lg"
              />
              <span className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                360° Method
              </span>
            </a>
            <a 
              href="/" 
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Home
            </a>
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === 'signup' ? 'Create your free account' : 'Welcome back'}
            </h1>
            <p className="text-slate-600">
              {mode === 'signup' 
                ? 'Start protecting your property in minutes.'
                : 'Sign in to access your property dashboard.'
              }
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                    outline-none transition-all text-slate-900"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-300 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                    outline-none transition-all text-slate-900"
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements (Signup only) */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { key: 'length', label: '8+ characters' },
                    { key: 'uppercase', label: 'Uppercase' },
                    { key: 'lowercase', label: 'Lowercase' },
                    { key: 'number', label: 'Number' },
                  ].map(({ key, label }) => (
                    <div 
                      key={key}
                      className={`flex items-center gap-1.5 text-xs ${
                        passwordChecks[key] ? 'text-green-600' : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border 
                      ${confirmPassword && !doPasswordsMatch 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                      } focus:ring-2 outline-none transition-all text-slate-900`}
                    placeholder="Confirm your password"
                  />
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            )}
            
            {/* Remember Me (Login only) */}
            {mode === 'login' && (
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">Remember me for 30 days</span>
                </label>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (mode === 'signup' && (!isPasswordValid || !doPasswordsMatch))}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 
                disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold 
                text-lg transition-all flex items-center justify-center gap-2
                shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? 'Create Free Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            {/* Terms (Signup only) */}
            {mode === 'signup' && (
              <p className="text-xs text-slate-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            )}
            
          </form>
          
          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-sm text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          
          {/* Toggle Mode */}
          <div className="text-center">
            <p className="text-slate-600 mb-3">
              {mode === 'signup' 
                ? 'Already have an account?' 
                : "Don't have an account?"
              }
            </p>
            <button
              onClick={toggleMode}
              className="w-full py-3.5 rounded-xl border-2 border-slate-200 
                hover:border-slate-300 hover:bg-slate-50 text-slate-700 
                font-semibold transition-all"
            >
              {mode === 'signup' ? 'Sign In' : 'Create Free Account'}
            </button>
          </div>
          
          {/* Demo Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Want to explore first?{' '}
              <a href={createPageUrl('DemoEntry')} className="text-blue-600 hover:text-blue-700 font-medium">
                Try the demo →
              </a>
            </p>
          </div>
          
        </div>
      </div>
      
      {/* Right Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
        items-center justify-center p-12 relative overflow-hidden">
        
        {/* Content */}
        <div className="relative z-10 max-w-lg text-center">
          
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Stop Reacting.<br/>
            Start Protecting.
          </h2>
          
          <p className="text-slate-400 text-lg mb-8">
            Join property owners who've transformed from worried to confident 
            with the 360° Method.
          </p>
          
          {/* Value Props */}
          <div className="space-y-4 text-left mb-8">
            {[
              'Know your property\'s true condition',
              'Catch $50 problems before they become $5,000 disasters',
              'Seasonal checklists customized for your climate',
              'Priority system tells you what to fix first',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-slate-300">{text}</span>
              </div>
            ))}
          </div>
          
          {/* Social Proof */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800"
                  />
                ))}
              </div>
              <span className="text-white font-semibold">400+</span>
            </div>
            <p className="text-slate-400 text-sm">
              Property owners protecting $180M+ in real estate
            </p>
          </div>
          
          {/* Testimonial */}
          <div className="mt-8 text-left">
            <blockquote className="text-slate-300 italic mb-3">
              "Caught a roof leak in my first inspection that would've cost 
              thousands to fix later. The peace of mind alone is worth it."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-600" />
              <div>
                <p className="text-white font-medium">Sarah M.</p>
                <p className="text-slate-500 text-sm">Homeowner, Portland OR</p>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
}