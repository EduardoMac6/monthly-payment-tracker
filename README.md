# DebtLite — Monthly Payment Tracker

[![CI](https://github.com/EduardoMac6/monthly-payment-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/EduardoMac6/monthly-payment-tracker/actions/workflows/ci.yml)

A lightweight web experience that helps users plan and monitor monthly payments from a beautiful landing page through an onboarding screen to a detailed dashboard.

## 🚀 Features

- **Landing Page** (`index.html`) — Modern, gradient-based homepage with sign-in interface
- **Guided Onboarding** (`pages/start.html`) — Capture total amount and repayment timeline with an intuitive form
- **Interactive Dashboard** (`pages/dashboard.html`) — Overview view with aggregated statistics, payment summary, interactive status table, and multiple payment plan management
- **Dashboard Overview** — Financial overview showing total plans, total debt, total paid, and remaining balance with breakdown by categories (My Debts and Receivables)
- **Search & Filter** — Search plans by name and filter by category (My Debts, Receivables, or All Plans)
- **Multiple Payment Plans** — Create and manage multiple payment plans simultaneously
- **Dark Mode Support** — Toggle between light and dark themes with persistent preference
- **Payment Tracking** — Mark payments as completed with visual toggles and status indicators
- **Real-time Statistics** — Overview automatically updates when payment status changes across all plans
- **Loading States** — Visual feedback during asynchronous operations
- **Error Handling** — User-friendly error messages with retry options
- **Empty States** — Helpful messages when no data is available
- **Data Persistence** — Payment progress persists in `localStorage`; onboarding selections stored in `sessionStorage`
- **Responsive Design** — Mobile-first UI built with Tailwind CSS and optimized for accessibility
- **Modular Architecture** — TypeScript source organized into components, services, types, and utilities
- **Type Safety** — Full TypeScript implementation compiled to production-ready JavaScript
- **Security** — Input sanitization and XSS protection
- **Testing** — 145 tests (133 unit + 12 integration) with 96% code coverage
- **Code Quality** — ESLint, Prettier, and pre-commit hooks
- **Optimized Builds** — Vite with code splitting, minification, and tree-shaking

## 📂 Project structure

```
monthly-payment-tracker/
├── assets/                  # Static assets
│   ├── css/                # Custom stylesheets
│   │   ├── shared.css      # Shared styles
│   │   └── start.css       # Onboarding page styles
│   ├── js/                 # JavaScript utilities
│   │   └── menu.js         # Navigation menu logic
│   ├── images/             # Logo and brand assets
│   └── favicon.ico         # Favicon
├── backend/                # Backend API (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── constants/      # Application constants
│   │   ├── controllers/    # Request handlers
│   │   ├── errors/         # Error classes
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Validation schemas (Zod)
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   └── server.ts       # Entry point
│   ├── prisma/             # Database schema and migrations
│   └── tests/              # Backend tests
│       ├── integration/    # Integration tests
│       └── unit/           # Unit tests
├── docs/                   # Documentation and planning
│   ├── adr/                # Architecture Decision Records
│   ├── archive/            # Archived documentation
│   └── *.md                # Various guides and plans
├── pages/                  # HTML pages
│   ├── start.html          # Onboarding step
│   └── dashboard.html      # Main payment dashboard
├── scripts/                # Build and development scripts
│   ├── copy-dev-assets.js  # Copy dev assets
│   ├── copy-static.js      # Copy static files
│   ├── dev-server.js       # Development HTTP server
│   ├── generate-env-dev.js # Generate dev env config
│   └── inject-env.js       # Inject environment variables
├── src/                    # TypeScript source (frontend)
│   ├── components/         # UI component modules
│   ├── config/             # Configuration
│   ├── pages/              # Page modules
│   ├── services/           # Service modules
│   ├── types/              # Type definitions
│   ├── utils/              # Utility modules
│   └── __tests__/          # Integration tests
├── tools/                  # Development tools
│   ├── test-env.html       # Environment variables tester
│   └── README.md           # Tools documentation
├── dist/                   # Build output (gitignored)
├── index.html              # Landing page
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest configuration
├── eslint.config.js        # ESLint configuration
├── vercel.json             # Vercel deployment configuration
└── README.md
```

## 🛠️ Getting started

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd monthly-payment-tracker
   npm install
   ```

2. **Build the project**
   ```bash
   # Development build (with environment variables)
   npm run build:dev
   
   # Production build (optimized)
   npm run build:prod
   ```
   This compiles TypeScript and generates optimized bundles with Vite.

3. **Run the application**
   ```bash
   # Development server (with HMR)
   npm run dev
   
   # Or use the simple HTTP server
   npm run serve
   ```
   - Open `http://localhost:3000/index.html` to see the landing page
   - Click "Build my plan" or navigate to `pages/start.html` to begin onboarding
   - Enter the total amount and number of months for your payment plan
   - Click "Continue" to load the dashboard with your plan
   - The dashboard shows an overview with aggregated statistics of all your payment plans
   - Click on any plan card in the overview or sidebar to view detailed payment tracking
   - Use the dashboard to track payments, create multiple plans, and toggle payment status

> **Note:** Payment configuration happens entirely in the UI. All user selections from `pages/start.html` are passed via `sessionStorage`, and payment progress is saved in `localStorage`.

## 🔁 Development workflow

> **💡 Tip:** Before pushing changes, run `npm run verify:quick` to ensure everything works correctly. See [PRE_COMMIT_CHECKLIST.md](./docs/PRE_COMMIT_CHECKLIST.md) for details.

### Build Commands
- `npm run build` — Legacy TypeScript build
- `npm run build:dev` — Development build with Vite (includes env vars and copies dev assets)
- `npm run build:prod` — Production build optimized with Vite
- `npm run watch` — Watch mode: automatically rebuild when files change
- `npm run dev` — Development server: builds and copies assets, then starts Vite with HMR
- `npm run preview` — Preview production build locally

### Testing
- `npm run test` — Run tests in watch mode
- `npm run test:run` — Run all tests once
- `npm run test:ui` — Open Vitest UI in browser
- `npm run test:coverage` — Generate coverage report

### Code Quality
- `npm run lint` — Check code for linting errors
- `npm run lint:fix` — Automatically fix linting errors
- `npm run format` — Format code with Prettier
- `npm run format:check` — Check code formatting
- `npm run verify` — Run complete verification (tests, types, format, lint)
- `npm run verify:quick` — Run quick verification (tests and types only)

### Documentation
- `npm run docs` — Generate API documentation with TypeDoc
- `npm run docs:build` — Generate docs and show confirmation

The project uses Vite for optimized builds, maintaining the modular structure from `src/` to `dist/`.

## 🌐 Deployment

### Vercel (Recomendado)

El proyecto está configurado para desplegar automáticamente a Vercel mediante GitHub Actions:

1. Configura los secrets en GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
2. Haz push a `main` - el workflow desplegará automáticamente
3. Tu app estará disponible en `https://tu-proyecto.vercel.app`

**Ver guía completa:** [DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md)

### GitHub Pages (Alternativa)

1. Run `npm run build:prod`
2. Ensure `dist/` is up to date and committed
3. Push the repository to GitHub
4. Enable GitHub Pages for the main branch with the `/dist` folder

**Nota:** El workflow de CD usa GitHub Pages como fallback si Vercel no está configurado.

## 🧱 Tech stack

### Core Technologies
- **TypeScript** — Type-safe development with strict mode enabled
- **HTML5** — Semantic markup
- **Tailwind CSS** — Utility-first CSS framework (via CDN)
- **localStorage / sessionStorage** — Client-side data persistence
- **Inter Font** — Modern typography via Google Fonts

### Build & Development Tools
- **Vite** — Fast build tool with HMR and optimized production builds
- **Vitest** — Fast unit test framework with 96% code coverage
- **ESLint** — Code linting with TypeScript support
- **Prettier** — Code formatting for consistency
- **Husky** — Git hooks for pre-commit validation
- **TypeDoc** — API documentation generation

### Testing & Quality
- **@testing-library/dom** — DOM testing utilities
- **@testing-library/user-event** — User interaction simulation
- **happy-dom** — Fast DOM implementation for testing
- **@vitest/coverage-v8** — Code coverage reporting

## 🎨 Design features

- Custom color palette with dark mode support
- Gradient backgrounds and modern UI elements
- Responsive navigation with slide-out menu
- Accessible form controls and interactive elements
- Smooth transitions and animations

## 📚 Documentation

### API Documentation
- **[API Documentation](./docs/api/)** - Auto-generated API documentation (TypeDoc)
  - Run `npm run docs` to regenerate
  - Open `docs/api/index.html` in your browser

### Project Documentation
Additional documentation and planning materials are available in the [`docs/`](./docs/) directory:

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guide for contributing to the project
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design decisions
- **[PLAN_MEJORAS.md](./docs/PLAN_MEJORAS.md)** - Comprehensive improvement plan with detailed phases
- **[RESUMEN_EJECUTIVO.md](./docs/RESUMEN_EJECUTIVO.md)** - Executive summary with priorities and timeline
- **[PLAN_REFACTORIZACION.md](./docs/archive/PLAN_REFACTORIZACION.md)** - Historical refactoring plan (completed, archived for reference)
- **[TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - Complete guide to running and understanding tests
- **[ENV_VARIABLES.md](./docs/ENV_VARIABLES.md)** - Environment variables configuration guide
- **[VERIFICACION_COMPLETA.md](./docs/VERIFICACION_COMPLETA.md)** - Complete verification guide (how to test and verify all features)
- **[PRE_COMMIT_CHECKLIST.md](./docs/PRE_COMMIT_CHECKLIST.md)** - Pre-commit checklist (what to verify before pushing changes)
- **[CI_CD_GUIDE.md](./docs/CI_CD_GUIDE.md)** - Complete guide to CI/CD configuration and usage
- **[DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md)** - Step-by-step guide for deploying to Vercel
- **[ADR (Architecture Decision Records)](./docs/adr/)** - Technical decision documentation

### Code Quality
- **133 unit tests** with 96% code coverage
- **ESLint** configured with TypeScript rules
- **Prettier** for consistent code formatting
- **Pre-commit hooks** with Husky and lint-staged
- **CI/CD** with GitHub Actions (automated testing, linting, and deployment)

## 📄 License

MIT