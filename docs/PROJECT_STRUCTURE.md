# Project Structure Documentation

This document provides a detailed overview of the project structure, explaining the purpose of each directory and important files.

## Overview

DebtLite is a full-stack application with a clear separation between frontend and backend:

- **Frontend**: TypeScript-based SPA (Single Page Application) using Vite
- **Backend**: Node.js + Express + Prisma API server

## Directory Structure

```
monthly-payment-tracker/
├── assets/                  # Static assets
├── backend/                 # Backend API
├── docs/                    # Documentation
├── pages/                   # HTML pages
├── scripts/                 # Build scripts
├── src/                     # Frontend source code
├── tools/                   # Development tools
└── [config files]           # Root configuration files
```

## Detailed Structure

### `/assets/` - Static Assets

Contains all static assets used by the frontend:

- `css/` - Custom stylesheets
  - `shared.css` - Shared styles across the application
  - `start.css` - Styles specific to the onboarding page
- `js/` - Legacy JavaScript utilities
  - `menu.js` - Navigation menu logic
- `images/` - Image assets
  - Logo files (SVG format)
  - Other image assets
- `favicon.ico` - Favicon for the application

**Note:** All assets are copied to `dist/assets/` during the build process.

### `/backend/` - Backend API

Complete backend implementation using Node.js, Express, TypeScript, and Prisma.

#### `/backend/src/` - Source Code

- `config/` - Configuration files
  - `database.ts` - Database connection setup (Prisma)
  - `env.ts` - Environment variables validation and loading
- `constants/` - Application constants
  - `index.ts` - HTTP status codes, error messages, etc.
- `controllers/` - Request handlers (HTTP layer)
  - `auth.controller.ts` - Authentication endpoints
  - `payments.controller.ts` - Payment management endpoints
  - `plans.controller.ts` - Plan management endpoints
- `errors/` - Custom error classes
  - `app.error.ts` - Base error class for application errors
- `middleware/` - Express middleware
  - `auth.middleware.ts` - JWT authentication middleware
  - `error.middleware.ts` - Global error handling
  - `validation.middleware.ts` - Request validation using Zod
- `routes/` - Route definitions
  - `auth.routes.ts` - Authentication routes
  - `payments.routes.ts` - Payment routes
  - `plans.routes.ts` - Plan routes
- `schemas/` - Zod validation schemas
  - `auth.schemas.ts` - Authentication request schemas
  - `plans.schemas.ts` - Plan request schemas
  - `payments.schemas.ts` - Payment request schemas
- `services/` - Business logic layer
  - `auth.service.ts` - Authentication business logic
  - `payments.service.ts` - Payment business logic
  - `plans.service.ts` - Plan business logic
- `types/` - TypeScript type definitions
  - `auth.types.ts` - Authentication types
  - `plans.types.ts` - Plan types
  - `payments.types.ts` - Payment types
  - `common.types.ts` - Shared types
  - `express.d.ts` - Express type extensions
- `utils/` - Utility functions
  - `hash.util.ts` - Password hashing utilities
  - `token.util.ts` - JWT token utilities
- `server.ts` - Application entry point

#### `/backend/prisma/` - Database

- `schema.prisma` - Prisma schema definition
- `seed.ts` - Database seeding script

#### `/backend/tests/` - Tests

- `integration/` - Integration tests (API endpoints)
- `unit/` - Unit tests (services, utilities)

### `/docs/` - Documentation

Project documentation and planning materials:

- `adr/` - Architecture Decision Records
  - Documents important architectural decisions
- `archive/` - Archived documentation
  - Historical documents kept for reference
- `*.md` - Various guides and documentation
  - `PLAN_MEJORAS.md` - Improvement plan
  - `TESTING_GUIDE.md` - Testing guide
  - `DEPLOY_VERCEL.md` - Deployment guide
  - And more...

### `/pages/` - HTML Pages

Static HTML pages served by the application:

