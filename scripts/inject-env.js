/**
 * Script to inject environment variables into HTML
 * Reads from .env.development or .env.production and creates a script tag
 * that sets window.__ENV__ with the variables
 * 
 * Usage:
 *   node scripts/inject-env.js development
 *   node scripts/inject-env.js production
 */

const fs = require('fs');
const path = require('path');

const env = process.argv[2] || 'development';
const envFile = path.join(__dirname, '..', `.env.${env}`);

if (!fs.existsSync(envFile)) {
    console.warn(`⚠️  Environment file ${envFile} not found. Using defaults.`);
    process.exit(0);
}

// Read .env file
const envContent = fs.readFileSync(envFile, 'utf-8');
const envVars = {};

// Parse .env file (simple parser, doesn't handle quotes or complex values)
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            envVars[key.trim()] = value;
        }
    }
});

// Generate JavaScript code to inject
const jsCode = `window.__ENV__ = ${JSON.stringify(envVars, null, 2)};`;

// Write to a file that can be included in HTML
const outputFile = path.join(__dirname, '..', 'dist', 'env-config.js');
const distDir = path.dirname(outputFile);

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(outputFile, jsCode, 'utf-8');
console.log(`✅ Environment variables injected to ${outputFile}`);
console.log(`   Environment: ${env}`);
console.log(`   Variables: ${Object.keys(envVars).join(', ')}`);

