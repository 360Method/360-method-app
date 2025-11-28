# 360° Method App

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)

A **mobile-first** home maintenance and wealth-building platform that transforms reactive homeowners into proactive asset managers.

> **Catch the $50 fix before it becomes the $5,000 disaster.**

---

## 🏠 What is the 360° Method?

Most property owners are one hidden problem away from a $10,000 emergency. The 360° Method prevents this through systematic property care using a **3-phase, 9-step methodology**:

| Phase | Focus | Steps |
|-------|-------|-------|
| **AWARE** | Know Your Home | Baseline → Inspect → Track |
| **ACT** | Take Action | Prioritize → Schedule → Execute |
| **ADVANCE** | Build Wealth | Preserve → Upgrade → Scale |

---

## ✨ Features

### 4 User Portals

- **🏡 Homeowner** - Single property management, DIY guides, health scores
- **📈 Investor** - Portfolio tracking, equity projections, ROI analysis
- **🔧 Operator** - Service company dashboard, work orders, invoicing
- **👷 Contractor** - Job queue, scheduling, client messaging

### Key Capabilities

- 🎯 **AI-Powered Health Score** - Property condition rated 0-100
- 📋 **Smart Task Prioritization** - Fix what matters most, first
- 🔍 **Guided Inspections** - Room-by-room walkthrough checklists
- 📊 **Maintenance History** - Complete record of all work done
- 💰 **Cost Tracking** - Know exactly what you've spent
- 📱 **Mobile-First Design** - Built for phones, scales to desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + ShadCN UI |
| Routing | React Router v6 |
| Data | TanStack Query |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Analytics | Microsoft Clarity |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase](https://supabase.com/) account (free tier works)
- [Clerk](https://clerk.com/) account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/360-method-app.git
   cd 360-method-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_CLARITY_PROJECT_ID=your-clarity-id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
360°-Method-App/
├── src/
│   ├── api/           # API clients (Supabase)
│   ├── components/    # React components by feature
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities, auth context, helpers
│   ├── pages/         # Page components (routes)
│   └── App.jsx        # Root component
├── functions/         # Supabase Edge Functions
├── supabase/          # Database migrations
└── public/            # Static assets
```

---

## 📖 Documentation

For detailed developer documentation, see [CLAUDE.md](CLAUDE.md).

---

## 🧑‍💻 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🤝 Contributing

This is a private project. Please contact the maintainers for contribution guidelines.

---

*Built with ❤️ for homeowners who want to protect their biggest investment.*
