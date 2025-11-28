# 360° Method App - Development Guide

> **Single source of truth for the 360° Method App codebase**

## Project Overview

The 360° Method App is a **mobile-first** home maintenance and wealth-building platform that transforms reactive homeowners into proactive asset managers. The app helps property owners catch the $50 fix before it becomes the $5,000 disaster.

**Core Value Proposition:** Most property owners are one hidden problem away from a $10,000 emergency. The 360° Method prevents this through systematic property care.

---

## Critical Design Principle: MOBILE FIRST

All development must follow mobile-first design:

- **Design for mobile screens first**, then scale up to desktop
- **Touch-friendly** buttons (min 44px tap targets)
- **Bottom navigation** for mobile users
- **Responsive layouts** that work on phones (320px+)
- **Thumb-zone friendly** - important actions within easy reach
- Test on mobile viewports before desktop

```jsx
// Good: Mobile-first responsive classes
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="text-base md:text-lg"

// Bad: Desktop-first (avoid)
className="p-8 sm:p-4"
```

---

## The 360° Method Framework

The app follows a **3-phase methodology** with **3 steps in each phase**:

### PHASE 1: AWARE (Know Your Home)

| Step | Name | Description | Page |
|------|------|-------------|------|
| 1 | **BASELINE** | Document all home systems (HVAC, roof, plumbing, electrical, etc.) with age, condition, brand, model, photos | `/Baseline` |
| 2 | **INSPECT** | Regular walkthrough inspections to catch issues early. Room-by-room guided inspections | `/Inspect` |
| 3 | **TRACK** | Maintenance log and history report. Record all work done, view past maintenance, track spending | `/Track` |

> **360° Health Score** (`/Score360`) - AI analyzes all systems and generates a comprehensive property health score (0-100). Standalone page accessible from dashboard.

### PHASE 2: ACT (Take Action)

| Step | Name | Description | Page |
|------|------|-------------|------|
| 4 | **PRIORITIZE** | AI ranks tasks by urgency, cost impact, cascade risk. Shows what to fix first and why | `/Prioritize` |
| 5 | **SCHEDULE** | Plan and schedule maintenance. DIY guides, hire operators, or request quotes from marketplace | `/Schedule` |
| 6 | **EXECUTE** | Complete the work. Log costs, receipts, photos. Build maintenance history | `/Execute` |

### PHASE 3: ADVANCE (Build Wealth)

| Step | Name | Description | Page |
|------|------|-------------|------|
| 7 | **PRESERVE** | Preventive maintenance schedules to extend system life, avoid disasters | `/Preserve` |
| 8 | **UPGRADE** | Strategic improvements that increase property value. ROI calculations | `/Upgrade` |
| 9 | **SCALE** | Portfolio view for investors, wealth projections, equity tracking | `/Scale` |

---

## User Types (4 Portals)

### 1. HOMEOWNER Portal
- **Use case:** Single property owner following the 360° Method
- **Dashboard:** `/Dashboard` or `/DashboardHomeowner`
- **Key features:** Property health score, maintenance tasks, DIY guides
- **Onboarding:** Add property → Baseline systems → First inspection

### 2. INVESTOR Portal
- **Use case:** Multiple properties, wealth-building focus
- **Dashboard:** `/DashboardInvestor`
- **Key features:** Portfolio overview, equity tracking, ROI projections, comparative analysis
- **Onboarding:** Add properties → Portfolio setup → Wealth goals

### 3. OPERATOR Portal
- **Use case:** Service companies (property managers, maintenance companies)
- **Dashboard:** `/OperatorDashboard`
- **Key features:** Lead management, work orders, contractor dispatch, invoicing
- **Pages:** `/OperatorLeads`, `/OperatorWorkOrders`, `/OperatorClients`, `/OperatorInvoices`

### 4. CONTRACTOR Portal
- **Use case:** Individual workers assigned jobs by operators
- **Dashboard:** `/ContractorDashboard`
- **Key features:** Job queue, job details, messaging, availability
- **Pages:** `/ContractorJobDetail`, `/ContractorMessages`, `/ContractorProfile`

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite | UI framework and build tool |
| Routing | React Router v6 | Client-side routing |
| Styling | Tailwind CSS | Utility-first CSS |
| Components | ShadCN UI | Pre-built accessible components |
| Data Fetching | TanStack Query | Server state management |
| Authentication | Clerk | User auth, SSO, session management |
| Database | Supabase (PostgreSQL) | Data storage, real-time subscriptions |
| Storage | Supabase Storage | Image/file uploads |
| Icons | Lucide React | Icon library |
| Analytics | Microsoft Clarity | Session recordings, heatmaps, user behavior |

