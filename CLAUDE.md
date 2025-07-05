# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application for generating and managing release notes. It uses TypeScript, Supabase for backend/auth, and integrates with AI (Claude/Anthropic) for automated release note generation.

## Key Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
supabase start       # Start local Supabase instance
supabase db reset    # Reset database with migrations
supabase migration new <name>  # Create new migration
```

## Architecture

### Application Structure
- **App Router**: Uses Next.js 14 App Router with route groups
- **Authentication**: Supabase Auth with middleware-based route protection
- **Database**: PostgreSQL via Supabase with RLS policies
- **AI Integration**: Anthropic Claude API for release note generation

### Core Components
- **Route Groups**: `(auth)` for login/signup, `(dashboard)` for authenticated routes
- **Middleware**: `middleware.ts` handles auth state and redirects
- **Context**: `AuthContext.tsx` manages auth state across components
- **AI Provider**: `lib/ai/` contains abstracted AI provider system

### Database Schema
Multi-tenant architecture with:
- `organizations` - Main tenant entity
- `organization_members` - User-organization relationships with roles
- `integrations` - GitHub/Jira/Linear connections per org
- `release_notes` - Generated notes with markdown/HTML content
- `ticket_cache` - Cached ticket data from integrations
- `subscribers` - Email subscribers per organization

### Authentication Flow
1. Middleware checks auth state on all routes
2. Unauthenticated users redirected to `/login`
3. Authenticated users on auth routes redirected to `/dashboard`
4. RLS policies enforce organization-based data access

### AI Generation
1. Users select tickets from integrations
2. System fetches ticket details via API
3. Claude generates structured release notes
4. Content is sanitized with DOMPurify before storage
5. Notes support draft/published states

## Environment Variables

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Important Notes

- All database access is protected by RLS policies
- AI-generated content is sanitized with DOMPurify
- TypeScript path aliases use `@/*` for root-level imports
- Supabase client is initialized in `lib/supabase.ts`
- AI provider system is abstracted in `lib/ai/` for multiple providers