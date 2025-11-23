/**
 * Base application error class
 */
export class AppError extends Error {
    code: string;
    userMessage: string;
    originalError?: Error;

    constructor(message: string, code: string, userMessage?: string, originalError?: Error) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.userMessage = userMessage || message;
        this.originalError = originalError;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        // TypeScript doesn't recognize captureStackTrace, but it exists in V8 engines
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, AppError);
        }
    }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
    field: string;

    constructor(field: string, message: string, userMessage?: string) {
        super(message, 'VALIDATION_ERROR', userMessage);
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Storage error class
 */
export class StorageError extends AppError {
    constructor(message: string, userMessage?: string, originalError?: Error) {
        super(message, 'STORAGE_ERROR', userMessage, originalError);
        this.name = 'StorageError';
    }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
    /**
     * Handle an error and show appropriate message to user
     * @param error - The error to handle
     * @param context - Context where error occurred
     */
    static handle(error: Error, context?: string): void {
        // Log error for debugging
        console.error(`[ErrorHandler] ${context || 'Unknown context'}:`, error);

        // Show user-friendly message
        if (error instanceof AppError) {
            ErrorHandler.showUserError(error.userMessage);
        } else {
            ErrorHandler.showUserError('An unexpected error occurred. Please try again.');
        }
    }

    /**
     * Show error message to user
     * @param message - Error message to display
     */
    static showUserError(message: string): void {
        // Use toast notification if available, otherwise fallback to alert
        if (typeof window !== 'undefined' && (window as any).ToastService) {
            (window as any).ToastService.error(message);
        } else if (typeof window !== 'undefined' && window.alert) {
            // Fallback to alert if ToastService is not loaded
            window.alert(message);
        }
        // If neither is available (testing environment), do nothing
    }

    /**
     * Log error for debugging
     * @param error - The error to log
     * @param context - Context where error occurred
     */
    static logError(error: Error, context: string): void {
        console.error(`[${context}]`, error);

        // In production, this could send to an error tracking service
        if (error instanceof AppError && error.originalError) {
            console.error('Original error:', error.originalError);
        }
    }
}
