import { describe, it, expect } from 'vitest';
import {
    escapeHtml,
    sanitizeInput,
    sanitizePlanName,
    sanitizeStoredData,
    validateDataSize,
    getDataSize,
} from './sanitizer.js';

describe('Sanitizer', () => {
    describe('escapeHtml', () => {
        it('should escape HTML special characters', () => {
            // textContent escapes HTML tags and ampersands
            const result1 = escapeHtml('<script>alert("XSS")</script>');
            expect(result1).toContain('&lt;script&gt;');
            expect(result1).toContain('&lt;/script&gt;');
            expect(result1).not.toContain('<script>');

            expect(escapeHtml('Hello & World')).toBe('Hello &amp; World');

            // Single quotes are safe in HTML when using textContent
            const result3 = escapeHtml("It's a test");
            expect(result3).toContain('test');
        });

        it('should handle empty string', () => {
            expect(escapeHtml('')).toBe('');
        });

        it('should handle normal text', () => {
            expect(escapeHtml('Hello World')).toBe('Hello World');
        });
    });

    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  Hello  ')).toBe('Hello');
        });

        it('should remove control characters', () => {
            expect(sanitizeInput('Hello\x00World')).toBe('HelloWorld');
        });

        it('should limit length to 1000 characters', () => {
            const longString = 'a'.repeat(2000);
            const result = sanitizeInput(longString);
            expect(result.length).toBe(1000);
        });

        it('should handle empty string', () => {
            expect(sanitizeInput('')).toBe('');
        });

        it('should handle non-string input', () => {
            expect(sanitizeInput(null as unknown as string)).toBe('');
            expect(sanitizeInput(123 as unknown as string)).toBe('');
        });
    });

    describe('sanitizePlanName', () => {
        it('should remove HTML tags', () => {
            expect(sanitizePlanName('<b>Plan</b>')).toBe('Plan');
            expect(sanitizePlanName('<script>alert("XSS")</script>')).toBe('alert("XSS")');
        });

        it('should remove javascript: protocol', () => {
            expect(sanitizePlanName('javascript:alert("XSS")')).toBe('alert("XSS")');
        });

        it('should remove event handlers', () => {
            // The regex removes "onclick=" but keeps the rest
            const result = sanitizePlanName('onclick="alert(1)"');
            expect(result).not.toContain('onclick');
            expect(result).toContain('alert(1)');
        });

        it('should sanitize normal plan names', () => {
            expect(sanitizePlanName('My Payment Plan')).toBe('My Payment Plan');
        });
    });

    describe('sanitizeStoredData', () => {
        it('should sanitize string data', () => {
            const result = sanitizeStoredData<string>('  Hello  ', 'string');
            expect(result).toBe('Hello');
        });

        it('should validate array type', () => {
            const result = sanitizeStoredData<number[]>([1, 2, 3], 'array');
            expect(result).toEqual([1, 2, 3]);
        });

        it('should return null for invalid type', () => {
            const result = sanitizeStoredData<string>(123, 'string');
            expect(result).toBeNull();
        });

        it('should sanitize string properties in objects', () => {
            const data = { name: '  Test  ', value: 123 };
            const result = sanitizeStoredData<{ name: string; value: number }>(data, 'object');
            expect(result?.name).toBe('Test');
            expect(result?.value).toBe(123);
        });
    });

    describe('validateDataSize', () => {
        it('should return true for small data', () => {
            const data = { name: 'Test', value: 123 };
            expect(validateDataSize(data, 100)).toBe(true);
        });

        it('should return false for data exceeding limit', () => {
            const largeData = { data: 'x'.repeat(100000) };
            expect(validateDataSize(largeData, 1)).toBe(false);
        });

        it('should use default max size of 5MB', () => {
            const normalData = { name: 'Test' };
            expect(validateDataSize(normalData)).toBe(true);
        });
    });

    describe('getDataSize', () => {
        it('should return size in KB', () => {
            const data = { name: 'Test' };
            const size = getDataSize(data);
            expect(size).toBeGreaterThan(0);
            expect(typeof size).toBe('number');
        });

        it('should return 0 for invalid data', () => {
            // Circular reference should return 0 (caught by try/catch)
            const circular: Record<string, unknown> = { name: 'Test' };
            circular.self = circular;
            const size = getDataSize(circular);
            // The function catches the error and returns 0
            expect(size).toBe(0);
        });
    });
});
