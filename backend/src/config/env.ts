/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGIN: string;
}

/**
 * Get environment variable or throw error if missing
 */
function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

/**
 * Get environment variable as number
 */
function getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) {
        return defaultValue;
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) {
        return defaultValue;
    }
    return num;
}

/**
 * Environment configuration
 */
export const env: EnvConfig = {
    PORT: getEnvNumber('PORT', 3000),
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    JWT_SECRET: getEnvVar('JWT_SECRET', 'change-me-in-production'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
    CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
};

/**
 * Validate environment configuration
 */
export function validateEnv(): void {
    if (!env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required');
    }
    if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'change-me-in-production') {
        throw new Error('JWT_SECRET must be changed in production');
    }
}

