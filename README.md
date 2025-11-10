# DebtLite — Monthly Payment Tracker

A lightweight web experience that helps users plan and monitor monthly payments from an onboarding screen through a detailed dashboard.

## 🚀 Features

- Guided onboarding in `pages/start.html` to capture the total amount and repayment timeline.
- Dashboard in `pages/dashboard.html` with a payment summary and interactive status table.
- Payment progress persists in `localStorage`; onboarding selections are stored in `sessionStorage`.
- Responsive UI built with Tailwind CSS and optimized for accessibility.
- TypeScript source compiled to production-ready JavaScript.

## 📂 Project structure

```
monthly-payment-tracker/
├── assets/                 # Static assets (logos, icons)
│   └── images/
├── dist/                   # Compiled JavaScript
│   └── scripts.js
├── pages/
│   ├── start.html          # Onboarding step
│   └── dashboard.html      # Main payment dashboard
├── src/
│   └── scripts.ts          # TypeScript logic
├── index.html              # Redirect into `pages/start.html`
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
   The compiled bundle is saved to `dist/scripts.js` for the dashboard.

3. **Run the product flow**
   - Open `index.html` in a browser to access the onboarding screen.
   - Enter the amount you want to manage and choose the number of months.
   - Click `Continue` to load the dashboard with your selections applied.

> Note: Payment configuration now happens in the UI. Editing `src/scripts.ts` is no longer necessary for setting amounts; selections from `pages/start.html` are passed via `sessionStorage`.

## 🔁 Development workflow

- `npm run build` — Compile once.
- `npm run watch` — Rebuild automatically when `src/scripts.ts` changes.

## 🌐 Quick deploy (GitHub Pages)

1. Run `npm run build`.
2. Ensure `dist/` is up to date and committed.
3. Push the repository to GitHub.
4. Enable GitHub Pages for the main branch with the `/root` folder.

## 🧱 Tech stack

- TypeScript
- HTML5 + Tailwind CSS (via CDN)
- localStorage / sessionStorage

## 📄 License

MIT