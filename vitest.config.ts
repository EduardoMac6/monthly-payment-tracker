import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration
 * Test runner configuration for the project
 */
export default defineConfig({
    test: {
        // Test environment (happy-dom is faster and more compatible than jsdom)
        environment: 'happy-dom',
        
        // Glob patterns for test files
        include: ['src/**/*.{test,spec}.{js,ts}'],
        exclude: ['node_modules', 'dist', '.idea', '.vscode'],
        
        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/index.ts',
                '**/*.config.ts',
                '**/types/**',
            ],
            // Minimum coverage thresholds (reduced to 50% temporarily)
            thresholds: {
                lines: 50,
                functions: 50,
                branches: 50,
                statements: 50,
            },
        },
        
        // Global test setup
        globals: true,
        
        // Test timeout (5 seconds)
        testTimeout: 5000,
        
        // Setup files to run before tests
        setupFiles: [],
        
        // Reporter configuration
        reporters: ['verbose'],
        
        // Watch mode configuration
        watch: false,
    },
    
    // Resolve configuration (same as tsconfig)
    resolve: {
        extensions: ['.ts', '.js'],
    },
});