- `start.html` - Onboarding/start page
- `dashboard.html` - Main dashboard page

**Note:** These files are copied to `dist/pages/` during build.

### `/scripts/` - Build Scripts

Node.js scripts used during build and development:

- `copy-dev-assets.js` - Copy development assets to dist
- `copy-static.js` - Copy static files (HTML, assets) to dist
- `dev-server.js` - Simple HTTP server for local development
- `generate-env-dev.js` - Generate development environment config
- `inject-env.js` - Inject environment variables into build

### `/src/` - Frontend Source Code

TypeScript source code for the frontend application:

- `components/` - UI component modules
  - Each component has its own directory with component file and index
  - Examples: `payment-table/`, `plan-list/`, `theme-toggle/`
- `config/` - Configuration
  - `env.config.ts` - Environment variables configuration
  - `storage.config.ts` - Storage configuration
- `pages/` - Page modules
  - `dashboard/` - Dashboard page logic
  - `start/` - Start/onboarding page logic
- `services/` - Service modules (business logic)
  - `api/` - HTTP client and API service
  - `auth/` - Authentication service
  - `payments/` - Payment service
  - `plans/` - Plan service
  - `storage/` - Storage abstraction layer
  - `sync/` - Synchronization service
- `types/` - TypeScript type definitions
  - `plan.ts` - Plan type definitions
  - `global.d.ts` - Global type declarations
- `utils/` - Utility modules
  - `formatters.ts` - Data formatting utilities
  - `validators.ts` - Validation utilities
  - `sanitizer.ts` - Input sanitization
  - `errors.ts` - Error handling utilities
  - `data-export.ts` - Data export functionality
- `__tests__/` - Integration tests
  - `integration.test.ts` - Frontend integration tests
- `scripts.ts` - Main entry point
- `start.ts` - Start page entry point
- `index.ts` - Module exports

### `/tools/` - Development Tools

Tools and utilities for development and testing:

- `test-env.html` - HTML page for testing environment variables
- `README.md` - Documentation for tools

### Root Configuration Files

- `package.json` - Node.js project configuration and dependencies
- `tsconfig.json` - TypeScript compiler configuration
- `vite.config.ts` - Vite build tool configuration
- `vitest.config.ts` - Vitest test runner configuration
- `eslint.config.js` - ESLint linting configuration
- `vercel.json` - Vercel deployment configuration
- `index.html` - Landing page HTML
- `.gitignore` - Git ignore rules

## Build Output

### `/dist/` - Build Output (Gitignored)

Generated during build process:

- Compiled JavaScript bundles
- Processed HTML files
- Copied assets
- Environment configuration files

**Note:** This directory is not committed to version control.

## Key Conventions

### File Naming

- **Components**: `*.component.ts`
- **Services**: `*.service.ts`
- **Tests**: `*.test.ts`
- **Types**: `*.types.ts` (backend) or `*.ts` (frontend types/)
- **Schemas**: `*.schemas.ts` (backend)
- **Utils**: `*.util.ts` (backend) or `*.ts` (frontend utils/)

### Directory Organization

- **Backend**: Organized by layer (controllers, services, routes, etc.)
- **Frontend**: Organized by feature/domain (components, services, pages)
- **Tests**: Co-located with source code (frontend) or in separate `tests/` directory (backend)

### Import Paths

- Use relative paths for imports within the same directory structure
- Use absolute paths with `@/` alias for frontend (configured in `vite.config.ts`)
- Backend uses relative paths with `.js` extensions (ES modules)

## Development Workflow

1. **Frontend Development**: Work in `/src/`, build outputs to `/dist/`
2. **Backend Development**: Work in `/backend/src/`, build outputs to `/backend/dist/`
3. **Testing**: Run tests from project root
4. **Building**: Use npm scripts defined in `package.json`

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Technical architecture details
- [README.md](../README.md) - Project overview and getting started
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [backend/README.md](../backend/README.md) - Backend-specific documentation


