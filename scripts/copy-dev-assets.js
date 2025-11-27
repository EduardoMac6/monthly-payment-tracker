/**
 * Copy development assets to root for dev server
 * This ensures scripts.js, start.js, and env-config.js are available during development
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const rootDir = path.join(__dirname, '..');

// Files to copy from dist to root for development
const filesToCopy = [
    'scripts.js',
    'start.js',
    'env-config.js',
];

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    console.warn('⚠️  dist/ directory does not exist. Run build first.');
    process.exit(1);
}

// Copy files
filesToCopy.forEach((file) => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(rootDir, file);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file} to root`);
    } else {
        console.warn(`⚠️  ${file} not found in dist/, skipping...`);
    }
});

console.log('✅ Development assets copied successfully!');

