# Monthly Payment Tracker

A simple web app to track monthly payments, built with TypeScript.

## 🚀 Features

- Track monthly payments across 12 months
- Automatic totals and remaining balance
- Saves state in localStorage
- Responsive, modern UI
- Written in TypeScript

## 📋 Prerequisites

- Node.js (v14+)
- npm (bundled with Node.js)

## 🛠️ Setup

1) Clone the repository:
```bash
git clone <repo-url>
cd monthly-payment-tracker
```

2) Install dependencies:
```bash
npm install
```

## 🏗️ Development

### Build TypeScript
Compile TypeScript to JavaScript:
```bash
npm run build
```
This generates `dist/scripts.js`, which is referenced by `index.html`.

### Watch mode
Rebuild automatically on file changes:
```bash
npm run watch
```

## 📦 Project Structure

```
monthly-payment-tracker/
├── src/
│   └── scripts.ts          # TypeScript source
├── dist/
│   └── scripts.js          # Compiled JavaScript
├── index.html              # Main page
├── package.json            # Scripts and dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

## 🌐 Deploy

### GitHub Pages (simple option)
1) Make sure the project is built:
```bash
npm run build
```
2) Commit and push everything to GitHub (including the `dist/` folder).
3) In your GitHub repo: go to **Settings** → **Pages**.
4) Select the `main` branch and folder `/root`.
5) Save. Your site will be available at:
```
https://<your-username>.github.io/monthly-payment-tracker/
```

### Important Notes
- Always run `npm run build` before committing so `dist/scripts.js` is up to date.
- The `dist/` folder should be included in the repository for GitHub Pages (no CI) to work.

## 🔧 Available Scripts
- `npm run build` — Compile TypeScript to JavaScript
- `npm run watch` — Compile and watch for changes

## 📝 Configuration
You can adjust payment values in `src/scripts.ts`:
```typescript
const totalCost = 6390.00;        // Total cost
const monthlyPayment = 533.00;    // Monthly payment
const numberOfMonths = 12;        // Number of months
```

## 🛡️ Tech Stack
- TypeScript
- HTML5
- Tailwind CSS (via CDN)
- localStorage

## 📄 License
MIT

