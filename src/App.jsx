import './App.css'
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig, PAGES } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import RouteGuard from '@/components/auth/RouteGuard';
import { DemoProvider } from '@/components/shared/DemoContext';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables');
}

const { Pages, Layout, mainPage, publicPages, publicNoLayoutPages, publicWithLayoutPages } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Check if a page requires authentication
const isPublicPage = (pageName) => publicPages?.includes(pageName) ?? false;
// Check if a public page should NOT have layout
const isPublicNoLayout = (pageName) => publicNoLayoutPages?.includes(pageName) ?? false;
// Check if a public page SHOULD have layout
const isPublicWithLayout = (pageName) => publicWithLayoutPages?.includes(pageName) ?? false;

const AuthenticatedApp = () => {
  const { isLoadingAuth, user, isAuthenticated } = useAuth();

  // Debug auth state
  console.log('AuthenticatedApp state:', { isLoadingAuth, hasUser: !!user, isAuthenticated });

  // Show loading spinner while checking auth (with timeout safety)
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-400 mt-4">Loading auth...</p>
        </div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        isPublicPage(mainPageKey) ? (
          <MainPage />
        ) : (
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        )
      } />
      {/* Public Quote View - Dynamic Route */}
      <Route path="/q/:shortcode" element={<PAGES.ViewQuote />} />

      {/* Public Lead Intake Form - Dynamic Route */}
      <Route path="/intake/:operatorSlug" element={<PAGES.LeadIntakeForm />} />

      {/* Embeddable Lead Form for operator websites */}
      <Route path="/embed/:operatorSlug" element={<PAGES.EmbedLeadForm />} />

      {/* Client Invitation Page - existing client onboarding */}
      <Route path="/welcome/:invitationToken" element={<PAGES.ClientInvitation />} />

      {/* Clerk Sign In/Up pages with wildcard for SSO callbacks */}
      <Route path="/Login/*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <SignIn
            routing="path"
            path="/Login"
            signUpUrl="/Signup"
            forceRedirectUrl="/Properties"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
                socialButtonsBlockButton: "min-h-[44px]"
              }
            }}
          />
        </div>
      } />
      <Route path="/Signup/*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <SignUp
            routing="path"
            path="/Signup"
            signInUrl="/Login"
            forceRedirectUrl="/Onboarding"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        </div>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            isPublicNoLayout(path) ? (
              // Public page without layout (Welcome, Login, etc.)
              <Page />
            ) : isPublicWithLayout(path) ? (
              // Public page with layout (Demo pages, Resources)
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            ) : (
              // Protected page with layout (requires auth)
              <RouteGuard allowIncompleteOnboarding={path === 'Onboarding'}>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </RouteGuard>
            )
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/Properties"
      afterSignUpUrl="/Onboarding"
    >
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <DemoProvider>
              <NavigationTracker />
              <AuthenticatedApp />
            </DemoProvider>
          </Router>
          <Toaster />
          <VisualEditAgent />
        </QueryClientProvider>
      </AuthProvider>
    </ClerkProvider>
  )
}

export default App
