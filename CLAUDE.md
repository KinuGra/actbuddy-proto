# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ActBuddy** is a web application designed to increase action-start rates by combining environmental coercion with action item management. It's a monorepo with a Next.js frontend and Go backend.

## Technology Stack

### Frontend (Next.js)
- **Framework**: Next.js 16.1.6 with App Router
- **Runtime**: React 19.2.3
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Component Library**: shadcn/ui + Radix UI
- **Package Manager**: pnpm
- **Code Quality**: ESLint (Next.js config) + Prettier

### Backend (Go)
- **Framework**: Gin for HTTP routing
- **Database**: PostgreSQL (runs in Docker)
- **Development**: Air for hot-reload during development

## Architecture

### Frontend Structure

The frontend uses a **feature-based module structure**:

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── (app)/       # Grouped routes for authenticated app
│   │   ├── dashboard/
│   │   ├── buddies/
│   │   ├── calendar/
│   │   ├── chat/
│   │   ├── matching/
│   │   └── layout.tsx
│   └── layout.tsx   # Root layout
├── features/         # Feature modules
│   ├── buddies/     # Structure: components/, types/, mocks/
│   ├── calendar/    # Structure: components/, types/, hooks/, mocks/
│   ├── chat/        # Structure: components/, types/, hooks/, mocks/
│   ├── home/        # Structure: components/
│   ├── matching/    # Structure: components/, types/, hooks/
│   └── users/       # Structure: types/, mocks/
├── components/      # Shared UI components
├── lib/            # Utility functions (e.g., cn() for Tailwind class merging)
└── types/          # Global TypeScript types
```

**Key Pattern**: Each feature is self-contained with its own types, components, hooks, and mock data. This makes features easy to test and understand in isolation.

### Backend Structure

- **main.go**: Entry point with Gin server setup, CORS configuration, and health check endpoint
- **go.mod/go.sum**: Go dependency management
- **.air.toml**: Hot-reload configuration for development
- **Dockerfile**: Container setup for Docker Compose

## Common Development Commands

### Frontend

```bash
# From frontend directory
cd frontend

# Install dependencies
pnpm install

# Development server (runs on http://localhost:3000)
pnpm run dev

# Build for production
pnpm run build

# Production server
pnpm run start

# Lint code
pnpm run lint

# Format code (run before committing)
pnpm run format
```

### Using Docker Compose

```bash
# From project root

# First-time setup with build
docker compose up --build

# Normal startup
docker compose up

# Stop services
docker compose down

# Complete reset (including database)
docker compose down -v
```

### Formatting & Quality

**All code must be formatted before committing:**

```bash
cd frontend
pnpm run format
```

Or use:

```bash
cd frontend
pnpm dlx prettier --write .
```

## Development Workflow

### Local Development (Recommended)

For faster iteration without Docker overhead:

1. Install PostgreSQL locally or use Docker just for the database
2. Run the backend and frontend separately:
   - Backend: `cd backend && go run main.go` (requires .env with DATABASE_URL)
   - Frontend: `cd frontend && pnpm install && pnpm run dev`
3. Frontend will be available at `http://localhost:3000`
4. Backend API at `http://localhost:8080`

### With Docker Compose

For a complete isolated environment:

```bash
docker compose up --build
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Configuration

### Frontend

- **tsconfig.json**: TypeScript configuration with path alias `@/*` → `./src/*`
- **eslint.config.mjs**: Next.js ESLint rules with TypeScript support
- **Tailwind CSS**: No separate config file (v4 uses defaults)

### Environment Variables

Frontend requires: `NEXT_PUBLIC_API_BASE_URL` (set in Docker Compose as `http://localhost:8080`)

Backend requires: `DATABASE_URL` (set in Docker Compose)

### Mocking Strategy

Features use mock data during development:
- Mock files located in `src/features/[feature]/mocks/`
- Used to develop UI components before backend APIs are ready
- Can be gradually replaced with real API calls (useChat, useCalendar hooks are examples)

## Code Organization Guidelines

### Adding New Features

1. Create `src/features/[feature-name]/` directory
2. Organize with subdirectories: `components/`, `types/`, `hooks/` (if needed), `mocks/` (if needed)
3. Create an `index.ts` file to export public APIs
4. Add pages in `src/app/(app)/[feature-name]/page.tsx` if needed

### Component Patterns

- Use Radix UI primitives + shadcn/ui components for UI
- Tailwind CSS for styling
- Use `clsx` or the `cn()` utility for conditional class merging
- Components are Server Components by default; use `'use client'` only when needed

### Type Safety

- TypeScript strict mode is enabled
- Use explicit types instead of `any`
- Store shared types in `src/features/[feature]/types/` or `src/types/`

## Ports & Services

| Service    | Port |
| ---------- | ---- |
| Frontend   | 3000 |
| Backend    | 8080 |
| PostgreSQL | 5432 |

## Git Workflow

- **Current branch pattern**: Feature branches like `feat/XX-feature-description`
- **Main branch**: `main` (target for pull requests)
- **Pre-commit**: Always run `pnpm run format` in the frontend directory

## Useful Notes

- Mock data allows frontend development without a running backend—use `src/features/[feature]/mocks/` for this
- The `(app)` folder in routing is a Next.js Route Group (not part of the URL)
- Frontend uses `NEXT_PUBLIC_` prefix for environment variables that need to be exposed to the browser
- ESLint config uses Next.js defaults; custom rules can be added to `eslint.config.mjs`
