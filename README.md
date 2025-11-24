# DebtLite — Monthly Payment Tracker

[![CI](https://github.com/EduardoMac6/monthly-payment-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/EduardoMac6/monthly-payment-tracker/actions/workflows/ci.yml)

A lightweight web experience that helps users plan and monitor monthly payments from a beautiful landing page through an onboarding screen to a detailed dashboard.

## 🚀 Features

- **Landing Page** (`index.html`) — Modern, gradient-based homepage with sign-in interface
- **Guided Onboarding** (`pages/start.html`) — Capture total amount and repayment timeline with an intuitive form
- **Interactive Dashboard** (`pages/dashboard.html`) — Overview view with aggregated statistics, payment summary, interactive status table, and multiple payment plan management
- **Dashboard Overview** — Financial overview showing total plans, total debt, total paid, and remaining balance with breakdown by categories (My Debts and Receivables)
- **Multiple Payment Plans** — Create and manage multiple payment plans simultaneously
- **Dark Mode Support** — Toggle between light and dark themes with persistent preference
- **Payment Tracking** — Mark payments as completed with visual toggles and status indicators
- **Real-time Statistics** — Overview automatically updates when payment status changes across all plans
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
├── assets/
│   ├── css/                # Custom stylesheets
│   │   ├── shared.css      # Shared styles
│   │   └── start.css       # Onboarding page styles
│   ├── js/                 # JavaScript utilities
│   │   └── menu.js         # Navigation menu logic
│   └── images/             # Logo and brand assets
├── dist/                   # Compiled JavaScript output
│   ├── components/         # UI components
│   │   ├── payment-table.js
│   │   └── plan-list.js
│   ├── pages/              # Page-specific logic
│   │   └── dashboard.js
│   ├── services/           # Business logic
│   │   ├── plans.js
│   │   └── storage.js
│   ├── types/              # Type definitions
│   │   └── plan.js
│   ├── utils/              # Utility functions
│   │   └── formatters.js
│   └── scripts.js          # Main compiled bundle
├── pages/
│   ├── start.html          # Onboarding step
│   └── dashboard.html      # Main payment dashboard
├── src/                    # TypeScript source
│   ├── components/         # Component modules
│   ├── pages/              # Page modules
│   ├── services/           # Service modules
│   ├── types/              # Type definitions
│   ├── utils/              # Utility modules
│   └── scripts.ts          # Main TypeScript entry
├── docs/                   # Documentation and planning
│   ├── PLAN_MEJORAS.md     # Detailed improvement plan
│   ├── BACKEND_GUIDE.md    # Backend implementation guide
│   └── RESUMEN_EJECUTIVO.md # Executive summary
├── index.html              # Landing page
├── fav.ico                 # Favicon
├── package.json
├── tsconfig.json
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

### Build Commands
- `npm run build` — Legacy TypeScript build
- `npm run build:dev` — Development build with Vite (includes env vars)
- `npm run build:prod` — Production build optimized with Vite
- `npm run watch` — Watch mode: automatically rebuild when files change
- `npm run dev` — Vite dev server with Hot Module Replacement (HMR)

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

### Documentation
- `npm run docs` — Generate API documentation with TypeDoc
- `npm run docs:build` — Generate docs and show confirmation

The project uses Vite for optimized builds, maintaining the modular structure from `src/` to `dist/`.

## 🌐 Quick deploy (GitHub Pages)

1. Run `npm run build`.
2. Ensure `dist/` is up to date and committed.
3. Push the repository to GitHub.
4. Enable GitHub Pages for the main branch with the `/root` folder.

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