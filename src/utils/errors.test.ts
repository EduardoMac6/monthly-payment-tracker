import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppError, ValidationError, StorageError, ErrorHandler } from './errors.js';

// Mock ToastService
const mockToastService = {
    error: vi.fn(),
};

describe('Error Classes', () => {
    describe('AppError', () => {
        it('should create AppError with message and code', () => {
            const error = new AppError('Test error', 'TEST_ERROR');
            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.name).toBe('AppError');
        });

        it('should use message as userMessage when not provided', () => {
            const error = new AppError('Test error', 'TEST_ERROR');
            expect(error.userMessage).toBe('Test error');
        });

        it('should use provided userMessage', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 'User-friendly message');
            expect(error.userMessage).toBe('User-friendly message');
        });

        it('should store original error', () => {
            const originalError = new Error('Original');
            const error = new AppError('Test error', 'TEST_ERROR', undefined, originalError);
            expect(error.originalError).toBe(originalError);
        });
    });

    describe('ValidationError', () => {
        it('should create ValidationError with field', () => {
            const error = new ValidationError('planName', 'Invalid name');
            expect(error.field).toBe('planName');
            expect(error.message).toBe('Invalid name');
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.name).toBe('ValidationError');
        });

        it('should use provided userMessage', () => {
            const error = new ValidationError('planName', 'Invalid name', 'El nombre es inválido');
            expect(error.userMessage).toBe('El nombre es inválido');
        });
    });

    describe('StorageError', () => {
        it('should create StorageError', () => {
            const error = new StorageError('Storage failed');
            expect(error.message).toBe('Storage failed');
            expect(error.code).toBe('STORAGE_ERROR');
            expect(error.name).toBe('StorageError');
        });

        it('should store original error', () => {
            const originalError = new Error('Original storage error');
            const error = new StorageError('Storage failed', 'User message', originalError);
            expect(error.originalError).toBe(originalError);
        });
    });
});

describe('ErrorHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window and ToastService
        (global as any).window = {
            ToastService: mockToastService,
        };
    });

    describe('handle', () => {
        it('should handle AppError and show user message', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 'User message');
            ErrorHandler.handle(error, 'Test context');

            expect(mockToastService.error).toHaveBeenCalledWith('User message');
        });

        it('should handle generic Error with default message', () => {
            const error = new Error('Generic error');
            ErrorHandler.handle(error, 'Test context');

            expect(mockToastService.error).toHaveBeenCalledWith(
                'An unexpected error occurred. Please try again.'
            );
        });

        it('should handle error without context', () => {
            const error = new AppError('Test error', 'TEST_ERROR');
            ErrorHandler.handle(error);

            expect(mockToastService.error).toHaveBeenCalled();
        });
    });

    describe('showUserError', () => {
        it('should use ToastService when available', () => {
            ErrorHandler.showUserError('Test error message');
            expect(mockToastService.error).toHaveBeenCalledWith('Test error message');
        });

        it('should fallback to alert when ToastService not available', () => {
            // Mock window without ToastService but with alert
            const originalWindow = (global as any).window;
            const alertMock = vi.fn();

            // Set up window with alert
            (global as any).window = {
                alert: alertMock,
            };

            ErrorHandler.showUserError('Test error message');

            // Verify alert was called (fallback when ToastService not available)
            expect(alertMock).toHaveBeenCalledWith('Test error message');

            // Restore
            (global as any).window = originalWindow;
        });
    });

    describe('logError', () => {
        it('should log error with context', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Test error');

            ErrorHandler.logError(error, 'TestContext');

            expect(consoleSpy).toHaveBeenCalledWith('[TestContext]', error);

            consoleSpy.mockRestore();
        });

        it('should log original error for AppError', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const originalError = new Error('Original');
            const error = new AppError('Test error', 'TEST_ERROR', undefined, originalError);

            ErrorHandler.logError(error, 'TestContext');

            expect(consoleSpy).toHaveBeenCalledTimes(2);
            expect(consoleSpy).toHaveBeenCalledWith('Original error:', originalError);

            consoleSpy.mockRestore();
        });

        it('should not log original error if not AppError', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Test error');

            ErrorHandler.logError(error, 'TestContext');

            expect(consoleSpy).toHaveBeenCalledTimes(1);

            consoleSpy.mockRestore();
        });
    });
});
