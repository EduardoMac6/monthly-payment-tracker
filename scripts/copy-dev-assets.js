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

// Copy js directory from dist to root (needed for scripts.js imports)
const distJsDir = path.join(distDir, 'js');
const rootJsDir = path.join(rootDir, 'js');

if (fs.existsSync(distJsDir)) {
    // Create js directory in root if it doesn't exist
    if (!fs.existsSync(rootJsDir)) {
        fs.mkdirSync(rootJsDir, { recursive: true });
    }

    // Copy all files from dist/js to root/js
    const jsFiles = fs.readdirSync(distJsDir);
    jsFiles.forEach((file) => {
        const srcPath = path.join(distJsDir, file);
        const destPath = path.join(rootJsDir, file);
        fs.copyFileSync(srcPath, destPath);
    });
    console.log('✅ Copied js/ directory to root');
} else {
    console.warn('⚠️  dist/js/ directory does not exist, skipping...');
}

console.log('✅ Development assets copied successfully!');

