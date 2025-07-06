# 🚀 Release Notes Generator

> AI-powered release notes generator with GitHub integration, professional email notifications, and modern architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🤖 **AI-Powered Generation**: Support for Anthropic Claude, OpenAI, and Azure OpenAI
- 🔗 **Multi-Platform Integration**: GitHub, Jira, and Linear integrations
- 📧 **Professional Emails**: Beautiful email notifications via Resend
- 🎨 **Modern UI**: Built with Next.js 15, React 18, Tailwind CSS, and Shadcn/ui
- 🔒 **Enterprise Security**: Supabase Auth with RLS policies and middleware protection
- 📱 **Responsive Design**: Mobile-first design with excellent UX
- 🏗️ **Modern Architecture**: Clean service layer, React Query caching, and TypeScript
- 📊 **Public Release Notes**: SEO-optimized public pages with custom domains
- 🎯 **Error Boundaries**: Comprehensive error handling and recovery
- 🚀 **Production Ready**: Type-safe, tested, and documented

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free tier available)
- AI Provider account (Anthropic, OpenAI, or Azure OpenAI)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/release-notes-generator.git
cd release-notes-generator

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

# Required: AI Provider (choose one)
ANTHROPIC_API_KEY=your-anthropic-key
# OR
OPENAI_API_KEY=your-openai-key
# OR
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

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
└── auth-helpers.ts  # Authentication utilities

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
- **Authentication**: Supabase Auth with middleware-based route protection
- **API Design**: RESTful endpoints with consistent error handling

## 📖 Documentation

### For Users
- **[Quick Start Guide](docs/SETUP-GUIDE.md)** - Get started in 15 minutes
- **[Features Overview](docs/AI-ORCHESTRATION.md)** - Understanding AI capabilities

### For Deployment
- **[Complete Deployment Guide](docs/DEPLOYMENT-GUIDE.md)** - Step-by-step deployment for non-technical users
- **[Environment Configuration](project/server/.env.example)** - All environment variables explained

### For Developers
- **[OAuth Integration Guide](docs/EMAIL-SLACK-INTEGRATION.md)** - Adding new OAuth providers
- **[Public Release Notes](docs/PUBLIC-RELEASE-NOTES.md)** - Public pages implementation

## 🛠️ Technology Stack

### Framework & Core
- **Next.js 15** - Full-stack React framework with App Router
- **React 18** - Modern React with concurrent features
- **TypeScript 5** - Type-safe development
- **Turbopack** - Ultra-fast bundler for development

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

### State Management & Caching
- **React Query** - Server state management and caching
- **Zustand** - Client state management
- **SWR patterns** - Stale-while-revalidate caching

### AI & Integrations
- **Anthropic Claude** - Advanced AI text generation
- **OpenAI GPT** - Alternative AI provider
- **Azure OpenAI** - Enterprise AI services
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

1. **Frontend**: Deploy to [Vercel](https://vercel.com) (recommended)
2. **Backend**: Deploy to [Railway](https://railway.app) (recommended)
3. **Database**: PostgreSQL on Railway or [Supabase](https://supabase.com)

## 🔒 Security

- **OAuth 2.0**: Industry-standard authentication
- **HTTPS Only**: Encrypted communication in production
- **Secure Headers**: Helmet.js security middleware
- **CORS Protection**: Configurable cross-origin policies
- **Environment Secrets**: Secure credential management
- **Rate Limiting**: API abuse prevention

## 🗺️ Roadmap

### Current Version (1.0)
- ✅ GitHub OAuth integration
- ✅ Azure OpenAI text generation
- ✅ Professional email notifications
- ✅ Public release notes pages
- ✅ Complete deployment guides

### Upcoming Features (1.1)
- [ ] Slack integration for team notifications
- [ ] Linear and Jira integrations
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