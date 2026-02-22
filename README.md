# 🚀 Release Notes Generator

> AI-powered release notes generator with GitHub integration, professional email notifications, and modern architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🤖 **AI-Powered Generation**: OpenAI (configured model ID) with Azure OpenAI fallback
- 🔗 **Multi-Platform Integration**: GitHub, Jira, and Linear integrations
- 📧 **Professional Emails**: Beautiful email notifications via Resend
- 🎨 **Modern UI**: Built with Next.js 16, React 19, Tailwind CSS, and Shadcn/ui
- 🔒 **Security Defaults**: Supabase Auth + RLS, route protection via `proxy.ts`, HTML sanitization
- 📱 **Responsive Design**: Mobile-first design with excellent UX
- 🏗️ **Modern Architecture**: Clean service layer, React Query caching, and TypeScript
- 📊 **Public Release Notes**: SEO-optimized public pages with custom domains
- 🎯 **Error Boundaries**: Comprehensive error handling and recovery
- 🚀 **Production Ready**: Type-safe, tested, and documented

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ installed
- Git installed
- Supabase account (free tier available)
- AI Provider account (OpenAI recommended, Azure OpenAI optional fallback)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/pmahajan3105/releasenote.git
cd releasenote

# Install dependencies
npm install

# Copy environment example
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your values:

```env
# Required: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required: AI Provider (default OpenAI)
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=<openai-model-id>

# Optional: Azure OpenAI fallback
# AI_PROVIDER=azure-openai
# AZURE_OPENAI_API_KEY=your-azure-key
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Required: GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Required: Email notifications
RESEND_API_KEY=re_your-resend-key

# Optional: App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Start local Supabase (requires Docker)
npx supabase start

# Or use your hosted Supabase project
# Run migrations in Supabase Dashboard > SQL Editor
```

### 4. Start Development

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

Your app will be running with hot reload enabled!

## 🏗️ Architecture

### Clean Architecture Principles
```
app/                    # Next.js App Router
├── api/               # API routes (serverless functions)
├── (dashboard)/       # Authenticated routes
└── (auth)/           # Auth-related pages

lib/                   # Core business logic
├── services/         # Business logic layer
├── hooks/           # React Query hooks
├── store/           # Zustand state management
├── supabase/ssr.ts  # Supabase SSR/browser/middleware helpers
└── security/edge.ts # Edge-safe security helpers for proxy

components/           # Reusable UI components
├── ui/              # Base UI components
├── features/        # Feature-specific components
└── error-boundary.tsx

types/               # TypeScript definitions
└── database.ts     # Generated Supabase types
```

### Key Architectural Decisions
- **Service Layer**: Clean separation of business logic from UI
- **Type Safety**: Full TypeScript coverage with generated database types
- **Error Boundaries**: Comprehensive error handling at component level
- **Caching Strategy**: React Query for server state, Zustand for client state
- **Authentication**: Supabase Auth with `@supabase/ssr` and proxy-based route protection
- **API Design**: RESTful endpoints with consistent error handling

## 📖 Documentation

### Canonical docs
- **[Docs Index](docs/README.md)** - Source-of-truth map, ownership, and freshness policy
- **[Implementation As Built](docs/IMPLEMENTATION-AS-BUILT.md)** - Current journeys, route/API inventory, auth/security posture
- **[Setup Guide](docs/SETUP-GUIDE.md)** - Local development setup (OpenAI-first, Azure fallback)
- **[Deployment Guide](docs/DEPLOYMENT-GUIDE.md)** - Production deployment on Vercel + Supabase + Resend + OpenAI

### Configuration reference
- **Environment variables** – See `.env.example` in the project root

## 🛠️ Technology Stack

### Framework & Core
- **Next.js 16** - Full-stack React framework with App Router
- **React 19** - Modern React runtime
- **TypeScript 5** - Type-safe development
- **Webpack (build)** - Stable production builds (`npm run build`)
- **Turbopack (optional)** - Experimental build path (`npm run build:turbo`)

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Database-level authorization
- **Supabase Auth** - Authentication and user management
- **@supabase/ssr** - SSR/auth helper layer for App Router + proxy

### State Management & Caching
- **React Query** - Server state management and caching
- **Zustand** - Client state management
- **SWR patterns** - Stale-while-revalidate caching

### AI & Integrations
- **OpenAI Responses API** - Primary AI provider (configured `OPENAI_MODEL`)
- **Azure OpenAI** - Optional fallback provider
- **GitHub API** - Repository and issue integration
- **Jira API** - Project management integration
- **Linear API** - Modern issue tracking

### Email & Communication
- **Resend** - Modern email API
- **React Email** - Email template components
- **HTML/Text emails** - Multi-format support

### Development & Quality
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Jest** - Unit testing framework
- **MSW** - HTTP mocking for deterministic integration tests
- **React Testing Library** - Component testing
- **TypeScript strict mode** - Maximum type safety

### Deployment & Infrastructure
- **Vercel** - Optimized Next.js hosting
- **Supabase Cloud** - Managed PostgreSQL
- **Edge Functions** - Global serverless compute
- **CDN** - Global content delivery

## 🚀 Deployment

### Quick Deployment (Recommended)

Follow our **[Complete Deployment Guide](docs/DEPLOYMENT-GUIDE.md)** for step-by-step instructions.

**Estimated time**: 2-3 hours for first deployment

### Deployment Options

1. **Frontend & API**: Deploy to [Vercel](https://vercel.com) (recommended) — Next.js App Router and API routes run together, no separate backend service required
2. **Database**: Managed PostgreSQL on [Supabase](https://supabase.com) (recommended)

## 🔒 Security

- **OAuth 2.0**: Industry-standard authentication
- **HTTPS Only**: Encrypted communication in production
- **Secure Headers**: CSP and related headers in `proxy.ts`
- **Rate Limiting**: Edge-safe route-aware throttling (`api`, `auth`, `public`)
- **Environment Secrets**: Secure credential management
- **Content Safety**: server-side HTML sanitization before publish/send

## ✅ Local Validation

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

## 🗺️ Roadmap

### Current Version (1.0)
- ✅ GitHub OAuth integration
- ✅ Azure OpenAI text generation
- ✅ Professional email notifications
- ✅ Public release notes pages
- ✅ Complete deployment guides
- ✅ Linear and Jira integrations

### Upcoming Features (1.1)
- [ ] Slack integration for team notifications
- [ ] Advanced AI templates and customization
- [ ] Polar.sh billing integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for developers who want better release notes** 
