/**
 * Environment Configuration
 * Reads environment variables from window.__ENV__ or uses defaults
 *
 * For development: Variables can be injected via a script tag in HTML
 * For production: Variables should be set at build time or via window.__ENV__
 */

/**
 * Environment variables interface
 */
export interface EnvConfig {
    VITE_APP_NAME: string;
    VITE_STORAGE_TYPE: 'localStorage' | 'api';
    VITE_API_URL: string;
    VITE_MAX_PLANS: number;
    VITE_MAX_PLAN_AMOUNT: number;
    VITE_MAX_PLAN_MONTHS: number;
}

/**
 * Default configuration values
 * These are used when environment variables are not available
 */
const DEFAULT_CONFIG: EnvConfig = {
    VITE_APP_NAME: 'DebtLite',
    VITE_STORAGE_TYPE: 'localStorage',
    VITE_API_URL: 'http://localhost:3000/api',
    VITE_MAX_PLANS: 50,
    VITE_MAX_PLAN_AMOUNT: 1000000000,
    VITE_MAX_PLAN_MONTHS: 120,
};

/**
 * Get environment variable from window.__ENV__ or use default
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @returns Environment variable value or default
 */
function getEnvVar<T>(key: keyof EnvConfig, defaultValue: T): T {
    // Try to get from window.__ENV__ (injected at runtime)
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
        const envValue = (window as any).__ENV__[key];
        if (envValue !== undefined && envValue !== null) {
            // Convert string values to appropriate types
            if (typeof defaultValue === 'number') {
                const numValue = Number(envValue);
                if (!isNaN(numValue)) {
                    return numValue as T;
                }
            } else if (typeof defaultValue === 'boolean') {
                return (envValue === 'true' || envValue === true) as T;
            }
            return envValue as T;
        }
    }

    // Try to get from import.meta.env (if using Vite in the future)
    // Note: This requires a bundler that supports import.meta
    try {
        const metaEnv = (globalThis as any).import?.meta?.env;
        if (metaEnv) {
            const envValue = metaEnv[key];
            if (envValue !== undefined && envValue !== null) {
                if (typeof defaultValue === 'number') {
                    const numValue = Number(envValue);
                    if (!isNaN(numValue)) {
                        return numValue as T;
                    }
                }
                return envValue as T;
            }
        }
    } catch {
        // import.meta not available, continue with defaults
    }

    return defaultValue;
}

/**
 * Environment configuration object
 * Provides access to all environment variables with type safety
 */
export const env: EnvConfig = {
    VITE_APP_NAME: getEnvVar('VITE_APP_NAME', DEFAULT_CONFIG.VITE_APP_NAME),
    VITE_STORAGE_TYPE: getEnvVar('VITE_STORAGE_TYPE', DEFAULT_CONFIG.VITE_STORAGE_TYPE),
    VITE_API_URL: getEnvVar('VITE_API_URL', DEFAULT_CONFIG.VITE_API_URL),
    VITE_MAX_PLANS: getEnvVar('VITE_MAX_PLANS', DEFAULT_CONFIG.VITE_MAX_PLANS),
    VITE_MAX_PLAN_AMOUNT: getEnvVar('VITE_MAX_PLAN_AMOUNT', DEFAULT_CONFIG.VITE_MAX_PLAN_AMOUNT),
    VITE_MAX_PLAN_MONTHS: getEnvVar('VITE_MAX_PLAN_MONTHS', DEFAULT_CONFIG.VITE_MAX_PLAN_MONTHS),
};

/**
 * Get app name
 */
export function getAppName(): string {
    return env.VITE_APP_NAME;
}

/**
 * Get storage type from environment
 */
export function getEnvStorageType(): 'localStorage' | 'api' {
    return env.VITE_STORAGE_TYPE;
}

/**
 * Get API URL
 */
export function getApiUrl(): string {
    return env.VITE_API_URL;
}

/**
 * Get maximum number of plans
 */
export function getMaxPlans(): number {
    return env.VITE_MAX_PLANS;
}

/**
 * Get maximum plan amount
 */
export function getMaxPlanAmount(): number {
    return env.VITE_MAX_PLAN_AMOUNT;
}

/**
 * Get maximum plan months
 */
export function getMaxPlanMonths(): number {
    return env.VITE_MAX_PLAN_MONTHS;
}
