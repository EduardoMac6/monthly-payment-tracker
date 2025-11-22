# DebtLite — Monthly Payment Tracker

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
- **Modular Architecture** — TypeScript source organized into components, services, pages, types, and utilities
- **Type Safety** — Full TypeScript implementation compiled to production-ready JavaScript
- **Form Validation** — Real-time input validation with visual feedback
- **Error Handling** — Robust error handling with user-friendly messages
- **Storage Abstraction** — Interface-based storage layer ready for API migration
- **ES6 Modules** — Modern module system with proper imports/exports

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
│   ├── components/         # UI component modules
│   │   ├── form-validator/ # Form validation component
│   │   ├── payment-table/  # Payment table component
│   │   ├── plan-list/      # Plan list component
│   │   └── toast/          # Toast notification component
│   ├── pages/              # Page-specific logic
│   │   ├── dashboard/      # Dashboard page logic
│   │   └── start/          # Onboarding page logic
│   ├── services/           # Business logic services
│   │   ├── plans/          # Plans service
│   │   ├── payments/       # Payments service
│   │   └── storage/        # Storage abstraction layer
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── scripts.ts          # Dashboard entry point
│   └── start.ts            # Onboarding entry point
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

2. **Build TypeScript**
   ```bash
   npm run build
   ```
   This compiles all TypeScript files from `src/` into the `dist/` directory, maintaining the modular structure.

3. **Run the development server**
   ```bash
   npm run serve
   ```
   This starts a local server at `http://localhost:3000`

4. **Use the application**
   - Navigate to `http://localhost:3000/pages/start.html` to begin onboarding
   - Enter plan name, select debt owner (My Debt/Receivables), total amount, and number of months
   - Click "Continue" to create the plan and load the dashboard
   - The dashboard shows an overview with aggregated statistics of all your payment plans
   - Click on any plan card in the overview or sidebar to view detailed payment tracking
   - Use the dashboard to track payments, create multiple plans, and toggle payment status
   - Toggle dark mode using the theme button in the top right corner

> **Note:** All data is persisted in `localStorage`. The application uses a modular architecture with separate services for plans, payments, and storage operations.

## 🔁 Development workflow

- `npm run build` — Compile TypeScript once
- `npm run watch` — Watch mode: automatically rebuild when any file in `src/` changes
- `npm run dev` — Alias for `watch` mode
- `npm run serve` — Start development server (runs on port 3000)
- `npm start` — Build and start server in one command

The TypeScript compiler maintains the directory structure from `src/` to `dist/`, preserving the modular architecture. All imports use ES6 module syntax with `.js` extensions for browser compatibility.

## 🌐 Quick deploy (GitHub Pages)

1. Run `npm run build`.
2. Ensure `dist/` is up to date and committed.
3. Push the repository to GitHub.
4. Enable GitHub Pages for the main branch with the `/root` folder.

## 🧱 Tech stack

- **TypeScript** — Type-safe development with strict mode enabled
- **ES6 Modules** — Modern module system with import/export
- **HTML5** — Semantic markup
- **Tailwind CSS** — Utility-first CSS framework (via CDN)
- **localStorage** — Client-side data persistence with error handling
- **Inter Font** — Modern typography via Google Fonts

## 🏗️ Architecture

The project follows a modular architecture pattern:

- **Components** — Reusable UI components (FormValidator, PaymentTable, PlanList, Toast)
- **Services** — Business logic layer (PlansService, PaymentsService, StorageService)
- **Pages** — Page-specific logic (DashboardPage, StartPage)
- **Utils** — Utility functions (formatters, validators, error handlers)
- **Types** — TypeScript type definitions
- **Config** — Configuration files (storage type selection)

The storage layer uses an interface pattern (`IStorageService`) that allows easy migration from localStorage to a backend API in the future.

## 🎨 Design features

- Custom color palette with dark mode support
- Gradient backgrounds and modern UI elements
- Responsive navigation with slide-out menu
- Accessible form controls and interactive elements
- Smooth transitions and animations

## 📚 Documentation

Additional documentation and planning materials are available in the [`docs/`](./docs/) directory:

- **[PLAN_MEJORAS.md](./docs/PLAN_MEJORAS.md)** - Comprehensive improvement plan with detailed phases
- **[BACKEND_GUIDE.md](./docs/BACKEND_GUIDE.md)** - Step-by-step guide for implementing backend (beginner-friendly)
- **[RESUMEN_EJECUTIVO.md](./docs/RESUMEN_EJECUTIVO.md)** - Executive summary with priorities and timeline

## 📄 License

MIT