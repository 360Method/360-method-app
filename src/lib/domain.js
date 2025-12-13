/**
 * Domain detection and routing utilities for multi-domain architecture
 *
 * Domains:
 * - 360degreemethod.com - Marketing site
 * - app.360degreemethod.com - Application (all portals)
 * - operators.360degreemethod.com - Operator landing page
 * - help.360degreemethod.com - Help/documentation (future)
 */

// Domain configuration
export const DOMAINS = {
  MARKETING: '360degreemethod.com',
  APP: 'app.360degreemethod.com',
  OPERATORS: 'operators.360degreemethod.com',
  HELP: 'help.360degreemethod.com',
};

// Domain types
export const DOMAIN_TYPES = {
  MARKETING: 'marketing',
  APP: 'app',
  OPERATORS: 'operators',
  HELP: 'help',
};

/**
 * Get the current domain type based on hostname
 * @returns {string} Domain type: 'marketing', 'app', 'operators', 'help'
 */
export function getCurrentDomainType() {
  const hostname = window.location.hostname;

  // Development environment - default to app behavior
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for development domain simulation via URL parameter
    const params = new URLSearchParams(window.location.search);
    const simulatedDomain = params.get('_domain');
    if (simulatedDomain) {
      return simulatedDomain;
    }
    return DOMAIN_TYPES.APP;
  }

  // Production domains
  if (hostname === DOMAINS.APP) {
    return DOMAIN_TYPES.APP;
  }
  if (hostname === DOMAINS.OPERATORS) {
    return DOMAIN_TYPES.OPERATORS;
  }
  if (hostname === DOMAINS.HELP) {
    return DOMAIN_TYPES.HELP;
  }
  if (hostname === DOMAINS.MARKETING || hostname === `www.${DOMAINS.MARKETING}`) {
    return DOMAIN_TYPES.MARKETING;
  }

  // Fallback: check for any 360degreemethod domain
  if (hostname.includes('360degreemethod')) {
    // If it's a subdomain we don't recognize, treat as app
    if (hostname.includes('.360degreemethod.com')) {
      return DOMAIN_TYPES.APP;
    }
    return DOMAIN_TYPES.MARKETING;
  }

  // Default to app for unknown domains (Vercel preview deployments, etc.)
  return DOMAIN_TYPES.APP;
}

/**
 * Check if we're on the marketing site
 */
export function isMarketingSite() {
  return getCurrentDomainType() === DOMAIN_TYPES.MARKETING;
}

/**
 * Check if we're on the app
 */
export function isAppSite() {
  return getCurrentDomainType() === DOMAIN_TYPES.APP;
}

/**
 * Check if we're on the operators site
 */
export function isOperatorsSite() {
  return getCurrentDomainType() === DOMAIN_TYPES.OPERATORS;
}

/**
 * Check if Clerk should be initialized on the current domain
 * Clerk only runs on the app subdomain (FREE tier - single domain)
 * Marketing and operator landing sites don't use Clerk
 * @returns {boolean} True if Clerk should be initialized
 */
