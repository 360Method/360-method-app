# Multi-Domain Architecture Setup Guide

## Executive Summary

This guide walks you through setting up a multi-domain architecture for the 360° Method App:

| Domain | Purpose | Clerk Auth | Content |
|--------|---------|------------|---------|
| `360degreemethod.com` | Marketing site | ❌ NO | Landing, Pricing, About, Demo |
| `app.360degreemethod.com` | Application | ✅ YES | All authenticated pages, portals |
| `operators.360degreemethod.com` | Operator landing | ❌ NO | Operator-specific marketing |
| `help.360degreemethod.com` | Documentation | ❌ NO | Help articles (future) |

**Key Architecture Decisions:**
1. **Single Vercel project** with domain-based routing (simpler than multiple projects)
2. **Clerk FREE tier** - Authentication only on `app.360degreemethod.com` (single domain)

---

## ⚠️ Important: Free Clerk Tier Limitation

This architecture uses Clerk's **FREE tier** (single domain) instead of the paid Pro plan ($25/month) which would enable satellite domains.

### What This Means

- **Clerk only runs on** `app.360degreemethod.com`
- **Marketing and operators sites** have NO authentication
- **Login/Signup buttons** are simple links that redirect to `app.360degreemethod.com`
- **No session sharing** - users won't appear "logged in" when visiting the marketing site
- **This is intentional** - it's a cost-saving measure for the FREE tier

### How It Works

```
Marketing Site (360degreemethod.com)
├── No ClerkProvider
├── useAuth() returns guest state (isAuthenticated: false)
├── Login button → <a href="app.360degreemethod.com/Login">
└── Signup button → <a href="app.360degreemethod.com/Signup">

App Site (app.360degreemethod.com)
├── Full ClerkProvider
├── useAuth() returns real auth state
├── All portals and protected pages work
└── Single domain = Clerk FREE tier ✅
```

### Trade-offs

| Feature | Clerk Pro ($25/mo) | Clerk Free (Current) |
|---------|-------------------|----------------------|
| Auth on app domain | ✅ | ✅ |
| Auth on marketing domain | ✅ | ❌ |
| Session sharing | ✅ | ❌ |
| "Logged in" state on marketing | ✅ | ❌ |
| Cost | $25/month | $0 |

We chose FREE tier because marketing pages don't need authentication.

---

## Prerequisites

Before starting, ensure you have:

1. **Squarespace account** with access to DNS settings for `360degreemethod.com`
2. **Vercel account** with your project deployed
3. **Clerk Dashboard access** to configure domains
4. **Current deployment working** at your existing URL

---

## Part 1: DNS & Squarespace Setup

### Step 1.1: Log into Squarespace DNS Management

1. Go to https://account.squarespace.com/
2. Click on "Domains" in the left sidebar
3. Select `360degreemethod.com`
4. Click "DNS" or "DNS Settings" tab

### Step 1.2: DNS Records to Create

Add these records in Squarespace DNS:

| Type | Host | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| **A** | `@` | `76.76.21.21` | Default | Root domain to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | Default | www redirect |
| **CNAME** | `app` | `cname.vercel-dns.com` | Default | App subdomain |
| **CNAME** | `operators` | `cname.vercel-dns.com` | Default | Operator subdomain |
| **CNAME** | `help` | `cname.vercel-dns.com` | Default | Help subdomain |

### Step 1.3: Squarespace Step-by-Step Instructions

**Adding the A Record (Root Domain):**

1. In DNS Settings, scroll to "Custom Records"
2. Click "Add Record"
3. Select "A" from the record type dropdown
4. In "Host" field: Enter `@`
5. In "Data" or "Points to" field: Enter `76.76.21.21`
6. Leave TTL as default
7. Click "Add" or "Save"

**Adding CNAME Records (Subdomains):**

For each subdomain (`www`, `app`, `operators`, `help`):

1. Click "Add Record"
2. Select "CNAME" from the record type dropdown
3. In "Host" field: Enter the subdomain name (e.g., `app`)
   - Do NOT include the full domain, just `app` not `app.360degreemethod.com`
