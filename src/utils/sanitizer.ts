/**
 * Data Sanitization Utilities
 *
 * Provides functions to sanitize user inputs and prevent XSS attacks.
 * All user-provided data should be sanitized before being stored or rendered.
 *
 * @module Sanitizer
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 *
 * Uses the browser's built-in textContent to safely escape HTML characters.
 * This prevents malicious scripts from being executed when rendering user data.
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML rendering
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>';
 * const safe = escapeHtml(userInput);
 * // safe = "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
 * element.innerHTML = safe; // Safe to use
 * ```
 */
export function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize user input by removing potentially dangerous characters
 *
 * Removes control characters, limits length to prevent DoS attacks,
 * and trims whitespace. This is the base sanitization function used
 * by other sanitizers.
 *
 * @param input - User input to sanitize
 * @returns Sanitized input (max 1000 characters)
 *
 * @example
 * ```typescript
 * const userInput = '  Hello\x00World  ';
 * const sanitized = sanitizeInput(userInput);
 * // sanitized = "HelloWorld"
 * ```
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove null bytes and control characters (except newlines and tabs)
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Limit length to prevent DoS attacks
    const MAX_INPUT_LENGTH = 1000;
    if (sanitized.length > MAX_INPUT_LENGTH) {
        sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
    }

    return sanitized;
}

/**
 * Sanitize plan name specifically
 *
 * Removes HTML tags, JavaScript protocols, and event handlers from plan names.
 * This is used before saving plan names to prevent XSS attacks.
 *
 * @param planName - Plan name to sanitize
 * @returns Sanitized plan name safe for storage and display
 *
 * @example
 * ```typescript
 * const malicious = '<script>alert("XSS")</script>My Plan';
 * const safe = sanitizePlanName(malicious);
 * // safe = "My Plan"
 * ```
 */
export function sanitizePlanName(planName: string): string {
    let sanitized = sanitizeInput(planName);

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove script tags and event handlers
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized;
}

/**
 * Validate and sanitize data loaded from localStorage
 * @param data - Data to validate
 * @param expectedType - Expected type of data
 * @returns Sanitized data or null if invalid
 */
export function sanitizeStoredData<T>(
    data: unknown,
    expectedType: 'array' | 'object' | 'string' | 'number'
): T | null {
    if (data === null || data === undefined) {
        return null;
    }

    try {
        // Check type
        if (expectedType === 'array' && !Array.isArray(data)) {
            return null;
        }
        if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
            return null;
        }
        if (expectedType === 'string' && typeof data !== 'string') {
            return null;
        }
        if (expectedType === 'number' && typeof data !== 'number') {
            return null;
        }

        // For strings, sanitize
        if (expectedType === 'string' && typeof data === 'string') {
            return sanitizeInput(data) as T;
        }

        // For arrays and objects, recursively sanitize string properties
        if (expectedType === 'array' && Array.isArray(data)) {
            return data.map((item) => {
                if (typeof item === 'string') {
                    return sanitizeInput(item);
                }
                if (typeof item === 'object' && item !== null) {
                    return sanitizeObject(item);
                }
                return item;
            }) as T;
        }

        if (
            expectedType === 'object' &&
            typeof data === 'object' &&
            data !== null &&
            !Array.isArray(data)
        ) {
            return sanitizeObject(data as Record<string, unknown>) as T;
        }

        return data as T;
    } catch (error) {
        console.error('Error sanitizing stored data:', error);
        return null;
    }
}

/**
 * Sanitize object by sanitizing all string properties
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        // Sanitize key
        const sanitizedKey = sanitizeInput(key);

        // Sanitize value
        if (typeof value === 'string') {
            sanitized[sanitizedKey] = sanitizeInput(value);
        } else if (Array.isArray(value)) {
            sanitized[sanitizedKey] = value.map((item) => {
                if (typeof item === 'string') {
                    return sanitizeInput(item);
                }
                if (typeof item === 'object' && item !== null) {
                    return sanitizeObject(item as Record<string, unknown>);
                }
                return item;
            });
        } else if (typeof value === 'object' && value !== null) {
            sanitized[sanitizedKey] = sanitizeObject(value as Record<string, unknown>);
        } else {
            sanitized[sanitizedKey] = value;
        }
    }

    return sanitized;
}

/**
 * Check if data size is within limits
 * @param data - Data to check
 * @param maxSizeKB - Maximum size in KB (default: 5MB = 5120 KB)
 * @returns True if within limits, false otherwise
 */
export function validateDataSize(data: unknown, maxSizeKB: number = 5120): boolean {
    try {
        const jsonString = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInKB = sizeInBytes / 1024;

        return sizeInKB <= maxSizeKB;
    } catch (error) {
        console.error('Error validating data size:', error);
        return false;
    }
}

/**
 * Get data size in KB
 * @param data - Data to measure
 * @returns Size in KB
 */
export function getDataSize(data: unknown): number {
    try {
        const jsonString = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonString]).size;
        return sizeInBytes / 1024;
    } catch (error) {
        console.error('Error getting data size:', error);
        return 0;
    }
}