### Key Files
```
src/
├── App.jsx              # Root component, routing, providers
├── pages.config.js      # Page registry, public/protected pages
├── Layout.jsx           # App shell (nav, cart, portal)
├── lib/
│   ├── AuthContext.jsx  # Auth state from Clerk
│   ├── clarity.js       # Microsoft Clarity analytics
│   └── query-client.js  # TanStack Query client
├── components/
│   ├── auth/RouteGuard.jsx  # Protected route wrapper
│   └── ui/              # ShadCN components
├── pages/               # All page components
└── api/
    └── supabaseClient.js # Supabase client instance
```

---

## Authentication

### Provider: Clerk
- Publishable key in `.env`: `VITE_CLERK_PUBLISHABLE_KEY`
- Sign in: `/Login`
- Sign up: `/Signup`
- After sign in → `/Properties`
- After sign up → `/Onboarding`

### Route Protection
```jsx
// Public pages (no auth required) - defined in pages.config.js
export const PUBLIC_PAGES = [
  'Welcome', 'Login', 'Signup', 'ForgotPassword',
  'Pricing', 'Waitlist', 'Resources', 'DemoEntry',
  // ... demo pages, templates, etc.
];

// Protected pages automatically wrapped with RouteGuard
// Redirects to /Login if not authenticated
// Redirects to /Onboarding if onboarding incomplete
```

### Auth Hook Usage
```jsx
import { useAuth } from '@/lib/AuthContext';

function MyComponent() {
  const {
    user,           // User object with id, email, name
    isAuthenticated,
    isLoadingAuth,
    login,          // Opens Clerk sign-in
    signup,         // Opens Clerk sign-up
    logout,         // Signs out
  } = useAuth();
}
```

---

## Database Architecture

### Core Principle #1: Property ID is the Central Hub

**Every piece of data ties back to a Property ID (UUID).** The property is the source of truth.

```
                              ┌─────────────────┐
                              │   PROPERTY      │
                              │   (UUID)        │
                              └────────┬────────┘
                                       │
       ┌───────────────┬───────────────┼───────────────┬───────────────┐
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ Systems │    │  Tasks  │    │Inspections│   │Work Orders│  │ Upgrades│
  │(Baseline)│   │         │    │          │   │          │   │         │
  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
       │               │               │               │
       ▼               ▼               ▼               ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ Photos  │    │ Receipts│    │ Issues  │    │Job Photos│
  └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

**All tables reference `property_id`:**
- `system_baselines.property_id` → Systems documented for this property
- `maintenance_tasks.property_id` → Tasks for this property
- `inspections.property_id` → Inspections done on this property
- `work_orders.property_id` → Work orders for this property
- `upgrades.property_id` → Improvement projects for this property
- `service_requests.property_id` → Service requests for this property
- `proposals.property_id` → Proposals for this property

**This means:**
- Owner sees everything about THEIR properties
- Operator sees properties they're assigned to service
- Contractor sees properties where they have jobs
- All history, costs, photos roll up to the property record

---

### Core Principle #2: Standardized Address ID
Every physical property gets a unique, standardized address key for deduplication:

```sql
-- Example: "1112 Orizaba Ave, Long Beach, CA 90804"
-- Becomes: "1112orizabaavelbca90804"

SELECT standardize_address(
  '1112 Orizaba Ave',  -- street
  'Long Beach',         -- city
  'CA',                 -- state
  '90804'               -- zip
);
```

### Key Tables

#### Properties (User Data)
```sql
properties
├── id (uuid, PK)
├── user_id (references auth.users)
├── standardized_address_id (unique key)
├── street_address, city, state, zip_code
├── property_type (single_family, condo, townhouse, multi_family)
├── year_built
├── square_footage
├── bedrooms, bathrooms
├── created_at, updated_at
```

#### Property Systems (What users document)
```sql
property_systems
├── id (uuid, PK)
├── property_id (references properties)
├── system_type (hvac, roof, plumbing, electrical, etc.)
├── brand, model
├── install_date, estimated_age
├── condition (excellent, good, fair, poor, critical)
├── notes, photos[]
├── last_serviced_date
```

#### Maintenance Tasks
```sql
maintenance_tasks
├── id (uuid, PK)
├── property_id (references properties)
├── system_id (references property_systems)
├── title, description
├── priority (critical, high, medium, low)
├── status (pending, in_progress, completed, skipped)
├── due_date
├── estimated_cost
├── actual_cost
├── completed_at
├── completed_by (diy, operator, contractor)
```

#### Reference Data Tables
```sql
-- System lifespan reference data
system_lifespans
├── system_type
├── component
├── expected_lifespan_years
├── maintenance_interval_months
├── replacement_cost_low/mid/high

-- Regional cost data by zip code
regional_costs
├── zip_code
├── labor_rate_per_hour
├── cost_multiplier
├── hvac_replacement_avg
├── roof_replacement_per_sqft
-- etc.

