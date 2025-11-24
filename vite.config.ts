import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import type { Plugin } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { injectEnvPlugin } from './vite-plugin-inject-env';

// Plugin to copy static assets
function copyAssetsPlugin(): Plugin {
    return {
        name: 'copy-assets',
        writeBundle() {
            const assetsDir = resolve(__dirname, 'assets');
            const distAssetsDir = resolve(__dirname, 'dist', 'assets');
            
            // Copy assets directory structure (avoid double assets/)
            if (existsSync(assetsDir)) {
                // Remove existing assets if any to avoid duplication
                if (existsSync(distAssetsDir)) {
                    execSync(`rm -rf ${distAssetsDir}`, { stdio: 'inherit' });
                }
                execSync(`cp -r ${assetsDir} ${distAssetsDir}`, { stdio: 'inherit' });
            }
            
            // Copy favicon
            const favicon = resolve(__dirname, 'fav.ico');
            if (existsSync(favicon)) {
                copyFileSync(favicon, resolve(__dirname, 'dist', 'fav.ico'));
            }
        },
    };
}

/**
 * Vite Configuration
 * Optimized build configuration for production
 */
export default defineConfig({
    // Base public path
    base: './',

    // Build configuration
    build: {
        // Output directory
        outDir: 'dist',
        
        // Source maps for production debugging
        sourcemap: true,
        
        // Minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false, // Keep console for debugging
                drop_debugger: true,
            },
            format: {
                comments: false, // Remove comments
            },
        },
        
        // Copy public assets
        copyPublicDir: true,
        
        // Code splitting
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                start: resolve(__dirname, 'pages/start.html'),
                dashboard: resolve(__dirname, 'pages/dashboard.html'),
                // Explicitly include scripts.ts to ensure it's built as scripts.js
                scripts: resolve(__dirname, 'src/scripts.ts'),
            },
            output: {
                // Manual chunks for better code splitting
                manualChunks: (id) => {
                    // Vendor chunks
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                    
                    // Service chunks
                    if (id.includes('/services/')) {
                        return 'services';
                    }
                    
                    // Component chunks
                    if (id.includes('/components/')) {
                        return 'components';
                    }
                    
                    // Page chunks
                    if (id.includes('/pages/')) {
                        return 'pages';
                    }
                },
                // Naming pattern for output files
                // Using fixed names for compatibility with existing HTML
                entryFileNames: (chunkInfo) => {
                    // Rename main.js to scripts.js for compatibility (if index.html needs it)
                    if (chunkInfo.name === 'main') {
                        return 'main.js'; // Keep main.js for index.html if needed
                    }
                    // Ensure scripts entry is always named scripts.js
                    if (chunkInfo.name === 'scripts') {
                        return 'scripts.js';
                    }
                    return '[name].js';
                },
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        
        // Chunk size warnings
        chunkSizeWarningLimit: 1000,
        
        // Target modern browsers
        target: 'es2020',
        
        // CSS code splitting
        cssCodeSplit: true,
        
        // Report compressed size
        reportCompressedSize: true,
    },

    // Plugins
    plugins: [
        // Legacy browser support (optional, for older browsers)
        // legacy({
        //     targets: ['defaults', 'not IE 11'],
        // }),
        
        // Copy static assets
        copyAssetsPlugin(),
        
        // Inject CSS into JS (for better code splitting)
        cssInjectedByJsPlugin(),
        
        // Inject environment variables
        injectEnvPlugin(
            (process.env.NODE_ENV as 'development' | 'production') || 'development'
        ),
    ],

    // Resolve configuration
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
        extensions: ['.ts', '.js', '.json'],
    },

    // Server configuration (for development)
    server: {
        port: 3000,
        open: true,
    },

    // Preview configuration (for testing production build)
    preview: {
        port: 3000,
        open: true,
    },
});