export function shouldInitializeClerk() {
  const domainType = getCurrentDomainType();
  // Only initialize Clerk on the app subdomain
  // In development (localhost), we always initialize Clerk
  return domainType === DOMAIN_TYPES.APP;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Get the base URL for a specific domain
 * @param {string} domainType - 'marketing', 'app', 'operators', 'help'
 * @returns {string} Base URL for the domain
 */
export function getDomainUrl(domainType) {
  // In development, everything runs on localhost
  if (isDevelopment()) {
    return '';
  }

  switch (domainType) {
    case DOMAIN_TYPES.MARKETING:
      return import.meta.env.VITE_MARKETING_DOMAIN || 'https://360degreemethod.com';
    case DOMAIN_TYPES.APP:
      return import.meta.env.VITE_APP_DOMAIN || 'https://app.360degreemethod.com';
    case DOMAIN_TYPES.OPERATORS:
      return import.meta.env.VITE_OPERATORS_DOMAIN || 'https://operators.360degreemethod.com';
    case DOMAIN_TYPES.HELP:
      return import.meta.env.VITE_HELP_DOMAIN || 'https://help.360degreemethod.com';
    default:
      return '';
  }
}

/**
 * Create a URL for a specific domain and path
 * @param {string} domainType - Target domain type
 * @param {string} path - Path on that domain
 * @returns {string} Full URL
 */
export function createCrossDomainUrl(domainType, path = '/') {
  const baseUrl = getDomainUrl(domainType);
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Navigate to a URL on a different domain
 * @param {string} domainType - Target domain type
 * @param {string} path - Path on that domain
 */
export function navigateToDomain(domainType, path = '/') {
  const url = createCrossDomainUrl(domainType, path);

  // In development, just navigate normally
  if (isDevelopment()) {
    window.location.href = path;
    return;
  }

  window.location.href = url;
}

/**
 * Redirect to login on the app domain
 * @param {string} returnTo - Optional path to return to after login
 */
export function redirectToLogin(returnTo = null) {
  const loginPath = returnTo
    ? `/Login?redirect_url=${encodeURIComponent(returnTo)}`
    : '/Login';
  navigateToDomain(DOMAIN_TYPES.APP, loginPath);
}

/**
 * Redirect to signup on the app domain
 * @param {string} returnTo - Optional path to return to after signup
 */
export function redirectToSignup(returnTo = null) {
  const signupPath = returnTo
    ? `/Signup?redirect_url=${encodeURIComponent(returnTo)}`
    : '/Signup';
  navigateToDomain(DOMAIN_TYPES.APP, signupPath);
}

/**
 * Get the marketing site URL for a path
 * @param {string} path - Path on marketing site
 * @returns {string} Full URL
 */
export function getMarketingUrl(path = '/') {
  return createCrossDomainUrl(DOMAIN_TYPES.MARKETING, path);
}

/**
 * Get the app URL for a path
 * @param {string} path - Path on app
 * @returns {string} Full URL
 */
export function getAppUrl(path = '/') {
  return createCrossDomainUrl(DOMAIN_TYPES.APP, path);
}

/**
 * Create navigation handler that works across domains
 * @param {Function} navigate - React Router navigate function
 * @returns {Function} Smart navigate function
 */
export function createSmartNavigate(navigate) {
  return (path, options = {}) => {
    const { domain = null, replace = false } = options;

    // If domain is specified and we're not in dev, do cross-domain navigation
    if (domain && !isDevelopment()) {
      navigateToDomain(domain, path);
      return;
    }

    // Otherwise use React Router
    navigate(path, { replace });
  };
}

// Pages that should be on marketing site
export const MARKETING_PAGES = [
  'Welcome',
  'Pricing',
  'Resources',
  'ResourceGuides',
  'VideoTutorials',
  'ROICalculators',
  'GuideDetail',
  'DemoEntry',
  'WelcomeDemo',
  'ExploreTemplates',
  'TemplateDetail',
  // All Demo pages
  'DemoImproving',
  'DemoOverwhelmed',
  'DemoExcellent',
  'DemoPortfolio',
  'DemoImprovingBaseline',
  'DemoImprovingInspect',
  'DemoImprovingTrack',
  'DemoImprovingPrioritize',
  'DemoImprovingSchedule',
  'DemoImprovingExecute',
  'DemoImprovingPreserve',
  'DemoImprovingUpgrade',
  'DemoImprovingScale',
  'DemoImprovingScore',
  'DemoOverwhelmedBaseline',
  'DemoOverwhelmedInspect',
  'DemoOverwhelmedTrack',
  'DemoOverwhelmedPrioritize',
  'DemoOverwhelmedSchedule',
  'DemoOverwhelmedExecute',
  'DemoOverwhelmedPreserve',
  'DemoOverwhelmedUpgrade',
  'DemoOverwhelmedScale',
  'DemoOverwhelmedScore',
  'DemoExcellentBaseline',
  'DemoExcellentInspect',
  'DemoExcellentTrack',
  'DemoExcellentPrioritize',
  'DemoExcellentSchedule',
  'DemoExcellentExecute',
  'DemoExcellentPreserve',
  'DemoExcellentUpgrade',
  'DemoExcellentScale',
  'DemoExcellentScore',
  'DemoPortfolioProperties',
  'DemoPortfolioBaseline',
  'DemoPortfolioInspect',
  'DemoPortfolioTrack',
  'DemoPortfolioPrioritize',
  'DemoPortfolioSchedule',
  'DemoPortfolioExecute',
  'DemoPortfolioPreserve',
  'DemoPortfolioUpgrade',
  'DemoPortfolioScale',
  'DemoPortfolioScore',
];

// Pages that should be on operators landing site
export const OPERATOR_LANDING_PAGES = [
  'BecomeOperator',
  'OperatorApplication',
];

/**
 * Check if a page belongs to the marketing site
 * @param {string} pageName - Name of the page
 * @returns {boolean}
 */
export function isMarketingPage(pageName) {
  return MARKETING_PAGES.includes(pageName) || pageName.startsWith('Demo');
}

/**
 * Check if a page belongs to the operators landing site
 * @param {string} pageName - Name of the page
 * @returns {boolean}
 */
export function isOperatorLandingPage(pageName) {
  return OPERATOR_LANDING_PAGES.includes(pageName);
}