-- Public property data (from APIs)
public_property_data
├── standardized_address_id
├── zillow_zestimate
├── bedrooms, bathrooms
├── sqft, lot_size
├── last_sale_date, last_sale_price
├── data_source, fetched_at
```

### Key Relationships
```
User (Clerk) ──┬── owns ──> Properties ──> Systems ──> Tasks
               │
               ├── (as Operator) ──> Service Requests ──> Work Orders
               │
               └── (as Contractor) ──> Contractor Jobs

Property ──> standardized_address_id ──> Public Property Data
                                     ──> Regional Costs (via zip)
```

---

## Business Rules

### Property Health Score (0-100)
Calculated from:
- System ages vs expected lifespans (40%)
- System conditions (30%)
- Overdue maintenance tasks (20%)
- Inspection recency (10%)

### Task Priority Algorithm
Tasks ranked by:
1. **Safety risk** - Immediate dangers first
2. **Cascade risk** - Issues that cause other problems (e.g., roof leak → mold → structural)
3. **Cost impact** - $50 fix now vs $5,000 later
4. **System criticality** - HVAC in summer, heating in winter

### Cascade Risk Examples
```
Roof leak → Water damage → Mold → Structural damage → Health hazard
Small HVAC issue → System failure → Emergency replacement (2-3x cost)
Gutter blockage → Foundation damage → $10,000+ repair
```

---

## Project Structure

```
360°-Method-App/
├── .env                    # Environment variables (not in git)
├── .env.example            # Template for env vars
├── CLAUDE.md               # This file - project documentation
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── App.jsx             # Root with providers
│   ├── App.css
│   ├── index.css           # Global styles + Tailwind
│   ├── Layout.jsx          # App shell
│   ├── pages.config.js     # Route configuration
│   ├── api/
│   │   └── supabaseClient.js
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   ├── query-client.js
│   │   └── utils.js
│   ├── components/
│   │   ├── auth/
│   │   ├── baseline/       # System documentation components
│   │   ├── inspect/        # Inspection walkthrough
│   │   ├── execute/        # Task execution
│   │   ├── preserve/       # Preventive maintenance
│   │   ├── upgrade/        # Property improvements
│   │   ├── scale/          # Portfolio/wealth tracking
│   │   ├── properties/     # Property management
│   │   ├── landing/        # Public landing page
│   │   ├── ui/             # ShadCN components
│   │   └── shared/         # Reusable components
│   └── pages/
│       ├── Welcome.jsx     # Landing page (public)
│       ├── Dashboard.jsx   # Main homeowner dashboard
│       ├── Properties.jsx  # Property list
│       ├── Baseline.jsx    # System documentation
│       ├── Inspect.jsx     # Inspections
│       ├── Prioritize.jsx  # Task prioritization
│       ├── Execute.jsx     # Task execution
│       ├── Preserve.jsx    # Preventive maintenance
│       ├── Upgrade.jsx     # Strategic improvements
│       ├── Scale.jsx       # Portfolio/wealth
│       ├── Settings.jsx    # User settings
│       ├── Onboarding.jsx  # New user setup
│       └── ...             # Operator, Contractor, Admin pages
└── supabase/
    └── migrations/         # Database migrations
```

---

## Current Build Status

### Completed
- [x] Authentication with Clerk
- [x] Public/Protected route separation
- [x] Welcome landing page with Login/Signup
- [x] Basic page structure for all 360° Method steps
- [x] Mobile-first responsive layout
- [x] Supabase database connection

### In Progress
- [ ] Database migrations for new data architecture
- [ ] Property CRUD operations
- [ ] System documentation (Baseline)
- [ ] Inspection workflow

### Planned
- [ ] AI health score calculation
- [ ] Task prioritization algorithm
- [ ] Operator marketplace
- [ ] Contractor job assignment
- [ ] Payment processing (Stripe)

---

## Environment Variables

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLARITY_PROJECT_ID=your-clarity-id  # Microsoft Clarity analytics (clarity.microsoft.com)
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Code Style Guidelines

1. **Mobile-first CSS** - Always start with mobile styles, add breakpoints for larger screens
2. **Component organization** - One component per file, group by feature
3. **Use ShadCN components** - Don't reinvent UI primitives
4. **TanStack Query for data** - No raw fetch calls, use useQuery/useMutation
5. **Tailwind for styling** - Minimal custom CSS
6. **TypeScript-ready** - Use JSDoc types, prepare for future TS migration

---

## Common Patterns

### Protected Page Template
```jsx
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function MyProtectedPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-data', user?.id],
    queryFn: () => fetchMyData(user.id),
    enabled: !!user?.id,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6">
      {/* Mobile-first content */}
    </div>
  );
}
```

### Supabase Query
```jsx
import { supabase } from '@/api/supabaseClient';

const fetchProperties = async (userId) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```

---

*Last updated: November 2024*