4. In "Data" or "Points to" field: Enter `cname.vercel-dns.com`
   - Do NOT add a trailing period
5. Click "Add" or "Save"

### Step 1.4: Remove Conflicting Records

**Important:** Squarespace may have existing records. Remove these if they exist:

- Any existing A record for `@` pointing somewhere other than Vercel
- Any existing CNAME for `www`, `app`, `operators`, or `help`
- Squarespace's built-in website records (if you're not using Squarespace for the website)

To remove: Click the trash icon or "Delete" next to the conflicting record.

### Step 1.5: Disconnect Squarespace Website (If Applicable)

If your domain is currently connected to a Squarespace website and you want to use Vercel instead:

1. Go to your Squarespace website settings
2. Go to "Domains"
3. Click on `360degreemethod.com`
4. Click "Remove" or "Disconnect"

This frees the domain's DNS for external use.

### Step 1.6: Verify DNS Propagation

After adding records, wait 5-30 minutes, then test:

```bash
# On Windows PowerShell:
nslookup 360degreemethod.com
nslookup app.360degreemethod.com
nslookup operators.360degreemethod.com

# Should return Vercel's IP (76.76.21.21 or similar)
```

Or use: https://dnschecker.org/

### Squarespace DNS Tips

- Squarespace DNS changes usually propagate within 15-30 minutes
- If you see "Pointing to Squarespace" status, the custom records override it
- You can have Squarespace domain + external hosting (Vercel) simultaneously
- Contact Squarespace support if you can't access DNS settings

---

## Part 2: Vercel Configuration

### Step 2.1: Add Domains to Your Vercel Project

1. Go to https://vercel.com/dashboard
2. Select your 360° Method project
3. Go to "Settings" → "Domains"
4. Add each domain:
   - `360degreemethod.com` (will add www automatically)
   - `app.360degreemethod.com`
   - `operators.360degreemethod.com`
   - `help.360degreemethod.com`

### Step 2.2: Configure Primary Domain

Set `app.360degreemethod.com` as the primary domain for the app.

### Step 2.3: Update vercel.json

