# Development Tools

This directory contains development and testing tools for the project.

## Tools

### `test-env.html`

A simple HTML page for testing environment variables configuration.

**Usage:**
1. Build the project: `npm run build:dev` or `npm run build:prod`
2. Start the development server: `npm run serve`
3. Open `http://localhost:3000/tools/test-env.html` in your browser

**Purpose:**
- Verifies that environment variables are correctly loaded
- Displays all environment variables for debugging
- Shows test results for expected vs actual values

**Note:** This file loads `dist/env-config.js`, so make sure to build the project first.


