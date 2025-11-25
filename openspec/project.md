# Project Context

## Purpose
Digital Sobriety Hub is a web application for eco-design assessment of digital services based on the RGESN 2024 (Référentiel Général d'Écoconception de Services Numériques). It helps organizations evaluate and improve the environmental impact of their digital products through structured assessments, scoring, and actionable recommendations.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React hooks, TanStack Query
- **Forms**: React Hook Form
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Analytics**: Umami (privacy-focused, replacing Matomo)
- **Testing**: Vitest + React Testing Library
- **Build**: Vite with SWC

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks (no class components)
- ESLint for code quality
- File naming: PascalCase for components, camelCase for utilities
- Prefer named exports for components and services
- Use absolute imports with `@/` prefix for src directory

### Architecture Patterns
- **Domain-Driven Design**: Core domain models in `src/core/domain/`
- **Service Layer**: Business logic in `src/core/services/`
- **Hybrid Persistence**: Supabase for authenticated users, localStorage for guests
- **Component Structure**: Presentational components in `src/components/`, page components in `src/pages/`
- **Hooks**: Custom hooks in `src/hooks/` for reusable logic
- **Static Data**: RGESN referential data embedded in `src/data/rgesn.ts`

### Testing Strategy
- Unit tests for services (`*.test.ts`)
- Component tests for UI (`*.test.tsx`)
- Mock Supabase client in test setup (`src/test/setup.ts`)
- Test files colocated with source files
- Run tests with `npm test`
- Aim for coverage of critical business logic and user flows

### Git Workflow
- Feature branches from main
- Commit messages should be clear and descriptive
- ADRs (Architecture Decision Records) in `docs/adr/` for significant decisions
- Keep commits focused and atomic

## Domain Context
- **RGESN 2024**: French government referential with 78 criteria across 9 themes for digital eco-design
- **Assessment Levels**: Essential (light), Recommended (standard), Advanced (full)
- **Scoring**: Compliance rate, scores by level and theme
- **User Roles**: Guest users (localStorage), Authenticated users (Supabase)
- **Assessment Lifecycle**: Draft → In Progress → Completed → Archived

## Important Constraints
- **Privacy**: No tracking without consent, Umami for privacy-focused analytics
- **Accessibility**: Follow WCAG guidelines
- **Performance**: Lightweight, fast loading
- **Sobriety**: Practice what we preach - minimal dependencies, efficient code
- **Data Sovereignty**: User data stored in Supabase (EU region recommended)

## External Dependencies
- **Supabase**: Authentication, PostgreSQL database, real-time subscriptions
- **Umami**: Self-hosted or cloud analytics
- **RGESN Data**: Static referential from official French government source
