# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoloOS is an all-in-one platform for indie developers and solopreneurs built with Next.js 16, React 19, TypeScript, and PostgreSQL (via Prisma). It replaces multiple tools with a unified workspace covering ideation, project management, product launches, marketing, and CRM.

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type checking

# Database
npx prisma generate   # Generate Prisma client after schema changes
npx prisma migrate dev # Create and apply migrations
```

## Architecture

### Core Workflow: Idea → Project → Product

1. **Ideas** are captured with personas, problem statements, and competitor analysis
2. **AI scoring** evaluates ideas on market size, market mix, complexity, and monetization (`src/lib/idea-scorer.ts`)
3. **Projects** are promoted from validated ideas, containing milestones, features, and Kanban tasks
4. **Products** are shipped projects with public pages, waitlists, and changelogs

### Module Structure

The app is organized into 7 dashboard modules:
- **Overview** - Single pane dashboard
- **Ideation** - Idea capture and AI validation
- **Product & Planning** - Roadmaps, features, milestones
- **DevOps-lite** - Deployment visibility
- **Marketing & Launch** - Campaigns, newsletters, social posts
- **User & Revenue** - CRM and subscriptions
- **Ops & Support** - Incidents and support

### Key Patterns

**Server Components + Server Actions**: Uses Next.js App Router. Data fetching in server components (e.g., `src/app/projects/page.tsx`), mutations via server actions (`src/app/actions/`).

**AI Integration**: OpenAI gpt-4o-mini throughout. AI modules in `src/lib/ai/` handle scoring, project health, planning, competitor suggestions, and blue ocean analysis.

**Authentication**: Clerk with middleware proxy (`src/proxy.ts`), plus fallback AuthContext for development.

**Database**: Prisma with singleton client (`src/lib/prisma.ts`). Schema in `prisma/schema.prisma`.

### Directory Layout

- `src/app/` - Next.js App Router (pages and API routes)
- `src/app/api/` - REST endpoints for ideas, projects, products, contacts, marketing
- `src/app/actions/` - Server actions for mutations
- `src/components/dashboards/` - Module-specific dashboard views
- `src/lib/ai/` - AI integration modules
- `src/lib/constants/` - Default values and templates
- `src/contexts/` - React contexts (Auth, Theme)
- `prisma/` - Database schema and migrations

### Key Files

- `prisma/schema.prisma` - Database models (Idea, Project, Product, Contact, etc.)
- `src/lib/idea-scorer.ts` - Core AI scoring logic
- `src/lib/ai/project-planner.ts` - AI project planning
- `src/components/DashboardLayout.tsx` - Main layout with sidebar navigation
- `middleware.ts` - Auth middleware (proxies to `src/proxy.ts`)