Update your `vercel.json` to handle multi-domain routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "redirects": [
    {
      "source": "/Login",
      "has": [{ "type": "host", "value": "360degreemethod.com" }],
      "destination": "https://app.360degreemethod.com/Login",
      "permanent": false
    },
    {
      "source": "/Login",
      "has": [{ "type": "host", "value": "www.360degreemethod.com" }],
      "destination": "https://app.360degreemethod.com/Login",
      "permanent": false
    },
    {
      "source": "/Signup",
      "has": [{ "type": "host", "value": "360degreemethod.com" }],
      "destination": "https://app.360degreemethod.com/Signup",
      "permanent": false
    },
    {
      "source": "/Signup",
      "has": [{ "type": "host", "value": "www.360degreemethod.com" }],
      "destination": "https://app.360degreemethod.com/Signup",
      "permanent": false
    },
    {
      "source": "/Login",
      "has": [{ "type": "host", "value": "operators.360degreemethod.com" }],
      "destination": "https://app.360degreemethod.com/Login",
      "permanent": false
    },
    {
      "source": "/Signup",
      "has": [{ "type": "host", "value": "operators.360degreemethod.com" }],
      "destination": "https://app.360degreemethod.com/Signup",
      "permanent": false
    },
    {
      "source": "/",
      "has": [{ "type": "host", "value": "www.360degreemethod.com" }],
      "destination": "https://360degreemethod.com/",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**What this configuration does:**
- Redirects `/Login` and `/Signup` from marketing & operator sites to app subdomain
- Handles both `www` and non-www versions
- Redirects `www.360degreemethod.com` to `360degreemethod.com` (SEO best practice)
- Adds security headers to prevent clickjacking and MIME-type sniffing

### Step 2.4: Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
# Existing variables (keep these)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx  # or pk_test_xxxxx for dev
VITE_CLARITY_PROJECT_ID=your-clarity-id

# New variables for multi-domain
VITE_MARKETING_DOMAIN=https://360degreemethod.com
VITE_APP_DOMAIN=https://app.360degreemethod.com
VITE_OPERATORS_DOMAIN=https://operators.360degreemethod.com
```

---

## Part 3: Clerk Setup (FREE Tier - Single Domain)

> **Note:** This guide assumes FREE tier Clerk. For multi-domain session sharing, upgrade to Clerk Pro ($25/month) and add satellite domains.

### Step 3.1: Configure Clerk Dashboard

1. Go to https://dashboard.clerk.com/
2. Select your application
3. Go to "Domains" in the sidebar

### Step 3.2: Add ONLY the App Domain

Add **only** the app domain in Clerk (FREE tier = single domain):

**Production Domain:**
- `app.360degreemethod.com` - This is the ONLY domain where Clerk runs

**DO NOT add:**
- `360degreemethod.com` (marketing site - no auth needed)
- `operators.360degreemethod.com` (operator landing - no auth needed)

### Step 3.3: Configure Redirect URLs

In Clerk Dashboard → User & Authentication → Paths:

**Sign-in settings:**
- Sign-in URL: `https://app.360degreemethod.com/Login`
- After sign-in URL: `https://app.360degreemethod.com/Properties`

**Sign-up settings:**
- Sign-up URL: `https://app.360degreemethod.com/Signup`
- After sign-up URL: `https://app.360degreemethod.com/Onboarding`

### Step 3.4: Allowed Redirect URLs

In Clerk Dashboard → User & Authentication → Allowed redirect URLs, add:

```
https://app.360degreemethod.com
https://app.360degreemethod.com/*
```

**Note:** You do NOT need to add marketing/operators domains since they don't use Clerk.

### Step 3.5: How Marketing Sites Handle Login (Without Clerk)

Since marketing and operators sites don't have Clerk:

1. **Login/Signup buttons** are handled via Vercel redirects (see `vercel.json`)
2. When users click Login on `360degreemethod.com`, they're redirected to `app.360degreemethod.com/Login`
3. After successful login on the app domain, users stay on the app domain

**No session sharing** - This is a limitation of the FREE tier, and it's intentional.

---

## Part 4: Code Changes for Domain Routing

### Step 4.1: Create Domain Detection Utility

Create a new file `src/lib/domain.js`:

```javascript
/**
 * Domain detection and routing utilities
 */

// Domain configuration
export const DOMAINS = {
  MARKETING: '360degreemethod.com',
  APP: 'app.360degreemethod.com',
  OPERATORS: 'operators.360degreemethod.com',
  HELP: 'help.360degreemethod.com',
};

// Get current domain type
export function getCurrentDomainType() {
  const hostname = window.location.hostname;

  if (hostname === DOMAINS.APP || hostname === 'localhost') {
    return 'app';
  }
  if (hostname === DOMAINS.OPERATORS) {
    return 'operators';
  }
  if (hostname === DOMAINS.HELP) {
    return 'help';
  }
  if (hostname === DOMAINS.MARKETING || hostname.includes('360degreemethod')) {
    return 'marketing';
  }

  // Default to app for development
  return 'app';
}

// Check if we're on the marketing site
export function isMarketingSite() {
  return getCurrentDomainType() === 'marketing';
}

// Check if we're on the app
export function isAppSite() {
  return getCurrentDomainType() === 'app';
}

// Check if we're on the operators site
export function isOperatorsSite() {
  return getCurrentDomainType() === 'operators';
}

// Get URL for a specific domain
export function getDomainUrl(domain) {
  const isDev = window.location.hostname === 'localhost';

  if (isDev) {
    // In development, everything runs on localhost
    return '';
  }

  switch (domain) {
    case 'marketing':
      return import.meta.env.VITE_MARKETING_DOMAIN || 'https://360degreemethod.com';
    case 'app':
      return import.meta.env.VITE_APP_DOMAIN || 'https://app.360degreemethod.com';
    case 'operators':
      return import.meta.env.VITE_OPERATORS_DOMAIN || 'https://operators.360degreemethod.com';
    default:
      return '';
  }
}

// Create a cross-domain link
export function createCrossDomainUrl(domain, path) {
  const baseUrl = getDomainUrl(domain);
  return `${baseUrl}${path}`;
}

// Redirect to login on app domain
export function redirectToLogin() {
  const appDomain = getDomainUrl('app');
  window.location.href = `${appDomain}/Login`;
}

// Redirect to signup on app domain
export function redirectToSignup() {
  const appDomain = getDomainUrl('app');
  window.location.href = `${appDomain}/Signup`;
}
```

### Step 4.2: Create Domain Router Component

Create `src/components/routing/DomainRouter.jsx`:

```javascript
import React from 'react';
import { getCurrentDomainType } from '@/lib/domain';

// Marketing site pages (shown on 360degreemethod.com)
const MARKETING_PAGES = [
  'Welcome',
  'Pricing',
  'Resources',
  'DemoEntry',
  'WelcomeDemo',
  'BecomeOperator',
  // Demo pages
  'DemoImproving',
  'DemoOverwhelmed',
  'DemoExcellent',
  'DemoPortfolio',
];

// Operator landing pages (shown on operators.360degreemethod.com)
const OPERATOR_LANDING_PAGES = [
  'BecomeOperator',
  'OperatorApplication',
];

// Check if a page should be shown on current domain
export function shouldShowOnCurrentDomain(pageName) {
  const domainType = getCurrentDomainType();

  switch (domainType) {
    case 'marketing':
      // Marketing site shows marketing pages + demo pages
      return MARKETING_PAGES.includes(pageName) || pageName.startsWith('Demo');

    case 'operators':
      // Operator landing shows operator-specific pages
      return OPERATOR_LANDING_PAGES.includes(pageName);

    case 'app':
    default:
      // App shows everything
      return true;
  }
}

// Get the default page for current domain
export function getDefaultPageForDomain() {
  const domainType = getCurrentDomainType();

  switch (domainType) {
    case 'marketing':
      return 'Welcome';
    case 'operators':
      return 'BecomeOperator';
    case 'app':
    default:
      return 'Welcome'; // Will redirect to dashboard if authenticated
  }
}

// Higher-order component to restrict pages by domain
export function withDomainRestriction(WrappedComponent, allowedDomains = ['app']) {
  return function DomainRestrictedComponent(props) {
    const currentDomain = getCurrentDomainType();

    if (!allowedDomains.includes(currentDomain)) {
      // Redirect to appropriate domain
      return <DomainRedirect targetDomain="app" />;
    }

    return <WrappedComponent {...props} />;
  };
}

// Redirect component for cross-domain navigation
export function DomainRedirect({ targetDomain, path = '/' }) {
  React.useEffect(() => {
    const getDomainUrl = (domain) => {
      switch (domain) {
        case 'marketing':
          return import.meta.env.VITE_MARKETING_DOMAIN || 'https://360degreemethod.com';
        case 'app':
          return import.meta.env.VITE_APP_DOMAIN || 'https://app.360degreemethod.com';
        case 'operators':
          return import.meta.env.VITE_OPERATORS_DOMAIN || 'https://operators.360degreemethod.com';
        default:
          return '';
      }
    };

    window.location.href = `${getDomainUrl(targetDomain)}${path}`;
  }, [targetDomain, path]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}
```

### Step 4.3: Update Welcome.jsx for Marketing Domain

Update the navigation in `Welcome.jsx` to use cross-domain URLs:

```javascript
// Add this import at the top
import { redirectToLogin, redirectToSignup, isMarketingSite } from '@/lib/domain';

// Update the login/signup buttons in the header:
<button
  onClick={() => {
    if (isMarketingSite()) {
      redirectToLogin();
    } else {
      navigate('/Login');
    }
  }}
  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
>
  Log In
</button>
<button
  onClick={() => {
    if (isMarketingSite()) {
      redirectToSignup();
    } else {
      navigate('/Signup');
    }
  }}
  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
>
  Sign Up Free
</button>
```

### Step 4.4: Update App.jsx for Domain-Based Routing

Update the ClerkProvider configuration:

```javascript
// In App.jsx, update ClerkProvider:
import { getCurrentDomainType, getDomainUrl } from '@/lib/domain';

// ...

const getClerkRedirectUrls = () => {
  const appDomain = getDomainUrl('app');
  const isDev = window.location.hostname === 'localhost';

  return {
    afterSignInUrl: isDev ? '/Properties' : `${appDomain}/Properties`,
    afterSignUpUrl: isDev ? '/Onboarding' : `${appDomain}/Onboarding`,
  };
};

function App() {
  const { afterSignInUrl, afterSignUpUrl } = getClerkRedirectUrls();

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        afterSignInUrl={afterSignInUrl}
        afterSignUpUrl={afterSignUpUrl}
      >
        {/* ... rest of the app */}
      </ClerkProvider>
    </ErrorBoundary>
  );
}
```

---

## Part 5: Page Distribution

### Pages on `360degreemethod.com` (Marketing)

| Page | Route | Purpose |
|------|-------|---------|
| Welcome | `/` | Landing page |
| Pricing | `/Pricing` | Pricing info |
| Resources | `/Resources` | Public guides |
| DemoEntry | `/DemoEntry` | Demo selection |
| Demo* | `/Demo*` | All demo pages |
| BecomeOperator | `/BecomeOperator` | Operator info |

### Pages on `app.360degreemethod.com` (Application)

| Page Type | Examples |
|-----------|----------|
| Auth | Login, Signup, ForgotPassword |
| Onboarding | Onboarding |
| Homeowner Dashboard | Dashboard, Properties, Baseline, Inspect, Track, etc. |
| Operator Portal | OperatorDashboard, OperatorLeads, etc. |
| Contractor Portal | ContractorDashboard, ContractorJobs, etc. |
| HQ Admin | HQDashboard, HQUsers, etc. |
| Settings | Settings, NotificationSettings, etc. |

### Pages on `operators.360degreemethod.com`

| Page | Route | Purpose |
|------|-------|---------|
| BecomeOperator | `/` | Operator landing |
| OperatorApplication | `/apply` | Application form |
| (Login redirects to app.360degreemethod.com) |

---

## Part 6: Testing Checklist

### Local Development Testing

Add to your hosts file to simulate domains locally:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux:** `/etc/hosts`

```
127.0.0.1 local.360degreemethod.com
127.0.0.1 app.local.360degreemethod.com
127.0.0.1 operators.local.360degreemethod.com
```

### Pre-Deployment Checklist

- [ ] DNS records added in Squarespace
- [ ] All domains added in Vercel
- [ ] Clerk domains configured
- [ ] Clerk redirect URLs set
- [ ] Environment variables updated
- [ ] Code changes deployed

### Post-Deployment Testing

1. **DNS Propagation:**
   - [ ] `360degreemethod.com` resolves to Vercel
   - [ ] `app.360degreemethod.com` resolves to Vercel
   - [ ] `operators.360degreemethod.com` resolves to Vercel

2. **SSL Certificates:**
   - [ ] All domains show secure (HTTPS)
   - [ ] No certificate warnings

3. **Marketing Site (`360degreemethod.com`):**
   - [ ] Landing page loads immediately (no loading spinner)
   - [ ] No Clerk-related console errors
   - [ ] "Log In" button redirects to app.360degreemethod.com/Login
   - [ ] "Sign Up" button redirects to app.360degreemethod.com/Signup
   - [ ] Demo pages work
   - [ ] Pricing section on Welcome page works

4. **App Site (`app.360degreemethod.com`):**
   - [ ] Login works (Clerk SignIn component)
   - [ ] Signup works (Clerk SignUp component)
   - [ ] After login, redirects to dashboard/Properties
   - [ ] All protected pages work
   - [ ] Can switch between portals
   - [ ] useAuth() returns real authentication state

5. **Operators Site (`operators.360degreemethod.com`):**
   - [ ] Landing page loads immediately (no loading spinner)
   - [ ] No Clerk-related console errors
   - [ ] Apply/Contact button works
   - [ ] Login link redirects to app subdomain

6. **Free Tier Behavior (Expected):**
   - [ ] ✅ Users on marketing site see guest state (not logged in) - THIS IS CORRECT
   - [ ] ✅ Login/Signup buttons redirect to app subdomain - THIS IS CORRECT
   - [ ] ❌ NO session sharing between domains - This is a FREE tier limitation, NOT a bug

---

## Part 7: Implementation Order

### Phase 1: DNS Setup (Day 1)
1. Add all DNS records in Squarespace
2. Wait for propagation (15-30 minutes)
3. Verify with nslookup

### Phase 2: Vercel Setup (Day 1)
1. Add all domains in Vercel
2. Update vercel.json
3. Add environment variables
4. Deploy

### Phase 3: Clerk Setup (Day 1)
1. Add domains in Clerk dashboard
2. Configure redirect URLs
3. Test sign-in/sign-up

### Phase 4: Code Changes (Day 2)
1. Create domain.js utility
2. Create DomainRouter component
3. Update Welcome.jsx
4. Update App.jsx
5. Deploy and test

### Phase 5: Testing (Day 2-3)
1. Test all domains
2. Test auth flows
3. Test session sharing
4. Fix any issues

---

## Troubleshooting

### DNS Not Propagating
- Wait longer (can take up to 48 hours, usually 15-30 minutes)
- Clear DNS cache: Windows `ipconfig /flushdns`
- Check with https://dnschecker.org/

### SSL Certificate Issues
- Vercel automatically provisions SSL
- May take a few minutes after DNS propagates
- Check Vercel dashboard for certificate status

### Clerk Sign-In Not Working on App Domain
- Verify `app.360degreemethod.com` is added in Clerk dashboard
- Check redirect URLs match exactly
- Ensure publishable key is for the correct environment (test vs live)
- Check browser console for Clerk errors

### "Users aren't logged in on marketing site"
**This is NOT a bug - it's expected FREE tier behavior.**
- Marketing site doesn't have ClerkProvider
- `useAuth()` returns guest state on marketing domain
- This is intentional to stay on Clerk's FREE tier
- **To fix:** Upgrade to Clerk Pro ($25/month) and add satellite domains

### Clerk Errors on Marketing Site
If you see Clerk-related errors in the console on marketing/operators domains:
- Check that `shouldInitializeClerk()` returns `false` for these domains
- Verify `App.jsx` conditionally renders `ClerkProvider`
- Check that marketing pages don't call Clerk hooks directly

### Pages Not Loading on Marketing Site
- Check vercel.json routing configuration
- Verify the domain detection code is correct (`src/lib/domain.js`)
- Check browser console for errors
- Ensure `isMarketingSite()` or `isOperatorsSite()` returns correctly

### Login/Signup Buttons Not Working on Marketing Site
- Check `vercel.json` has the redirect rules for `/Login` and `/Signup`
- Buttons should navigate to `/Login` which Vercel redirects to app subdomain
- Test with: `curl -I https://360degreemethod.com/Login` (should return 307/302 redirect)

---

## Rollback Plan

If something breaks:

1. **Immediate:** Change Clerk redirect URLs back to old domain
2. **DNS:** Update Squarespace records back to old configuration
3. **Vercel:** Remove new domains, keep primary domain
4. **Code:** Revert domain detection code changes

---

## Summary

| Task | Time Estimate | Difficulty |
|------|---------------|------------|
| DNS Setup | 30 min | Easy |
| Vercel Config | 20 min | Easy |
| Clerk Config | 20 min | Easy |
| Code Changes | 2-3 hours | Medium |
| Testing | 2-3 hours | Easy |

**Total: 1 day for basic setup, 2 days for full testing**
