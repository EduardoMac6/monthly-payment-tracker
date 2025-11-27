/**
 * Generate env-config.js for development
 * This script creates env-config.js in the root directory for development server
 */

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.development');
const outputFile = path.join(__dirname, '..', 'env-config.js');

// Default values
const defaults = {
    VITE_APP_NAME: 'DebtLite (Dev)',
    VITE_STORAGE_TYPE: 'localStorage',
    VITE_API_URL: 'http://localhost:3000/api',
    VITE_MAX_PLANS: '50',
    VITE_MAX_PLAN_AMOUNT: '1000000000',
    VITE_MAX_PLAN_MONTHS: '120',
};

const envVars = { ...defaults };

// Read from process.env first
Object.keys(process.env).forEach((key) => {
    if (key.startsWith('VITE_')) {
        envVars[key] = process.env[key];
    }
});

// Read .env file if it exists
if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf-8');
    envContent.split('\n').forEach((line) => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                if (!envVars[key.trim()]) {
                    envVars[key.trim()] = value;
                }
            }
        }
    });
}

// Generate env-config.js content
const envConfigContent = `// Auto-generated for development
window.__ENV__ = ${JSON.stringify(envVars, null, 2)};
`;

// Write to root directory
fs.writeFileSync(outputFile, envConfigContent);
console.log('✅ Generated env-config.js for development');

