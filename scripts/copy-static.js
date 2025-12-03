/**
 * Script to copy static files to dist directory after build
 * This ensures HTML files and assets are available in the production build
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Files and directories to copy
const filesToCopy = [
    { src: 'index.html', dest: 'index.html' },
    { src: 'pages', dest: 'pages' },
    { src: 'assets', dest: 'assets' },
];

/**
 * Copy a file or directory recursively
 */
function copyRecursive(src, dest) {
    const srcPath = path.join(__dirname, '..', src);
    const destPath = path.join(distDir, dest);

    if (!fs.existsSync(srcPath)) {
        console.warn(`Warning: ${src} does not exist, skipping...`);
        return;
    }

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
        // Create destination directory
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        // Copy all files in directory
        const files = fs.readdirSync(srcPath);
        files.forEach((file) => {
            copyRecursive(
                path.join(src, file),
                path.join(dest, file)
            );
        });
    } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${src} → ${dest}`);
    }
}

// Copy all files
console.log('Copying static files to dist...');
filesToCopy.forEach(({ src, dest }) => {
    copyRecursive(src, dest);
});

console.log('✅ Static files copied successfully!');

